import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFieldVersionsViewModel } from "./useFieldVersionsViewModel";
import type { CustomField } from "../../domain/entities/CustomField";
import type {
  FieldVersionsResponse,
  CreateFieldVersionDraftResult,
  PublishFieldVersionResult,
  DiscardFieldVersionDraftResult,
} from "../../domain/entities/FieldInsight";
import { toast } from "@core/hooks/use-enhanced-toast";
import { makeCustomField } from "../../testSupport/makeCustomField";

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

const permissionState = { granted: new Set<string>() };
vi.mock("@core/hooks/use-permission", () => ({
  usePermission: (permission: string) => permissionState.granted.has(permission),
}));

import { getCustomFieldsContainer } from "../../../../di";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useFieldVersionsViewModel", () => {
  const mockRepo = {
    getVersions: vi.fn(),
    createFieldVersionDraft: vi.fn(),
    publishFieldVersion: vi.fn(),
    discardFieldVersionDraft: vi.fn(),
  };

  // `openVersions` reads id/labelEn/key/entityTypeKey, which are class getters over `data` --
  // so this has to be a real entity, not an object literal cast into position.
  const sampleField: CustomField = makeCustomField({
    id: "field-101",
    entityTypeKey: "StaffMember",
    key: "jerseyNumber",
    labelEn: "Jersey Number",
    labelAr: "رقم القميص",
    valueType: "Number",
  });

  const mockVersions: FieldVersionsResponse = {
    fieldId: "field-101",
    hasDraft: false,
    publishedVersionNumber: 1,
    versions: [
      {
        id: "v-1",
        versionNumber: 1,
        status: "Published",
        optionCount: 0,
        ruleCount: 0,
        isPlatformOwned: false,
        effectiveFromUtc: "2026-08-01T00:00:00Z",
        effectiveToUtc: null,
        publishedAtUtc: "2026-08-01T00:00:00Z",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    permissionState.granted.clear();
    permissionState.granted.add("custom-fields.view");
    permissionState.granted.add("custom-fields.publish");
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: mockRepo,
    } as any);
    mockRepo.getVersions.mockResolvedValue(mockVersions);
  });

  it("opens target field and fetches versions", async () => {
    const { result } = renderHook(() => useFieldVersionsViewModel(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.target).toBeNull();

    act(() => {
      result.current.openVersions(sampleField);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.target?.fieldId).toBe("field-101");
    expect(result.current.target?.fieldKey).toBe("jerseyNumber");

    await waitFor(() => {
      expect(mockRepo.getVersions).toHaveBeenCalledWith("field-101");
      expect(result.current.versionsData).toEqual(mockVersions);
    });

    act(() => {
      result.current.closeVersions();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.target).toBeNull();
  });

  it("handles create draft mutation and triggers toast on success", async () => {
    const draftResult: CreateFieldVersionDraftResult = {
      draftVersionId: "v-draft-2",
      versionNumber: 2,
      optionsCopied: 0,
      rulesCopied: 0,
      tenantsWithRules: 0,
    };
    mockRepo.createFieldVersionDraft.mockResolvedValue(draftResult);

    const { result } = renderHook(() => useFieldVersionsViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openVersions(sampleField);
    });

    await waitFor(() => {
      expect(result.current.target).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleCreateDraft();
    });

    expect(mockRepo.createFieldVersionDraft).toHaveBeenCalledWith("field-101");
    expect(toast.success).toHaveBeenCalled();
  });

  it("handles publish mutation and triggers toast on success", async () => {
    const publishResult: PublishFieldVersionResult = {
      publishedVersionId: "v-draft-2",
      versionNumber: 2,
      deprecatedVersionId: "v-1",
      rulesOnPublishedVersion: 0,
    };
    mockRepo.publishFieldVersion.mockResolvedValue(publishResult);

    const { result } = renderHook(() => useFieldVersionsViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openVersions(sampleField);
    });

    await waitFor(() => {
      expect(result.current.target).not.toBeNull();
    });

    await act(async () => {
      await result.current.handlePublish();
    });

    expect(mockRepo.publishFieldVersion).toHaveBeenCalledWith("field-101");
    expect(toast.success).toHaveBeenCalled();
  });

  it("handles discard mutation and triggers toast on success", async () => {
    const discardResult: DiscardFieldVersionDraftResult = {
      discardedVersionId: "v-draft-2",
      versionNumber: 2,
      optionsRetained: 0,
      rulesRetained: 0,
    };
    mockRepo.discardFieldVersionDraft.mockResolvedValue(discardResult);

    const { result } = renderHook(() => useFieldVersionsViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openVersions(sampleField);
    });

    await waitFor(() => {
      expect(result.current.target).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleDiscard();
    });

    expect(mockRepo.discardFieldVersionDraft).toHaveBeenCalledWith("field-101");
    expect(toast.success).toHaveBeenCalled();
  });
});
