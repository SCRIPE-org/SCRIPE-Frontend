/**
 * useDefinitionExportViewModel — Wave 6 row 6.4
 *
 * Runs the REAL hook against the REAL repository, mapper and service over a mocked HTTP client only —
 * the same arrangement `useSchemaExportViewModel.test.tsx` uses. Mocking the repository would leave
 * the two things most worth guarding untested: that the bytes handed to the browser are the ones the
 * server sent, and that a REFUSAL survives the trip through a blob-typed error body.
 *
 * FIVE BEHAVIOURS, EACH ONE A REAL FAILURE MODE
 * ---------------------------------------------
 *  1. **The happy path writes the server's bytes**, under a name mirroring the server's own rule.
 *  2. **THE ROW-CAP REFUSAL READS AS A REFUSAL.** The error body arrives as a Blob because
 *     `responseType: "blob"` applies to failures too, so left unread the server's `VALIDATION_RANGE`
 *     degrades to the string "HTTP 422" and an admin is told a number instead of "this was refused,
 *     narrow it". And NOTHING is downloaded.
 *  3. **THE ERROR PATH WRITES NOTHING.** A rejected export that still called `URL.createObjectURL`
 *     would put a truncated or empty file on someone's disk and let them believe it was an export.
 *  4. **A body that is not a workbook writes nothing either**, and says so — an `.xlsx` a spreadsheet
 *     refuses to open is a worse outcome than a clear refusal.
 *  5. **The scope reaches the wire.** The "all entity types" sentinel must send NO `entityTypeKey`
 *     parameter; a scoped choice must send exactly that key.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useDefinitionExportViewModel,
  ALL_ENTITY_TYPES_VALUE,
} from "./useDefinitionExportViewModel";
import { DefinitionExportService } from "../../data/services/DefinitionExportService";
import { DefinitionExportRepository } from "../../data/repositories/DefinitionExportRepository";
import {
  MAX_EXPORT_ROWS,
  ROW_CAP_ERROR_CODE,
  UNKNOWN_ENTITY_TYPE_ERROR_CODE,
  XLSX_CONTENT_TYPE,
} from "../../data/models/DefinitionExportModel";
import { DownloadInterceptedError } from "@core/errors/download-intercepted";
import type { IApiService } from "@core/interfaces/api.interface";
import { getDefinitionExportContainer } from "../../../di";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../di", () => ({ getDefinitionExportContainer: vi.fn() }));
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

/** A stand-in workbook. Nothing in the client opens it, so the bytes only need to be recognisable. */
const WORKBOOK_BYTES = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4]);

function workbook(type = XLSX_CONTENT_TYPE): Blob {
  return new Blob([WORKBOOK_BYTES], { type });
}

/**
 * The failure shape `ApiService`'s response interceptor really produces for this route.
 *
 * `message` is already degraded to "HTTP 422" — `extractErrorMessage` read `data.message` off a Blob
 * and found nothing — while the real `ErrorResponse` sits unread in `details`. Reproducing that
 * exactly is the point: a test that handed over a parsed object would pass against a service that
 * never learned to read the blob.
 */
function interceptedFailure(body: Record<string, unknown>, status = 422): Error {
  return Object.assign(new Error(`HTTP ${status}`), {
    details: new Blob([JSON.stringify(body)], { type: "application/json" }),
  });
}

const ROW_CAP_BODY = {
  statusCode: 422,
  errorCode: ROW_CAP_ERROR_CODE,
  message: `Too many definitions to export at once (limit ${MAX_EXPORT_ROWS}). Narrow the export by choosing a single entity type.`,
  errors: null,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/** Wires the real service/repository over a mocked `api.getBlob`. */
function setup(response: Blob | Error) {
  const getBlob = vi.fn(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response)
  );
  const api = { getBlob } as unknown as IApiService;

  vi.mocked(getDefinitionExportContainer).mockReturnValue({
    definitionExportRepository: new DefinitionExportRepository(new DefinitionExportService(api)),
  } as never);

  vi.mocked(getCustomFieldsContainer).mockReturnValue({
    customFieldRepository: { getEntityTypes: vi.fn().mockResolvedValue([]) },
  } as never);

  return { getBlob };
}

// jsdom implements neither of these, so a real download would throw before the assertion.
const createObjectURL = vi.fn(() => "blob:definitions");
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

describe("useDefinitionExportViewModel — the happy path", () => {
  it("downloads the workbook under the server's own naming rule", async () => {
    setup(workbook());
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });

    await waitFor(() => expect(result.current.lastExport).not.toBeNull());

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    // Mirrors `custom-field-definitions-{yyyyMMdd-HHmmss}.xlsx` -- the server's `Content-Disposition`
    // name is unreadable cross-origin, so this client rebuilds it. The stamp itself is pinned
    // exactly in `DefinitionExportMapper.test.ts`, against a fixed clock; here it only has to be the
    // right SHAPE, because freezing time around a react-query mutation trades one flake for another.
    expect(lastAnchor?.download).toMatch(/^custom-field-definitions-\d{8}-\d{6}\.xlsx$/);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    // Released immediately: a blob URL held open pins the whole workbook in memory.
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:definitions");
    expect(toastSuccess).toHaveBeenCalledWith("definitionExport.toast.exported");
    expect(result.current.isError).toBe(false);
  });

  it("writes the SERVER's bytes, untouched and unre-encoded", async () => {
    const bytes = workbook();
    setup(bytes);
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(createObjectURL).toHaveBeenCalled());

    // Identity: an `.xlsx` is a ZIP container, and anything this client did to it could only corrupt
    // it. Unlike the schema export, nothing here is rebuilt from the entity.
    expect(lastBlob).toBe(bytes);
    expect(lastBlob?.type).toBe(XLSX_CONTENT_TYPE);
  });

  it("reports the file that landed, so it can be found in a downloads folder", async () => {
    setup(workbook());
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.lastExport).not.toBeNull());

    expect(result.current.lastExport?.byteSize).toBe(WORKBOOK_BYTES.byteLength);
    expect(result.current.lastExport?.fileName).toMatch(
      /^custom-field-definitions-\d{8}-\d{6}\.xlsx$/
    );
    expect(result.current.lastExport?.isUsable).toBe(true);
  });
});

describe("useDefinitionExportViewModel — the row-cap REFUSAL", () => {
  it("recovers the server's error code from the blob-typed error body", async () => {
    setup(interceptedFailure(ROW_CAP_BODY));
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Without the blob read this would be `false` and the message would be the bare "HTTP 422" the
    // interceptor produced -- a number in place of an actionable refusal.
    expect(result.current.isRowCapRefused).toBe(true);
    expect(result.current.errorMessage).toBe(ROW_CAP_BODY.message);
  });

  it("says the export was REFUSED, naming the cap, not that something failed", async () => {
    setup(interceptedFailure(ROW_CAP_BODY));
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastError).toHaveBeenCalledWith({
      title: "definitionExport.refused.title",
      description: `definitionExport.refused.description:{"max":${MAX_EXPORT_ROWS}}`,
    });
    // Explicitly NOT the generic failure copy. An admin told "couldn't export" would go looking for a
    // fault in a system that is working exactly as designed.
    expect(toastError).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: "definitionExport.toast.exportFailed" })
    );
  });

  it("downloads NOTHING on a refusal", async () => {
    setup(interceptedFailure(ROW_CAP_BODY));
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(createObjectURL).not.toHaveBeenCalled();
    expect(anchorClick).not.toHaveBeenCalled();
    expect(result.current.lastExport).toBeNull();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("reads an already-parsed error body too, not only a blob", async () => {
    // The interceptor's non-blob path. Both spellings of the same failure must produce the same
    // refusal, or the behaviour would depend on which transport path the request happened to take.
    setup(Object.assign(new Error("HTTP 422"), { details: ROW_CAP_BODY }));
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isRowCapRefused).toBe(true);
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});

describe("useDefinitionExportViewModel — the error path", () => {
  it("writes NO file when the export fails", async () => {
    setup(new Error("Network Error"));
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // The assertion this whole file exists for: a failed export must not leave a truncated or empty
    // file on disk that someone then opens expecting their field configuration.
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(anchorClick).not.toHaveBeenCalled();
    expect(result.current.lastExport).toBeNull();
  });

  it("never claims the server refused an export that never reached it", async () => {
    setup(new Error("Network Error"));
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isRowCapRefused).toBe(false);
    expect(toastError).toHaveBeenCalledWith({
      title: "definitionExport.toast.exportFailed",
      description: "Network Error",
    });
  });

  it("surfaces the server's own message for an unregistered entity type, which names the key", async () => {
    setup(
      interceptedFailure({
        statusCode: 422,
        errorCode: UNKNOWN_ENTITY_TYPE_ERROR_CODE,
        message: "'nope' is not a registered entity type",
        errors: null,
      })
    );
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isRowCapRefused).toBe(false);
    expect(toastError).toHaveBeenCalledWith({
      title: "definitionExport.toast.exportFailed",
      description: "'nope' is not a registered entity type",
    });
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("falls back to the transport's message when the error body is not JSON at all", async () => {
    // A proxy's HTML 502, delivered as a blob. Nothing to recover, so the original message must
    // survive rather than being replaced by a parse failure.
    setup(
      Object.assign(new Error("HTTP 502"), {
        details: new Blob(["<html>Bad Gateway</html>"], { type: "text/html" }),
      })
    );
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.errorMessage).toBe("HTTP 502");
    expect(result.current.isRowCapRefused).toBe(false);
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("clears the previous result when the scope changes", async () => {
    setup(workbook());
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.lastExport).not.toBeNull());

    act(() => {
      result.current.setEntityTypeKey("party.person");
    });

    // A line naming a file from a DIFFERENT scope reads as a report about the new one.
    expect(result.current.lastExport).toBeNull();
  });
});

describe("useDefinitionExportViewModel — a body that is not a workbook", () => {
  it("saves nothing when the reply announces itself as HTML", async () => {
    // A sign-in page or a proxy notice served with a 200. Saved as `.xlsx` it produces a file a
    // spreadsheet refuses to open, with no explanation of why.
    setup(new Blob(["<html>sign in</html>"], { type: "text/html" }));
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.lastExport).not.toBeNull());

    expect(createObjectURL).not.toHaveBeenCalled();
    expect(anchorClick).not.toHaveBeenCalled();
    expect(result.current.lastExport?.isUsable).toBe(false);
    expect(toastError).toHaveBeenCalledWith({ title: "definitionExport.toast.unexpectedFile" });
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("saves nothing for a zero-byte reply", async () => {
    setup(new Blob([], { type: XLSX_CONTENT_TYPE }));
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.lastExport).not.toBeNull());

    expect(createObjectURL).not.toHaveBeenCalled();
    expect(result.current.lastExport?.isEmpty).toBe(true);
  });
});

describe("useDefinitionExportViewModel — an external download manager", () => {
  it("reports a captured stream as the success it is, not as a failure", async () => {
    setup(new DownloadInterceptedError());
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.wasIntercepted).toBe(true));

    // The file IS on disk -- just saved by the manager, not by this app. Telling the admin the export
    // failed would send them to re-run something that already worked.
    expect(result.current.isError).toBe(false);
    expect(result.current.isRowCapRefused).toBe(false);
    expect(toastSuccess).toHaveBeenCalledWith("definitionExport.toast.intercepted");
    // No name or size to report, because this app never saw the bytes.
    expect(result.current.lastExport).toBeNull();
  });
});

describe("useDefinitionExportViewModel — the scope reaches the wire", () => {
  it("sends no entityTypeKey parameter for the 'all entity types' sentinel", async () => {
    const { getBlob } = setup(workbook());
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    expect(result.current.entityTypeKey).toBe(ALL_ENTITY_TYPES_VALUE);

    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(getBlob).toHaveBeenCalled());

    // A sentinel that leaked onto the query string as `entityTypeKey=` would read as a scoped export
    // of nothing in every log and trace.
    expect(getBlob).toHaveBeenCalledWith("/v1/custom-fields/export");
  });

  it("sends the chosen entity type when one is picked, and records it on the result", async () => {
    const { getBlob } = setup(workbook());
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    act(() => {
      result.current.setEntityTypeKey("party.person");
    });
    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(getBlob).toHaveBeenCalled());

    expect(getBlob).toHaveBeenCalledWith("/v1/custom-fields/export?entityTypeKey=party.person");
    await waitFor(() => expect(result.current.lastExport).not.toBeNull());
    // The scope is echoed from the request, because a file body has nowhere to carry it.
    expect(result.current.lastExport?.entityTypeKey).toBe("party.person");
    expect(result.current.lastExport?.isScoped).toBe(true);
    expect(lastAnchor?.download).toMatch(/^custom-field-definitions-party\.person-/);
  });
});

describe("useDefinitionExportViewModel — reset", () => {
  it("returns to the opening state, so a reopened dialog reports nothing stale", async () => {
    setup(workbook());
    const { result } = renderHook(() => useDefinitionExportViewModel(), { wrapper });

    act(() => {
      result.current.setEntityTypeKey("party.person");
    });
    await act(async () => {
      result.current.exportDefinitions();
    });
    await waitFor(() => expect(result.current.lastExport).not.toBeNull());

    act(() => {
      result.current.reset();
    });

    expect(result.current.entityTypeKey).toBe(ALL_ENTITY_TYPES_VALUE);
    expect(result.current.lastExport).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.wasIntercepted).toBe(false);
  });
});
