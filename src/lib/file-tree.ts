import type { Node } from "@/db/schema";

export type FileNode = {
  id: string;
  type: "note";
  title: string;
  slug: string | null;
  content: string | null;
  parentId: string | null;
};

export type FolderNode = {
  id: string;
  type: "folder";
  name: string;
  parentId: string | null;
  children: TreeNode[];
};

export type TreeNode = FileNode | FolderNode;

/**
 * Builds a hierarchical file tree structure from flat node data.
 * 
 * @param getData - An async function that fetches flat node data
 * @returns A promise that resolves to an array of root-level TreeNodes
 * 
 * @example
 * const tree = await buildFileTree(async () => {
 *   return await db.select().from(nodes).where(eq(nodes.userId, userId));
 * });
 */
export async function buildFileTree(
  getData: () => Promise<Node[]>
): Promise<TreeNode[]> {
  const flatNodes = await getData();

  // Create a map for quick lookup
  const nodeMap = new Map<string, TreeNode>();
  
  // First pass: create all nodes
  for (const node of flatNodes) {
    if (node.type === "folder") {
      nodeMap.set(node.id, {
        id: node.id,
        type: "folder",
        name: node.name ?? "Untitled Folder",
        parentId: node.parentId,
        children: [],
      });
    } else {
      nodeMap.set(node.id, {
        id: node.id,
        type: "note",
        title: node.title ?? "Untitled",
        slug: node.slug,
        content: node.content,
        parentId: node.parentId,
      });
    }
  }

  console.log(nodeMap);

  // Second pass: build the tree structure
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

  console.log(rootNodes);

  // Sort nodes: folders first, then files, alphabetically within each group
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.sort((a, b) => {
      // Folders come before files
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;

      // Alphabetical sort within same type
      const aName = a.type === "folder" ? a.name : a.title;
      const bName = b.type === "folder" ? b.name : b.title;
      return aName.localeCompare(bName);
    });
  };

  console.log(sortNodes(rootNodes));

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

  console.log(sortTree(rootNodes));

  return sortTree(rootNodes);
}

/**
 * Type guard to check if a TreeNode is a FolderNode
 */
export function isFolder(node: TreeNode): node is FolderNode {
  return node.type === "folder";
}

/**
 * Type guard to check if a TreeNode is a FileNode
 */
export function isFile(node: TreeNode): node is FileNode {
  return node.type === "note";
}

