import {
  DndContext,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { create } from "zustand";

import { Project } from "@/types";

import Droppable from "./droppable";
import SortableColumn from "./sortable-column";
import SortableItem from "./sortable-item";

type ColumnsState = {
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  overId: UniqueIdentifier | null;
  setOverId: (id: UniqueIdentifier | null) => void;
};

export const useColumns = create<ColumnsState>((set) => ({
  activeId: null,
  setActiveId: (id) => set({ activeId: id }),
  overId: null,
  setOverId: (id) => set({ overId: id }),
}));

function Columns({ project }: { project?: Project }) {
  const activeId = useColumns((state) => state.activeId);
  const setActiveId = useColumns((state) => state.setActiveId);
  const setOverId = useColumns((state) => state.setOverId);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragMove(event: DragMoveEvent) {
    setOverId(event.over?.id ?? null);
  }

  function handleDragEnd() {
    setActiveId(null);
    setOverId(null);
  }

  return (
    project && (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-2">
          <SortableContext items={project.column.map((column) => column.id)}>
            {project.column.map((column) => (
              <Droppable key={column.id} id={column.id}>
                <SortableColumn id={column.id} title={column.title}>
                  <SortableContext items={column.item.map((item) => item.id)}>
                    {column.item.map((item) => (
                      <SortableItem key={item.id} id={item.id}>
                        <div>{item.title}</div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </SortableColumn>
              </Droppable>
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeId ? (
            project.column.find((column) => column.id === activeId) ? (
              <div>Column</div>
            ) : (
              <div>Item</div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    )
  );
}

const Column = {
  Columns,
};

export default Column;
