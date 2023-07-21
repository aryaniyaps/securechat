import { useSession } from "next-auth/react";
import Head from "next/head";
import { HomeLayout } from "~/components/home/layout";
import { RoomController } from "~/components/home/room-controller";
import { RoomTable } from "~/components/home/room-table";
import { SearchBar } from "~/components/home/search-bar";
import { SearchProvider } from "~/components/home/search-provider";
import { LoadingScreen } from "~/components/loading-screen";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

export default function HomePage() {
  const { data: session } = useSession();

  if (!session) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeLayout session={session}>
        {/* Render your rooms here */}
        <SearchProvider>
          <div className="flex flex-1 flex-col gap-6 px-2">
            <div className="flex justify-between gap-4">
              <SearchBar />
              <RoomController />
            </div>
            <RoomTable session={session} />
          </div>
        </SearchProvider>
      </HomeLayout>
    </>
  );
}
