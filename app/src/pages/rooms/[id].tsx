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
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { withAuth } from "~/components/with-auth";
import { useCurrentRoomStore } from "~/hooks/stores/useCurrentRoomStore";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";
import { APP_NAME } from "~/utils/constants";
import { wsClient } from "~/utils/wsClient";

function RoomPage({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const utils = api.useContext();

  const { data: session } = useSession();

  const isMobile = useMediaQuery({ query: "(max-width: 672px)" });

  const { data: room, isLoading } = api.room.getById.useQuery(
    {
      id,
    },
    { refetchOnMount: false }
  );

  const { setRoom, clearRoom } = useCurrentRoomStore();

  useEffect(() => {
    void setRoom(id);

    wsClient.onAny((data) => {
      console.log("EVENT RECEIVED", data);
    });

    wsClient.on("create-message", async (newMessage) => {
      console.log("NEW MESSAGE ARRIVED");
      await utils.message.getAll.cancel();

      utils.message.getAll.setInfiniteData(
        { limit: 10, roomId: id },
        (oldData) => {
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
        }
      );
    });

    // cleanup when the component unmounts
    return () => {
      clearRoom();
      wsClient.off("create-message");
    };
  }, [id]);

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
        <div className="relative mx-auto flex max-w-7xl flex-1 px-4">
          {isMobile ? (
            <>
              <div className="flex flex-1 flex-col gap-8 py-6">
                <MessageList roomId={room.id} />
                <MessageController roomId={room.id} />
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
                  <PresenceList />
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <div className="flex flex-1 flex-col gap-8 py-6 pr-6">
                <MessageList roomId={room.id} />
                <MessageController roomId={room.id} />
              </div>
              <Separator orientation="vertical" />
              <div className="w-64">
                <PresenceList />
              </div>
            </>
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
