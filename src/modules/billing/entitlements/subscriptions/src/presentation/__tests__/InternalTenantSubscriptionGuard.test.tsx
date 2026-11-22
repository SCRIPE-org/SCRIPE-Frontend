import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";

const mockTenantGetById = vi.hoisted(() => vi.fn());
const mockSubscriptionsGetByTenant = vi.hoisted(() => vi.fn());
const mockSubVm = vi.hoisted(() => ({
  items: [] as any[],
  isLoading: false,
  error: null as Error | null,
  hasActiveSubscription: true,
  hasSuspendedSubscription: false,
  hasPendingPaymentSubscription: false,
  isFreeEdition: false,
  isInternalTenant: true,
  isTrialing: false,
  isDowngraded: false,
  activeSubscription: null as any,
  pendingPaymentSubscription: null as any,
  showAssignDialog: false,
  setShowAssignDialog: vi.fn(),
  submitAssign: vi.fn(),
  isAssigning: false,
  showChangeDialog: false,
  setShowChangeDialog: vi.fn(),
  submitChange: vi.fn(),
  isChanging: false,
  downgradeImpact: null,
  isLoadingDowngradeImpact: false,
  showSuspendDialog: false,
  setShowSuspendDialog: vi.fn(),
  submitSuspend: vi.fn(),
  isSuspending: false,
  suspendReason: "",
  setSuspendReason: vi.fn(),
  showCancelDialog: false,
  setShowCancelDialog: vi.fn(),
  submitCancel: vi.fn(),
  isCanceling: false,
  cancelReason: "",
  setCancelReason: vi.fn(),
  showConvertDialog: false,
  setShowConvertDialog: vi.fn(),
  submitConvert: vi.fn(),
  isConverting: false,
  convertType: "Monthly",
  setConvertType: vi.fn(),
  resumeSubscription: vi.fn(),
  isResuming: false,
  renewSubscription: vi.fn(),
  isRenewing: false,
  resyncPermissions: vi.fn(),
  isResyncing: false,
  showCheckoutDialog: false,
  setShowCheckoutDialog: vi.fn(),
  checkoutData: null,
  sendPaymentLink: vi.fn(),
  generatePaymentLinkOnly: vi.fn(),
  isSendingPaymentLink: false,
  showGatewayDialog: false,
  setShowGatewayDialog: vi.fn(),
  openGatewaySelection: vi.fn(),
  handleGatewaySelected: vi.fn(),
  openBillingPortal: vi.fn(),
  isOpeningPortal: false,
  showCancelGatewayDialog: false,
  setShowCancelGatewayDialog: vi.fn(),
  cancelImmediately: false,
  setCancelImmediately: vi.fn(),
  submitCancelGateway: vi.fn(),
  isCancelingGateway: false,
  showCurrencyDialog: false,
  setShowCurrencyDialog: vi.fn(),
  newCurrency: "USD",
  setNewCurrency: vi.fn(),
  submitChangeCurrency: vi.fn(),
  isChangingCurrency: false,
  selectedEditionId: "",
  setSelectedEditionId: vi.fn(),
  subType: "Monthly",
  setSubType: vi.fn(),
  promoCode: "",
  setPromoCode: vi.fn(),
  currency: "USD",
  setCurrency: vi.fn(),
  selectedPromoId: "",
  handlePromoSelect: vi.fn(),
  manualPromoMode: false,
  setManualPromoMode: vi.fn(),
  promotions: [],
  isLoadingPromotions: false,
  pricePreview: null,
  isLoadingPreview: false,
  availableTypes: ["Monthly"],
  isBillingPeriodFixed: false,
  selectedEditionEntity: null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    badgeStyle: "default",
  }),
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

vi.mock("@core/hooks/use-breadcrumb-override", () => ({
  useBreadcrumbOverride: vi.fn(),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    toast: vi.fn(),
  }),
}));

vi.mock("@core/services/module-bridges", () => ({
  getTenantRepository: async () => ({
    getById: mockTenantGetById,
  }),
}));

vi.mock("@modules/entitlements/di", () => ({
  entitlementsContainer: {
    subscriptionRepository: {
      getByTenant: mockSubscriptionsGetByTenant,
      getDowngradeImpact: vi.fn().mockResolvedValue(null),
    },
    editionRepository: {
      getPromotions: vi.fn().mockResolvedValue([]),
      getAll: vi.fn().mockResolvedValue([]),
      previewPrice: vi.fn().mockResolvedValue(null),
    },
    billingRepository: {
      getGateways: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("@modules/entitlements/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@modules/entitlements/core")>();
  return {
    ...actual,
    useEditionsViewModel: () => ({
      items: [],
      isLoading: false,
    }),
    usePaymentGatewaysViewModel: () => ({
      gateways: [],
      isLoading: false,
    }),
  };
});

vi.mock("../viewmodels/useSubscriptionsViewModel", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../viewmodels/useSubscriptionsViewModel")>();
  return {
    ...actual,
    useSubscriptionsViewModel: vi.fn(() => mockSubVm),
  };
});

import { HeroActions } from "../components/subscription-detail/HeroActions";
import { HeroCard } from "../components/subscription-detail/HeroCard";
import { BillingCard } from "../components/subscription-detail/BillingCard";
import { StripeCard } from "../components/subscription-detail/StripeCard";
import { PlanDetailsCard } from "../components/subscription-detail/PlanDetailsCard";
import { SubscriptionsView } from "../views/SubscriptionsView";
import { useSubscriptionsViewModel } from "../viewmodels/useSubscriptionsViewModel";

const baseInternalSub: any = {
  id: "sub-int-1",
  tenantId: "tenant-int-1",
  editionId: "ed-int-1",
  editionName: "SCRIPE Internal",
  type: "Lifetime",
  status: "Active",
  startDate: "2026-01-01T00:00:00Z",
  endDate: null,
  currency: "USD",
  totalAmount: 0,
  baseAmount: 0,
  appliedPromoCode: null,
  promotionDiscount: null,
  gatewayCustomerId: null,
  gatewaySubscriptionId: null,
  paymentGateway: null,
  refundType: null,
  refundAmount: null,
  isDowngraded: false,
};

describe("Entitlements Subscriptions — Internal Tenant Guards", () => {
  const t = (key: string) => key;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubVm.items = [baseInternalSub];
    mockSubVm.isInternalTenant = true;
    mockSubVm.isFreeEdition = false;
  });

  it("HeroActions hides all commercial mutation actions for active Internal tenants while preserving Resync", () => {
    const { rerender } = render(
      <HeroActions sub={baseInternalSub} vm={mockSubVm as any} t={t} isInternal={true} />
    );

    expect(screen.queryByRole("button", { name: /entSubscriptions\.change/ })).not.toBeInTheDocument();
    expect(screen.queryByText("entSubscriptions.suspend")).not.toBeInTheDocument();
    expect(screen.queryByText("entSubscriptions.cancel")).not.toBeInTheDocument();
    expect(screen.queryByText("entSubscriptions.changeCurrency")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entSubscriptions\.resync/ })).toBeInTheDocument();

    rerender(<HeroActions sub={baseInternalSub} vm={mockSubVm as any} t={t} isInternal={false} />);
    expect(screen.getByRole("button", { name: /entSubscriptions\.change/ })).toBeInTheDocument();
  });

  it("HeroActions hides PendingPayment and Resume commercial actions when isInternal is true", () => {
    const pendingSub = { ...baseInternalSub, status: "PendingPayment" };
    const suspendedSub = { ...baseInternalSub, status: "Suspended" };

    const { rerender } = render(
      <HeroActions sub={pendingSub} vm={mockSubVm as any} t={t} isInternal={true} />
    );
    expect(screen.queryByText("billing.actions.generateLink")).not.toBeInTheDocument();
    expect(screen.queryByText("billing.actions.generateAndSend")).not.toBeInTheDocument();
    expect(screen.queryByText("entSubscriptions.revoke")).not.toBeInTheDocument();

    rerender(<HeroActions sub={suspendedSub} vm={mockSubVm as any} t={t} isInternal={true} />);
    expect(screen.queryByRole("button", { name: /entSubscriptions\.resume/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entSubscriptions\.resync/ })).toBeInTheDocument();
  });

  it("BillingCard and StripeCard show internal sovereign identity instead of Free / Free Edition for internal $0 plans", () => {
    const zeroDollarSub = { ...baseInternalSub, totalAmount: null, currency: "USD" };

    render(
      <>
        <BillingCard sub={zeroDollarSub} t={t} isInternal={true} />
        <StripeCard sub={zeroDollarSub} vm={mockSubVm as any} t={t} isInternal={true} />
      </>
    );

    expect(screen.queryByText("entSubscriptions.free")).not.toBeInTheDocument();
    expect(screen.queryByText("entSubscriptions.freeEdition")).not.toBeInTheDocument();
    expect(screen.getByText("entSubscriptions.internalSovereignBadge")).toBeInTheDocument();
    expect(screen.getByText("entSubscriptions.internalSovereignTitle")).toBeInTheDocument();
  });

  it("HeroCard shows internal sovereign badge and passes isInternal guard to HeroActions", () => {
    render(<HeroCard sub={baseInternalSub} vm={mockSubVm as any} t={t} isInternal={true} />);
    expect(screen.getByText("entSubscriptions.internalSovereignBadge")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /entSubscriptions\.change/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entSubscriptions\.resync/ })).toBeInTheDocument();
  });

  it("SubscriptionsView hides Assign Subscription action on EmptyState for Internal tenants", () => {
    mockSubVm.items = [];
    mockSubVm.isInternalTenant = true;
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <SubscriptionsView tenantId="tenant-int-1" />
      </QueryClientProvider>
    );

    expect(screen.queryByRole("button", { name: /entSubscriptions\.assign/ })).not.toBeInTheDocument();

    mockSubVm.isInternalTenant = false;
    rerender(
      <QueryClientProvider client={queryClient}>
        <SubscriptionsView tenantId="tenant-cust-1" />
      </QueryClientProvider>
    );
    expect(screen.getByRole("button", { name: /entSubscriptions\.assign/ })).toBeInTheDocument();
  });

  it("useSubscriptionsViewModel exposes isInternalTenant from tenantQuery and suppresses isFreeEdition for internal tenants", async () => {
    const actualMod = await vi.importActual<typeof import("../viewmodels/useSubscriptionsViewModel")>(
      "../viewmodels/useSubscriptionsViewModel"
    );
    mockTenantGetById.mockResolvedValue({
      id: "tenant-int-1",
      isInternal: true,
      tenantKind: "Internal",
      adminEmail: "root@scripe.io",
    });
    mockSubscriptionsGetByTenant.mockResolvedValue([baseInternalSub]);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => actualMod.useSubscriptionsViewModel("tenant-int-1"), {
      wrapper,
    });

    await waitFor(() => {
      expect((result.current as any).isInternalTenant).toBe(true);
    });
    expect(result.current.isFreeEdition).toBe(false);
    expect(useSubscriptionsViewModel).toBeDefined();
  });

  it("PlanDetailsCard displays None (Lifetime) instead of On Expiry: Fallback for Lifetime plans", () => {
    const lifetimeSub = {
      ...baseInternalSub,
      type: "Lifetime",
      expiryBehavior: "Fallback",
      fallbackEditionName: "free",
    };
    render(<PlanDetailsCard sub={lifetimeSub} t={t} />);

    expect(screen.getByText("entSubscriptions.noneLifetime")).toBeInTheDocument();
    expect(screen.queryByText("entSubscriptions.onExpiryFallback")).not.toBeInTheDocument();
    expect(screen.queryByText("entSubscriptions.fallbackEdition")).not.toBeInTheDocument();
  });
});
