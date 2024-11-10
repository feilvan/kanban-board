"use client";

import {
  closestCorners,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  rectIntersection,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PopoverClose } from "@radix-ui/react-popover";
import { GripVertical, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

import Droppable from "./components/droppable";
import Item from "./components/item";
import OverlayItem from "./components/overlay-item";
import SortableItem from "./components/sortable-item";
import { ThemeToggle } from "./components/theme-toggle";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { createId } from "./utils";

interface Item {
  id: UniqueIdentifier;
  text: string;
}

interface Column {
  id: UniqueIdentifier;
  title: string;
  items: Item[];
}

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [newColumnText, setNewColumnText] = useState("");
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    const savedColumns = localStorage.getItem("columns");
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    } else {
      setColumns([
        { id: "delete-column", title: "Delete", items: [] },
        { id: createId({ prefix: "column-" }), title: "Todo", items: [] },
        {
          id: createId({ prefix: "column-" }),
          title: "In progress",
          items: [],
        },
        { id: createId({ prefix: "column-" }), title: "Done", items: [] },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("columns", JSON.stringify(columns));
  }, [columns]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const collisionDetection: CollisionDetection = (args) => {
    const rectIntersectionCollisions = rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        ({ id }) => id === "delete-column"
      ),
    });

    if (rectIntersectionCollisions.length > 0) {
      return rectIntersectionCollisions;
    }

    return closestCorners({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        ({ id }) => id !== "delete-column"
      ),
    });
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id.toString());
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const overColumn = columns.find((col) => col.id === over.id);
    const overItem = columns.find((col) =>
      col.items.some((item) => item.id === over.id.toString())
    );

    const overContainer = overColumn || overItem;

    const activeContainer = columns.find((col) =>
      col.items.some((item) => item.id === active.id.toString())
    );

    if (
      activeContainer &&
      overContainer &&
      activeContainer.id !== overContainer.id
    ) {
      setTimeout(() => {
        setColumns((cols) => {
          const source = cols.find((col) => col.id === activeContainer.id);
          const destination = cols.find(
            (col) => col.id === (overColumn ? overColumn.id : overItem!.id)
          );
          if (source && destination) {
            const sourceItems = [...source.items];
            const destItems = [...destination.items];
            const [movedItem] = sourceItems.splice(
              source.items.findIndex(
                (item) => item.id === active.id.toString()
              ),
              1
            );
            if (overColumn) {
              destItems.push(movedItem);
            } else {
              const overIndex = destItems.findIndex(
                (item) => item.id === over.id.toString()
              );
              destItems.splice(overIndex, 0, movedItem);
            }
            return cols.map((col) => {
              if (col.id === source.id) return { ...col, items: sourceItems };
              if (col.id === destination.id)
                return { ...col, items: destItems };
              return col;
            });
          }
          return cols;
        });
      }, 0);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const overColumn = columns.find((col) => col.id === over.id);
    const overItem = columns.find((col) =>
      col.items.some((item) => item.id === over.id.toString())
    );

    const overContainer = overColumn || overItem;

    const activeContainer = columns.find((col) =>
      col.items.some((item) => item.id === active.id.toString())
    );

    if (activeContainer && overContainer) {
      if (overContainer.id === "delete-column") {
        setColumns((cols) =>
          cols.map((col) =>
            col.id === activeContainer.id
              ? {
                  ...col,
                  items: col.items.filter(
                    (item) => item.id !== active.id.toString()
                  ),
                }
              : col
          )
        );
      } else if (activeContainer.id === overContainer.id) {
        const oldIndex = activeContainer.items.findIndex(
          (item) => item.id === active.id.toString()
        );
        let newIndex: number;
        if (overColumn) {
          newIndex = activeContainer.items.length;
        } else {
          newIndex = overContainer.items.findIndex(
            (item) => item.id === over.id.toString()
          );
        }
        setColumns((cols) =>
          cols.map((col) =>
            col.id === activeContainer.id
              ? {
                  ...col,
                  items: arrayMove(col.items, oldIndex, newIndex),
                }
              : col
          )
        );
      }
    }

    setActiveId(null);
  }

  function handleAddItem() {
    if (!newItemText) return;
    const newItem = {
      id: createId({ prefix: "item-" }),
      text: newItemText,
    };
    const targetColumn = columns.find(
      (col) => col.id !== "delete-column"
    ) as Column;
    setColumns((cols) =>
      cols.map((col) =>
        col.id === targetColumn.id
          ? { ...col, items: [...col.items, newItem] }
          : col
      )
    );
    setNewItemText("");
  }

  function handleAddColumn() {
    if (!newColumnText) return;
    const newColumnId = createId({ prefix: "column-" });
    setColumns((cols) => [
      ...cols,
      { id: newColumnId, title: newColumnText, items: [] },
    ]);
    setNewColumnText("");
  }

  return (
    <div className="max-w-screen-sm w-full flex flex-col">
      <div className="mt-12 mb-6 space-y-1.5">
        <div className="font-semibold leading-none tracking-tight">
          Kanban Board
        </div>
        <div>
          Drag and drop demo using{" "}
          <Badge variant="secondary" className="font-mono">
            dndkit
          </Badge>
        </div>
      </div>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        collisionDetection={collisionDetection}
      >
        <div className="mb-6 flex justify-between">
          <div className="space-x-2">
            <Popover>
              <PopoverTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                <Plus />
                Item
              </PopoverTrigger>
              <PopoverContent align="start" className="flex flex-col gap-y-2">
                <Input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="New item"
                />
                <PopoverClose
                  onClick={handleAddItem}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                  Add Item
                </PopoverClose>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                <Plus />
                Column
              </PopoverTrigger>
              <PopoverContent align="start" className="flex flex-col gap-y-2">
                <Input
                  type="text"
                  value={newColumnText}
                  onChange={(e) => setNewColumnText(e.target.value)}
                  placeholder="New column"
                />
                <PopoverClose
                  onClick={handleAddColumn}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                  Add Column
                </PopoverClose>
              </PopoverContent>
            </Popover>
            <ThemeToggle />
          </div>
          <Droppable
            id="delete-column"
            className={`p-0 gap-2 inline-flex items-center justify-center transition-opacity border-dashed border-red-900 bg-red-950/20 text-red-400 h-9 px-4 py-2 rounded-md self-start ${
              activeId ? "opacity-100" : "opacity-0"
            }`}
          >
            <Trash size={16} />
            Drop here to delete
          </Droppable>
        </div>
        <div className="flex gap-x-2 overflow-x-auto flex-grow">
          {columns
            .filter(({ id }) => id !== "delete-column")
            .map((column) => (
              <Droppable key={column.id} id={column.id} className="h-fit">
                <SortableContext
                  items={column.items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className=" w-48 h-full">
                    <CardHeader className="p-2">
                      <CardTitle className="flex items-center gap-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="cursor-grab"
                        >
                          <GripVertical />
                        </Button>
                        <span>{column.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <div className="px-2 pb-2 flex flex-col gap-y-1">
                      {column.items.length > 0 ? (
                        column.items.map((item) => (
                          <SortableItem key={item.id} id={item.id}>
                            <Item id={item.id} text={item.text} />
                          </SortableItem>
                        ))
                      ) : (
                        <div className="text-neutral-700 h-9 grid place-items-center">
                          Drop items here
                        </div>
                      )}
                    </div>
                  </div>
                </SortableContext>
              </Droppable>
            ))}
          <DragOverlay>
            {activeId ? (
              <OverlayItem>
                <Item
                  id={activeId}
                  text={
                    columns
                      .flatMap((col) => col.items)
                      .find((item) => item.id === activeId)?.text || ""
                  }
                />
              </OverlayItem>
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
    </div>
  );
}
