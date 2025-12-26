"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const newNote = async () => {
    if (!session) {
      router.push("/login");
    } else {
      router.push("/new");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <Button className="top-3 right-5 absolute rounded-none cursor-pointer" onClick={() => newNote()}>
          <Plus className="size-4" /> New
        </Button>
      </div>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
}
