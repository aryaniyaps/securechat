import Link from "next/link";
import { APP_NAME } from "~/utils/constants";

export default function RoomLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <main className="flex h-full w-full flex-col">
      <div className="border-b py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <Link href="/">
            <h1 className="font-semibold">{APP_NAME}</h1>
          </Link>
          {title}
        </div>
      </div>
      <div className="flex flex-1 overflow-y-hidden py-6">
        <div className="mx-auto flex max-w-7xl flex-1">
          <div className="flex flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
