"use client"

import { User, LogOut, LogIn } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "@/lib/auth-client"

export function ProfileDropdown() {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <Button variant="outline" size="icon" asChild>
        <Link href="/login">
          <LogIn className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Login</span>
        </Link>
      </Button>
    )
  }

  const { name, image } = session.user

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name || "Profile"}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Profile</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
