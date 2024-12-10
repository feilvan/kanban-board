"use client";

import { Check, ChevronsUpDown, EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { create } from "zustand";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils";

import { randomUUID, useProjects } from "./data";

type ProjectMenu = {
  Add: boolean;
  Edit: boolean;
  Delete: boolean;
};

const useProjectMenu = create<ProjectMenu>(() => ({
  Add: false,
  Edit: false,
  Delete: false,
}));

function setAdd() {
  useProjectMenu.setState((state) => ({
    ...state,
    Add: !state.Add,
  }));
}

function setEdit() {
  useProjectMenu.setState((state) => ({
    ...state,
    Edit: !state.Edit,
  }));
}

function setDelete() {
  useProjectMenu.setState((state) => ({
    ...state,
    Delete: !state.Delete,
  }));
}

function Combobox() {
  const [open, setOpen] = useState(false);
  const projects = useProjects((state) => state.projects);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-start"
        >
          <ChevronsUpDown className="opacity-50" />
          {useProjects.getState().selectedProjectTitle || "Select project..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search project..." className="h-9" />
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.title}
                  onSelect={() => {
                    useProjects.setState((state) => ({
                      ...state,
                      selectedProjectId: project.id,
                      selectedProjectTitle: project.title,
                    }));
                    setOpen(false);
                  }}
                >
                  {project.title}
                  <Check
                    className={cn(
                      "ml-auto",
                      useProjects.getState().selectedProjectTitle ===
                        project.title
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function Menu() {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            disabled={!useProjects.getState().selectedProjectId}
          >
            Add column
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={setAdd}>Add project</DropdownMenuItem>
          <DropdownMenuItem
            disabled={!useProjects.getState().selectedProjectId}
            onClick={setEdit}
          >
            Edit project
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!useProjects.getState().selectedProjectId}
            onClick={setDelete}
          >
            Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddProjectDialog />
      <EditProjectDialog />
      <DeleteProjectDialog />
    </>
  );
}

function AddProjectDialog() {
  const [newText, setNewText] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);
  const projects = useProjects((state) => state.projects);

  function addProjectHandler() {
    if (newText) {
      useProjects.setState((state) => ({
        ...state,
        projects: [
          ...projects,
          {
            id: randomUUID(),
            title: newText,
            column: [],
          },
        ],
      }));
      setNewText("");
      setAdd();
    } else {
      setIsEmpty(true);
    }
  }

  return (
    <Dialog open={useProjectMenu().Add} onOpenChange={setAdd}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Input
            type="text"
            value={newText}
            onChange={(e) => {
              if (isEmpty) setIsEmpty(false);
              setNewText(e.target.value);
            }}
            placeholder="Project name"
            className={
              isEmpty ? "border-destructive placeholder:text-destructive" : ""
            }
          />
        </DialogDescription>
        <DialogFooter>
          <Button
            onClick={() => (setNewText(""), setAdd())}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button onClick={addProjectHandler}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditProjectDialog() {
  const projects = useProjects((state) => state.projects);
  const [editText, setEditText] = useState("");

  function editProjectHandler() {
    if (editText) {
      useProjects.setState((state) => ({
        ...state,
        projects: projects.map((project) =>
          project.id === state.selectedProjectId
            ? { ...project, title: editText }
            : project,
        ),
        selectedProjectTitle: editText,
      }));
      setEditText("");
      setEdit();
    }
  }

  return (
    <Dialog open={useProjectMenu().Edit} onOpenChange={setEdit}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Input
            type="text"
            value={
              editText ||
              projects.find(
                (project) =>
                  project.id === useProjects.getState().selectedProjectId,
              )?.title
            }
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Project name"
          />
        </DialogDescription>
        <DialogFooter>
          <Button
            onClick={() => (setEditText(""), setEdit())}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button onClick={editProjectHandler}>Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProjectDialog() {
  const projects = useProjects((state) => state.projects);

  function deleteProjectHandler() {
    useProjects.setState((state) => ({
      ...state,
      projects: projects.filter(
        (project) => project.id !== state.selectedProjectId,
      ),
      selectedProjectId: undefined,
      selectedProjectTitle: undefined,
    }));
    setDelete();
  }

  return (
    <Dialog open={useProjectMenu().Delete} onOpenChange={setDelete}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this project?
        </DialogDescription>
        <DialogFooter>
          <Button onClick={() => setDelete()} variant="secondary">
            Cancel
          </Button>
          <Button onClick={deleteProjectHandler}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Project = {
  Combobox,
  Menu,
};

export default Project;
