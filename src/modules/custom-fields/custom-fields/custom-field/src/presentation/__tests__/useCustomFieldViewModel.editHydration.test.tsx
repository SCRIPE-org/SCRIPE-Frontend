/**
 * Edit-modal hydration — Wave 2 Step 2.5 fix round, finding C-1.
 *
 * WHAT SHIPPED BROKEN
 * -------------------
 * `useCrudViewModel.openEditModal` was a bare `setEditingItem(item)`, and
 * `generic-crud-view.tsx` hands whatever that stores straight to the screen's
 * `editInitialValues`. The item is the LIST ROW, built by
 * `CustomFieldModel.fromListJson` from `CustomFieldListResponse` — a response
 * that deliberately omits `options`, both placeholders and both validator
 * columns (ruling R3). Every one of those therefore arrived as
 * `null`/`undefined`, became `""` in the form's initial values, and was
 * submitted verbatim (`GenericForm.submitData` is a raw spread of form state;
 * `isVisible` filters rendering, never the payload).
 *
 * `UpdateCustomFieldCommandHandler` assigns all of them unconditionally, with
 * no "absent means unchanged" semantics, so simply renaming a field or
 * toggling `isActive` silently detached its validator and blanked its
 * placeholders — and every value submitted to that field afterwards was
 * accepted unvalidated.
 *
 * WHY THIS TEST IS SHAPED THE WAY IT IS
 * -------------------------------------
 * The defect shipped with 457 green tests because this module's frontend
 * tests assert on SOURCE TEXT — they check that the literal expression
 * `item.validatorKind ?? ""` appears in `CustomFieldListView.tsx`. It did. No
 * test ever built a list row and asked what that expression evaluates to.
 *
 * So this file evaluates the REAL chain end to end, and every layer below the
 * hook is genuine, not a stand-in:
 *
 *   wire JSON -> CustomFieldService (real) -> CustomFieldModel.fromListJson /
 *   fromJson (real) -> CustomFieldMapper (real) -> CustomFieldRepository
 *   (real) -> useCustomFieldViewModel.openEditModal (real) ->
 *   buildCustomFieldEditInitialValues (real, the one the view actually uses)
 *   -> normalizeValidatorFields (real) -> the payload handed to
 *   repository.update
 *
 * Only the HTTP client, the DI container, i18n and toast are mocked. The
 * final assertion is on the object that would go over the wire.
 *
 * The `documents the exact defect` case at the bottom is the negative
 * control: it runs the same real functions against the un-hydrated list row
 * and asserts the payload DOES lose the validator. If someone reverts the
 * hydration, that case still passes and the ones above it fail — which is the
 * point. A regression test that cannot distinguish the two states is the
 * false-green shape this whole fix round exists to remove.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCustomFieldViewModel, normalizeValidatorFields } from "../viewmodels/useCustomFieldViewModel";
import { buildCustomFieldEditInitialValues } from "../customFieldEditInitialValues";
import { CustomFieldService } from "../../data/services/CustomFieldService";
import { CustomFieldRepository } from "../../data/repositories/CustomFieldRepository";
import type { CustomField } from "../../domain/entities/CustomField";
import type { IApiService } from "@core/interfaces/api.interface";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: vi.fn(),
}));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

const FIELD_ID = "enc-field-1";

/**
 * A real `CustomFieldListResponse` row, field for field. Nothing here is
 * invented: the row carries exactly the properties that DTO declares and,
 * critically, none of the five it omits.
 */
const LIST_ROW_JSON = {
  id: FIELD_ID,
  entityTypeKey: "party.person",
  key: "bank_account",
  labelEn: "Bank Account",
  labelAr: "الحساب البنكي",
  valueType: "Text" as const,
  isRequired: false,
  sortOrder: 3,
  isActive: true,
  createdAt: "2026-08-01T00:00:00Z",
  isGlobal: false,
};

/**
 * The same definition as `CustomFieldResponse` returns it — the five columns
 * the list row omits are all populated and all non-trivial, so a fix that
 * merely threaded `validatorKind` through would still fail the assertions on
 * the placeholders below.
 */
const DETAIL_JSON = {
  ...LIST_ROW_JSON,
  placeholderEn: "GB00 XXXX 0000 0000 0000 00",
  placeholderAr: "أدخل رقم الآيبان",
  options: null,
  modifiedAt: "2026-08-10T00:00:00Z",
  validatorKind: "Iban",
  validatorParam: null,
};

/** A Select definition, to cover the `options` half of the same defect. */
const SELECT_LIST_ROW_JSON = {
  ...LIST_ROW_JSON,
  id: "enc-field-2",
  key: "shirt_size",
  valueType: "Select" as const,
};
const SELECT_DETAIL_JSON = {
  ...SELECT_LIST_ROW_JSON,
  placeholderEn: null,
  placeholderAr: null,
  options: "Small\nMedium\nLarge",
  modifiedAt: null,
  validatorKind: null,
  validatorParam: null,
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useCustomFieldViewModel.openEditModal — detail hydration (C-1)", () => {
  const updateMock = vi.fn().mockResolvedValue(undefined);
  let apiGet: ReturnType<typeof vi.fn>;
  let repository: CustomFieldRepository;

  beforeEach(() => {
    updateMock.mockClear();

    // A minimal HTTP client, routed by URL — everything above it (service,
    // model, mapper, repository) is the real production code.
    apiGet = vi.fn(async (url: string) => {
      if (url.includes(`/custom-fields/${FIELD_ID}`)) return DETAIL_JSON;
      if (url.includes(`/custom-fields/${SELECT_DETAIL_JSON.id}`)) return SELECT_DETAIL_JSON;
      if (url.includes("/entity-types")) return [];
      return {
        items: [LIST_ROW_JSON, SELECT_LIST_ROW_JSON],
        totalCount: 2,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    });

    repository = new CustomFieldRepository(
      new CustomFieldService({ get: apiGet } as unknown as IApiService)
    );
    // Only `update` is stubbed — it is the assertion surface (the last
    // frontend seam before the HTTP call).
    vi.spyOn(repository, "update").mockImplementation(updateMock);

    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: repository,
    } as any);
  });

  /** The list row exactly as the table holds it, through the real read path. */
  async function firstListRow(): Promise<CustomField> {
    const page = await repository.getAll({ page: 1, pageSize: 10 });
    return page.items[0];
  }

  it("the premise: a real list row genuinely carries no validator, options or placeholders", async () => {
    const row = await firstListRow();

    expect(row.id).toBe(FIELD_ID);
    expect(row.validatorKind).toBeUndefined();
    expect(row.validatorParam).toBeUndefined();
    expect(row.placeholderEn).toBeUndefined();
    expect(row.placeholderAr).toBeUndefined();
    expect(row.options).toBeNull();
  });

  it("stores a DETAIL-fetched item as editingItem, not the list row it was clicked from", async () => {
    const row = await firstListRow();
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.openEditModal(row);
    });

    await waitFor(() => expect(result.current.vm.isEditModalOpen).toBe(true));

    const editingItem = result.current.vm.editingItem as CustomField;
    expect(editingItem.id).toBe(FIELD_ID);
    expect(editingItem.validatorKind).toBe("Iban");
    expect(editingItem.placeholderEn).toBe(DETAIL_JSON.placeholderEn);
    expect(editingItem.placeholderAr).toBe(DETAIL_JSON.placeholderAr);
  });

  it("the resulting update payload PRESERVES the validator — the actual C-1 assertion", async () => {
    const row = await firstListRow();
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.openEditModal(row);
    });
    await waitFor(() => expect(result.current.vm.editingItem).not.toBeNull());

    // The real edit-form seed the view uses, then the real write-seam
    // normalization, then the real update mutation. The admin's edit here is
    // the most ordinary one there is: a rename, touching nothing else.
    const formState = buildCustomFieldEditInitialValues(result.current.vm.editingItem as CustomField);
    const submitted = { ...formState, labelEn: "Bank Account (IBAN)" };

    await act(async () => {
      await result.current.vm.updateItem(FIELD_ID, submitted as never);
    });

    expect(updateMock).toHaveBeenCalledTimes(1);
    const [id, payload] = updateMock.mock.calls[0];
    expect(id).toBe(FIELD_ID);
    expect(payload.labelEn).toBe("Bank Account (IBAN)");
    // The validator must survive an edit that never touched it.
    expect(payload.validatorKind).toBe("Iban");
    expect(payload.validatorKind).not.toBeNull();
    // …and so must the placeholders, which the same defect blanked.
    expect(payload.placeholderEn).toBe(DETAIL_JSON.placeholderEn);
    expect(payload.placeholderAr).toBe(DETAIL_JSON.placeholderAr);
  });

  it("preserves a Select definition's options too — the same defect made those fields unsaveable (422 optionsRequired)", async () => {
    const page = await repository.getAll({ page: 1, pageSize: 10 });
    const selectRow = page.items[1];
    expect(selectRow.valueType).toBe("Select");
    expect(selectRow.options).toBeNull();

    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });
    await act(async () => {
      await result.current.vm.openEditModal(selectRow);
    });
    await waitFor(() => expect(result.current.vm.editingItem).not.toBeNull());

    const formState = buildCustomFieldEditInitialValues(result.current.vm.editingItem as CustomField);
    await act(async () => {
      await result.current.vm.updateItem(selectRow.id, { ...formState, isActive: false } as never);
    });

    const [, payload] = updateMock.mock.calls[0];
    expect(payload.options).toBe("Small\nMedium\nLarge");
  });

  it("does NOT open the edit modal when the detail fetch fails — falling back to the list row would silently reinstate the data loss", async () => {
    const row = await firstListRow();
    // Fail only the detail fetch — the list query behind the table must stay
    // healthy, so this is scoped to getById rather than to the HTTP client.
    vi.spyOn(repository, "getById").mockRejectedValueOnce(new Error("network"));

    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });
    await act(async () => {
      await result.current.vm.openEditModal(row);
    });

    expect(result.current.vm.isEditModalOpen).toBe(false);
    expect(result.current.vm.editingItem).toBeNull();
  });

  it("documents the exact defect: the same real functions on an UN-hydrated list row do lose the validator", async () => {
    const row = await firstListRow();

    // No hydration — feed the list row straight into the real builder and the
    // real write-seam normalization, which is what the shipped code did.
    const payload = normalizeValidatorFields(
      buildCustomFieldEditInitialValues(row) as unknown as Record<string, unknown>
    );

    expect(payload.validatorKind).toBeNull();
    expect(payload.placeholderEn).toBe("");
    expect(payload.placeholderAr).toBe("");
  });
});
