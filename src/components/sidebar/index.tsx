"use client"

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { FileActions } from "@/components/sidebar/actions";
import { Files, NewFileInput, NewFolderInput } from "@/components/ui/files";
import { Note } from "./tree/Notes";
import { NoteFolder } from "./tree/NoteFolder";
import { createnote, createfolder } from "@/action/action";

export default function AppSidebar() {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);

  const handleCreateFileClick = () => {
    setIsCreatingFile(true);
    setIsCreatingFolder(false);
  };

  const handleCreateFolderClick = () => {
    setIsCreatingFolder(true);
    setIsCreatingFile(false);
  };

  const handleFileSubmit = async (name: string) => {
    console.log("Creating note:", name);
    setNotes((prev) => [...prev, name]);
    setIsCreatingFile(false);
    await createnote(name, "", null);
  };

  const handleFolderSubmit = async (name: string) => {
    console.log("Creating folder:", name);
    setFolders((prev) => [...prev, name]);
    setIsCreatingFolder(false);
    await createfolder(name, null);
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
          <FileActions onCreateFileClick={handleCreateFileClick} onCreateFolderClick={handleCreateFolderClick} />
        </div>
        <div className="p-1">
          <Files defaultValue="src/notes">
            {isCreatingFile && (
              <NewFileInput onSubmit={handleFileSubmit} onCancel={handleFileCancel} />
            )}
            {isCreatingFolder && (
              <NewFolderInput onSubmit={handleFolderSubmit} onCancel={handleFolderCancel} />
            )}
            {notes.map((name) => (
              <Note key={name} name={name} />
            ))}
            {folders.map((name) => (
              <NoteFolder key={name} name={name}>
                {null}
              </NoteFolder>
            ))}
            <Note name="Meeting Notes.md" />
            <Note name="Project Ideas.md" />
            <Note name="Todo List.md" />
            <Note name="Research.md" />
            <NoteFolder name="Work">
              <Note name="Quarterly Goals.md" />
              <Note name="Team Updates.md" />
            </NoteFolder>
            <NoteFolder name="Personal">
              <Note name="Book Recommendations.md" />
              <Note name="Travel Plans.md" />
            </NoteFolder>
          </Files>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
