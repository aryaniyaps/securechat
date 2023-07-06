import { api } from "~/utils/api";
import { getAvatarUrl } from "~/utils/avatar";
import { Icons } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export function MessageList({ roomId }: { roomId: string }) {
  const {
    data: messagesPages,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = api.message.getAll.useInfiniteQuery(
    {
      limit: 10,
      roomId: roomId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
      </main>
    );
  }

  return (
    <div className="flex flex-shrink-0 flex-grow flex-col-reverse gap-8 overflow-y-auto">
      {messagesPages &&
        messagesPages.pages.flatMap((page) =>
          page.items.map((message) => (
            <div key={message.id} className="flex w-full flex-col gap-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-4 w-4">
                  <AvatarImage
                    src={getAvatarUrl(message.owner.image)}
                    loading="eager"
                    alt={message.owner.name || message.owner.username}
                  />
                  <AvatarFallback>
                    {(message.owner.name || message.owner.username).slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-sm font-medium text-gray-500">
                  {message.owner.name || message.owner.username}
                </h3>
              </div>
              <p>{message.content}</p>
            </div>
          ))
        )}
      {hasNextPage && (
        <Button variant="ghost" onClick={() => fetchNextPage()}>
          Load More
        </Button>
      )}
    </div>
  );
}
