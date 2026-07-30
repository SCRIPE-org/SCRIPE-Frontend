import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLoginViewModel } from "../viewmodels/use-login-viewmodel";

// Mocks
const {
  mockLoginMutateAsync,
  mockRouterReplace,
  mockOperationSuccess,
  mockOperationError,
  mockRefreshNavigation,
  mockVerify2FA,
  mockUseAppStore,
} = vi.hoisted(() => {
  const mockLoginMutateAsync = vi.fn();
  const mockRouterReplace = vi.fn();
  const mockSetAuth = vi.fn();
  const mockOperationSuccess = vi.fn();
  const mockOperationError = vi.fn();
  const mockRefreshNavigation = vi.fn();
  const mockVerify2FA = vi.fn();
  const mockAppState = {
    isAuthenticated: false,
    _hasHydrated: true,
    defaultRedirectPath: "/",
    mustChangePassword: false,
    setAuth: mockSetAuth,
  };
  const mockUseAppStore = Object.assign(
    (selector: (state: typeof mockAppState) => unknown) => selector(mockAppState),
    {
      getState: () => mockAppState,
    }
  );

  return {
    mockLoginMutateAsync,
    mockRouterReplace,
    mockOperationSuccess,
    mockOperationError,
    mockRefreshNavigation,
    mockVerify2FA,
    mockUseAppStore,
  };
});

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}));

vi.mock("@modules/auth/core/src/presentation/viewmodels/useAuthLogin", () => ({
  useAuthLogin: () => ({
    mutateAsync: mockLoginMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: mockUseAppStore,
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      verify2FA: mockVerify2FA,
    },
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    operationSuccess: mockOperationSuccess,
    operationError: mockOperationError,
  }),
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useNavigation: () => ({
    refreshNavigation: mockRefreshNavigation,
  }),
}));

vi.mock("@tanstack/react-query", () => {
  class MockQueryClient {
    invalidateQueries = vi.fn();
    defaultOptions = {};
  }
  return {
    QueryClient: MockQueryClient,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  };
});

vi.mock("@core/common/secure-token-service", () => ({
  secureTokenService: {
    hasToken: () => false,
    getAccessToken: () => null,
    clearTokens: vi.fn(),
  },
}));

vi.mock("@/core/common/logger", () => ({
  appLogger: {
    auth: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("useLoginViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useLoginViewModel());

    expect(result.current.formData).toEqual({ identifier: "", password: "", staySignedIn: false });
    expect(result.current.error).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.loginStep).toBe("credentials");
  });

  it("should update form fields", () => {
    const { result } = renderHook(() => useLoginViewModel());

    act(() => {
      result.current.updateField("identifier", "testuser");
      result.current.updateField("password", "password123");
    });

    expect(result.current.formData.identifier).toBe("testuser");
    expect(result.current.formData.password).toBe("password123");
  });

  it("should validate form before submission", async () => {
    const { result } = renderHook(() => useLoginViewModel());

    // Empty form
    await act(async () => {
      await result.current.handleLogin();
    });

    expect(result.current.error).toBeTruthy(); // Should have validation error
    expect(mockLoginMutateAsync).not.toHaveBeenCalled();
  });

  it("should call login mutation on valid submission", async () => {
    const { result } = renderHook(() => useLoginViewModel());

    // Fill form
    act(() => {
      result.current.updateField("identifier", "testuser");
      result.current.updateField("password", "password123");
    });

    // Mock successful login
    mockLoginMutateAsync.mockResolvedValueOnce({});

    await act(async () => {
      await result.current.handleLogin();
    });

    expect(mockLoginMutateAsync).toHaveBeenCalledWith({
      identifier: "testuser",
      password: "password123",
      staySignedIn: false,
      tenantCode: undefined,
      tenantId: undefined,
    });

    // Should trigger redirect behavior
    await waitFor(() => {
      expect(result.current.isRedirecting).toBe(true);
    });

    // Router replace is called inside setTimeout.
    // The mocked store supplies defaultRedirectPath: "/" (line 25). "/" has no
    // page in the App Router — there is no src/app/page.tsx — so
    // use-login-viewmodel.ts normalizes a "/" (or empty) redirect target to
    // "/overview", which is the real authenticated landing route
    // (src/app/(modules)/(workspace-admin)/overview/page.tsx). Asserting "/"
    // here encoded a landing route that never existed.
    await new Promise((r) => setTimeout(r, 150));
    expect(mockRouterReplace).toHaveBeenCalledWith("/overview");
  });

  it("should handle login failure", async () => {
    const { result } = renderHook(() => useLoginViewModel());

    act(() => {
      result.current.updateField("identifier", "testuser");
      result.current.updateField("password", "password123");
    });

    // Mock failure
    mockLoginMutateAsync.mockRejectedValueOnce(new Error("Invalid credentials"));

    await act(async () => {
      await result.current.handleLogin();
    });

    expect(result.current.error).toBe("Invalid credentials");
    expect(result.current.isRedirecting).toBe(false);
  });
});
