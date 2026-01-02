"use client";

import { File } from "@/components/ui/files";
import type { FileNode } from "@/lib/file-tree";
import { useSelection } from "@/lib/selection-context";

export function Note({ node }: { node: FileNode }) {
  const { selection, selectFile } = useSelection();
  const isSelected = selection?.type === "file" && selection.node.id === node.id;

  return (
    <File
      name={node.title}
      isSelected={isSelected}
      onClick={() => selectFile(node)}
    />
  );
}
