"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  AlertCircle,
  RefreshCw,
  Plus,
  Search,
  Briefcase,
} from "lucide-react";
import { cn } from "@core/common/utils";

import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader } from "@modules/crm";
import { OpportunitiesTable } from "../components/OpportunitiesTable";
import { CreateOpportunityDialog } from "../components/CreateOpportunityDialog";
import { MoveStageDialog } from "../components/MoveStageDialog";
import { CloseOpportunityDialog } from "../components/CloseOpportunityDialog";
import { ReopenOpportunityDialog } from "../components/ReopenOpportunityDialog";
import { AssignOwnerDialog } from "../components/AssignOwnerDialog";
import { useOpportunitiesViewModel } from "../viewmodels/useOpportunitiesViewModel";
import type { CrmOpportunity, OpportunityStatus } from "../../domain/entities/OpportunityEntity";

/**
 * Main opportunities list view supporting search, filters, pagination, and deal transitions.
 */
export function OpportunitiesView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CREATE);

  const viewModel = useOpportunitiesViewModel();
  const {
    state,
    search,
    stageFilter,
    statusFilter,
    isCreateOpen,
    isMoveStageOpen,
    isCloseOpen,
    isReopenOpen,
    isAssignOwnerOpen,
    activeOpportunity,
    closeInitialOutcome,
    isSubmitting,
    submitError,
    setIsCreateOpen,
    setIsMoveStageOpen,
    setIsCloseOpen,
    setIsReopenOpen,
    setIsAssignOwnerOpen,
    handleSearchChange,
    handleStageFilterChange,
    handleStatusFilterChange,
    handleCreateOpportunity,
    handleMoveStage,
    handleCloseOpportunity,
    handleReopenOpportunity,
    handleAssignOwner,
    openMoveStageDialog,
    openCloseDialog,
    openReopenDialog,
    openAssignOwnerDialog,
    refresh,
  } = viewModel;

  const stages = [
    { key: undefined, label: t("crmOpportunities.actions.allStages") },
    { key: "default.discovery", label: t("crmOpportunities.stages.discovery") },
    { key: "default.qualification", label: t("crmOpportunities.stages.qualification") },
    { key: "default.solution_fit", label: t("crmOpportunities.stages.solution_fit") },
    { key: "default.proposal", label: t("crmOpportunities.stages.proposal") },
    { key: "default.negotiation", label: t("crmOpportunities.stages.negotiation") },
  ];

  const statuses: { key: OpportunityStatus | undefined; label: string }[] = [
    { key: undefined, label: t("crmOpportunities.actions.allStatuses") },
    { key: "Open", label: t("crmOpportunities.status.open") },
    { key: "Won", label: t("crmOpportunities.status.won") },
    { key: "Lost", label: t("crmOpportunities.status.lost") },
  ];

  const handleSelectOpportunity = (opp: CrmOpportunity) => {
    router.push(`/crm/opportunities/${opp.id}`);
  };

  return (
    <CrmShell
      activeTab="deals"
      onTabChange={(tab) => {
        if (tab === "overview") router.push("/crm");
        else if (tab === "leads") router.push("/crm/leads");
      }}
      searchQuery={search}
      onSearchChange={handleSearchChange}
      onCreateDeal={canCreateOpp ? () => setIsCreateOpen(true) : undefined}
    >
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
        {/* Section Header */}
        <CrmSectionHeader
          title={t("crmOpportunities.title")}
          subtitle={t("crmOpportunities.subtitle")}
          badge={`${state.totalCount} deals`}
          actions={
            canCreateOpp ? (
              <Button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="gap-2 shrink-0 font-bold"
              >
                <Plus className="size-4" />
                {t("crmOpportunities.actions.newDeal")}
              </Button>
            ) : undefined
          }
        />

        {/* Filters and Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-nx-surface p-3 rounded-nx-lg border border-nx-line">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-nx-ink-3 pointer-events-none" />
              <Input
                placeholder={t("crmOpportunities.actions.searchPlaceholder")}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="ps-9 h-9 text-xs"
              />
            </div>

            <div className="w-40">
              <Select
                value={stageFilter || "all"}
                onValueChange={(val) => handleStageFilterChange(val === "all" ? undefined : val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={t("crmOpportunities.actions.filterByStage")} />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stg) => (
                    <SelectItem key={stg.key || "all"} value={stg.key || "all"}>
                      {stg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select
                value={statusFilter || "all"}
                onValueChange={(val) =>
                  handleStatusFilterChange(val === "all" ? undefined : (val as OpportunityStatus))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={t("crmOpportunities.actions.filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((st) => (
                    <SelectItem key={st.key || "all"} value={st.key || "all"}>
                      {st.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={state.stage === "loading"}
              className="h-9 gap-1.5 text-xs"
            >
              <RefreshCw
                className={cn("size-3.5", state.stage === "loading" && "animate-spin")}
              />
              <span className="hidden sm:inline">{t("crmOpportunities.actions.refresh")}</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {state.stage === "loading" && state.items.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-nx-lg border border-nx-line bg-nx-surface">
            <LoadingSpinner size="lg" />
          </div>
        ) : state.stage === "failed" && state.items.length === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error Loading Opportunities</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{state.error}</span>
              <Button type="button" variant="outline" size="sm" onClick={refresh} className="ml-4">
                {t("crmOpportunities.actions.refresh")}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <OpportunitiesTable
            opportunities={state.items}
            onMoveStage={openMoveStageDialog}
            onCloseWon={(opp) => openCloseDialog(opp, "Won")}
            onCloseLost={(opp) => openCloseDialog(opp, "Lost")}
            onReopen={openReopenDialog}
            onAssignOwner={openAssignOwnerDialog}
            onSelectOpportunity={handleSelectOpportunity}
          />
        )}

        {/* Modals & Lifecycle Dialogs */}
        <CreateOpportunityDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateOpportunity}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />

        <MoveStageDialog
          open={isMoveStageOpen}
          onOpenChange={setIsMoveStageOpen}
          opportunity={activeOpportunity}
          onSubmit={handleMoveStage}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />

        <CloseOpportunityDialog
          open={isCloseOpen}
          onOpenChange={setIsCloseOpen}
          opportunity={activeOpportunity}
          initialOutcome={closeInitialOutcome}
          onSubmit={handleCloseOpportunity}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />

        <ReopenOpportunityDialog
          open={isReopenOpen}
          onOpenChange={setIsReopenOpen}
          opportunity={activeOpportunity}
          onSubmit={handleReopenOpportunity}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />

        <AssignOwnerDialog
          open={isAssignOwnerOpen}
          onOpenChange={setIsAssignOwnerOpen}
          opportunity={activeOpportunity}
          onSubmit={handleAssignOwner}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>
    </CrmShell>
  );
}
