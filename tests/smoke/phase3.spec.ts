import { expect, test, type Page } from "@playwright/test";

import { createTestUser, readTestProfile, seedSacredSite } from "./emulator-fixtures";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

test("Phase 3 Sacred Site and cohort administration", async ({ page }) => {
  const suffix = Date.now();
  const password = "TestPassword123!";
  const adminEmail = `admin-${suffix}@example.test`;
  const memberEmail = `phase3-member-${suffix}@example.test`;
  await seedSacredSite("phase3-member-site");
  await createTestUser({
    email: adminEmail,
    password,
    role: "super_admin",
    sacredSiteId: "phase3-member-site",
  });
  const memberUid = await createTestUser({
    email: memberEmail,
    password,
    role: "member",
    sacredSiteId: "phase3-member-site",
  });

  await login(page, adminEmail, password);
  await expect(page).toHaveURL(/\/members$/);

  let siteId = "";
  await test.step("authorized admin creates, edits, deactivates, and reactivates a Sacred Site", async () => {
    await page.goto("/admin/sacred-sites");
    await expect(page.getByRole("heading", { name: "Sacred Sites", exact: true })).toBeVisible();
    const create = page
      .getByRole("heading", { name: "Create Sacred Site", exact: true })
      .locator("..");
    await create.getByLabel("Name").fill("Phase Three Site");
    await create.getByLabel("Country").fill("United Kingdom");
    await create.getByLabel("Region").fill("Somerset");
    await create.getByLabel("Latitude").fill("51.1");
    await create.getByLabel("Longitude").fill("-2.7");
    await create.getByLabel("Timezone").fill("Europe/London");
    await create.getByLabel("Description").fill("Created by the Phase 3 smoke test");
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/sacred-sites") &&
        response.request().method() === "POST",
    );
    await create.getByRole("button", { name: "Create Sacred Site" }).click();
    siteId = String(((await (await responsePromise).json()) as { id: string }).id);
    await expect(create.getByRole("status")).toContainText("created");
    const site = page.locator("details").filter({ hasText: "Phase Three Site" });
    await site.locator("summary").click();
    await site.getByLabel("Description").fill("Updated by the Phase 3 smoke test");
    await site.getByRole("button", { name: "Save changes" }).click();
    await expect(site.getByRole("status")).toContainText("updated");
    await site.getByRole("button", { name: "Deactivate" }).click();
    await expect(
      page.locator("details").filter({ hasText: "Phase Three Site — Inactive" }),
    ).toBeVisible();
    const inactive = page.locator("details").filter({ hasText: "Phase Three Site — Inactive" });
    if ((await inactive.getAttribute("open")) === null) await inactive.locator("summary").click();
    await inactive.getByRole("button", { name: "Reactivate" }).click();
    await expect(
      page.locator("details").filter({ hasText: "Phase Three Site — Active" }),
    ).toBeVisible();
  });

  const cohortIds: string[] = [];
  await test.step("authorized admin creates and edits cohorts", async () => {
    await page.goto("/admin/cohorts");
    const create = page.getByRole("heading", { name: "Create cohort", exact: true }).locator("..");
    for (const name of ["Autumn Cohort", "Winter Cohort"]) {
      await create.getByLabel("Name").fill(name);
      await create
        .getByLabel("Start date")
        .fill(name.startsWith("Autumn") ? "2026-10-27" : "2027-01-12");
      await create.getByLabel("Timezone").fill("Europe/London");
      await create.getByLabel("Enrollment opens (ISO instant)").fill("2026-09-01T09:00:00Z");
      await create.getByLabel("Enrollment cutoff (ISO instant)").fill("2026-10-20T17:00:00Z");
      await create.getByLabel("Status").selectOption("open");
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().endsWith("/api/admin/cohorts") && response.request().method() === "POST",
      );
      await create.getByRole("button", { name: "Create cohort" }).click();
      const response = await responsePromise;
      cohortIds.push(String(((await response.json()) as { id: string }).id));
      await expect(create.getByRole("status")).toContainText("created");
    }
    const autumn = page.locator("details").filter({ hasText: "Autumn Cohort" });
    await autumn.locator("summary").click();
    await autumn.getByLabel("Name").fill("Autumn Cohort Updated");
    await autumn.getByRole("button", { name: "Save changes" }).click();
    await expect(autumn.getByRole("status")).toContainText("updated");
  });

  await test.step("authorized admin assigns and transfers a member", async () => {
    const assignment = page
      .getByRole("heading", { name: "Assign or transfer member", exact: true })
      .locator("..");
    await assignment.getByLabel("Member").selectOption(memberUid);
    await assignment.getByLabel("Cohort").selectOption(cohortIds[0]);
    await assignment.getByLabel("Reason").fill("Initial manual assignment");
    await assignment.getByRole("button", { name: "Assign or transfer member" }).click();
    await expect(assignment.getByRole("status")).toContainText("updated");
    await assignment.getByLabel("Cohort").selectOption(cohortIds[1]);
    await assignment.getByLabel("Reason").fill("Approved manual transfer");
    await assignment.getByRole("button", { name: "Assign or transfer member" }).click();
    await expect(assignment.getByRole("status")).toContainText("updated");
    expect((await readTestProfile(memberUid))?.cohortId).toBe(cohortIds[1]);
  });

  await test.step("ordinary member is denied admin routes and operations", async () => {
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await login(page, memberEmail, password);
    await expect(page).toHaveURL(/\/members$/);
    await page.goto("/members/profile");
    await expect(page.getByText("Winter Cohort — open")).toBeVisible();
    await page.getByLabel("Change Sacred Site").selectOption(siteId);
    await page.getByRole("button", { name: "Save Sacred Site" }).click();
    await expect(page.getByRole("status")).toContainText("updated");
    const invalidSiteStatus = await page.evaluate(() =>
      fetch("/api/profile/sacred-site", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sacredSiteId: "does-not-exist" }),
      }).then((response) => response.status),
    );
    expect(invalidSiteStatus).toBe(400);
    await page.goto("/admin/sacred-sites");
    await expect(page).toHaveURL(/\/members\?notice=admin-denied$/);
    const statuses = await page.evaluate(async () => {
      const options = {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      };
      return Promise.all([
        fetch("/api/admin/sacred-sites", options).then((response) => response.status),
        fetch("/api/admin/cohorts", options).then((response) => response.status),
        fetch("/api/admin/cohort-assignments", options).then((response) => response.status),
      ]);
    });
    expect(statuses).toEqual([403, 403, 403]);
  });
});
