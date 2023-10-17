import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtual } from "@tanstack/react-virtual";
import { type Session } from "next-auth";
import Link from "next/link";
import { forwardRef, useEffect, useMemo, useRef, type HTMLProps } from "react";
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
  TableHead,
  TableHeader,
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

      utils.room.getAll.setInfiniteData({}, (oldData) => {
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
      });
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

const SkeletonRow = forwardRef<
  HTMLTableRowElement,
  HTMLProps<HTMLTableRowElement>
>(function SkeletonRow(props, ref) {
  return (
    <TableRow {...props} ref={ref}>
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
});

export default function RoomTable({ session }: { session: Session }) {
  const { searchQuery, debouncedSearchQuery } = useSearchQuery();

  const {
    data: roomsPages,
    isLoading,
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

  const allRooms = useMemo(() => {
    return roomsPages ? roomsPages.pages.flatMap((page) => page.items) : [];
  }, [roomsPages]);

  const table = useReactTable({
    data: allRooms,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtual({
    size: hasNextPage ? rows.length + DEFAULT_PAGINATION_LIMIT : rows.length,
    parentRef,
    overscan: 15,
  });

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      void refetch();
    }
  }, [debouncedSearchQuery, refetch, searchQuery]);

  useEffect(() => {
    const [lastItem] = [...virtualizer.virtualItems].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allRooms.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRooms.length,
    isFetchingNextPage,
    virtualizer.virtualItems,
  ]);

  return (
    <div ref={parentRef} className="h-full overflow-y-auto">
      <div style={{ height: `${virtualizer.totalSize}px` }}>
        <Table className="flex-grow" data-testid="room-table">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                    >
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
            {isLoading ? (
              <>
                {Array.from({ length: DEFAULT_PAGINATION_LIMIT }).map(
                  (_, index) => (
                    <SkeletonRow key={`row-skeleton-${index}`} />
                  )
                )}
              </>
            ) : (
              <>
                {virtualizer.virtualItems.map((virtualItem, index) => {
                  const row = rows[virtualItem.index];

                  if (!row)
                    return (
                      <SkeletonRow
                        key={virtualItem.key}
                        ref={virtualItem.measureRef}
                        style={{
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${
                            virtualItem.start - index * virtualItem.size
                          }px)`,
                        }}
                      />
                    );

                  return (
                    <TableRow
                      key={virtualItem.key}
                      data-state={row.getIsSelected() && "selected"}
                      ref={virtualItem.measureRef}
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${
                          virtualItem.start - index * virtualItem.size
                        }px)`,
                      }}
                    >
                      <>
                        {row.getVisibleCells().map((cell) => {
                          return (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </>
                    </TableRow>
                  );
                })}
              </>
            )}
          </TableBody>
          {!rows.length ? (
            <TableCaption className="w-full text-center">
              No rooms found.
            </TableCaption>
          ) : null}
        </Table>
      </div>
    </div>
  );
}
