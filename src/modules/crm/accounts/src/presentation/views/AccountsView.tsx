"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import { AlertCircle, RefreshCw, Plus, Search, Building2, Eye } from "lucide-react";
import { cn } from "@core/common/utils";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader, CRM_TAB_ROUTES } from "@modules/crm";
import type { CrmTabId } from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { DataExchangeToolbarActions } from "@core/data-exchange";
import { CreateAccountDialog } from "../components/CreateAccountDialog";
import { AccountCardGridItem } from "../components/AccountCardGridItem";
import { AccountSplitDetail } from "../components/AccountSplitDetail";
import { useAccountsViewModel } from "../viewmodels/useAccountsViewModel";
import { useAccountsCrudColumns } from "../viewmodels/useAccountsCrudColumns";
import type { CrmAccount } from "../../domain/entities/AccountEntity";

/**
 * CRM Accounts directory view providing tier filtering, quick search,
 * multi-layout rendering (Table, CardGrid, SplitPane), and account creation.
 */
export function AccountsView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateAccount = usePermission(CRM_PERMISSIONS.ACCOUNTS_CREATE);
  const viewModel = useAccountsViewModel();
  const {
    state,
    search,
    tierFilter,
    isCreateOpen,
    isSubmitting,
    submitError,
    setIsCreateOpen,
    handleSearchChange,
    handleTierFilterChange,
    handleCreateAccount,
    refresh,
  } = viewModel;

  const handleTabChange = (tab: CrmTabId) => {
    const route = CRM_TAB_ROUTES[tab];
    if (route) router.push(route);
  };

  const columns = useAccountsCrudColumns(language, t);

  const tiers = [
    { key: undefined, label: t("crmAccounts.filters.allTiers") },
    { key: "Enterprise", label: t("crmAccounts.tiers.Enterprise") },
    { key: "KeyAccount", label: t("crmAccounts.tiers.KeyAccount") },
    { key: "Strategic", label: t("crmAccounts.tiers.Strategic") },
    { key: "Standard", label: t("crmAccounts.tiers.Standard") },
  ];

  const crudConfig: CrudConfig<CrmAccount> = {
    titleKey: "crmAccounts.header.title",
    subtitleKey: "crmAccounts.header.subtitle",
    resource: "crm.accounts",
    entityTypeKey: "crm.account",
    dataExchange: { entityKey: "crm.account", hideToolbarActions: true },
    hidePageHeader: true,
    hideActionButtons: true,
    stickyActions: true,
    searchConfig: { enabled: false },
    viewSwitchPosition: "toolbar",
    viewModes: ["Table", "CardGrid", "SplitPane"],
    defaultView: "Table",
    permissions: {
      canView: CRM_PERMISSIONS.ACCOUNTS_READ,
      canCreate: CRM_PERMISSIONS.ACCOUNTS_CREATE,
      canUpdate: CRM_PERMISSIONS.ACCOUNTS_UPDATE,
      canDelete: false,
    },
    toolbarContent: (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1" dir={isRtl ? "rtl" : "ltr"}>
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
          <Input
            type="text"
            placeholder={t("crmAccounts.searchPlaceholder")}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 ps-8 pe-3 text-xs bg-nx-surface border-nx-line text-nx-ink"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tiers.map((tier) => {
            const isSelected = tierFilter === tier.key;
            return (
              <Button
                key={tier.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTierFilterChange(tier.key)}
                className={cn(
                  "h-7 px-2.5 text-xs rounded-nx-md shrink-0 transition-all",
                  isSelected
                    ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                    : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
                )}
              >
                {tier.label}
              </Button>
            );
          })}
        </div>
      </div>
    ),
    columns,
    getActions: (_vm, tFn): CrudAction<CrmAccount>[] => [
      {
        label: tFn("crmAccounts.actions.view360") || "View 360",
        icon: <Eye className="size-3.5" />,
        onClick: (a: CrmAccount) => router.push(`/crm/accounts/${a.id}`),
      },
    ],
    renderCardGridItem: (account: CrmAccount, actions: React.ReactNode) => (
      <AccountCardGridItem
        account={account}
        actions={actions}
        language={language}
        onViewDetail={(id) => router.push(`/crm/accounts/${id}`)}
        t={t}
      />
    ),
    renderSplitDetail: (account: CrmAccount, actions: React.ReactNode) => (
      <AccountSplitDetail
        account={account}
        actions={actions}
        language={language}
        t={t}
      />
    ),
  };

  return (
    <CrmShell activeTab="accounts" onTabChange={handleTabChange}>
      <div className="space-y-4">
        <CrmSectionHeader
          title={t("crmAccounts.header.title")}
          subtitle={t("crmAccounts.header.subtitle")}
          actions={
            <div className="flex items-center gap-2">
              <DataExchangeToolbarActions
                entityKey="crm.account"
                activeSearch={search}
                onImportComplete={refresh}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refresh}
                className="h-8 px-2.5 text-xs border border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink gap-1.5"
              >
                <RefreshCw className="size-3.5 text-nx-ink-3" />
                <span>{t("crmAccounts.actions.refresh")}</span>
              </Button>
              {canCreateAccount && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-8 px-3 text-xs bg-nx-accent text-nx-on-fill font-medium hover:bg-nx-accent/90 gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>{t("crmAccounts.actions.create")}</span>
                </Button>
              )}
            </div>
          }
        />

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("crmAccounts.actions.error")}</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <GenericCrudView<CrmAccount>
          config={crudConfig}
          columns={columns}
          viewModel={viewModel}
          pagination={viewModel.pagination}
          emptyState={
            <EmptyState
              icon={Building2}
              title={t("crmAccounts.empty.title")}
              description={t("crmAccounts.empty.description")}
              action={
                canCreateAccount ? (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="h-8 px-3 text-xs bg-nx-accent text-nx-on-fill font-medium hover:bg-nx-accent/90 gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    <span>{t("crmAccounts.actions.create")}</span>
                  </Button>
                ) : undefined
              }
            />
          }
        />

        <CreateAccountDialog
          open={isCreateOpen}
          isSubmitting={isSubmitting}
          error={submitError}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateAccount}
          onLookupOrganizations={viewModel.lookupCandidateOrganizations}
        />
      </div>
    </CrmShell>
  );
}
