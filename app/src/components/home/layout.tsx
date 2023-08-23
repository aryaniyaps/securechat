import { type Session } from "next-auth";
import Link from "next/link";
import { APP_NAME } from "~/utils/constants";
import UserNav from "./user-nav";

export default function HomeLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <main className="flex h-full w-full flex-col">
      <div className="border-b py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <Link href="/">
            <h1 className="font-semibold">{APP_NAME}</h1>
          </Link>
          <UserNav session={session} />
        </div>
      </div>
      <div className="flex flex-grow overflow-hidden py-6">{children}</div>
    </main>
  );
}
