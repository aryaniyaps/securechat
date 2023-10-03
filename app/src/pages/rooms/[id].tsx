import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { Icons } from "~/components/icons";
import LoadingScreen from "~/components/loading-screen";
import RoomLayout from "~/components/room/layout";
import MessageController from "~/components/room/message-controller";
import MessageList from "~/components/room/message-list";
import PresenceList from "~/components/room/presence-list";
import { useSocket } from "~/components/socket-provider";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { withAuth } from "~/components/with-auth";
import { useCurrentRoomStore } from "~/hooks/stores/useCurrentRoomStore";
import { useRoomChannel } from "~/hooks/use-room-channel";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";
import { APP_NAME } from "~/utils/constants";

function RoomPage({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();

  const isMobile = useMediaQuery({ query: "(max-width: 672px)" });

  const { currentPresences, typingUsersRef } = useRoomChannel({ roomId: id });

  const { data: room, isLoading } = api.room.getById.useQuery(
    {
      id,
    },
    { refetchOnMount: false }
  );

  const socket = useSocket();

  const { setRoom, clearRoom } = useCurrentRoomStore();

  useEffect(() => {
    if (socket) {
      void setRoom(id);
    }
    // cleanup when the component unmounts
    return () => {
      clearRoom();
    };
  }, [id, socket]);

  if (!session || isLoading || !room) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Head>
        <title>
          {room.name} | {APP_NAME}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <RoomLayout title={room.name}>
        <div className="relative mx-auto flex max-w-7xl flex-1 overflow-hidden px-4">
          {isMobile ? (
            <>
              <div className="flex w-full flex-1 flex-col gap-8 overflow-hidden py-6">
                <MessageList roomId={room.id} session={session} />
                <MessageController
                  typingUsers={typingUsersRef.current}
                  roomId={room.id}
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="secondary"
                    className="absolute right-10 top-10 z-50"
                  >
                    <Icons.users size={20} className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-2/3">
                  <PresenceList currentPresences={currentPresences} />
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex w-full flex-1">
              <div className="flex flex-1 flex-col gap-8 overflow-hidden">
                <MessageList roomId={room.id} session={session} />
                <div className="w-full pr-6">
                  <MessageController
                    typingUsers={typingUsersRef.current}
                    roomId={room.id}
                  />
                </div>
              </div>
              <Separator orientation="vertical" />
              <div className="min-w-64 flex w-64 flex-shrink-0 flex-grow-0">
                <PresenceList currentPresences={currentPresences} />
              </div>
            </div>
          )}
        </div>
      </RoomLayout>
    </>
  );
}

export default withAuth(RoomPage);

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ id: string }>
) => {
  const id = context.params?.id;

  if (id == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  // TODO: return room as a cache here
  // For now, using SSGHelper requires setting environment variables on server side during build time
  // whereas we are only going to fetch during runtime
  const room = await prisma.room.findUnique({ where: { id } });

  if (!room) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      id,
    },
  };
};
