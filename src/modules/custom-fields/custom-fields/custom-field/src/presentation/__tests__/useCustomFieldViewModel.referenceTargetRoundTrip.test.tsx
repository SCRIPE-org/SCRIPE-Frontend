/**
 * referenceTargetEntityTypeKey round trip — Wave 4 follow-up
 *
 * `UpdateCustomFieldCommandHandler` assigns `entity.ReferenceTargetEntityTypeKey` from its shared
 * gate's output on every update, with NO "absent means unchanged" semantics: a request that omits it
 * (or sends `""`) means UNPIN THIS FIELD. And `CustomFieldListResponse` deliberately does not carry
 * the column at all.
 *
 * Those two facts together are the Wave 2 Step 2.5 C-1 shape exactly — the Critical data-loss bug
 * where the edit form was populated from the list row and silently blanked every column the list
 * omitted. `fieldGroupId` joined that hazard class in Wave 5 and got its own round-trip file; this is
 * the same file for the third column to join it.
 *
 * WHY THIS ASSERTS THE HTTP BODY AND NOT `repository.update`'s ARGUMENT
 * --------------------------------------------------------------------
 * The sibling `fieldGroupRoundTrip` file stubs the repository and asserts what it was called with,
 * which is enough for a column the repository passes through unexamined. This one goes one seam
 * further and asserts the object handed to `IApiService.put`/`post`, because "the property is on the
 * payload" and "the property is in the request body" are different claims: the repository, the
 * service and the write-seam normalization all sit between them, and each one is a place a spread
 * could drop a key. Everything below the hook is real — wire JSON -> CustomFieldService ->
 * CustomFieldModel -> CustomFieldMapper -> CustomFieldRepository ->
 * useCustomFieldViewModel.openEditModal -> buildCustomFieldEditInitialValues ->
 * normalizeValidatorFields -> the body posted or put. Only the HTTP client, DI, i18n and toast are
 * stubbed.
 *
 * The last case is the negative control: it runs the same real functions against an UN-hydrated list
 * row and asserts the pin IS lost. If someone removes the detail-fetch hydration, that case still
 * passes and the ones above it fail — which is the point.
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
const TARGET_KEY = "hrms.staff-member";

/** A real CustomFieldListResponse row — note the absent referenceTargetEntityTypeKey. */
const LIST_ROW_JSON = {
  id: FIELD_ID,
  entityTypeKey: "party.person",
  key: "reports_to",
  labelEn: "Reports To",
  labelAr: "يتبع",
  valueType: "EntityReference" as const,
  isRequired: false,
  sortOrder: 3,
  isActive: true,
  createdAt: "2026-08-01T00:00:00Z",
  isGlobal: false,
};

/** The same definition as CustomFieldResponse returns it — pinned. */
const DETAIL_JSON = {
  ...LIST_ROW_JSON,
  placeholderEn: "Pick a staff member",
  placeholderAr: "اختر عضوًا",
  options: null,
  modifiedAt: null,
  validatorKind: null,
  validatorParam: null,
  fieldGroupId: null,
  referenceTargetEntityTypeKey: TARGET_KEY,
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("custom-field referenceTargetEntityTypeKey round trip", () => {
  const apiPost = vi.fn(async () => ({ id: "enc-new" }));
  const apiPut = vi.fn(async () => undefined);
  let repository: CustomFieldRepository;

  beforeEach(() => {
    apiPost.mockClear();
    apiPut.mockClear();

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

    // Real service and repository over a fake transport, so the assertion lands on the request body.
    repository = new CustomFieldRepository(
      new CustomFieldService({
        get: apiGet,
        post: apiPost,
        put: apiPut,
      } as unknown as IApiService)
    );

    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: repository,
    } as never);
  });

  async function firstListRow(): Promise<CustomField> {
    const page = await repository.getAll({ page: 1, pageSize: 10 });
    return page.items[0];
  }

  /** The body of the single PUT / POST that was made. */
  function putBody(): Record<string, unknown> {
    expect(apiPut).toHaveBeenCalledTimes(1);
    return apiPut.mock.calls[0][1] as Record<string, unknown>;
  }
  function postBody(): Record<string, unknown> {
    expect(apiPost).toHaveBeenCalledTimes(1);
    return apiPost.mock.calls[0][1] as Record<string, unknown>;
  }

  it("the premise: the list row genuinely carries no pin, the detail fetch does", async () => {
    const row = await firstListRow();
    expect(row.referenceTargetEntityTypeKey).toBeUndefined();

    const detail = await repository.getById(FIELD_ID);
    expect(detail.referenceTargetEntityTypeKey).toBe(TARGET_KEY);
  });

  it("seeds the edit form with the stored pin", async () => {
    const detail = await repository.getById(FIELD_ID);

    expect(buildCustomFieldEditInitialValues(detail).referenceTargetEntityTypeKey).toBe(TARGET_KEY);
  });

  it("PRESERVES the pin through an edit that never touched it — the data-loss assertion", async () => {
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
        labelEn: "Reports To (Manager)",
      } as never);
    });

    const body = putBody();
    expect(body.labelEn).toBe("Reports To (Manager)");
    // The claim this whole file exists to make: the pin is in the REQUEST BODY, not merely somewhere
    // upstream of it.
    expect(body.referenceTargetEntityTypeKey).toBe(TARGET_KEY);
    expect(apiPut.mock.calls[0][0]).toContain(`/custom-fields/${FIELD_ID}`);
  });

  it("submits an explicit empty string when the admin deliberately unpins", async () => {
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
      // What picking the leading "not pinned" sentinel writes into form state.
      await result.current.vm.updateItem(FIELD_ID, {
        ...formState,
        referenceTargetEntityTypeKey: "",
      } as never);
    });

    // "" reaches the wire as-is. Both arms of the backend gate branch on
    // string.IsNullOrWhiteSpace, so empty and absent mean the same thing to it -- but the key must
    // not be silently DROPPED here either, because a reviewer cannot tell a dropped key from a
    // deliberate unpin by looking at the resulting entity.
    expect(putBody()).toHaveProperty("referenceTargetEntityTypeKey", "");
  });

  it("carries a chosen pin through a create, into the POST body", async () => {
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.createItem({
        entityTypeKey: "party.person",
        key: "reports_to",
        labelEn: "Reports To",
        valueType: "EntityReference",
        validatorKind: "",
        validatorParam: "",
        fieldGroupId: "",
        referenceTargetEntityTypeKey: TARGET_KEY,
        isRequired: false,
        sortOrder: 0,
      } as never);
    });

    const body = postBody();
    expect(body.referenceTargetEntityTypeKey).toBe(TARGET_KEY);
    // The validator write-seam normalization must not clobber this column while turning its own two
    // ""s into nulls.
    expect(body.validatorKind).toBeNull();
    expect(body.validatorParam).toBeNull();
  });

  it("sends the unpinned sentinel for a non-reference definition rather than dropping the key", async () => {
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      // A plain Text field created from the same form: the picker is hidden, but createInitialValues
      // still seeds the key, so this is what actually goes over the wire.
      await result.current.vm.createItem({
        entityTypeKey: "party.person",
        key: "nickname",
        labelEn: "Nickname",
        valueType: "Text",
        validatorKind: "",
        validatorParam: "",
        referenceTargetEntityTypeKey: "",
        isRequired: false,
        sortOrder: 0,
      } as never);
    });

    // Accepted, not refused: ReferenceTargetOwnership.NormalizeTargetEntityType short-circuits on
    // IsNullOrWhiteSpace before it ever asks whether a Text field could carry a target, so the blank
    // is read as "unpinned" rather than as "a target on a type that has none".
    expect(postBody()).toHaveProperty("referenceTargetEntityTypeKey", "");
  });

  it("documents the exact defect: the same real functions on an UN-hydrated list row DO lose the pin", async () => {
    const row = await firstListRow();

    const values = buildCustomFieldEditInitialValues(row);

    expect(values.referenceTargetEntityTypeKey).toBe("");
    expect(values.referenceTargetEntityTypeKey).not.toBe(TARGET_KEY);
  });
});
