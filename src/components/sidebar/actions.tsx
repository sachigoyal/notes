"use client"

import { Button } from "@/components/ui/button";
import { FilePlusCorner, FolderPlus } from "lucide-react";

export function FileActions() {
  return (
    <div className="flex items-center">
      <Button variant="ghost" size="icon-sm" className="cursor-pointer">
        <FilePlusCorner />
      </Button>
      <Button variant="ghost" size="icon-sm" className="cursor-pointer">
        <FolderPlus />
      </Button>
    </div>
  )
}