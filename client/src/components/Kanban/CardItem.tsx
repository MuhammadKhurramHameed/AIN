import { useDraggable } from "@dnd-kit/core";
import { KanbanCard } from "../../types";
import { Badge } from "../ui/Badge";

export function CardItem({ card }: { card: KanbanCard }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card._id });
  const assignee = typeof card.assigneeId === "string" ? null : card.assigneeId;

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg border border-slate-200 shadow-sm px-3 py-2.5 cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div className="text-sm font-medium text-slate-900">{card.title}</div>
      {card.description && <div className="text-xs text-slate-400 mt-1 line-clamp-2">{card.description}</div>}
      <div className="flex items-center justify-between mt-2">
        <Badge text={card.priority} />
        {assignee && <span className="text-xs text-slate-400">{assignee.name}</span>}
      </div>
    </div>
  );
}
