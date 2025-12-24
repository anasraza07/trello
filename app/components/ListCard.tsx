import { RiCollapseHorizontalLine } from 'react-icons/ri'
import { Card, List } from '../pages/Home'
import { FormEvent, SetStateAction, useState } from 'react'
import CardInputField from './CardInputField'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import ItemCard from './ItemCard'
import { AiOutlineDelete } from 'react-icons/ai'

interface Props {
  list: List,
  listId: number,
  setListId: React.Dispatch<SetStateAction<number>>,
  setCardTitle: React.Dispatch<SetStateAction<string>>
  addCard: (e?: FormEvent<HTMLFormElement>) => Promise<void>
  cardTitle: string,
  index: number,
  deleteList: (listId: number) => void,
  handleIsDone: (cardId: number, listId: number) => void;
  handleCardDetails: (item: Card) => void;
}

const ListCard: React.FC<Props> = ({ list, listId, setListId, addCard, cardTitle, setCardTitle, index, deleteList, handleIsDone,
  handleCardDetails }) => {
  const [isCollapse, setIsCollapse] = useState<boolean>(false);

  const toggleCollapse = () => {
    setIsCollapse(!isCollapse);
  }

  return (
    <Draggable draggableId={`li-${list.id.toString()}`}
      index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`list-card rounded-[10px] bg-[#F1F2F4] mr-4 ${!isCollapse && "min-w-68 max-w-68 py-2"}`}>
          {isCollapse ? (
            <div onClick={toggleCollapse} className='flex flex-col rounded-[10px] items-center hover:bg-[#DCDFE4] py-3 px-3 cursor-pointer'>
              <span className="cursor-pointer mb-3" ><RiCollapseHorizontalLine size={18} /></span>
              <span className="list-name text-[15px] font-semibold [writing-mode:vertical-lr] mb-2">{list.name}</span>
              <span className="text-gray-500 [writing-mode:vertical-lr] text-[15px]">{list.cards.length}</span>
            </div>
          ) : (
            <div>
              <div className="top-bar flex justify-between py-2 px-5">
                <span className="list-name text-sm font-semibold">
                  {list.name}</span>
                <div className="actions flex items-center gap-3">
                  <button className="cursor-pointer"
                    onClick={toggleCollapse}><RiCollapseHorizontalLine size={18} /></button>
                  <button className="cursor-pointer"
                    onClick={() => deleteList(list.id)}><AiOutlineDelete size={18} />
                  </button>
                </div>
              </div>

              {/* item cards */}
              <Droppable droppableId={`ul-${list.id.toString()}`}
                direction='vertical' type='CHILD'
                isDropDisabled={false}
                isCombineEnabled={false} ignoreContainerClipping={false}>
                {(provided) => (
                  <ul className="cards min-h-0.5 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-gray-300/50 scrollbar-thumb-gray-400 max-h-72 px-2 pt-2 mb-1"
                    ref={provided.innerRef}
                    {...provided.droppableProps}>
                    {list.cards.map((item, index) => (
                      <ItemCard key={item.id}
                        item={item}
                        index={index}
                        handleIsDone={handleIsDone}
                        handleCardDetails={handleCardDetails} />
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>

              <CardInputField list={list} listId={listId} setListId={setListId} addCard={addCard} cardTitle={cardTitle} setCardTitle={setCardTitle} />
            </div>
          )}
        </div>
      )
      }
    </Draggable >
  )
}

export default ListCard