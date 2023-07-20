import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { getAvatarUrl } from "~/utils/avatar";
import { Icons } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const SCROLL_THRESHOLD = 250;

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

  const bottomChatRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollBottom = () => {
    if (scrollToBottom.current && bottomChatRef.current) {
      bottomChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      // we are getting a negative value here (possibly because we are using flex-col-reverse)
      const scrollTop = Math.abs(scrollContainerRef.current.scrollTop);

      setShowScrollButton(scrollTop > SCROLL_THRESHOLD);
    }
  };

  useEffect(() => {
    const currentScrollContainer = scrollContainerRef.current;

    if (currentScrollContainer) {
      currentScrollContainer.addEventListener("scroll", handleScroll);
      return () =>
        currentScrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      // we are getting a negative value here (possibly because we are using flex-col-reverse)
      const scrollTop = Math.abs(scrollContainerRef.current.scrollTop);

      if (scrollTop <= SCROLL_THRESHOLD) {
        scrollBottom();
      }
    }
  }, [messagesPages]);

  const handleFetchMore = async () => {
    if (scrollContainerRef.current) {
      const { scrollTop } = scrollContainerRef.current;

      scrollToBottom.current = false;
      await fetchNextPage();
      scrollContainerRef.current.scrollTop = scrollTop;

      setTimeout(() => {
        scrollToBottom.current = true;
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
      </main>
    );
  }

  return (
    <div className="relative flex flex-grow justify-end overflow-y-auto">
      <div
        ref={scrollContainerRef}
        className="flex flex-grow flex-col-reverse gap-8 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Add this Button component right below the main div */}
        {showScrollButton && (
          <Button
            variant="secondary"
            className="absolute bottom-0 right-0 m-4"
            onClick={scrollBottom}
          >
            <Icons.arrowDown size={20} className="h-4 w-4" />
          </Button>
        )}

        <div ref={bottomChatRef} />
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
                      {(message.owner.name || message.owner.username).slice(
                        0,
                        2
                      )}
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
          <Button variant="ghost" onClick={handleFetchMore}>
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}
