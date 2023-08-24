import { ClientInfo } from "centrifuge";
import pluralize from "pluralize";
import { useCurrentRoomStore } from "~/hooks/stores/useCurrentRoomStore";
import { getAvatarUrl } from "~/utils/avatar";
import { Icons } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

interface ConnInfo {
  name: string | null;
  username: string;
  image: string | null;
  createdAt: Date;
}

export default function PresenceList() {
  const roomStore = useCurrentRoomStore();

  if (!roomStore.presence || !roomStore.presenceStats) {
    return (
      <div
        className="flex w-full flex-col gap-6 py-6 pb-6 "
        data-testid="presence-list"
      >
        <div className="flex items-center gap-2 px-6 text-sm font-medium">
          <Icons.users size={20} className="h-5 w-5" />
          <p>counting users...</p>
        </div>
        <Separator />
        <p className="flex-1 px-6">loading users...</p>
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-col gap-6 py-6 pb-6"
      data-testid="presence-list"
    >
      <div className="flex items-center gap-2 px-6 text-sm font-medium">
        <Icons.users size={20} className="h-5 w-5" />
        <p>
          {roomStore.presenceStats.numUsers}{" "}
          {pluralize("user", roomStore.presenceStats.numUsers)} connected
        </p>
      </div>
      <Separator />
      <div className="flex flex-1 flex-col gap-6 px-6">
        {Object.entries(roomStore.presence.clients).map(
          ([key, clientInfo]: [string, ClientInfo]) => {
            const user = clientInfo.connInfo as ConnInfo;
            return (
              <div key={key} className="flex items-center gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={getAvatarUrl(user.image, user.username)}
                    loading="eager"
                    alt={user.name || user.username}
                  />
                  <AvatarFallback>
                    {(user.name || user.username).slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {user.name ? (
                  <div className="flex flex-col">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs">@{user.username}</p>
                  </div>
                ) : (
                  <p className="font-semibold">{user.name || user.username}</p>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}