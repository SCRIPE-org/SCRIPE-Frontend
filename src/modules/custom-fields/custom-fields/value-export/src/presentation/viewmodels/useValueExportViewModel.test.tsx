/**
 * useValueExportViewModel — Wave 6 row 6.4's completion
 *
 * Runs the REAL hook against the REAL repository, mapper and service over a mocked HTTP client only
 * -- same arrangement `useDefinitionExportViewModel.test.tsx` uses, and for the identical reason:
 * mocking the repository would leave the two things most worth guarding untested -- that the bytes
 * handed to the browser are the server's, and that each of the three named refusals survives the
 * trip through a blob-typed error body.
 *
 * PERMISSION FILTERING GETS ITS OWN SUITE, WITH A REAL WITHHOLD-ONE TEST
 * -----------------------------------------------------------------------
 * Granting every permission cannot distinguish the right gate from a gate that always passes -- this
 * module's own Wave 5.1 postmortem is explicit about that. So the filtering suite below grants
 * permission for every entity type in the fixture EXCEPT ONE, and asserts that the withheld one, and
 * only it, is missing from the result.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useValueExportViewModel } from "./useValueExportViewModel";
import { useAppStore } from "@core/store/useAppStore";
import { ValueExportService } from "../../data/services/ValueExportService";
import { ValueExportRepository } from "../../data/repositories/ValueExportRepository";
import {
  FORBIDDEN_ERROR_CODE,
  MAX_EXPORT_ROWS,
  ROW_CAP_ERROR_CODE,
  UNKNOWN_ENTITY_TYPE_ERROR_CODE,
  XLSX_CONTENT_TYPE,
} from "../../data/models/ValueExportModel";
import { DownloadInterceptedError } from "@core/errors/download-intercepted";
import type { IApiService } from "@core/interfaces/api.interface";
import type { EntityTypeInfo } from "../../../../custom-field/src/domain/entities/CustomField";
import { getValueExportContainer } from "../../../di";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../di", () => ({ getValueExportContainer: vi.fn() }));
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
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const ENTITY_TYPES: EntityTypeInfo[] = [
  {
    key: "party.person",
    owningModule: "Party",
    displayNameEn: "Person",
    displayNameAr: "شخص",
    permissionResource: "party-people",
  },
  {
    key: "media.file",
    owningModule: "Media",
    displayNameEn: "File",
    displayNameAr: "ملف",
    permissionResource: "medias",
  },
  {
    key: "sales.order",
    owningModule: "Sales",
    displayNameEn: "Order",
    displayNameAr: "طلب",
    // No permissionResource -- the older-backend shape. Must be excluded, not guessed at.
    permissionResource: undefined,
  },
];

/** A stand-in workbook. Nothing in the client opens it, so the bytes only need to be recognisable. */
const WORKBOOK_BYTES = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4]);

function workbook(type = XLSX_CONTENT_TYPE): Blob {
  return new Blob([WORKBOOK_BYTES], { type });
}

/** The failure shape `ApiService`'s response interceptor really produces for this route. */
function interceptedFailure(body: Record<string, unknown>, status = 422): Error {
  return Object.assign(new Error(`HTTP ${status}`), {
    details: new Blob([JSON.stringify(body)], { type: "application/json" }),
  });
}

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/** Wires the real service/repository over a mocked `api.getBlob`, and a fixed entity-type list. */
function setup(response: Blob | Error, entityTypes: EntityTypeInfo[] = ENTITY_TYPES) {
  const getBlob = vi.fn(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response)
  );
  const api = { getBlob } as unknown as IApiService;

  vi.mocked(getValueExportContainer).mockReturnValue({
    valueExportRepository: new ValueExportRepository(new ValueExportService(api)),
  } as never);

  vi.mocked(getCustomFieldsContainer).mockReturnValue({
    customFieldRepository: { getEntityTypes: vi.fn().mockResolvedValue(entityTypes) },
  } as never);

  return { getBlob };
}

// jsdom implements neither of these, so a real download would throw before the assertion.
const createObjectURL = vi.fn(() => "blob:values");
const revokeObjectURL = vi.fn();
const anchorClick = vi.fn();
let lastAnchor: { href: string; download: string; click: () => void } | null = null;
let createElementSpy: ReturnType<typeof vi.spyOn> | null = null;
let lastBlob: Blob | null = null;

beforeEach(() => {
  vi.clearAllMocks();
  lastAnchor = null;
  lastBlob = null;
  useAppStore.setState({ permissions: [] as never });

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
  useAppStore.setState({ permissions: [] as never });
});

describe("useValueExportViewModel — permission filtering", () => {
  it("offers nothing before any permission is granted", async () => {
    setup(workbook());
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    await waitFor(() => expect(result.current.isEntityTypesLoading).toBe(false));

    expect(result.current.entityTypes).toEqual([]);
    expect(result.current.hasNoViewableEntityTypes).toBe(true);
  });

  it("withholds exactly ONE entity type's view permission, grants the rest -- only that one is excluded", async () => {
    // party-people withheld; media.file granted. This is the test the definitions export's own
    // permission gate cannot need: granting nothing, or granting everything, cannot tell "the gate
    // checks the right resource" apart from "the gate always passes" or "always fails".
    setup(workbook());
    useAppStore.setState({ permissions: ["medias.view"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    await waitFor(() => expect(result.current.isEntityTypesLoading).toBe(false));

    const keys = result.current.entityTypes.map((item) => item.key);
    expect(keys).toContain("media.file");
    expect(keys).not.toContain("party.person");
    // The resource-less entity type is excluded regardless of any permission, not offered on faith.
    expect(keys).not.toContain("sales.order");
    expect(result.current.hasNoViewableEntityTypes).toBe(false);
  });

  it("recognises a superadmin wildcard the same way the rest of the app does", async () => {
    setup(workbook());
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    await waitFor(() => expect(result.current.isEntityTypesLoading).toBe(false));

    const keys = result.current.entityTypes.map((item) => item.key);
    expect(keys).toContain("party.person");
    expect(keys).toContain("media.file");
    // Still excluded: a wildcard permission cannot make up for a resource this client never learned.
    expect(keys).not.toContain("sales.order");
  });
});

describe("useValueExportViewModel — the happy path", () => {
  it("downloads the workbook under the handler's own naming rule", async () => {
    setup(workbook());
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });

    await waitFor(() => expect(result.current.lastExport).not.toBeNull());

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(lastAnchor?.download).toMatch(/^custom-field-values-party\.person-\d{8}-\d{6}\.xlsx$/);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:values");
    expect(toastSuccess).toHaveBeenCalledWith("valueExport.toast.exported");
    expect(result.current.isError).toBe(false);
  });

  it("writes the SERVER's bytes, untouched and unre-encoded", async () => {
    const bytes = workbook();
    setup(bytes);
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });
    await waitFor(() => expect(createObjectURL).toHaveBeenCalled());

    expect(lastBlob).toBe(bytes);
    expect(lastBlob?.type).toBe(XLSX_CONTENT_TYPE);
  });

  it("does nothing when no entity type has been chosen yet", async () => {
    const { getBlob } = setup(workbook());
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    expect(result.current.entityTypeKey).toBe("");

    await act(async () => {
      result.current.exportValues();
    });

    // The Export button is disabled in this state; this guards the callback itself.
    expect(getBlob).not.toHaveBeenCalled();
  });

  it("sends the chosen entity type as a route segment, not a query parameter", async () => {
    const { getBlob } = setup(workbook());
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });
    await waitFor(() => expect(getBlob).toHaveBeenCalled());

    expect(getBlob).toHaveBeenCalledWith("/v1/custom-fields/values/party.person/export");
  });
});

describe("useValueExportViewModel — the row-cap REFUSAL", () => {
  const ROW_CAP_BODY = {
    statusCode: 422,
    errorCode: ROW_CAP_ERROR_CODE,
    message: `Too many values to export at once (limit ${MAX_EXPORT_ROWS}).`,
    errors: null,
  };

  it("recovers the server's error code from the blob-typed error body, and downloads nothing", async () => {
    setup(interceptedFailure(ROW_CAP_BODY));
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isRowCapRefused).toBe(true);
    expect(result.current.isForbidden).toBe(false);
    expect(result.current.errorMessage).toBe(ROW_CAP_BODY.message);
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith({
      title: "valueExport.refused.title",
      description: `valueExport.refused.description:{"max":${MAX_EXPORT_ROWS}}`,
    });
  });
});

describe("useValueExportViewModel — FORBIDDEN", () => {
  it("names the refusal instead of the generic failure, and downloads nothing", async () => {
    setup(
      interceptedFailure(
        {
          statusCode: 403,
          errorCode: FORBIDDEN_ERROR_CODE,
          message: "You do not have permission to view party.person records.",
          errors: null,
        },
        403
      )
    );
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isForbidden).toBe(true);
    expect(result.current.isRowCapRefused).toBe(false);
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith({ title: "valueExport.forbidden.title" });
    expect(toastError).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: "valueExport.toast.exportFailed" })
    );
  });
});

describe("useValueExportViewModel — an unknown entity type", () => {
  it("surfaces the server's own message, which names the key", async () => {
    setup(
      interceptedFailure({
        statusCode: 422,
        errorCode: UNKNOWN_ENTITY_TYPE_ERROR_CODE,
        message: "'nope' is not a registered entity type",
        errors: null,
      })
    );
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isRowCapRefused).toBe(false);
    expect(result.current.isForbidden).toBe(false);
    expect(toastError).toHaveBeenCalledWith({
      title: "valueExport.toast.exportFailed",
      description: "'nope' is not a registered entity type",
    });
  });
});

describe("useValueExportViewModel — the error path", () => {
  it("writes NO file when the export fails outright", async () => {
    setup(new Error("Network Error"));
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(createObjectURL).not.toHaveBeenCalled();
    expect(anchorClick).not.toHaveBeenCalled();
    expect(result.current.lastExport).toBeNull();
  });

  it("clears the previous result when the scope changes", async () => {
    setup(workbook());
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });
    await waitFor(() => expect(result.current.lastExport).not.toBeNull());

    act(() => result.current.setEntityTypeKey("media.file"));

    expect(result.current.lastExport).toBeNull();
  });
});

describe("useValueExportViewModel — a body that is not a workbook", () => {
  it("saves nothing when the reply announces itself as HTML", async () => {
    setup(new Blob(["<html>sign in</html>"], { type: "text/html" }));
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });
    await waitFor(() => expect(result.current.lastExport).not.toBeNull());

    expect(createObjectURL).not.toHaveBeenCalled();
    expect(result.current.lastExport?.isUsable).toBe(false);
    expect(toastError).toHaveBeenCalledWith({ title: "valueExport.toast.unexpectedFile" });
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});

describe("useValueExportViewModel — an external download manager", () => {
  it("reports a captured stream as the success it is, not as a failure", async () => {
    setup(new DownloadInterceptedError());
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });
    await waitFor(() => expect(result.current.wasIntercepted).toBe(true));

    expect(result.current.isError).toBe(false);
    expect(toastSuccess).toHaveBeenCalledWith("valueExport.toast.intercepted");
    expect(result.current.lastExport).toBeNull();
  });
});

describe("useValueExportViewModel — reset", () => {
  it("returns to the opening state, so a reopened dialog reports nothing stale", async () => {
    setup(workbook());
    useAppStore.setState({ permissions: ["*"] as never });
    const { result } = renderHook(() => useValueExportViewModel(), { wrapper });

    act(() => result.current.setEntityTypeKey("party.person"));
    await act(async () => {
      result.current.exportValues();
    });
    await waitFor(() => expect(result.current.lastExport).not.toBeNull());

    act(() => result.current.reset());

    expect(result.current.entityTypeKey).toBe("");
    expect(result.current.lastExport).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.wasIntercepted).toBe(false);
  });
});
