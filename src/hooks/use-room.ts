import { useContext } from "react";
import { RoomContext } from "~/components/room-provider";

export const useRoom = () => useContext(RoomContext);
