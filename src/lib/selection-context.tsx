"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { FileNode, FolderNode } from "./file-tree";

type Selection =
  | { type: "file"; node: FileNode }
  | { type: "folder"; node: FolderNode }
  | null;

type SelectionContextValue = {
  selection: Selection;
  selectFile: (node: FileNode) => void;
  selectFolder: (node: FolderNode) => void;
  clearSelection: () => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection>(null);

  const selectFile = (node: FileNode) => {
    setSelection({ type: "file", node });
  };

  const selectFolder = (node: FolderNode) => {
    setSelection({ type: "folder", node });
  };

  const clearSelection = () => {
    setSelection(null);
  };

  return (
    <SelectionContext.Provider
      value={{ selection, selectFile, selectFolder, clearSelection }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
}

