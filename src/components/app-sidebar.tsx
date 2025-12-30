import {
  FilePlusCorner,
  FolderPlus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";


export default function AppSidebar() {
  return (
    <Sidebar className="">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center w-full justify-between">
              <span className="text-sm">Notes</span>
              <div className="flex items-center">
                <Button variant="ghost" size="icon-sm" className="cursor-pointer">
                  <FilePlusCorner />
                </Button>
                <Button variant="ghost" size="icon-sm" className="cursor-pointer">
                  <FolderPlus />
                </Button>
              </div>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
