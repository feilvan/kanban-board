interface Project {
  id: string;
  title: string;
  column: Column[];
}

interface Column {
  id: string;
  title: string;
  item: Item[];
}

interface Item {
  id: string;
  title: string;
}

export type { Column, Item, Project };
