import { useSession } from "next-auth/react";
import { Socket } from "phoenix";
import React, { createContext, useContext, useEffect, useState } from "react";
import { env } from "~/env.mjs";

const SocketContext = createContext<Socket | null>(null);

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { status, data } = useSession();

  useEffect(() => {
    if (status === "authenticated" && !socket) {
      // pass gateway token here
      const ws = new Socket(env.NEXT_PUBLIC_WS_URL, {
        params: { token: data.gateway.token },
      });

      ws.onClose((event) => {
        console.log(event);
      });

      ws.onError((error) => {
        console.log(error);
      });

      ws.connect();

      setSocket(ws);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [status]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
