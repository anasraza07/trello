import { BsThreeDots } from 'react-icons/bs'
import { RiCollapseHorizontalLine } from 'react-icons/ri'
import { List } from '../page'
import { SetStateAction, useState } from 'react'
import CardInputField from './CardInputField'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import ItemCard from './ItemCard'

interface Props {
  list: List,
  listId: number,
  setListId: React.Dispatch<SetStateAction<number>>,
  setCardTitle: React.Dispatch<SetStateAction<string>>
  addCard: () => void,
  cardTitle: string,
  index: number
}

const ListCard: React.FC<Props> = ({ list, listId, setListId, addCard, cardTitle, setCardTitle, index }) => {
  const [isCollapse, setIsCollapse] = useState<boolean>(false);

  const toggleCollapse = () => {
    setIsCollapse(!isCollapse);
  }

  return (
    <Draggable draggableId={list.id.toString()} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} 
        {...provided.dragHandleProps} className={`list-card rounded-[10px] bg-amber-200 mr-4 ${!isCollapse && "min-w-68 max-w-68 py-2"}`}>
          {isCollapse ? (
            <div onClick={toggleCollapse} className='flex flex-col rounded-[10px] items-center hover:bg-amber-300/30 py-3 px-3 cursor-pointer'>
              <span className="cursor-pointer mb-3" ><RiCollapseHorizontalLine size={18} /></span>
              <span className="list-name text-[15px] font-semibold [writing-mode:vertical-lr] mb-2">{list.name}</span>
              <span className="text-gray-500 [writing-mode:vertical-lr] text-[15px]">{list.cards.length}</span>
            </div>
          ) : (
            <>
              <div className="top-bar flex justify-between p-2 mb-1 mx-3">
                <span className="list-name text-sm font-semibold">{list.name}</span>
                <div className="actions flex items-center gap-3">
                  <span className="cursor-pointer"
                    onClick={toggleCollapse}><RiCollapseHorizontalLine size={18} /></span>
                  <span className="cursor-pointer"><BsThreeDots /></span>
                </div>
              </div>

              {/* item cards */}
              <Droppable droppableId={`ul-${list.id.toString()}`}
                direction='vertical' type='CHILD'>
                {(provided) => (
                  <ul className="cards min-h-0.5 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-gray-100/30 scrollbar-thumb-gray-400 max-h-[380px] p-2"
                    ref={provided.innerRef}
                    {...provided.droppableProps}>
                    {list.cards.map((item, index) => (
                      <ItemCard key={item.id}
                        item={item}
                        index={index} />
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>

              <CardInputField list={list} listId={listId} setListId={setListId} addCard={addCard} cardTitle={cardTitle} setCardTitle={setCardTitle} />
            </>
          )}
        </div>
      )}
    </Draggable>
  )
}

export default ListCard