"use client"
import { MouseEventHandler, useRef, useState } from "react";
import ListInputField from "./components/ListInputField";
import ListCard from "./components/ListCard";

export interface List {
  id: number,
  name: string,
  card: Card[],
}

interface Card {
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

  const addList = () => {
    if (!listName.trim() ||
      lists.map(list =>
        list.name.toLowerCase().replaceAll(" ", ""))
        .includes(listName.toLowerCase().replaceAll(" ", ""))) return;
    setLists(prevLists => [...prevLists, { id: Date.now(), name: listName, card: [] }])
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

  const closeModal = (e: MouseEventHandler<HTMLDivElement>) => {
    if (modelRef.current == e.target) {
      setIsModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-tl from-pink-300 to-purple-500">
      <button className="w-20 h-20 bg-amber-500 rounded-full absolute bottom-6 right-6 text-3xl font-bold flex justify-center  items-center cursor-pointer" onClick={() => setIsModalOpen(true)}>+</button>

      {/* Modal */}
      {isModalOpen && <div ref={modelRef} onClick={closeModal} className="modal fixed inset-0 w-full h-full bg-black/70 backdrop-blur-sm transition-all duration-300 flex justify-center items-center">
        <ListInputField listName={listName} setListName={setListName} addList={addList} />
      </div>}

      <div className="input-container max-w-4xl mx-auto flex items-center gap-4 mb-12 pt-8">
        <input type="text" placeholder="Enter card title..." className="flex-1 bg-white ring-1 ring-blue-600 py-2 pl-3 rounded-md outline-none focus:ring-2" value={globalCardTitle} onChange={(e) => setGlobalCardTitle(e.target.value)} />

        {/* select list */}
        <select name="" id="" className="outline-none cursor-pointer [appearance:base-select] bg-white ring-1 ring-blue-600 py-2 px-3 rounded-md min-w-40 text-gray-700" value={selectedList} onChange={(e) => setSelectedList(e.target.value)}>
          <option value="select-your-list">Select your list</option>
          {lists.map(list => <option key={list.id} value={list.name}>
            {list.name}</option>)}
        </select>
        <button className="bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-blue-700 outline-none" onClick={addCardGlobally}>Add card</button>
      </div>

      <div className="list-cards flex items-start gap-4 min-h-[calc(100vh-152px)] overflow-x-scroll pl-4">

        {/* list card */}
        {lists.map(list => <ListCard key={list.id} list={list}
          listId={listId} setListId={setListId} addCard={addCard} cardTitle={cardTitle}
          setCardTitle={setCardTitle} />)}
      </div>
    </div>
  )
}

export default Home