import { SetStateAction, useEffect, useRef } from "react";

interface Props {
  listName: string,
  setListName: React.Dispatch<SetStateAction<string>>,
  addList: () => void;
}

const ListInputField: React.FC<Props> = ({ listName, setListName, addList }) => {
  const listInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listInputRef.current)
      listInputRef.current.focus();
  }, [])

  return (
    <div className="input-container w-4xl bg-gray-100/10 rounded-md mx-auto flex items-stretch gap-4 mb-4 p-10">
      <input ref={listInputRef} type="text" placeholder="Enter list name..." className="flex-1 bg-white ring-1 ring-blue-600 pl-3 rounded-md outline-none focus:ring-2" value={listName} onChange={(e) => setListName(e.target.value)} />
      <button className="bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-blue-700 outline-none"
        onClick={addList}>Add list</button>
    </div>
  )
}

export default ListInputField