"use client"
import { MouseEvent, useEffect, useRef, useState } from "react";
import ListInputField from "./components/ListInputField";
import ListCard from "./components/ListCard";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";

export interface List {
  id: number,
  name: string,
  card: Card[],
}

export interface Card {
  id: number,
  name: string
}

const Home = () => {
  const [listName, setListName] = useState("");
  const [lists, setLists] = useState<List[]>([]);
  const [listId, setListId] = useState(0);
  const [cardTitle, setCardTitle] = useState("");
  const [globalCardTitle, setGlobalCardTitle] = useState("");
  const [selectedList, setSelectedList] = useState("select-your-list");
  const [isModalOpen, setIsModalOpen] = useState(false)

  const modelRef = useRef(null);
  const globalCardInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (globalCardInputRef.current) {
      globalCardInputRef.current.focus();
    }
  }, [])

  const addList = () => {
    if (!listName.trim() || lists.map(list =>
      list.name.toLowerCase().replaceAll(" ", ""))
      .includes(listName.toLowerCase().replaceAll(" ", ""))) return;

    setLists(prevLists =>
      [...prevLists, { id: Date.now(), name: listName, card: [] }])
    setListName("");
    setIsModalOpen(false)
  }

  const addCardGlobally = () => {
    if (!globalCardTitle || selectedList == "select-your-list") return;
    console.log(selectedList)
    setLists(prevLists =>
      prevLists.map(list =>
        list.name == selectedList ? {
          ...list, card: [...list.card, {
            id: Date.now(), name: globalCardTitle
          }]
        } : list
      )
    )
    setGlobalCardTitle("")
  }

  const addCard = () => {
    if (!cardTitle.trim()) return;

    setLists(prevLists =>
      prevLists.map(list =>
        listId == list.id ? {
          ...list, card: [...list.card, {
            id: Date.now(), name: cardTitle
          }]
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

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return;
    if (destination.droppableId == source.droppableId
      && destination.index == source.index) {
      console.log(result);
      return
    };

    if (result.type == "PARENT") {
      console.log(result)
      setLists(prevLists => {
        const newArray = [...prevLists];
        if (destination.index != source.index) {
          const [removedItem] = newArray.splice(source.index, 1);
          newArray.splice(destination.index, 0, removedItem);
        }
        return newArray;
      })
    }

    if (result.type == "CHILD") {
      console.log(result)
      setLists(prevLists => {
        let newArray = [...prevLists];
        if (destination.droppableId == source.droppableId) {
          newArray.forEach(list => {
            if (list.id.toString() == source.droppableId) {
              const [removedItem] = list.card.splice(source.index, 1);
              list.card.splice(destination.index, 0, removedItem);
            }
          })
        } else {
          let movedItem: Card;
          newArray.forEach(list => {
            if (list.id.toString() == source.droppableId) {
              [movedItem] = list.card.splice(source.index, 1);
            }
          })
          newArray.forEach(list => {
            if (list.id.toString() == destination.droppableId) {
              list.card.splice(destination.index, 0, movedItem);
            }
          })
        }
        return newArray;
      })
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-linear-to-tl from-pink-300 to-purple-500 text-black">

        <button className="w-12 h-12 bg-purple-500 hover:bg-purple-500/90 rounded-full absolute bottom-10 right-6 text-3xl flex justify-center  items-center cursor-pointer text-white" onClick={() => setIsModalOpen(true)}>
          +
        </button>

        {/* modal */}
        {isModalOpen && <div ref={modelRef} onClick={(e) => closeModal(e)} className="modal fixed inset-0 w-full h-full bg-black/40 backdrop-blur-sm transition-all duration-300 flex justify-center items-center">
          <ListInputField listName={listName} setListName={setListName} addList={addList} />
        </div>}

        {/* global card input */}
        <div className="input-container max-w-4xl mx-auto flex items-center gap-4 mb-12 pt-8">
          <input ref={globalCardInputRef} type="text" placeholder="Enter card title..." className="flex-1 bg-white ring-1 ring-blue-600 py-2 pl-3 rounded-md outline-none focus:ring-2" value={globalCardTitle} onChange={(e) => setGlobalCardTitle(e.target.value)} />

          {/* select list */}
          <select name="" id="" className="outline-none cursor-pointer [appearance:base-select] bg-white ring-1 focus:ring-2 ring-blue-600 py-2 px-3 rounded-md min-w-40 text-gray-700" value={selectedList} onChange={(e) => setSelectedList(e.target.value)}>
            <option value="select-your-list">Select your list</option>
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
              {...provided.droppableProps} className="list-cards flex items-start min-h-[calc(100vh-120px)] overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 pl-4">

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

export default Home