import type { Node } from "@/db/schema";

export type FileNode = {
  id: string;
  type: "note";
  title: string;
  slug: string | null;
  content: string | null;
  parentId: string | null;
  createdAt: Date;
};

export type FolderNode = {
  id: string;
  type: "folder";
  name: string;
  parentId: string | null;
  children: TreeNode[];
  createdAt: Date;
};

export type TreeNode = FileNode | FolderNode;

export async function buildFileTree(
  getData: () => Promise<Node[]>
): Promise<TreeNode[]> {
  const flatNodes = await getData();

  const nodeMap = new Map<string, TreeNode>();
  
  for (const node of flatNodes) {
    if (node.type === "folder") {
      nodeMap.set(node.id, {
        id: node.id,
        type: "folder",
        name: node.name ?? "Untitled Folder",
        parentId: node.parentId,
        children: [],
        createdAt: node.createdAt,
      });
    } else {
      nodeMap.set(node.id, {
        id: node.id,
        type: "note",
        title: node.title ?? "Untitled",
        slug: node.slug,
        content: node.content,
        parentId: node.parentId,
        createdAt: node.createdAt,
      });
    }
  }

  const rootNodes: TreeNode[] = [];

  for (const node of nodeMap.values()) {
    if (node.parentId === null) {
      // Root level node
      rootNodes.push(node);
    } else {
      // Child node - find parent and add to its children
      const parent = nodeMap.get(node.parentId);
      if (parent && parent.type === "folder") {
        parent.children.push(node);
      } else {
        // If parent doesn't exist or isn't a folder, treat as root
        rootNodes.push(node);
      }
    }
  }

  // Sort nodes alphabetically: folders first, then files, both alphabetically
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.sort((a, b) => {
      // Folders come before files
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;
      
      // Both same type: sort alphabetically
      const nameA = a.type === "folder" ? a.name.toLowerCase() : a.title.toLowerCase();
      const nameB = b.type === "folder" ? b.name.toLowerCase() : b.title.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  };

  // Recursively sort all children
  const sortTree = (nodes: TreeNode[]): TreeNode[] => {
    const sorted = sortNodes(nodes);
    for (const node of sorted) {
      if (node.type === "folder" && node.children.length > 0) {
        node.children = sortTree(node.children);
      }
    }
    return sorted;
  };

  return sortTree(rootNodes);
}

export function isFolder(node: TreeNode): node is FolderNode {
  return node.type === "folder";
}

export function isFile(node: TreeNode): node is FileNode {
  return node.type === "note";
}

