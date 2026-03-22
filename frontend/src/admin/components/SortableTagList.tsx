import { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  items: string[];
  onReorder: (items: string[]) => void;
  onRemove?: (item: string) => void;
  onAdd?: (item: string) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

function SortableTag({
  id,
  onRemove,
}: {
  id: string;
  onRemove?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <span
      ref={setNodeRef}
      style={style}
      className={cn(
        "inline-flex items-center gap-0.5 pl-1 pr-2 py-1 text-xs rounded-full bg-accent/10 text-accent select-none",
        isDragging && "opacity-50 z-50",
      )}
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-0.5 text-accent/50 hover:text-accent"
      >
        <GripVertical size={10} />
      </span>
      {id}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:text-red-400 transition-colors"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}

export default function SortableTagList({
  items,
  onReorder,
  onRemove,
  onAdd,
  placeholder = "Add item...",
  suggestions,
  className,
}: Props) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleAdd = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !items.includes(trimmed) && onAdd) {
      onAdd(trimmed);
    }
    setInput("");
  };

  const available = suggestions?.filter((s) => !items.includes(s)) || [];

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[32px]">
            {items.map((item) => (
              <SortableTag
                key={item}
                id={item}
                onRemove={onRemove ? () => onRemove(item) : undefined}
              />
            ))}
            {items.length === 0 && (
              <span className="text-xs text-text-muted italic py-1">
                No items yet
              </span>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {onAdd && (
        <div className="flex gap-2 mb-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd(input);
              }
            }}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            onClick={() => handleAdd(input)}
            disabled={!input.trim()}
            className="px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-text-secondary hover:text-accent hover:border-accent transition-colors disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {available.map((s) => (
            <button
              key={s}
              onClick={() => onAdd?.(s)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-surface-elevated border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              <Plus size={10} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
