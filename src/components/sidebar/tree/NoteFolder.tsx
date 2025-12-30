import { Folder } from "@/components/ui/files";

export function NoteFolder({ name, children }: { name: string, children: React.ReactNode }) {
  return <Folder name={name}>{children}</Folder>
}
