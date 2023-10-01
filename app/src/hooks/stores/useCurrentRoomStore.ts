import { PresenceResult, PresenceStatsResult } from "centrifuge";
import { type Channel, type Socket } from "phoenix";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { TypingUser } from "~/schemas/typing";

export const useCurrentRoomStore = create(
  combine(
    {
      roomId: null as string | null,
      presence: null as PresenceResult | null,
      presenceStats: null as PresenceStatsResult | null,
      typing: [] as TypingUser[],
      channel: null as Channel | null,
    },
    (set, get) => ({
      setRoom: async (socket: Socket, roomId: string) => {
        const channel = socket.channel(`rooms:${roomId}`);

        // Fetch presence and presenceStats here
        const presence = null;
        const presenceStats = null;

        set(() => ({ roomId, presence, presenceStats, channel }));
      },
      clearRoom: () => {
        const { channel } = get();
        if (channel) {
          channel.leave();
          set(() => ({
            roomId: null,
            presence: null,
            presenceStats: null,
            channel: null,
          }));
        }
      },
      addTypingUser: (user: TypingUser) => {
        const { typing } = get();
        const userExists = typing.some(
          (existingUser) => existingUser.id === user.id
        );
        if (!userExists) {
          set((state) => ({ typing: [user, ...state.typing] }));
        }
      },
      removeTypingUser: (user: TypingUser) => {
        const { typing } = get();
        const userExists = typing.some(
          (existingUser) => existingUser.id === user.id
        );
        if (userExists) {
          set((state) => ({
            typing: state.typing.filter(
              (existingUser) => existingUser.id !== user.id
            ),
          }));
        }
      },
    })
  )
);
