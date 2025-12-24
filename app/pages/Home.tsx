"use client"
import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
import ListInputField from "../components/ListInputField";
import ListCard from "../components/ListCard";
import { DragDropContext, DragStart, DragUpdate, Droppable, DropResult } from "react-beautiful-dnd";
import { supabase } from "../supabase-client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import Input from "../components/Input";
import Button from "../components/Button";
import { isEmpty } from "lodash";
import { IoMdClose } from "react-icons/io";
import { FaRegCircle } from "react-icons/fa";
import { GrTextAlignFull } from "react-icons/gr";

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

  const modelRef = useRef(null);
  const globalCardInputRef = useRef<HTMLInputElement>(null)
  const queryAttr = "data-rbd-drag-handle-draggable-id";
  const [placeholderProps, setPlaceholderProps] = useState<Partial<{
    clientX: number, clientHeight: number, clientWidth: number
  }>>({});

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("lists-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lists" },
        (payload) => {
          // if (payload.eventType == "DELETE") {
          //   setLists(updatedList);
          // }
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

  const addList = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

    // setLists(updatedList);

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

  const addCard = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
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
    setPlaceholderProps({});
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
  }

  const getDraggedDom = ((draggableId: string) => {
    const domQuery = `[${queryAttr}='${draggableId}']`;
    const draggedDOM = document.querySelector(domQuery);
    console.log(draggedDOM);

    return draggedDOM as HTMLElement | null;
  });

  const handleDragStart = (event: DragStart) => {
    const draggedDOM = getDraggedDom(event.draggableId);
    if (!draggedDOM) return;

    const parent = draggedDOM.parentNode as HTMLElement;

    const draggableItems = Array.from(parent.children).filter(
      (child) => child.hasAttribute("data-rbd-draggable-id")
    ) as HTMLElement[];

    const sourceIndex = event.source.index;

    const clientX =
      parseFloat(window.getComputedStyle(parent).paddingLeft) +
      draggableItems
        .slice(0, sourceIndex)
        .reduce((total, curr) => {
          const style = window.getComputedStyle(curr);
          return total + curr.offsetWidth + parseFloat(style.marginRight);
        }, 0);

    setPlaceholderProps({
      clientHeight: draggedDOM.offsetHeight,
      clientWidth: draggedDOM.offsetWidth,
      clientX,
    });
  };

  const handleDragUpdate = (event: DragUpdate) => {
    if (!event.destination) return;

    const draggedDOM = getDraggedDom(event.draggableId);
    if (!draggedDOM) return;

    const parent = draggedDOM.parentNode as HTMLElement;

    // 🔥 ONLY draggable elements
    const draggableItems = Array.from(parent.children).filter(
      (child) => child.hasAttribute("data-rbd-draggable-id")
    ) as HTMLElement[];

    const destinationIndex = event.destination.index;

    const clientX =
      parseFloat(window.getComputedStyle(parent).paddingLeft) +
      draggableItems
        .slice(0, destinationIndex)
        .reduce((total, curr) => {
          const style = window.getComputedStyle(curr);
          return total + curr.offsetWidth + parseFloat(style.marginRight);
        }, 0);

    setPlaceholderProps({
      clientHeight: draggedDOM.offsetHeight,
      clientWidth: draggedDOM.offsetWidth,
      clientX,
    });
  };

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

  const handleCardDetails = ((cardItem: Card) => {
    console.log(cardItem);
    setIsModalOpen(true);
  })

  return (
    <DragDropContext onDragEnd={onDragEnd}
      onDragStart={handleDragStart}
      onDragUpdate={handleDragUpdate}>
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
        <Droppable droppableId="LISTS" type="PARENT" direction="horizontal" isDropDisabled={false}
          isCombineEnabled={false} ignoreContainerClipping={false}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef}
              {...provided.droppableProps}
              className={`relative lists flex items-start min-h-[calc(100vh-168px)] overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 pl-4`}>

              {/* list card */}
              {lists.map((list, index) =>
                <ListCard key={list.id} list={list}
                  listId={listId} setListId={setListId} addCard={addCard} cardTitle={cardTitle}
                  setCardTitle={setCardTitle} index={index}
                  deleteList={deleteList} handleIsDone={handleIsDone}
                  handleCardDetails={handleCardDetails} />)}
              {provided.placeholder}
              {!isEmpty(placeholderProps) && snapshot.isDraggingOver && (
                <div
                  className="absolute bg-purple-100/30 rounded-[10px] pointer-events-none z-10"
                  style={{
                    top: 0,
                    left: placeholderProps.clientX,
                    height: placeholderProps.clientHeight,
                    width: placeholderProps.clientWidth
                  }}
                />
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

        {isModalOpen &&
          <div ref={modelRef} onClick={(e) => closeModal(e)} className="modal fixed inset-0 w-full h-full bg-black/40 backdrop-blur-sm transition-all duration-300 flex justify-center items-center">
            {/* card content component */}
            <div className="card-content w-5xl bg-white rounded-xl">
              <div className="top-bar py-2 px-4 border-b border-gray-300">
                <button className="hover:bg-neutral-400/20 rounded-sm place-self-end cursor-pointer block p-1.5" onClick={
                  () => setIsModalOpen(false)
                }>
                  <IoMdClose size={20} />
                </button>
              </div>
              <div className="main-content flex">
                <div className="desc-section flex-[0.55] p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <FaRegCircle size={18} />
                    <input type="text" value={"FaReg Circle"} className="w-full px-2 py-1 text-xl font-semibold outline-blue-600" />
                  </div>
                  <div className="card-description flex gap-4">
                    <GrTextAlignFull size={16} className="text-[#46474b] pt-0.5" />
                    <div className="content w-full text-[#46474b]">
                      <h2 className="text-[15px] font-semibold mb-4">Description
                      </h2>
                      <textarea name="" id="" placeholder="Add a more detailed description..." className="w-full border border-gray-500 resize-none rounded-sm p-2 placeholder:text-sm placeholder:font-semibold placeholder:text-[#7a7d84] block cursor-pointer hover:bg-[#F0F1F2]">
                      </textarea>
                    </div>
                    <div className="flex items-center gap-4 text-[#46474b] mb-4">
                    </div>

                  </div>
                </div>
                {/* <div className="comments-section flex-[0.45] bg-[#f8f8f8] p-4 border-l border-gray-300"></div> */}
              </div>
            </div>
          </div>
        }
      </div>
    </DragDropContext >
  )
}

export default Home;