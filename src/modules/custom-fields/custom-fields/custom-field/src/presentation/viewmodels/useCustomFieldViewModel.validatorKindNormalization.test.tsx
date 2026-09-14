/**
 * useCustomFieldViewModel — validatorKind/validatorParam "" -> null
 * normalization at the create/update write seam (Wave 2 Step 2.5 Task 10,
 * TRAP 1)
 *
 * WHY THIS EXISTS
 * ----------------
 * `ValidatorKind` is a nullable enum on the backend
 * (`CustomFields.Domain.Enums.ValidatorKind?`), deserialized with a bare
 * `JsonStringEnumConverter`. `""` is neither a JSON `null` nor a real member
 * name, so an unnormalized `""` fails model binding outright -- unlike
 * `options`, which survives `""` today only because `Options` is a plain
 * `string?` column. The admin picker's "no validator" option
 * (CustomFieldListView.tsx) submits `""` when an admin explicitly clears a
 * previously-attached validator, and `generic-form.tsx`'s `submitData` is a
 * raw spread of `formData` with no per-field coercion beyond dates/numbers --
 * so `""` reaches `useCustomFieldViewModel`'s create/update seam verbatim
 * unless normalized there.
 *
 * This test exercises the REAL `useCrudViewModel` -> `useGenericMutations`
 * -> `useMutation` chain against a real `QueryClient` (only the DI
 * container, toast, and i18n hooks are mocked, same minimal-mock approach as
 * `useGenericMutations.deferSuccessToast.test.tsx`) so the assertion is on
 * the actual payload handed to `customFieldRepository.create`/`update` --
 * the last frontend seam before the HTTP call -- not on an isolated helper
 * that might drift from what the hook actually does.
 *
 * If the "" -> null normalization is ever removed from
 * useCustomFieldViewModel.ts's create/update callbacks, this test fails.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCustomFieldViewModel } from "./useCustomFieldViewModel";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: vi.fn(),
}));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
}));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useCustomFieldViewModel — validatorKind/validatorParam '' -> null normalization (TRAP 1)", () => {
  const createMock = vi.fn().mockResolvedValue("new-def-id");
  const updateMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    createMock.mockClear();
    updateMock.mockClear();
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: {
        create: createMock,
        update: updateMock,
        getEntityTypes: vi.fn().mockResolvedValue([]),
        getAll: vi.fn().mockResolvedValue({ items: [], totalCount: 0, totalPages: 0 }),
        getById: vi.fn(),
        delete: vi.fn(),
      },
    } as any);
  });

  it("normalizes validatorKind AND validatorParam '' to null on create -- an unnormalized '' fails the backend's nullable-enum model binding", async () => {
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.createItem({
        entityTypeKey: "party.person",
        key: "iban",
        labelEn: "IBAN",
        valueType: "Text",
        validatorKind: "",
        validatorParam: "",
      } as any);
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    const payload = createMock.mock.calls[0][0];
    // The load-bearing assertion: "" must never reach the repository call.
    expect(payload.validatorKind).not.toBe("");
    expect(payload.validatorParam).not.toBe("");
    expect(payload.validatorKind).toBeNull();
    expect(payload.validatorParam).toBeNull();
  });

  it("normalizes on update too -- explicitly clearing a previously-attached validator must not send ''", async () => {
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.updateItem("field-1", {
        labelEn: "IBAN",
        validatorKind: "",
        validatorParam: "",
      } as any);
    });

    expect(updateMock).toHaveBeenCalledTimes(1);
    const [id, payload] = updateMock.mock.calls[0];
    expect(id).toBe("field-1");
    expect(payload.validatorKind).not.toBe("");
    expect(payload.validatorKind).toBeNull();
    expect(payload.validatorParam).toBeNull();
  });

  it("leaves a real validatorKind/validatorParam selection untouched", async () => {
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.createItem({
        entityTypeKey: "party.person",
        key: "shipping_zip",
        labelEn: "Shipping ZIP",
        valueType: "Text",
        validatorKind: "PostalCode",
        validatorParam: "EG",
      } as any);
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ validatorKind: "PostalCode", validatorParam: "EG" })
    );
  });

  it("does not touch validatorKind/validatorParam when they are absent from the payload (Boolean/Number/Date/Select definitions)", async () => {
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.createItem({
        entityTypeKey: "party.person",
        key: "is_vip",
        labelEn: "VIP",
        valueType: "Boolean",
      } as any);
    });

    const payload = createMock.mock.calls[0][0];
    expect("validatorKind" in payload).toBe(false);
    expect("validatorParam" in payload).toBe(false);
  });
});
