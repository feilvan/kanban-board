import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";

import { Card } from "./ui/card";

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
    <Card ref={setNodeRef} className={className}>
      {children}
    </Card>
  );
}
