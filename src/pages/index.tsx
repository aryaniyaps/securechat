import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { HomeLayout } from "~/components/home/layout";
import { RoomController } from "~/components/home/room-controller";
import { Icons } from "~/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/utils/api";
import { withAuth } from "~/utils/auth";
import { getAvatarUrl } from "~/utils/avatar";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

export default function HomePage() {
  const { data: session } = useSession();

  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  // delay is set to 1000ms (adjust delay as needed)
  const [debouncedSearchQuery] = useDebounce(searchQuery, 1000);

  const {
    data: roomsPages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = api.room.getAll.useInfiniteQuery(
    {
      limit: 10,
      ...(debouncedSearchQuery && {
        search: String(debouncedSearchQuery),
      }),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    console.log("REFETCHING");
    refetch({}).catch((err) => console.error(err));
  }, [debouncedSearchQuery, refetch]);

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
        <title>{APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeLayout session={session}>
        {/* Render your rooms here */}
        <div className="flex flex-1 flex-col gap-6 px-2">
          <div className="flex justify-between gap-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search rooms here..."
            />
            <RoomController />
          </div>
          <Table className="flex-grow">
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Created at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomsPages &&
                roomsPages.pages.flatMap((page) =>
                  page.items.map((room) => (
                    <TableRow
                      className="cursor-pointer"
                      key={room.id}
                      onClick={async () =>
                        await router.push(`/rooms/${room.id}`)
                      }
                    >
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={getAvatarUrl(room.owner.image)}
                            loading="eager"
                            alt={room.owner.name || room.owner.username}
                          />
                          <AvatarFallback>
                            {(room.owner.name || room.owner.username).slice(
                              0,
                              2
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {room.owner.name || room.owner.username}
                      </TableCell>
                      <TableCell className="text-right">
                        {room.createdAt.toUTCString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
            </TableBody>
          </Table>
          {hasNextPage && (
            <Button variant="ghost" onClick={() => fetchNextPage()}>
              Load More
            </Button>
          )}
        </div>
      </HomeLayout>
    </>
  );
}

export const getServerSideProps = withAuth(async (_) => {
  return {
    props: {
      // page data here
    },
  };
});
