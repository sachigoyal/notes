"use client"

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import Sidebar1 from "@/components/app-sidebar"

export default function NewNote() {
  return(
   <div className="flex">
    <SimpleEditor />
   </div>
  )
}
