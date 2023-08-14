// room.fixture.ts
import { test as baseTest } from "@playwright/test";
import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

const roomWithArgs = Prisma.validator<Prisma.RoomArgs>()({
  include: {
    owner: {
      select: {
        name: true,
        username: true,
        image: true,
      },
    },
  },
});

export const test = baseTest.extend<{
  room: Prisma.RoomGetPayload<typeof roomWithArgs>;
}>({
  room: async ({ page }, use) => {
    const roomName = "Sample room";
    // ... logic to create room using page ...

    await page.goto("/");

    // Click "Create Room" button to open the dialog
    const createRoomButton = page.locator(
      '[data-testid="room-controller"] button:has-text("Create Room")'
    );
    await createRoomButton.click();

    // Fill in the room name and submit
    await page.fill(
      'input[placeholder="What should we call your room?"]',
      roomName
    );
    const submitButton = page.locator('button:has-text("Create room")');
    await submitButton.click();

    const room = await prisma.room.findFirstOrThrow({
      include: {
        owner: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
      },
      where: { name: roomName },
    });

    // wait for Room page URL
    await page.waitForURL(`/rooms/${room.id}`);

    await use(room);

    // Optional: Clean up after the test by deleting the room
    await prisma.room.delete({ where: { id: room.id } });
  },
});
