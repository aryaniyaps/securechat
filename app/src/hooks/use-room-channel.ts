import { Channel, Presence } from "phoenix";
import { useEffect, useState } from "react";
import { useSocket } from "~/components/socket-provider";
import { Message } from "~/schemas/message";
import { api } from "~/utils/api";

type MetaData = {
  typing: boolean;
  online_at: string;
  user_info: {
    name: string;
    username: string;
    image: string;
    createdAt: Date;
  };
};

export type PresenceEntry = {
  metas: MetaData[];
};

export function useRoomChannel({ roomId }: { roomId: string }) {
  const socket = useSocket();

  const utils = api.useContext();

  const [presenceInfo, setPresenceInfo] = useState<PresenceEntry[] | null>(
    null
  );

  // State for the channel
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!socket) return;

    const roomChannel = socket.channel(`rooms:${roomId}`);

    // Set the channel to the state
    setChannel(roomChannel);

    let presenceState = {};

    // Get the current state
    roomChannel.on("presence_state", (state) => {
      presenceState = Presence.syncState(presenceState, state);
      setPresenceInfo(Presence.list(presenceState));
    });

    // Handle updates
    roomChannel.on("presence_diff", (diff) => {
      presenceState = Presence.syncDiff(presenceState, diff);
      setPresenceInfo(Presence.list(presenceState));
    });

    roomChannel.on("create_message", async (newMessage: Message) => {
      await utils.message.getAll.cancel();

      utils.message.getAll.setInfiniteData({ roomId }, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;
        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              items: [newMessage, ...oldData.pages[0].items],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    });

    roomChannel.on("update_message", async (updatedMessage: Message) => {
      await utils.message.getAll.cancel();

      utils.message.getAll.setInfiniteData({ roomId }, (oldData) => {
        if (oldData == null || oldData.pages.length === 0) return oldData;

        const newData = {
          ...oldData,
          pages: oldData.pages.map((page) => {
            // Check if the current page has the message that needs to be updated
            const messageIndex = page.items.findIndex(
              (message: Message) => message.id === updatedMessage.id
            );

            // If the message was not found in this page, return the page as is
            if (messageIndex === -1) return page;

            // If the message is found, replace it with the updated message
            return {
              ...page,
              items: [
                ...page.items.slice(0, messageIndex),
                updatedMessage,
                ...page.items.slice(messageIndex + 1),
              ],
            };
          }),
        };

        return newData;
      });
    });

    roomChannel.on("delete_message", async (deletedMessage: Message) => {
      await utils.message.getAll.cancel();

      utils.message.getAll.setInfiniteData({ roomId }, (oldData) => {
        if (oldData == null || oldData.pages.length === 0) return oldData;

        const newData = {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.filter(
              (message: Message) => message.id !== deletedMessage.id
            ),
          })),
        };

        return newData;
      });
    });

    roomChannel.join();

    return () => {
      roomChannel.leave();
      setChannel(null); // Reset channel state when leaving
    };
  }, [socket, roomId]);

  return { presenceInfo, channel };
}
