import {
  type GetStaticPaths,
  type GetStaticPropsContext,
  type InferGetStaticPropsType,
} from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import { HomeLayout } from "~/components/home/layout";
import { Icons } from "~/components/icons";
import { MessageController } from "~/components/room/message-controller";
import { MessageList } from "~/components/room/message-list";
import { useRoom } from "~/hooks/use-room";
import { api } from "~/utils/api";
import { APP_NAME } from "~/utils/constants";
import { pusher } from "~/utils/pusher";

export default function RoomPage({
  id,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const utils = api.useContext();

  const { data: session } = useSession();

  const { data: room, isLoading } = api.room.getById.useQuery({
    id,
  });

  const { roomId, setRoomId } = useRoom(); // use roomId where needed, setRoomId to update the roomId

  useEffect(() => {
    setRoomId(id); // Update roomId when id changes
  }, [id, setRoomId]);

  useEffect(() => {
    if (roomId) {
      // Subscribe to the channel you want to listen to
      const channel = pusher.subscribe(`room-${roomId}`);

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
  }, [roomId, setRoomId]);

  if (!session || isLoading || !room) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
      </main>
    );
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

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const id = context.params?.id;

  if (id == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  return {
    props: {
      id,
    },
  };
}
