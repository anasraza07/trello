"use client"
import { MouseEvent, useEffect, useRef, useState } from "react";
import ListInputField from "./components/ListInputField";
import ListCard from "./components/ListCard";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { supabase } from "./supabase-client";

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
}

const Home = () => {
  const [listName, setListName] = useState("");
  const [lists, setLists] = useState<List[]>([]);
  const [listId, setListId] = useState(0);
  const [cardTitle, setCardTitle] = useState("");
  const [globalCardTitle, setGlobalCardTitle] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)

  const modelRef = useRef(null);
  const globalCardInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (globalCardInputRef.current) {
      globalCardInputRef.current.focus();
    }

    fetchData();
  }, [])

  const fetchData = async () => {
    let { data, error } = await supabase
      .from('lists')
      .select('*, cards(*)')

    if (error || !data) {
      console.error(error);
      return;
    }

    setLists(data);
  }

  const addList = async () => {
    if (!listName.trim() || lists.map(list =>
      list.name.toLowerCase().replaceAll(" ", ""))
      .includes(listName.toLowerCase().replaceAll(" ", ""))) {
      console.log("same list")
      return;
    }

    const { data, error } = await supabase
      .from('lists').insert([
        { name: listName, index: lists.length },
      ]).select('*, cards(*)')

    if (error) {
      console.error(error)
      return;
    }

    setLists(prevLists => [...prevLists, data[0]]);

    setListName("");
    setIsModalOpen(false)
  }

  const addCardGlobally = async () => {
    if (!globalCardTitle || !selectedList) {
      console.log(selectedList);
      return;
    };

    const cardList = lists.find(list => list.name == selectedList);

    const { data, error } = await supabase
      .from('cards')
      .insert([
        {
          name: globalCardTitle, list_id: cardList?.id,
          index: cardList?.cards.length
        },
      ]).select()

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
    setGlobalCardTitle("")
  }

  const addCard = async () => {
    if (!cardTitle.trim()) return;

    const cardList = lists.find(list => list.id == listId);
    const { data, error } = await supabase
      .from('cards')
      .insert([
        {
          name: cardTitle, list_id: listId,
          index: cardList?.cards.length
        },
      ]).select()

    if (error) {
      console.error(error);
      return;
    }
    console.log(data)

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

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId == source.droppableId
      && destination.index == source.index) {
      return;
    }

    if (result.type == "PARENT") {
      setLists(prevLists => {
        const newArray = [...prevLists];
        if (destination.index != source.index) {
          const [removedItem] = newArray.splice(source.index, 1);
          newArray.splice(destination.index, 0, removedItem);
        }
        return newArray;
      })

      await supabase.from("lists")
        .update({ "index": destination.index })
        .eq("id", draggableId)

      

    } else if (result.type == "CHILD") {
      if (source.droppableId == destination.droppableId) {
        setLists(prevLists => {
          const myListId = Number(source.droppableId.slice(3));

          return prevLists.map(list => {
            if (list.id != myListId) return list;

            const newCards = [...list.cards];
            const [movedItem] = newCards.splice(source.index, 1);
            newCards.splice(destination.index, 0, movedItem);

            return { ...list, cards: newCards };
          })
        })
      } else {
        const sourceListId = Number(source.droppableId.slice(3));
        const destinationListId = Number(
          destination.droppableId.slice(3)
        );

        setLists(prevLists => {
          let movedCard: Card;

          return prevLists.map(list => {
            if (list.id == sourceListId) {
              const newCards = [...list.cards];
              [movedCard] = newCards.splice(source.index, 1);

              return { ...list, cards: newCards }
            }

            if (list.id == destinationListId) {
              const newCards = [...list.cards];
              newCards.splice(destination.index, 0, movedCard);

              return { ...list, cards: newCards }

            }


            return list;
          })

        })

        const { data, error } = await supabase
          .from('lists')
          .update(lists).select("*, cards(*)");

        if (error) {
          console.error("ERROR updating cards:", error);
          return;
        }

        console.log(data)
      }
    }


  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-linear-to-tl from-pink-300 to-purple-500 text-black">

        <button className="w-12 h-12 bg-purple-500 hover:bg-purple-500/90 rounded-full absolute bottom-10 right-6 text-3xl flex justify-center  items-center cursor-pointer text-white"
          onClick={() => setIsModalOpen(true)}>
          +
        </button>

        {/* modal */}
        {isModalOpen && <div ref={modelRef} onClick={(e) => closeModal(e)} className="modal fixed inset-0 w-full h-full bg-black/40 backdrop-blur-sm transition-all duration-300 flex justify-center items-center">
          <ListInputField listName={listName} setListName={setListName} addList={addList} />
        </div>}

        {/* global card input */}
        <div className="input-container max-w-4xl mx-auto flex items-center gap-4 mb-12 pt-8">
          <input ref={globalCardInputRef} type="text" placeholder="Enter card title..." className="flex-1 bg-white ring-1 ring-blue-600 py-2 pl-3 rounded-md outline-none focus:ring-2"
            value={globalCardTitle}
            onChange={(e) => setGlobalCardTitle(e.target.value)} />

          {/* select list */}
          <select name="" id="" className="outline-none cursor-pointer [appearance:base-select] bg-white ring-1 focus:ring-2 ring-blue-600 py-2 px-3 rounded-md min-w-40 text-gray-700" value={selectedList} onChange={(e) => setSelectedList(e.target.value)}>
            <option value="" disabled>Select your list</option>
            {lists.map(list => <option key={list.id} value={list.name}>
              {list.name}</option>)}
          </select>
          <button className="bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-blue-700 outline-none"
            onClick={addCardGlobally}>Add card</button>
        </div>

        {/* lists */}
        <Droppable droppableId="LISTS" type="PARENT" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef}
              {...provided.droppableProps} className="list-cards flex items-start min-h-[calc(100vh-120px)] overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-600 pl-4">

              {/* list card */}
              {lists.map((list, index) =>
                <ListCard key={list.id} list={list}
                  listId={listId} setListId={setListId} addCard={addCard} cardTitle={cardTitle}
                  setCardTitle={setCardTitle} index={index} />)}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )
}

export default Home;