import { Presence } from "phoenix";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "~/components/socket-provider";
import { Message } from "~/schemas/message";
import { TypingUser } from "~/schemas/typing";
import { api } from "~/utils/api";

type MetaData = {
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

  const [currentPresences, setCurrentPresences] = useState<
    PresenceEntry[] | null
  >(null);

  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const typingUsersRef = useRef<TypingUser[]>([]);

  useEffect(() => {
    typingUsersRef.current = typingUsers;
  }, [typingUsers]);

  useEffect(() => {
    if (!socket) return;

    const channel = socket.channel(`rooms:${roomId}`);

    let presenceState = {};
    // Get the current state

    channel.on("presence_state", (state) => {
      presenceState = Presence.syncState(presenceState, state);
      setCurrentPresences(Presence.list(presenceState));
    });

    // Handle updates
    channel.on("presence_diff", (diff) => {
      presenceState = Presence.syncDiff(presenceState, diff);
      setCurrentPresences(Presence.list(presenceState));
    });

    channel.on("create_message", async (newMessage: Message) => {
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

    channel.on("update_message", async (updatedMessage: Message) => {
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

    channel.on("delete_message", async (deletedMessage: Message) => {
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

    channel.on("add_typing_user", (user: TypingUser) => {
      const userExists = typingUsersRef.current.some(
        (existingUser) => existingUser.id === user.id
      );
      if (!userExists) {
        setTypingUsers((users) => [user, ...users]);
      }
    });

    channel.on("remove_typing_user", (user: TypingUser) => {
      const userExists = typingUsersRef.current.some(
        (existingUser) => existingUser.id === user.id
      );
      if (userExists) {
        setTypingUsers((users) =>
          users.filter((existingUser) => existingUser.id !== user.id)
        );
      }
    });

    channel.join();

    return () => {
      channel.leave();
    };
  }, [socket, roomId]);

  return { currentPresences, typingUsersRef };
}
