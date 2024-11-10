import { Info } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function About() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Info />
          <span className="sr-only">About</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kanban Board</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <div>
                A simple kanban board using{" "}
                <a
                  href="https://dndkit.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge variant="outline" className="font-mono">
                    dndkit
                  </Badge>
                </a>
              </div>
              <div>
                Current feature:
                <ul className="list-disc list-inside">
                  <li>Drag and drop tasks between columns</li>
                  <li>Drag and drop tasks within a column</li>
                  <li>Task creation</li>
                  <li>Task deletion</li>
                  <li>Column creation</li>
                </ul>
              </div>
              <div>
                To be implemented:
                <ul className="list-disc list-inside">
                  <li>Reorder column</li>
                  <li>Task editing</li>
                  <li>Column deletion</li>
                  <li>Column editing</li>
                </ul>
              </div>
              <div>
                By{" "}
                <a
                  href="https://github.com/feilvan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge variant="outline" className="font-mono">
                    feilvan
                  </Badge>
                </a>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
