/**
 * useSchemaExportViewModel — Wave 6 row 6.5
 *
 * Runs the REAL hook against the REAL repository, mapper and service over a mocked HTTP client only
 * — the same arrangement `useFieldGroupOptions.test.tsx` uses. Mocking the repository would leave
 * the one thing worth guarding untested: that the bytes handed to the browser are the ones the
 * server sent.
 *
 * FOUR BEHAVIOURS, EACH ONE A REAL FAILURE MODE
 * ---------------------------------------------
 *  1. **The happy path writes a file** whose name and content are derived from the bundle, not from
 *     the picker.
 *  2. **THE ERROR PATH WRITES NOTHING.** A rejected export that still called
 *     `URL.createObjectURL` would put a truncated or empty file on someone's disk and let them carry
 *     it to another environment believing it was a schema.
 *  3. **An empty bundle writes nothing either**, and says so. An empty result has two causes the
 *     client cannot distinguish — the scope really is empty, or every field in it is restricted from
 *     this caller — and a zero-field file lets someone conclude the first when it was the second.
 *  4. **The scope reaches the wire.** The "all entity types" sentinel must send NO `entityTypeKey`
 *     parameter; a scoped choice must send exactly that key.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useSchemaExportViewModel,
  ALL_ENTITY_TYPES_VALUE,
} from "./useSchemaExportViewModel";
import { SchemaExportService } from "../../data/services/SchemaExportService";
import { SchemaExportRepository } from "../../data/repositories/SchemaExportRepository";
import type { SchemaBundleJson } from "../../data/models/SchemaBundleModel";
import type { IApiService } from "@core/interfaces/api.interface";
import { getSchemaExportContainer } from "../../../di";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../di", () => ({ getSchemaExportContainer: vi.fn() }));
vi.mock("../../../../di", () => ({ getCustomFieldsContainer: vi.fn() }));

vi.mock("@core/providers/i18n-provider", () => ({
  // Echoes the key, so assertions pin WHICH key fired without depending on copy.
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

const BUNDLE: SchemaBundleJson = {
  formatVersion: 1,
  entityTypeKey: "party.person",
  groups: [
    {
      entityTypeKey: "party.person",
      stableKey: "contact_details",
      labelEn: "Contact details",
      labelAr: "بيانات الاتصال",
      sortOrder: 0,
      isGlobal: false,
    },
  ],
  definitions: [
    {
      entityTypeKey: "party.person",
      key: "jersey_size",
      labelEn: "Jersey size",
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
      groupStableKey: "contact_details",
      isGlobal: false,
      referenceTargetEntityTypeKey: null,
    },
  ],
};

const EMPTY_BUNDLE: SchemaBundleJson = {
  formatVersion: 1,
  entityTypeKey: "party.person",
  groups: [],
  definitions: [],
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/**
 * Reads a Blob's text.
 *
 * Via `FileReader` rather than `blob.text()`: jsdom's Blob does not implement the promise-based
 * accessor, so `await blob.text()` throws "is not a function" and would look like a defect in the
 * code under test.
 */
function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

/** Wires the real service/repository over a mocked `api.get`, and stubs the browser download path. */
function setup(schemaResponse: SchemaBundleJson | Error) {
  const schemaGet = vi.fn(() =>
    schemaResponse instanceof Error
      ? Promise.reject(schemaResponse)
      : Promise.resolve(schemaResponse)
  );
  const api = { get: schemaGet } as unknown as IApiService;

  vi.mocked(getSchemaExportContainer).mockReturnValue({
    schemaExportRepository: new SchemaExportRepository(new SchemaExportService(api)),
  } as never);

  vi.mocked(getCustomFieldsContainer).mockReturnValue({
    customFieldRepository: { getEntityTypes: vi.fn().mockResolvedValue([]) },
  } as never);

  return { schemaGet };
}

// jsdom implements neither of these, so a real download would throw before the assertion.
const createObjectURL = vi.fn(() => "blob:schema");
const revokeObjectURL = vi.fn();
const anchorClick = vi.fn();
let lastAnchor: { href: string; download: string; click: () => void } | null = null;
let createElementSpy: ReturnType<typeof vi.spyOn> | null = null;
let lastBlob: Blob | null = null;

beforeEach(() => {
  vi.clearAllMocks();
  lastAnchor = null;
  lastBlob = null;

  global.URL.createObjectURL = ((blob: Blob) => {
    lastBlob = blob;
    return createObjectURL();
  }) as typeof URL.createObjectURL;
  global.URL.revokeObjectURL = revokeObjectURL as typeof URL.revokeObjectURL;

  const realCreateElement = document.createElement.bind(document);
  createElementSpy = vi
    .spyOn(document, "createElement")
    .mockImplementation((tagName: string, options?: ElementCreationOptions) => {
      if (tagName === "a") {
        // A real node, so appendChild/removeChild work, with click stubbed -- jsdom's own click on a
        // download anchor is a "not implemented" navigation error.
        const anchor = realCreateElement("a");
        anchor.click = anchorClick;
        lastAnchor = anchor as unknown as typeof lastAnchor;
        return anchor;
      }
      return realCreateElement(tagName, options);
    }) as never;
});

afterEach(() => {
  createElementSpy?.mockRestore();
});

describe("useSchemaExportViewModel — the happy path", () => {
  it("downloads the bundle as a JSON file named after its scope and format version", async () => {
    setup(BUNDLE);
    const { result } = renderHook(() => useSchemaExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportSchema();
    });

    await waitFor(() => expect(result.current.isExporting).toBe(false));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(lastBlob?.type).toBe("application/json");
    expect(lastAnchor?.download).toBe("custom-field-schema.party.person.v1.json");
    expect(anchorClick).toHaveBeenCalledTimes(1);
    // Released immediately: a blob URL held open pins the whole serialized bundle in memory.
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:schema");
    expect(toastSuccess).toHaveBeenCalledWith("schemaExport.toast.exported");
  });

  it("writes the SERVER's bundle, not a reconstruction of the picker's state", async () => {
    setup(BUNDLE);
    const { result } = renderHook(() => useSchemaExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportSchema();
    });
    await waitFor(() => expect(createObjectURL).toHaveBeenCalled());

    const text = await readBlobText(lastBlob!);
    expect(JSON.parse(text)).toEqual(BUNDLE);
    // Pretty-printed and newline-terminated, because these files get committed and diffed.
    expect(text.endsWith("\n")).toBe(true);
    expect(text).toContain('\n  "definitions"');
  });

  it("reports what was in the bundle so the file can be sanity-checked before it travels", async () => {
    setup(BUNDLE);
    const { result } = renderHook(() => useSchemaExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportSchema();
    });
    await waitFor(() => expect(result.current.lastBundle).not.toBeNull());

    expect(result.current.lastBundle?.definitionCount).toBe(1);
    expect(result.current.lastBundle?.groupCount).toBe(1);
    expect(result.current.lastBundle?.isFormatSupported).toBe(true);
  });
});

describe("useSchemaExportViewModel — the error path", () => {
  it("writes NO file when the export fails", async () => {
    setup(new Error("Unknown entity type 'nope'."));
    const { result } = renderHook(() => useSchemaExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportSchema();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // The assertion this whole file exists for: a failed export must not leave a truncated or empty
    // file on disk that someone then carries to another environment.
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(anchorClick).not.toHaveBeenCalled();
    expect(result.current.lastBundle).toBeNull();
  });

  it("surfaces the server's own message, which names the rejected key", async () => {
    setup(new Error("Unknown entity type 'nope'."));
    const { result } = renderHook(() => useSchemaExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportSchema();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.errorMessage).toBe("Unknown entity type 'nope'.");
    expect(toastError).toHaveBeenCalledWith({
      title: "schemaExport.toast.exportFailed",
      description: "Unknown entity type 'nope'.",
    });
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("clears the error and the previous result when the scope changes", async () => {
    setup(new Error("boom"));
    const { result } = renderHook(() => useSchemaExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportSchema();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    act(() => {
      result.current.setEntityTypeKey("party.person");
    });

    // A result line describing a bundle from a DIFFERENT scope reads as a report about the new one.
    expect(result.current.lastBundle).toBeNull();
  });
});

describe("useSchemaExportViewModel — an empty bundle", () => {
  it("downloads nothing and says so, because 'empty' may mean 'restricted from you'", async () => {
    setup(EMPTY_BUNDLE);
    const { result } = renderHook(() => useSchemaExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportSchema();
    });
    await waitFor(() => expect(result.current.lastBundle).not.toBeNull());

    expect(createObjectURL).not.toHaveBeenCalled();
    expect(anchorClick).not.toHaveBeenCalled();
    expect(result.current.lastBundle?.isEmpty).toBe(true);
    expect(toastInfo).toHaveBeenCalledWith("schemaExport.toast.nothingToExport");
    expect(toastSuccess).not.toHaveBeenCalled();
    // Not an error: the request succeeded and the honest answer was "nothing".
    expect(result.current.isError).toBe(false);
  });
});

describe("useSchemaExportViewModel — the scope reaches the wire", () => {
  it("sends no entityTypeKey parameter for the 'all entity types' sentinel", async () => {
    const { schemaGet } = setup(BUNDLE);
    const { result } = renderHook(() => useSchemaExportViewModel(), { wrapper });

    expect(result.current.entityTypeKey).toBe(ALL_ENTITY_TYPES_VALUE);

    await act(async () => {
      result.current.exportSchema();
    });
    await waitFor(() => expect(schemaGet).toHaveBeenCalled());

    // A sentinel that leaked onto the query string as `entityTypeKey=` would read as a scoped export
    // of nothing in every log and trace.
    expect(schemaGet).toHaveBeenCalledWith("/v1/custom-fields/schema");
  });

  it("sends the chosen entity type when one is picked", async () => {
    const { schemaGet } = setup(BUNDLE);
    const { result } = renderHook(() => useSchemaExportViewModel(), { wrapper });

    act(() => {
      result.current.setEntityTypeKey("party.person");
    });
    await act(async () => {
      result.current.exportSchema();
    });
    await waitFor(() => expect(schemaGet).toHaveBeenCalled());

    expect(schemaGet).toHaveBeenCalledWith("/v1/custom-fields/schema?entityTypeKey=party.person");
  });
});
