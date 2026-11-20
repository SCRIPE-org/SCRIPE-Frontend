"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { CrmShell, CrmSectionHeader, CRM_TAB_ROUTES, CRM_PERMISSIONS } from "@modules/crm";
import type { CrmTabId } from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { Plus, Activity, CalendarClock, Eye, CheckCircle2 } from "lucide-react";
import { useActivitiesExecutionDeskViewModel } from "../viewmodels/useActivitiesExecutionDeskViewModel";
import { useActivitiesCrudColumns } from "../viewmodels/useActivitiesCrudColumns";
import { ActivitiesToolbar } from "../components/ActivitiesToolbar";
import { ActivitiesDeskHeaderActions } from "../components/ActivitiesDeskHeaderActions";
import { ActivityCardGridItem } from "../components/ActivityCardGridItem";
import { ActivitySplitDetail } from "../components/ActivitySplitDetail";
import { CreateActivityModal } from "../components/CreateActivityModal";
import { CreateFollowUpModal } from "../components/CreateFollowUpModal";
import { isActivityWorkItemDone } from "../utils/activitiesFilteringHelpers";
import type { CrmActivity } from "../../domain/entities/CrmActivityEntity";

/** CRM Activities Execution Desk view (<200 lines). */
export function ActivitiesExecutionDeskView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateActivity = usePermission(CRM_PERMISSIONS.ACTIVITIES_CREATE);
  const canFollowUp = usePermission(CRM_PERMISSIONS.ACTIVITIES_FOLLOWUP);
  const viewModel = useActivitiesExecutionDeskViewModel(language);

  const {
    accounts, accountsMap, selectedAccountId, selectedAccountName, selectAccountId,
    search, activityKindFilter, dueFilter, handleDueFilterChange,
    contactFilterId, contactDisplayName, clearContactFilter,
    completedActivityIds, handleCompleteActivity, handleSearchChange, handleActivityKindFilterChange,
    isCreateOpen, setIsCreateOpen, selectedActivityForFollowUp, closeFollowUpModal,
    openFollowUpForActivity, openHeaderFollowUp, isSubmitting, submitError,
    handleCreateActivity, handleCreateFollowUp, refresh,
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
    permissions: { canView: CRM_PERMISSIONS.ACTIVITIES_READ, canCreate: CRM_PERMISSIONS.ACTIVITIES_CREATE, canUpdate: false, canDelete: false },
    toolbarContent: (
      <ActivitiesToolbar
        isRtl={isRtl} search={search} onSearchChange={handleSearchChange} accounts={accounts}
        selectedAccountId={selectedAccountId} onSelectAccountId={selectAccountId}
        activityKindFilter={activityKindFilter} onActivityKindFilterChange={handleActivityKindFilterChange}
        dueFilter={dueFilter} onDueFilterChange={handleDueFilterChange}
        contactFilterId={contactFilterId} contactDisplayName={contactDisplayName} onClearContactFilter={clearContactFilter} t={t}
      />
    ),
    columns,
    getActions: (_vm, tFn): CrudAction<CrmActivity>[] => [
      {
        label: tFn("crmActivities.actions.markDone"),
        icon: <CheckCircle2 className="size-3.5" />,
        show: (a: CrmActivity) => canFollowUp && Boolean(a.workItemStatus) && !isActivityWorkItemDone(a.workItemStatus) && !completedActivityIds[a.activityId],
        onClick: (a: CrmActivity) => void handleCompleteActivity(a),
      },
      {
        label: tFn("crmActivities.actions.reschedule"),
        icon: <CalendarClock className="size-3.5" />,
        show: (a: CrmActivity) => canFollowUp && Boolean(a.workItemStatus),
        onClick: (a: CrmActivity) => openFollowUpForActivity(a),
      },
      {
        label: tFn("crmActivities.actions.scheduleFollowUp"),
        icon: <CalendarClock className="size-3.5" />,
        show: (a: CrmActivity) => canFollowUp && !a.workItemStatus,
        onClick: (a: CrmActivity) => openFollowUpForActivity(a),
      },
      {
        label: tFn("crmActivities.actions.viewAccount360"),
        icon: <Eye className="size-3.5" />,
        show: (a: CrmActivity) => Boolean(a.accountId),
        onClick: (a: CrmActivity) => router.push(`/crm/accounts/${a.accountId}`),
      },
    ],
    renderCardGridItem: (activity: CrmActivity, actions: React.ReactNode) => (
      <ActivityCardGridItem activity={activity} actions={actions} language={language} accountsMap={accountsMap} onSelectAccount={(accId) => router.push(`/crm/accounts/${accId}`)} onScheduleFollowUp={openFollowUpForActivity} t={t} />
    ),
    renderSplitDetail: (activity: CrmActivity, actions: React.ReactNode) => (
      <ActivitySplitDetail activity={activity} actions={actions} language={language} accountsMap={accountsMap} onSelectAccount={(accId) => router.push(`/crm/accounts/${accId}`)} onScheduleFollowUp={openFollowUpForActivity} t={t} />
    ),
  };

  return (
    <CrmShell activeTab="activities" onTabChange={handleTabChange}>
      <div className="space-y-4" dir={isRtl ? "rtl" : "ltr"}>
        <CrmSectionHeader
          title={t("crmActivities.executionDesk.title")}
          subtitle={t("crmActivities.executionDesk.description")}
          actions={
            <ActivitiesDeskHeaderActions
              t={t} search={search} onRefresh={refresh} canFollowUp={canFollowUp}
              onScheduleFollowUp={openHeaderFollowUp} canCreateActivity={canCreateActivity} onOpenCreate={() => setIsCreateOpen(true)}
            />
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
                canCreateActivity ? (
                  <Button type="button" variant="default" size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 px-3 text-xs font-semibold gap-1.5">
                    <Plus className="size-3.5" />
                    <span>{t("crmActivities.actions.logActivity")}</span>
                  </Button>
                ) : undefined
              }
            />
          }
        />

        <CreateActivityModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={handleCreateActivity} isSubmitting={isSubmitting} error={submitError} targetLabel={selectedAccountName} allowAccountSelect={selectedAccountId === "all"} initialAccountId={selectedAccountId !== "all" ? selectedAccountId : undefined} />
        <CreateFollowUpModal key={selectedActivityForFollowUp?.activityId ?? "closed"} activity={selectedActivityForFollowUp} onClose={closeFollowUpModal} onSubmit={handleCreateFollowUp} isSubmitting={isSubmitting} error={submitError} />
      </div>
    </CrmShell>
  );
}
