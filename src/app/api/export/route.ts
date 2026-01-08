import { NextResponse } from "next/server";
import { db } from "@/db";
import { nodes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import JSZip from "jszip";
import TurndownService from "turndown";

interface TreeNode {
  id: string;
  type: "folder" | "note";
  name: string | null;
  title: string | null;
  slug: string | null;
  content: string | null;
  parentId: string | null;
  children: TreeNode[];
}

// Convert HTML to Markdown
function htmlToMarkdown(html: string | null): string {
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
function buildTree(flatNodes: typeof nodes.$inferSelect[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];
  
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
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 100);
}

// Recursively add nodes to zip
function addNodesToZip(zip: JSZip, nodes: TreeNode[], path: string = "") {
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

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all nodes for the user
    const allNodes = await db
      .select()
      .from(nodes)
      .where(eq(nodes.userId, session.user.id));

    if (allNodes.length === 0) {
      return NextResponse.json({ error: "No notes found" }, { status: 404 });
    }

    // Build tree structure
    const tree = buildTree(allNodes);

    // Create ZIP file
    const zip = new JSZip();
    
    // Add a README
    zip.file("README.md", `# Notes Export

This folder contains your exported notes from Notes App.

Exported on: ${new Date().toISOString()}
Total items: ${allNodes.length}

## Structure
- Folders are preserved as directories
- Notes are exported as Markdown (.md) files
- Each note includes frontmatter with title and slug
`);
    
    // Add all nodes to zip
    addNodesToZip(zip, tree);

    // Generate the zip file as a node buffer
    const zipContent = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    // Return the ZIP file
    return new NextResponse(Buffer.from(zipContent), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="notes-export-${new Date().toISOString().split("T")[0]}.zip"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export notes" },
      { status: 500 }
    );
  }
}
