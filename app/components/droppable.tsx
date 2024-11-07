import { useDroppable } from "@dnd-kit/core";

export default function Droppable() {
  const { setNodeRef } = useDroppable({
    id: "unique-id",
  });

  return (
    <div ref={setNodeRef} className="bg-red-300">
      Droppable
    </div>
  );
}
