import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TenantMapper } from "../../data/mappers/TenantMapper";
import { TenantModel, TenantTreeNodeModel } from "../../data/models/TenantModel";
import { Tenant, isInternalTenantNode } from "../../domain/entities/Tenant";
import { TenantNodeCardActions } from "../components/TenantNodeCard/TenantNodeCardActions";
import { TenantNodeCardHeader } from "../components/TenantNodeCard/TenantNodeCardHeader";
import { TenantHeader } from "../components/TenantHeader";
import { EditTenantDialog } from "../components/TenantDialogs";
import { TenantEditDialog } from "../components/TenantEditDialog";
import { TenantSubscriptionCard } from "../components/cards/TenantSubscriptionCard";
import { useTenantHeaderViewModel } from "../viewmodels/useTenantHeaderViewModel";
import { useTenantSettingsViewModel } from "../viewmodels/useTenantSettingsViewModel";
import { identityContainer } from "@modules/identity/di";
import { Building2 } from "lucide-react";

const mockSubVm = vi.hoisted(() => ({
  subscription: {
    id: "sub-1",
    tenantId: "tenant-1",
    editionId: "ed-1",
    editionName: "scripe-internal",
    type: "Lifetime",
    status: "Active",
    startDate: "2026-01-01T00:00:00Z",
    currency: "EGP",
    totalAmount: 0,
  },
  subscriptionHistory: [],
  isLoading: false,
  error: null,
  availableEditions: [],
  isEditionsLoading: false,
  isTrialing: false,
  isSuspended: false,
  isExpired: false,
  isCanceled: false,
  isPastDue: false,
  isPendingPayment: false,
  isActive: true,
  isDowngraded: false,
  downgradedFromEditionName: null,
  downgradedFromType: null,
  downgradedAt: null,
  daysRemaining: null,
  canRenew: false,
  canConvertTrial: false,
  canSuspend: true,
  canResume: false,
  canCancel: true,
  canReassign: false,
  fallbackEditionName: null,
  expiryBehavior: null,
  hasFallback: false,
  hasNoSubscription: false,
  assignEdition: vi.fn(),
  isAssigning: false,
  changeEdition: vi.fn(),
  isChanging: false,
  renewSubscription: vi.fn(),
  isRenewing: false,
  convertTrial: vi.fn(),
  isConverting: false,
  suspendSubscription: vi.fn(),
  isSuspending: false,
  resumeSubscription: vi.fn(),
  isResuming: false,
  cancelSubscription: vi.fn(),
  isCanceling: false,
  resyncPermissions: vi.fn(),
  isResyncing: false,
  changeCurrency: vi.fn(),
  isChangingCurrency: false,
  getDowngradeImpact: vi.fn(),
  previewPrice: vi.fn(),
  downloadReceipt: vi.fn(),
  isDownloadingReceipt: false,
  changePlanPromotionsRaw: [],
  isLoadingChangePlanPromos: false,
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

vi.mock("@core/hooks/use-permissions", () => ({
  usePermissions: () => ({
    hasPermission: () => true,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    hasPermission: () => true,
  }),
}));

vi.mock("@core/hooks/use-converted-amount", () => ({
  useConvertedAmount: () => ({
    formatDisplay: (amount: number, currency: string) => `${amount} ${currency}`,
  }),
}));

vi.mock("@core/hooks/useConvertedAmount", () => ({
  useConvertedAmount: () => ({
    formatDisplay: (amount: number, currency: string) => `${amount} ${currency}`,
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    tenantRepository: {
      update: vi.fn(),
      delete: vi.fn(),
      getDescendantCount: vi.fn().mockResolvedValue(0),
      toggleStatus: vi.fn().mockResolvedValue(undefined),
      getSettings: vi.fn().mockResolvedValue({ security: {}, audit: {}, branding: {} }),
      updateSettings: vi.fn().mockResolvedValue(undefined),
      uploadLogo: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/logo.png" }),
    },
    tenantService: {
      toggleStatus: vi.fn(),
      getSettings: vi.fn(),
      updateSettings: vi.fn(),
      uploadLogo: vi.fn(),
    },
  },
}));

vi.mock("@modules/identity/tenants/src/presentation/viewmodels/useTenantSubscriptionViewModel", () => ({
  useTenantSubscriptionViewModel: () => mockSubVm,
}));

describe("Internal tenant mapping and UI guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TenantMapper.toEntity maps tenantKind Internal cleanly and sets isInternal", () => {
    const model = TenantModel.fromJson({
      id: "1",
      name: "SCRIPE",
      code: "SCRIPE",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      tenantKind: "Internal",
    });

    const entity = TenantMapper.toEntity(model);
    expect(entity.tenantKind).toBe("Internal");
    expect(entity.isInternal).toBe(true);
    expect(entity.toProps().tenantKind).toBe("Internal");
    expect(entity.copyWith({ name: "SCRIPE HQ" }).isInternal).toBe(true);
  });

  it("TenantMapper.toEntity defaults isInternal to false when tenantKind is omitted", () => {
    const model = TenantModel.fromJson({
      id: "2",
      name: "Ahly Club",
      code: "AHLY",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
    });

    const entity = TenantMapper.toEntity(model);
    expect(entity.tenantKind).toBeUndefined();
    expect(entity.isInternal).toBe(false);
  });

  it("TenantMapper.toTreeNode maps tenantKind Internal and omits it when absent", () => {
    const internalNode = TenantMapper.toTreeNode(
      TenantTreeNodeModel.fromJson({
        id: "1",
        name: "SCRIPE",
        code: "SCRIPE",
        level: 0,
        isActive: true,
        tenantKind: "Internal",
        children: [],
      })
    );
    expect(internalNode.tenantKind).toBe("Internal");

    const customerNode = TenantMapper.toTreeNode(
      TenantTreeNodeModel.fromJson({
        id: "2",
        name: "Ahly",
        code: "AHLY",
        level: 0,
        isActive: true,
        children: [],
      })
    );
    expect(customerNode.tenantKind).toBeUndefined();
  });

  it("TenantNodeCardHeader renders internal badge only for Internal tenants", () => {
    const { rerender } = render(
      <TenantNodeCardHeader
        node={{
          id: "1",
          name: "SCRIPE",
          code: "SCRIPE",
          level: 0,
          isActive: true,
          tenantKind: "Internal",
          children: [],
        }}
        isExpanded={false}
        status="active"
        daysLeft={null}
        config={{
          iconBg: "bg-success/10 text-success",
          badgeVariant: "success",
          Icon: Building2,
        }}
        statusBadge={<span>Active</span>}
        suspensionTooltip={null}
        hasChildren={false}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByText("tenant.internalBadge")).toBeInTheDocument();

    rerender(
      <TenantNodeCardHeader
        node={{
          id: "2",
          name: "Ahly",
          code: "AHLY",
          level: 0,
          isActive: true,
          tenantKind: "Customer",
          children: [],
        }}
        isExpanded={false}
        status="active"
        daysLeft={null}
        config={{
          iconBg: "bg-success/10 text-success",
          badgeVariant: "success",
          Icon: Building2,
        }}
        statusBadge={<span>Active</span>}
        suspensionTooltip={null}
        hasChildren={false}
        onToggle={vi.fn()}
      />
    );
    expect(screen.queryByText("tenant.internalBadge")).not.toBeInTheDocument();
  });

  it("TenantNodeCardActions hides Delete action when node is Internal", () => {
    const { rerender } = render(
      <TenantNodeCardActions
        node={{
          id: "1",
          name: "SCRIPE",
          code: "SCRIPE",
          level: 0,
          isActive: true,
          tenantKind: "Internal",
          children: [],
        }}
        status="active"
        compact={false}
        canViewDetails={true}
        canEnterTenantWorld={true}
        canDrillDown={true}
        canEdit_={true}
        canCreate={true}
        canDeleteTenant={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateChild={vi.fn()}
        onViewDetails={vi.fn()}
        onEnterWorld={vi.fn()}
      />
    );
    expect(screen.queryByRole("button", { name: "common.delete" })).not.toBeInTheDocument();

    rerender(
      <TenantNodeCardActions
        node={{
          id: "2",
          name: "Ahly",
          code: "AHLY",
          level: 0,
          isActive: true,
          tenantKind: "Customer",
          children: [],
        }}
        status="active"
        compact={false}
        canViewDetails={true}
        canEnterTenantWorld={true}
        canDrillDown={true}
        canEdit_={true}
        canCreate={true}
        canDeleteTenant={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreateChild={vi.fn()}
        onViewDetails={vi.fn()}
        onEnterWorld={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "common.delete" })).toBeInTheDocument();
  });

  it("TenantHeader renders internal badge and hides Deactivate & Delete for Internal tenants", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const internalTenant = new Tenant({
      id: "1",
      name: "SCRIPE",
      code: "SCRIPE",
      level: 0,
      path: "/SCRIPE",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      tenantKind: "Internal",
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <TenantHeader tenant={internalTenant} />
      </QueryClientProvider>
    );
    expect(screen.getByText("tenant.internalBadge")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "common.deactivate" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "common.delete" })).not.toBeInTheDocument();

    const customerTenant = new Tenant({
      id: "2",
      name: "Ahly",
      code: "AHLY",
      level: 0,
      path: "/AHLY",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      tenantKind: "Customer",
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <TenantHeader tenant={customerTenant} />
      </QueryClientProvider>
    );
    expect(screen.queryByText("tenant.internalBadge")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "common.deactivate" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "common.delete" })).toBeInTheDocument();
  });

  it("TenantSubscriptionCard hides Suspend & Cancel actions when isInternal is true", () => {
    const { rerender } = render(<TenantSubscriptionCard tenantId="1" isInternal={true} />);
    expect(screen.queryByRole("button", { name: "tenant.suspend" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "tenant.cancel" })).not.toBeInTheDocument();

    rerender(<TenantSubscriptionCard tenantId="2" isInternal={false} />);
    expect(screen.getByRole("button", { name: "tenant.suspend" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "tenant.cancel" })).toBeInTheDocument();
  });

  it("TenantSubscriptionCard guards Assign, Change Plan, Reassign, Renew, Convert Trial, Resume, Change Currency and hides Free Plan banner for Internal tenants", () => {
    mockSubVm.subscription = {
      id: "sub-int",
      tenantId: "1",
      editionId: "ed-int",
      editionName: "scripe-internal",
      type: "Lifetime",
      status: "Active",
      startDate: "2026-01-01T00:00:00Z",
      currency: "USD",
      totalAmount: 0,
    };
    mockSubVm.isActive = true;
    mockSubVm.canRenew = true;
    mockSubVm.canConvertTrial = true;
    mockSubVm.canResume = true;
    mockSubVm.canSuspend = true;
    mockSubVm.canCancel = true;

    const { rerender } = render(<TenantSubscriptionCard tenantId="1" isInternal={true} />);
    expect(screen.getByText("tenant.typeLabel.lifetime")).toBeInTheDocument();
    expect(screen.queryByText("tenant.typeLabel.free")).not.toBeInTheDocument();
    expect(screen.queryByText("tenant.freePlanTitle")).not.toBeInTheDocument();
    expect(screen.getByText("tenant.internalSovereignBadge")).toBeInTheDocument();
    expect(screen.getByText("tenant.internalSovereignTitle")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "tenant.changePlan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "tenant.changeCurrency" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "tenant.renew" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "tenant.convertTrial" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "tenant.resume" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "tenant.resyncPermissions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "tenant.downloadReceipt" })).toBeInTheDocument();

    // Canceled / Expired state with canReassign
    mockSubVm.isActive = false;
    mockSubVm.isCanceled = true;
    mockSubVm.canReassign = true;
    rerender(<TenantSubscriptionCard tenantId="1" isInternal={true} />);
    expect(screen.queryByRole("button", { name: "tenant.reassignPlan" })).not.toBeInTheDocument();

    rerender(<TenantSubscriptionCard tenantId="2" isInternal={false} />);
    expect(screen.getByRole("button", { name: "tenant.reassignPlan" })).toBeInTheDocument();

    // No subscription state
    mockSubVm.subscription = null as any;
    mockSubVm.isCanceled = false;
    mockSubVm.canReassign = false;
    rerender(<TenantSubscriptionCard tenantId="1" isInternal={true} />);
    expect(screen.queryByRole("button", { name: "tenant.assignPlan" })).not.toBeInTheDocument();

    rerender(<TenantSubscriptionCard tenantId="2" isInternal={false} />);
    expect(screen.getByRole("button", { name: "tenant.assignPlan" })).toBeInTheDocument();

    // Restore defaults for sibling assertions
    mockSubVm.subscription = {
      id: "sub-1",
      tenantId: "tenant-1",
      editionId: "ed-1",
      editionName: "scripe-internal",
      type: "Lifetime",
      status: "Active",
      startDate: "2026-01-01T00:00:00Z",
      currency: "EGP",
      totalAmount: 0,
    };
    mockSubVm.isActive = true;
    mockSubVm.canRenew = false;
    mockSubVm.canConvertTrial = false;
    mockSubVm.canResume = false;
  });

  it("isInternalTenantNode detects Internal nodes and TenantNodeCardActions hides reassignPlan on canceled internal node", () => {
    expect(isInternalTenantNode({ tenantKind: "Internal" })).toBe(true);
    expect(isInternalTenantNode({ tenantKind: "Customer" })).toBe(false);
    expect(isInternalTenantNode({})).toBe(false);
    expect(isInternalTenantNode(null)).toBe(false);
    expect(isInternalTenantNode(undefined)).toBe(false);

    const { rerender } = render(
      <TenantNodeCardActions
        node={{
          id: "1",
          name: "SCRIPE",
          code: "SCRIPE",
          level: 0,
          isActive: true,
          tenantKind: "Internal",
          children: [],
        }}
        status="canceled"
        compact={false}
        canViewDetails={true}
        canEnterTenantWorld={false}
        canDrillDown={false}
        canEdit_={false}
        canCreate={false}
        canDeleteTenant={false}
        onViewDetails={vi.fn()}
        onEnterWorld={vi.fn()}
      />
    );
    expect(screen.queryByRole("button", { name: "tenant.reassignPlan" })).not.toBeInTheDocument();

    rerender(
      <TenantNodeCardActions
        node={{
          id: "2",
          name: "Ahly",
          code: "AHLY",
          level: 0,
          isActive: true,
          tenantKind: "Customer",
          children: [],
        }}
        status="canceled"
        compact={false}
        canViewDetails={true}
        canEnterTenantWorld={false}
        canDrillDown={false}
        canEdit_={false}
        canCreate={false}
        canDeleteTenant={false}
        onViewDetails={vi.fn()}
        onEnterWorld={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "tenant.reassignPlan" })).toBeInTheDocument();
  });

  it("EditTenantDialog hides isActive switch when isInternal is true, passes updated payload directly (no stale closure), and respects isLoading", async () => {
    const setForm = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      <EditTenantDialog
        open={true}
        onOpenChange={vi.fn()}
        tenantName="SCRIPE"
        form={{ name: "SCRIPE", description: "Platform", isActive: false }}
        setForm={setForm}
        onSubmit={onSubmit}
        isLoading={false}
        isInternal={true}
      />
    );

    expect(screen.queryByText("tenant.activeStatus")).not.toBeInTheDocument();

    const nameInput = screen.getByLabelText(/tenant\.name/);
    const descInput = screen.getByLabelText(/tenant\.descriptionLabel/);
    fireEvent.change(nameInput, { target: { value: "SCRIPE Renamed" } });
    fireEvent.change(descInput, { target: { value: "Updated Platform Desc" } });

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(setForm).toHaveBeenCalledWith({
        name: "SCRIPE Renamed",
        description: "Updated Platform Desc",
        isActive: true,
      });
      expect(onSubmit).toHaveBeenCalledWith({
        name: "SCRIPE Renamed",
        description: "Updated Platform Desc",
        isActive: true,
      });
    });

    rerender(
      <EditTenantDialog
        open={true}
        onOpenChange={vi.fn()}
        tenantName="Ahly"
        form={{ name: "Ahly", description: "Club", isActive: true }}
        setForm={setForm}
        onSubmit={onSubmit}
        isLoading={true}
        isInternal={false}
      />
    );
    expect(screen.getByText("tenant.activeStatus")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "common.save" })).toBeDisabled();
  });

  it("TenantEditDialog hides activeStatus toggle when isInternal is true", () => {
    const { rerender } = render(
      <TenantEditDialog
        open={true}
        onOpenChange={vi.fn()}
        form={{ name: "SCRIPE", description: "Platform", isActive: true }}
        onSetName={vi.fn()}
        onSetDescription={vi.fn()}
        onSetActive={vi.fn()}
        onSubmit={vi.fn()}
        isUpdating={false}
        isInternal={true}
      />
    );
    expect(screen.queryByText("tenant.activeStatus")).not.toBeInTheDocument();

    rerender(
      <TenantEditDialog
        open={true}
        onOpenChange={vi.fn()}
        form={{ name: "Ahly", description: "Club", isActive: true }}
        onSetName={vi.fn()}
        onSetDescription={vi.fn()}
        onSetActive={vi.fn()}
        onSubmit={vi.fn()}
        isUpdating={false}
        isInternal={false}
      />
    );
    expect(screen.getByText("tenant.activeStatus")).toBeInTheDocument();
  });

  it("useTenantHeaderViewModel and useTenantSettingsViewModel route operations through tenantRepository instead of tenantService", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const customerTenant = new Tenant({
      id: "cust-1",
      name: "Ahly",
      code: "AHLY",
      level: 0,
      path: "/AHLY",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      tenantKind: "Customer",
    });

    const { result: headerResult } = renderHook(() =>
      useTenantHeaderViewModel({ tenant: customerTenant })
    );

    await act(async () => {
      await headerResult.current.handleToggleStatus();
    });

    expect((identityContainer.tenantRepository as any).toggleStatus).toHaveBeenCalledWith(
      "cust-1",
      false
    );
    expect(identityContainer.tenantService.toggleStatus).not.toHaveBeenCalled();

    const { result: settingsResult } = renderHook(() => useTenantSettingsViewModel("cust-1"), {
      wrapper,
    });

    await waitFor(() => {
      expect((identityContainer.tenantRepository as any).getSettings).toHaveBeenCalledWith("cust-1");
    });
    expect((identityContainer.tenantService as any).getSettings).not.toHaveBeenCalled();

    await act(async () => {
      settingsResult.current.updateSettings({ security: { enforceMfa: true } } as any);
    });
    await waitFor(() => {
      expect((identityContainer.tenantRepository as any).updateSettings).toHaveBeenCalledWith(
        "cust-1",
        { security: { enforceMfa: true } }
      );
    });
    expect((identityContainer.tenantService as any).updateSettings).not.toHaveBeenCalled();

    const logoFile = new File(["png"], "logo.png", { type: "image/png" });
    await act(async () => {
      await settingsResult.current.uploadLogo(logoFile);
    });
    expect((identityContainer.tenantRepository as any).uploadLogo).toHaveBeenCalledWith(
      "cust-1",
      logoFile
    );
    expect((identityContainer.tenantService as any).uploadLogo).not.toHaveBeenCalled();
  });
});
