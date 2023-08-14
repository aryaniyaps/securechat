import { expect, test } from "@playwright/test";
import { APP_NAME } from "~/utils/constants";

test.describe("HomePage", () => {
  // The base URL is already set in the configuration. No need to hardcode it in the test.

  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");
  });

  test("should display the app name in the title", async ({ page }) => {
    const title = await page.title();
    expect(title).toBe(APP_NAME);
  });

  test("should render the search bar", async ({ page }) => {
    const searchBar = await page.$('[data-testid="search-bar-input"]');
    expect(searchBar).toBeTruthy();
  });

  test("should render the room controller", async ({ page }) => {
    const roomController = await page.$('[data-testid="room-controller"]');
    expect(roomController).toBeTruthy();
  });

  // You can add more tests based on responsive behaviors if there are specific mobile-only or desktop-only features in your application.

  // Example:
  test("should behave differently in mobile", async ({ page }) => {
    const width = page.viewportSize()?.width || 0;

    if (width <= 768) {
      // Assuming 768px is your breakpoint for mobile
      const mobileElement = await page.$("mobile-specific-selector");
      expect(mobileElement).toBeTruthy();

      // Add any other mobile-specific assertions
    }
  });

  // Likewise, add tests for other functionalities, form submissions, button clicks, etc.
});
