import { AttachmentFile } from "@prisma/client";
import { Session } from "next-auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { Message } from "~/schemas/message";
import { api } from "~/utils/api";
import { getAvatarUrl } from "~/utils/avatar";
import { DEFAULT_PAGINATION_LIMIT } from "~/utils/constants";
import { getMediaUrl } from "~/utils/media";
import { Icons } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const SCROLL_THRESHOLD = 250;

function MessageAttachmentsViewer({ attachments }: { attachments: AttachmentFile[] }) {

  return (
    <div className="flex flex-col gap-4">
      {attachments.map(attachment => {
        return (
          <a key={attachment.uri} href={getMediaUrl(attachment.uri)} target="_blank" rel="noopener noreferrer">
            <div className="px-6 py-4 bg-tertiary rounded-md max-w-[200px] overflow-ellipsis">
              <p className="font-mono text-sm truncate">{attachment.name}</p>
            </div>
          </a>
        )
      })}
    </div>
  )
}

function MessageTile({
  message,
  session,
}: {
  message: Message;
  session: Session;
}) {
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const canShowDeleteButton = useMemo(() => {
    return showDeleteButton && message.ownerId === session.user.id;
  }, [showDeleteButton]);

  const deleteMessage = api.message.delete.useMutation({});

  return (
    <div
      className="relative flex w-full gap-4 px-2 py-4 hover:bg-primary-foreground"
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={getAvatarUrl(message.owner.image, message.owner.username)}
              loading="eager"
              alt={message.owner.name || message.owner.username}
            />
            <AvatarFallback>
              {(message.owner.name || message.owner.username).slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <TooltipTrigger asChild>
              <h3 className="text-xs font-semibold text-primary hover:cursor-default">
                {message.owner.username}
              </h3>
            </TooltipTrigger>
            <TooltipContent side="right">
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
                    {(message.owner.name || message.owner.username).slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {message.owner.name ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold">{message.owner.name}</h4>
                    <p className="text-sm font-semibold">
                      @{message.owner.username}
                    </p>
                    <p className="text-xs font-thin">
                      Joined on{" "}
                      {new Date(message.owner.createdAt).toLocaleString(
                        undefined,
                        {
                          day: "numeric",
                          month: "2-digit",
                          year: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">
                      @{message.owner.username}
                    </h4>
                    <p className="text-xs font-thin">
                      Joined on{" "}
                      {new Date(message.owner.createdAt).toLocaleString(
                        undefined,
                        {
                          day: "numeric",
                          month: "2-digit",
                          year: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </TooltipContent>
            <p className="text-xs font-thin">
              {new Date(message.createdAt).toLocaleString(undefined, {
                month: "2-digit",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            {canShowDeleteButton && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    disabled={deleteMessage.isLoading}
                  >
                    <Icons.trash
                      size={5}
                      className="h-3 w-3 text-destructive"
                      onClick={async () => {
                        await deleteMessage.mutateAsync({ id: message.id });
                      }}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete message</TooltipContent>
              </Tooltip>
            )}
          </div>
          {message.attachments.length > 0 && (
            <MessageAttachmentsViewer attachments={message.attachments} />
          )}
          {message.content && (
            <p className="whitespace-normal break-all">{message.content}</p>
          )}
        </div>
      </Tooltip>
    </div>
  );
}

function MessageListSkeleton() {
  return (
    <>
      {Array.from({ length: DEFAULT_PAGINATION_LIMIT }).map((_, index) => (
        <div key={index} className="relative flex w-[350px] gap-4 px-2 py-4">
          <Avatar className="h-8 w-8">
            <Skeleton className="h-full w-full" />
          </Avatar>
          <div className="flex w-full flex-col justify-start gap-2">
            <div className="flex w-full gap-2">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/6" />
            </div>
            {/* message content */}
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function MessageList({
  roomId,
  session,
}: {
  roomId: string;
  session: Session;
}) {
  const {
    data: messagesPages,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = api.message.getAll.useInfiniteQuery(
    {
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

  return (
    <div
      className="relative flex flex-1 overflow-hidden"
      data-testid="message-list"
    >
      <div
        ref={scrollContainerRef}
        className="flex w-full flex-col-reverse overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        {/* Add this Button component right below the main div */}
        {showScrollButton && (
          <Button
            variant="secondary"
            className="absolute bottom-10 right-10 z-50"
            onClick={scrollBottom}
          >
            <Icons.arrowDown size={20} className="h-5 w-5" />
          </Button>
        )}

        <div ref={bottomChatRef} />
        {messagesPages &&
          messagesPages.pages.flatMap((page) =>
            page.items.map((message) => (
              <MessageTile
                key={message.id}
                message={message}
                session={session}
              />
            ))
          )}
        {isLoading && <MessageListSkeleton />}
        {hasNextPage && (
          <Button variant="link" onClick={handleFetchMore}>
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}
