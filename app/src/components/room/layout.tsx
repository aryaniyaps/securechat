import Link from "next/link";
import { APP_NAME } from "~/utils/constants";
import { Icons } from "../icons";
import { Button } from "../ui/button";

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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(window.location.toString());
              }}
            >
              <Icons.copy size={20} className="h-5 w-5" />
            </Button>

            <p className="font-semibold">{title}</p>
          </div>
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
