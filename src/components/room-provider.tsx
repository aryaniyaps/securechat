import React, { createContext, useState } from "react";

export const RoomContext = createContext<{
  roomId: string | null;
  setRoomId: (id: string | null) => void;
}>({
  roomId: null,
  setRoomId: (_: string | null) => {
    // set room ID here
  },
});

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomId, setRoomId] = useState<string | null>(null); // Initially no room is selected

  return (
    <RoomContext.Provider value={{ roomId, setRoomId }}>
      {children}
    </RoomContext.Provider>
  );
};
