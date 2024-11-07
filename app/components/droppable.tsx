import { useDroppable, UniqueIdentifier } from "@dnd-kit/core";

export default function Droppable({
  id,
  children,
}: {
  id: UniqueIdentifier;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${isOver ? "bg-green-300" : "bg-yellow-300"}`}
    >
      {children}
    </div>
  );
}
