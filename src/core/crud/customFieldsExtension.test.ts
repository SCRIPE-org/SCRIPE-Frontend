import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  registerCustomFieldsExtension,
  getCustomFieldsExtension,
  encodeCustomFieldName,
  decodeCustomFieldName,
  useCustomFieldsFormFields,
  type CustomFieldsExtensionApi,
} from "./customFieldsExtension";
import type { FieldConfig } from "@core/ui/forms/generic-form";

function makeApi(overrides: Partial<CustomFieldsExtensionApi> = {}): CustomFieldsExtensionApi {
  return {
    getFormFields: vi.fn().mockResolvedValue([]),
    saveValues: vi.fn().mockResolvedValue(undefined),
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
