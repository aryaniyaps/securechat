import { expect } from "@playwright/test";
import { APP_NAME } from "~/utils/constants";
import { test } from "../../fixtures/room.fixture";

test.describe("HomeLayout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/"); // Navigate to a page that uses HomeLayout
  });

  test("should display the default APP_NAME title", async ({ page }) => {
    const titleElement = await page.$("h1");
    const titleText = await titleElement?.textContent();
    expect(titleText).toBe(APP_NAME);
  });

  test("should display the custom title when provided", async ({
    page,
    room,
  }) => {
    // The room object is now available via the room fixture
    await page.goto(`/rooms/${room.id}`);

    const titleElement = await page.$("h1");
    const titleText = await titleElement?.textContent();
    expect(titleText).toBe(room.name); // Use the name of the room as the expected title
  });

  test("should render the UserNav", async ({ page }) => {
    const userNav = await page.$('[data-testid="user-nav"]');
    expect(userNav).toBeTruthy();
  });

  // Add other tests as necessary
});
