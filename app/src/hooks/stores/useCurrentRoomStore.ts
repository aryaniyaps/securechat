import { PresenceResult, PresenceStatsResult, Subscription } from "centrifuge";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { Message } from "~/schemas/message";
import { centrifuge } from "~/utils/centrifugo";
import { wsClient } from "~/utils/wsClient";

type EventHandler = (ctx: { data: { type: string; payload: Message } }) => void;

export const useCurrentRoomStore = create(
  combine(
    {
      roomId: null as string | null,
      presence: null as PresenceResult | null,
      presenceStats: null as PresenceStatsResult | null,
      eventHandler: null as EventHandler | null,
    },
    (set, get) => ({
      initialize: (eventHandler: EventHandler) => {
        set(() => ({ eventHandler }));
      },
      setRoom: async (roomId: string) => {
        const { eventHandler } = get();

        wsClient.emit("rooms:join", roomId);

        wsClient.on("create-message", (data) => {});

        wsClient.on("delete-message", (data) => {});

        // Create or get a subscription
        let sub: Subscription | null;

        sub = centrifuge.getSubscription(`rooms:${roomId}`);
        if (sub === null) {
          sub = centrifuge.newSubscription(`rooms:${roomId}`);
          if (eventHandler !== null) {
            sub.on("publication", eventHandler);
          }
        }

        sub.subscribe();

        centrifuge.connect();

        // Fetch presence and presenceStats here
        const presence = await sub.presence();
        const presenceStats = await sub.presenceStats();

        set(() => ({ roomId, presence, presenceStats }));
      },
      clearRoom: () => {
        const { roomId } = get();
        if (roomId) {
          const sub = centrifuge.getSubscription(`rooms:${roomId}`);
          if (sub) {
            sub.unsubscribe();
          }
          centrifuge.disconnect();
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
