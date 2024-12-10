import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EllipsisVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SortableItemProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function SortableItem(props: SortableItemProps) {
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
      ref={props.disabled ? undefined : setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative ${isDragging ? "z-10 opacity-50" : ""}`}
    >
      <div
        className={`group/item flex items-center justify-between rounded-md px-1 py-1 hover:bg-neutral-900`}
      >
        <div className="pl-3">{props.children}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-fit w-2 opacity-0 group-hover/item:opacity-100 aria-expanded:opacity-100"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit task</DropdownMenuItem>
            <DropdownMenuItem>Delete task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
