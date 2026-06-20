import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import ActivateWorkspaceView from "../src/presentation/views/ActivateWorkspaceView";

// Mocks
const {
  mockRouterPush,
  mockUseAppStore,
  mockCreateCheckoutSession,
  mockChangeSubscription,
  mockGetMyTenantSubscription,
  mockGetAllEditions,
  mockUseQuery,
  mockUseEnhancedToast,
  mockLogoutStore,
} = vi.hoisted(() => {
  const mockRouterPush = vi.fn();
  const mockLogoutStore = vi.fn();
  const mockCreateCheckoutSession = vi.fn();
  const mockChangeSubscription = vi.fn();
  const mockGetMyTenantSubscription = vi.fn();
  const mockGetAllEditions = vi.fn();
  const mockUseEnhancedToast = vi.fn(() => ({
    toast: vi.fn(),
  }));

  const mockAppState = {
    user: { tenantId: "tenant-123" },
    logout: mockLogoutStore,
  };

  const mockUseAppStore = Object.assign(
    (selector: (state: typeof mockAppState) => unknown) => selector(mockAppState),
    {
      getState: () => mockAppState,
    }
  );

  const mockUseQuery = vi.fn((args: { queryKey: string[] }) => {
    if (args.queryKey.includes("activate-workspace-subscription")) {
      return {
        data: {
          editionId: "edition-gold",
          editionName: "Gold Edition",
          type: "Monthly",
          currency: "USD",
        },
        isLoading: false,
        refetch: vi.fn(),
      };
    }
    if (args.queryKey.includes("activate-workspace-editions")) {
      return {
        data: {
          items: [
            {
              id: "edition-free",
              name: "Free Edition",
              isFree: true,
              isSelfServiceEnabled: true,
              getDisplayName: () => "Free Edition",
            },
            {
              id: "edition-gold",
              name: "Gold Edition",
              isFree: false,
              isSelfServiceEnabled: true,
              getDisplayName: () => "Gold Edition",
            },
          ],
        },
        isLoading: false,
      };
    }
    return { data: null, isLoading: false };
  });

  return {
    mockRouterPush,
    mockUseAppStore,
    mockCreateCheckoutSession,
    mockChangeSubscription,
    mockGetMyTenantSubscription,
    mockGetAllEditions,
    mockUseQuery,
    mockUseEnhancedToast,
    mockLogoutStore,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mockUseQuery,
  useMutation: vi.fn(),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: mockUseAppStore,
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
  }),
}));

vi.mock("@core/providers/signup-theme", () => ({
  useSignupTheme: () => ({
    tokens: {
      accent: "#7c3aed",
      cyan: "#06b6d4",
      surfaceRaised: "rgba(255, 255, 255, 0.05)",
      border: "rgba(255, 255, 255, 0.1)",
      ink: "#ffffff",
      inkMuted: "#a1a1aa",
      inkGhost: "#71717a",
    },
    theme: "dark",
    toggleTheme: vi.fn(),
  }),
}));

vi.mock("@modules/entitlements/di", () => ({
  entitlementsContainer: {
    subscriptionRepository: {
      getMyTenantSubscription: mockGetMyTenantSubscription,
      change: mockChangeSubscription,
    },
    billingRepository: {
      createCheckoutSession: mockCreateCheckoutSession,
    },
    editionRepository: {
      getAll: mockGetAllEditions,
    },
  },
}));

vi.mock("@modules/auth/signup/src/presentation/components/common/SignupShell", () => ({
  SignupShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signup-shell">{children}</div>
  ),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: mockUseEnhancedToast,
}));

vi.mock("@core/common/secure-token-service", () => ({
  secureTokenService: {
    clearTokens: vi.fn(),
  },
}));

vi.mock("@core/navigation/store/useNavigationStore", () => ({
  useNavigationStore: {
    getState: () => ({
      reset: vi.fn(),
    }),
  },
}));

describe("ActivateWorkspaceView component tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render workspace activation screen with current subscription details", () => {
    render(<ActivateWorkspaceView />);

    expect(screen.getByTestId("signup-shell")).toBeInTheDocument();
    expect(screen.getByText("entitlements.activateWorkspace.title")).toBeInTheDocument();
    expect(screen.getByText("Gold Edition")).toBeInTheDocument();
  });

  it("should call createCheckoutSession and redirect when Retry Payment is clicked", async () => {
    mockCreateCheckoutSession.mockResolvedValueOnce({
      url: "https://stripe.com/checkout/session_abc123",
    });

    // Mock window.location using Object.defineProperty to satisfy type system and prevent reassignment error
    const originalLocation = window.location;
    const locationMock = { href: "" };
    Object.defineProperty(window, "location", {
      value: locationMock,
      configurable: true,
      writable: true,
    });

    render(<ActivateWorkspaceView />);

    const retryBtn = screen.getByText("entitlements.activateWorkspace.retryCheckout");
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith("tenant-123", {
        editionId: "edition-gold",
        subscriptionType: "Monthly",
        currency: "USD",
        successUrl: expect.stringContaining("/dashboard"),
        cancelUrl: expect.stringContaining("/activate-workspace"),
      });
      expect(locationMock.href).toBe("https://stripe.com/checkout/session_abc123");
    });

    // Restore original location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      configurable: true,
      writable: true,
    });
  });

  it("should call store logout and redirect to login when Sign Out is clicked", () => {
    render(<ActivateWorkspaceView />);

    const signOutBtn = screen.getByText("entitlements.activateWorkspace.signOut");
    fireEvent.click(signOutBtn);

    expect(mockLogoutStore).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith("/login");
  });
});
