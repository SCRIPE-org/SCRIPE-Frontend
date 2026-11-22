"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { AlertCircle, RefreshCw, Plus } from "lucide-react";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader, useCrmCurrency, useCrmClientPrefsStore } from "@modules/crm/shared";
import { useCrmWorkflowsStore, CrmWorkflowTransitionDialog, type EvaluatedWorkflowTransition } from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { DropEvaluationResult } from "@core/crud/components/generic-crud-view";
import { DataExchangeToolbarActions } from "@core/data-exchange";
import { CreateLeadDialog } from "../components/CreateLeadDialog";
import { QualifyLeadDialog } from "../components/QualifyLeadDialog";
import { LinkPartyDialog } from "../components/LinkPartyDialog";
import { ConvertLeadDialog } from "../components/ConvertLeadDialog";
import { AssignLeadOwnerDialog } from "../components/AssignLeadOwnerDialog";
import { stageToLeadStatusValue } from "../components/LeadsKanbanCardItem";
import { useLeadsViewModel } from "../viewmodels/useLeadsViewModel";
import { useLeadsCrudConfig } from "../viewmodels/useLeadsCrudConfig";
import { buildLeadTransitionRecord, evaluateLeadStageTransition } from "../utils/leadTransitionHelpers";
import type { CrmLead, LeadStatus } from "../../domain/entities/LeadEntity";

/** Primary CRM Leads & Qualification workspace view (<200 lines). */
export function LeadsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoOpenCreate = searchParams?.get("create") === "1";
  const autoOpenedCreateRef = useRef(false);
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateLead = usePermission(CRM_PERMISSIONS.LEADS_CREATE);
  const canAssignOwner = usePermission(CRM_PERMISSIONS.RECORDS_ASSIGN);
  const { baseCurrency, autoConvertToBase, convertAmount, showOriginalCurrencyBadge } = useCrmCurrency();
  const activeLeadWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("lead"));
  const workflows = useCrmWorkflowsStore((s) => s.workflows);
  const activeLeadWorkflowId = useCrmWorkflowsStore((s) => s.activeLeadWorkflowId);
  const setActiveWorkflow = useCrmWorkflowsStore((s) => s.setActiveWorkflow);
  const leadWorkflows = workflows.filter((w) => w.entityType === "lead");
  const defaultDealViewMode = useCrmClientPrefsStore((s) => s.defaultDealViewMode);
  const viewModel = useLeadsViewModel();
  const {
    state, search, statusFilter, isCreateOpen, isQualifyOpen, isLinkPartyOpen, isConvertOpen, isAssignOwnerOpen,
    activeLead, isSubmitting, submitError, setIsCreateOpen, setIsQualifyOpen, setIsLinkPartyOpen, setIsConvertOpen, setIsAssignOwnerOpen,
    handleSearchChange, handleStatusFilterChange, handleCreateLead, handleQualifyLead, handleLinkParty,
    handleConvertLead, handleAssignLeadOwner, linkPartyBeforeConvert,
    openQualifyDialog, openLinkPartyDialog, openConvertDialog, openAssignOwnerDialog, handleUpdateLeadStatus,
    handleTransitionSubmit, refresh, setSubmitError, clearError,
  } = viewModel;

  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [transitionLead, setTransitionLead] = useState<CrmLead | null>(null);
  const [transitionFromKey, setTransitionFromKey] = useState("");
  const [transitionToKey, setTransitionToKey] = useState("");
  const [transitionEvalResult, setTransitionEvalResult] = useState<EvaluatedWorkflowTransition | null>(null);

  useEffect(() => {
    if (shouldAutoOpenCreate && canCreateLead && !autoOpenedCreateRef.current) {
      autoOpenedCreateRef.current = true;
      setIsCreateOpen(true);
    }
  }, [shouldAutoOpenCreate, canCreateLead, setIsCreateOpen]);

  const handleLeadStageTransition = useCallback(
    async (lead: CrmLead, targetStageOrStatus: string, _dropEval?: DropEvaluationResult) => {
      const fromKey = lead.stageKey || `lead.${lead.status.toLowerCase()}`;
      const matchedTarget = activeLeadWorkflow.stages.find(
        (s) =>
          s.stageKey.toLowerCase() === targetStageOrStatus.toLowerCase() ||
          s.labelEn.toLowerCase() === targetStageOrStatus.toLowerCase() ||
          s.labelAr === targetStageOrStatus ||
          s.stageKey.toLowerCase().endsWith(`.${targetStageOrStatus.toLowerCase()}`)
      );
      const toKey = matchedTarget?.stageKey || (targetStageOrStatus.startsWith("lead.") ? targetStageOrStatus : `lead.${targetStageOrStatus.toLowerCase()}`);
      const evalResult = evaluateLeadStageTransition(lead, fromKey, toKey, isRtl);

      if (evalResult.status === "blocked") {
        setSubmitError(evalResult.reason || t("crmLeads.detail.transitionBlockedTitle", { defaultValue: "Status Transition Blocked" }));
        return false;
      }
      if (evalResult.status === "allowed_screen_required") {
        setTransitionLead(lead);
        setTransitionFromKey(fromKey);
        setTransitionToKey(toKey);
        setTransitionEvalResult(evalResult);
        setTransitionDialogOpen(true);
        return false;
      }
      return handleUpdateLeadStatus(lead, targetStageOrStatus);
    },
    [activeLeadWorkflow, handleUpdateLeadStatus, setSubmitError, t, isRtl]
  );

  const sumLeadsInBaseCurrency = useCallback((items: CrmLead[]) => {
    const sum = items.reduce((acc, curr) => {
      if (!curr.estimatedValue) return acc;
      const fromCurr = (curr.currency || "SAR").toUpperCase();
      return acc + (autoConvertToBase ? convertAmount(curr.estimatedValue, fromCurr, baseCurrency) : curr.estimatedValue);
    }, 0);
    return sum > 0 ? `${baseCurrency} ${Math.round(sum).toLocaleString()}` : `${baseCurrency} 0`;
  }, [autoConvertToBase, baseCurrency, convertAmount]);

  const statuses: { key: LeadStatus | undefined; label: string }[] =
    activeLeadWorkflow.id === "wf-lead-default"
      ? [
          { key: undefined, label: t("crmLeads.actions.allStatuses") },
          { key: "New", label: t("crmLeads.status.new") },
          { key: "Working", label: t("crmLeads.status.working") },
          { key: "Qualified", label: t("crmLeads.status.qualified") },
          { key: "Converted", label: t("crmLeads.status.converted") },
          { key: "Disqualified", label: t("crmLeads.status.disqualified") },
        ]
      : [
          { key: undefined, label: t("crmLeads.actions.allStatuses") },
          ...[...activeLeadWorkflow.stages].sort((a, b) => a.sortOrder - b.sortOrder).map((stg) => ({
            key: stageToLeadStatusValue(stg.stageKey, stg.labelEn),
            label: isRtl && stg.labelAr ? stg.labelAr : stg.labelEn,
          })),
        ];

  const { crudConfig, columns } = useLeadsCrudConfig({
    router, t, language, baseCurrency, autoConvertToBase, convertAmount, showOriginalCurrencyBadge,
    activeLeadWorkflow, leadWorkflows, activeLeadWorkflowId, setActiveWorkflow, defaultDealViewMode,
    search, handleSearchChange, statusFilter, handleStatusFilterChange, statuses, sumLeadsInBaseCurrency,
    handleLeadStageTransition, handleUpdateLeadStatus, openQualifyDialog, openLinkPartyDialog, openConvertDialog, openAssignOwnerDialog, canAssignOwner, setIsCreateOpen,
  });

  const onTabNav = (tab: string) => {
    if (tab !== "leads") router.push(tab === "overview" ? "/crm" : tab === "deals" ? "/crm/opportunities" : `/crm/${tab}`);
  };
  const fromStage = activeLeadWorkflow?.stages.find((s) => s.stageKey === transitionFromKey);
  const toStage = activeLeadWorkflow?.stages.find((s) => s.stageKey === transitionToKey);

  return (
    <CrmShell activeTab="leads" onTabChange={onTabNav}>
      <CrmSectionHeader
        title={t("crmLeads.title")}
        subtitle={t("crmLeads.subtitle")}
        badge={`${state.totalCount} ${t("crm.tabs.leads")}`}
        actions={
          <div className="flex items-center gap-2">
            <DataExchangeToolbarActions entityKey="crm.lead" enableMultiSheetMigration activeSearch={search} onImportComplete={refresh} />
            <Button type="button" variant="outline" size="sm" onClick={refresh} className="h-8 gap-1.5 border-nx-line bg-nx-surface text-xs text-nx-ink hover:bg-nx-raised">
              <RefreshCw className="size-3.5 text-nx-ink-2" />
              <span>{t("crmLeads.actions.refresh")}</span>
            </Button>
            {canCreateLead && (
              <Button type="button" size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 gap-1.5 text-xs font-bold">
                <Plus className="size-3.5" />
                <span>{t("crmLeads.actions.newLead")}</span>
              </Button>
            )}
          </div>
        }
      />
      {state.stage === "failed" ? (
        <Alert variant="destructive" className="max-w-xl mx-auto my-6" dir={isRtl ? "rtl" : "ltr"}>
          <AlertCircle className="size-4" />
          <AlertTitle>{t("crmLeads.messages.loadFailed")}</AlertTitle>
          <AlertDescription className="mt-2 flex items-center justify-between">
            <span className="text-xs">{state.error}</span>
            <Button size="sm" variant="outline" onClick={refresh} className="text-xs h-7">{t("crm.errors.retry")}</Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {(state.error || submitError) && !isCreateOpen && !isQualifyOpen && !isLinkPartyOpen && !isConvertOpen && !isAssignOwnerOpen && (
            <Alert variant="destructive" data-testid="leads-transition-error-banner" className="mb-4" dir={isRtl ? "rtl" : "ltr"}>
              <AlertCircle className="size-4" />
              <AlertTitle>{t("crmLeads.detail.transitionBlockedTitle", { defaultValue: "Status Transition Blocked" })}</AlertTitle>
              <AlertDescription className="mt-1 flex items-center justify-between gap-3">
                <span className="text-xs">{state.error || submitError}</span>
                <Button type="button" size="sm" variant="outline" onClick={clearError} className="text-xs h-7 shrink-0">{t("crmLeads.detail.dismissBtn", { defaultValue: "Dismiss" })}</Button>
              </AlertDescription>
            </Alert>
          )}
          <GenericCrudView<CrmLead> config={crudConfig} columns={columns} viewModel={{ ...viewModel, error: null }} pagination={viewModel.pagination} />
        </>
      )}
      <CreateLeadDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={handleCreateLead} isSubmitting={isSubmitting} submitError={submitError} />
      <QualifyLeadDialog open={isQualifyOpen} onOpenChange={setIsQualifyOpen} lead={activeLead} initialDecision={viewModel.qualifyDefaultDecision} onSubmit={handleQualifyLead} isSubmitting={isSubmitting} submitError={submitError} />
      <LinkPartyDialog open={isLinkPartyOpen} onOpenChange={setIsLinkPartyOpen} lead={activeLead} onSubmit={handleLinkParty} isSubmitting={isSubmitting} submitError={submitError} />
      <ConvertLeadDialog open={isConvertOpen} onOpenChange={setIsConvertOpen} lead={activeLead} onLinkPartyBeforeConvert={linkPartyBeforeConvert} onSubmit={handleConvertLead} isSubmitting={isSubmitting} submitError={submitError} />
      <AssignLeadOwnerDialog open={isAssignOwnerOpen} onOpenChange={setIsAssignOwnerOpen} lead={activeLead} onSubmit={handleAssignLeadOwner} isSubmitting={isSubmitting} submitError={submitError} />
      <CrmWorkflowTransitionDialog open={transitionDialogOpen} onOpenChange={setTransitionDialogOpen} entityType="lead" record={transitionLead ? buildLeadTransitionRecord(transitionLead) : null} fromStageKey={transitionFromKey} toStageKey={transitionToKey} fromStageLabel={fromStage ? (isRtl && fromStage.labelAr ? fromStage.labelAr : fromStage.labelEn) : undefined} toStageLabel={toStage ? (isRtl && toStage.labelAr ? toStage.labelAr : toStage.labelEn) : undefined} evalResult={transitionEvalResult} onSubmit={handleTransitionSubmit} isSubmitting={isSubmitting} />
    </CrmShell>
  );
}
