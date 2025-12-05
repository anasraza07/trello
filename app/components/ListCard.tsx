import { BsThreeDots } from 'react-icons/bs'
import { RiCollapseHorizontalLine } from 'react-icons/ri'
import { List } from '../page'
import { IoMdAdd, IoMdClose } from 'react-icons/io'
import { SetStateAction, useState } from 'react'
import CardInputField from './CardInputField'

interface Props {
    list: List,
    listId: number,
    setListId: React.Dispatch<SetStateAction<number>>,
    setCardTitle: React.Dispatch<SetStateAction<string>>
    addCard: () => void,
    cardTitle: string,
}

const ListCard: React.FC<Props> = ({ list, listId, setListId, addCard, cardTitle, setCardTitle }) => {
    const [isCollapse, setIsCollapse] = useState<boolean>(false);

    const toggleCollapse = () => {
        setIsCollapse(!isCollapse);
    }

    return (
        <div className={`list-card rounded-[10px] bg-amber-200 ${!isCollapse && "w-68 py-2 px-3"} overflow-hidden`}>
            {isCollapse ? (
                <div onClick={toggleCollapse} className='flex flex-col items-center hover:bg-amber-300/30 py-3 px-3 cursor-pointer'>
                    <span className="cursor-pointer mb-3" ><RiCollapseHorizontalLine size={18} /></span>
                    <span className="list-name text-[15px] font-semibold [writing-mode:vertical-lr] mb-2">{list.name}</span>
                    <span className="text-gray-500 [writing-mode:vertical-lr] text-[15px]">{list.card.length}</span>
                </div>
            ) : (
                <>
                    <div className="top-bar flex justify-between p-2 mb-1">
                        <span className="list-name text-sm font-semibold">{list.name}</span>
                        <div className="actions flex items-center gap-3">
                            <span className="cursor-pointer"
                                onClick={toggleCollapse}><RiCollapseHorizontalLine size={18} /></span>
                            <span className="cursor-pointer"><BsThreeDots /></span>
                        </div>
                    </div>

                    <ul className="">
                        {list.card.map(item => (
                            <li key={item.id} className="bg-white p-2 text-gray-600 rounded-lg shadow-md mb-2 wrap-break-word">{item.name}</li>
                        ))}
                    </ul>

                    <CardInputField list={list} listId={listId} setListId={setListId} addCard={addCard} cardTitle={cardTitle} setCardTitle={setCardTitle} />
                </>
            )}
        </div>
    )
}

export default ListCard