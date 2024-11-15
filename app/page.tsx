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
import { Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

import About from "./components/about";
import Droppable from "./components/droppable";
import Item from "./components/item";
import OverlayItem from "./components/overlay-item";
import SortableColumn from "./components/sortable-column";
import SortableItem from "./components/sortable-item";
import { ThemeToggle } from "./components/theme-toggle";
import { Button } from "./components/ui/button";
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
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);

  useEffect(() => {
    const savedColumns = localStorage.getItem("columns");
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    } else {
      setColumns([
        { id: "delete-column", title: "Delete", items: [] },
        {
          id: createId({ prefix: "column-" }),
          title: "Todo",
          items: [
            { id: createId({ prefix: "item-" }), text: "Make column sortable" },
          ],
        },
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
    if (columns.find((col) => col.id === active.id)) {
      setIsDraggingColumn(true);
    }
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
      setIsDraggingColumn(false);
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
    setIsDraggingColumn(false);
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
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        collisionDetection={collisionDetection}
      >
        <div className="my-6 flex justify-between">
          <div className="space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Plus />
                  Item
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="flex flex-col gap-y-2">
                <Input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="New item"
                />
                <PopoverClose asChild>
                  <Button onClick={handleAddItem}>Add Item</Button>
                </PopoverClose>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Plus />
                  Column
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="flex flex-col gap-y-2">
                <Input
                  type="text"
                  value={newColumnText}
                  onChange={(e) => setNewColumnText(e.target.value)}
                  placeholder="New column"
                />
                <PopoverClose asChild>
                  <Button onClick={handleAddColumn}>Add Column</Button>
                </PopoverClose>
              </PopoverContent>
            </Popover>
            <ThemeToggle />
            <About />
          </div>
          <Droppable
            id="delete-column"
            className={`p-0 gap-2 inline-flex items-center justify-center transition-opacity border-dashed border-red-900 bg-red-50 dark:bg-red-950/20 text-red-400 h-9 px-4 py-2 rounded-md self-start ${
              activeId ? "opacity-100" : "opacity-0"
            }`}
          >
            <Trash size={16} />
            Drop here to delete
          </Droppable>
        </div>
        <div className="flex gap-x-2 overflow-x-auto flex-grow">
          <SortableContext
            items={columns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns
              .filter(({ id }) => id !== "delete-column")
              .map((column) => (
                <Droppable key={column.id} id={column.id} className="h-fit">
                  <SortableColumn id={column.id} title={column.title}>
                    <SortableContext
                      disabled={isDraggingColumn}
                      items={column.items.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
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
                    </SortableContext>
                  </SortableColumn>
                </Droppable>
              ))}
          </SortableContext>
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
