import { getNodes } from "@/action/action";
import { buildFileTree } from "@/lib/file-tree";
import AppSidebar from "./index";

export async function SidebarWrapper() {
  const tree = await buildFileTree(getNodes);

  return <AppSidebar initialTree={tree} />;
}
