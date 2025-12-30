"use client"

import { ModeToggle } from "@/components/theme/toggler"
import { ProfileDropdown } from "@/components/user/profile"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Navbar() {
  return (
    <div className="w-full px-3 py-2 border-b flex items-center justify-between">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <ModeToggle />
        <ProfileDropdown />
      </div>
    </div>
  )
}
