import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarWrapper } from "@/components/sidebar/sidebar-wrapper";
import { Navbar } from "@/components/navbar";
import { SelectionProvider } from "@/lib/selection-context";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SelectionProvider>
      <SidebarProvider>
        <section className="flex flex-col w-full h-screen">
          <Navbar />
          <div className="flex flex-1 min-h-0 w-full">
            <SidebarWrapper />
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        </section>
      </SidebarProvider>
    </SelectionProvider>
  );
}
