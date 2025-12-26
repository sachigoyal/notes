import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 relative hidden md:block">
        <Image src="/land.avif" alt="landing" fill className="object-cover" quality={100} priority fetchPriority="high" />
      </div>
      <div className="flex-1 flex items-center justify-center flex-col">
        {children}
      </div>
    </div>
  );
}