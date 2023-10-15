import { type Session } from "next-auth";
import { useEffect, useRef, useState } from "react";
import { StateSnapshot, Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { type Message } from "~/schemas/message";
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

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const state = useRef<StateSnapshot | undefined>(undefined);

  const [atBottom, setAtBottom] = useState(false);
  const showButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showButton, setShowButton] = useState(false);

  const START_INDEX = 100_000; // Use an appropriate large number based on your expected data size.

  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);
  const [allMessages, setAllMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (messagesPages) {
      const newMessages = messagesPages.pages
        .flatMap((data) => data.items)
        .reverse();
      const numberOfNewMessages = newMessages.length - allMessages.length;
      setFirstItemIndex((prevIndex) => prevIndex - numberOfNewMessages);
      setAllMessages(newMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesPages]);

  useEffect(() => {
    return () => {
      if (showButtonTimeoutRef.current !== null) {
        clearTimeout(showButtonTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showButtonTimeoutRef.current !== null) {
      clearTimeout(showButtonTimeoutRef.current);
    }

    // slight hack: if we have no messages and we are already at the bottom of the list,
    // atBottom is always false initially
    if (!atBottom && allMessages.length > 0) {
      showButtonTimeoutRef.current = setTimeout(() => setShowButton(true), 500);
    } else {
      setShowButton(false);
    }
  }, [atBottom, allMessages]);

  return (
    <div className="relative flex flex-1 flex-col" data-testid="message-list">
      <Virtuoso
        ref={virtuosoRef}
        firstItemIndex={firstItemIndex}
        followOutput="auto"
        alignToBottom
        totalCount={allMessages.length}
        initialTopMostItemIndex={allMessages.length - 1}
        data={allMessages}
        overscan={15}
        restoreStateFrom={state.current}
        computeItemKey={(key: number) => `message-${key.toString()}`}
        atBottomStateChange={(bottom) => {
          setAtBottom(bottom);
        }}
        components={{
          ScrollSeekPlaceholder: () => <MessageTileSkeleton />,
          EmptyPlaceholder: () => {
            if (isInitialLoading) {
              return <MessageListSkeleton />;
            }

            // Return null when there are messages to prevent it from rendering.
            return null;
          },
        }}
        scrollSeekConfiguration={{
          enter: (velocity) => {
            return Math.abs(velocity) > 1000;
          },
          exit: (velocity) => {
            return Math.abs(velocity) < 500;
          },
        }}
        startReached={async () => {
          if (hasNextPage && !isFetchingNextPage) {
            await fetchNextPage();
          }
        }}
        itemContent={(_index, message) => {
          return (
            <MessageTile
              message={message}
              session={session}
              isEditing={editingMessageId === message.id}
              setEditingMessageId={setEditingMessageId}
            />
          );
        }}
      />
      {showButton && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-2 right-8 max-w-min"
          onClick={() => {
            if (virtuosoRef.current) {
              virtuosoRef.current.scrollToIndex({
                index: allMessages.length - 1,
                behavior: "smooth",
              });
            }
          }}
        >
          <Icons.arrowDown size={15} className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
