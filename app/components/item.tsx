import { UniqueIdentifier } from "@dnd-kit/core";

export default function Item({
  id,
  text,
}: {
  id: UniqueIdentifier;
  text: string;
}) {
  return (
    <div
      id={id.toString()}
      className="inline-flex w-full cursor-grab select-none items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
    >
      {text}
    </div>
  );
}
