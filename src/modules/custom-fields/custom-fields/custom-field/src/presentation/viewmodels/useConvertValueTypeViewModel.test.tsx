import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useConvertValueTypeViewModel } from "./useConvertValueTypeViewModel";
import type { CustomField } from "../../domain/entities/CustomField";
import type {
  ChangeFieldTypeResult,
  RollbackFieldTypeChangeResult,
} from "../../domain/entities/FieldInsight";
import { toast } from "@core/hooks/use-enhanced-toast";
import { makeCustomField } from "../../testSupport/makeCustomField";

/**
 * What the server sends as `jobRunId` for a refused dry run.
 *
 * NOT null: the backend's `ChangeFieldTypeResult.JobRunId` is a non-nullable `Guid`, documented as
 * "non-empty only when values were actually written", so a refusal serialises the all-zero Guid
 * rather than omitting the field.
 */
const REFUSED_RUN_JOB_ID = "00000000-0000-0000-0000-000000000000";

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

describe("useConvertValueTypeViewModel", () => {
  const mockRepo = {
    changeFieldType: vi.fn(),
    rollbackFieldTypeChange: vi.fn(),
  };

  // `openConvert` reads id/key/labelEn/valueType, which are class getters over `data` --
  // so this has to be a real entity, not an object literal.
  const sampleField: CustomField = makeCustomField({
    id: "field-1",
    entityTypeKey: "Athlete",
    key: "bio",
    labelEn: "Biography",
    labelAr: "السيرة الذاتية",
    valueType: "Text",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    permissionState.granted = new Set(["custom-fields.update"]);
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: mockRepo as unknown,
    } as ReturnType<typeof getCustomFieldsContainer>);
  });

  it("initializes in closed state with no target", () => {
    const { result } = renderHook(() => useConvertValueTypeViewModel(), {
      wrapper: createWrapper(),
    });

    expect(result.current.target).toBeNull();
    expect(result.current.selectedTargetType).toBe("");
    expect(result.current.conversionKind).toBeNull();
    expect(result.current.isLossy).toBe(false);
    expect(result.current.canExecute).toBe(false);
    expect(result.current.canUpdate).toBe(true);
  });

  it("opens convert target and closes properly", () => {
    const { result } = renderHook(() => useConvertValueTypeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openConvert(sampleField);
    });

    expect(result.current.target).toEqual({
      fieldId: "field-1",
      fieldKey: "bio",
      fieldLabel: "Biography",
      currentType: "Text",
    });

    act(() => {
      result.current.closeConvert();
    });

    expect(result.current.target).toBeNull();
  });

  it("computes Lossless conversion correctly and enables execution without confirmation", () => {
    const { result } = renderHook(() => useConvertValueTypeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openConvert(sampleField);
    });

    act(() => {
      result.current.setSelectedTargetType("LongText");
    });

    expect(result.current.conversionKind).toBe("Lossless");
    expect(result.current.isLossy).toBe(false);
    expect(result.current.canExecute).toBe(true);
  });

  it("computes Lossy conversion correctly and gates execution until confirmDataLoss is checked", () => {
    const { result } = renderHook(() => useConvertValueTypeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openConvert(sampleField);
    });

    act(() => {
      result.current.setSelectedTargetType("Number");
    });

    expect(result.current.conversionKind).toBe("Lossy");
    expect(result.current.isLossy).toBe(true);
    expect(result.current.canExecute).toBe(false);

    act(() => {
      result.current.setConfirmDataLoss(true);
    });

    expect(result.current.canExecute).toBe(true);
  });

  it("disallows execution for Impossible or NoChange conversions", () => {
    const { result } = renderHook(() => useConvertValueTypeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openConvert(sampleField);
    });

    // NoChange
    act(() => {
      result.current.setSelectedTargetType("Text");
    });
    expect(result.current.conversionKind).toBe("NoChange");
    expect(result.current.canExecute).toBe(false);

    // Impossible
    act(() => {
      result.current.setSelectedTargetType("Checkbox");
    });
    expect(result.current.conversionKind).toBe("Impossible");
    expect(result.current.canExecute).toBe(false);
  });

  it("executes successful conversion and sets lastResult", async () => {
    const appliedResult: ChangeFieldTypeResult = {
      applied: true,
      jobRunId: "job-run-99",
      kind: "Lossless",
      examined: 10,
      converted: 10,
      totalRefusals: 0,
      refusals: [],
    };
    mockRepo.changeFieldType.mockResolvedValueOnce(appliedResult);

    const { result } = renderHook(() => useConvertValueTypeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openConvert(sampleField);
      result.current.setSelectedTargetType("LongText");
    });

    await act(async () => {
      await result.current.executeConvert();
    });

    expect(mockRepo.changeFieldType).toHaveBeenCalledWith("field-1", {
      targetType: "LongText",
      confirmDataLoss: false,
    });
    expect(result.current.lastResult).toEqual(appliedResult);
    expect(toast.success).toHaveBeenCalled();
  });

  it("handles dry-run refusal properly without mutating data", async () => {
    const refusedResult: ChangeFieldTypeResult = {
      applied: false,
      jobRunId: REFUSED_RUN_JOB_ID,
      kind: "Lossy",
      examined: 10,
      converted: 0,
      totalRefusals: 2,
      refusals: [
        {
          entityFieldValueId: "efv-1",
          ownerEntityId: "ath-1",
          reason: "Cannot parse 'abc' as Number",
        },
        {
          entityFieldValueId: "efv-2",
          ownerEntityId: "ath-2",
          reason: "Cannot parse 'xyz' as Number",
        },
      ],
    };
    mockRepo.changeFieldType.mockResolvedValueOnce(refusedResult);

    const { result } = renderHook(() => useConvertValueTypeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openConvert(sampleField);
      result.current.setSelectedTargetType("Number");
      result.current.setConfirmDataLoss(true);
    });

    await act(async () => {
      await result.current.executeConvert();
    });

    expect(result.current.lastResult).toEqual(refusedResult);
    expect(toast.warning).toHaveBeenCalled();
  });

  it("executes rollback successfully", async () => {
    const rollbackResult: RollbackFieldTypeChangeResult = {
      snapshotsFound: 10,
      restored: 10,
      valuesGone: 0,
      unreadable: 0,
      typeReverted: true,
    };
    mockRepo.rollbackFieldTypeChange.mockResolvedValueOnce(rollbackResult);

    const { result } = renderHook(() => useConvertValueTypeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openConvert(sampleField);
    });

    await act(async () => {
      await result.current.executeRollback("job-run-99");
    });

    expect(mockRepo.rollbackFieldTypeChange).toHaveBeenCalledWith("job-run-99");
    expect(result.current.lastRollbackResult).toEqual(rollbackResult);
    expect(toast.success).toHaveBeenCalled();
  });

  // THE REGRESSION GUARD. A rollback returns 200 whether or not it restored everything -- the
  // command counts what it could not put back and returns it rather than failing. Reporting that
  // as success is the exact failure the backend refuses to commit: it tells an operator their data
  // is back while those records still hold converted values. Deleting the skip branch in
  // useConvertValueTypeViewModel's rollback onSuccess turns this red.
  it("reports a rollback that skipped records as a WARNING, never as success", async () => {
    const partialResult: RollbackFieldTypeChangeResult = {
      snapshotsFound: 10,
      restored: 7,
      valuesGone: 2,
      unreadable: 1,
      typeReverted: true,
    };
    mockRepo.rollbackFieldTypeChange.mockResolvedValueOnce(partialResult);

    const { result } = renderHook(() => useConvertValueTypeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openConvert(sampleField);
    });

    await act(async () => {
      await result.current.executeRollback("job-run-99");
    });

    expect(toast.warning).toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(result.current.lastRollbackResult).toEqual(partialResult);
  });
});
