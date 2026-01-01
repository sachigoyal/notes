"use client"

import { Button } from "@/components/ui/button";
import { FilePlusCorner, FolderPlus } from "lucide-react";

type FileActionsProps = {
  onCreateFileClick: () => void;
  onCreateFolderClick: () => void;
};

export function FileActions({ onCreateFileClick, onCreateFolderClick }: FileActionsProps) {
  return (
    <div className="flex items-center">
      <Button variant="ghost" size="icon-sm" className="cursor-pointer" onClick={onCreateFileClick}>
        <FilePlusCorner />
      </Button>
      <Button variant="ghost" size="icon-sm" className="cursor-pointer" onClick={onCreateFolderClick}>
        <FolderPlus />
      </Button>
    </div>
  )
}