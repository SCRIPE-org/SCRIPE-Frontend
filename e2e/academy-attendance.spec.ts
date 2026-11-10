import { expect, test, type Page } from "@playwright/test";

test.use({ channel: "chrome" });

// Use a disposable Academy fixture with at least two unmarked eligible athletes.
const fixture = {
  coach: process.env.ACADEMY_ATTENDANCE_COACH,
  coachPassword: process.env.ACADEMY_ATTENDANCE_COACH_PASSWORD,
  manager: process.env.ACADEMY_ATTENDANCE_MANAGER,
  managerPassword: process.env.ACADEMY_ATTENDANCE_MANAGER_PASSWORD,
  sessionId: process.env.ACADEMY_ATTENDANCE_SESSION,
  outsideId: process.env.ACADEMY_ATTENDANCE_OUTSIDE_SESSION,
  cancelledId: process.env.ACADEMY_ATTENDANCE_CANCELLED_SESSION,
  athlete: process.env.ACADEMY_ATTENDANCE_ATHLETE,
  group: process.env.ACADEMY_ATTENDANCE_GROUP,
};

const register = (id: string) => `/academy/attendance/${id}`;

async function signIn(page: Page, identifier: string, password: string) {
  await page.goto("/login");
  await page.locator("#identifier").fill(identifier);
  await page.locator("#password").fill(password);
  await page.locator("form button[type=submit]").first().click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 90_000 });
}

test.describe("Academy attendance with a live API", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });
  test.skip(({ browserName }) => browserName !== "chromium", "Use one browser for this mutable attendance fixture.");

  test("coach opens an assigned session and retries the same save after a network failure", async ({ page }) => {
    const { coach, coachPassword, sessionId, athlete, group } = fixture;
    test.skip(!(coach && coachPassword && sessionId && athlete && group), "Configure a disposable attendance fixture.");
    if (!coach || !coachPassword || !sessionId || !athlete || !group) return;

    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, coach, coachPassword);
    await page.goto("/academy/attendance");
    await expect(page.getByRole("heading", { name: "Attendance queue" })).toBeVisible();
    const assigned = page.getByRole("link", { name: `Open register · ${group}` }).and(page.locator(`a[href="${register(sessionId)}"]`));
    await assigned.click();
    await expect(page.getByRole("heading", { name: "Attendance register" })).toBeVisible();
    await expect(page.getByRole("heading", { name: athlete, exact: true })).toBeVisible();
    const section = page.locator("section[aria-labelledby='attendance-register-title']");
    await expect.poll(() => section.evaluate((element) => element.scrollWidth - element.clientWidth)).toBe(0);

    await page.getByRole("button", { name: "Mark all present" }).click();
    const status = page.getByRole("combobox", { name: `Attendance status for ${athlete}` });
    await expect(status).toHaveText("Present");
    await status.press("Enter");
    await page.getByRole("option", { name: "Excused absence", exact: true }).click();
    const save = page.getByRole("button", { name: "Save attendance" });
    await save.click();
    await expect(page.getByText("Enter an attendance reason for this status.")).toBeVisible();
    await page.getByLabel("Attendance reason (required)").fill("Approved travel");

    const bulkUrl = `**/academy/attendance/${sessionId}/bulk`;
    const forceConflict = async (route: import("@playwright/test").Route) => {
      if (route.request().method() !== "POST") { await route.continue(); return; }
      const origin = route.request().headers().origin;
      await route.fulfill({ status: 409, json: { success: false }, headers: origin ? {
        "access-control-allow-origin": origin, "access-control-allow-credentials": "true",
      } : undefined });
    };
    await page.route(bulkUrl, forceConflict);
    await save.click();
    await expect(page.getByText(/The session or roster changed/)).toBeVisible();
    await page.unroute(bulkUrl, forceConflict);
    await page.getByRole("button", { name: "Reload register" }).click();
    await expect(page.getByLabel("Attendance reason (required)")).toHaveValue("Approved travel");

    const attempts: unknown[] = [];
    await page.route(bulkUrl, async (route) => {
      if (route.request().method() !== "POST") { await route.continue(); return; }
      attempts.push(route.request().postDataJSON());
      // Lose the first request at the browser boundary. The second runs against the live API.
      if (attempts.length === 1) await route.abort("failed");
      else await route.continue();
    });
    await save.click();
    await expect(page.getByRole("alert").filter({ hasText: "The save could not be confirmed" })).toBeVisible();
    await page.getByRole("button", { name: "Retry the same save" }).click();
    await expect(page.getByText("Attendance saved.")).toBeVisible();
    expect(attempts).toHaveLength(2);
    expect(attempts[0]).toMatchObject({
      idempotencyKey: expect.stringMatching(/^[0-9a-f-]{36}$/i),
      entries: expect.arrayContaining([expect.objectContaining({ status: "AbsentExcused", reason: "Approved travel" })]),
    });
    expect(attempts[1]).toEqual(attempts[0]);
    await expect(page.getByRole("button", { name: `Correct attendance for ${athlete}` })).toHaveCount(0);
    await page.getByRole("button", { name: `Attendance history for ${athlete}` }).click();
    await expect(page.getByText("No corrections have been made.")).toBeVisible();
    await page.keyboard.press("Escape");

    if (fixture.outsideId) {
      await page.goto(register(fixture.outsideId));
      await expect(page.getByText("This attendance information could not be found.")).toBeVisible();
    }
  });

  test("manager corrects a saved mark and can review the before, after, and reason", async ({ page }) => {
    const { manager, managerPassword, sessionId, athlete } = fixture;
    test.skip(!(manager && managerPassword && sessionId && athlete), "Configure a manager for the disposable attendance fixture.");
    if (!manager || !managerPassword || !sessionId || !athlete) return;

    await page.setViewportSize({ width: 768, height: 900 });
    await signIn(page, manager, managerPassword);
    await page.goto(register(sessionId));
    await page.getByRole("button", { name: `Correct attendance for ${athlete}` }).click();
    const correction = page.getByRole("dialog");
    await correction.getByRole("combobox", { name: "Attendance status" }).click();
    await page.getByRole("option", { name: "Late" }).click();
    await correction.getByLabel("Attendance reason (optional)").fill("Arrived after warm-up");
    await correction.getByRole("button", { name: "Save correction" }).click();
    await expect(correction.getByText("Enter a reason for the correction.")).toBeVisible();
    await correction.getByLabel("Reason for correction (required)").fill("Checked coach’s arrival log");
    await correction.getByRole("button", { name: "Save correction" }).click();
    await expect(page.getByText("Attendance corrected.")).toBeVisible();
    await page.getByRole("button", { name: `Attendance history for ${athlete}` }).click();
    const history = page.getByRole("dialog");
    await expect(history.getByText(/Before/)).toBeVisible();
    await expect(history.getByText(/After/)).toBeVisible();
    await expect(history.getByText("Approved travel")).toBeVisible();
    await expect(history.getByText("Checked coach’s arrival log")).toBeVisible();
  });

  test("cancelled register remains read-only in Arabic and dark mode", async ({ page }) => {
    const { manager, managerPassword, cancelledId } = fixture;
    test.skip(!(manager && managerPassword && cancelledId), "Configure a cancelled attendance session.");
    if (!manager || !managerPassword || !cancelledId) return;

    await page.setViewportSize({ width: 1440, height: 900 });
    await signIn(page, manager, managerPassword);
    await page.evaluate(() => { localStorage.setItem("scr_lang", "ar"); localStorage.setItem("theme", "dark"); });
    await page.goto(register(cancelledId));
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(page.getByRole("heading", { name: "سجل الحضور" })).toBeVisible();
    await expect(page.getByText("أُلغيت هذه الجلسة. سجل الحضور للقراءة فقط.")).toBeVisible();
    await expect(page.getByRole("button", { name: "حفظ الحضور" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^تصحيح حضور/ })).toHaveCount(0);
  });
});
