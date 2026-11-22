import {
  test,
  expect,
  BrowserContext,
  Locator,
  Page,
  Request,
  Response,
} from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "ahly.admin@scripe-dev.local";
const STORAGE_STATE_PATH = path.resolve(__dirname, "./helpers/.auth-storage-state.json");
const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../SCRIPE-CRM/EXECUTION_REPORTS/CRM-KANBAN-AUTH-UX-CERTIFICATION/screenshots"
);

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const RAW_LOCALE_KEY_REGEX =
  /(?<![@.])\b(?:crm[A-Za-z0-9_]*|common|crud|auth|validation)\.[a-zA-Z0-9_.]+\b/g;

interface ObservedNetworkEvent {
  method: string;
  url: string;
  status?: number;
}

function attachNetworkObserver(page: Page) {
  const requests: ObservedNetworkEvent[] = [];
  const responses: ObservedNetworkEvent[] = [];

  const onRequest = (req: Request) => {
    requests.push({ method: req.method(), url: req.url() });
  };
  const onResponse = (res: Response) => {
    responses.push({
      method: res.request().method(),
      url: res.url(),
      status: res.status(),
    });
  };

  page.on("request", onRequest);
  page.on("response", onResponse);

  return {
    requests,
    responses,
    detach: () => {
      page.off("request", onRequest);
      page.off("response", onResponse);
    },
  };
}

async function waitForDashboardSettled(page: Page) {
  await page
    .locator("text=/getting everything ready for you|نحن نقوم بتجهيز كل شيء من أجلك/i")
    .waitFor({ state: "detached", timeout: 35_000 })
    .catch(() => {});
  await page.waitForLoadState("networkidle").catch(() => {});

  // If PerUserLimit (100 req/min) ever triggers a transient 429, cool down and click Retry
  for (let retryAttempt = 0; retryAttempt < 2; retryAttempt++) {
    const tooMany = page.locator("text=/too many requests|429/i").first();
    const retryBtn = page
      .locator('button:has-text("Retry"):visible, button:has-text("إعادة المحاولة"):visible')
      .first();
    const isRateLimited =
      (await tooMany.isVisible().catch(() => false)) &&
      (await retryBtn.isVisible().catch(() => false));
    if (!isRateLimited) break;
    await page.waitForTimeout(16_000);
    await retryBtn.click();
    await page.waitForLoadState("networkidle").catch(() => {});
  }
}

async function restoreAuthStorageIfPresent(page: Page): Promise<boolean> {
  if (!fs.existsSync(STORAGE_STATE_PATH)) return false;
  try {
    const raw = fs.readFileSync(STORAGE_STATE_PATH, "utf8");
    const parsed = JSON.parse(raw) as {
      cookies?: Parameters<ReturnType<Page["context"]>["addCookies"]>[0];
      origins?: Array<{
        origin: string;
        localStorage?: Array<{ name: string; value: string }>;
      }>;
    };
    if (Array.isArray(parsed.cookies) && parsed.cookies.length > 0) {
      await page.context().addCookies(parsed.cookies);
    }
    const localOrigin = parsed.origins?.find((o) => o.origin.includes("localhost:3000"));
    if (localOrigin?.localStorage?.length) {
      await page.goto("/login", { waitUntil: "domcontentloaded" });
      await page.evaluate((entries) => {
        for (const entry of entries) {
          localStorage.setItem(entry.name, entry.value);
        }
      }, localOrigin.localStorage);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function ensureAuthenticatedSession(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });

  // Fast path: shared serial context already holds an active authenticated CRM shell
  const currentUrl = page.url();
  if (currentUrl.includes("localhost:3000") && !currentUrl.includes("/login")) {
    const alreadyInShell = await page
      .getByTestId("crm-shell")
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
    if (alreadyInShell) {
      return;
    }
  }

  const authResponseStatuses: string[] = [];
  const onAuthRes = (res: Response) => {
    if (res.url().includes("/api/v1/auth/")) {
      authResponseStatuses.push(`${res.request().method()} ${new URL(res.url()).pathname} -> ${res.status()}`);
    }
  };
  page.on("response", onAuthRes);

  await page.goto("/crm/leads", { waitUntil: "domcontentloaded" });
  await waitForDashboardSettled(page);

  if (!page.url().includes("/login")) {
    const hasShell = await page
      .getByTestId("crm-shell")
      .isVisible({ timeout: 15_000 })
      .catch(() => false);
    if (hasShell) {
      page.off("response", onAuthRes);
      await page.context().storageState({ path: STORAGE_STATE_PATH });
      return;
    }
  }

  // Fallback: re-hydrate storageState manually only if context storageState wasn't attached
  const restored = await restoreAuthStorageIfPresent(page);
  if (restored) {
    await page.goto("/crm/leads", { waitUntil: "domcontentloaded" });
    await waitForDashboardSettled(page);
    if (!page.url().includes("/login")) {
      const hasShell = await page
        .getByTestId("crm-shell")
        .isVisible({ timeout: 15_000 })
        .catch(() => false);
      if (hasShell) {
        page.off("response", onAuthRes);
        return;
      }
    }
  }
  page.off("response", onAuthRes);
  if (authResponseStatuses.length > 0) {
    console.info(`[AUTH_CHECK] Auth responses before login fallback: ${authResponseStatuses.join(" | ")}`);
  }

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  const identifierInput = page.locator("#identifier");
  const passwordInput = page.locator("#password");
  await expect(identifierInput).toBeVisible({ timeout: 15_000 });
  await identifierInput.fill(ADMIN_EMAIL);
  await passwordInput.fill(getDevAdminPassword());

  for (let attempt = 0; attempt < 5; attempt++) {
    if (!page.url().includes("/login")) break;
    const submitBtn = page.locator("form button[type='submit']").first();
    if ((await submitBtn.count()) === 0) break;
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();
    const leftLogin = await page
      .waitForURL((url) => !url.pathname.includes("/login"), { timeout: 25_000 })
      .then(() => true)
      .catch(() => false);
    if (leftLogin || !page.url().includes("/login")) break;
    await page.waitForTimeout(5_000);
  }

  await expect(page).not.toHaveURL(/\/login/);
  await waitForDashboardSettled(page);
  await page.goto("/crm/leads", { waitUntil: "domcontentloaded" });
  await waitForDashboardSettled(page);
  await expect(page.getByTestId("crm-shell")).toBeVisible({ timeout: 15_000 });
  await page.context().storageState({ path: STORAGE_STATE_PATH });
}

async function applyThemeAndCapture(
  page: Page,
  filename: string,
  theme: "dark" | "light",
  fullPage = false
) {
  await page.evaluate((mode) => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const nexusMain = document.getElementById("nexus-content");
    if (nexusMain?.parentElement) {
      nexusMain.parentElement.scrollTop = 0;
    }
    document.documentElement.setAttribute("data-reduced-motion", "true");
    document.documentElement.setAttribute("data-animation", "none");
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("theme", mode);
    localStorage.setItem("scr_pref_theme", mode);
    document.querySelectorAll("nextjs-portal").forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });
  }, theme);
  await page.waitForTimeout(300);

  const targetPath = path.join(SCREENSHOT_DIR, filename);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await page.screenshot({ path: targetPath, fullPage });
      return;
    } catch (err) {
      if (attempt === 3) throw err;
      await page.waitForTimeout(350);
    }
  }
}

async function setLanguageUi(page: Page, lang: "en" | "ar") {
  const targetDir = lang === "ar" ? "rtl" : "ltr";
  const currentDir = await page.locator("html").getAttribute("dir");
  if (currentDir === targetDir) {
    return;
  }

  const switcher = page
    .locator('button[aria-label="Change language"], button[aria-label="تغيير اللغة"]')
    .first();
  if (await switcher.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await switcher.click();
    const option = page
      .getByRole("menuitemradio", { name: lang === "ar" ? /العربية/i : /English/i })
      .first();
    await expect(option).toBeVisible({ timeout: 5_000 });
    await option.click();
    await expect(page.locator("html")).toHaveAttribute("dir", targetDir, { timeout: 10_000 });
    await page.waitForTimeout(300);
    return;
  }

  await page.evaluate((targetLang) => {
    localStorage.setItem("scr_lang", targetLang);
    localStorage.setItem("scr_pref_lang", targetLang);
    document.cookie = `scr_lang=${targetLang}; path=/; max-age=31536000`;
  }, lang);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForDashboardSettled(page);
  await expect(page.locator("html")).toHaveAttribute("dir", targetDir, {
    timeout: 15_000,
  });
}

type CrmTabId =
  | "overview"
  | "leads"
  | "deals"
  | "accounts"
  | "contacts"
  | "activities"
  | "pipelines"
  | "reports"
  | "settings";

async function navigateToCrmTab(page: Page, tabId: CrmTabId, expectedPathRegex: RegExp) {
  const pathname = (() => {
    try {
      return new URL(page.url()).pathname;
    } catch {
      return "";
    }
  })();

  if (!expectedPathRegex.test(pathname)) {
    const tabBtn = page.getByTestId(`crm-tab-${tabId}`);
    if (await tabBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await tabBtn.click();
      await page.waitForURL((url) => expectedPathRegex.test(url.pathname), { timeout: 15_000 });
    } else {
      const routeMap: Record<CrmTabId, string> = {
        overview: "/crm",
        leads: "/crm/leads",
        deals: "/crm/opportunities",
        accounts: "/crm/accounts",
        contacts: "/crm/contacts",
        activities: "/crm/activities",
        pipelines: "/crm/pipelines",
        reports: "/crm/reports",
        settings: "/crm/settings",
      };
      await page.goto(routeMap[tabId], { waitUntil: "domcontentloaded" });
    }
  }
  await waitForDashboardSettled(page);
  await expect(page.getByTestId("crm-shell")).toBeVisible({ timeout: 15_000 });
}

async function assertNoRawLocaleKeys(page: Page, scopeLabel: string) {
  const matches = await page.evaluate((regexSource) => {
    const regex = new RegExp(regexSource, "g");
    const main = document.querySelector("main") ?? document.body;
    const text = (main.innerText || "").trim();
    const hits = text.match(regex) ?? [];
    return hits.filter(
      (hit) =>
        !/\.(?:com|org|net|local|io|png|json|ts|tsx)$/i.test(hit) &&
        !/^crm\.(?:opportunity|lead|account|contact|activity|crm_user_preferences)$/.test(hit)
    );
  }, RAW_LOCALE_KEY_REGEX.source);
  expect(
    matches,
    `Raw translation keys leaked on ${scopeLabel}: ${matches.join(", ")}`
  ).toHaveLength(0);
}

async function switchToKanbanIfNeeded(page: Page, expectedStageSelector: string) {
  const stageCol = page.locator(expectedStageSelector).first();
  if (!(await stageCol.isVisible().catch(() => false))) {
    const kanbanBtn = page.getByTestId("toggle-kanban-view");
    if (await kanbanBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await kanbanBtn.click();
    }
  }
  await expect(stageCol).toBeVisible({ timeout: 20_000 });
}

async function scrollElementHorizontallyIntoView(locator: Locator) {
  await locator.evaluate((el) => {
    el.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" });
  });
}

async function performKanbanPointerDrag(params: {
  page: Page;
  card: Locator;
  targetStageKey: string;
  releaseMode: "expect-auto-drop" | "expect-modal-gate" | "expect-blocked";
  stageEndpointRegex: RegExp;
  expectedDropStatus?: "allowed_instant" | "allowed_screen_required" | "blocked";
  midDragScreenshotName?: string;
}) {
  const {
    page,
    card,
    targetStageKey,
    releaseMode,
    stageEndpointRegex,
    expectedDropStatus,
    midDragScreenshotName,
  } = params;
  const targetCol = page.locator(`[data-stage-key="${targetStageKey}"]`).first();

  // Scroll ONLY the source card into view before grabbing it so wide boards never pull it off-screen
  await scrollElementHorizontallyIntoView(card);
  await page.waitForTimeout(150);

  const cardBox = await card.boundingBox();
  expect(cardBox, "Source Kanban card boundingBox must exist").not.toBeNull();
  const startX = cardBox!.x + cardBox!.width * 0.5;
  const startY = cardBox!.y + Math.min(cardBox!.height * 0.5, 42);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 14, startY + 6, { steps: 6 });

  const overlay = page.getByTestId("kanban-drag-overlay");
  await expect(overlay).toBeVisible({ timeout: 5_000 });

  // Scroll target column into view ONLY after DragOverlay pickup, then move pointer straight over it
  await scrollElementHorizontallyIntoView(targetCol);
  await page.waitForTimeout(150);
  const colBox = await targetCol.boundingBox();
  expect(colBox, `Target column ${targetStageKey} boundingBox must exist`).not.toBeNull();

  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const endX = Math.max(40, Math.min(viewport.width - 40, colBox!.x + colBox!.width * 0.5));
  const endY = Math.max(
    110,
    Math.min(viewport.height - 60, colBox!.y + Math.min(180, Math.max(95, colBox!.height * 0.38)))
  );

  await page.mouse.move(endX, endY, { steps: 22 });
  await page.mouse.move(endX + 1, endY + 1, { steps: 2 });
  await page.waitForTimeout(200);

  // Assert DragOverlay is portaled into document.body (outside transform ancestors inside crm-shell)
  const isPortaledToBody = await overlay.evaluate((el) => {
    return document.body.contains(el) && el.closest('[data-testid="crm-shell"]') === null;
  });
  expect(isPortaledToBody, "DragOverlay must portal into document.body outside crm-shell").toBe(
    true
  );

  // Assert zero cursor offset drift: pointer (endX, endY) sits directly inside overlay bounds
  const overlayBox = await overlay.boundingBox();
  expect(overlayBox, "Portaled DragOverlay boundingBox must exist mid-drag").not.toBeNull();
  expect(endX).toBeGreaterThanOrEqual(overlayBox!.x - 2);
  expect(endX).toBeLessThanOrEqual(overlayBox!.x + overlayBox!.width + 2);
  expect(endY).toBeGreaterThanOrEqual(overlayBox!.y - 2);
  expect(endY).toBeLessThanOrEqual(overlayBox!.y + overlayBox!.height + 2);

  // Assert column hover highlight & drop slot placeholder while dragging
  await expect(targetCol).toHaveAttribute("data-over-stage", "true", { timeout: 3_000 });
  const dropSlot = page.getByTestId(`kanban-drop-slot-${targetStageKey}`);
  await expect(dropSlot).toBeVisible({ timeout: 3_000 });

  console.info(
    `[KANBAN_MID_DRAG] target=${targetStageKey} pointer=(${endX.toFixed(1)},${endY.toFixed(1)}) overlayBox={x:${overlayBox!.x.toFixed(1)},y:${overlayBox!.y.toFixed(1)},w:${overlayBox!.width.toFixed(1)},h:${overlayBox!.height.toFixed(1)}} portaledToBody=${isPortaledToBody} overStage=true dropSlotVisible=true`
  );

  if (expectedDropStatus) {
    await expect(targetCol).toHaveAttribute("data-drop-status", expectedDropStatus, {
      timeout: 3_000,
    });
  } else if (releaseMode === "expect-modal-gate") {
    await expect(targetCol).toHaveAttribute("data-drop-status", "allowed_screen_required", {
      timeout: 3_000,
    });
  } else if (releaseMode === "expect-blocked") {
    await expect(targetCol).toHaveAttribute("data-drop-status", "blocked", {
      timeout: 3_000,
    });
  }

  if (midDragScreenshotName) {
    await applyThemeAndCapture(page, midDragScreenshotName, "dark", false);
  }

  if (releaseMode === "expect-auto-drop") {
    const stageResponsePromise = page.waitForResponse(
      (res) =>
        stageEndpointRegex.test(res.url()) &&
        ["POST", "PATCH", "PUT"].includes(res.request().method()),
      { timeout: 15_000 }
    );
    await page.mouse.up();
    const stageRes = await stageResponsePromise;
    expect(stageRes.status(), "Kanban stage update API must return 200 OK").toBe(200);
    await page.waitForTimeout(350);
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    return;
  }

  if (releaseMode === "expect-blocked") {
    await page.mouse.up();
    await page.waitForTimeout(350);
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    return;
  }

  await page.mouse.up();
  const transitionDialog = page.locator('[role="dialog"]').first();
  await expect(transitionDialog).toBeVisible({ timeout: 5_000 });
}

test.describe("CRM v4.0 Kanban, Sovereign Auth, Smart UX & Detail 360 Certification (Unmocked)", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(300_000);

  let sharedContext: BrowserContext;
  let sharedPage: Page;

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ...(fs.existsSync(STORAGE_STATE_PATH) ? { storageState: STORAGE_STATE_PATH } : {}),
    });
    sharedPage = await sharedContext.newPage();
  });

  test.afterEach(async () => {
    // Always save latest rotated refresh cookie while on app origin even if a test fails mid-way
    if (
      sharedPage &&
      !sharedPage.isClosed() &&
      sharedPage.url().includes("localhost:3000") &&
      !sharedPage.url().includes("/login")
    ) {
      await sharedContext.storageState({ path: STORAGE_STATE_PATH }).catch(() => {});
    }
  });

  test.afterAll(async () => {
    if (sharedContext) {
      if (
        sharedPage &&
        !sharedPage.isClosed() &&
        sharedPage.url().includes("localhost:3000") &&
        !sharedPage.url().includes("/login")
      ) {
        await sharedContext.storageState({ path: STORAGE_STATE_PATH }).catch(() => {});
      }
      await sharedContext.close().catch(() => {});
    }
  });

  test("Part A — Sovereign API Endpoints (/auth/admin/principal, /menus/navigation*) & Session Permanence", async () => {
    const page = sharedPage;
    const observer = attachNetworkObserver(page);
    await ensureAuthenticatedSession(page);

    // Clear nav store cache + backdate auth refresh timestamp so sovereign fetches execute deterministically without stubs
    await page.evaluate(() => {
      localStorage.removeItem("scr_nav_v2");
      sessionStorage.setItem("scr_last_auth_refresh", String(Date.now() - 10 * 60 * 1000));
    });

    const navPromise = page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        /\/api\/v1\/menus\/navigation(?:\?|$)/.test(res.url()),
      { timeout: 20_000 }
    );
    const navRoutesPromise = page.waitForResponse(
      (res) =>
        res.request().method() === "GET" && /\/api\/v1\/menus\/navigation\/routes/.test(res.url()),
      { timeout: 20_000 }
    );

    await page.reload({ waitUntil: "domcontentloaded" });
    expect((await navPromise).status()).toBe(200);
    expect((await navRoutesPromise).status()).toBe(200);
    await waitForDashboardSettled(page);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("text=/access denied|غير مصرح/i")).toHaveCount(0);
    await expect(page.getByTestId("crm-shell")).toBeVisible({ timeout: 15_000 });

    const tabChecks: Array<{ tabId: CrmTabId; pathRegex: RegExp }> = [
      { tabId: "deals", pathRegex: /^\/crm\/opportunities\/?$/ },
      { tabId: "contacts", pathRegex: /^\/crm\/contacts\/?$/ },
    ];
    for (const check of tabChecks) {
      await navigateToCrmTab(page, check.tabId, check.pathRegex);

      // Simulate tab switch (hidden -> visible) after stale interval and allow network to settle before reload
      await page.evaluate(() => {
        sessionStorage.setItem("scr_last_auth_refresh", String(Date.now() - 10 * 60 * 1000));
        let vis: DocumentVisibilityState = "hidden";
        Object.defineProperty(document, "visibilityState", {
          configurable: true,
          get: () => vis,
        });
        document.dispatchEvent(new Event("visibilitychange"));
        vis = "visible";
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForLoadState("networkidle").catch(() => {});

      await page.reload({ waitUntil: "domcontentloaded" });
      await waitForDashboardSettled(page);

      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.locator("text=/access denied|غير مصرح/i")).toHaveCount(0);
      await expect(page.getByTestId("crm-shell")).toBeVisible({ timeout: 15_000 });
    }

    // Trigger visibilitychange refresh explicitly and verify GET /api/v1/auth/admin/principal returns 200 OK
    const principalPromise = page.waitForResponse(
      (res) =>
        res.request().method() === "GET" && /\/api\/v1\/auth\/admin\/principal/.test(res.url()),
      { timeout: 15_000 }
    );
    await page.evaluate(() => {
      sessionStorage.setItem("scr_last_auth_refresh", String(Date.now() - 10 * 60 * 1000));
      let vis: DocumentVisibilityState = "hidden";
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => vis,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      vis = "visible";
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect((await principalPromise).status()).toBe(200);

    // Assert all 9 CRM navigation items remain visible
    const expectedTabs: CrmTabId[] = [
      "overview",
      "leads",
      "deals",
      "accounts",
      "contacts",
      "activities",
      "pipelines",
      "reports",
      "settings",
    ];
    for (const tabId of expectedTabs) {
      await expect(page.getByTestId(`crm-tab-${tabId}`)).toBeVisible({ timeout: 10_000 });
    }

    // Assert zero legacy endpoints were ever called
    const legacyHits = observer.requests.filter((r) =>
      /\/auth\/admin\/me|\/menus\/my|\/permissions\/my|\/my-tenant/i.test(r.url)
    );
    const sovereign200s = Array.from(
      new Set(
        observer.responses
          .filter(
            (r) =>
              r.status === 200 &&
              /\/api\/v1\/(?:auth\/admin\/principal|menus\/navigation(?:\/routes)?)/.test(r.url)
          )
          .map((r) => `${r.method} ${new URL(r.url).pathname}${new URL(r.url).search} -> ${r.status}`)
      )
    );
    console.info(`[SOVEREIGN_AUTH] 200 OK endpoints observed: ${sovereign200s.join(" | ")}`);
    console.info(`[SOVEREIGN_AUTH] Legacy endpoint hit count: ${legacyHits.length}`);
    observer.detach();
    expect(legacyHits, `Legacy endpoints hit: ${legacyHits.map((r) => r.url).join(", ")}`).toHaveLength(
      0
    );
    await sharedContext.storageState({ path: STORAGE_STATE_PATH });
  });

  test("Part B1 — Leads Kanban Cursor Alignment, Body Portal, Hover Slot & 1-Gesture Auto-Drop (Working <-> New)", async () => {
    const page = sharedPage;
    await ensureAuthenticatedSession(page);
    await navigateToCrmTab(page, "leads", /^\/crm\/leads\/?$/);
    await switchToKanbanIfNeeded(page, '[data-stage-key="lead.working"]');

    const workingCard = page
      .locator('[data-stage-key="lead.working"] [data-testid^="lead-kanban-card-"]')
      .first();
    await expect(workingCard).toBeVisible({ timeout: 15_000 });
    const cardTestId = await workingCard.getAttribute("data-testid");
    expect(cardTestId).toBeTruthy();

    await performKanbanPointerDrag({
      page,
      card: workingCard,
      targetStageKey: "lead.new",
      releaseMode: "expect-auto-drop",
      stageEndpointRegex: /\/api\/v1\/crm\/leads\/[^/]+\/(move-stage|stage)/,
      midDragScreenshotName: "01_leads_kanban_mid_drag_en_dark.png",
    });

    const movedInNew = page.locator(`[data-stage-key="lead.new"] [data-testid="${cardTestId}"]`);
    await expect(movedInNew).toBeVisible({ timeout: 10_000 });

    // Persist check after reload
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForDashboardSettled(page);
    await switchToKanbanIfNeeded(page, '[data-stage-key="lead.new"]');
    await expect(movedInNew).toBeVisible({ timeout: 15_000 });

    await applyThemeAndCapture(page, "05_leads_kanban_persisted_en_dark.png", "dark", true);
    await applyThemeAndCapture(page, "06_leads_kanban_persisted_en_light.png", "light", true);

    // 1-gesture return drag New -> Working (back to baseline state)
    await performKanbanPointerDrag({
      page,
      card: movedInNew,
      targetStageKey: "lead.working",
      releaseMode: "expect-auto-drop",
      stageEndpointRegex: /\/api\/v1\/crm\/leads\/[^/]+\/(move-stage|stage)/,
    });
    await expect(
      page.locator(`[data-stage-key="lead.working"] [data-testid="${cardTestId}"]`)
    ).toBeVisible({ timeout: 10_000 });

    // AR RTL Kanban mid-drag + persisted capture (client-side UI switch, zero reload)
    await setLanguageUi(page, "ar");
    await switchToKanbanIfNeeded(page, '[data-stage-key="lead.working"]');
    const workingCardAr = page.locator(
      `[data-stage-key="lead.working"] [data-testid="${cardTestId}"]`
    );
    await expect(workingCardAr).toBeVisible({ timeout: 10_000 });

    await performKanbanPointerDrag({
      page,
      card: workingCardAr,
      targetStageKey: "lead.new",
      releaseMode: "expect-auto-drop",
      stageEndpointRegex: /\/api\/v1\/crm\/leads\/[^/]+\/(move-stage|stage)/,
      midDragScreenshotName: "02_leads_kanban_mid_drag_ar_rtl_dark.png",
    });
    const movedInNewAr = page.locator(`[data-stage-key="lead.new"] [data-testid="${cardTestId}"]`);
    await expect(movedInNewAr).toBeVisible({ timeout: 10_000 });
    await applyThemeAndCapture(page, "07_leads_kanban_persisted_ar_rtl_dark.png", "dark", true);
    await applyThemeAndCapture(page, "08_leads_kanban_persisted_ar_rtl_light.png", "light", true);

    // Restore back to Working & EN
    await performKanbanPointerDrag({
      page,
      card: movedInNewAr,
      targetStageKey: "lead.working",
      releaseMode: "expect-auto-drop",
      stageEndpointRegex: /\/api\/v1\/crm\/leads\/[^/]+\/(move-stage|stage)/,
    });
    await setLanguageUi(page, "en");
    await sharedContext.storageState({ path: STORAGE_STATE_PATH });
  });

  test("Part B2 — Opportunities Kanban Auto-Drop (Qualification <-> Discovery) & Closed Lost Modal Gate", async () => {
    const page = sharedPage;
    await ensureAuthenticatedSession(page);
    await navigateToCrmTab(page, "deals", /^\/crm\/opportunities\/?$/);
    await switchToKanbanIfNeeded(page, '[data-stage-key="default.qualification"]');
    await expect(page.locator('[data-testid="kanban-card"]').first()).toBeVisible({ timeout: 15_000 });

    let qualCard = page
      .locator('[data-stage-key="default.qualification"] [data-testid="kanban-card"]')
      .first();
    if ((await qualCard.count()) === 0) {
      const discCard = page
        .locator('[data-stage-key="default.discovery"] [data-testid="kanban-card"]')
        .first();
      await expect(discCard).toBeVisible({ timeout: 15_000 });
      const seededOppId = await discCard.getAttribute("data-opportunity-id");
      expect(seededOppId).toBeTruthy();
      await performKanbanPointerDrag({
        page,
        card: discCard,
        targetStageKey: "default.qualification",
        releaseMode: "expect-auto-drop",
        stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
      });
      qualCard = page
        .locator(`[data-stage-key="default.qualification"] [data-opportunity-id="${seededOppId}"]`)
        .first();
    }
    await expect(qualCard).toBeVisible({ timeout: 15_000 });
    const oppId = await qualCard.getAttribute("data-opportunity-id");
    expect(oppId).toBeTruthy();

    // Drag Qualification -> Discovery
    await performKanbanPointerDrag({
      page,
      card: qualCard,
      targetStageKey: "default.discovery",
      releaseMode: "expect-auto-drop",
      stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
      midDragScreenshotName: "03_opportunities_kanban_mid_drag_en_dark.png",
    });

    const movedInDiscovery = page.locator(
      `[data-stage-key="default.discovery"] [data-opportunity-id="${oppId}"]`
    );
    await expect(movedInDiscovery).toBeVisible({ timeout: 10_000 });

    // Persist across reload
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForDashboardSettled(page);
    await switchToKanbanIfNeeded(page, '[data-stage-key="default.discovery"]');
    await expect(movedInDiscovery).toBeVisible({ timeout: 15_000 });

    await applyThemeAndCapture(page, "09_opportunities_kanban_persisted_en_dark.png", "dark", true);
    await applyThemeAndCapture(page, "10_opportunities_kanban_persisted_en_light.png", "light", true);

    // 1-gesture return Discovery -> Qualification
    await performKanbanPointerDrag({
      page,
      card: movedInDiscovery,
      targetStageKey: "default.qualification",
      releaseMode: "expect-auto-drop",
      stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
    });
    const backInQual = page.locator(
      `[data-stage-key="default.qualification"] [data-opportunity-id="${oppId}"]`
    );
    await expect(backInQual).toBeVisible({ timeout: 10_000 });

    // Drag Qualification -> Closed Lost and verify allowed_screen_required opens transition modal
    await performKanbanPointerDrag({
      page,
      card: backInQual,
      targetStageKey: "default.closed_lost",
      releaseMode: "expect-modal-gate",
      stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
    });
    const dialog = page.locator('[role="dialog"]').first();
    await dialog.getByRole("button", { name: /cancel|إلغاء/i }).click();
    await expect(dialog).toBeHidden({ timeout: 5_000 });
    await expect(backInQual).toBeVisible({ timeout: 5_000 });

    // AR RTL Kanban mid-drag + persisted capture (client-side UI switch, zero reload)
    await setLanguageUi(page, "ar");
    await switchToKanbanIfNeeded(page, '[data-stage-key="default.qualification"]');
    const qualCardAr = page.locator(
      `[data-stage-key="default.qualification"] [data-opportunity-id="${oppId}"]`
    );
    await expect(qualCardAr).toBeVisible({ timeout: 10_000 });

    await performKanbanPointerDrag({
      page,
      card: qualCardAr,
      targetStageKey: "default.discovery",
      releaseMode: "expect-auto-drop",
      stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
      midDragScreenshotName: "04_opportunities_kanban_mid_drag_ar_rtl_dark.png",
    });
    const movedInDiscoveryAr = page.locator(
      `[data-stage-key="default.discovery"] [data-opportunity-id="${oppId}"]`
    );
    await expect(movedInDiscoveryAr).toBeVisible({ timeout: 10_000 });
    await applyThemeAndCapture(
      page,
      "11_opportunities_kanban_persisted_ar_rtl_dark.png",
      "dark",
      true
    );
    await applyThemeAndCapture(
      page,
      "12_opportunities_kanban_persisted_ar_rtl_light.png",
      "light",
      true
    );

    // Return back to Qualification & restore EN
    await performKanbanPointerDrag({
      page,
      card: movedInDiscoveryAr,
      targetStageKey: "default.qualification",
      releaseMode: "expect-auto-drop",
      stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
    });
    await setLanguageUi(page, "en");
    await sharedContext.storageState({ path: STORAGE_STATE_PATH });
  });

  test("Part C — Smart Tip Persistence, Top-Bar Smart Guide & All 4 Detail 360 Sub-Pages (EN + AR)", async () => {
    const page = sharedPage;
    await ensureAuthenticatedSession(page);
    await navigateToCrmTab(page, "leads", /^\/crm\/leads\/?$/);

    // Reset tip preference, reload to assert visible, then dismiss and verify permanent localStorage persistence
    await page.evaluate(() => localStorage.removeItem("scripe_crm_tip_dismissed"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForDashboardSettled(page);

    const tipRibbon = page.getByTestId("crm-smart-tip-ribbon");
    await expect(tipRibbon).toBeVisible({ timeout: 10_000 });
    await page.getByTestId("crm-smart-tip-dismiss").click();
    await expect(tipRibbon).toHaveCount(0);

    const persistedTipFlag = await page.evaluate(() =>
      localStorage.getItem("scripe_crm_tip_dismissed")
    );
    expect(persistedTipFlag).toBe("1");

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForDashboardSettled(page);
    await expect(tipRibbon).toHaveCount(0);

    await navigateToCrmTab(page, "deals", /^\/crm\/opportunities\/?$/);
    await expect(tipRibbon).toHaveCount(0);

    // Top-bar Smart Guide trigger -> opens Quick Guide modal
    await page.getByTestId("crm-smart-guide-trigger").click();
    const smartGuideModal = page.getByTestId("crm-smart-guide-modal");
    await expect(smartGuideModal).toBeVisible({ timeout: 5_000 });
    await applyThemeAndCapture(page, "23_crm_smart_guide_modal_en_dark.png", "dark", false);
    await page.getByTestId("close-smart-guide-btn").click();
    await expect(smartGuideModal).toBeHidden();

    const openFirstDetailFromCurrentList = async (params: {
      rowTestIdPrefix: string;
      urlPattern: RegExp;
    }) => {
      const visibleRowLink = page
        .locator(`[data-testid^="${params.rowTestIdPrefix}"]:visible`)
        .first();
      if (!(await visibleRowLink.isVisible().catch(() => false))) {
        const tableBtn = page.getByTestId("toggle-table-view");
        if (await tableBtn.isVisible().catch(() => false)) {
          await tableBtn.click();
        }
      }
      await expect(visibleRowLink).toBeVisible({ timeout: 15_000 });
      await visibleRowLink.click();
      await page.waitForURL(params.urlPattern, { timeout: 15_000 });
      await waitForDashboardSettled(page);
    };

    const verifyDeal360 = async (lang: "en" | "ar") => {
      const tag = lang === "ar" ? "ar_rtl" : "en";
      const dealDetail = page.getByTestId("opportunity-detail-view");
      await expect(dealDetail).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId("deal-transition-audit-ledger")).toHaveCount(0);
      await assertNoRawLocaleKeys(page, `Deal 360 (${lang})`);

      const dealTabs = dealDetail.locator('[role="tab"]');
      await expect(dealTabs).toHaveCount(3);
      await dealTabs.nth(0).click();
      await expect(dealDetail.locator('[role="tabpanel"][data-state="active"]')).toBeVisible();
      await applyThemeAndCapture(page, `24_deal_360_overview_${tag}_dark.png`, "dark", true);
      await applyThemeAndCapture(page, `24_deal_360_overview_${tag}_light.png`, "light", true);

      await dealTabs.nth(1).click();
      await expect(dealTabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await expect(dealDetail.locator('[role="tabpanel"][data-state="active"]')).toBeVisible();
      await applyThemeAndCapture(page, `24_deal_360_commercial_${tag}_dark.png`, "dark", true);

      await dealTabs.nth(2).click();
      await expect(dealTabs.nth(2)).toHaveAttribute("aria-selected", "true");
      await expect(dealDetail.locator('[role="tabpanel"][data-state="active"]')).toBeVisible();
      await applyThemeAndCapture(page, `24_deal_360_activity_${tag}_dark.png`, "dark", true);
    };

    const verifyLead360 = async (lang: "en" | "ar") => {
      const tag = lang === "ar" ? "ar_rtl" : "en";
      const leadDetail = page.getByTestId("lead-detail-view");
      await expect(leadDetail).toBeVisible({ timeout: 15_000 });
      await assertNoRawLocaleKeys(page, `Lead 360 (${lang})`);
      await expect(page.getByTestId("lead-detail-edit-btn")).toBeVisible();
      const leadTabs = leadDetail.locator('[role="tab"]');
      await expect(leadTabs).toHaveCount(3);
      await leadTabs.nth(0).click();
      await applyThemeAndCapture(page, `25_lead_360_${tag}_dark.png`, "dark", true);
      await applyThemeAndCapture(page, `25_lead_360_${tag}_light.png`, "light", true);
      await leadTabs.nth(1).click();
      await expect(leadTabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await leadTabs.nth(2).click();
      await expect(leadTabs.nth(2)).toHaveAttribute("aria-selected", "true");
    };

    const verifyAccount360 = async (lang: "en" | "ar") => {
      const tag = lang === "ar" ? "ar_rtl" : "en";
      await assertNoRawLocaleKeys(page, `Account 360 (${lang})`);
      await expect(
        page
          .locator(
            'a[href*="/crm/activities?account="]:visible, button:has-text("Log Activity"):visible, a:has-text("Log Activity"):visible, a:has-text("تسجيل نشاط"):visible, button:has-text("تسجيل نشاط"):visible'
          )
          .first()
      ).toBeVisible({ timeout: 10_000 });
      await applyThemeAndCapture(page, `26_account_360_${tag}_dark.png`, "dark", true);
      await applyThemeAndCapture(page, `26_account_360_${tag}_light.png`, "light", true);
    };

    const verifyContact360 = async (lang: "en" | "ar") => {
      const tag = lang === "ar" ? "ar_rtl" : "en";
      await assertNoRawLocaleKeys(page, `Contact 360 (${lang})`);
      await expect(
        page
          .locator(
            'a[href*="/crm/activities?contact="]:visible, button:has-text("Log Activity"):visible, a:has-text("Log Activity"):visible, a:has-text("تسجيل نشاط"):visible, button:has-text("تسجيل نشاط"):visible'
          )
          .first()
      ).toBeVisible({ timeout: 10_000 });
      await applyThemeAndCapture(page, `27_contact_360_${tag}_dark.png`, "dark", true);
      await applyThemeAndCapture(page, `27_contact_360_${tag}_light.png`, "light", true);
    };

    // 1. Deal 360 (EN -> AR on-page, zero reloads)
    await openFirstDetailFromCurrentList({
      rowTestIdPrefix: "deal-row-link-",
      urlPattern: /\/crm\/opportunities\/[^/?#]+/,
    });
    await verifyDeal360("en");
    await setLanguageUi(page, "ar");
    await verifyDeal360("ar");

    // 2. Lead 360 (AR -> EN on-page, zero reloads) — open a non-terminal lead so header actions are editable
    await navigateToCrmTab(page, "leads", /^\/crm\/leads\/?$/);
    const tableBtn = page.getByTestId("toggle-table-view");
    if (await tableBtn.isVisible().catch(() => false)) {
      await tableBtn.click();
    }
    const activeLeadLink = page
      .locator("tbody tr")
      .filter({ hasNotText: /Converted|Disqualified|تم التحويل|مستبعد/i })
      .locator('[data-testid^="lead-row-link-"]:visible')
      .first();
    await expect(activeLeadLink).toBeVisible({ timeout: 15_000 });
    await activeLeadLink.click();
    await page.waitForURL(/\/crm\/leads\/[^/?#]+/, { timeout: 15_000 });
    await waitForDashboardSettled(page);
    await verifyLead360("ar");
    await setLanguageUi(page, "en");
    await verifyLead360("en");

    // 3. Account 360 (EN -> AR on-page, zero reloads)
    await navigateToCrmTab(page, "accounts", /^\/crm\/accounts\/?$/);
    await openFirstDetailFromCurrentList({
      rowTestIdPrefix: "account-row-link-",
      urlPattern: /\/crm\/accounts\/[^/?#]+/,
    });
    await verifyAccount360("en");
    await setLanguageUi(page, "ar");
    await verifyAccount360("ar");

    // 4. Contact 360 (AR -> EN on-page, zero reloads)
    await navigateToCrmTab(page, "contacts", /^\/crm\/contacts\/?$/);
    await openFirstDetailFromCurrentList({
      rowTestIdPrefix: "contact-row-link-",
      urlPattern: /\/crm\/contacts\/[^/?#]+/,
    });
    await verifyContact360("ar");
    await setLanguageUi(page, "en");
    await verifyContact360("en");

    await sharedContext.storageState({ path: STORAGE_STATE_PATH });
  });

  test("Part D — Complete 1440x900 PNG Screenshot Matrix (All 9 CRM Pages + 2D Workflow Studio, EN & AR RTL, Dark & Light)", async () => {
    const page = sharedPage;
    await ensureAuthenticatedSession(page);

    const pagesMatrix: Array<{
      tabId: CrmTabId;
      pathRegex: RegExp;
      prefix: string;
      label: string;
    }> = [
      { tabId: "overview", pathRegex: /^\/crm\/?$/, prefix: "13_crm_overview", label: "CRM Overview" },
      { tabId: "leads", pathRegex: /^\/crm\/leads\/?$/, prefix: "14_crm_leads", label: "CRM Leads" },
      { tabId: "deals", pathRegex: /^\/crm\/opportunities\/?$/, prefix: "15_crm_opportunities", label: "CRM Opportunities" },
      { tabId: "accounts", pathRegex: /^\/crm\/accounts\/?$/, prefix: "16_crm_accounts", label: "CRM Accounts" },
      { tabId: "contacts", pathRegex: /^\/crm\/contacts\/?$/, prefix: "17_crm_contacts", label: "CRM Contacts" },
      { tabId: "activities", pathRegex: /^\/crm\/activities\/?$/, prefix: "18_crm_activities", label: "CRM Activities" },
      { tabId: "pipelines", pathRegex: /^\/crm\/pipelines\/?$/, prefix: "19_crm_pipelines", label: "CRM Pipelines" },
      { tabId: "reports", pathRegex: /^\/crm\/reports\/?$/, prefix: "21_crm_reports", label: "CRM Reports" },
      { tabId: "settings", pathRegex: /^\/crm\/settings\/?$/, prefix: "22_crm_settings", label: "CRM Settings" },
    ];

    for (const lang of ["en", "ar"] as const) {
      await navigateToCrmTab(page, "overview", /^\/crm\/?$/);
      await setLanguageUi(page, lang);
      const tag = lang === "ar" ? "ar_rtl" : "en";

      for (const entry of pagesMatrix) {
        await navigateToCrmTab(page, entry.tabId, entry.pathRegex);
        await expect(page.getByTestId("crm-shell")).toBeVisible({ timeout: 15_000 });
        await expect(page.locator("text=/access denied|غير مصرح/i")).toHaveCount(0);
        await assertNoRawLocaleKeys(page, `${entry.label} (${lang})`);

        await applyThemeAndCapture(page, `${entry.prefix}_${tag}_dark.png`, "dark", true);
        await applyThemeAndCapture(page, `${entry.prefix}_${tag}_light.png`, "light", true);

        if (entry.tabId === "pipelines") {
          await expect(page.getByTestId("workflow-edit-studio-wf-deal-default")).toBeVisible({
            timeout: 15_000,
          });
          await page.getByTestId("workflow-edit-studio-wf-deal-default").click();
          const studioRoot = page.getByTestId("crm-workflow-fullscreen-studio");
          await expect(studioRoot).toBeVisible({ timeout: 10_000 });
          await page.getByTestId("canvas-tidy-auto-layout-btn").click();
          await page.waitForTimeout(350);
          await applyThemeAndCapture(
            page,
            `20_crm_workflow_studio_2d_${tag}_dark.png`,
            "dark",
            false
          );
          await applyThemeAndCapture(
            page,
            `20_crm_workflow_studio_2d_${tag}_light.png`,
            "light",
            false
          );
          await page.getByTestId("studio-back-to-list-btn").click();
          await expect(page.getByTestId("crm-pipelines-list-page")).toBeVisible({
            timeout: 10_000,
          });
        }
      }
    }

    await setLanguageUi(page, "en");
    await sharedContext.storageState({ path: STORAGE_STATE_PATH });

    // Capture SCRIPE-Docs-Portal /archify SSOT with crm-kanban-auth-ux-architecture open
    await page.goto("http://localhost:3002/archify/crm-kanban-auth-ux-architecture", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle").catch(() => {});
    const archifyFrame = page.locator('iframe[src*="crm-kanban-auth-ux-architecture"]').first();
    await expect(archifyFrame).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(800);
    await applyThemeAndCapture(
      page,
      "28_docs_portal_archify_crm_certification_dark.png",
      "dark",
      false
    );
    await applyThemeAndCapture(
      page,
      "28_docs_portal_archify_crm_certification_light.png",
      "light",
      false
    );
  });

  test("Part G — Dynamic Workflow Graph Enforcement (Bug 1) & 2D Studio Directed Wire Creation (Bug 2)", async () => {
    const page = sharedPage;
    if (!page.url().includes("localhost:3000")) {
      await page.goto("/crm/opportunities", { waitUntil: "domcontentloaded" });
      await waitForDashboardSettled(page);
    }
    await ensureAuthenticatedSession(page);
    await navigateToCrmTab(page, "deals", /^\/crm\/opportunities\/?$/);
    await setLanguageUi(page, "en");
    await switchToKanbanIfNeeded(page, '[data-stage-key="default.solution_fit"]');
    await expect(page.locator('[data-testid="kanban-card"]').first()).toBeVisible({ timeout: 15_000 });

    // Locate a deal in Solution Fit (or move one from Qualification cleanly if Solution Fit is empty)
    let solFitCard = page
      .locator('[data-stage-key="default.solution_fit"] [data-testid="kanban-card"]')
      .first();
    if ((await solFitCard.count()) === 0) {
      const qualCard = page
        .locator('[data-stage-key="default.qualification"] [data-testid="kanban-card"]')
        .first();
      await expect(qualCard).toBeVisible({ timeout: 15_000 });
      const seededOppId = await qualCard.getAttribute("data-opportunity-id");
      expect(seededOppId).toBeTruthy();
      await performKanbanPointerDrag({
        page,
        card: qualCard,
        targetStageKey: "default.solution_fit",
        releaseMode: "expect-auto-drop",
        stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
      });
      solFitCard = page
        .locator(`[data-stage-key="default.solution_fit"] [data-opportunity-id="${seededOppId}"]`)
        .first();
    }
    await expect(solFitCard).toBeVisible({ timeout: 15_000 });
    const solFitOppId = await solFitCard.getAttribute("data-opportunity-id");
    expect(solFitOppId).toBeTruthy();

    // G1 (Bug 1): Drag Solution Fit -> Discovery on canonical 9-transition pipeline (unconnected -> blocked, zero dialog)
    await performKanbanPointerDrag({
      page,
      card: solFitCard,
      targetStageKey: "default.discovery",
      releaseMode: "expect-blocked",
      expectedDropStatus: "blocked",
      stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
      midDragScreenshotName: "bug1-unconnected-solution-fit-to-discovery-blocked.png",
    });

    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(
      page.locator(`[data-stage-key="default.solution_fit"] [data-opportunity-id="${solFitOppId}"]`)
    ).toBeVisible({ timeout: 5_000 });

    // G2 (Bug 2): Open 2D Studio on wf-deal-default, draw directed wire FROM Solution Fit TO Discovery
    await navigateToCrmTab(page, "pipelines", /^\/crm\/pipelines\/?$/);
    await expect(page.getByTestId("workflow-edit-studio-wf-deal-default")).toBeVisible({
      timeout: 15_000,
    });
    await page.getByTestId("workflow-edit-studio-wf-deal-default").click();
    const studioRoot = page.getByTestId("crm-workflow-fullscreen-studio");
    await expect(studioRoot).toBeVisible({ timeout: 10_000 });

    const canvasSurface = page.getByTestId("crm-2d-graph-surface");
    const solFitNode = page.getByTestId("canvas-node-default.solution_fit");
    const discNode = page.getByTestId("canvas-node-default.discovery");
    await expect(solFitNode).toBeVisible({ timeout: 10_000 });
    await expect(discNode).toBeVisible({ timeout: 10_000 });

    // Fit / zoom out until both Solution Fit and Discovery sit inside the interactive 2D surface
    const resetZoomBtn = page.getByTestId("canvas-reset-zoom-btn");
    if (await resetZoomBtn.isVisible().catch(() => false)) {
      await resetZoomBtn.click();
      await page.waitForTimeout(250);
    }
    for (let z = 0; z < 4; z++) {
      const surfaceBox = await canvasSurface.boundingBox();
      const sBox = await solFitNode.boundingBox();
      const dBox = await discNode.boundingBox();
      const bothInside =
        surfaceBox &&
        sBox &&
        dBox &&
        sBox.x >= surfaceBox.x + 12 &&
        dBox.x >= surfaceBox.x + 12 &&
        sBox.x + sBox.width <= surfaceBox.x + surfaceBox.width - 12 &&
        dBox.x + dBox.width <= surfaceBox.x + surfaceBox.width - 12 &&
        sBox.y >= surfaceBox.y + 12 &&
        dBox.y >= surfaceBox.y + 12 &&
        sBox.y + sBox.height <= surfaceBox.y + surfaceBox.height - 12 &&
        dBox.y + dBox.height <= surfaceBox.y + surfaceBox.height - 12;
      if (bothInside) break;
      await page.getByTestId("canvas-zoom-out-btn").click();
      await page.waitForTimeout(200);
    }

    await solFitNode.hover();
    await page.waitForTimeout(150);

    const sourcePort = page.getByTestId("node-port-default.solution_fit-bottom-2");
    await expect(sourcePort).toBeVisible({ timeout: 5_000 });
    const sourcePortBox = await sourcePort.boundingBox();
    expect(sourcePortBox, "Solution Fit bottom-2 source port boundingBox must exist").not.toBeNull();

    const targetPort = page.getByTestId("node-port-default.discovery-right-2");
    const targetPortBox = (await targetPort.isVisible().catch(() => false))
      ? await targetPort.boundingBox()
      : null;
    const targetNodeBox = await discNode.boundingBox();
    expect(targetNodeBox, "Discovery target node boundingBox must exist").not.toBeNull();

    const wireStartX = sourcePortBox!.x + sourcePortBox!.width * 0.5;
    const wireStartY = sourcePortBox!.y + sourcePortBox!.height * 0.5;
    const wireEndX = targetPortBox
      ? targetPortBox.x + targetPortBox.width * 0.5
      : targetNodeBox!.x + targetNodeBox!.width * 0.5;
    const wireEndY = targetPortBox
      ? targetPortBox.y + targetPortBox.height * 0.5
      : targetNodeBox!.y + targetNodeBox!.height * 0.5;

    await page.mouse.move(wireStartX, wireStartY);
    await page.mouse.down();
    await page.mouse.move(wireStartX, wireStartY + 18, { steps: 6 });
    await page.mouse.move(wireEndX, wireEndY, { steps: 24 });
    await page.waitForTimeout(150);
    await page.mouse.up();

    const addTransitionModal = page.getByTestId("add-transition-modal");
    await expect(addTransitionModal).toBeVisible({ timeout: 8_000 });
    await expect(page.getByTestId("new-transition-from-select")).toContainText(/Solution Fit/i);
    await expect(page.getByTestId("new-transition-to-select")).toContainText(/Discovery/i);
    await page.getByTestId("new-transition-name-en-input").fill("Return to Discovery");
    await page.getByTestId("new-transition-name-ar-input").fill("العودة إلى الاستكشاف");

    await applyThemeAndCapture(
      page,
      "bug2-studio-wire-solution-fit-to-discovery-modal.png",
      "dark",
      false
    );

    await page.getByTestId("new-transition-submit-btn").click();
    await expect(addTransitionModal).toBeHidden({ timeout: 5_000 });

    const savePipelineBtn = page.getByTestId("save-pipeline-config-btn");
    await expect(savePipelineBtn).toBeEnabled({ timeout: 5_000 });
    const savePromise = page.waitForResponse(
      (res) =>
        /\/api\/v1\/crm\/pipelines(?:\/|$|\?)/.test(res.url()) &&
        ["PUT", "POST", "PATCH"].includes(res.request().method()),
      { timeout: 15_000 }
    );
    await savePipelineBtn.click();
    const saveRes = await savePromise;
    expect(saveRes.status(), "Save & Publish pipeline PUT must return 200 OK").toBe(200);
    await waitForDashboardSettled(page);

    await page.getByTestId("studio-back-to-list-btn").click();
    await expect(page.getByTestId("crm-pipelines-list-page")).toBeVisible({ timeout: 10_000 });

    // Verify dynamic Solution Fit -> Discovery transition works instantly (0 modal) on Kanban & persists across reload
    await navigateToCrmTab(page, "deals", /^\/crm\/opportunities\/?$/);
    await switchToKanbanIfNeeded(page, '[data-stage-key="default.solution_fit"]');
    const configuredSolFitCard = page
      .locator(`[data-stage-key="default.solution_fit"] [data-opportunity-id="${solFitOppId}"]`)
      .first();
    await expect(configuredSolFitCard).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(300);

    await performKanbanPointerDrag({
      page,
      card: configuredSolFitCard,
      targetStageKey: "default.discovery",
      releaseMode: "expect-auto-drop",
      expectedDropStatus: "allowed_instant",
      stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
    });

    const movedToDiscoveryCard = page
      .locator(`[data-stage-key="default.discovery"] [data-opportunity-id="${solFitOppId}"]`)
      .first();
    await expect(movedToDiscoveryCard).toBeVisible({ timeout: 10_000 });

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForDashboardSettled(page);
    await switchToKanbanIfNeeded(page, '[data-stage-key="default.discovery"]');
    await expect(movedToDiscoveryCard).toBeVisible({ timeout: 15_000 });

    await applyThemeAndCapture(
      page,
      "bug1-dynamic-configured-instant-move-verified.png",
      "dark",
      true
    );

    // Cleanup Step 1: Move deal back Discovery -> Qualification -> Solution Fit via canonical transitions
    await performKanbanPointerDrag({
      page,
      card: movedToDiscoveryCard,
      targetStageKey: "default.qualification",
      releaseMode: "expect-auto-drop",
      expectedDropStatus: "allowed_instant",
      stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
    });
    const backQualCard = page
      .locator(`[data-stage-key="default.qualification"] [data-opportunity-id="${solFitOppId}"]`)
      .first();
    await expect(backQualCard).toBeVisible({ timeout: 10_000 });
    await performKanbanPointerDrag({
      page,
      card: backQualCard,
      targetStageKey: "default.solution_fit",
      releaseMode: "expect-auto-drop",
      expectedDropStatus: "allowed_instant",
      stageEndpointRegex: /\/api\/v1\/crm\/opportunities\/[^/]+\/stage/,
    });
    await expect(
      page.locator(`[data-stage-key="default.solution_fit"] [data-opportunity-id="${solFitOppId}"]`)
    ).toBeVisible({ timeout: 10_000 });

    // Cleanup Step 2: Remove temporary Solution Fit -> Discovery transition from wf-deal-default and Save & Publish
    await navigateToCrmTab(page, "pipelines", /^\/crm\/pipelines\/?$/);
    await expect(page.getByTestId("workflow-edit-studio-wf-deal-default")).toBeVisible({
      timeout: 15_000,
    });
    await page.getByTestId("workflow-edit-studio-wf-deal-default").click();
    await expect(studioRoot).toBeVisible({ timeout: 10_000 });
    await page.getByTestId("workflow-mode-text").click();
    const textTable = page.getByTestId("workflow-text-mode-table");
    await expect(textTable).toBeVisible({ timeout: 5_000 });
    const rows = textTable.locator("tbody tr");
    const rowCount = await rows.count();
    let clickedTempRow = false;
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const fromCellText = (await row.locator("td").nth(1).innerText()).trim();
      const toCellText = (await row.locator("td").nth(2).innerText()).trim();
      if (/Solution Fit/i.test(fromCellText) && /Discovery/i.test(toCellText)) {
        await row.click();
        clickedTempRow = true;
        break;
      }
    }
    expect(clickedTempRow, "Temporary Solution Fit -> Discovery row must exist for cleanup").toBe(
      true
    );

    await page.getByTestId("inspector-bottom-delete-transition-btn").click();
    await expect(savePipelineBtn).toBeEnabled({ timeout: 5_000 });
    const cleanupSavePromise = page.waitForResponse(
      (res) =>
        /\/api\/v1\/crm\/pipelines(?:\/|$|\?)/.test(res.url()) &&
        ["PUT", "POST", "PATCH"].includes(res.request().method()),
      { timeout: 15_000 }
    );
    await savePipelineBtn.click();
    const cleanupSaveRes = await cleanupSavePromise;
    expect(cleanupSaveRes.status(), "Cleanup pipeline PUT must return 200 OK").toBe(200);
    await waitForDashboardSettled(page);
    await page.getByTestId("studio-back-to-list-btn").click();
    await expect(page.getByTestId("crm-pipelines-list-page")).toBeVisible({ timeout: 10_000 });

    await sharedContext.storageState({ path: STORAGE_STATE_PATH });
  });
});
