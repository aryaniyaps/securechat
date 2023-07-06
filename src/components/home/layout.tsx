import { type Session } from "next-auth";
import { APP_NAME } from "~/utils/constants";
import { RoomController } from "./room-controller";
import { UserNav } from "./user-nav";

export function HomeLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <main className="flex min-h-screen min-w-full flex-col">
      <div className="border-b py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <h1 className="font-semibold">{APP_NAME}</h1>
          <div className="flex items-center gap-6">
            <RoomController />
            <UserNav session={session} />
          </div>
        </div>
      </div>
      <div className="flex-1 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
