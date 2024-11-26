"use client";

import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import Column from "./column";
import { useColumns } from "./column";
import { initData, useProjects } from "./data";
import Project from "./project";

export default function Page() {
  const projects = useProjects((state) => state.projects);
  const selectedProjectId = useProjects((state) => state.selectedProjectId);
  useEffect(() => {
    console.log("projects", projects);
  }, [projects]);

  const activeId = useColumns((state) => state.activeId);
  const overId = useColumns((state) => state.overId);
  const isActiveColumn = useColumns((state) => state.isActiveColumn);

  function resetProjects() {
    useProjects.setState((state) => ({
      ...state,
      projects: initData,
    }));
    console.log("reset projects");
  }

  return (
    <div className="my-6 space-y-2">
      <span className="font-semibold tracking-tight">Testing Ground</span>
      <div className="space-x-1 space-y-2">
        <Project.Combobox />
        <Project.AddProject />
        <Button variant="outline" onClick={resetProjects}>
          <RefreshCw />
          Reset
        </Button>
        <Column.Columns
          project={projects.find((project) => project.id === selectedProjectId)}
        />
      </div>
      <div>Active ID: {activeId}</div>
      <div>Over ID: {overId}</div>
      <div>Is Active Column?: {String(isActiveColumn)}</div>
    </div>
  );
}
