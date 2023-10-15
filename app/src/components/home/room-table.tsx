import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { type Session } from "next-auth";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { TableVirtuoso } from "react-virtuoso";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "~/components/ui/table";
import { useSearchQuery } from "~/hooks/use-search-query";
import { type Room } from "~/schemas/room";
import { api } from "~/utils/api";
import { getAvatarUrl } from "~/utils/avatar";
import { DEFAULT_PAGINATION_LIMIT } from "~/utils/constants";
import { Skeleton } from "../ui/skeleton";

function getColumns(session: Session | null): ColumnDef<Room>[] {
  const columns: ColumnDef<Room>[] = [
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
                src={getAvatarUrl(value.image, value.username)}
                loading="eager"
                alt={value.name || value.username}
              />
              <AvatarFallback>
                {(value.name || value.username).slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <p className="hidden sm:block">{value.name || value.username}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      enableHiding: false,
      header: () => <div className="text-right">Created At</div>,
      cell: ({ row }) => (
        <>
          <div className="hidden text-right sm:block">
            {new Date(row.original.createdAt).toLocaleString(undefined, {
              year: "2-digit",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="overflow-clip  text-right text-xs sm:hidden">
            {new Date(row.original.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </>
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
  room: Room;
  session: Session | null;
}) {
  const utils = api.useContext();
  const deleteRoom = api.room.delete.useMutation({
    onSuccess: async (_) => {
      await utils.room.getAll.cancel();

      utils.room.getAll.setInfiniteData(
        { limit: DEFAULT_PAGINATION_LIMIT },
        (oldData) => {
          if (oldData == null) return;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              return {
                ...page,
                items: page.items.filter(
                  (existingRoom) => existingRoom.id !== room.id
                ),
              };
            }),
          };
        }
      );
    },
  });

  return (
    <div className="flex justify-end" data-testid="room-actions">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open Menu</span>
            <Icons.ellipsisHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(
                `${window.location.origin}/rooms/${room.id}`
              )
            }
          >
            Copy room URL
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
                <p className="font-bold text-destructive">Delete room</p>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-3/4" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="float-right h-4 w-3/4" />
      </TableCell>
      <TableCell>
        <Skeleton className="float-right h-4 w-6" />
      </TableCell>
    </TableRow>
  );
}

export default function RoomTable({ session }: { session: Session }) {
  const { searchQuery, debouncedSearchQuery } = useSearchQuery();

  const {
    data: roomsPages,
    isLoading,
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = api.room.getAll.useInfiniteQuery(
    {
      limit: DEFAULT_PAGINATION_LIMIT,
      ...(debouncedSearchQuery && {
        search: String(debouncedSearchQuery),
      }),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const columns = useMemo(() => {
    return getColumns(session);
  }, [session]);

  const data = useMemo(() => {
    return roomsPages ? roomsPages.pages.flatMap((page) => page.items) : [];
  }, [roomsPages]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      void refetch();
    }
  }, [debouncedSearchQuery, refetch, searchQuery]);

  return (
    <TableVirtuoso
      style={{ height: "100%" }}
      totalCount={rows.length}
      overscan={{ main: 15, reverse: 10 }}
      components={{
        Table: ({ style, ...props }) => {
          return (
            <Table
              {...props}
              style={{
                ...style,
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                borderSpacing: 0,
              }}
            />
          );
        },
        TableRow: (props) => {
          const index = props["data-index"];
          const row = rows[index];

          if (!row) return null;

          return (
            <TableRow {...props}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        },
        TableBody: TableBody,
        TableFoot: TableFooter,
        EmptyPlaceholder: () => {
          if (isInitialLoading) {
            return (
              <TableBody>
                {Array.from({ length: DEFAULT_PAGINATION_LIMIT }).map(
                  (_, index) => (
                    <SkeletonRow key={`row-skeleton-${index}`} />
                  )
                )}
              </TableBody>
            );
          }

          if (rows.length === 0) {
            return (
              <TableCaption>
                <TableCell colSpan={4}>
                  <div className="flex h-full w-full items-center justify-center text-sm">
                    No rooms found!
                  </div>
                </TableCell>
              </TableCaption>
            );
          }

          return null;
        },
        ScrollSeekPlaceholder: () => {
          return <SkeletonRow />;
        },
      }}
      fixedHeaderContent={() => {
        return table.getHeaderGroups().map((headerGroup) => (
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
        ));
      }}
      endReached={async () => {
        if (hasNextPage && !isFetchingNextPage) {
          await fetchNextPage();
        }
      }}
      scrollSeekConfiguration={{
        enter: (velocity) => {
          return Math.abs(velocity) > 1000;
        },
        exit: (velocity) => {
          return Math.abs(velocity) < 500;
        },
      }}
    />
  );
}
