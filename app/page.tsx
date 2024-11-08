"use client";

import { useState } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  DragOverEvent,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
  DragOverlay,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "./components/sortable-item";
import Item from "./components/item";
import Droppable from "./components/droppable";

interface Column {
  id: UniqueIdentifier;
  items: string[];
}

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([
    { id: "delete-column", items: [] }, // Column for deleting items
    { id: "column-1", items: ["Item 1", "Item 2", "Item 3"] },
    { id: "column-2", items: ["Item 4", "Item 5", "Item 6"] },
    { id: "column-3", items: [] }, // Example empty column
  ]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id.toString());
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    // Determine if over.id is a column or an item
    const overColumn = columns.find((col) => col.id === over.id);
    const overItem = columns.find((col) =>
      col.items.includes(over.id.toString())
    );

    const overContainer = overColumn || overItem;

    const activeContainer = columns.find((col) =>
      col.items.includes(active.id.toString())
    );

    if (
      activeContainer &&
      overContainer &&
      activeContainer.id !== overContainer.id
    ) {
      setColumns((cols) => {
        const source = cols.find((col) => col.id === activeContainer.id);
        const destination = cols.find(
          (col) => col.id === (overColumn ? overColumn.id : overItem!.id)
        );
        if (source && destination) {
          const sourceItems = [...source.items];
          const destItems = [...destination.items];
          const [movedItem] = sourceItems.splice(
            source.items.indexOf(active.id.toString()),
            1
          );
          if (overColumn) {
            destItems.push(movedItem);
          } else {
            const overIndex = destItems.indexOf(over.id.toString());
            destItems.splice(overIndex, 0, movedItem);
          }
          return cols.map((col) => {
            if (col.id === source.id) return { ...col, items: sourceItems };
            if (col.id === destination.id) return { ...col, items: destItems };
            return col;
          });
        }
        return cols;
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    // Determine if over.id is a column or an item
    const overColumn = columns.find((col) => col.id === over.id);
    const overItem = columns.find((col) =>
      col.items.includes(over.id.toString())
    );

    const overContainer = overColumn || overItem;

    const activeContainer = columns.find((col) =>
      col.items.includes(active.id.toString())
    );

    if (activeContainer && overContainer) {
      if (overContainer.id === "delete-column") {
        // Remove the item from the active container
        setColumns((cols) =>
          cols.map((col) =>
            col.id === activeContainer.id
              ? {
                  ...col,
                  items: col.items.filter(
                    (item) => item !== active.id.toString()
                  ),
                }
              : col
          )
        );
      } else if (activeContainer.id === overContainer.id) {
        const oldIndex = activeContainer.items.indexOf(active.id.toString());
        let newIndex: number;
        if (overColumn) {
          newIndex = activeContainer.items.length;
        } else {
          newIndex = overContainer.items.indexOf(over.id.toString());
        }
        setColumns((cols) =>
          cols.map((col) =>
            col.id === activeContainer.id
              ? { ...col, items: arrayMove(col.items, oldIndex, newIndex) }
              : col
          )
        );
      }
    }

    setActiveId(null);
  }

  return (
    <div className="grid place-items-center min-h-svh font-[family-name:var(--font-geist-sans)]">
      <div>
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          collisionDetection={closestCorners}
        >
          <div className="flex gap-x-2">
            {columns.map((column) => (
              <Droppable key={column.id} id={column.id}>
                <SortableContext
                  items={column.items}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="rounded min-w-[150px] min-h-[100px]">
                    <h2>{column.id}</h2>
                    {column.items.length > 0 ? (
                      column.items.map((item) => (
                        <SortableItem key={item} id={item} />
                      ))
                    ) : (
                      <div className="text-gray-500">Drop items here</div>
                    )}
                  </div>
                </SortableContext>
              </Droppable>
            ))}
          </div>
          <DragOverlay>{activeId ? <Item id={activeId} /> : null}</DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
