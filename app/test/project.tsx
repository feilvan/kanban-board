"use client";

import { PopoverClose } from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils";

import { randomUUID, useProjects } from "./data";

function Combobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
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
          {value || "Select project..."}
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
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    useProjects.setState((state) => ({
                      ...state,
                      selectedProjectId: project.id,
                    }));
                    setOpen(false);
                  }}
                >
                  {project.title}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === project.title ? "opacity-100" : "opacity-0",
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

function AddProject() {
  const [newText, setNewText] = useState("");
  const projects = useProjects((state) => state.projects);

  function handleAddProject() {
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
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex p-1">
        <Input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="New item"
        />
        <PopoverClose asChild className="flex-grow">
          <Button onClick={handleAddProject} size="icon">
            <Plus />
          </Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

const Project = {
  Combobox,
  AddProject,
};

export default Project;
