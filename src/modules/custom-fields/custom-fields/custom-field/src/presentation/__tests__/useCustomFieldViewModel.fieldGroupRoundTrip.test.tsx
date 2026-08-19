/**
 * fieldGroupId round-trip — Wave 5 row 5.2
 *
 * `UpdateCustomFieldCommandHandler` resolves FieldGroupId from the request and
 * assigns whatever it resolves to, with NO "absent means unchanged" semantics:
 * a request that omits it (or sends `""`) means UNGROUP THIS FIELD. And
 * `CustomFieldListResponse` deliberately does not carry `fieldGroupId` at all.
 *
 * Those two facts together are exactly the shape of Wave 2 Step 2.5's finding
 * C-1, the Critical data-loss bug where the edit form was populated from the
 * list row and silently blanked every column the list omitted. This file exists
 * so the same defect cannot reappear through the new column.
 *
 * Every layer below the hook is REAL — wire JSON -> CustomFieldService ->
 * CustomFieldModel -> CustomFieldMapper -> CustomFieldRepository ->
 * useCustomFieldViewModel.openEditModal -> buildCustomFieldEditInitialValues ->
 * normalizeValidatorFields -> the payload handed to repository.update. Only the
 * HTTP client, DI, i18n and toast are stubbed. The final assertion is on the
 * object that would go over the wire.
 *
 * The last case is the negative control: it runs the same real functions
 * against an UN-hydrated list row and asserts the group IS lost. If someone
 * removes the hydration, that case still passes and the ones above it fail —
 * which is the point. A guard that cannot tell the two states apart is the
 * false-green shape this programme keeps finding.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCustomFieldViewModel } from "../viewmodels/useCustomFieldViewModel";
import { buildCustomFieldEditInitialValues } from "../customFieldEditInitialValues";
import { CustomFieldService } from "../../data/services/CustomFieldService";
import { CustomFieldRepository } from "../../data/repositories/CustomFieldRepository";
import type { CustomField } from "../../domain/entities/CustomField";
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

const FIELD_ID = "enc-field-1";
const GROUP_ID = "enc-group-7";

/** A real CustomFieldListResponse row — note the absent fieldGroupId. */
const LIST_ROW_JSON = {
  id: FIELD_ID,
  entityTypeKey: "party.person",
  key: "shirt_size",
  labelEn: "Shirt Size",
  labelAr: "مقاس القميص",
  valueType: "Text" as const,
  isRequired: false,
  sortOrder: 3,
  isActive: true,
  createdAt: "2026-08-01T00:00:00Z",
  isGlobal: false,
};

/** The same definition as CustomFieldResponse returns it — grouped. */
const DETAIL_JSON = {
  ...LIST_ROW_JSON,
  placeholderEn: "M",
  placeholderAr: "م",
  options: null,
  modifiedAt: null,
  validatorKind: null,
  validatorParam: null,
  fieldGroupId: GROUP_ID,
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("custom-field fieldGroupId round trip", () => {
  const updateMock = vi.fn().mockResolvedValue(undefined);
  const createMock = vi.fn().mockResolvedValue("enc-new");
  let repository: CustomFieldRepository;

  beforeEach(() => {
    updateMock.mockClear();
    createMock.mockClear();

    const apiGet = vi.fn(async (url: string) => {
      if (url.includes(`/custom-fields/${FIELD_ID}`)) return DETAIL_JSON;
      if (url.includes("/entity-types")) return [];
      return {
        items: [LIST_ROW_JSON],
        totalCount: 1,
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
    vi.spyOn(repository, "update").mockImplementation(updateMock);
    vi.spyOn(repository, "create").mockImplementation(createMock);

    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: repository,
    } as never);
  });

  async function firstListRow(): Promise<CustomField> {
    const page = await repository.getAll({ page: 1, pageSize: 10 });
    return page.items[0];
  }

  it("the premise: the list row genuinely carries no fieldGroupId, the detail fetch does", async () => {
    const row = await firstListRow();
    expect(row.fieldGroupId).toBeUndefined();

    const detail = await repository.getById(FIELD_ID);
    expect(detail.fieldGroupId).toBe(GROUP_ID);
  });

  it("seeds the edit form with the stored group", async () => {
    const detail = await repository.getById(FIELD_ID);

    expect(buildCustomFieldEditInitialValues(detail).fieldGroupId).toBe(GROUP_ID);
  });

  it("PRESERVES the group through an edit that never touched it — the row 5.2 data-loss assertion", async () => {
    const row = await firstListRow();
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.openEditModal(row);
    });
    await waitFor(() => expect(result.current.vm.editingItem).not.toBeNull());

    // The most ordinary edit there is: a rename, touching nothing else.
    const formState = buildCustomFieldEditInitialValues(
      result.current.vm.editingItem as CustomField
    );
    await act(async () => {
      await result.current.vm.updateItem(FIELD_ID, {
        ...formState,
        labelEn: "Shirt Size (EU)",
      } as never);
    });

    expect(updateMock).toHaveBeenCalledTimes(1);
    const [, payload] = updateMock.mock.calls[0];
    expect(payload.labelEn).toBe("Shirt Size (EU)");
    expect(payload.fieldGroupId).toBe(GROUP_ID);
  });

  it("submits an explicit empty string when the admin deliberately clears the group", async () => {
    const row = await firstListRow();
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.openEditModal(row);
    });
    await waitFor(() => expect(result.current.vm.editingItem).not.toBeNull());

    const formState = buildCustomFieldEditInitialValues(
      result.current.vm.editingItem as CustomField
    );
    await act(async () => {
      // What picking the leading "no group" sentinel writes into form state.
      await result.current.vm.updateItem(FIELD_ID, { ...formState, fieldGroupId: "" } as never);
    });

    const [, payload] = updateMock.mock.calls[0];
    // "" reaches the wire as-is: the backend branches on
    // string.IsNullOrEmpty(FieldGroupId), so empty and absent are the same
    // thing to it. Unlike validatorKind (a nullable ENUM), this needs no
    // write-seam null-coercion — and must not be silently dropped either.
    expect(payload).toHaveProperty("fieldGroupId", "");
  });

  it("carries a chosen group through a create", async () => {
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.createItem({
        entityTypeKey: "party.person",
        key: "shirt_size",
        labelEn: "Shirt Size",
        valueType: "Text",
        validatorKind: "",
        validatorParam: "",
        fieldGroupId: GROUP_ID,
        isRequired: false,
        sortOrder: 0,
      } as never);
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    const [payload] = createMock.mock.calls[0];
    expect(payload.fieldGroupId).toBe(GROUP_ID);
    // The validator write-seam normalization must not clobber the new column
    // while turning ""s into nulls for its own two fields.
    expect(payload.validatorKind).toBeNull();
  });

  it("documents the exact defect: the same real functions on an UN-hydrated list row DO lose the group", async () => {
    const row = await firstListRow();

    const values = buildCustomFieldEditInitialValues(row);

    expect(values.fieldGroupId).toBe("");
    expect(values.fieldGroupId).not.toBe(GROUP_ID);
  });
});
