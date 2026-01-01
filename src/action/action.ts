"use server"

import { db } from "@/db";
import { nodes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
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
