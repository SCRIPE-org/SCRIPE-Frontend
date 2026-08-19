/**
 * useFieldGroupViewModel — reorder payload contract (Wave 5 row 5.2)
 *
 * Reorder is the one write path here where a plausible-looking implementation
 * is silently wrong in two different ways, so both are pinned against the REAL
 * hook, the REAL repository, the REAL mapper and the REAL service:
 *
 *  1. SWAPPING TWO SortOrder VALUES instead of renumbering the list. Groups are
 *     created with SortOrder 0 by default, so a fresh entity type routinely has
 *     several groups all sitting at 0 (the server breaks the tie by LabelEn).
 *     Swapping 0 with 0 is a no-op and the row visibly refuses to move. The
 *     `all three groups sit at sortOrder 0` case below fails against a swap
 *     implementation and passes against renumbering.
 *
 *  2. INCLUDING A GROUP THE CALLER CANNOT MUTATE. ReorderFieldGroupsCommandHandler
 *     resolves and ownership-checks EVERY item before mutating anything, and a
 *     single inaccessible id fails the whole request with nothing persisted. A
 *     tenant-scoped admin whose payload carries a platform-owned group would
 *     therefore see every reorder silently fail. The tenant-context case below
 *     fails if the filter is removed.
 *
 * Only the HTTP client, DI, i18n and toast are mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFieldGroupViewModel } from "./useFieldGroupViewModel";
import { FieldGroupService } from "../../data/services/FieldGroupService";
import { FieldGroupRepository } from "../../data/repositories/FieldGroupRepository";
import type { FieldGroupJson } from "../../data/models/FieldGroupModel";
import type { IApiService } from "@core/interfaces/api.interface";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../../di", () => ({ getCustomFieldsContainer: vi.fn() }));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

const permissionState = { isSuperAdmin: false };
const tenantState = { isInTenantWorld: true };
vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => permissionState,
}));
vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => tenantState,
}));

const ENTITY_TYPE = "party.person";

function group(id: string, labelEn: string, sortOrder: number, isGlobal = false): FieldGroupJson {
  return { id, entityTypeKey: ENTITY_TYPE, labelEn, labelAr: null, sortOrder, isGlobal };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function setup(groups: FieldGroupJson[]) {
  const put = vi.fn().mockResolvedValue(undefined);
  const api = {
    // The server returns the list already ordered; the fixtures below are
    // written in that same order so the hook is exercised on realistic input.
    get: vi.fn().mockResolvedValue(groups),
    post: vi.fn(),
    put,
    delete: vi.fn(),
  };
  const repository = new FieldGroupRepository(
    new FieldGroupService(api as unknown as IApiService)
  );
  vi.mocked(getCustomFieldsContainer).mockReturnValue({
    fieldGroupRepository: repository,
    // The hook also fetches entity types through the custom-field repository.
    customFieldRepository: { getEntityTypes: vi.fn().mockResolvedValue([]) },
  } as never);
  return { put, get: api.get };
}

/** The `items` array of the last reorder PUT. */
function lastReorderItems(put: ReturnType<typeof vi.fn>) {
  const reorderCalls = put.mock.calls.filter(
    ([url]) => typeof url === "string" && url.endsWith("/field-groups/reorder")
  );
  return (reorderCalls.at(-1)?.[1] as { items: { id: string; sortOrder: number }[] }).items;
}

async function renderReady(groups: FieldGroupJson[]) {
  const { put, get } = setup(groups);
  const view = renderHook(() => useFieldGroupViewModel(ENTITY_TYPE), { wrapper });
  await waitFor(() => expect(view.result.current.groups).toHaveLength(groups.length));
  return { put, get, ...view };
}

describe("useFieldGroupViewModel — reorder", () => {
  beforeEach(() => {
    permissionState.isSuperAdmin = false;
    tenantState.isInTenantWorld = true;
    vi.clearAllMocks();
  });

  it("moving a group down submits the WHOLE list renumbered from its new order", async () => {
    const { put, result } = await renderReady([
      group("a", "Alpha", 0),
      group("b", "Beta", 1),
      group("c", "Gamma", 2),
    ]);

    act(() => result.current.moveDown("a"));

    await waitFor(() => expect(put).toHaveBeenCalled());
    expect(lastReorderItems(put)).toEqual([
      { id: "b", sortOrder: 0 },
      { id: "a", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("moving a group up swaps it with its predecessor and renumbers", async () => {
    const { put, result } = await renderReady([
      group("a", "Alpha", 0),
      group("b", "Beta", 1),
      group("c", "Gamma", 2),
    ]);

    act(() => result.current.moveUp("c"));

    await waitFor(() => expect(put).toHaveBeenCalled());
    expect(lastReorderItems(put)).toEqual([
      { id: "a", sortOrder: 0 },
      { id: "c", sortOrder: 1 },
      { id: "b", sortOrder: 2 },
    ]);
  });

  it("still produces a real move when all three groups sit at sortOrder 0 — a value swap would be a no-op here", async () => {
    const { put, result } = await renderReady([
      group("a", "Alpha", 0),
      group("b", "Beta", 0),
      group("c", "Gamma", 0),
    ]);

    act(() => result.current.moveDown("a"));

    await waitFor(() => expect(put).toHaveBeenCalled());
    const items = lastReorderItems(put);
    // Beta must end up strictly ahead of Alpha. Swapping the two stored
    // SortOrder values (0 and 0) would leave both at 0 and change nothing.
    const alpha = items.find((item) => item.id === "a")!;
    const beta = items.find((item) => item.id === "b")!;
    expect(beta.sortOrder).toBeLessThan(alpha.sortOrder);
    expect(items).toEqual([
      { id: "b", sortOrder: 0 },
      { id: "a", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("does nothing at the boundaries, and reports them through canMoveUp/canMoveDown", async () => {
    const { put, result } = await renderReady([group("a", "Alpha", 0), group("b", "Beta", 1)]);

    expect(result.current.canMoveUp("a")).toBe(false);
    expect(result.current.canMoveDown("b")).toBe(false);
    expect(result.current.canMoveDown("a")).toBe(true);
    expect(result.current.canMoveUp("b")).toBe(true);

    act(() => result.current.moveUp("a"));
    act(() => result.current.moveDown("b"));

    expect(put).not.toHaveBeenCalled();
  });

  describe("tenant-scoped caller with a platform-owned group in the list", () => {
    const MIXED = [
      group("global-1", "Platform group", 0, true),
      group("a", "Alpha", 1),
      group("b", "Beta", 2),
    ];

    it("excludes the global group from the reorder payload — including it would fail the whole request", async () => {
      const { put, result } = await renderReady(MIXED);

      act(() => result.current.moveDown("a"));

      await waitFor(() => expect(put).toHaveBeenCalled());
      const items = lastReorderItems(put);
      expect(items.map((item) => item.id)).not.toContain("global-1");
      expect(items).toEqual([
        { id: "b", sortOrder: 0 },
        { id: "a", sortOrder: 1 },
      ]);
    });

    it("marks the global group immutable and un-movable, while the tenant's own groups stay movable", async () => {
      const { result } = await renderReady(MIXED);
      const [globalGroup, alpha] = result.current.groups;

      expect(result.current.canMutate(globalGroup)).toBe(false);
      expect(result.current.canMutate(alpha)).toBe(true);
      // The global row is not part of the reorderable set at all, so neither
      // direction is offered for it.
      expect(result.current.canMoveUp("global-1")).toBe(false);
      expect(result.current.canMoveDown("global-1")).toBe(false);
      // Alpha is FIRST among the reorderable subset even though it is second
      // in the displayed list — the global row above it is not a position it
      // can move into.
      expect(result.current.canMoveUp("a")).toBe(false);
      expect(result.current.canMoveDown("a")).toBe(true);
    });

    it("includes the global group once the caller is a platform principal", async () => {
      permissionState.isSuperAdmin = true;
      tenantState.isInTenantWorld = false;

      const { put, result } = await renderReady(MIXED);
      expect(result.current.isPlatformContext).toBe(true);
      expect(result.current.canMutate(result.current.groups[0])).toBe(true);

      act(() => result.current.moveDown("global-1"));

      await waitFor(() => expect(put).toHaveBeenCalled());
      expect(lastReorderItems(put)).toEqual([
        { id: "a", sortOrder: 0 },
        { id: "global-1", sortOrder: 1 },
        { id: "b", sortOrder: 2 },
      ]);
    });
  });

  it("drag-drop reorder resolves through the same renumbered payload as the buttons", async () => {
    const { put, result } = await renderReady([
      group("a", "Alpha", 0),
      group("b", "Beta", 1),
      group("c", "Gamma", 2),
    ]);

    act(() => result.current.moveBefore("c", "a"));

    await waitFor(() => expect(put).toHaveBeenCalled());
    expect(lastReorderItems(put)).toEqual([
      { id: "c", sortOrder: 0 },
      { id: "a", sortOrder: 1 },
      { id: "b", sortOrder: 2 },
    ]);
  });

  describe("the server's 100-item cap", () => {
    // `ReorderFieldGroupsRequest.Items` carries `[MaxLength(100)]` and the
    // handler re-checks it, so an over-cap payload 400s with nothing persisted.
    // Both move routes go through one gate; each is pinned separately, because
    // a guard on the buttons alone would leave drag able to fire the doomed
    // request.
    const OVER_CAP = Array.from({ length: 101 }, (_, i) =>
      group(`g${i}`, `Group ${String(i).padStart(3, "0")}`, i)
    );

    /** Reorder PUTs only — the helper above assumes at least one exists. */
    function reorderCallCount(put: ReturnType<typeof vi.fn>) {
      return put.mock.calls.filter(
        ([url]) => typeof url === "string" && url.endsWith("/field-groups/reorder")
      ).length;
    }

    it("sends nothing when a button move would exceed it", async () => {
      const { put, result } = await renderReady(OVER_CAP);

      act(() => result.current.moveDown("g0"));

      await waitFor(() => expect(result.current.isReordering).toBe(false));
      expect(reorderCallCount(put)).toBe(0);
    });

    it("sends nothing when a DRAG move would exceed it either", async () => {
      const { put, result } = await renderReady(OVER_CAP);

      act(() => result.current.moveBefore("g100", "g0"));

      await waitFor(() => expect(result.current.isReordering).toBe(false));
      expect(reorderCallCount(put)).toBe(0);
    });

    it("still submits a payload sitting exactly on the cap", async () => {
      const { put, result } = await renderReady(OVER_CAP.slice(0, 100));

      act(() => result.current.moveDown("g0"));

      await waitFor(() => expect(put).toHaveBeenCalled());
      expect(lastReorderItems(put)).toHaveLength(100);
    });
  });

  it("never fires the list request without an entity type — the endpoint has no 'all groups' mode", async () => {
    const { get } = setup([group("a", "Alpha", 0)]);

    const { result } = renderHook(() => useFieldGroupViewModel(""), { wrapper });

    await waitFor(() => expect(result.current.isGroupsLoading).toBe(false));
    expect(result.current.groups).toEqual([]);
    // The entity-types query may still run; what must NOT happen is a
    // field-groups read with no entityTypeKey to scope it.
    const fieldGroupReads = get.mock.calls.filter(
      ([url]) => typeof url === "string" && url.includes("/field-groups")
    );
    expect(fieldGroupReads).toHaveLength(0);
  });
});
