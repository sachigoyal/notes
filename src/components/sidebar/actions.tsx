"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePlusCorner, FolderPlus, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

type FileActionsProps = {
  onCreateFileClick: () => void;
  onCreateFolderClick: () => void;
};

export function FileActions({ onCreateFileClick, onCreateFolderClick }: FileActionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.info("Preparing your export...");

      const response = await fetch("/api/export");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export");
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `notes-export-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Notes exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export notes");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center">
      <Button variant="ghost" size="icon-sm" className="cursor-pointer" onClick={onCreateFileClick}>
        <FilePlusCorner />
      </Button>
      <Button variant="ghost" size="icon-sm" className="cursor-pointer" onClick={onCreateFolderClick}>
        <FolderPlus />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="cursor-pointer"
        onClick={handleExport}
        disabled={isExporting}
        title="Export all notes as ZIP"
      >
        {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
      </Button>
    </div>
  )
}
