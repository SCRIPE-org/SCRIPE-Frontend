"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { AlertCircle, RefreshCw, Plus, Search, Building2 } from "lucide-react";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader } from "@modules/crm";
import { AccountsTable } from "../components/AccountsTable";
import { CreateAccountDialog } from "../components/CreateAccountDialog";
import { useAccountsViewModel } from "../viewmodels/useAccountsViewModel";

export function AccountsView() {
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

  const tiers = [
    { key: undefined, label: t("crmAccounts.filters.allTiers") || "All Tiers" },
    { key: "Enterprise", label: "Enterprise" },
    { key: "KeyAccount", label: "Key Account" },
    { key: "Strategic", label: "Strategic" },
    { key: "Standard", label: "Standard" },
  ];

  return (
    <CrmShell activeTab="accounts" onTabChange={() => {}}>
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
        {/* Section Header */}
        <CrmSectionHeader
          title={t("crmAccounts.header.title") || "Commercial Accounts 360"}
          subtitle={
            t("crmAccounts.header.subtitle") ||
            "Single source of truth for commercial accounts, active opportunities, and stakeholder contacts."
          }
          badge={`${state.totalCount} ${t("crmAccounts.header.accountsBadge") || "Accounts"}`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={state.stage === "loading"}
                className="h-8 text-xs border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-surfaceSubtle"
              >
                <RefreshCw
                  className={`size-3.5 ${state.stage === "loading" ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">{t("common.refresh") || "Refresh"}</span>
              </Button>

              {canCreateAccount && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-8 text-xs gap-1.5 bg-nx-accent-fill text-nx-on-fill font-bold hover:brightness-105"
                >
                  <Plus className="size-3.5" />
                  <span>{t("crmAccounts.actions.newAccount") || "New Account"}</span>
                </Button>
              )}
            </div>
          }
        />

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-nx-surface p-3 rounded-nx-lg border border-nx-line">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3" />
            <Input
              type="text"
              placeholder={t("crmAccounts.searchPlaceholder") || "Search accounts by name or tier..."}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs bg-nx-ground border-nx-line text-nx-ink"
            />
          </div>

          {/* Tier Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {tiers.map((tier) => {
              const isSelected = tierFilter === tier.key;
              return (
                <Button
                  key={tier.label}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTierFilterChange(tier.key)}
                  className={`h-7 px-2.5 text-xs rounded-nx-md shrink-0 border transition-all ${
                    isSelected
                      ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                      : "border-nx-line bg-nx-surfaceSubtle/50 text-nx-ink-2 hover:bg-nx-surfaceSubtle"
                  }`}
                >
                  {tier.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        {state.stage === "loading" && state.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" className="text-nx-accent" />
            <p className="mt-3 text-xs text-nx-ink-3">
              {t("crmAccounts.loading") || "Loading commercial accounts..."}
            </p>
          </div>
        ) : state.stage === "failed" ? (
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("common.error") || "Error"}</AlertTitle>
            <AlertDescription className="text-xs">{state.error}</AlertDescription>
          </Alert>
        ) : (
          <AccountsTable accounts={state.items} />
        )}

        {/* Create Dialog */}
        <CreateAccountDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateAccount}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      </div>
    </CrmShell>
  );
}
