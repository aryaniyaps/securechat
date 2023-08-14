import Link from "next/link";
import { Button } from "../ui/button";
import SidebarNav from "./sidebar-nav";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings",
  },
  {
    title: "Account",
    href: "/settings/account",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className=" flex min-h-screen w-full flex-col">
      <div className="border-b p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-semibold">Settings</h1>
          <Link href="/">
            <Button variant="link" size="sm">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
      <div className="mb-8 flex min-h-full flex-1">
        <div className="mx-auto flex min-h-full max-w-7xl flex-1 flex-col space-y-8 p-4 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/6">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="min-h-full flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
    </main>
  );
}
