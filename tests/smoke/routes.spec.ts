import { expect, test } from "@playwright/test";
const routes = [
  "/",
  "/about",
  "/books",
  "/research",
  "/sacred-network",
  "/sacred-path",
  "/login",
  "/members",
  "/members/path",
  "/members/modules",
  "/members/notes",
  "/members/meetups",
  "/members/profile",
  "/admin",
];
for (const route of routes)
  test(route, async ({ page }) => {
    expect((await page.goto(route))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
