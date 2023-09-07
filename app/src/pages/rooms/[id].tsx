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
import { Message } from "~/schemas/message";
import { TypingUser } from "~/schemas/typing";
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

  const { setRoom, clearRoom, addTypingUser, removeTypingUser } =
    useCurrentRoomStore();

  useEffect(() => {
    void setRoom(id);

    wsClient.on("create-message", async (newMessage: Message) => {
      await utils.message.getAll.cancel();

      utils.message.getAll.setInfiniteData({ roomId: id }, (oldData) => {
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
      });
    });

    wsClient.on("delete-message", async (deletedMessage: Message) => {
      await utils.message.getAll.cancel();

      utils.message.getAll.setInfiniteData({ roomId: id }, (oldData) => {
        if (oldData == null || oldData.pages.length === 0) return oldData;

        const newData = {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.filter(
              (message: Message) => message.id !== deletedMessage.id
            ),
          })),
        };

        return newData;
      });
    });

    wsClient.on("add-typing-user", (user: TypingUser) => {
      addTypingUser(user);
    });

    wsClient.on("remove-typing-user", (user: TypingUser) => {
      removeTypingUser(user);
    });

    // cleanup when the component unmounts
    return () => {
      clearRoom();
      // remove all listeners
      console.log("REMOVING LISTENERS", id);
      wsClient.off("create-message");
      wsClient.off("delete-message");
      wsClient.off("add-typing-user");
      wsClient.off("remove-typing-user");
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
                <MessageList roomId={room.id} session={session} />
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
              <div className="flex flex-1 flex-col gap-8">
                <MessageList roomId={room.id} session={session} />
                <div className="pr-6">
                  <MessageController roomId={room.id} />
                </div>
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
