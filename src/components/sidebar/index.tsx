import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { FileActions } from "@/components/sidebar/actions";
import { Files } from "@/components/ui/files";
import { Note } from "./tree/Notes";
import { NoteFolder } from "./tree/NoteFolder";

export default function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas" position="static">
      <SidebarContent>
        <div className="flex items-center w-full justify-between py-1.5 px-3 border-b">
          <span className="text-sm">Notes</span>
          <FileActions />
        </div>
        <div className="p-1">
          <Files defaultValue="src/notes">
            <Note name="Meeting Notes.md" />
            <Note name="Project Ideas.md" />
            <Note name="Todo List.md" />
            <Note name="Research.md" />
            <NoteFolder name="Work">
              <Note name="Quarterly Goals.md" />
              <Note name="Team Updates.md" />
            </NoteFolder>
            <NoteFolder name="Personal">
              <Note name="Book Recommendations.md" />
              <Note name="Travel Plans.md" />
            </NoteFolder>
          </Files>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
