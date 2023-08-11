import { expect, test } from "@playwright/test";

const defaultSession = {
  user: {
    name: "John Doe",
    username: "johndoe",
    image: "path_to_image.jpg",
  },
};

const sessionWithoutName = {
  user: {
    username: "johndoe",
    image: "path_to_image.jpg",
  },
};

const sessionWithoutImage = {
  user: {
    name: "John Doe",
    username: "johndoe",
  },
};

test.describe("UserNav Component", () => {
  test.beforeEach(async ({ page }) => {
    // Assuming you have a setup to render isolated components
    // you would navigate to the component's test page here
  });

  test("should render with valid session data", async ({ page }) => {
    // Provide session to the component (this will depend on your setup)

    const avatarImage = await page.$("AvatarImage");
    expect(avatarImage).toBeTruthy();
    if (!avatarImage) {
      throw new Error("AvatarImage not found");
    }

    expect(await avatarImage.getAttribute("src")).toBe(
      defaultSession.user.image
    );

    const userName = await page.textContent("p.text-sm");
    expect(userName).toBe(defaultSession.user.name);
  });

  test("should display username if name is not provided", async ({ page }) => {
    // Provide sessionWithoutName to the component

    const userName = await page.textContent("p.text-sm");
    expect(userName).toBe(sessionWithoutName.user.username);
  });

  test("should display avatar fallback if image is not provided", async ({
    page,
  }) => {
    // Provide sessionWithoutImage to the component

    const avatarFallback = await page.$("AvatarFallback");
    expect(avatarFallback).toBeTruthy();
    if (!avatarFallback) {
      throw new Error("AvatarFallback not found");
    }

    expect(await avatarFallback.textContent()).toBe(
      sessionWithoutImage.user.name.slice(0, 2)
    );
  });

  test("should redirect to /settings on click", async ({ page }) => {
    // Provide defaultSession to the component

    await page.click('[data-testid="user-nav"]');
    expect(page.url()).toBe("/settings");
  });
});
