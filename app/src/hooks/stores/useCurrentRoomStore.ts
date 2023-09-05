import { PresenceResult, PresenceStatsResult } from "centrifuge";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { TypingUser } from "~/schemas/typing";
import { wsClient } from "~/utils/wsClient";

export const useCurrentRoomStore = create(
  combine(
    {
      roomId: null as string | null,
      presence: null as PresenceResult | null,
      presenceStats: null as PresenceStatsResult | null,
      typing: [] as TypingUser[],
    },
    (set, get) => ({
      setRoom: async (roomId: string) => {
        wsClient.emit("rooms:join", roomId);

        // Fetch presence and presenceStats here
        const presence = null;
        const presenceStats = null;

        set(() => ({ roomId, presence, presenceStats }));
      },
      clearRoom: () => {
        const { roomId } = get();
        if (roomId) {
          wsClient.emit("rooms:leave", roomId);
          set(() => ({
            roomId: null,
            presence: null,
            presenceStats: null,
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
