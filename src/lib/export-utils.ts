import JSZip from "jszip";
import TurndownService from "turndown";
import { nodes } from "@/db/schema";

export interface ExportTreeNode {
  id: string;
  type: "folder" | "note";
  name: string | null;
  title: string | null;
  slug: string | null;
  content: string | null;
  parentId: string | null;
  children: ExportTreeNode[];
}

// Convert HTML to Markdown
export function htmlToMarkdown(html: string | null): string {
  if (!html) return "";
  
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  
  // Add custom rules for better formatting
  turndownService.addRule("taskList", {
    filter: (node) => {
      return (
        node.nodeName === "LI" &&
        node.parentNode?.nodeName === "UL" &&
        (node as HTMLElement).hasAttribute("data-checked")
      );
    },
    replacement: (content, node) => {
      const isChecked = (node as HTMLElement).getAttribute("data-checked") === "true";
      return `- [${isChecked ? "x" : " "}] ${content.trim()}\n`;
    },
  });
  
  return turndownService.turndown(html);
}

// Build tree structure from flat nodes
export function buildExportTree(flatNodes: typeof nodes.$inferSelect[]): ExportTreeNode[] {
  const nodeMap = new Map<string, ExportTreeNode>();
  const rootNodes: ExportTreeNode[] = [];
  
  // First pass: create all nodes
  for (const node of flatNodes) {
    nodeMap.set(node.id, {
      id: node.id,
      type: node.type,
      name: node.name,
      title: node.title,
      slug: node.slug,
      content: node.content,
      parentId: node.parentId,
      children: [],
    });
  }
  
  // Second pass: build the tree
  for (const node of flatNodes) {
    const treeNode = nodeMap.get(node.id)!;
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(treeNode);
    } else {
      rootNodes.push(treeNode);
    }
  }
  
  return rootNodes;
}

// Sanitize filename to be filesystem-safe
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 100);
}

// Recursively add nodes to zip
export function addNodesToZip(zip: JSZip, nodes: ExportTreeNode[], path: string = "") {
  for (const node of nodes) {
    if (node.type === "folder") {
      const folderName = sanitizeFilename(node.name || "Untitled_Folder");
      const folderPath = path ? `${path}/${folderName}` : folderName;
      const folder = zip.folder(folderPath);
      
      if (folder && node.children.length > 0) {
        addNodesToZip(zip, node.children, folderPath);
      }
    } else {
      const fileName = sanitizeFilename(node.title || "Untitled") + ".md";
      const filePath = path ? `${path}/${fileName}` : fileName;
      
      // Convert content to markdown
      const markdownContent = htmlToMarkdown(node.content);
      
      // Add frontmatter with metadata
      const fullContent = `---
title: "${node.title || "Untitled"}"
slug: "${node.slug || ""}"
---

${markdownContent}`;
      
      zip.file(filePath, fullContent);
    }
  }
}
