/**
 * useFieldGroupOptions — the picker's option list (Wave 5 row 5.2 fix round)
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The "no group" sentinel is the ONLY way an admin can clear an existing group
 * assignment: `GenericSelect` is a Radix Select with no "unset" affordance, so
 * without a leading `""` option an assignment is one-way. That property lives
 * here, at `useFieldGroupOptions`, and it had zero test coverage — the only
 * assertion about it was in `fieldGroupFieldConfig.test.tsx`, against a
 * `GROUP_OPTIONS` fixture the test file wrote itself. `buildFieldGroupField`
 * receives `options` from its caller and passes them straight through, so
 * deleting the sentinel from THIS file left that assertion green while the UI
 * lost the ability to ungroup a field. Sixth false-green of this shape in the
 * programme, and the first one whose test named the behaviour it failed to
 * guard.
 *
 * Every case below therefore runs the REAL hook against the REAL repository,
 * mapper and service, over a mocked HTTP client only — the same arrangement
 * `useFieldGroupViewModel.reorder.test.tsx` uses beside this file.
 *
 * Confirmed by mutation, by hand, before committing:
 *   - deleting the sentinel entry from `useFieldGroupOptions.options` fails
 *     three cases here and nothing anywhere else in the suite;
 *   - changing `NO_FIELD_GROUP_VALUE` to `"none"` (a plausible "tidier"
 *     sentinel that the backend would then store as a group id) fails two;
 *   - dropping `enabled` back to `entityTypeKey.length > 0` fails the
 *     permission case.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFieldGroupOptions, NO_FIELD_GROUP_VALUE } from "./useFieldGroupOptions";
import { FieldGroupService } from "../../data/services/FieldGroupService";
import { FieldGroupRepository } from "../../data/repositories/FieldGroupRepository";
import type { FieldGroupJson } from "../../data/models/FieldGroupModel";
import type { IApiService } from "@core/interfaces/api.interface";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../../di", () => ({ getCustomFieldsContainer: vi.fn() }));

const i18nState = { language: "en" as "en" | "ar" };
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: i18nState.language }),
}));

const ENTITY_TYPE = "party.person";

function group(
  id: string,
  labelEn: string,
  labelAr: string | null,
  sortOrder: number
): FieldGroupJson {
  // stableKey derived from the id so every fixture group has a distinct one (Wave 6 row 6.5).
  return {
    id,
    entityTypeKey: ENTITY_TYPE,
    stableKey: `g_${id}`,
    labelEn,
    labelAr,
    sortOrder,
    isGlobal: false,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function setup(groups: FieldGroupJson[]) {
  const get = vi.fn().mockResolvedValue(groups);
  const api = { get, post: vi.fn(), put: vi.fn(), delete: vi.fn() };
  vi.mocked(getCustomFieldsContainer).mockReturnValue({
    fieldGroupRepository: new FieldGroupRepository(
      new FieldGroupService(api as unknown as IApiService)
    ),
  } as never);
  return { get };
}

describe("useFieldGroupOptions", () => {
  beforeEach(() => {
    i18nState.language = "en";
    vi.clearAllMocks();
  });

  it("leads with a 'no group' sentinel even when the server returns real groups", async () => {
    setup([group("enc-1", "Contact details", null, 0), group("enc-2", "Medical", null, 1)]);

    const { result } = renderHook(() => useFieldGroupOptions(ENTITY_TYPE), { wrapper });

    await waitFor(() => expect(result.current.groups).toHaveLength(2));
    // Sentinel FIRST, then the server's own order — not sorted, not appended.
    expect(result.current.options.map((option) => option.value)).toEqual([
      NO_FIELD_GROUP_VALUE,
      "enc-1",
      "enc-2",
    ]);
    expect(result.current.options[0].label).toBe("customField.fieldGroupNone");
  });

  it("submits the sentinel as an empty string — the one value the backend reads as 'ungrouped'", async () => {
    setup([group("enc-1", "Contact details", null, 0)]);

    const { result } = renderHook(() => useFieldGroupOptions(ENTITY_TYPE), { wrapper });

    await waitFor(() => expect(result.current.groups).toHaveLength(1));
    // Both halves matter. `""` is what Create/UpdateCustomFieldCommandHandler
    // treat as absent via string.IsNullOrEmpty; any other sentinel ("none",
    // "0", null) would either fail id validation or be stored as a group id.
    expect(NO_FIELD_GROUP_VALUE).toBe("");
    expect(result.current.options[0].value).toBe("");
  });

  it("labels each group in the active language, through the entity's own display logic", async () => {
    i18nState.language = "ar";
    setup([group("enc-1", "Contact details", "بيانات الاتصال", 0)]);

    const { result } = renderHook(() => useFieldGroupOptions(ENTITY_TYPE), { wrapper });

    await waitFor(() => expect(result.current.groups).toHaveLength(1));
    expect(result.current.options[1].label).toBe("بيانات الاتصال");
  });

  it("falls back to the English label when a group has no Arabic one", async () => {
    i18nState.language = "ar";
    setup([group("enc-1", "Contact details", null, 0)]);

    const { result } = renderHook(() => useFieldGroupOptions(ENTITY_TYPE), { wrapper });

    await waitFor(() => expect(result.current.groups).toHaveLength(1));
    expect(result.current.options[1].label).toBe("Contact details");
  });

  it("fires no request, and still offers the sentinel, when the caller may not read groups", async () => {
    const { get } = setup([group("enc-1", "Contact details", null, 0)]);

    const { result } = renderHook(() => useFieldGroupOptions(ENTITY_TYPE, { enabled: false }), {
      wrapper,
    });

    // GET /field-groups is gated on `custom-field-groups.view`. An admin without
    // it would get a 403 on every modal open; the picker degrades to "no group"
    // instead, and the definition's stored group is preserved because the field
    // is hidden rather than removed (see fieldGroupFieldConfig.test.tsx).
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(get).not.toHaveBeenCalled();
    expect(result.current.options).toEqual([
      { value: NO_FIELD_GROUP_VALUE, label: "customField.fieldGroupNone" },
    ]);
  });

  it("stays idle before an entity type is chosen — the endpoint has no 'all groups' mode", async () => {
    const { get } = setup([group("enc-1", "Contact details", null, 0)]);

    const { result } = renderHook(() => useFieldGroupOptions(""), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(get).not.toHaveBeenCalled();
    expect(result.current.options).toHaveLength(1);
  });
});
