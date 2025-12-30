import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { Navbar } from "@/components/navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <section className="flex flex-col w-full h-screen">
        <Navbar />
        <div className="flex flex-1 min-h-0 w-full">
          <AppSidebar />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </section>
    </SidebarProvider>
  )
}
