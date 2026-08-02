import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDsrDetailViewModel } from "../viewmodels/useDsrDetailViewModel";

// Mock hoist variables
const { mockGetById, mockConfirmErasure, mockDownloadExport, mockToast, mockUseAppStore } =
  vi.hoisted(() => {
    const mockGetById = vi.fn();
    const mockConfirmErasure = vi.fn();
    const mockDownloadExport = vi.fn();
    const mockToast = vi.fn();

    const mockAppState = {
      tenantCode: "test-tenant",
    };
    const mockUseAppStore = Object.assign(
      (selector?: (state: typeof mockAppState) => unknown) => {
        if (typeof selector === "function") {
          return selector(mockAppState);
        }
        return mockAppState;
      },
      {
        getState: () => mockAppState,
      }
    );

    return {
      mockGetById,
      mockConfirmErasure,
      mockDownloadExport,
      mockToast,
      mockUseAppStore,
    };
  });

// Mock compliance container DI
vi.mock("@modules/compliance/di", () => ({
  complianceContainer: {
    dsrRepository: {
      getById: mockGetById,
      confirmErasure: mockConfirmErasure,
      downloadExport: mockDownloadExport,
    },
  },
}));

// Mock store
vi.mock("@/core/store/useAppStore", () => ({
  useAppStore: mockUseAppStore,
}));

// Mock i18n
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock toast
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  toast: mockToast,
}));

// Mock react-query
vi.mock("@tanstack/react-query", () => {
  const mockInvalidateQueries = vi.fn();
  return {
    useQueryClient: vi.fn(() => ({
      invalidateQueries: mockInvalidateQueries,
    })),
    useQuery: vi.fn(() => ({
      data: { id: "test-dsr-id", status: "Pending", subjectEmail: "user@example.test" },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })),
    useMutation: vi.fn((config) => ({
      mutate: vi.fn((args) => {
        if (config?.mutationFn) {
          config.mutationFn(args);
        }
        if (config?.onSuccess) {
          // Mock successful mutation execution
          const response = args instanceof Blob ? args : { success: true };
          config.onSuccess(response);
        }
      }),
      isPending: false,
    })),
  };
});

describe("useDsrDetailViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default states and retrieve data", () => {
    const { result } = renderHook(() => useDsrDetailViewModel("test-dsr-id"));

    expect(result.current.dsr).toEqual({
      id: "test-dsr-id",
      status: "Pending",
      subjectEmail: "user@example.test",
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isConfirmingErasure).toBe(false);
    expect(result.current.erasureInput).toBe("");
    expect(result.current.tenantCode).toBe("test-tenant");
  });

  it("should update erasure input when setErasureInput is called", () => {
    const { result } = renderHook(() => useDsrDetailViewModel("test-dsr-id"));

    act(() => {
      result.current.setErasureInput("CONFIRM");
    });

    expect(result.current.erasureInput).toBe("CONFIRM");
  });

  it("should update isConfirmingErasure state", () => {
    const { result } = renderHook(() => useDsrDetailViewModel("test-dsr-id"));

    act(() => {
      result.current.setIsConfirmingErasure(true);
    });

    expect(result.current.isConfirmingErasure).toBe(true);
  });

  it("should trigger confirmErasure mutation successfully", () => {
    const { result } = renderHook(() => useDsrDetailViewModel("test-dsr-id"));

    act(() => {
      result.current.confirmErasure();
    });

    expect(mockConfirmErasure).toHaveBeenCalledWith("test-dsr-id");
    expect(mockToast).toHaveBeenCalledWith({
      title: "compliance.erasureConfirmed",
      variant: "default",
    });
  });

  it("should trigger downloadExport mutation successfully", () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn(() => "blob:url");
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document click trigger
    const mockClick = vi.fn();
    const mockAnchor = {
      href: "",
      download: "",
      click: mockClick,
    };
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      if (tagName === "a") {
        return mockAnchor as any;
      }
      return originalCreateElement(tagName, options);
    });

    const { result } = renderHook(() => useDsrDetailViewModel("test-dsr-id"));

    // Mock downloadExport to return a Blob on mutation
    mockDownloadExport.mockResolvedValue(new Blob(["test data"]));

    act(() => {
      result.current.downloadExport();
    });

    expect(mockDownloadExport).toHaveBeenCalledWith("test-dsr-id");
  });
});
