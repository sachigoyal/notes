"use server"

import { db } from "@/db";
import { nodes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import JSZip from "jszip";
import { buildExportTree, addNodesToZip } from "@/lib/export-utils";

export const exportNotes = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const allNodes = await db
    .select()
    .from(nodes)
    .where(eq(nodes.userId, session.user.id));

  if (allNodes.length === 0) {
    throw new Error("No notes found");
  }

  const tree = buildExportTree(allNodes);

  const zip = new JSZip();
  
  zip.file("README.md", `# Notes Export

This folder contains your exported notes from Notes App.

Exported on: ${new Date().toISOString()}
Total items: ${allNodes.length}

## Structure
- Folders are preserved as directories
- Notes are exported as Markdown (.md) files
- Each note includes frontmatter with title and slug
`);
  
  addNodesToZip(zip, tree);

  const zipContent = await zip.generateAsync({
    type: "base64",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  return zipContent;
};
