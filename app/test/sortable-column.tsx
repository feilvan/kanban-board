import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EllipsisVertical, GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SortableColumnProps {
  id: UniqueIdentifier;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
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
      className={`relative h-full ${isDragging ? "z-20 opacity-50" : ""}`}
    >
      <Card
        className={`group h-fit w-60 bg-transparent ${isDragging ? "bg-neutral-900" : ""}`}
      >
        <CardHeader className="p-2">
          <CardTitle className="flex justify-between">
            <div className="flex items-center gap-x-2">
              <Button
                {...attributes}
                {...listeners}
                size="icon"
                variant="ghost"
                className="cursor-grab opacity-50 group-hover:opacity-100"
                disabled={props.disabled}
              >
                <GripVertical />
              </Button>
              <span>{props.title}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 aria-expanded:opacity-100"
                >
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Add task</DropdownMenuItem>
                <DropdownMenuItem>Edit column</DropdownMenuItem>
                <DropdownMenuItem>Delete column</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
        </CardHeader>
        <div className="relative flex flex-col gap-y-1 px-2 pb-2">
          {props.children}
        </div>
      </Card>
    </div>
  );
}
