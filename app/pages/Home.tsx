"use client"
import { MouseEvent, useEffect, useRef, useState } from "react";
import ListInputField from "../components/ListInputField";
import ListCard from "../components/ListCard";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { supabase } from "../supabase-client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import Input from "../components/Input";
import Button from "../components/Button";
import styled from "styled-components"

export interface List {
  id: number,
  created_at: string,
  name: string,
  cards: Card[],
  index: number;
}

export interface Card {
  id: number,
  name: string,
  list_id: number,
  index: number;
  is_done: boolean;
}

const Home = ({ session }: { session: Session }) => {
  const [listName, setListName] = useState("");
  const [lists, setLists] = useState<List[]>([]);
  const [listId, setListId] = useState(0);
  const [cardTitle, setCardTitle] = useState("");
  const [globalCardTitle, setGlobalCardTitle] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false);

  const [dropIndex, setDropIndex] = useState<number | null>(null);  // const [cardId, setCardId] = useState(0);

  const modelRef = useRef(null);
  const globalCardInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("lists-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lists" },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const fetchData = async () => {
    const { data, error } = await supabase
      .from('lists')
      .select('*, cards(*)')
      .order("index", { ascending: true })
      .order("index", { referencedTable: "cards", ascending: true })

    if (error) {
      console.error(error);
      return;
    }

    setLists(data);
  }

  const addList = async () => {
    const isListNameUnique = lists.map(list =>
      list.name.toLowerCase().replaceAll(" ", ""))
      .includes(listName.toLowerCase().replaceAll(" ", ""))

    if (loading) return;
    if (!listName.trim()) {
      toast.error("Please enter list name!")
      return;
    }
    if (isListNameUnique) {
      toast.error("List name already exist!")
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('lists').insert({
        name: listName, index: lists.length,
        user_id: session.user.id
      },
      ).select('*, cards(*)')

    if (error) {
      console.error(error)
      return;
    }

    setLists(prevLists => [...prevLists, data[0]]);
    setLoading(false);

    setListName("");
    setIsModalOpen(false)
  }

  const deleteList = async (listId: number) => {
    const updatedList = lists.filter(list => list.id != listId)
    updatedList.forEach((list, index) => list.index = index);
    setLists(updatedList);

    await supabase.from("lists")
      .delete()
      .eq("id", listId)

    await Promise.all(
      updatedList.map(list =>
        supabase.from("lists")
          .update({ "index": list.index })
          .eq("id", list.id)
      )
    )
  }

  const addCardGlobally = async () => {
    if (loading) return;
    if (!globalCardTitle || !selectedList) {
      toast.error("Please fill all the fields!");
      return;
    };

    const cardList = lists.find(list => list.name == selectedList);

    setLoading(true);
    const { data, error } = await supabase
      .from('cards')
      .insert({
        name: globalCardTitle, list_id: cardList?.id,
        index: cardList?.cards.length,
        user_id: session.user.id
      },
      ).select()

    if (error) {
      console.error(error);
      return;
    }

    setLists(prevLists =>
      prevLists.map(list =>
        list.name == selectedList ? {
          ...list, cards: [...list.cards, data[0]]
        } : list
      )
    )

    setLoading(false);
    setGlobalCardTitle("");
  }

  const addCard = async () => {
    if (loading) return;
    if (!cardTitle.trim()) return;

    const cardList = lists.find(list => list.id == listId);
    setLoading(true);

    const { data, error } = await supabase
      .from('cards')
      .insert({
        name: cardTitle, list_id: listId,
        index: cardList?.cards.length,
        user_id: session.user.id
      },
      ).select()

    if (error) {
      console.error(error);
      return;
    }
    setLoading(false);

    setLists(prevLists =>
      prevLists.map(list =>
        listId == list.id ? {
          ...list, cards: [...list.cards, data[0]]
        } : list
      )
    )
    setCardTitle("")
  }

  const closeModal = (e: MouseEvent<HTMLDivElement>) => {
    if (modelRef.current == e.target) {
      setIsModalOpen(false)
    }
  }

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId == source.droppableId
      && destination.index == source.index) {
      return;

    } else {
      // lists logic
      if (result.type == "PARENT") {
        const newArray = [...lists.map(list => ({ ...list }))];
        const [removedItem] = newArray.splice(source.index, 1);
        newArray.splice(destination.index, 0, removedItem);
        newArray.forEach((list, index) => list.index = index);

        setLists(newArray);

        await Promise.all(
          newArray.map((list, index) =>
            supabase.from("lists")
              .update({ index: index })
              .eq("id", list.id)
          )
        )

        // cards logic
      } else if (result.type == "CHILD") {
        if (source.droppableId == destination.droppableId) {
          const myListId = Number(source.droppableId.slice(3));

          let myCards: Card[] = [];
          const updatedLists = lists.map(list => {
            if (list.id != myListId) return list;

            myCards = [...list.cards.map(card => ({ ...card }))];
            const [movedItem] = myCards.splice(source.index, 1);
            myCards.splice(destination.index, 0, movedItem);

            myCards.forEach((card, index) => card.index = index);
            return { ...list, cards: myCards };
          })
          setLists(updatedLists)

          await Promise.all(
            myCards.map((card, index) =>
              supabase.from("cards")
                .update({ index: index })
                .eq("id", card.id)
            )
          )

        } else {
          const sourceListId = Number(source.droppableId.slice(3));
          const destinationListId = Number(
            destination.droppableId.slice(3)
          );

          const sourceList = lists.find(l => l.id == sourceListId);
          const movedCard = sourceList?.cards[source.index];

          if (!movedCard) return;

          const updatedLists = lists.map(list => {
            if (list.id == sourceListId) {
              const cards = [...list.cards];
              cards.splice(source.index, 1);

              return { ...list, cards }
            }

            if (list.id == destinationListId) {
              const cards = [...list.cards];
              movedCard.list_id = destinationListId;
              cards.splice(destination.index, 0, movedCard);

              return { ...list, cards }
            }

            return list;
          })

          const cards: Card[] = [];
          updatedLists.forEach(list => {
            list.cards.forEach((card, index) => {
              card.index = index;
              cards.push(card);
            })
          })

          setLists(updatedLists);

          await Promise.all(
            cards.map((card) =>
              supabase.from("cards")
                .update({
                  index: card.index,
                  list_id: card.list_id
                }).eq("id", card.id)
            )
          )
        }
      }
    }

    setDropIndex(null);
  }

  const handleIsDone = async (cardId: number, listId: number) => {
    const updatedLists = lists.map(list => {
      return list.id == listId ?
        {
          ...list, cards: list.cards.map(card =>
            card.id == cardId ?
              { ...card, is_done: !card.is_done } : card
          )
        } : list
    })

    setLists(updatedLists);

    const { data, error: fetchError } = await supabase.from("cards")
      .select("is_done").eq("id", cardId).single()

    if (fetchError) {
      console.error("Fetching error:", fetchError)
      return;
    }

    console.log(data.is_done)

    const { data: updatedData, error: updateError } = await supabase.from("cards").update({ "is_done": !data.is_done })
      .eq("id", cardId).select();

    console.log(updatedData);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}
      onDragUpdate={(update) => {
        if (update.destination) {
          setDropIndex(update.destination.index);
        }
      }}>
      <div>
        {/* global card input */}
        <div className="input-container bg-linear-to-r from-[#544797] to-[#7A4E93] mb-12 py-4">
          <div className="max-w-3xl flex mx-auto space-x-6">
            <div className="space-x-4 flex flex-1">
              <Input ref={globalCardInputRef} type="text" placeholder="Enter card title..." value={globalCardTitle} onChange={(e) => setGlobalCardTitle(e.target.value)} extraClass="bg-[#6C5EAD]  border border-[#fff] hover:bg-[#9186C2] focus:placeholder:text-gray-600 focus:bg-[#FFFDF3] placeholder:text-[#FFFDF3] flex-1" />

              {/* select list */}
              <select name="" id="" className="border-none outline-none cursor-pointer [appearance:base-select] bg-[#6C5EAD] hover:bg-[#9186C2] text-[#FFFDF3] focus:text-gray-600 focus:bg-[#FFFDF3] py-2 px-3 place-items-center rounded-sm min-w-40 text-sm" value={selectedList} onChange={(e) => setSelectedList(e.target.value)}>
                <option value="" disabled>Select your list</option>
                {lists.map(list => <option key={list.id} value={list.name}>
                  {list.name}</option>)}
              </select>
            </div>
            <Button title="Add card" size="sm" onClick={addCardGlobally}
              loading={loading} />
          </div>
        </div>

        {/* lists */}
        <Droppable droppableId="LISTS" type="PARENT" direction="horizontal">
          {(provided, snapshot) => (
            <div ref={provided.innerRef}
              {...provided.droppableProps}
              className={`list-cards flex items-start min-h-[calc(100vh-168px)] overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 pl-4`}>

              {/* list card */}
              {lists.map((list, index) =>
                <ListCard key={list.id} list={list}
                  listId={listId} setListId={setListId} addCard={addCard} cardTitle={cardTitle}
                  setCardTitle={setCardTitle} index={index}
                  deleteList={deleteList} handleIsDone={handleIsDone} />)}
              {provided.placeholder}
              {snapshot.isDraggingOver && (
                <div className="w-64 h-40 mx-2 rounded-lg border-2 border-dashed border-purple-400 bg-purple-200/40" />
              )}
            </div>
          )}
        </Droppable>

        <button className="w-12 h-12 bg-purple-500 hover:bg-purple-500/90 rounded-full absolute bottom-10 right-6 text-3xl flex justify-center items-center cursor-pointer text-white"
          onClick={() => setIsModalOpen(true)}>+</button>

        {/* modal */}
        {isModalOpen &&
          <div ref={modelRef} onClick={(e) => closeModal(e)} className="modal fixed inset-0 w-full h-full bg-black/40 backdrop-blur-sm transition-all duration-300 flex justify-center items-center">
            <ListInputField listName={listName} setListName={setListName} addList={addList} />
          </div>
        }
      </div>
    </DragDropContext>
  )
}

export default Home;