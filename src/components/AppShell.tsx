import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileNav />

      <div className="md:pl-64">
        <main className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-6 md:pt-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
