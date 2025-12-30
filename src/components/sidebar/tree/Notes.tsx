import { File } from "@/components/ui/files";

export function Note({ name }: { name: string }) {
  return <File name={name} />
}
