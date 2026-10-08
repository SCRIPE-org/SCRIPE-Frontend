/**
 * useOptionSetBindingViewModel -- P-4's missing consumer.
 *
 * WHAT EACH CASE IS FOR, AND THE PRODUCTION CHANGE THAT WOULD TURN IT RED
 * ------------------------------------------------------------------------
 *  1. `resolveActiveFieldVersion` picks the PUBLISHED version out of a chain that also carries a
 *     Draft and a Deprecated one. Red if this picked the first entry (the newest, whatever its
 *     status) or the last, instead of filtering on status.
 *  2. The picker's set list is `OptionSet.isBindable` (has a published version) ONLY. Red if
 *     `bindableSets` returned every readable set, which would let an admin pick a set with no
 *     published version and have the bind refused server-side with no explanation offered here.
 *  3. `bind`/`rebind`/`unbind` each call the correspondingly-named repository method, with the
 *     RESOLVED field version id (not the custom field's own id, and not the draft's id when a
 *     Published version also exists) and the chosen set's `publishedVersionId`. Red if any two of
 *     the three were folded into one call, or if the wrong id travelled.
 *  4. THE PERMISSION GATE. `custom-field-option-sets.bind` is withheld while `.view` is GRANTED --
 *     not the "grant nothing" shape the option-set view-model's own postmortem calls out as unable
 *     to distinguish the right gate from the wrong one. Red if any action read `.view` instead of
 *     `.bind`, or read no permission at all.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useOptionSetBindingViewModel,
  resolveActiveFieldVersion,
} from "./useOptionSetBindingViewModel";
import type {
  FieldVersionSummary,
  FieldVersionsResponse,
} from "../../domain/entities/FieldInsight";
import { toast } from "@core/hooks/use-enhanced-toast";
import { OptionSet } from "../../../../option-set/src/domain/entities/OptionSet";

vi.mock("../../../../di", () => ({ getCustomFieldsContainer: vi.fn() }));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));
vi.mock("@core/providers/i18n-provider", () => ({
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

import { getCustomFieldsContainer } from "../../../../di";

// ── Fixtures ──────────────────────────────────────────────────────────────────────────────────────

function versionSummary(over: Partial<FieldVersionSummary> = {}): FieldVersionSummary {
  return {
    id: "fv-published",
    versionNumber: 1,
    status: "Published",
    optionCount: 3,
    ruleCount: 0,
    isPlatformOwned: false,
    effectiveFromUtc: null,
    effectiveToUtc: null,
    publishedAtUtc: "2026-01-01T00:00:00Z",
    ...over,
  };
}

/**
 * A real `OptionSet` instance, not a plain object -- `isBindable` is a getter on the class, and the
 * hook under test reads exactly that getter. A plain object literal would silently read `undefined`
 * for every set and pass the "lists only bindable sets" case vacuously (every set filtered out,
 * including the one that should have survived).
 */
function optionSetFixture(over: Record<string, unknown> = {}): OptionSet {
  const publishedVersionId =
    "publishedVersionId" in over ? (over.publishedVersionId as string | null) : "osv-1";
  return new OptionSet({
    id: (over.id as string) ?? "set-1",
    stableKey: (over.stableKey as string) ?? "sizes",
    labelEn: (over.labelEn as string) ?? "Sizes",
    labelAr: null,
    description: null,
    isSystemManaged: false,
    isPlatformOwned: false,
    versionCount: 1,
    publishedVersionId,
    publishedVersionNumber: publishedVersionId ? 1 : null,
    ...over,
  });
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function setupContainer(options: { sets?: OptionSet[]; versions?: FieldVersionsResponse }) {
  const customFieldRepository = {
    getVersions: vi.fn(
      async () => options.versions ?? { fieldId: "field-1", versions: [], hasDraft: false }
    ),
  };
  const optionSetRepository = {
    getAll: vi.fn(async () => options.sets ?? []),
    bind: vi.fn(async () => ({
      inserted: 1,
      updated: 0,
      deactivated: 0,
      untouched: 0,
      preservedLocalOptions: 0,
    })),
    rebind: vi.fn(async () => ({
      inserted: 1,
      updated: 0,
      deactivated: 1,
      untouched: 0,
      preservedLocalOptions: 0,
    })),
    unbind: vi.fn(async () => ({
      inserted: 0,
      updated: 0,
      deactivated: 0,
      untouched: 0,
      preservedLocalOptions: 2,
    })),
  };

  vi.mocked(getCustomFieldsContainer).mockReturnValue({
    customFieldRepository,
    optionSetRepository,
  } as never);

  return { customFieldRepository, optionSetRepository };
}

function grantAllExcept(permission: string) {
  const all = [
    "custom-field-option-sets.view",
    "custom-field-option-sets.create",
    "custom-field-option-sets.update",
    "custom-field-option-sets.delete",
    "custom-field-option-sets.publish",
    "custom-field-option-sets.bind",
  ];
  permissionState.granted = new Set(all.filter((candidate) => candidate !== permission));
}

beforeEach(() => {
  permissionState.granted = new Set([
    "custom-field-option-sets.view",
    "custom-field-option-sets.bind",
  ]);
  permissionState.isSuperAdmin = false;
  tenantState.isInTenantWorld = true;
  vi.clearAllMocks();
});

// ── resolveActiveFieldVersion (pure) ────────────────────────────────────────────────────────────────

describe("resolveActiveFieldVersion", () => {
  it("picks the Published version out of a chain carrying a Draft and a Deprecated entry", () => {
    const chain = [
      versionSummary({ id: "fv-draft", versionNumber: 3, status: "Draft" }),
      versionSummary({ id: "fv-published", versionNumber: 2, status: "Published" }),
      versionSummary({ id: "fv-deprecated", versionNumber: 1, status: "Deprecated" }),
    ];

    expect(resolveActiveFieldVersion(chain)?.id).toBe("fv-published");
  });

  it("resolves to null when the chain has no Published version", () => {
    const chain = [versionSummary({ status: "Draft" }), versionSummary({ status: "Archived" })];

    expect(resolveActiveFieldVersion(chain)).toBeNull();
  });

  it("resolves to null for an empty chain (no twin, or no version yet)", () => {
    expect(resolveActiveFieldVersion([])).toBeNull();
  });
});

// ── the hook ─────────────────────────────────────────────────────────────────────────────────────

describe("useOptionSetBindingViewModel", () => {
  it("lists only bindable (published) option sets, never a draft-only set", async () => {
    const { optionSetRepository } = setupContainer({
      sets: [
        optionSetFixture({ id: "bindable", publishedVersionId: "osv-1" }),
        optionSetFixture({ id: "draft-only", publishedVersionId: null }),
      ],
    });

    const { result } = renderHook(() => useOptionSetBindingViewModel(), { wrapper });

    await waitFor(() => expect(optionSetRepository.getAll).toHaveBeenCalled());
    await waitFor(() => expect(result.current.bindableSets).toHaveLength(1));
    expect(result.current.bindableSets[0].id).toBe("bindable");
  });

  it("resolves the field version from the Published entry and sends it, not the field's own id, to bind", async () => {
    const versions: FieldVersionsResponse = {
      fieldId: "field-1",
      versions: [
        versionSummary({ id: "fv-draft", versionNumber: 2, status: "Draft" }),
        versionSummary({ id: "fv-published", versionNumber: 1, status: "Published" }),
      ],
      hasDraft: true,
      publishedVersionNumber: 1,
    };
    const { customFieldRepository, optionSetRepository } = setupContainer({
      sets: [optionSetFixture({ id: "set-1", publishedVersionId: "osv-9" })],
      versions,
    });

    const { result } = renderHook(() => useOptionSetBindingViewModel(), { wrapper });

    act(() => result.current.openBinding("field-1", "Jersey size"));
    await waitFor(() => expect(customFieldRepository.getVersions).toHaveBeenCalledWith("field-1"));
    await waitFor(() => expect(result.current.hasActiveVersion).toBe(true));

    await act(async () => {
      await result.current.bind("osv-9");
    });

    expect(optionSetRepository.bind).toHaveBeenCalledWith("fv-published", "osv-9");
    expect(optionSetRepository.rebind).not.toHaveBeenCalled();
    expect(optionSetRepository.unbind).not.toHaveBeenCalled();
  });

  it("rebind and unbind each call their own repository method with the resolved field version id", async () => {
    const versions: FieldVersionsResponse = {
      fieldId: "field-1",
      versions: [versionSummary({ id: "fv-published", status: "Published" })],
      hasDraft: false,
      publishedVersionNumber: 1,
    };
    const { optionSetRepository } = setupContainer({
      sets: [optionSetFixture({ id: "set-1", publishedVersionId: "osv-2" })],
      versions,
    });

    const { result } = renderHook(() => useOptionSetBindingViewModel(), { wrapper });
    act(() => result.current.openBinding("field-1", "Jersey size"));
    await waitFor(() => expect(result.current.hasActiveVersion).toBe(true));

    await act(async () => {
      await result.current.rebind("osv-2");
    });
    expect(optionSetRepository.rebind).toHaveBeenCalledWith("fv-published", "osv-2");
    expect(optionSetRepository.bind).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.unbind();
    });
    expect(optionSetRepository.unbind).toHaveBeenCalledWith("fv-published");
  });

  it("refuses to bind when a field has no Published version, and never sends the request", async () => {
    const versions: FieldVersionsResponse = {
      fieldId: "field-1",
      versions: [versionSummary({ status: "Draft" })],
      hasDraft: true,
      publishedVersionNumber: null,
    };
    const { optionSetRepository } = setupContainer({
      sets: [optionSetFixture({ id: "set-1", publishedVersionId: "osv-2" })],
      versions,
    });

    const { result } = renderHook(() => useOptionSetBindingViewModel(), { wrapper });
    act(() => result.current.openBinding("field-1", "Jersey size"));
    await waitFor(() => expect(result.current.isVersionLoading).toBe(false));

    expect(result.current.hasActiveVersion).toBe(false);

    const ok = await act(async () => result.current.bind("osv-2"));
    expect(ok).toBe(false);
    expect(optionSetRepository.bind).not.toHaveBeenCalled();
  });

  describe("the permission gate", () => {
    it("refuses bind/rebind/unbind when custom-field-option-sets.bind is withheld, even with .view granted", async () => {
      grantAllExcept("custom-field-option-sets.bind");
      const versions: FieldVersionsResponse = {
        fieldId: "field-1",
        versions: [versionSummary({ id: "fv-published", status: "Published" })],
        hasDraft: false,
        publishedVersionNumber: 1,
      };
      const { optionSetRepository } = setupContainer({
        sets: [optionSetFixture({ id: "set-1", publishedVersionId: "osv-2" })],
        versions,
      });

      const { result } = renderHook(() => useOptionSetBindingViewModel(), { wrapper });
      act(() => result.current.openBinding("field-1", "Jersey size"));
      await waitFor(() => expect(result.current.hasActiveVersion).toBe(true));
      expect(result.current.canBind).toBe(false);

      await act(async () => {
        await result.current.bind("osv-2");
        await result.current.rebind("osv-2");
        await result.current.unbind();
      });

      expect(optionSetRepository.bind).not.toHaveBeenCalled();
      expect(optionSetRepository.rebind).not.toHaveBeenCalled();
      expect(optionSetRepository.unbind).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith({
        title: "customField.optionSetBinding.toast.permissionDenied",
      });
    });

    it("allows every action once .bind is granted alongside .view", async () => {
      // The mirror of the case above -- proves the gate is not simply "always refuse".
      const versions: FieldVersionsResponse = {
        fieldId: "field-1",
        versions: [versionSummary({ id: "fv-published", status: "Published" })],
        hasDraft: false,
        publishedVersionNumber: 1,
      };
      const { optionSetRepository } = setupContainer({
        sets: [optionSetFixture({ id: "set-1", publishedVersionId: "osv-2" })],
        versions,
      });

      const { result } = renderHook(() => useOptionSetBindingViewModel(), { wrapper });
      act(() => result.current.openBinding("field-1", "Jersey size"));
      await waitFor(() => expect(result.current.hasActiveVersion).toBe(true));
      expect(result.current.canBind).toBe(true);

      await act(async () => {
        await result.current.bind("osv-2");
      });

      expect(optionSetRepository.bind).toHaveBeenCalledWith("fv-published", "osv-2");
    });
  });
});
