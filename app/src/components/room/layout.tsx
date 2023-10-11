import Link from "next/link";
import type { HTMLProps } from "react";
import { APP_NAME } from "~/utils/constants";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface RoomLayoutProps extends HTMLProps<HTMLDivElement> {
  title: string;
}

export default function RoomLayout({ children, title }: RoomLayoutProps) {
  return (
    <main className="flex h-full w-full flex-col">
      <div className="border-b py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          {/* FIXME: This link changes the browser URL but doesn't re-render to show the home page */}
          <Link href="/" className="font-semibold">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-4">
            <p className="font-semibold">{title}</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Copy Room URL"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      window.location.toString()
                    );
                  }}
                >
                  <Icons.copy size={20} className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Room URL</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </main>
  );
}
