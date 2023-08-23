import { useSession } from "next-auth/react";
import Head from "next/head";
import HomeLayout from "~/components/home/layout";
import RoomController from "~/components/home/room-controller";
import RoomTable from "~/components/home/room-table";
import SearchBar from "~/components/home/search-bar";
import { SearchProvider } from "~/components/home/search-provider";
import LoadingScreen from "~/components/loading-screen";
import { withAuth } from "~/components/with-auth";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

function HomePage() {
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
        <SearchProvider>
          <div className="mx-auto flex max-w-7xl flex-1 flex-col gap-6 px-4">
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

export default withAuth(HomePage);
