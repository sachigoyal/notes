import { notFound } from "next/navigation";
import { getNoteBySlug, getNoteById } from "@/action/action";
import { NoteEditor } from "@/components/tiptap-templates/simple/note-editor";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  
  // Try to find by slug first, then by id
  let note = await getNoteBySlug(slug);
  
  if (!note) {
    // Slug might be an ID (for notes without slugs)
    note = await getNoteById(slug);
  }

  if (!note) {
    notFound();
  }

  return (
    <div className="w-full h-full flex justify-center">
      <NoteEditor 
        id={note.id}
        title={note.title ?? "Untitled"}
        content={note.content ?? ""}
      />
    </div>
  );
}
