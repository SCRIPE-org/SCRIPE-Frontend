"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { CrmShell, CrmSectionHeader, CRM_TAB_ROUTES } from "@modules/crm";
import type { CrmTabId } from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { DataExchangeToolbarActions } from "@core/data-exchange";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { RefreshCw, Plus, Search, Activity, CalendarClock, Eye, Building2 } from "lucide-react";
import { cn } from "@core/common/utils";
import { useActivitiesExecutionDeskViewModel } from "../viewmodels/useActivitiesExecutionDeskViewModel";
import { useActivitiesCrudColumns } from "../viewmodels/useActivitiesCrudColumns";
import { ActivityCardGridItem } from "../components/ActivityCardGridItem";
import { ActivitySplitDetail } from "../components/ActivitySplitDetail";
import { CreateActivityModal } from "../components/CreateActivityModal";
import { CreateFollowUpModal } from "../components/CreateFollowUpModal";
import type { CrmActivity, SalesActivityKind } from "../../domain/entities/CrmActivityEntity";

const ACTIVITY_KIND_OPTIONS: Array<{ key: SalesActivityKind | "ALL"; labelKey: string }> = [
  { key: "ALL", labelKey: "crmActivities.filters.allKinds" },
  { key: "Note", labelKey: "crmActivities.kinds.Note" },
  { key: "CallLog", labelKey: "crmActivities.kinds.CallLog" },
  { key: "MeetingLog", labelKey: "crmActivities.kinds.MeetingLog" },
  { key: "FollowUpLinked", labelKey: "crmActivities.kinds.FollowUpLinked" },
  { key: "CommunicationSent", labelKey: "crmActivities.kinds.CommunicationSent" },
];

/**
 * CRM Activities Execution Desk view for logging sales engagements,
 * scheduling linked follow-up tasks, and reviewing account timelines.
 */
export function ActivitiesExecutionDeskView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const viewModel = useActivitiesExecutionDeskViewModel(language);

  const {
    accounts,
    accountsMap,
    selectedAccountId,
    selectedAccountName,
    selectAccountId,
    search,
    activityKindFilter,
    handleSearchChange,
    handleActivityKindFilterChange,
    isCreateOpen,
    setIsCreateOpen,
    isFollowUpOpen,
    setIsFollowUpOpen,
    selectedActivityForFollowUp,
    openFollowUpForActivity,
    openHeaderFollowUp,
    isSubmitting,
    submitError,
    handleCreateActivity,
    handleCreateFollowUp,
    refresh,
  } = viewModel;

  const handleTabChange = (tab: CrmTabId) => {
    const route = CRM_TAB_ROUTES[tab];
    if (route) router.push(route);
  };

  const columns = useActivitiesCrudColumns(language, t, accountsMap);

  const crudConfig: CrudConfig<CrmActivity> = {
    titleKey: "crmActivities.executionDesk.title",
    subtitleKey: "crmActivities.executionDesk.description",
    resource: "crm.activities",
    entityTypeKey: "crm.activity",
    dataExchange: { entityKey: "crm.activity", hideToolbarActions: true },
    hidePageHeader: true,
    hideActionButtons: true,
    stickyActions: true,
    searchConfig: { enabled: false },
    viewSwitchPosition: "toolbar",
    viewModes: ["Table", "CardGrid", "SplitPane"],
    defaultView: "Table",
    permissions: {
      canView: true,
      canCreate: true,
      canUpdate: false,
      canDelete: false,
    },
    toolbarContent: (
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 flex-1" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
            <Input
              type="text"
              placeholder={t("crmActivities.executionDesk.searchPlaceholder")}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8 ps-8 pe-3 text-xs bg-nx-surface border-nx-line text-nx-ink"
            />
          </div>

          <div className="w-full sm:w-60">
            <Select value={selectedAccountId} onValueChange={selectAccountId}>
              <SelectTrigger className="h-8 text-xs bg-nx-surface border-nx-line text-nx-ink">
                <Building2 className="size-3.5 text-nx-accent shrink-0 me-1.5" />
                <SelectValue placeholder={t("crmActivities.executionDesk.selectAccount")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("crmActivities.filters.allAccounts")}</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {isRtl && acc.nameAr ? acc.nameAr : acc.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {ACTIVITY_KIND_OPTIONS.map((opt) => {
            const isSelected = activityKindFilter === opt.key;
            return (
              <Button
                key={opt.key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleActivityKindFilterChange(opt.key)}
                className={cn(
                  "h-7 px-2.5 text-xs rounded-nx-md shrink-0 transition-all",
                  isSelected
                    ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                    : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
                )}
              >
                {t(opt.labelKey)}
              </Button>
            );
          })}
        </div>
      </div>
    ),
    columns,
    getActions: (_vm, tFn): CrudAction<CrmActivity>[] => [
      {
        label: tFn("crmActivities.actions.scheduleFollowUp") || "Schedule Follow-Up",
        icon: <CalendarClock className="size-3.5" />,
        show: (a: CrmActivity) => !a.workItemStatus,
        onClick: (a: CrmActivity) => openFollowUpForActivity(a),
      },
      {
        label: tFn("crmActivities.actions.viewAccount360") || "View Account 360",
        icon: <Eye className="size-3.5" />,
        show: (a: CrmActivity) => Boolean(a.accountId),
        onClick: (a: CrmActivity) => router.push(`/crm/accounts/${a.accountId}`),
      },
    ],
    renderCardGridItem: (activity: CrmActivity, actions: React.ReactNode) => (
      <ActivityCardGridItem
        activity={activity}
        actions={actions}
        language={language}
        accountsMap={accountsMap}
        onSelectAccount={(accId) => router.push(`/crm/accounts/${accId}`)}
        onScheduleFollowUp={openFollowUpForActivity}
        t={t}
      />
    ),
    renderSplitDetail: (activity: CrmActivity, actions: React.ReactNode) => (
      <ActivitySplitDetail
        activity={activity}
        actions={actions}
        language={language}
        accountsMap={accountsMap}
        onSelectAccount={(accId) => router.push(`/crm/accounts/${accId}`)}
        onScheduleFollowUp={openFollowUpForActivity}
        t={t}
      />
    ),
  };

  return (
    <CrmShell activeTab="activities" onTabChange={handleTabChange}>
      <div className="space-y-4" dir={isRtl ? "rtl" : "ltr"}>
        <CrmSectionHeader
          title={t("crmActivities.executionDesk.title")}
          subtitle={t("crmActivities.executionDesk.description")}
          actions={
            <div className="flex items-center gap-2">
              <DataExchangeToolbarActions
                entityKey="crm.activity"
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
                <span>{t("crmActivities.actions.refresh")}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openHeaderFollowUp}
                className="h-8 px-3 text-xs border border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink gap-1.5"
              >
                <CalendarClock className="size-3.5 text-nx-accent" />
                <span>{t("crmActivities.actions.scheduleFollowUp")}</span>
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="h-8 px-3 text-xs bg-nx-accent text-nx-on-fill font-medium hover:bg-nx-accent/90 gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>{t("crmActivities.actions.logActivity")}</span>
              </Button>
            </div>
          }
        />

        <GenericCrudView<CrmActivity>
          config={crudConfig}
          columns={columns}
          viewModel={viewModel}
          pagination={viewModel.pagination}
          emptyState={
            <EmptyState
              icon={Activity}
              title={t("crmActivities.empty.title")}
              description={t("crmActivities.empty.description")}
              action={
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-8 px-3 text-xs bg-nx-accent text-nx-on-fill font-medium hover:bg-nx-accent/90 gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>{t("crmActivities.actions.logActivity")}</span>
                </Button>
              }
            />
          }
        />

        <CreateActivityModal
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateActivity}
          isSubmitting={isSubmitting}
          error={submitError}
          targetLabel={selectedAccountName}
        />

        <CreateFollowUpModal
          activity={selectedActivityForFollowUp}
          onClose={() => setIsFollowUpOpen(false)}
          onSubmit={handleCreateFollowUp}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      </div>
    </CrmShell>
  );
}
