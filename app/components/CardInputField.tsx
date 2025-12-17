import { IoMdAdd, IoMdClose } from "react-icons/io"
import { List } from "../pages/Home";
import { SetStateAction, useEffect, useRef } from "react"

interface Props {
  list: List,
  listId: number,
  setListId: React.Dispatch<SetStateAction<number>>,
  addCard: () => void,
  cardTitle: string,
  setCardTitle: React.Dispatch<SetStateAction<string>>,
}

const CardInputField: React.FC<Props> = ({ list, listId, addCard, cardTitle, setCardTitle, setListId }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [listId, cardTitle])

  const closeCardInputField = () => {
    setListId(0);
    setCardTitle("");
  }

  return (
    <div className={`${listId == list.id && "mx-2"} -mt-2`}>
      {listId != list.id ? (
        <div className="bottom-bar p-2 mx-2 flex items-center gap-1.5 cursor-pointer hover:bg-amber-300 hover:text-gray-800 rounded-md text-gray-700" onClick={() => setListId(list.id)}>
          <span>< IoMdAdd size={18} /></span>
          <span className="flex-1 text-sm">Add a card</span>
        </div>
      ) : (
        <>
          <textarea ref={textareaRef} className="w-full bg-white p-2 rounded-md outline-none ring-2 ring-blue-500 hover:ring-0 placeholder:text-sm placeholder:text-gray-500 field-sizing-content min-h-14 max-h-40 shadow-md resize-none mb-1" placeholder="Enter a title" value={cardTitle} onChange={(e) => setCardTitle(e.target.value)}></textarea>
          <div className="space-x-1 flex items-center">
            <button className="font-semibold text-sm bg-blue-600 rounded-sm py-1.5 px-3 text-white cursor-pointer outline-none" onClick={addCard}>Add card</button>
            <button className="py-1.5 px-1.5 hover:bg-neutral-400/40 rounded-sm cursor-pointer text-gray-900"
              onClick={closeCardInputField}><IoMdClose size={20} /></button>
          </div>
        </>
      )}
    </div>
  )
}

export default CardInputField