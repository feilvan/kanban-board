import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Button } from "./ui/button";
import { CardHeader, CardTitle } from "./ui/card";

interface SortableColumnProps {
  id: UniqueIdentifier;
  title: string;
  children: React.ReactNode;
}

export default function SortableColumn(props: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-48 h-full ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <CardHeader className="p-2">
        <CardTitle className="flex items-center gap-x-2">
          <Button
            {...attributes}
            {...listeners}
            size="icon"
            variant="ghost"
            className="cursor-grab"
          >
            <GripVertical />
          </Button>
          <span>{props.title}</span>
        </CardTitle>
      </CardHeader>
      <div className="px-2 pb-2 flex flex-col gap-y-1">{props.children}</div>
    </div>
  );
}
