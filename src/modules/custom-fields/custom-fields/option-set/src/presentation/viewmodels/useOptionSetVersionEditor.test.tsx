/**
 * useOptionSetVersionEditor -- the full-replace contract (P-4)
 *
 * Saving a draft version replaces its ENTIRE item list, which makes four otherwise-invisible
 * mistakes destructive. Each one has a case below that fails against the mistake and passes against
 * the implementation:
 *
 *  1. SAVING FROM AN UNLOADED VERSION. A summary row carries `items === null`, so a working copy
 *     hydrated from one is empty -- and an empty full replace wipes a real option list. The
 *     `notLoaded` cases assert on the actual request list, not on a flag.
 *  2. SENDING `Deleted`. A version can legitimately hold a `Deleted` item from before this UI
 *     existed, and every kept row is re-submitted. `writableStatus` degrades it on hydration; the
 *     round-trip case pins that the string never reaches the wire.
 *  3. TREATING `sortOrder` AS A STORED VALUE. Several items routinely share one sort value, so a
 *     reorder that swaps two numbers is a no-op -- the same bug row 5.2's field-group reorder work
 *     had to fix. Position here IS order, and the reorder case starts from two items sharing
 *     sortOrder 0 to prove it.
 *  4. A CASE-SENSITIVE DUPLICATE-KEY CHECK. The backend refuses a list holding both `u18` and `U18`.
 *     A case-sensitive check passes a list the server then rejects.
 *  5. ONE RULE, TWO IMPLEMENTATIONS. A version's items are authored from two places and written by
 *     two endpoints, and each write path used to carry its own copy of the validation rules and its
 *     own payload builder. Copies that agree today are not a passing state -- a rule added to one
 *     applies to one Save button. The `one rule set for both Save paths` cases pin identity, not
 *     agreement.
 *
 * The state cases build entities directly -- that is the subject under test. The save cases run the
 * REAL repository, mapper and service over a mocked HTTP client, so "nothing was sent" and "this
 * exact body was sent" are both statements about `IApiService` calls.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useOptionSetVersionEditor,
  collectOptionSetItemIssues,
  toOptionSetItemInputs,
  createEmptyOptionSetItemDraft,
  OPTION_SET_ITEM_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_LABEL_MAX_LENGTH,
} from "./useOptionSetVersionEditor";
// The rules module itself, plus the table's exports: the "one rule set for both Save paths" cases
// below compare the three by identity, which is the only way to state that there is one
// implementation rather than two that currently agree.
import * as optionSetItemRules from "../form/optionSetItemRules";
import {
  collectOptionSetItemIssues as tableCollectIssues,
  newOptionSetDraftItem,
  toOptionSetItemInputs as tableToItemInputs,
} from "../components/OptionSetItemsEditor";
import { OptionSet, type OptionSetData } from "../../domain/entities/OptionSet";
import { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import { OptionSetItem, type OptionSetItemData } from "../../domain/entities/OptionSetItem";
import { OptionSetService } from "../../data/services/OptionSetService";
import { OptionSetRepository } from "../../data/repositories/OptionSetRepository";
import type { FieldVersionStatus } from "../../data/models/OptionSetModel";
import type { IApiService } from "@core/interfaces/api.interface";
import { getCustomFieldsContainer } from "../../../../di";
import { toast } from "@core/hooks/use-enhanced-toast";

vi.mock("../../../../di", () => ({ getCustomFieldsContainer: vi.fn() }));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

const permissionState = { granted: new Set<string>(), isSuperAdmin: false };
const tenantState = { isInTenantWorld: true };
vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    hasPermission: (permission: string) => permissionState.granted.has(permission),
    isSuperAdmin: permissionState.isSuperAdmin,
  }),
}));
vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => tenantState,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────────────────────────

function makeSet(over: Partial<OptionSetData> = {}): OptionSet {
  return new OptionSet({
    id: "set-1",
    stableKey: "training_intensity",
    labelEn: "Training intensity",
    labelAr: null,
    description: null,
    isSystemManaged: false,
    isPlatformOwned: false,
    versionCount: 1,
    publishedVersionId: null,
    publishedVersionNumber: null,
    ...over,
  });
}

function makeItem(over: Partial<OptionSetItemData> = {}): OptionSetItem {
  return new OptionSetItem({
    id: "item-1",
    key: "high",
    labelEn: "High",
    labelAr: null,
    color: null,
    iconKey: null,
    sortOrder: 0,
    status: "Active",
    ...over,
  });
}

/** A version WITH its items loaded -- the only shape a save may come from. */
function makeLoadedVersion(
  items: OptionSetItem[],
  status: FieldVersionStatus = "Draft",
  id = "ver-1"
): OptionSetVersion {
  return new OptionSetVersion({
    id,
    optionSetId: "set-1",
    versionNumber: 1,
    status,
    publishedAtUtc: null,
    items,
    itemCount: items.length,
  });
}

/** A SUMMARY row, as the set-detail response produces: a count, and `items === null`. */
function makeSummaryVersion(itemCount = 3, id = "ver-1"): OptionSetVersion {
  return new OptionSetVersion({
    id,
    optionSetId: null,
    versionNumber: 1,
    status: "Draft",
    publishedAtUtc: null,
    items: null,
    itemCount,
  });
}

const TWO_ITEMS = [
  makeItem({ id: "item-1", key: "high", labelEn: "High", sortOrder: 0 }),
  makeItem({ id: "item-2", key: "low", labelEn: "Low", sortOrder: 1 }),
];

/**
 * The mocked HTTP client, typed loosely on purpose: `vi.fn()`'s inferred call tuple is empty, which
 * would make `mock.calls[0][1]` -- the request BODY, the thing most of these cases are about --
 * unreachable. Same shape the field-group reorder test uses.
 */
interface ApiMock {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

function wireApi(): ApiMock {
  const api: ApiMock = {
    get: vi.fn(),
    post: vi.fn(async () => ({ id: "new-id" })),
    put: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
  };
  const repository = new OptionSetRepository(new OptionSetService(api as unknown as IApiService));
  vi.mocked(getCustomFieldsContainer).mockReturnValue({
    optionSetRepository: repository,
  } as never);
  return api;
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

interface RenderArgs {
  set?: OptionSet | null;
  version?: OptionSetVersion | null;
}

function renderEditor({
  set = makeSet(),
  version = makeLoadedVersion(TWO_ITEMS),
}: RenderArgs = {}) {
  const api = wireApi();
  const view = renderHook(
    (props: { set: OptionSet | null; version: OptionSetVersion | null }) =>
      useOptionSetVersionEditor({ set: props.set, version: props.version }),
    { wrapper, initialProps: { set, version } }
  );
  return { api, ...view };
}

/** PUT calls that target the version-items route. */
function versionSaves(api: ApiMock) {
  return api.put.mock.calls.filter(
    ([url]) => typeof url === "string" && url.includes("/option-sets/versions/")
  );
}

describe("collectOptionSetItemIssues", () => {
  function draft(over: Partial<ReturnType<typeof createEmptyOptionSetItemDraft>> = {}) {
    return { ...createEmptyOptionSetItemDraft(), key: "k", labelEn: "L", ...over };
  }

  it("reports an empty list as the one thing a version cannot be", () => {
    expect(collectOptionSetItemIssues([])).toEqual([
      { rowId: null, field: null, code: "atLeastOne" },
    ]);
  });

  it("accepts a well-formed list with no issues at all", () => {
    expect(collectOptionSetItemIssues([draft({ key: "a" }), draft({ key: "b" })])).toEqual([]);
  });

  it("flags BOTH rows of a case-insensitive key collision, quoting each row's own spelling", () => {
    const rows = [draft({ key: "u18" }), draft({ key: "U18" })];

    const issues = collectOptionSetItemIssues(rows);
    const duplicates = issues.filter((issue) => issue.code === "duplicateKey");

    expect(duplicates).toHaveLength(2);
    expect(duplicates.map((issue) => issue.rowId)).toEqual([rows[0].rowId, rows[1].rowId]);
    // Each row is told about ITS key. Quoting the normalised `u18` back at whoever typed `U18`
    // describes a different problem than the one they have.
    expect(duplicates[0].params).toEqual({ key: "u18" });
    expect(duplicates[1].params).toEqual({ key: "U18" });
    expect(duplicates.every((issue) => issue.field === "key")).toBe(true);
  });

  it("treats keys differing only by surrounding whitespace as the same key -- the payload trims them", () => {
    const issues = collectOptionSetItemIssues([draft({ key: "high" }), draft({ key: "  high " })]);
    expect(issues.filter((issue) => issue.code === "duplicateKey")).toHaveLength(2);
  });

  it("does not call blank keys duplicates of each other -- they already have their own issue", () => {
    const issues = collectOptionSetItemIssues([draft({ key: "" }), draft({ key: "   " })]);

    expect(issues.filter((issue) => issue.code === "keyRequired")).toHaveLength(2);
    expect(issues.filter((issue) => issue.code === "duplicateKey")).toHaveLength(0);
  });

  it("requires an English label but never an Arabic one", () => {
    const issues = collectOptionSetItemIssues([draft({ labelEn: "  ", labelAr: "" })]);

    expect(issues.map((issue) => issue.code)).toEqual(["labelEnRequired"]);
  });

  it("enforces the request's own length caps, naming the cap it enforced", () => {
    const issues = collectOptionSetItemIssues([
      draft({
        key: "k".repeat(OPTION_SET_ITEM_KEY_MAX_LENGTH + 1),
        labelEn: "L".repeat(OPTION_SET_ITEM_LABEL_MAX_LENGTH + 1),
        labelAr: "ع".repeat(OPTION_SET_ITEM_LABEL_MAX_LENGTH + 1),
      }),
    ]);

    expect(issues.map((issue) => `${issue.code}:${issue.field}`)).toEqual([
      "keyTooLong:key",
      "labelTooLong:labelEn",
      "labelTooLong:labelAr",
    ]);
    expect(issues[0].params).toEqual({ max: OPTION_SET_ITEM_KEY_MAX_LENGTH });
    expect(issues[1].params).toEqual({ max: OPTION_SET_ITEM_LABEL_MAX_LENGTH });
  });

  it("validates deactivated rows exactly like active ones -- a full replace submits them too", () => {
    const issues = collectOptionSetItemIssues([draft({ key: "", status: "Deactivated" })]);
    expect(issues.map((issue) => issue.code)).toContain("keyRequired");
  });
});

describe("toOptionSetItemInputs", () => {
  it("derives sortOrder from position and collapses blank optionals to null", () => {
    const rows = [
      { ...createEmptyOptionSetItemDraft(), key: " high ", labelEn: " High ", color: "  " },
      {
        ...createEmptyOptionSetItemDraft(),
        key: "low",
        labelEn: "Low",
        labelAr: " منخفضة ",
        color: "#eee",
        iconKey: "leaf",
        status: "Deactivated" as const,
      },
    ];

    expect(toOptionSetItemInputs(rows)).toEqual([
      {
        key: "high",
        labelEn: "High",
        labelAr: null,
        color: null,
        iconKey: null,
        sortOrder: 0,
        status: "Active",
      },
      {
        key: "low",
        labelEn: "Low",
        labelAr: "منخفضة",
        color: "#eee",
        iconKey: "leaf",
        sortOrder: 1,
        status: "Deactivated",
      },
    ]);
  });
});

/**
 * The two Save buttons, held to one rule set.
 *
 * `OptionSetDetailPanel` gates the NEW-draft Save (`POST {id}/versions`) with the table's exports and
 * the OPENED-version Save (`PUT versions/{versionId}`) with this hook's `canSave`. They used to be two
 * implementations of the same six rules and two builders of the same wire shape, which is a defect
 * that cannot be seen from either side: the copies agreed on the day they were written, so the only
 * symptom was a rule added to one applying to one button.
 *
 * These cases pin the arrangement that removes the failure mode rather than the agreement that
 * happens to hold today.
 */
describe("one rule set for both Save paths", () => {
  it("gates both Saves with the very same functions, not with two that agree", () => {
    // Function IDENTITY, deliberately. A behavioural comparison passes for as long as two copies
    // happen to match, and goes quiet again the moment someone re-syncs them by hand.
    expect(collectOptionSetItemIssues).toBe(optionSetItemRules.collectOptionSetItemIssues);
    expect(tableCollectIssues).toBe(optionSetItemRules.collectOptionSetItemIssues);
    expect(toOptionSetItemInputs).toBe(optionSetItemRules.toOptionSetItemInputs);
    expect(tableToItemInputs).toBe(optionSetItemRules.toOptionSetItemInputs);
  });

  it("rejects the same authored rows from either path, over either row shape", () => {
    // The two row types differ in exactly one way -- the table's optional text is `string | null`,
    // the hook's is `""` -- so the same authored content has to be spelled twice to be compared.
    const first = { key: "  u18  ", labelEn: "  Under 18  " };
    const second = { key: "U18", labelEn: "Under eighteen" };

    const tableRows = [
      { ...newOptionSetDraftItem(), ...first, rowId: "row-1" },
      { ...newOptionSetDraftItem(), ...second, rowId: "row-2" },
    ];
    const hookRows = [
      { ...createEmptyOptionSetItemDraft(), ...first, rowId: "row-1" },
      { ...createEmptyOptionSetItemDraft(), ...second, rowId: "row-2" },
    ];

    const fromTable = tableCollectIssues(tableRows);

    // Not a vacuous comparison: this list really is refused, on both rows, for the collision the
    // backend's item validator would also refuse.
    expect(fromTable.map((issue) => issue.code)).toEqual(["duplicateKey", "duplicateKey"]);
    expect(fromTable).toEqual(collectOptionSetItemIssues(hookRows));
  });

  it("builds byte-identical bodies from either path for the same authored rows", () => {
    const authored = {
      key: "  u18  ",
      labelEn: "  Under 18  ",
      labelAr: "  تحت 18  ",
      color: "  amber  ",
      iconKey: "  flame  ",
    };

    const fromTable = tableToItemInputs([{ ...newOptionSetDraftItem(), ...authored }]);

    // All five text fields normalised the same way. The defect this pins was `color` and `iconKey`
    // reaching the server as `" amber "` / `" flame "` when authored in a NEW draft and trimmed when
    // authored in an existing one -- the same admin action, two different stored values.
    expect(fromTable).toEqual([
      {
        key: "u18",
        labelEn: "Under 18",
        labelAr: "تحت 18",
        color: "amber",
        iconKey: "flame",
        sortOrder: 0,
        status: "Active",
      },
    ]);
    expect(JSON.stringify(fromTable)).toBe(
      JSON.stringify(toOptionSetItemInputs([{ ...createEmptyOptionSetItemDraft(), ...authored }]))
    );
  });

  it("never passes a length gate on a trimmed value and then sends the untrimmed one", () => {
    // Exactly at the cap once trimmed, over it if the spaces ride along. The gate has to measure what
    // the payload will actually send, or a 200-character label is accepted here and 400s at the API.
    const labelAr = `${"ع".repeat(OPTION_SET_ITEM_LABEL_MAX_LENGTH)}  `;
    const row = { ...newOptionSetDraftItem(), key: "u18", labelEn: "Under 18", labelAr };

    expect(tableCollectIssues([row])).toEqual([]);
    expect(tableToItemInputs([row])[0].labelAr).toHaveLength(OPTION_SET_ITEM_LABEL_MAX_LENGTH);
  });
});

describe("useOptionSetVersionEditor", () => {
  beforeEach(() => {
    permissionState.granted = new Set(["custom-field-option-sets.update"]);
    permissionState.isSuperAdmin = false;
    tenantState.isInTenantWorld = true;
    vi.clearAllMocks();
  });

  describe("hydration", () => {
    it("copies a loaded version's items in sortOrder order and reports itself ready", () => {
      const { result } = renderEditor({
        version: makeLoadedVersion([
          makeItem({ id: "b", key: "low", labelEn: "Low", sortOrder: 5 }),
          makeItem({ id: "a", key: "high", labelEn: "High", sortOrder: 2 }),
        ]),
      });

      expect(result.current.isReady).toBe(true);
      expect(result.current.rows.map((row) => row.key)).toEqual(["high", "low"]);
      expect(result.current.rows.map((row) => row.id)).toEqual(["a", "b"]);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isValid).toBe(true);
    });

    it("keeps the server's relative order for items sharing one sortOrder", () => {
      const { result } = renderEditor({
        version: makeLoadedVersion([
          makeItem({ id: "a", key: "first", sortOrder: 0 }),
          makeItem({ id: "b", key: "second", sortOrder: 0 }),
          makeItem({ id: "c", key: "third", sortOrder: 0 }),
        ]),
      });

      expect(result.current.rows.map((row) => row.key)).toEqual(["first", "second", "third"]);
    });

    it("turns null labels and colors into empty strings, because an input cannot hold null", () => {
      const { result } = renderEditor({
        version: makeLoadedVersion([makeItem({ labelAr: null, color: null, iconKey: null })]),
      });

      expect(result.current.rows[0]).toMatchObject({ labelAr: "", color: "", iconKey: "" });
    });

    it("degrades an inbound `Deleted` item to `Deactivated` on the way in", () => {
      const { result } = renderEditor({
        version: makeLoadedVersion([makeItem({ status: "Deleted" })]),
      });

      expect(result.current.rows[0].status).toBe("Deactivated");
    });

    it("stays UNREADY for a summary version, and holds no rows to mistake for an empty list", () => {
      const { result } = renderEditor({ version: makeSummaryVersion(3) });

      expect(result.current.isReady).toBe(false);
      expect(result.current.rows).toEqual([]);
      // The list-level "needs at least one option" issue is present, but it is NOT what refuses the
      // save -- see the save cases below.
      expect(result.current.saveRefusal?.reason).toBe("notLoaded");
    });

    it("does not discard unsaved edits when the same version arrives again from a refetch", () => {
      const { result, rerender } = renderEditor();
      const rowId = result.current.rows[0].rowId;

      act(() => result.current.updateItem(rowId, { labelEn: "Very high" }));
      expect(result.current.isDirty).toBe(true);

      // A fresh entity instance with the SAME id -- exactly what an invalidation produces.
      rerender({ set: makeSet(), version: makeLoadedVersion(TWO_ITEMS) });

      expect(result.current.rows[0].labelEn).toBe("Very high");
      expect(result.current.isDirty).toBe(true);
    });

    it("re-hydrates when the caller switches to a DIFFERENT version", () => {
      const { result, rerender } = renderEditor();
      act(() => result.current.updateItem(result.current.rows[0].rowId, { labelEn: "Edited" }));

      rerender({
        set: makeSet(),
        version: makeLoadedVersion([makeItem({ key: "only", labelEn: "Only" })], "Draft", "ver-2"),
      });

      expect(result.current.rows.map((row) => row.key)).toEqual(["only"]);
      expect(result.current.isDirty).toBe(false);
    });

    it("drops the previous version's rows the moment the caller switches to an unloaded one", () => {
      const { result, rerender } = renderEditor();
      expect(result.current.rows).toHaveLength(2);

      rerender({ set: makeSet(), version: makeSummaryVersion(2, "ver-2") });

      // Showing version 1's options under version 2's heading would be wrong, and would be the state
      // an accidental save wrote from.
      expect(result.current.rows).toEqual([]);
      expect(result.current.isReady).toBe(false);
    });
  });

  describe("row operations", () => {
    it("adds a blank Active row and marks the working copy dirty and invalid", () => {
      const { result } = renderEditor();

      act(() => result.current.addItem());

      expect(result.current.rows).toHaveLength(3);
      expect(result.current.rows[2].status).toBe("Active");
      expect(result.current.rows[2].id).toBeNull();
      expect(result.current.isDirty).toBe(true);
      expect(result.current.isValid).toBe(false);
      expect(result.current.rowIssues[result.current.rows[2].rowId].map((i) => i.code)).toEqual([
        "keyRequired",
        "labelEnRequired",
      ]);
    });

    it("edits one field of one row and leaves the others alone", () => {
      const { result } = renderEditor();

      act(() => result.current.updateItem(result.current.rows[1].rowId, { color: "#eee" }));

      expect(result.current.rows[0].color).toBe("");
      expect(result.current.rows[1]).toMatchObject({ key: "low", labelEn: "Low", color: "#eee" });
    });

    it("is NOT dirty after a whitespace-only edit -- the payload after trimming is identical", () => {
      const { result } = renderEditor();

      act(() => result.current.updateItem(result.current.rows[0].rowId, { labelEn: "  High  " }));

      expect(result.current.rows[0].labelEn).toBe("  High  ");
      expect(result.current.isDirty).toBe(false);
    });

    it("deactivates and reactivates without ever producing a `Deleted` row", () => {
      const { result } = renderEditor();
      const rowId = result.current.rows[0].rowId;

      act(() => result.current.deactivateItem(rowId));
      expect(result.current.rows[0].status).toBe("Deactivated");
      expect(result.current.payload[0].status).toBe("Deactivated");

      act(() => result.current.reactivateItem(rowId));
      expect(result.current.rows[0].status).toBe("Active");
    });

    it("restores the loaded list on reset", () => {
      const { result } = renderEditor();

      act(() => result.current.addItem());
      act(() => result.current.removeItem(result.current.rows[0].rowId));
      expect(result.current.isDirty).toBe(true);

      act(() => result.current.reset());

      expect(result.current.rows.map((row) => row.key)).toEqual(["high", "low"]);
      expect(result.current.isDirty).toBe(false);
    });

    it("reports the empty-list issue once every row is gone", () => {
      const { result } = renderEditor();

      act(() => result.current.removeItem(result.current.rows[0].rowId));
      act(() => result.current.removeItem(result.current.rows[0].rowId));

      expect(result.current.rows).toEqual([]);
      expect(result.current.listIssues.map((issue) => issue.code)).toEqual(["atLeastOne"]);
      expect(result.current.isValid).toBe(false);
    });
  });

  describe("reordering", () => {
    // Every fixture here shares sortOrder 0, which is the case that fails against an implementation
    // that swaps two stored sort values instead of renumbering from position.
    const SHARED_SORT = [
      makeItem({ id: "a", key: "alpha", sortOrder: 0 }),
      makeItem({ id: "b", key: "beta", sortOrder: 0 }),
      makeItem({ id: "c", key: "gamma", sortOrder: 0 }),
    ];

    it("moves a row down and renumbers the whole payload from the new order", () => {
      const { result } = renderEditor({ version: makeLoadedVersion(SHARED_SORT) });

      act(() => result.current.moveDown(result.current.rows[0].rowId));

      expect(result.current.rows.map((row) => row.key)).toEqual(["beta", "alpha", "gamma"]);
      expect(result.current.payload.map((item) => [item.key, item.sortOrder])).toEqual([
        ["beta", 0],
        ["alpha", 1],
        ["gamma", 2],
      ]);
      expect(result.current.isDirty).toBe(true);
    });

    it("moves a row up", () => {
      const { result } = renderEditor({ version: makeLoadedVersion(SHARED_SORT) });

      act(() => result.current.moveUp(result.current.rows[2].rowId));

      expect(result.current.rows.map((row) => row.key)).toEqual(["alpha", "gamma", "beta"]);
    });

    it("does nothing at the boundaries, and says so through canMoveUp/canMoveDown", () => {
      const { result } = renderEditor({ version: makeLoadedVersion(SHARED_SORT) });
      const [first, , last] = result.current.rows;

      expect(result.current.canMoveUp(first.rowId)).toBe(false);
      expect(result.current.canMoveDown(last.rowId)).toBe(false);
      expect(result.current.canMoveDown(first.rowId)).toBe(true);
      expect(result.current.canMoveUp(last.rowId)).toBe(true);

      act(() => result.current.moveUp(first.rowId));
      act(() => result.current.moveDown(last.rowId));

      expect(result.current.rows.map((row) => row.key)).toEqual(["alpha", "beta", "gamma"]);
      expect(result.current.isDirty).toBe(false);
    });

    it("drag-drop lands on the same order the buttons would produce", () => {
      const { result } = renderEditor({ version: makeLoadedVersion(SHARED_SORT) });
      const [first, , last] = result.current.rows;

      act(() => result.current.moveBefore(last.rowId, first.rowId));

      expect(result.current.rows.map((row) => row.key)).toEqual(["gamma", "alpha", "beta"]);
    });
  });

  describe("save", () => {
    it("sends the whole list, renumbered, to the version route", async () => {
      const { result, api } = renderEditor();
      act(() => result.current.moveDown(result.current.rows[0].rowId));

      expect(result.current.canSave).toBe(true);
      let ok = false;
      await act(async () => {
        ok = await result.current.save();
      });

      expect(ok).toBe(true);
      expect(versionSaves(api)).toHaveLength(1);
      expect(versionSaves(api)[0][0]).toContain("/option-sets/versions/ver-1");
      expect(versionSaves(api)[0][1]).toEqual({
        items: [
          {
            key: "low",
            labelEn: "Low",
            labelAr: null,
            color: null,
            iconKey: null,
            sortOrder: 0,
            status: "Active",
          },
          {
            key: "high",
            labelEn: "High",
            labelAr: null,
            color: null,
            iconKey: null,
            sortOrder: 1,
            status: "Active",
          },
        ],
      });
      expect(toast.success).toHaveBeenCalledWith("optionSet.toast.versionSaved");
      await waitFor(() => expect(result.current.isDirty).toBe(false));
    });

    it("re-submits a formerly-Deleted item as Deactivated, never as Deleted", async () => {
      const { result, api } = renderEditor({
        version: makeLoadedVersion([
          makeItem({ id: "a", key: "high", status: "Deleted" }),
          makeItem({ id: "b", key: "low", sortOrder: 1 }),
        ]),
      });
      act(() => result.current.updateItem(result.current.rows[1].rowId, { labelEn: "Lower" }));

      await act(async () => {
        await result.current.save();
      });

      const body = versionSaves(api)[0][1] as { items: { status: string }[] };
      expect(body.items.map((item) => item.status)).toEqual(["Deactivated", "Active"]);
      expect(JSON.stringify(body)).not.toContain("Deleted");
    });

    it("sends nothing for an UNLOADED version -- an empty full replace would wipe the real list", async () => {
      const { result, api } = renderEditor({ version: makeSummaryVersion(4) });

      expect(result.current.canSave).toBe(false);
      let ok = true;
      await act(async () => {
        ok = await result.current.save();
      });

      expect(ok).toBe(false);
      expect(api.put).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({ title: "optionSet.versionLoadFailed" });
    });

    it("sends nothing for a system-managed set, and says the platform maintains it", async () => {
      const { result, api } = renderEditor({ set: makeSet({ isSystemManaged: true }) });
      act(() => result.current.updateItem(result.current.rows[0].rowId, { labelEn: "Edited" }));

      expect(result.current.saveRefusal).toEqual({
        reason: "systemManaged",
        messageKey: "optionSet.refusals.systemManaged",
      });

      await act(async () => {
        expect(await result.current.save()).toBe(false);
      });

      expect(api.put).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({
        title: "optionSet.toast.systemManagedRefused",
        description: "optionSet.refusals.systemManaged",
      });
    });

    it("sends nothing for a platform-owned set from tenant context, and everything from platform context", async () => {
      const platformSet = makeSet({ isPlatformOwned: true });

      const tenantView = renderEditor({ set: platformSet });
      act(() => tenantView.result.current.moveDown(tenantView.result.current.rows[0].rowId));
      expect(tenantView.result.current.saveRefusal?.reason).toBe("platformOwned");
      await act(async () => {
        expect(await tenantView.result.current.save()).toBe(false);
      });
      expect(tenantView.api.put).not.toHaveBeenCalled();

      permissionState.isSuperAdmin = true;
      tenantState.isInTenantWorld = false;

      const platformView = renderEditor({ set: platformSet });
      act(() => platformView.result.current.moveDown(platformView.result.current.rows[0].rowId));
      expect(platformView.result.current.saveRefusal).toBeNull();
      await act(async () => {
        expect(await platformView.result.current.save()).toBe(true);
      });
      expect(versionSaves(platformView.api)).toHaveLength(1);
    });

    it("sends nothing for a version that is not a draft", async () => {
      const { result, api } = renderEditor({
        version: makeLoadedVersion(TWO_ITEMS, "Published"),
      });
      act(() => result.current.moveDown(result.current.rows[0].rowId));

      expect(result.current.saveRefusal).toEqual({
        reason: "notDraft",
        messageKey: "optionSet.refusals.notDraft",
      });
      await act(async () => {
        expect(await result.current.save()).toBe(false);
      });
      expect(api.put).not.toHaveBeenCalled();
    });

    it("sends nothing without the update permission", async () => {
      permissionState.granted = new Set(["custom-field-option-sets.view"]);
      const { result, api } = renderEditor();
      act(() => result.current.moveDown(result.current.rows[0].rowId));

      expect(result.current.saveRefusal).toEqual({
        reason: "permission",
        messageKey: "optionSet.permissions.update",
      });
      await act(async () => {
        expect(await result.current.save()).toBe(false);
      });
      expect(api.put).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({
        title: "optionSet.toast.permissionDenied",
        description: "optionSet.permissions.update",
      });
    });

    it("sends nothing while the working copy is invalid, and names the first real problem", async () => {
      const { result, api } = renderEditor();
      act(() => result.current.addItem());

      expect(result.current.saveRefusal).toEqual({
        reason: "invalid",
        messageKey: "optionSet.items.validation.keyRequired",
        params: undefined,
      });
      await act(async () => {
        expect(await result.current.save()).toBe(false);
      });
      expect(api.put).not.toHaveBeenCalled();
    });

    it("refuses an emptied list through the validation gate, not through the loaded gate", async () => {
      const { result, api } = renderEditor();
      act(() => result.current.removeItem(result.current.rows[0].rowId));
      act(() => result.current.removeItem(result.current.rows[0].rowId));

      // `isReady` is still true -- the version's items DID load, the admin removed them. Reporting
      // this as a load failure would send them looking for a network problem.
      expect(result.current.isReady).toBe(true);
      expect(result.current.saveRefusal).toEqual({
        reason: "invalid",
        messageKey: "optionSet.items.validation.atLeastOne",
        params: undefined,
      });
      await act(async () => {
        expect(await result.current.save()).toBe(false);
      });
      expect(api.put).not.toHaveBeenCalled();
    });

    it("is a no-op when nothing changed, without claiming a refusal", async () => {
      const { result, api } = renderEditor();

      expect(result.current.saveRefusal).toBeNull();
      expect(result.current.isDirty).toBe(false);
      expect(result.current.canSave).toBe(false);

      await act(async () => {
        // True, because the version already matches the working copy. There is nothing to refuse and
        // nothing to send.
        expect(await result.current.save()).toBe(true);
      });

      expect(api.put).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("reports a rejected save as changing nothing, and stays dirty", async () => {
      const { result, api } = renderEditor();
      api.put.mockRejectedValueOnce(new Error("Version is not a draft"));
      act(() => result.current.moveDown(result.current.rows[0].rowId));

      await act(async () => {
        expect(await result.current.save()).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith({
        title: "optionSet.toast.versionSaveFailed",
        description: "Version is not a draft",
      });
      // The working copy is still the admin's, so they can retry or reset.
      expect(result.current.isDirty).toBe(true);
    });
  });
});
