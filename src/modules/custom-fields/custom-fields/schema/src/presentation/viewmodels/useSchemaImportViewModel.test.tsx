/**
 * useSchemaImportViewModel — Wave 6 row 6.5's import half
 *
 * Runs the REAL hook against the REAL repository, mapper and service over a mocked `api.post` --
 * same arrangement every export/import view-model test in this module uses, for the identical
 * reason: mocking the repository would leave the thing most worth guarding here untested -- that
 * the picked file's JSON reaches the wire UNCHANGED, property for property, including one this
 * client's own typed model does not know about (see `SchemaImportModel`'s header for why that is
 * not hypothetical).
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSchemaImportViewModel } from "./useSchemaImportViewModel";
import { SchemaImportService } from "../../data/services/SchemaImportService";
import { SchemaImportRepository } from "../../data/repositories/SchemaImportRepository";
import { MAX_IMPORT_ITEMS, TOO_MANY_ROWS_ERROR_CODE } from "../../data/models/SchemaImportModel";
import type { IApiService } from "@core/interfaces/api.interface";
import { getSchemaExportContainer } from "../../../di";

vi.mock("../../../di", () => ({ getSchemaExportContainer: vi.fn() }));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
  }),
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
const toastInfo = vi.fn();
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
    info: (...args: unknown[]) => toastInfo(...args),
  },
}));

function jsonFile(content: unknown, name = "schema.json"): File {
  return new File([JSON.stringify(content)], name, { type: "application/json" });
}

function textFile(content: string, name = "not-json.txt"): File {
  return new File([content], name, { type: "text/plain" });
}

/** Wires the real service/repository over a mocked `api.post`. */
function setup(postImpl: (url: string, body?: unknown) => Promise<unknown>) {
  const post = vi.fn(postImpl);
  const api = { post } as unknown as IApiService;

  vi.mocked(getSchemaExportContainer).mockReturnValue({
    schemaImportRepository: new SchemaImportRepository(new SchemaImportService(api)),
  } as never);

  return { post };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.clearAllMocks());

const GOOD_BUNDLE = {
  formatVersion: 1,
  entityTypeKey: null,
  groups: [
    { entityTypeKey: "party.person", stableKey: "hr_basics", labelEn: "HR Basics", labelAr: null, sortOrder: 0, isGlobal: false },
  ],
  definitions: [
    {
      entityTypeKey: "party.person",
      key: "employee_id",
      labelEn: "Employee Id",
      labelAr: null,
      placeholderEn: null,
      placeholderAr: null,
      valueType: "Text",
      isRequired: false,
      isActive: true,
      sortOrder: 0,
      options: null,
      optionsAr: null,
      validatorKind: null,
      validatorParam: null,
      sensitivity: "None",
      isExportable: true,
      groupStableKey: "hr_basics",
      isGlobal: false,
      // Not on `SchemaBundleJson` at all -- THE property this suite exists to prove survives.
      referenceTargetEntityTypeKey: "party.department",
    },
  ],
};

describe("useSchemaImportViewModel — picking a file", () => {
  it("accepts a well-shaped bundle and enables Import", async () => {
    setup(async () => ({ groups: [] }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(jsonFile(GOOD_BUNDLE));
    });

    expect(result.current.pickError).toBeNull();
    expect(result.current.canImport).toBe(true);
    expect(result.current.selectedFile?.name).toBe("schema.json");
  });

  it("rejects a file that isn't valid JSON, locally, with no request made", async () => {
    const { post } = setup(async () => ({ groups: [] }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(textFile("this is not json {{{"));
    });

    expect(result.current.pickError).toBe("schemaImport.pickError.notJson");
    expect(result.current.canImport).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it("rejects valid JSON that doesn't look like a schema bundle", async () => {
    const { post } = setup(async () => ({ groups: [] }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(jsonFile({ hello: "world" }));
    });

    expect(result.current.pickError).toBe("schemaImport.pickError.notABundle");
    expect(result.current.canImport).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it("clears the previous pick's result and error when a new file is picked", async () => {
    setup(async () => ({ groups: [] }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(textFile("not json"));
    });
    expect(result.current.pickError).not.toBeNull();

    await act(async () => {
      await result.current.pickFile(jsonFile(GOOD_BUNDLE));
    });
    expect(result.current.pickError).toBeNull();
    expect(result.current.canImport).toBe(true);
  });

  it("clearFile removes the picked file and any result entirely", async () => {
    setup(async () => ({ groups: [] }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(jsonFile(GOOD_BUNDLE));
    });
    act(() => result.current.clearFile());

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.canImport).toBe(false);
    expect(result.current.pickError).toBeNull();
  });
});

describe("useSchemaImportViewModel — the wire payload", () => {
  it("posts the picked file's JSON UNCHANGED, including a field this client's own model doesn't declare", async () => {
    const { post } = setup(async () => ({ groups: [] }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(jsonFile(GOOD_BUNDLE));
    });
    await act(async () => {
      result.current.importSchema();
    });
    await waitFor(() => expect(post).toHaveBeenCalled());

    const [, body] = post.mock.calls[0] as [string, Record<string, unknown>];
    // THE assertion this suite exists for: `referenceTargetEntityTypeKey` must reach the wire even
    // though `SchemaBundleJson` never declared it -- proving nothing rebuilt this object through
    // that (currently incomplete) type on the way out.
    const definitions = body.definitions as Array<Record<string, unknown>>;
    expect(definitions[0].referenceTargetEntityTypeKey).toBe("party.department");
    expect(body).toEqual(GOOD_BUNDLE);
  });

  it("posts to the import route", async () => {
    const { post } = setup(async () => ({ groups: [] }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(jsonFile(GOOD_BUNDLE));
    });
    await act(async () => {
      result.current.importSchema();
    });
    await waitFor(() => expect(post).toHaveBeenCalled());

    expect(post.mock.calls[0][0]).toBe("/v1/custom-fields/schema/import");
  });

  it("does nothing when Import is invoked with no file picked", async () => {
    const { post } = setup(async () => ({ groups: [] }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      result.current.importSchema();
    });

    expect(post).not.toHaveBeenCalled();
  });
});

describe("useSchemaImportViewModel — a successful response", () => {
  it("reports the per-group breakdown and toasts the counts", async () => {
    setup(async () => ({
      groups: [
        { entityTypeKey: "party.person", stableKey: "hr_basics", outcome: "Created", reason: null, fieldsCreated: 1 },
      ],
    }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(jsonFile(GOOD_BUNDLE));
    });
    await act(async () => {
      result.current.importSchema();
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(result.current.result?.createdCount).toBe(1);
    expect(result.current.result?.groups[0].stableKey).toBe("hr_basics");
    expect(toastSuccess).toHaveBeenCalledWith(
      'schemaImport.toast.imported:{"created":1,"skipped":0,"failed":0}'
    );
  });

  it("reports the empty-bundle state distinctly, with its own toast", async () => {
    setup(async () => ({ groups: [] }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(jsonFile(GOOD_BUNDLE));
    });
    await act(async () => {
      result.current.importSchema();
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(result.current.result?.isEmpty).toBe(true);
    expect(toastInfo).toHaveBeenCalledWith("schemaImport.toast.nothingToImport");
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});

describe("useSchemaImportViewModel — the item-count REFUSAL", () => {
  it("names the refusal instead of the generic failure", async () => {
    setup(async () => {
      throw Object.assign(new Error("HTTP 422"), {
        details: {
          statusCode: 422,
          errorCode: TOO_MANY_ROWS_ERROR_CODE,
          message: `This file has more than ${MAX_IMPORT_ITEMS} groups and fields combined.`,
          errors: null,
        },
      });
    });
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(jsonFile(GOOD_BUNDLE));
    });
    await act(async () => {
      result.current.importSchema();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isRefused).toBe(true);
    expect(toastError).toHaveBeenCalledWith({
      title: "schemaImport.refused.title",
      description: `schemaImport.refused.description:{"max":${MAX_IMPORT_ITEMS}}`,
    });
    expect(toastError).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: "schemaImport.toast.importFailed" })
    );
  });
});

describe("useSchemaImportViewModel — a whole-call refusal that isn't the item cap", () => {
  it("surfaces the server's own message naming the specific shape problem", async () => {
    setup(async () => {
      throw Object.assign(new Error("HTTP 422"), {
        details: {
          statusCode: 422,
          errorCode: "VALIDATION_INVALID_FORMAT",
          message: "This bundle was exported in a format this app does not understand (version 2).",
          errors: null,
        },
      });
    });
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(jsonFile(GOOD_BUNDLE));
    });
    await act(async () => {
      result.current.importSchema();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isRefused).toBe(false);
    expect(toastError).toHaveBeenCalledWith({
      title: "schemaImport.toast.importFailed",
      description: "This bundle was exported in a format this app does not understand (version 2).",
    });
  });
});

describe("useSchemaImportViewModel — reset", () => {
  it("returns to the opening state, so a reopened dialog reports nothing stale", async () => {
    setup(async () => ({ groups: [] }));
    const { result } = renderHook(() => useSchemaImportViewModel(), { wrapper });

    await act(async () => {
      await result.current.pickFile(jsonFile(GOOD_BUNDLE));
    });
    await act(async () => {
      result.current.importSchema();
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    act(() => result.current.reset());

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.canImport).toBe(false);
  });
});
