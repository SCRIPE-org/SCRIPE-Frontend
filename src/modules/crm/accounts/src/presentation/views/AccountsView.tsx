"use client";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { AlertCircle, RefreshCw, Plus, Search, Building2, Users, Briefcase, Eye, Calendar, } from "lucide-react";
import { cn } from "@core/common/utils";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader } from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudColumn } from "@core/crud/components/generic-crud-view";
import { AccountStatusBadge } from "../components/AccountStatusBadge";
import { CreateAccountDialog } from "../components/CreateAccountDialog";
import { useAccountsViewModel } from "../viewmodels/useAccountsViewModel";
import type { CrmAccount } from "../../domain/entities/AccountEntity";
export function AccountsView() { const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateAccount = usePermission(CRM_PERMISSIONS.ACCOUNTS_CREATE);
  const viewModel = useAccountsViewModel();
  const { state,
    search, tierFilter,
    isCreateOpen, isSubmitting,
    submitError, setIsCreateOpen,
    handleSearchChange, handleTierFilterChange,
    handleCreateAccount, refresh,
  } = viewModel;
  const tiers = [
    { key: undefined, label: t("crmAccounts.filters.allTiers") },
    { key: "Enterprise", label: t("crmAccounts.tiers.Enterprise") },
    { key: "KeyAccount", label: t("crmAccounts.tiers.KeyAccount") },
    { key: "Strategic", label: t("crmAccounts.tiers.Strategic") },
    { key: "Standard", label: t("crmAccounts.tiers.Standard") },
  ];
  const columns: CrudColumn<CrmAccount>[] = [
      { key: "partyLegalNameEn",
        label: t("crmAccounts.table.account") || "Account / Organization", sortable: true,
        render: (_val, account: CrmAccount) => ( <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => router.push(`/crm/accounts/${account.id}`)}
          >
            <div className="size-7 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
              <Building2 className="size-3.5 text-nx-accent" />
            </div>
            <div>
              <span className="font-semibold text-nx-ink block hover:text-nx-accent transition-colors">
                {language === "ar" && account.partyLegalNameAr
                  ? account.partyLegalNameAr
                  : account.partyLegalNameEn}
              </span>
              {language !== "ar" && account.partyLegalNameAr && ( <span className="text-[11px] text-nx-ink-3 block font-arabic">
                  {account.partyLegalNameAr}
                </span> )}
              {account.commercialNotes && ( <span className="text-[11px] text-nx-ink-3 line-clamp-1 mt-0.5 max-w-xs">
                  {account.commercialNotes}
                </span> )}
            </div>
          </div> ),
      }, {
        key: "commercialTierCode", label: t("crmAccounts.table.tier") || "Commercial Tier",
        sortable: true, render: (_val, account: CrmAccount) => (
          <AccountStatusBadge tierCode={account.commercialTierCode} /> ),
      }, {
        key: "preferredCurrencyCode", label: t("crmAccounts.table.currency") || "Currency",
        render: (_val, account: CrmAccount) => ( <span className="text-nx-ink font-mono font-medium">
            {account.preferredCurrencyCode || "SAR"}
          </span> ),
      }, {
        key: "linkedContactsCount", label: t("crmAccounts.table.contacts") || "Contacts",
        sortable: true, render: (_val, account: CrmAccount) => (
          <Badge variant="outline"
            className="border-nx-line bg-nx-raised/60 text-nx-ink-2 gap-1 font-mono text-[11px]"
          >
            <Users className="size-3 text-nx-ink-3" />
            {account.linkedContactsCount}
          </Badge> ),
      }, {
        key: "activeOpportunitiesCount", label: t("crmAccounts.table.opportunities") || "Deals",
        sortable: true, render: (_val, account: CrmAccount) => (
          <Badge variant="outline"
            className="border-nx-line bg-nx-raised/60 text-nx-ink-2 gap-1 font-mono text-[11px]"
          >
            <Briefcase className="size-3 text-nx-ink-3" />
            {account.activeOpportunitiesCount}
          </Badge> ),
      }, {
        key: "createdAt", label: t("crmAccounts.table.createdAt") || "Created",
        sortable: true, render: (_val, account: CrmAccount) => {
          const formattedDate = account.createdAt
            ? new Date(account.createdAt).toLocaleDateString( language === "ar" ? "ar-SA" : "en-US",
                { month: "short",
                  day: "numeric", year: "numeric",
                } )
            : "—";
          return ( <div className="flex items-center gap-1 text-nx-ink-3 text-[11px]">
              <Calendar className="size-3 text-nx-ink-3" />
              {formattedDate}
            </div> );
        }, },
    ];
  const crudConfig: CrudConfig<CrmAccount> = ({ titleKey: "crmAccounts.header.title",
      subtitleKey: "crmAccounts.header.subtitle", resource: "crm.accounts",
      entityTypeKey: "crm.account",
      hidePageHeader: true, hideActionButtons: true,
      stickyActions: true, searchConfig: { enabled: false },
      viewSwitchPosition: "toolbar", viewModes: ["Table", "CardGrid", "SplitPane"],
      defaultView: "Table", permissions: {
        canView: CRM_PERMISSIONS.ACCOUNTS_READ, canCreate: CRM_PERMISSIONS.ACCOUNTS_CREATE,
        canUpdate: CRM_PERMISSIONS.ACCOUNTS_UPDATE, canDelete: false,
      }, toolbarContent: (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="relative w-full sm:w-72">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
            <Input type="text"
              placeholder={ t("crmAccounts.searchPlaceholder") || "Search accounts by name or tier..."
              }
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8 ps-8 pe-3 text-xs bg-nx-surface border-nx-line text-nx-ink" />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {tiers.map((tier) => { const isSelected = tierFilter === tier.key;
              return ( <Button
                  key={tier.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTierFilterChange(tier.key)}
                  className={cn( "h-7 px-2.5 text-xs rounded-nx-md shrink-0 transition-all",
                    isSelected
                      ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                      : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink" )}
                >
                  {tier.label}
                </Button> );
            })}
          </div>
        </div> ),
      columns, renderActions: (account: CrmAccount) => (
        <Button type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/crm/accounts/${account.id}`)}
          className="h-7 px-2.5 text-xs gap-1 border border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink"
        >
          <Eye className="size-3 text-nx-accent" />
          <span>{t("crmAccounts.actions.view360") || "View 360"}</span>
        </Button> ),
      renderCardGridItem: (account: CrmAccount, actions: React.ReactNode) => (
        <Card className="flex flex-col justify-between gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-all">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-sm text-nx-ink hover:text-nx-accent cursor-pointer line-clamp-1"
                onClick={() => router.push(`/crm/accounts/${account.id}`)}
              >
                {language === "ar" && account.partyLegalNameAr
                  ? account.partyLegalNameAr
                  : account.partyLegalNameEn}
              </span>
              <AccountStatusBadge tierCode={account.commercialTierCode} />
            </div>
            {account.commercialNotes && ( <p className="text-xs text-nx-ink-3 line-clamp-2">{account.commercialNotes}</p>
            )}
          </div>
          <div className="border-t border-nx-line pt-3 flex items-center justify-between">
            <span className="text-xs font-mono text-nx-ink-2">
              {account.preferredCurrencyCode || "SAR"}
            </span>
            {actions}
          </div>
        </Card> ),
      renderSplitDetail: (account: CrmAccount, actions: React.ReactNode) => (
        <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4">
          <div className="flex items-start justify-between border-b border-nx-line pb-4 gap-3">
            <div>
              <h3 className="text-base font-bold text-nx-ink">
                {language === "ar" && account.partyLegalNameAr
                  ? account.partyLegalNameAr
                  : account.partyLegalNameEn}
              </h3>
              <p className="text-xs text-nx-ink-3 font-mono mt-1">
                {account.preferredCurrencyCode || "SAR"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AccountStatusBadge tierCode={account.commercialTierCode} />
              {actions}
            </div>
          </div>
          {account.commercialNotes && ( <p className="text-xs text-nx-ink-2">{account.commercialNotes}</p>
          )}
        </Card> ),
      customTableProps: { onSearch: undefined,
        emptyMessage: ( <EmptyState
            title={t("crmAccounts.table.emptyTitle") || "No Accounts Found"}
            description={ t("crmAccounts.table.emptyDescription") ||
              "No commercial accounts match the current filter or search criteria." }
          /> ),
      }, onCreateClick: () => setIsCreateOpen(true),
    });
  return ( <CrmShell activeTab="accounts" onTabChange={() => {}}>
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
        {/* Section Header */}
        <CrmSectionHeader title={t("crmAccounts.header.title") || "Commercial Accounts 360"}
          subtitle={ t("crmAccounts.header.subtitle") ||
            "Single source of truth for commercial accounts, active opportunities, and stakeholder contacts." }
          badge={`${state.totalCount} ${t("crmAccounts.header.accountsBadge") || "Accounts"}`}
          actions={ <div className="flex items-center gap-2">
              <Button type="button"
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={state.stage === "loading"}
                className="h-8 text-xs border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
              >
                <RefreshCw className={cn("size-3.5", state.stage === "loading" && "animate-spin")}
                />
                <span className="hidden sm:inline">{t("common.refresh") || "Refresh"}</span>
              </Button>
              {canCreateAccount && ( <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-8 text-xs gap-1.5 font-bold"
                >
                  <Plus className="size-3.5" />
                  <span>{t("crmAccounts.actions.newAccount") || "New Account"}</span>
                </Button> )}
            </div> }
        />

        {/* Unified Customer 360 Directory Switcher: Companies (Accounts) <-> People (Contacts) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-nx-line bg-nx-surface px-3.5 py-2.5">
          <div className="inline-flex items-center rounded-lg border border-nx-line bg-nx-ground p-0.5 gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              data-testid="customer-dir-companies-tab"
              className="h-7 px-3 rounded-md text-xs font-bold bg-nx-surface text-foreground border border-nx-line-hi"
            >
              {t("crmAccounts.header.companiesTab")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              data-testid="customer-dir-people-tab"
              onClick={() => router.push("/crm/contacts")}
              className="h-7 px-3 rounded-md text-xs font-semibold text-nx-ink-2 hover:text-nx-ink"
            >
              {t("crmAccounts.header.peopleTab")}
            </Button>
          </div>
          <span className="text-[11px] text-nx-ink-3">
            {t("crmAccounts.header.directoryHint")}
          </span>
        </div>
        {/* Content Area */}
        {state.stage === "failed" ? ( <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("common.error") || "Error"}</AlertTitle>
            <AlertDescription className="text-xs">{state.error}</AlertDescription>
          </Alert> ) : (
          <GenericCrudView<CrmAccount>
            config={crudConfig}
            columns={columns}
            viewModel={viewModel}
            pagination={viewModel.pagination} />
        )}
        {/* Create Dialog */}
        <CreateAccountDialog open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateAccount}
          onLookupOrganizations={viewModel.lookupCandidateOrganizations}
          isSubmitting={isSubmitting}
          error={submitError} />
      </div>
    </CrmShell> );
}
