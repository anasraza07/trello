import { SetStateAction, useEffect, useRef } from "react";
import Input from "./Input";
import Button from "./Button";

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
    <div className="input-container w-fit bg-white rounded-md mx-auto flex gap-4 p-10">
      <Input ref={listInputRef} type="text" placeholder="Enter list name..." value={listName} onChange={(e) => setListName(e.target.value)} />
      <Button title="Add list" onClick={addList} />
    </div>
  )
}

export default ListInputField