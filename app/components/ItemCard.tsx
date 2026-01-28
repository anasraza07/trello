import { Draggable } from "react-beautiful-dnd"
import { Card } from "../pages/Home";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa"
import { MouseEvent } from "react";

interface Props {
	item: Card,
	index: number
	handleIsDone: (e: MouseEvent<SVGElement>, cardId: number, listId: number) => void;
	handleCardDetails: (item: Card) => void;
}

const ItemCard: React.FC<Props> = ({ item: { id, name, list_id, is_done }, index, handleIsDone, handleCardDetails, item }) => {

	return (
		<Draggable draggableId={`card-${id.toString()}`}
			index={index} key={id.toString()}>
			{(provided, snapshot) => (
				<li key={id}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					ref={provided.innerRef}
					className={`${snapshot.isDragging ? "cursor-grab" : "cursor-pointer"} group bg-white px-3 py-4 mb-2 text-gray-600 text-[15px] rounded-lg shadow-md wrap-break-word flex items-center gap-2 relative hover:ring-2 hover:ring-blue-500`}
					onClick={() => handleCardDetails(item)}
				>
					{is_done ? <FaCheckCircle size={16} color="green" className="mr-4 cursor-pointer" 
					onClick={(e) => handleIsDone(e, id, list_id)} />
						: <FaRegCircle size={16} className="opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer" onClick={(e) => handleIsDone(e, id, list_id)} />
					}
					<span className={`inline-block ${!is_done ? "left-3 group-hover:left-[34px]" : "left-[34px]"} absolute  transition-all duration-500`}>{name}</span>
				</li>
			)
			}
		</Draggable >
	)
}

export default ItemCard