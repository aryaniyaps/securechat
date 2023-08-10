import { expect, test } from "@playwright/test";
import { APP_NAME } from "~/utils/constants";

test.describe("HomeLayout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/"); // Navigate to a page that uses HomeLayout
  });

  test("should display the default APP_NAME title", async ({ page }) => {
    const titleElement = await page.$("h1");
    const titleText = await titleElement?.textContent();
    expect(titleText).toBe(APP_NAME);
  });

  test("should display the custom title when provided", async ({ page }) => {
    // Navigate to a different page that uses HomeLayout with a custom title or simulate a change in the title prop
    await page.goto("/rooms/"); // Replace with the appropriate route

    const titleElement = await page.$("h1");
    const titleText = await titleElement?.textContent();
    expect(titleText).toBe("Your Custom Title"); // Replace with the expected custom title
  });

  test("should render the UserNav", async ({ page }) => {
    const userNav = await page.$('[data-testid="user-nav"]');
    expect(userNav).toBeTruthy();
  });

  // Add other tests as necessary
});
