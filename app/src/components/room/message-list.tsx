import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { getAvatarUrl } from "~/utils/avatar";
import { Icons } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

const SCROLL_THRESHOLD = 250;

export default function MessageList({ roomId }: { roomId: string }) {
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

  if (isLoading) return;

  return (
    <div
      className="relative flex flex-1 overflow-hidden"
      data-testid="message-list"
    >
      <div
        ref={scrollContainerRef}
        className="flex w-full flex-col-reverse gap-10 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Add this Button component right below the main div */}
        {showScrollButton && (
          <Button
            variant="secondary"
            className="absolute bottom-10 right-10"
            onClick={scrollBottom}
          >
            <Icons.arrowDown size={20} className="h-5 w-5" />
          </Button>
        )}

        <div ref={bottomChatRef} />
        {messagesPages &&
          messagesPages.pages.flatMap((page) =>
            page.items.map((message) => (
              <div key={message.id} className="flex w-full gap-4">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getAvatarUrl(
                          message.owner.image,
                          message.owner.username
                        )}
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
                  </HoverCardTrigger>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <HoverCardTrigger asChild>
                        <h3 className="text-xs font-semibold text-primary hover:cursor-default">
                          {message.owner.name || message.owner.username}
                        </h3>
                      </HoverCardTrigger>
                      <HoverCardContent side="right">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={getAvatarUrl(
                                message.owner.image,
                                message.owner.username
                              )}
                              loading="eager"
                              alt={message.owner.name || message.owner.username}
                            />
                            <AvatarFallback>
                              {(
                                message.owner.name || message.owner.username
                              ).slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {message.owner.name ? (
                            <div className="space-y-2">
                              <h4 className="text-sm font-bold">
                                {message.owner.name}
                              </h4>
                              <p className="text-sm font-semibold">
                                @{message.owner.username}
                              </p>
                              <p className="text-xs font-thin">
                                Joined on{" "}
                                {new Date(
                                  message.owner.createdAt
                                ).toLocaleString(undefined, {
                                  day: "numeric",
                                  month: "2-digit",
                                  year: "2-digit",
                                })}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">
                                @{message.owner.username}
                              </h4>
                              <p className="text-xs font-thin">
                                Joined on{" "}
                                {new Date(
                                  message.owner.createdAt
                                ).toLocaleString(undefined, {
                                  day: "numeric",
                                  month: "2-digit",
                                  year: "2-digit",
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </HoverCardContent>
                      <p className="text-xs font-thin">
                        {new Date(message.createdAt).toLocaleString(undefined, {
                          month: "2-digit",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                    <p className="whitespace-normal break-all">
                      {message.content}
                    </p>
                  </div>
                </HoverCard>
              </div>
            ))
          )}
        {hasNextPage && (
          <Button variant="link" onClick={handleFetchMore}>
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}
