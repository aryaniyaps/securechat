import {
  PresenceResult,
  PresenceStatsResult,
  type Subscription,
} from "centrifuge";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import LoadingScreen from "~/components/loading-screen";
import RoomLayout from "~/components/room/layout";
import MessageController from "~/components/room/message-controller";
import MessageList from "~/components/room/message-list";
import PresenceList from "~/components/room/presence-list";
import { Separator } from "~/components/ui/separator";
import { withAuth } from "~/components/with-auth";
import { useRoom } from "~/hooks/use-room";
import { type Message } from "~/schemas/message";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";
import { centrifuge } from "~/utils/centrifugo";
import { APP_NAME } from "~/utils/constants";

function RoomPage({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const utils = api.useContext();

  const [presence, setPresence] = useState<PresenceResult | null>(null);
  const [presenceStats, setPresenceStats] =
    useState<PresenceStatsResult | null>(null);

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
    let sub: Subscription | null;

    async function getPresence(sub: Subscription) {
      const presence = await sub.presence();
      setPresence(presence);
    }

    async function getPresenceStats(sub: Subscription) {
      const presenceStats = await sub.presenceStats();
      setPresenceStats(presenceStats);
    }

    if (roomId) {
      sub = centrifuge.getSubscription(`rooms:${roomId}`);
      if (sub === null) {
        sub = centrifuge.newSubscription(`rooms:${roomId}`);
        sub.on(
          "publication",
          async function (ctx: { data: { type: string; payload: Message } }) {
            console.log(ctx.data);

            switch (ctx.data.type) {
              case "message:create":
                const newMessage = ctx.data.payload;
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
                break;
            }
          }
        );
      }

      sub.subscribe();

      centrifuge.connect();

      void getPresence(sub);
      void getPresenceStats(sub);
      // Unsubscribe when the component unmounts
      return () => {
        if (sub) {
          sub.unsubscribe();
        }
        centrifuge.disconnect();
        setPresence(null);
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
      <RoomLayout title={room.name}>
        <div className="mx-auto flex max-w-7xl flex-1 px-4">
          <div className="flex flex-1 flex-col gap-8 py-6 pr-6">
            <MessageList roomId={room.id} />
            <MessageController roomId={room.id} />
          </div>
          <Separator className="hidden md:block" orientation="vertical" />
          <PresenceList presence={presence} presenceStats={presenceStats} />
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
