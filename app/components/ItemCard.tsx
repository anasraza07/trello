import { Draggable } from "@hello-pangea/dnd"
import { Card } from "../page"

interface Props {
	item: Card,
	index: number
}

const ItemCard: React.FC<Props> = ({ item: { id, name }, index }) => {
	return (
		<Draggable draggableId={`card-${id.toString()}`}
			index={index} key={id.toString()}>
			{(provided) => (
				<li key={id}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					ref={provided.innerRef}
					className="bg-white p-2 mb-2 text-gray-600 rounded-lg shadow-md wrap-break-word">{name}</li>
			)}
		</Draggable>
	)
}

export default ItemCard