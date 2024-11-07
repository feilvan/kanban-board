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
  closestCenter,
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
    { id: "column-1", items: ["Item 1", "Item 2", "Item 3"] },
    { id: "column-2", items: ["Item 4", "Item 5", "Item 6"] },
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

    const activeContainer = columns.find((col) =>
      col.items.includes(active.id.toString())
    );
    const overContainer = columns.find((col) =>
      col.items.includes(over.id.toString())
    );

    if (
      activeContainer &&
      overContainer &&
      activeContainer.id !== overContainer.id
    ) {
      setColumns((cols) => {
        const source = cols.find((col) => col.id === activeContainer.id);
        const destination = cols.find((col) => col.id === overContainer.id);
        if (source && destination) {
          const sourceItems = [...source.items];
          const destItems = [...destination.items];
          const [movedItem] = sourceItems.splice(
            source.items.indexOf(active.id.toString()),
            1
          );
          destItems.splice(destItems.indexOf(over.id.toString()), 0, movedItem);
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

    const activeContainer = columns.find((col) =>
      col.items.includes(active.id.toString())
    );
    const overContainer = columns.find((col) =>
      col.items.includes(over.id.toString())
    );

    if (
      activeContainer &&
      overContainer &&
      activeContainer.id === overContainer.id
    ) {
      const oldIndex = activeContainer.items.indexOf(active.id.toString());
      const newIndex = overContainer.items.indexOf(over.id.toString());
      setColumns((cols) =>
        cols.map((col) =>
          col.id === activeContainer.id
            ? { ...col, items: arrayMove(col.items, oldIndex, newIndex) }
            : col
        )
      );
    }

    setActiveId(null);
    console.log(columns);
  }

  return (
    <div className="grid place-items-center min-h-svh font-[family-name:var(--font-geist-sans)]">
      <div>
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          collisionDetection={closestCenter}
        >
          <div className="flex gap-x-2">
            {columns.map((column) => (
              <Droppable key={column.id} id={column.id}>
                <SortableContext
                  items={column.items}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="bg-gray-200 p-4 rounded">
                    <h2>{column.id}</h2>
                    {column.items.map((item) => (
                      <SortableItem key={item} id={item} />
                    ))}
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

// TODO: Add droppable to handle empty column case
