import { db } from "@/db";
import { notes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export const createnote = async (title: string, content: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  await db.insert(notes).values({
    id: nanoid(),
    title,
    content,
    userId: session.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    .update(notes)
    .set({
      title,
      content,
    })
    .where(eq(notes.id, id));
};
