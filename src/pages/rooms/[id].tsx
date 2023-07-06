import {
  type GetStaticPaths,
  type GetStaticPropsContext,
  type InferGetStaticPropsType,
} from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { HomeLayout } from "~/components/home/layout";
import { Icons } from "~/components/icons";
import { MessageController } from "~/components/room/message-controller";
import { MessageList } from "~/components/room/message-list";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import { APP_NAME } from "~/utils/constants";

export default function RoomPage({
  id,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: session } = useSession();

  const { data: room, isLoading } = api.room.getById.useQuery({
    id,
  });

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
          <div className="flex-grow overflow-y-auto">
            <MessageList roomId={room.id} />
          </div>
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

  const ssg = ssgHelper();
  await ssg.room.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}
