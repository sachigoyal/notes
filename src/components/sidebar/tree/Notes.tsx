"use client";

import { FileWithActions } from "@/components/ui/files";
import type { FileNode } from "@/lib/file-tree";
import { useSelection } from "@/lib/selection-context";

export function Note({ node }: { node: FileNode }) {
  const { selection, selectFile } = useSelection();
  const isSelected = selection?.type === "file" && selection.node.id === node.id;

  // Use slug if available, otherwise use id
  const href = node.slug ? `/notes/${node.slug}` : `/notes/${node.id}`;

  return (
    <FileWithActions
      id={node.id}
      name={node.title}
      href={href}
      isSelected={isSelected}
      onClick={() => selectFile(node)}
    />
  );
}
