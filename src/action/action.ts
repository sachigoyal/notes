"use server"

import { db } from "@/db";
import { nodes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";

export const createnote = async (title: string, content: string, parentId: string | null) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  await db.insert(nodes).values({
    type: "note",
    title,
    slug: slugify(title),
    content,
    userId: session.user.id,
    parentId,
  });
};

export const createfolder = async (name: string, parentId: string | null) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  await db.insert(nodes).values({
    type: "folder",
    name,
    userId: session.user.id,
    parentId,
  });
};

export const updatenote = async (
  id: string,
  title: string,
  content: string
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  await db
    .update(nodes)
    .set({
      title,
      content,
    })
    .where(eq(nodes.id, id));
};

export const updateNoteContent = async (id: string, content: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  await db
    .update(nodes)
    .set({ content })
    .where(eq(nodes.id, id));
};

const updateFolder = async (id: string, name: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  await db
    .update(nodes)
    .set({
      name,
    })
    .where(eq(nodes.id, id));
};

export const deletenote = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  await db.delete(nodes).where(and(eq(nodes.id, id), eq(nodes.type, "note")));
};

export const deletefolder = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  await db.delete(nodes).where(and(eq(nodes.id, id), eq(nodes.type, "folder")));
};

export const getNodes = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return await db.select().from(nodes).where(eq(nodes.userId, session.user.id));
};