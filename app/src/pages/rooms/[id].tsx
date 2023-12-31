import { TRPCError } from "@trpc/server";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
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
import { useRoomChannel } from "~/hooks/use-room-channel";
import { ssgHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";
import { APP_NAME } from "~/utils/constants";

function RoomPage({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();

  const isMobile = useMediaQuery({ query: "(max-width: 672px)" });

  const { presenceInfo, channel } = useRoomChannel({ roomId: id });

  const { data: room, isLoading } = api.room.getById.useQuery(
    {
      id,
    },
    { refetchOnMount: false }
  );

  if (!session || isLoading || !room || !channel) {
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
                  channel={channel}
                  presenceInfo={presenceInfo}
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
                  <PresenceList presenceInfo={presenceInfo} />
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex w-full flex-1">
              <div className="flex flex-1 flex-col gap-8 overflow-hidden">
                <MessageList roomId={room.id} session={session} />
                <div className="w-full pr-6">
                  <MessageController
                    channel={channel}
                    presenceInfo={presenceInfo}
                    roomId={room.id}
                  />
                </div>
              </div>
              <Separator orientation="vertical" />
              <div className="min-w-64 flex w-64 flex-shrink-0 flex-grow-0">
                <PresenceList presenceInfo={presenceInfo} />
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

  const helper = ssgHelper();

  try {
    // the room will be stored in the cache and passed
    // to trpcState on dehydration
    await helper.room.getById.fetch({ id });
  } catch (err) {
    if (err instanceof TRPCError && err.code === "NOT_FOUND") {
      return {
        notFound: true,
      };
    }
  }

  return {
    props: {
      id,
      trpcState: helper.dehydrate(),
    },
  };
};
