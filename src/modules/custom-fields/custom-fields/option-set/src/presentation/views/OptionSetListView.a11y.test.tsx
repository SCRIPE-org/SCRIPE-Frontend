/**
 * OptionSetListView -- accessible structure of the Option Sets screen (P-4)
 *
 * Four structural properties, each of which can break silently because nothing about a broken one is
 * visible on screen:
 *
 *  1. ONE h1. `PageHeader` owns it; the detail panel's set heading is an h2 and the sections below it
 *     are h3s. A second h1 would give a screen-reader user two "page titles" for one page, and the
 *     mistake is invisible to a sighted reviewer.
 *  2. EVERY INTERACTIVE CONTROL HAS A NAME. Asserted by asking testing-library for the controls
 *     matching a non-empty accessible NAME and comparing that count to the total -- so the real
 *     accessible-name computation runs, not a `textContent` approximation that would happily pass an
 *     icon-only button whose `aria-label` was dropped. The row Edit/Delete buttons are the live risk
 *     here: they repeat per row, so their names are qualified with the set's own label.
 *  3. THE TABLE HAS REAL COLUMN HEADERS. `@core/ui/table` renders a genuine `<table>`, and the headers
 *     are what let a screen reader announce "Key" while reading a key cell. A layout built from divs
 *     looks identical and announces nothing.
 *  4. THE DIALOG IS LABELLED. Radix wires `aria-labelledby` from `DialogTitle`; a dialog whose title
 *     moved out of that component announces as an unnamed dialog.
 *  5. A CONTROL'S NAME CONTAINS THE WORDS IT DISPLAYS (WCAG 2.5.3, Label in Name). An `aria-label`
 *     REPLACES the visible text rather than adding to it, so one sharing no word with the label on
 *     screen leaves a voice-control user asking for a button the platform cannot see, and announces
 *     an action other than the one the button performs. The panel's close control is the case pinned
 *     here; every other repeated name on this screen already prefixes its visible text.
 *  6. EACH OF THE PANEL'S SECTIONS IS NAMED. The chain heading names the chain table, the
 *     create-draft heading names its group, and the opened version's heading names the group holding
 *     the options table and Publish. An id minted and applied with no `aria-labelledby` pointing at
 *     it names nothing at all, and nothing about that is visible on screen.
 *
 * Plus one behavioural property that belongs with them, because it is the requirement most likely to
 * be softened into a disabled button by a later change: A PLATFORM-MAINTAINED SET OFFERS NO WRITE
 * CONTROL AT ALL. The backend refuses all five mutating paths on a system-managed set for every
 * caller, so a disabled-but-present Edit is a control for a state that cannot be reached.
 *
 * The second describe block carries the same properties for `OptionSetDetailPanel`, plus the one seam
 * in this screen that is not a straight prop hand-off: the options table reports changes as a
 * complete next list while the editor hook owns the working copy behind named operations, and the
 * panel recovers the operation from the two. A wrong recovery has no visible symptom other than an
 * edit that will not take, so each branch is exercised through real DOM events. It lives here because
 * this is the only test path the views own in this submodule.
 *
 * The third block is not about the accessibility tree at all: it pins the LAYERING rule these views
 * live under -- a view uses viewmodels and reaches the DI container through none of its own. That has
 * no runtime symptom to render, so it is read off the real source, the way the sibling
 * `CustomFieldListView.*.test.ts` files pin their structural rules. It is here for the same reason
 * the editor-seam tests are: this file is the views' only test path in this submodule.
 *
 * Deliberately NOT asserted: anything about styling, tone or class names. This file is about the
 * accessibility tree, and a colour assertion here would fail on a design change that broke nothing.
 *
 * Every permission is granted in these fixtures ON PURPOSE. A test run with no permissions would pass
 * property 2 trivially -- there would be almost no controls to name -- and would never see the row
 * actions at all. The last case in the first block withholds them all, which is the other half.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import type { ReactNode } from "react";

/**
 * `t` returns the KEY, so every assertion below reads as the locale path it pins rather than as
 * English prose a translator could reword out from under it.
 *
 * Interpolated values ARE appended, unlike the flat key-only stub the sibling Field Groups test uses.
 * That is not decoration: the row-qualified accessible names on this screen -- `Open version 3`,
 * `Move option down 1` -- are built by passing the position INTO `t`, so a stub that discarded
 * parameters would make N rows produce N identical names and would silently pass the exact defect
 * those names exist to prevent.
 */
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key} ${Object.values(params).join(" ")}` : key,
    language: "en",
    direction: "ltr",
    setLanguage: () => {},
    registerBothLanguages: () => {},
    markModuleLoaded: () => {},
    isModuleLoaded: () => true,
  }),
}));

/**
 * Permissions are granted or withheld WHOLESALE here, never keyed by name.
 *
 * Which backend key gates which action is `useOptionSetViewModel`'s contract and is pinned by that
 * hook's own tests against the real permission constants. Re-pinning the key strings in a view test
 * would duplicate that assertion while making this file fail for a reason that has nothing to do with
 * the accessibility tree it exists to guard. What this file does pin is the CONSEQUENCE: with nothing
 * granted, no write affordance is rendered at all.
 */
const permissionState = { grantAll: true };

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    hasPermission: () => permissionState.grantAll,
    isSuperAdmin: false,
  }),
}));
vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => ({ isInTenantWorld: true }),
}));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

const getAll = vi.fn();
const getById = vi.fn();
const getVersion = vi.fn();

vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: () => ({
    optionSetRepository: { getAll, getById, getVersion },
  }),
}));

import { OptionSetListView } from "./OptionSetListView";
import { OptionSet } from "../../domain/entities/OptionSet";
import { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import { OptionSetItem } from "../../domain/entities/OptionSetItem";

/* ── Fixtures ─────────────────────────────────────────────────────────────────────────────────── */

/** An ordinary tenant-owned set: every write is offered on it. */
const editableSet = new OptionSet({
  id: "set-1",
  stableKey: "training_intensity",
  labelEn: "Training intensity",
  labelAr: "شدة التدريب",
  description: "How hard a session is",
  isSystemManaged: false,
  isPlatformOwned: false,
  versionCount: 2,
  publishedVersionId: "ver-2",
  publishedVersionNumber: 2,
});

/**
 * The version chain as the DETAIL response carries it: summary rows, `items` null.
 *
 * Null is not "empty" here -- it is "not loaded" -- and the distinction is the reason the panel has a
 * second read at all. Newest first, matching the server's order.
 */
const draftSummary = new OptionSetVersion({
  id: "ver-3",
  optionSetId: "set-1",
  versionNumber: 3,
  status: "Draft",
  publishedAtUtc: null,
  items: null,
  itemCount: 2,
});

const publishedSummary = new OptionSetVersion({
  id: "ver-2",
  optionSetId: "set-1",
  versionNumber: 2,
  status: "Published",
  publishedAtUtc: "2026-05-04T09:30:00Z",
  items: null,
  itemCount: 2,
});

/** The same draft as `GET versions/{id}` returns it: items loaded, so it is saveable from. */
const draftLoaded = new OptionSetVersion({
  id: "ver-3",
  optionSetId: "set-1",
  versionNumber: 3,
  status: "Draft",
  publishedAtUtc: null,
  items: [
    new OptionSetItem({
      id: "item-1",
      key: "low",
      labelEn: "Low",
      labelAr: null,
      color: null,
      iconKey: null,
      sortOrder: 0,
      status: "Active",
    }),
    new OptionSetItem({
      id: "item-2",
      key: "high",
      labelEn: "High",
      labelAr: null,
      color: null,
      iconKey: null,
      sortOrder: 1,
      status: "Active",
    }),
  ],
  itemCount: 2,
});

/** A seeded platform list. The backend refuses every mutating path on it, for every caller. */
const systemManagedSet = new OptionSet({
  id: "set-2",
  stableKey: "iso_country",
  labelEn: "Countries",
  labelAr: null,
  description: null,
  isSystemManaged: true,
  isPlatformOwned: true,
  versionCount: 1,
  publishedVersionId: "ver-1",
  publishedVersionNumber: 1,
});

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/**
 * Renders the screen and waits for the list read to land.
 *
 * The wait is on a CELL rather than on the loading placeholder disappearing: the placeholder is a
 * `role="status"` div that would also be gone if the query had failed, and an assertion two different
 * outcomes both satisfy pins nothing.
 */
async function renderScreen() {
  render(<OptionSetListView />, { wrapper });
  await waitFor(() => {
    expect(screen.getByText("Training intensity")).toBeInTheDocument();
  });
}

/**
 * How many of a role's elements have a non-empty accessible name.
 *
 * `{ name: /\S/ }` runs testing-library's real accessible-name computation and matches only names
 * carrying at least one non-whitespace character, so a control with no name -- or one named by a
 * whitespace-only string -- is excluded and the count falls short of the total.
 */
function nameCoverage(role: string): { total: number; named: number } {
  return {
    total: screen.queryAllByRole(role).length,
    named: screen.queryAllByRole(role, { name: /\S/ }).length,
  };
}

/* ── Tests ────────────────────────────────────────────────────────────────────────────────────── */

describe("OptionSetListView — accessible structure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    permissionState.grantAll = true;
    getAll.mockResolvedValue([editableSet, systemManagedSet]);
    getById.mockRejectedValue(new Error("no set is selected in these fixtures"));
    getVersion.mockRejectedValue(new Error("no version is opened in these fixtures"));
  });

  it("exposes exactly one level-1 heading", async () => {
    await renderScreen();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("optionSet.title");
  });

  it("gives every button and link an accessible name", async () => {
    await renderScreen();

    // Guards the guard: if the screen rendered no controls, the coverage check below would pass
    // vacuously. Two rows plus the header action is the minimum this fixture must produce.
    const buttons = nameCoverage("button");
    expect(buttons.total).toBeGreaterThan(3);
    expect(buttons.named).toBe(buttons.total);

    const links = nameCoverage("link");
    expect(links.total).toBeGreaterThan(0);
    expect(links.named).toBe(links.total);
  });

  it("qualifies each row's write controls with the set they act on", async () => {
    await renderScreen();

    // The row actions are the only names that repeat per row, so they are the only ones that can
    // collapse into several identically named controls.
    expect(
      screen.getByRole("button", { name: "common.edit Training intensity" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "common.delete Training intensity" })
    ).toBeInTheDocument();
  });

  it("renders the set list as a table with a header per column", async () => {
    await renderScreen();

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "optionSet.columns.label",
      "optionSet.columns.stableKey",
      "optionSet.columns.description",
      "optionSet.columns.scope",
      "optionSet.columns.versions",
      "optionSet.columns.publishedVersion",
      "common.actions",
    ]);
  });

  it("labels the create dialog from its title", async () => {
    await renderScreen();

    fireEvent.click(screen.getByRole("button", { name: "optionSet.addNew" }));

    expect(await screen.findByRole("dialog", { name: "optionSet.addNew" })).toBeInTheDocument();
  });

  it("offers no edit or delete control on a platform-maintained set", async () => {
    await renderScreen();

    // The row is present and badged...
    expect(screen.getByText("Countries")).toBeInTheDocument();
    expect(screen.getByText("optionSet.badge.systemManaged")).toBeInTheDocument();

    // ...and carries no write affordance at all, disabled or otherwise. Asserted by NAME so a
    // rendered-but-disabled button would still fail: `queryByRole` finds disabled buttons.
    expect(screen.queryByRole("button", { name: "common.edit Countries" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "common.delete Countries" })
    ).not.toBeInTheDocument();
  });

  it("renders no list and no write control without the option-set permissions", async () => {
    permissionState.grantAll = false;
    render(<OptionSetListView />, { wrapper });

    // The read stays idle rather than firing a request every pre-existing role would get a 403 for,
    // so the screen names the missing permission instead of showing an empty table.
    expect(await screen.findByText("optionSet.permissions.view")).toBeInTheDocument();
    expect(getAll).not.toHaveBeenCalled();

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "optionSet.addNew" })).not.toBeInTheDocument();
  });
});

/* ── The detail panel, driven through the screen ──────────────────────────────────────────────── */

/**
 * Selects a set and waits for its version chain.
 *
 * Drives the real screen rather than mounting `OptionSetDetailPanel` directly, because the panel's
 * contract includes being remounted per set and being handed gates the viewmodel resolved -- both of
 * which a direct mount would fake.
 */
async function selectEditableSet() {
  await renderScreen();
  fireEvent.click(screen.getByRole("button", { name: "Training intensity" }));
  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "optionSet.versions.openVersion 3" })
    ).toBeInTheDocument();
  });
}

/** Opens the draft version and waits for its options table to hydrate. */
async function openDraftVersion() {
  await selectEditableSet();
  fireEvent.click(screen.getByRole("button", { name: "optionSet.versions.openVersion 3" }));
  await waitFor(() => {
    expect(
      screen.getByRole("textbox", { name: "optionSet.items.fields.key 1" })
    ).toBeInTheDocument();
  });
}

function keyInput(position: number): HTMLInputElement {
  return screen.getByRole("textbox", {
    name: `optionSet.items.fields.key ${position}`,
  }) as HTMLInputElement;
}

describe("OptionSetListView — the detail panel and its editor seam", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    permissionState.grantAll = true;
    getAll.mockResolvedValue([editableSet, systemManagedSet]);
    getById.mockResolvedValue({
      set: editableSet,
      versions: [draftSummary, publishedSummary],
    });
    getVersion.mockResolvedValue(draftLoaded);
  });

  it("names each version's open control by its version number", async () => {
    await selectEditableSet();

    // Two rows, two distinguishable controls. A name built without the number would make these one
    // ambiguous control repeated, which `getByRole` would then refuse to resolve at all.
    expect(
      screen.getByRole("button", { name: "optionSet.versions.openVersion 3" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "optionSet.versions.openVersion 2" })
    ).toBeInTheDocument();
  });

  it("keeps a single level-1 heading once the panel is open", async () => {
    await selectEditableSet();

    // The panel's own headings are h2/h3. A second h1 here would give the page two titles.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const buttons = nameCoverage("button");
    expect(buttons.named).toBe(buttons.total);
  });

  it("names the panel's close control with the words it displays", async () => {
    await selectEditableSet();

    // WCAG 2.5.3, Label in Name. The visible word LEADS the announced name, so "click Close" reaches
    // this control and the announcement describes what pressing it does. The name it used to carry
    // -- `optionSet.backToList` -- replaced the visible text with a sentence sharing not one word
    // with it, and described a navigation that never happens: the list stays rendered above.
    const close = screen.getByRole("button", { name: "common.close Training intensity" });
    expect(close).toHaveTextContent("common.close");
    expect(screen.queryByRole("button", { name: "optionSet.backToList" })).not.toBeInTheDocument();
  });

  it("renders the version chain as a table with a header per column", async () => {
    await selectEditableSet();

    // Two tables now -- the set list and the chain -- so the chain's headers are the tail of the list.
    expect(screen.getAllByRole("table")).toHaveLength(2);
    expect(
      screen
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent)
        .slice(7)
    ).toEqual([
      "optionSet.columns.versions",
      "common.status",
      "optionSet.versions.publishedAt",
      "optionSet.items.title",
      "common.actions",
    ]);
  });

  it("names the opened version's region from the version heading inside it", async () => {
    await openDraftVersion();

    // The region an admin edits and publishes from. Its heading id was minted and applied with no
    // `aria-labelledby` pointing at it, so the group announced with no name while the two sections
    // beside it -- the chain table and the create-draft group -- both had one.
    const openVersion = screen.getByRole("group", {
      name: "optionSet.versions.versionLabel 3",
    });
    expect(openVersion).toContainElement(
      screen.getByRole("button", { name: "optionSet.versions.publish" })
    );
    expect(openVersion).toContainElement(keyInput(1));
  });

  /*
   * The five tests below cover the one seam in this screen that is not a straight prop hand-off:
   * `OptionSetItemsEditor` reports each change as a COMPLETE next list, while
   * `useOptionSetVersionEditor` owns the working copy behind named operations. `OptionSetDetailPanel`
   * recovers the operation from the two lists. If that recovery is wrong the table simply stops
   * responding -- every input is controlled by the hook, so a dropped operation renders as an edit
   * that will not take, with no error anywhere. Each branch of the recovery gets a test, driven
   * through real DOM events.
   *
   * They live in this file because it is the only test path in this submodule that the views own.
   */

  it("applies a keystroke in the options table back onto the working copy", async () => {
    await openDraftVersion();

    fireEvent.change(keyInput(1), { target: { value: "medium" } });

    // Controlled by the hook: this value only appears if the edit round-tripped through it.
    await waitFor(() => expect(keyInput(1).value).toBe("medium"));
  });

  it("appends a blank row when the table asks for one", async () => {
    await openDraftVersion();

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.add" }));

    await waitFor(() => expect(keyInput(3).value).toBe(""));
    expect(keyInput(1).value).toBe("low");
  });

  it("removes only the row it was asked to remove, and only a row the server never saw", async () => {
    await openDraftVersion();

    // The two loaded options carry server ids, so the table offers deactivate for them and remove
    // only for the row added here -- which is exactly the row this drops again.
    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.add" }));
    await waitFor(() => expect(keyInput(3)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.remove 3" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("textbox", { name: "optionSet.items.fields.key 3" })
      ).not.toBeInTheDocument()
    );
    expect(keyInput(1).value).toBe("low");
    expect(keyInput(2).value).toBe("high");
  });

  it("reorders through the move buttons rather than a drag gesture", async () => {
    await openDraftVersion();

    expect(keyInput(1).value).toBe("low");
    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.moveDown 1" }));

    // Position IS order here: the two rows swap, and `sortOrder` is re-derived at save time.
    await waitFor(() => expect(keyInput(1).value).toBe("high"));
    expect(keyInput(2).value).toBe("low");
  });

  it("withdraws an option by deactivating it, never by deleting it", async () => {
    await openDraftVersion();

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.deactivate 1" }));

    await waitFor(() =>
      expect(screen.getByText("optionSet.items.status.Deactivated")).toBeInTheDocument()
    );
    // The row is still there with its key intact -- withdrawal is not removal.
    expect(keyInput(1).value).toBe("low");
    // And no delete control appeared for a row the server already holds.
    expect(
      screen.queryByRole("button", { name: "optionSet.items.remove 1" })
    ).not.toBeInTheDocument();
  });

  it("labels the publish confirmation and names both version numbers in it", async () => {
    await openDraftVersion();

    fireEvent.click(screen.getByRole("button", { name: "optionSet.versions.publish" }));

    // `description`, not `descriptionFirst`: this set HAS a published version, so publishing is a swap
    // and the incumbent's number is part of what the admin is agreeing to.
    const dialog = await screen.findByRole("alertdialog", {
      name: "optionSet.versions.publishConfirm.title 3",
    });
    expect(dialog).toHaveTextContent("optionSet.versions.publishConfirm.description 3 2");
  });
});

/* ── The layering rule, read off the real source ──────────────────────────────────────────────── */

/**
 * Why source text rather than a render.
 *
 * "A view uses a viewmodel and reaches the container through none of its own" has no runtime symptom:
 * a view that fetches for itself renders pixel-for-pixel the same as one handed a viewmodel's query.
 * What it costs is testability -- the `getVersion` stub at the top of THIS file exists only because
 * the panel used to hold that call -- and that cost is visible in the import list and nowhere else.
 * Same technique, and the same reason, as the sibling `CustomFieldListView.*.test.ts` files.
 */
describe("OptionSetDetailPanel — layering (real source)", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const panelSource = readFileSync(resolve(here, "OptionSetDetailPanel.tsx"), "utf-8");
  const versionQuerySource = readFileSync(
    resolve(here, "../viewmodels/useOptionSetVersionQuery.ts"),
    "utf-8"
  );

  it("keeps the DI container out of the view", () => {
    expect(panelSource).not.toMatch(/from\s+"(?:\.\.\/)+di"/);
    expect(panelSource).not.toMatch(/getCustomFieldsContainer\s*\(/);
  });

  it("takes the version read from a viewmodel instead", () => {
    expect(panelSource).toMatch(
      /import \{ useOptionSetVersionQuery \} from "\.\.\/viewmodels\/useOptionSetVersionQuery";/
    );
  });

  it("keys that read with the shared factory and reads through the repository", () => {
    // A hand-built key array in the hook would leave a saved draft rendering its pre-save item list
    // until a reload, because `useOptionSetVersionEditor` invalidates the FACTORY's key. And a
    // service call there would put wire models in front of a view that deals in entities. Neither
    // failure is visible in a render, which is why both are pinned here.
    expect(versionQuerySource).toMatch(/optionSetVersionQueryKey\(versionId \?\? ""\)/);
    expect(versionQuerySource).toMatch(/optionSetRepository\.getVersion\(/);
    expect(versionQuerySource).not.toMatch(/optionSetService/);
  });
});
