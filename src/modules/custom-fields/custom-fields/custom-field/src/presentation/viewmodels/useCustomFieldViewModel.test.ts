/**
 * useCustomFieldViewModel — entity-types load-failure visibility
 *
 * WHY THIS EXISTS
 * ----------------
 * CustomFieldListView populates its "Entity Type" create-form dropdown from
 * `useQuery(["customFields", "entityTypes"], ...)`. TanStack Query already
 * exposes `isError`/`error` for that query, but the hook previously only
 * returned `{ entityTypes, isEntityTypesLoading }` — dropping `isError` on
 * the floor. If the entity-types request failed, the dropdown just stayed
 * empty with zero indication anything went wrong (see CustomFieldListView.tsx
 * and useConsentViewModel.ts's `isAnalyticsError` for the established
 * secondary-query-error pattern this follows).
 */
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useCustomFieldViewModel } from "./useCustomFieldViewModel";

const { mockUseQuery } = vi.hoisted(() => ({ mockUseQuery: vi.fn() }));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mockUseQuery,
  useMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  keepPreviousData: undefined,
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

// Same relative path useCustomFieldViewModel.ts itself uses to import the DI
// container, so the mock intercepts the exact module the hook resolves.
vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: () => ({
    customFieldRepository: {
      getEntityTypes: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }),
}));

describe("useCustomFieldViewModel", () => {
  it("surfaces isEntityTypesError when the entity-types query fails", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network error"),
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useCustomFieldViewModel());

    expect(result.current.isEntityTypesError).toBe(true);
  });

  it("does not report an error when the entity-types query succeeds", () => {
    mockUseQuery.mockReturnValue({
      data: [
        {
          key: "party.person",
          owningModule: "party",
          displayNameEn: "Person",
          displayNameAr: "شخص",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useCustomFieldViewModel());

    expect(result.current.isEntityTypesError).toBe(false);
    expect(result.current.entityTypes).toHaveLength(1);
  });
});
