"use client";

import { useState } from "react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { FileActions } from "@/components/sidebar/actions";
import { Files, NewFileInput, NewFolderInput } from "@/components/ui/files";
import { Note } from "./tree/Notes";
import { NoteFolder } from "./tree/NoteFolder";
import { createnote, createfolder } from "@/action/action";
import type { TreeNode } from "@/lib/file-tree";

interface AppSidebarProps {
  initialTree: TreeNode[];
}

export default function AppSidebar({ initialTree }: AppSidebarProps) {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [tree, setTree] = useState<TreeNode[]>(initialTree);

  const handleCreateFileClick = () => {
    setIsCreatingFile(true);
    setIsCreatingFolder(false);
  };

  const handleCreateFolderClick = () => {
    setIsCreatingFolder(true);
    setIsCreatingFile(false);
  };

  const handleFileSubmit = async (name: string) => {
    await createnote(name, "", null);
    // Add the new note to the tree optimistically
    const newNote: TreeNode = {
      id: crypto.randomUUID(),
      type: "note",
      title: name,
      slug: null,
      content: null,
      parentId: null,
    };
    setTree((prev) => [...prev, newNote]);
    setIsCreatingFile(false);
  };

  const handleFolderSubmit = async (name: string) => {
    await createfolder(name, null);
    // Add the new folder to the tree optimistically
    const newFolder: TreeNode = {
      id: crypto.randomUUID(),
      type: "folder",
      name: name,
      parentId: null,
      children: [],
    };
    setTree((prev) => [...prev, newFolder]);
    setIsCreatingFolder(false);
  };

  const handleFileCancel = () => {
    setIsCreatingFile(false);
  };

  const handleFolderCancel = () => {
    setIsCreatingFolder(false);
  };

  return (
    <Sidebar collapsible="offcanvas" position="static">
      <SidebarContent>
        <div className="flex items-center w-full justify-between py-1.5 px-3 border-b">
          <span className="text-sm">Notes</span>
          <FileActions
            onCreateFileClick={handleCreateFileClick}
            onCreateFolderClick={handleCreateFolderClick}
          />
        </div>
        <div className="p-1">
          <Files defaultValue="src/notes">
            {isCreatingFile && (
              <NewFileInput
                onSubmit={handleFileSubmit}
                onCancel={handleFileCancel}
              />
            )}
            {isCreatingFolder && (
              <NewFolderInput
                onSubmit={handleFolderSubmit}
                onCancel={handleFolderCancel}
              />
            )}
            {tree.map((node) =>
              node.type === "folder" ? (
                <NoteFolder key={node.id} node={node} />
              ) : (
                <Note key={node.id} node={node} />
              )
            )}
          </Files>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
