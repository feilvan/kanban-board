import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";

export default function Droppable({
  id,
  children,
  className,
}: {
  id: UniqueIdentifier;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}
