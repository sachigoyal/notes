"use client";

import { useState, useCallback } from "react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { FileActions } from "@/components/sidebar/actions";
import { FilesProvider, NewFileInput, NewFolderInput, type CreatingState } from "@/components/ui/files";
import { Note } from "./tree/Notes";
import { NoteFolder } from "./tree/NoteFolder";
import { createnote, createfolder, updateFolder, deletefolder } from "@/action/action";
import type { TreeNode, FolderNode, FileNode } from "@/lib/file-tree";
import { useSelection } from "@/lib/selection-context";

interface AppSidebarProps {
  initialTree: TreeNode[];
}

export default function AppSidebar({ initialTree }: AppSidebarProps) {
  const [creatingState, setCreatingState] = useState<CreatingState>(null);
  const [tree, setTree] = useState<TreeNode[]>(initialTree);
  const { selection } = useSelection();

  // Helper to add a node to the tree at the right location
  const addNodeToTree = useCallback((nodes: TreeNode[], newNode: TreeNode, parentId: string | null): TreeNode[] => {
    if (parentId === null) {
      return [newNode, ...nodes];
    }
    
    return nodes.map(node => {
      if (node.type === "folder" && node.id === parentId) {
        return {
          ...node,
          children: [newNode, ...node.children],
        };
      }
      if (node.type === "folder") {
        return {
          ...node,
          children: addNodeToTree(node.children, newNode, parentId),
        };
      }
      return node;
    });
  }, []);

  // Helper to update a folder in the tree
  const updateFolderInTree = useCallback((nodes: TreeNode[], folderId: string, newName: string): TreeNode[] => {
    return nodes.map(node => {
      if (node.type === "folder" && node.id === folderId) {
        return { ...node, name: newName };
      }
      if (node.type === "folder") {
        return {
          ...node,
          children: updateFolderInTree(node.children, folderId, newName),
        };
      }
      return node;
    });
  }, []);

  // Helper to remove a folder from the tree
  const removeFolderFromTree = useCallback((nodes: TreeNode[], folderId: string): TreeNode[] => {
    return nodes
      .filter(node => !(node.type === "folder" && node.id === folderId))
      .map(node => {
        if (node.type === "folder") {
          return {
            ...node,
            children: removeFolderFromTree(node.children, folderId),
          };
        }
        return node;
      });
  }, []);

  // Determine the target parent for new items based on selection
  const getTargetParentId = useCallback((): string | null => {
    if (!selection) return null;
    
    if (selection.type === "folder") {
      return selection.node.id;
    }
    
    // If a file is selected, create in its parent folder
    if (selection.type === "file") {
      return selection.node.parentId;
    }
    
    return null;
  }, [selection]);

  const handleCreateFileClick = () => {
    const parentId = getTargetParentId();
    setCreatingState({ type: "file", parentId });
  };

  const handleCreateFolderClick = () => {
    const parentId = getTargetParentId();
    setCreatingState({ type: "folder", parentId });
  };

  const handleCreateFile = async (name: string, parentId: string | null) => {
    // Optimistic update
    const newNote: FileNode = {
      id: crypto.randomUUID(),
      type: "note",
      title: name,
      slug: null,
      content: null,
      parentId,
      createdAt: new Date(),
    };
    setTree(prev => addNodeToTree(prev, newNote, parentId));
    setCreatingState(null);
    
    // Server action
    await createnote(name, "", parentId);
  };

  const handleCreateFolder = async (name: string, parentId: string | null) => {
    // Optimistic update
    const newFolder: FolderNode = {
      id: crypto.randomUUID(),
      type: "folder",
      name: name,
      parentId,
      children: [],
      createdAt: new Date(),
    };
    setTree(prev => addNodeToTree(prev, newFolder, parentId));
    setCreatingState(null);
    
    // Server action
    await createfolder(name, parentId);
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    // Optimistic update
    setTree(prev => updateFolderInTree(prev, id, newName));
    
    // Server action
    await updateFolder(id, newName);
  };

  const handleDeleteFolder = async (id: string) => {
    // Optimistic update
    setTree(prev => removeFolderFromTree(prev, id));
    
    // Server action
    await deletefolder(id);
  };

  const handleCancel = () => {
    setCreatingState(null);
  };

  // Check if we're creating at root level
  const isCreatingAtRoot = creatingState?.parentId === null;
  const isCreatingFileAtRoot = isCreatingAtRoot && creatingState?.type === "file";
  const isCreatingFolderAtRoot = isCreatingAtRoot && creatingState?.type === "folder";

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
          <FilesProvider
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            creatingState={creatingState}
            setCreatingState={setCreatingState}
          >
            {isCreatingFileAtRoot && (
              <NewFileInput
                onSubmit={(name) => handleCreateFile(name, null)}
                onCancel={handleCancel}
              />
            )}
            {isCreatingFolderAtRoot && (
              <NewFolderInput
                onSubmit={(name) => handleCreateFolder(name, null)}
                onCancel={handleCancel}
              />
            )}
            {tree.map((node) =>
              node.type === "folder" ? (
                <NoteFolder key={node.id} node={node} />
              ) : (
                <Note key={node.id} node={node} />
              )
            )}
          </FilesProvider>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
