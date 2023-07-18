import { type Room } from "@prisma/client";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { HomeLayout } from "~/components/home/layout";
import { RoomController } from "~/components/home/room-controller";
import { Icons } from "~/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";
import { withAuth } from "~/utils/auth";
import { getAvatarUrl } from "~/utils/avatar";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

function getColumns(session: Session | null) {
  const columns: ColumnDef<
    Room & { owner: { image: string; name?: string | null; username: string } }
  >[] = [
    {
      accessorKey: "name",
      header: "Room Name",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Link
            className="cursor-pointer hover:underline"
            href={`/rooms/${row.original.id}`}
          >
            {row.original.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "owner",
      header: "Owner",
      enableHiding: false,
      cell: ({ row }) => {
        const value = row.original.owner;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={getAvatarUrl(value.image)}
                loading="eager"
                alt={value.name || value.username}
              />
              <AvatarFallback>
                {(value.name || value.username).slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {value.name || value.username}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      enableHiding: false,
      header: () => <div className="text-right">Created At</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.original.createdAt.toUTCString()}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return <RoomActions room={row.original} session={session} />;
      },
    },
  ];
  return columns;
}

function RoomActions({
  room,
  session,
}: {
  room: Room & {
    owner: { image: string; name?: string | null; username: string };
  };
  session: Session | null;
}) {
  const utils = api.useContext();
  const deleteRoom = api.room.delete.useMutation({
    onSuccess: async (_) => {
      // delete room from cache here
      await utils.room.getAll.cancel();

      utils.room.getAll.setInfiniteData({ limit: 10 }, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;
        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              items: oldData.pages[0].items.filter(
                (myRoom) => myRoom.id !== room.id
              ),
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open Menu</span>
          <Icons.ellipsis className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            navigator.clipboard.writeText(
              `${env.NEXT_PUBLIC_SITE_URL}/rooms/${room.id}`
            )
          }
        >
          Copy Room URL
        </DropdownMenuItem>
        {/* Only Room owner can delete their room. */}
        {session && session.user.id == room.ownerId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await deleteRoom.mutateAsync({ id: room.id });
              }}
            >
              <p className="text-red-500">Delete room</p>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function HomePage() {
  const { data: session } = useSession();

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

  const columns = useMemo(() => getColumns(session), [session]);

  const data = useMemo(() => {
    return roomsPages ? roomsPages.pages.flatMap((page) => page.items) : [];
  }, [roomsPages]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      console.log("REFETCHING");
      refetch({}).catch((err) => console.error(err));
    }
  }, [debouncedSearchQuery, refetch, searchQuery]);

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
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
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
