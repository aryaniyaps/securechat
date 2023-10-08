import { create } from "zustand";
import { combine } from "zustand/middleware";

export const useCurrentRoomStore = create(
  combine(
    {
      roomId: null as string | null,
    },
    (set) => ({
      setRoom: (roomId: string) => {
        set(() => ({
          roomId,
        }));
      },
      clearRoom: () => {
        set(() => ({
          roomId: null,
        }));
      },
    })
  )
);
