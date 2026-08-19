import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  registerCustomFieldsExtension,
  getCustomFieldsExtension,
  encodeCustomFieldName,
  decodeCustomFieldName,
  useCustomFieldsFormFields,
  useCustomFieldColumns,
  type CustomFieldsExtensionApi,
  type BulkColumnValuesResult,
} from "./customFieldsExtension";
import type { FieldConfig } from "@core/ui/forms/generic-form";

function makeApi(overrides: Partial<CustomFieldsExtensionApi> = {}): CustomFieldsExtensionApi {
  return {
    getFormFields: vi.fn().mockResolvedValue([]),
    saveValues: vi.fn().mockResolvedValue(undefined),
    getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
    InlineAddTrigger: () => null,
    ...overrides,
  };
}

describe("customFieldsExtension registry", () => {
  it("hands back the exact api that was registered", () => {
    const api = makeApi();
    registerCustomFieldsExtension(api);

    expect(getCustomFieldsExtension()).toBe(api);
  });
});

describe("customFieldsExtension naming contract", () => {
  it("round-trips a key through encode/decode", () => {
    const encoded = encodeCustomFieldName("nationality");
    expect(decodeCustomFieldName(encoded)).toBe("nationality");
  });

  it("returns null decoding a name that was never encoded", () => {
    expect(decodeCustomFieldName("firstName")).toBeNull();
  });
});

describe("useCustomFieldsFormFields", () => {
  beforeEach(() => {
    // Reset registration between tests — registerCustomFieldsExtension has no
    // unregister, so tests re-register a fresh mock each time instead.
  });

  it("returns an empty, non-loading result when entityTypeKey is undefined, without calling the extension", async () => {
    const api = makeApi();
    registerCustomFieldsExtension(api);

    const { result } = renderHook(() => useCustomFieldsFormFields(undefined, undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.fieldConfigs).toEqual([]);
    expect(api.getFormFields).not.toHaveBeenCalled();
  });

  it("fetches and returns fields from the registered extension when entityTypeKey is set", async () => {
    const fields: FieldConfig[] = [{ name: encodeCustomFieldName("nationality"), label: "Nationality", type: "text" }];
    const api = makeApi({ getFormFields: vi.fn().mockResolvedValue(fields) });
    registerCustomFieldsExtension(api);

    const { result } = renderHook(() => useCustomFieldsFormFields("party.person", undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.fieldConfigs).toEqual(fields);
    expect(result.current.error).toBeNull();
    expect(api.getFormFields).toHaveBeenCalledWith("party.person", undefined);
  });

  it("captures a getFormFields rejection into `error` instead of letting it escape unhandled", async () => {
    const failure = new Error("403 Forbidden");
    const api = makeApi({ getFormFields: vi.fn().mockRejectedValue(failure) });
    registerCustomFieldsExtension(api);

    const { result } = renderHook(() => useCustomFieldsFormFields("party.person", undefined));

    await waitFor(() => expect(result.current.error).toBe(failure));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fieldConfigs).toEqual([]);
    // refetch must resolve, never reject — both production call sites are
    // fire-and-forget (`void refetch()`), so a rejecting refetch would be an
    // unhandled rejection.
    await expect(result.current.refetch()).resolves.toBeUndefined();
  });
});

describe("useCustomFieldColumns", () => {
  it("returns no columns and never calls the extension when entityTypeKey is undefined", async () => {
    const api = makeApi();
    registerCustomFieldsExtension(api);

    const { result } = renderHook(() => useCustomFieldColumns(undefined, ["owner-1"]));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.columns).toEqual([]);
    expect(api.getBulkColumnValues).not.toHaveBeenCalled();
  });

  it("returns no columns and never calls the extension when ownerIds is empty (e.g. an empty search result page)", async () => {
    const api = makeApi();
    registerCustomFieldsExtension(api);

    const { result } = renderHook(() => useCustomFieldColumns("party.person", []));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.columns).toEqual([]);
    expect(api.getBulkColumnValues).not.toHaveBeenCalled();
  });

  it("fetches with entityTypeKey and ownerIds, and builds Columns sorted by sortOrder rather than response order", async () => {
    const response: BulkColumnValuesResult = {
      columns: [
        {
          key: "shirt_size",
          labelEn: "Shirt Size",
          labelAr: null,
          valueType: "Select",
          options: ["S", "M"],
          sortOrder: 1,
        },
        {
          key: "nationality",
          labelEn: "Nationality",
          labelAr: null,
          valueType: "Text",
          options: null,
          sortOrder: 0,
        },
      ],
      valuesByOwnerId: { "owner-1": { nationality: "Egyptian", shirt_size: "M" } },
    };
    const api = makeApi({ getBulkColumnValues: vi.fn().mockResolvedValue(response) });
    registerCustomFieldsExtension(api);

    const { result } = renderHook(() => useCustomFieldColumns("party.person", ["owner-1"]));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(api.getBulkColumnValues).toHaveBeenCalledWith("party.person", ["owner-1"]);
    expect(result.current.columns.map((c) => String(c.key))).toEqual(["nationality", "shirt_size"]);
    expect(result.current.columns[0].label).toBe("Nationality");
    expect(result.current.error).toBeNull();
  });

  it("captures a getBulkColumnValues rejection into `error` instead of letting it escape unhandled", async () => {
    const failure = new Error("403 Forbidden");
    const api = makeApi({ getBulkColumnValues: vi.fn().mockRejectedValue(failure) });
    registerCustomFieldsExtension(api);

    const { result } = renderHook(() => useCustomFieldColumns("party.person", ["owner-1"]));

    await waitFor(() => expect(result.current.error).toBe(failure));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.columns).toEqual([]);
  });
});

describe("useCustomFieldColumns — per-record visibility (Wave 5 row 5.3)", () => {
  const COLUMN = {
    customFieldId: "cf-1",
    key: "reason",
    labelEn: "Termination Reason",
    labelAr: null,
    valueType: "Text" as const,
    options: null,
    sortOrder: 0,
  };

  function bulk(overrides: Partial<BulkColumnValuesResult> = {}): BulkColumnValuesResult {
    return {
      columns: [COLUMN],
      valuesByOwnerId: {
        "owner-a": { reason: "redundancy" },
        "owner-b": { reason: "resigned" },
      },
      ...overrides,
    };
  }

  /** Renders one row's cell through the built column, the way GenericTable does. */
  function renderCell(column: { render?: (v: unknown, row: unknown) => unknown }, ownerId: string) {
    return column.render?.(undefined, { id: ownerId });
  }

  it("keeps ONE column while blanking only the rows a rule hides", async () => {
    // The point of the parallel channel: the same field is shown for one record and hidden for the
    // next, so this can never be expressed by dropping the column.
    const api = makeApi({
      getBulkColumnValues: vi.fn().mockResolvedValue(
        bulk({ hiddenKeysByOwnerId: { "owner-b": ["reason"] } })
      ),
    });
    registerCustomFieldsExtension(api);

    const { result } = renderHook(() =>
      useCustomFieldColumns("party.person", ["owner-a", "owner-b"])
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.columns).toHaveLength(1);
    const column = result.current.columns[0] as never as {
      render?: (v: unknown, row: unknown) => unknown;
    };
    // Shown for A (a real value), blanked for B (the empty-cell element, not the stored string).
    expect(renderCell(column, "owner-a")).toBe("redundancy");
    expect(renderCell(column, "owner-b")).not.toBe("resigned");
  });

  it("renders every row normally when the server sends no hidden channel", async () => {
    // A server predating row 5.3 omits the field entirely; nothing may change for it.
    const api = makeApi({ getBulkColumnValues: vi.fn().mockResolvedValue(bulk()) });
    registerCustomFieldsExtension(api);

    const { result } = renderHook(() =>
      useCustomFieldColumns("party.person", ["owner-a", "owner-b"])
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const column = result.current.columns[0] as never as {
      render?: (v: unknown, row: unknown) => unknown;
    };
    expect(renderCell(column, "owner-a")).toBe("redundancy");
    expect(renderCell(column, "owner-b")).toBe("resigned");
  });

  it("clears stale hidden keys when a later page reports none", async () => {
    // Found by mutation: nothing covered the RESET. Leaving the previous page's map in place would
    // keep hiding cells on rows that have no rules at all — a stale-state bug that only appears on
    // the second page, which is exactly the kind nobody reproduces by hand.
    const first = bulk({ hiddenKeysByOwnerId: { "owner-b": ["reason"] } });
    const second = bulk();
    const getBulkColumnValues = vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);
    registerCustomFieldsExtension(makeApi({ getBulkColumnValues }));

    const { result, rerender } = renderHook(
      ({ ids }: { ids: string[] }) => useCustomFieldColumns("party.person", ids),
      { initialProps: { ids: ["owner-a", "owner-b"] } }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Second page: a different id set, so the hook refetches.
    rerender({ ids: ["owner-a", "owner-b", "owner-c"] });
    await waitFor(() => expect(getBulkColumnValues).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const column = result.current.columns[0] as never as {
      render?: (v: unknown, row: unknown) => unknown;
    };
    expect(renderCell(column, "owner-b")).toBe("resigned");
  });

  it("matches hidden keys case-insensitively", async () => {
    // Key casing is provider-collation-dependent in the database, and every other key comparison in
    // this feature is case-insensitive. A case-sensitive match here would silently show a hidden cell.
    const api = makeApi({
      getBulkColumnValues: vi.fn().mockResolvedValue(
        bulk({ hiddenKeysByOwnerId: { "owner-b": ["REASON"] } })
      ),
    });
    registerCustomFieldsExtension(api);

    const { result } = renderHook(() =>
      useCustomFieldColumns("party.person", ["owner-a", "owner-b"])
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const column = result.current.columns[0] as never as {
      render?: (v: unknown, row: unknown) => unknown;
    };
    expect(renderCell(column, "owner-b")).not.toBe("resigned");
  });
});
