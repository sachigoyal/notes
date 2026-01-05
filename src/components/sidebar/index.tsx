"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { FileActions } from "@/components/sidebar/actions";
import { FilesProvider, NewFileInput, NewFolderInput, type CreatingState } from "@/components/ui/files";
import { Note } from "./tree/Notes";
import { NoteFolder } from "./tree/NoteFolder";
import { createnote, createfolder, updateFolder, deletefolder, deletenote, updateNoteTitle } from "@/action/action";
import type { TreeNode, FolderNode, FileNode } from "@/lib/file-tree";
import { useSelection } from "@/lib/selection-context";
import { generateUniqueSlug } from "@/lib/utils";

interface AppSidebarProps {
  initialTree: TreeNode[];
}

export default function AppSidebar({ initialTree }: AppSidebarProps) {
  const [creatingState, setCreatingState] = useState<CreatingState>(null);
  const [tree, setTree] = useState<TreeNode[]>(initialTree);
  const { selection, selectFile, selectFolder, clearSelection } = useSelection();
  const router = useRouter();

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

  // Helper to update any node in the tree by ID
  const updateNodeInTree = useCallback((nodes: TreeNode[], nodeId: string, updates: Partial<FileNode>): TreeNode[] => {
    return nodes.map(node => {
      if (node.id === nodeId && node.type === "note") {
        return { ...node, ...updates } as FileNode;
      }
      if (node.type === "folder") {
        return {
          ...node,
          children: updateNodeInTree(node.children, nodeId, updates),
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

  // Helper to remove a file from the tree
  const removeFileFromTree = useCallback((nodes: TreeNode[], fileId: string): TreeNode[] => {
    return nodes
      .filter(node => !(node.type === "note" && node.id === fileId))
      .map(node => {
        if (node.type === "folder") {
          return {
            ...node,
            children: removeFileFromTree(node.children, fileId),
          };
        }
        return node;
      });
  }, []);

  // Helper to update a file in the tree
  const updateFileInTree = useCallback((nodes: TreeNode[], fileId: string, updates: Partial<FileNode>): TreeNode[] => {
    return nodes.map(node => {
      if (node.type === "note" && node.id === fileId) {
        return { ...node, ...updates } as FileNode;
      }
      if (node.type === "folder") {
        return {
          ...node,
          children: updateFileInTree(node.children, fileId, updates),
        };
      }
      return node;
    });
  }, []);

  // Helper to collect all slugs from the tree
  const collectSlugs = useCallback((nodes: TreeNode[]): Set<string> => {
    const slugs = new Set<string>();
    const traverse = (items: TreeNode[]) => {
      for (const node of items) {
        if (node.type === "note" && node.slug) {
          slugs.add(node.slug);
        }
        if (node.type === "folder") {
          traverse(node.children);
        }
      }
    };
    traverse(nodes);
    return slugs;
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
    // Generate unique slug client-side for optimistic update
    const existingSlugs = collectSlugs(tree);
    const tempSlug = generateUniqueSlug(name, existingSlugs);
    const tempId = crypto.randomUUID();
    
    // Optimistic update
    const newNote: FileNode = {
      id: tempId,
      type: "note",
      title: name,
      slug: tempSlug,
      content: null,
      parentId,
      createdAt: new Date(),
    };
    setTree(prev => addNodeToTree(prev, newNote, parentId));
    setCreatingState(null);
    
    // Auto-select the new file
    selectFile(newNote);
    
    // Server action - returns real ID and slug
    const result = await createnote(name, tempSlug, "", parentId);
    
    // Update tree with real ID and slug
    const updatedNote: FileNode = {
      ...newNote,
      id: result.id,
      slug: result.slug,
    };
    setTree(prev => updateNodeInTree(prev, tempId, { 
      id: result.id, 
      slug: result.slug 
    }));
    
    // Update selection with real data
    selectFile(updatedNote);
    
    // Navigate to the new note
    router.push(`/notes/${result.slug}`);
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
    
    // Auto-select the new folder
    selectFolder(newFolder);
    
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
    // Clear selection if deleting the selected folder
    if (selection?.type === "folder" && selection.node.id === id) {
      clearSelection();
    }
    
    // Optimistic update
    setTree(prev => removeFolderFromTree(prev, id));
    
    // Server action
    await deletefolder(id);
  };

  const handleRenameFile = async (id: string, newName: string) => {
    // Find the current file's slug to exclude it from uniqueness check
    const findSlugById = (nodes: TreeNode[]): string | undefined => {
      for (const node of nodes) {
        if (node.type === "note" && node.id === id) return node.slug ?? undefined;
        if (node.type === "folder") {
          const found = findSlugById(node.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    const currentSlug = findSlugById(tree);
    
    // Generate unique slug, excluding the current slug
    const existingSlugs = collectSlugs(tree);
    const newSlug = generateUniqueSlug(newName, existingSlugs, currentSlug);
    
    // Optimistic update
    setTree(prev => updateFileInTree(prev, id, { title: newName, slug: newSlug }));
    
    // Server action
    await updateNoteTitle(id, newName, newSlug);
  };

  const handleDeleteFile = async (id: string) => {
    // Clear selection if deleting the selected file
    if (selection?.type === "file" && selection.node.id === id) {
      clearSelection();
      router.push("/");
    }
    
    // Optimistic update
    setTree(prev => removeFileFromTree(prev, id));
    
    // Server action
    await deletenote(id);
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
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
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
