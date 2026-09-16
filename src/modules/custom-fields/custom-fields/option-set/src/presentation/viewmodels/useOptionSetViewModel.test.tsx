/**
 * useOptionSetViewModel -- the three gates, and what reaches the wire (P-4)
 *
 * Every case below runs the REAL hook over the REAL repository, mapper and service. Only the HTTP
 * client, DI, i18n, toast, permissions and tenant context are mocked, so an assertion about "nothing
 * was sent" is an assertion about the actual `IApiService` call list rather than about a spy on a
 * method the hook might have bypassed.
 *
 * WHAT IS PINNED, AND WHY EACH ONE CAN GO WRONG WITHOUT ANYONE NOTICING
 * --------------------------------------------------------------------
 *  1. NOTHING IS SENT FOR A SYSTEM-MANAGED SET. The backend refuses all five mutating paths for
 *     every caller, so a UI that lets the request go out still "works" -- it just tells the admin a
 *     403 instead of telling them the platform maintains this list. The refusal has to happen before
 *     the request, and the only way to test that is to assert on the request list.
 *  2. NOTHING IS SENT FOR A PLATFORM-OWNED SET FROM TENANT CONTEXT, and everything is sent for the
 *     same set from platform context. One assertion without the other passes for a hook that simply
 *     refuses every platform-owned set forever.
 *  3. PUBLISH REFUSES THE RIGHT NON-DRAFTS FOR THE RIGHT REASON. `alreadyPublished` and `notDraft`
 *     are both "not a draft" and would collapse into one branch under a lazier implementation; the
 *     reasons are asserted individually so they cannot.
 *  4. THE LIST READ STAYS IDLE WITHOUT `custom-field-option-sets.view`. That permission ships with
 *     this work package, so every pre-existing role lacks it; firing anyway means a 403 on mount.
 *  5. PUBLISH INVALIDATES MORE THAN THE LIST. Publishing demotes the incumbent, so the version chain
 *     in the loaded detail is stale too. Asserting only that the list refetched would pass for an
 *     implementation that leaves a Deprecated version rendering as Published.
 *  6. EACH GATE READS ITS OWN PERMISSION. A gate wired to the WRONG permission still refuses when
 *     nothing is granted, so a denial test that grants nothing cannot tell `!canDelete` from
 *     `!canCreate` -- and the admin who holds `.create` but not `.delete` is then offered a Delete
 *     button the server answers with a 403. Every denial case below therefore withholds exactly ONE
 *     key and grants the other five, via `grantAllExcept`.
 *
 *     That covers six gates: the list read (`.view`), createSet and createVersion (both `.create`,
 *     reached through different predicates, so both are pinned), update, delete and publish. The
 *     assertion is load-bearing rather than stylistic: the refusal's `messageKey` is a literal
 *     sitting next to the check, so it never witnesses which permission was read -- withholding one
 *     key is the only thing that does.
 *
 *     `.bind` has NO gate case here, and that is a real gap rather than an oversight in this file:
 *     `canBind` is returned by the hook and no view consumes it yet, so there is no refusal to
 *     drive. It needs one the moment the field-form binding picker lands.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useOptionSetViewModel,
  optionSetsQueryKey,
  optionSetDetailQueryKey,
  optionSetVersionQueryKey,
} from "./useOptionSetViewModel";
import { OptionSetService } from "../../data/services/OptionSetService";
import { OptionSetRepository } from "../../data/repositories/OptionSetRepository";
import type {
  OptionSetJson,
  OptionSetDetailJson,
  OptionSetVersionSummaryJson,
} from "../../data/models/OptionSetModel";
import type { IApiService } from "@core/interfaces/api.interface";
import { getCustomFieldsContainer } from "../../../../di";
import { toast } from "@core/hooks/use-enhanced-toast";

vi.mock("../../../../di", () => ({ getCustomFieldsContainer: vi.fn() }));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));
vi.mock("@core/providers/i18n-provider", () => ({
  // Keys, not sentences: a refusal is identified here by the locale path it would render, which is
  // also what makes the assertions readable.
  //
  // Interpolated values ARE appended, the same way the sibling view tests do it, and for the same
  // reason. A param-discarding stub is not a harmless simplification here: `toast.published` is the
  // one message this hook interpolates, so dropping `{ number: … }` at the call site would still
  // satisfy an assertion on the bare key while the admin read a literal "{number}" placeholder.
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key} ${Object.values(params).join(" ")}` : key,
    language: "en",
  }),
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

const ALL_PERMISSIONS = [
  "custom-field-option-sets.view",
  "custom-field-option-sets.create",
  "custom-field-option-sets.update",
  "custom-field-option-sets.delete",
  "custom-field-option-sets.publish",
  "custom-field-option-sets.bind",
];

function grant(...permissions: string[]) {
  permissionState.granted = new Set(permissions);
}

/**
 * Grants every option-set permission EXCEPT one.
 *
 * This is the shape a denial case has to take to be worth anything. Withholding everything proves
 * only that SOME permission is consulted: swap `refuseDelete`'s `!canDelete` for `!canCreate` and a
 * grant-nothing test stays green, while the admin who holds `.create` but not `.delete` is shown a
 * Delete control the backend refuses. Holding the other five is what makes the assertion name the
 * one key that matters.
 */
function grantAllExcept(permission: string) {
  grant(...ALL_PERMISSIONS.filter((candidate) => candidate !== permission));
}

// ── Fixtures ──────────────────────────────────────────────────────────────────────────────────────

function setJson(over: Partial<OptionSetJson> = {}): OptionSetJson {
  return {
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
  };
}

function versionJson(over: Partial<OptionSetVersionSummaryJson> = {}): OptionSetVersionSummaryJson {
  return {
    id: "ver-1",
    versionNumber: 1,
    status: "Draft",
    publishedAtUtc: null,
    itemCount: 2,
    ...over,
  };
}

interface Wired {
  api: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
}

function setup(sets: OptionSetJson[], versions: OptionSetVersionSummaryJson[] = []): Wired {
  const detail: OptionSetDetailJson = { set: sets[0], versions };

  const api = {
    get: vi.fn(async (url: string) => {
      // The list route and the detail route differ only by a trailing segment, so the mock has to
      // discriminate the same way the router does.
      if (url.endsWith("/option-sets")) return sets;
      return detail;
    }),
    post: vi.fn(async () => ({ id: "new-id" })),
    put: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
  };

  const repository = new OptionSetRepository(new OptionSetService(api as unknown as IApiService));
  vi.mocked(getCustomFieldsContainer).mockReturnValue({
    optionSetRepository: repository,
  } as never);

  return { api };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/** Renders the hook and waits for the set list to arrive. */
async function renderReady(
  sets: OptionSetJson[],
  selectedSetId: string | null = null,
  versions: OptionSetVersionSummaryJson[] = []
) {
  const { api } = setup(sets, versions);
  const view = renderHook(() => useOptionSetViewModel(selectedSetId), { wrapper });
  await waitFor(() => expect(view.result.current.sets).toHaveLength(sets.length));
  if (selectedSetId) {
    await waitFor(() => expect(view.result.current.selectedSet).not.toBeNull());
  }
  return { api, ...view };
}

/** GET calls whose URL points at the list route (not a detail or version route). */
function listReads(api: Wired["api"]) {
  return api.get.mock.calls.filter(
    ([url]) => typeof url === "string" && url.endsWith("/option-sets")
  );
}

/** GET calls whose URL points at one set's detail. */
function detailReads(api: Wired["api"]) {
  return api.get.mock.calls.filter(
    ([url]) => typeof url === "string" && /\/option-sets\/[^/]+$/.test(url)
  );
}

describe("useOptionSetViewModel", () => {
  beforeEach(() => {
    grant(...ALL_PERMISSIONS);
    permissionState.isSuperAdmin = false;
    tenantState.isInTenantWorld = true;
    vi.clearAllMocks();
  });

  describe("query keys", () => {
    it("keeps the list a SIBLING of the details, so invalidating it does not drop them", () => {
      const list = optionSetsQueryKey();
      const detail = optionSetDetailQueryKey("set-1");

      // The list key must not be a prefix of a detail key. If it were, every create would evict
      // every loaded version chain.
      expect(detail.slice(0, list.length)).not.toEqual([...list]);
      expect(list).toEqual(["customFields", "optionSets", "list"]);
      expect(detail).toEqual(["customFields", "optionSets", "detail", "set-1"]);
    });

    it("keys a version by version id alone, matching the endpoint", () => {
      expect(optionSetVersionQueryKey("ver-9")).toEqual([
        "customFields",
        "optionSets",
        "version",
        "ver-9",
      ]);
    });
  });

  describe("reads", () => {
    it("loads the bare array from the list route and maps it to entities", async () => {
      const { result, api } = await renderReady([
        setJson({ id: "set-1", labelEn: "Alpha" }),
        setJson({ id: "set-2", labelEn: "Beta", isSystemManaged: true }),
      ]);

      expect(listReads(api)).toHaveLength(1);
      expect(result.current.sets.map((set) => set.labelEn)).toEqual(["Alpha", "Beta"]);
      expect(result.current.sets[1].isPlatformMaintained).toBe(true);
    });

    it("never reads anything without the view permission -- that permission is new, so old roles lack it", async () => {
      // The read gate gets the same treatment as the write gates: withhold exactly `.view` and hold
      // the other five. Granting only `.update` withheld five keys, so a read gated on any of them
      // would have passed this case while still refusing the admin who holds `.view` alone.
      grantAllExcept("custom-field-option-sets.view");
      const { api } = setup([setJson()]);

      const { result } = renderHook(() => useOptionSetViewModel("set-1"), { wrapper });

      await waitFor(() => expect(result.current.isSetsLoading).toBe(false));
      expect(result.current.canView).toBe(false);
      expect(api.get).not.toHaveBeenCalled();
    });

    it("reads a set's detail only once a set is selected", async () => {
      const { api } = await renderReady([setJson()], null);
      expect(detailReads(api)).toHaveLength(0);

      const selected = await renderReady([setJson()], "set-1", [versionJson()]);
      expect(detailReads(selected.api)).toHaveLength(1);
      expect(selected.result.current.versions).toHaveLength(1);
      // Summary rows: the version chain arrives WITHOUT items, which is why a draft editor has to
      // fetch the one version it edits.
      expect(selected.result.current.versions[0].hasLoadedItems).toBe(false);
      expect(selected.result.current.versions[0].itemCount).toBe(2);
    });
  });

  describe("create", () => {
    it("posts the create body, isGlobal included, and returns the new id", async () => {
      const { result, api } = await renderReady([setJson()]);

      let created: string | null = null;
      await act(async () => {
        created = await result.current.createSet({
          stableKey: "intensity",
          labelEn: "Intensity",
          labelAr: null,
          description: null,
          isGlobal: true,
        });
      });

      expect(created).toBe("new-id");
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post.mock.calls[0][1]).toEqual({
        stableKey: "intensity",
        labelEn: "Intensity",
        labelAr: null,
        description: null,
        isGlobal: true,
      });
    });

    it("sends nothing and names the missing permission when create is not granted", async () => {
      // grantAllExcept, not grant(".view"): this gate and createVersion's both read `.create`
      // through different predicates, and granting only `.view` withholds five keys at once — so
      // rewriting this gate to read `.update` would leave the case green while an admin holding
      // `.update` but not `.create` is offered a create form the server refuses.
      grantAllExcept("custom-field-option-sets.create");
      const { result, api } = await renderReady([setJson()]);

      let created: string | null = "sentinel";
      await act(async () => {
        created = await result.current.createSet({
          stableKey: "intensity",
          labelEn: "Intensity",
          isGlobal: false,
        });
      });

      expect(created).toBeNull();
      expect(api.post).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({
        title: "optionSet.toast.permissionDenied",
        description: "optionSet.permissions.create",
      });
    });
  });

  describe("update", () => {
    it("sends only the three properties the update request declares", async () => {
      const { result, api } = await renderReady([setJson()]);

      let ok = false;
      await act(async () => {
        ok = await result.current.updateSet(result.current.sets[0], {
          labelEn: "Renamed",
          labelAr: "معاد",
          description: null,
        });
      });

      expect(ok).toBe(true);
      expect(api.put).toHaveBeenCalledTimes(1);
      const body = api.put.mock.calls[0][1] as Record<string, unknown>;
      expect(body).toEqual({ labelEn: "Renamed", labelAr: "معاد", description: null });
      // The two immutable properties must be absent, not null: the request has no member to bind
      // them to, and a rename of the stable key would turn a later re-import into a create.
      expect(Object.keys(body)).not.toContain("stableKey");
      expect(Object.keys(body)).not.toContain("isGlobal");
    });

    it("refuses a system-managed set BEFORE any request, and says the platform maintains it", async () => {
      const { result, api } = await renderReady([setJson({ isSystemManaged: true })]);
      const set = result.current.sets[0];

      expect(result.current.canUpdateSet(set)).toBe(false);
      expect(result.current.refuseUpdate(set)).toEqual({
        reason: "systemManaged",
        messageKey: "optionSet.refusals.systemManaged",
      });

      let ok = true;
      await act(async () => {
        ok = await result.current.updateSet(set, { labelEn: "Renamed" });
      });

      expect(ok).toBe(false);
      expect(api.put).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({
        title: "optionSet.toast.systemManagedRefused",
        description: "optionSet.refusals.systemManaged",
      });
    });

    it("refuses a system-managed set for a Super Admin in platform context too", async () => {
      permissionState.isSuperAdmin = true;
      tenantState.isInTenantWorld = false;
      const { result, api } = await renderReady([
        setJson({ isSystemManaged: true, isPlatformOwned: true }),
      ]);

      expect(result.current.isPlatformContext).toBe(true);
      await act(async () => {
        await result.current.updateSet(result.current.sets[0], { labelEn: "Renamed" });
      });

      expect(api.put).not.toHaveBeenCalled();
    });

    it("sends nothing when UPDATE ALONE is withheld and the other five are granted", async () => {
      grantAllExcept("custom-field-option-sets.update");
      const { result, api } = await renderReady([setJson()]);
      const set = result.current.sets[0];

      // `.update` is the only missing key, so a gate reading any OTHER permission would let this
      // through -- which is the whole point of withholding one instead of all six.
      expect(result.current.canUpdateSet(set)).toBe(false);
      expect(result.current.refuseUpdate(set)).toEqual({
        reason: "permission",
        messageKey: "optionSet.permissions.update",
      });

      let ok = true;
      await act(async () => {
        ok = await result.current.updateSet(set, { labelEn: "Renamed" });
      });

      expect(ok).toBe(false);
      expect(api.put).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({
        title: "optionSet.toast.permissionDenied",
        description: "optionSet.permissions.update",
      });
    });
  });

  describe("delete", () => {
    it("sends nothing when DELETE ALONE is withheld and the other five are granted", async () => {
      grantAllExcept("custom-field-option-sets.delete");
      const { result, api } = await renderReady([setJson()]);
      const set = result.current.sets[0];

      // The gate an admin is most likely to meet in this shape: a curator role that may create and
      // rename sets but may not remove one. Deleting takes the whole version chain with it, so a
      // Delete control offered here is a 403 at best and a request nobody intended at worst.
      expect(result.current.canDeleteSet(set)).toBe(false);
      expect(result.current.refuseDelete(set)).toEqual({
        reason: "permission",
        messageKey: "optionSet.permissions.delete",
      });

      let ok = true;
      await act(async () => {
        ok = await result.current.deleteSet(set);
      });

      expect(ok).toBe(false);
      expect(api.delete).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({
        title: "optionSet.toast.permissionDenied",
        description: "optionSet.permissions.delete",
      });
    });
  });

  describe("platform-owned sets", () => {
    const PLATFORM_SET = [setJson({ isPlatformOwned: true })];

    it("refuses every write from tenant context, without a request", async () => {
      const { result, api } = await renderReady(PLATFORM_SET);
      const set = result.current.sets[0];

      expect(result.current.refuseUpdate(set)?.reason).toBe("platformOwned");
      expect(result.current.canDeleteSet(set)).toBe(false);
      expect(result.current.canCreateVersionFor(set)).toBe(false);

      await act(async () => {
        await result.current.deleteSet(set);
      });

      expect(api.delete).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({ title: "optionSet.refusals.platformOwned" });
    });

    it("allows the same writes from platform context -- otherwise nobody could ever maintain one", async () => {
      permissionState.isSuperAdmin = true;
      tenantState.isInTenantWorld = false;
      const { result, api } = await renderReady(PLATFORM_SET);
      const set = result.current.sets[0];

      expect(result.current.refuseUpdate(set)).toBeNull();

      let ok = false;
      await act(async () => {
        ok = await result.current.deleteSet(set);
      });

      expect(ok).toBe(true);
      expect(api.delete).toHaveBeenCalledTimes(1);
      expect(api.delete.mock.calls[0][0]).toContain("/option-sets/set-1");
    });
  });

  describe("createVersion", () => {
    it("posts the item list to the nested versions route", async () => {
      const { result, api } = await renderReady([setJson()]);

      let versionId: string | null = null;
      await act(async () => {
        versionId = await result.current.createVersion(result.current.sets[0], [
          { key: "high", labelEn: "High", sortOrder: 0, status: "Active" },
        ]);
      });

      expect(versionId).toBe("new-id");
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post.mock.calls[0][0]).toContain("/option-sets/set-1/versions");
      expect(api.post.mock.calls[0][1]).toEqual({
        items: [
          {
            key: "high",
            labelEn: "High",
            labelAr: null,
            color: null,
            iconKey: null,
            sortOrder: 0,
            status: "Active",
          },
        ],
      });
    });

    it("refuses an itemless version locally -- the server would 400, but the reason is worth saying", async () => {
      const { result, api } = await renderReady([setJson()]);

      let versionId: string | null = "sentinel";
      await act(async () => {
        versionId = await result.current.createVersion(result.current.sets[0], []);
      });

      expect(versionId).toBeNull();
      expect(api.post).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({
        title: "optionSet.items.validation.atLeastOne",
      });
    });

    it("sends nothing when CREATE ALONE is withheld and the other five are granted", async () => {
      grantAllExcept("custom-field-option-sets.create");
      const { result, api } = await renderReady([setJson()]);
      const set = result.current.sets[0];

      // One permission covers creating a SET and creating a VERSION of one, which is exactly why
      // this case exists separately from the createSet denial above: the two write paths read the
      // same key through different predicates, and only one of them was pinned.
      expect(result.current.canCreateVersionFor(set)).toBe(false);
      expect(result.current.refuseCreateVersion(set)).toEqual({
        reason: "permission",
        messageKey: "optionSet.permissions.create",
      });

      // A NON-empty list, so the refusal on record is the permission one and not the itemless guard.
      let versionId: string | null = "sentinel";
      await act(async () => {
        versionId = await result.current.createVersion(set, [
          { key: "high", labelEn: "High", sortOrder: 0, status: "Active" },
        ]);
      });

      expect(versionId).toBeNull();
      expect(api.post).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({
        title: "optionSet.toast.permissionDenied",
        description: "optionSet.permissions.create",
      });
    });
  });

  describe("publishVersion", () => {
    it("publishes a non-empty draft and names the version in the success toast", async () => {
      const { result, api } = await renderReady([setJson()], "set-1", [
        versionJson({ id: "ver-3", versionNumber: 3, status: "Draft", itemCount: 4 }),
      ]);
      const version = result.current.versions[0];

      expect(result.current.canPublishVersion(result.current.selectedSet!, version)).toBe(true);

      let ok = false;
      await act(async () => {
        ok = await result.current.publishVersion(result.current.selectedSet!, version);
      });

      expect(ok).toBe(true);
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post.mock.calls[0][0]).toContain("/option-sets/versions/ver-3/publish");
      // The NUMBER, not just the key. `t` above appends its interpolation params, so this fails if
      // the hook stops passing `{ number }` -- the defect that would print the raw "{number}"
      // placeholder from the dictionary to the admin who just published version 3.
      expect(toast.success).toHaveBeenCalledWith("optionSet.toast.published 3");
    });

    it("tells an admin their version is ALREADY the published one, rather than 'only a draft can be published'", async () => {
      const { result, api } = await renderReady(
        [setJson({ publishedVersionId: "ver-1", publishedVersionNumber: 1 })],
        "set-1",
        [versionJson({ status: "Published" })]
      );

      const refusal = result.current.refusePublish(
        result.current.selectedSet!,
        result.current.versions[0]
      );
      expect(refusal).toEqual({
        reason: "alreadyPublished",
        messageKey: "optionSet.refusals.alreadyPublished",
      });

      await act(async () => {
        await result.current.publishVersion(
          result.current.selectedSet!,
          result.current.versions[0]
        );
      });
      expect(api.post).not.toHaveBeenCalled();
    });

    it("refuses a retired version as not-a-draft", async () => {
      const { result } = await renderReady([setJson()], "set-1", [
        versionJson({ status: "Deprecated" }),
      ]);

      expect(
        result.current.refusePublish(result.current.selectedSet!, result.current.versions[0])
      ).toEqual({ reason: "notDraft", messageKey: "optionSet.refusals.notDraft" });
    });

    it("refuses an EMPTY draft, reading itemCount -- items is null on a summary row", async () => {
      const { result, api } = await renderReady([setJson()], "set-1", [
        versionJson({ status: "Draft", itemCount: 0 }),
      ]);
      const version = result.current.versions[0];

      // Guards the trap directly: `items.length` is 0 for EVERY summary row, so an implementation
      // reading it would refuse the non-empty drafts above as well.
      expect(version.hasLoadedItems).toBe(false);
      expect(result.current.refusePublish(result.current.selectedSet!, version)).toEqual({
        reason: "emptyVersion",
        messageKey: "optionSet.refusals.emptyVersion",
      });

      await act(async () => {
        await result.current.publishVersion(result.current.selectedSet!, version);
      });
      expect(api.post).not.toHaveBeenCalled();
    });

    it("refuses without the publish permission even though every other key is granted", async () => {
      // grantAllExcept, not a hand-picked three: the previous form withheld `.delete`, `.publish`
      // AND `.bind`, so rewiring this gate to read `!canDelete` or `!canBind` left it green. The
      // asserted messageKey is a literal sitting next to the check, so it does not witness which
      // permission was actually read -- only withholding exactly one key does.
      grantAllExcept("custom-field-option-sets.publish");
      const { result, api } = await renderReady([setJson()], "set-1", [versionJson()]);

      expect(
        result.current.refusePublish(result.current.selectedSet!, result.current.versions[0])
      ).toEqual({ reason: "permission", messageKey: "optionSet.permissions.publish" });

      await act(async () => {
        await result.current.publishVersion(
          result.current.selectedSet!,
          result.current.versions[0]
        );
      });
      expect(api.post).not.toHaveBeenCalled();
    });

    it("invalidates the loaded version chain too, not just the list -- the incumbent is now Deprecated", async () => {
      const { result, api } = await renderReady([setJson()], "set-1", [
        versionJson({ id: "ver-2", versionNumber: 2, status: "Draft", itemCount: 1 }),
      ]);

      const listBefore = listReads(api).length;
      const detailBefore = detailReads(api).length;

      await act(async () => {
        await result.current.publishVersion(
          result.current.selectedSet!,
          result.current.versions[0]
        );
      });

      await waitFor(() => expect(listReads(api).length).toBeGreaterThan(listBefore));
      // The half that a list-only invalidation would miss.
      await waitFor(() => expect(detailReads(api).length).toBeGreaterThan(detailBefore));
    });
  });

  describe("failed requests", () => {
    it("reports the server's message and resolves false rather than throwing at the call site", async () => {
      const { result, api } = await renderReady([setJson()]);
      api.put.mockRejectedValueOnce(new Error("Set is in use"));

      let ok = true;
      await act(async () => {
        ok = await result.current.updateSet(result.current.sets[0], { labelEn: "Renamed" });
      });

      expect(ok).toBe(false);
      expect(toast.error).toHaveBeenCalledWith({
        title: "optionSet.toast.updateFailed",
        description: "Set is in use",
      });
    });
  });

  describe("inline editor state", () => {
    it("resolves the set being edited from the list it already holds", async () => {
      const { result, api } = await renderReady([
        setJson({ id: "set-1" }),
        setJson({ id: "set-2", labelEn: "Beta" }),
      ]);
      const readsBefore = api.get.mock.calls.length;

      act(() => result.current.startEdit("set-2"));

      expect(result.current.editingSet?.labelEn).toBe("Beta");
      expect(result.current.isCreating).toBe(false);
      // No extra read: the list row carries every value the edit form needs.
      expect(api.get.mock.calls).toHaveLength(readsBefore);

      act(() => result.current.startCreate());
      expect(result.current.editingId).toBeNull();
      expect(result.current.editingSet).toBeNull();
      expect(result.current.isCreating).toBe(true);

      act(() => result.current.closeEditor());
      expect(result.current.isCreating).toBe(false);
      expect(result.current.editingId).toBeNull();
    });
  });
});
