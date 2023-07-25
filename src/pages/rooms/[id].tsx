import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import { HomeLayout } from "~/components/home/layout";
import { LoadingScreen } from "~/components/loading-screen";
import { MessageController } from "~/components/room/message-controller";
import { MessageList } from "~/components/room/message-list";
import { withAuth } from "~/components/with-auth";
import { useRoom } from "~/hooks/use-room";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";
import { APP_NAME } from "~/utils/constants";
import { pusher } from "~/utils/pusher";

function RoomPage({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const utils = api.useContext();

  const { data: session } = useSession();

  const { data: room, isLoading } = api.room.getById.useQuery(
    {
      id,
    },
    { refetchOnMount: false }
  );

  const { roomId, setRoomId } = useRoom(); // use roomId where needed, setRoomId to update the roomId

  useEffect(() => {
    setRoomId(id); // Update roomId when id changes
  }, [id, setRoomId]);

  useEffect(() => {
    if (roomId) {
      // Subscribe to the channel you want to listen to
      const channel = pusher.subscribe(`room-${roomId}`);

      console.log("SUBSCRIBED TO ROOM: ", channel);

      channel.bind(
        "message:create",
        async (newMessage: {
          id: string;
          ownerId: string;
          createdAt: Date;
          updatedAt: Date;
          owner: {
            image: string;
            username: string;
            name?: string | null | undefined;
          };
          content: string;
          roomId: string;
        }) => {
          await utils.message.getAll.cancel();

          utils.message.getAll.setInfiniteData(
            { limit: 10, roomId },
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
        }
      );

      // Unsubscribe when the component unmounts
      return () => {
        pusher.unsubscribe(`room-${roomId}`);
        setRoomId(null);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, setRoomId]);

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
      <HomeLayout title={room.name} session={session}>
        {/* TODO: add edit button here if user is owner */}
        <div className="flex min-h-full min-w-full flex-col gap-8 px-4">
          <MessageList roomId={room.id} />
          <MessageController roomId={room.id} />
        </div>
      </HomeLayout>
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
