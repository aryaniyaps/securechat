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

  useEffect(() => {
    // Subscribe to the channel you want to listen to
    const channel = pusher.subscribe(`room-${id}`);

    console.log("CHANNEL SUBSCRIBED: ", channel);

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
        // Do something with the message
        console.log("NEW MESSAGE CREATED");
        console.log(newMessage);
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
      }
    );

    // Unsubscribe when the component unmounts
    return () => {
      console.log("UNSUBSCRIBED");
      pusher.unsubscribe(`room-${id}`);
    };
  }, [id]);

  if (!session || isLoading) {
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
        <div className="flex min-h-full w-full flex-col gap-8 px-4">
          <MessageList roomId={room.id} />
          <div className="flex-none">
            <MessageController roomId={room.id} />
          </div>
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
