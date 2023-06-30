import Link from "next/link";
import { Button } from "../ui/button";
import { SidebarNav } from "./sidebar-nav";

const sidebarNavItems = [
  {
    title: "profile",
    href: "/settings",
  },
  {
    title: "account",
    href: "/settings/account",
  },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className=" flex min-h-screen w-full flex-col">
      <div className="border-b p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-semibold">settings</h1>
          <Link href="/">
            <Button variant="link" size="sm">
              back to dashboard
            </Button>
          </Link>
        </div>
      </div>
      <div className="mb-8 flex min-h-full flex-1">
        <div className="mx-auto flex min-h-full max-w-7xl flex-1 flex-col space-y-8 p-4 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="min-h-full lg:w-1/6">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="min-h-full flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
    </main>
  );
  return (
    <main className="flex min-h-screen w-full flex-col">
      <div className="border-b p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-semibold">settings</h1>
          <Link href="/">
            <Button variant="link" size="sm">
              back to dashboard
            </Button>
          </Link>
        </div>
      </div>
      <div className="min-h-full w-full flex-1">
        <div className="mx-auto flex max-w-7xl flex-1 flex-col space-y-8 p-4 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/6">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
    </main>
  );
}
