import { PresenceResult, PresenceStatsResult } from "centrifuge";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { wsClient } from "~/utils/wsClient";

export const useCurrentRoomStore = create(
  combine(
    {
      roomId: null as string | null,
      presence: null as PresenceResult | null,
      presenceStats: null as PresenceStatsResult | null,
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
    })
  )
);
