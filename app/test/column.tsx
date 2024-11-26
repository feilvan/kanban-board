import {
  closestCorners,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
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

import { useProjects } from "./data";
import Droppable from "./droppable";
import SortableColumn from "./sortable-column";
import SortableItem from "./sortable-item";

type ColumnsState = {
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  overId: UniqueIdentifier | null;
  setOverId: (id: UniqueIdentifier | null) => void;
  isActiveColumn: boolean;
  setIsActiveColumn: (isActive: boolean) => void;
};

export const useColumns = create<ColumnsState>((set) => ({
  activeId: null,
  setActiveId: (id) => set({ activeId: id }),
  overId: null,
  setOverId: (id) => set({ overId: id }),
  isActiveColumn: false,
  setIsActiveColumn: (isActive) => set({ isActiveColumn: isActive }),
}));

function Columns({ project }: { project?: Project }) {
  // const setProjects = useProjects((state) => state.setProjects);
  const activeId = useColumns((state) => state.activeId);
  const setActiveId = useColumns((state) => state.setActiveId);
  const setOverId = useColumns((state) => state.setOverId);
  const isActiveColumn = useColumns((state) => state.isActiveColumn);
  const setIsActiveColumn = useColumns((state) => state.setIsActiveColumn);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
    setIsActiveColumn(
      project?.column.find((column) => column.id === event.active.id) !==
        undefined,
    );
  }

  function handleDragMove(event: DragMoveEvent) {
    setOverId(event.over?.id ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    if (event.over?.id === null) {
      return;
    }

    const overId = event.over?.id ?? null;
    const activeId = event.active.id;

    if (overId !== activeId) {
      setTimeout(() => {
        const activeColumn = project?.column.find((column) =>
          column.item.find((item) => item.id === activeId),
        );
        const overColumn = project?.column.find(
          (column) =>
            column.item.find((item) => item.id === overId) ||
            column.id === overId,
        );
        console.log(activeColumn, overColumn);
        if (activeColumn && overColumn && activeColumn !== overColumn) {
          const activeItem = activeColumn.item.find(
            (item) => item.id === activeId,
          );
          const overIndex = overColumn.item.findIndex(
            (item) => item.id === overId,
          );

          if (activeItem) {
            activeColumn.item.splice(activeColumn.item.indexOf(activeItem), 1);
            overColumn.item.splice(overIndex, 0, activeItem);
            setOverId(overId);
          }
        }
      }, 0);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    setOverId(null);
    setIsActiveColumn(false);

    if (event.over?.id === null) {
      return;
    }

    const sourceId = event.active.id;
    const destinationId = event.over?.id ?? null;

    if (sourceId === destinationId) {
      return;
    }

    if (project) {
      const updatedProject = { ...project };

      if (isActiveColumn) {
        const sourceColumn = updatedProject.column.find(
          (column) => column.id === sourceId,
        );
        const destinationColumn = updatedProject.column.find(
          (column) => column.id === destinationId,
        );
        if (sourceColumn && destinationColumn) {
          const sourceIndex = updatedProject.column.indexOf(sourceColumn);
          const destinationIndex =
            updatedProject.column.indexOf(destinationColumn);
          updatedProject.column.splice(sourceIndex, 1);
          updatedProject.column.splice(destinationIndex, 0, sourceColumn);
        }
      } else {
        const sourceColumn = updatedProject.column.find((column) =>
          column.item.find((item) => item.id === sourceId),
        );
        const destinationColumn = updatedProject.column.find(
          (column) =>
            column.item.find((item) => item.id === destinationId) ||
            column.id === destinationId,
        );
        if (sourceColumn && destinationColumn) {
          const sourceItem = sourceColumn.item.find(
            (item) => item.id === sourceId,
          );
          const destinationIndex = destinationColumn.item.findIndex(
            (item) => item.id === destinationId,
          );
          if (sourceItem) {
            sourceColumn.item.splice(sourceColumn.item.indexOf(sourceItem), 1);
            destinationColumn.item.splice(destinationIndex, 0, sourceItem);
          }
        }
      }
      useProjects.setState((state) => ({
        projects: state.projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p,
        ),
      }));
    }
  }

  const collisionDetection: CollisionDetection = closestCorners;

  return (
    project && (
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-2">
          <SortableContext items={project.column.map((column) => column.id)}>
            {project.column.map((column) => (
              <Droppable key={column.id} id={column.id}>
                <SortableColumn id={column.id} title={column.title}>
                  <SortableContext items={column.item.map((item) => item.id)}>
                    {column.item.map((item) => (
                      <SortableItem
                        key={item.id}
                        id={item.id}
                        disabled={isActiveColumn}
                      >
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
