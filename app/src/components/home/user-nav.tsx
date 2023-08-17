"use client";

import { type Session } from "next-auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getAvatarUrl } from "~/utils/avatar";

export default function UserNav({ session }: { session: Session }) {
  return (
    <Link
      href="/settings"
      className="flex items-center gap-4"
      data-testid="user-nav"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={getAvatarUrl(session.user.image, session.user.username)}
          loading="eager"
          alt={session.user.name || session.user.username}
        />
        <AvatarFallback>
          {(session.user.name || session.user.username).slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <p className="text-sm font-semibold leading-none hidden sm:block">
        {session.user.name || session.user.username}
      </p>
    </Link>
  );
}
