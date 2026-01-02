"use client";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useSelection } from "@/lib/selection-context";
import { FolderIcon } from "lucide-react";

export default function Home() {
  const { selection } = useSelection();

  // Show folder message when a folder is selected
  if (selection?.type === "folder") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <FolderIcon className="h-16 w-16" />
        <div className="text-center">
          <h2 className="text-lg font-medium text-foreground">{selection.node.name}</h2>
          <p className="text-sm mt-1">Folders cannot store content. Select a file to start editing.</p>
        </div>
      </div>
    );
  }

  // Show editor when a file is selected
  if (selection?.type === "file") {
    return (
      <div className="w-full h-full">
        <SimpleEditor />
      </div>
    );
  }

  // Default: prompt user to select something
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
      <p className="text-sm">Select a file from the sidebar to start editing</p>
    </div>
  );
}