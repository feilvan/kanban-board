import { randomBytes } from "crypto";
import { create } from "zustand";

import { Project } from "@/types";

export function randomUUID() {
  return randomBytes(16).toString("hex");
}

type ProjectsState = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  selectedProjectId?: string;
  setSelectedProjectId: (id: string) => void;
};

export const useProjects = create<ProjectsState>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects: projects }),
  selectedProjectId: undefined,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
}));

export const initData: Project[] = [
  {
    id: randomUUID(),
    title: "Project 1",
    column: [
      {
        id: randomUUID(),
        title: "Column 1",
        item: [
          {
            id: randomUUID(),
            title: "Item 1",
          },
          {
            id: randomUUID(),
            title: "Item 2",
          },
        ],
      },
      {
        id: randomUUID(),
        title: "Column 2",
        item: [
          {
            id: randomUUID(),
            title: "Item 3",
          },
          {
            id: randomUUID(),
            title: "Item 4",
          },
        ],
      },
    ],
  },
  {
    id: randomUUID(),
    title: "Project 2",
    column: [
      {
        id: randomUUID(),
        title: "Column 3",
        item: [
          {
            id: randomUUID(),
            title: "Item 5",
          },
          {
            id: randomUUID(),
            title: "Item 6",
          },
        ],
      },
      {
        id: randomUUID(),
        title: "Column 4",
        item: [
          {
            id: randomUUID(),
            title: "Item 7",
          },
          {
            id: randomUUID(),
            title: "Item 8",
          },
        ],
      },
    ],
  },
];