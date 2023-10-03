import { PresenceEntry } from "~/pages/rooms/[id]";
import { getAvatarUrl } from "~/utils/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

export default function PresenceList({
  currentPresences,
}: {
  currentPresences: PresenceEntry[] | null;
}) {
  if (!currentPresences) {
    return (
      <div
        className="flex flex-col gap-6 px-6 py-6 pb-6"
        data-testid="presence-list"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex w-[200px] items-center space-x-4">
            <Avatar className="h-8 w-8">
              <Skeleton className="h-full w-full" />
            </Avatar>
            <div className="flex w-full flex-col space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6 px-6 py-6 pb-6"
      data-testid="presence-list"
    >
      {Object.entries(currentPresences).map(([userId, userPresence]) => {
        const metadata = userPresence.metas[0]; // Assuming each user only has one metadata entry
        if (!metadata) return;

        return (
          <div key={userId} className="flex w-[200px] items-center space-x-4">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={getAvatarUrl(
                  metadata.user_info.image,
                  metadata.user_info.username
                )}
                loading="eager"
                alt={metadata.user_info.name || metadata.user_info.username}
              />
              <AvatarFallback>
                {(metadata.user_info.name || metadata.user_info.username).slice(
                  0,
                  2
                )}
              </AvatarFallback>
            </Avatar>
            {metadata.user_info.name ? (
              <div className="flex flex-col">
                <p className="font-semibold">{metadata.user_info.name}</p>
                <p className="text-xs">@{metadata.user_info.username}</p>
              </div>
            ) : (
              <p className="font-semibold">
                {metadata.user_info.name || metadata.user_info.username}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
