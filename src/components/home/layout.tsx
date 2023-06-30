import { type Session } from "next-auth";
import { APP_NAME } from "~/utils/constants";
import { UserNav } from "./user-nav";

export function HomeLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <div className="border-b p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-semibold">{APP_NAME}</h1>
          <UserNav session={session} />
        </div>
      </div>
      <div className="mx-auto max-w-7xl p-4">{children}</div>
    </main>
  );
}
