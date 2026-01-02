"use client";

import { FolderWithActions } from "@/components/ui/files";
import type { FolderNode } from "@/lib/file-tree";
import { useSelection } from "@/lib/selection-context";
import { Note } from "./Notes";

export function NoteFolder({ node }: { node: FolderNode }) {
  const { selection, selectFolder } = useSelection();
  const isSelected = selection?.type === "folder" && selection.node.id === node.id;

  return (
    <FolderWithActions 
      id={node.id}
      name={node.name} 
      isSelected={isSelected} 
      onSelect={() => selectFolder(node)}
    >
      {node.children.map((child) =>
        child.type === "folder" ? (
          <NoteFolder key={child.id} node={child} />
        ) : (
          <Note key={child.id} node={child} />
        )
      )}
    </FolderWithActions>
  );
}
