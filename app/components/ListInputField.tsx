import { FormEvent, SetStateAction, useEffect, useRef } from "react";
import Input from "./Input";
import Button from "./Button";

interface Props {
  listName: string,
  setListName: React.Dispatch<SetStateAction<string>>,
  addList: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

const ListInputField: React.FC<Props> = ({ listName, setListName, addList }) => {
  const listInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listInputRef.current)
      listInputRef.current.focus();
  }, [])

  return (
    <form onSubmit={addList} className="input-container w-fit bg-white rounded-md mx-auto flex gap-4 p-10">
      <Input ref={listInputRef} type="text" placeholder="Enter list name..." value={listName} onChange={(e) => setListName(e.target.value)} />
      <Button type="submit" title="Add list" />
    </form>
  )
}

export default ListInputField