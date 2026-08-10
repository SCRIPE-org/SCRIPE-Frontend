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
    expect(api.getFormFields).toHaveBeenCalledWith("party.person", undefined);
  });
});
