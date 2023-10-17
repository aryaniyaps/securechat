import { useVirtual } from "@tanstack/react-virtual";
import { type Session } from "next-auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "~/utils/api";
import { DEFAULT_PAGINATION_LIMIT } from "~/utils/constants";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import { MessageTile, MessageTileSkeleton } from "./message-tile";

function MessageListSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      {Array.from({ length: DEFAULT_PAGINATION_LIMIT }).map((_, index) => (
        <MessageTileSkeleton key={index} />
      ))}
    </div>
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
    isInitialLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = api.message.getAll.useInfiniteQuery(
    {
      roomId: roomId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);

  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const allMessages = useMemo(() => {
    return messagesPages
      ? messagesPages.pages.flatMap((data) => data.items)
      : [];
  }, [messagesPages]);

  const rowVirtualizer = useVirtual({
    size: hasNextPage ? allMessages.length + 1 : allMessages.length,
    parentRef,
    overscan: 15,
  });

  function handleParentScroll() {
    if (parentRef.current) {
      const isNotAtTop = parentRef.current.scrollTop > 5; // 5 is a small threshold
      setIsScrolledUp(isNotAtTop);
    }
  }

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.virtualItems].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allMessages.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allMessages.length,
    isFetchingNextPage,
    rowVirtualizer.virtualItems,
  ]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {isInitialLoading ? (
        <MessageListSkeleton />
      ) : (
        <>
          <div
            ref={parentRef}
            onScroll={handleParentScroll}
            className="h-full w-full overflow-y-auto scroll-smooth"
          >
            <div
              style={{
                height: `${rowVirtualizer.totalSize}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.virtualItems.map((virtualRow) => {
                const message = allMessages[virtualRow.index];

                const isLoaderRow = virtualRow.index > allMessages.length - 1;

                return (
                  <div
                    key={virtualRow.key}
                    ref={virtualRow.measureRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {isLoaderRow ? (
                      <MessageListSkeleton />
                    ) : !message ? (
                      <MessageTileSkeleton />
                    ) : (
                      <MessageTile
                        message={message}
                        session={session}
                        isEditing={editingMessageId === message.id}
                        setEditingMessageId={setEditingMessageId}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {isScrolledUp && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-8 max-w-min"
              onClick={() => {
                if (parentRef.current) {
                  parentRef.current.scrollTop = 0;
                }
              }}
            >
              <Icons.arrowUp size={15} className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
