"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Card } from "@core/ui/card";
import { CrmShell, CRM_PERMISSIONS, CRM_TAB_ROUTES, type CrmTabId } from "@modules/crm";
import { usePipelineStudioViewModel } from "../viewmodels/usePipelineStudioViewModel";
import { CrmWorkflowsDirectorySection } from "../components/studio/CrmWorkflowsDirectorySection";
import { CrmWorkflowFullscreenStudio } from "../components/studio/CrmWorkflowFullscreenStudio";
import { CrmWorkflowStudioDialogs } from "../components/studio/CrmWorkflowStudioDialogs";
import { PipelineStudioSkeleton } from "../components/studio/PipelineStudioSkeleton";

/** Props for `PipelineManagementView`. */
export interface PipelineManagementViewProps {
  defaultOpenStudio?: boolean;
}

/**
 * Operational CRM Workflows Directory & Full-Screen 2D Studio entry view (<195 lines).
 */
export function PipelineManagementView({
  defaultOpenStudio = false,
}: PipelineManagementViewProps = {}) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const canReadPipelines = usePermission(CRM_PERMISSIONS.PIPELINES_READ);
  const canManagePipelines = usePermission(CRM_PERMISSIONS.PIPELINES_MANAGE);
  const vm = usePipelineStudioViewModel(defaultOpenStudio);

  const handleTabChange = (tab: CrmTabId) => {
    const route = CRM_TAB_ROUTES[tab];
    if (route) router.push(route);
  };

  if (!canReadPipelines && !canManagePipelines) {
    return (
      <CrmShell activeTab="pipelines" onTabChange={handleTabChange}>
        <Card className="p-6 border border-nx-line bg-nx-surface flex items-start gap-3" data-testid="pipelines-access-denied">
          <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h1 className="text-base font-bold text-nx-ink">{t("crm.errors.accessDenied")}</h1>
            <p className="text-xs text-nx-ink-2">{t("crmWorkflows.pipelinesPage.directorySubtitle")}</p>
          </div>
        </Card>
      </CrmShell>
    );
  }

  if (vm.isHydrating) {
    return (
      <CrmShell activeTab="pipelines" onTabChange={handleTabChange}>
        <div className="space-y-6 pb-8" data-testid="pipeline-management-page">
          <PipelineStudioSkeleton />
        </div>
      </CrmShell>
    );
  }

  return (
    <div className="space-y-6 pb-8" data-testid="pipeline-management-page">
      {vm.syncError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>{vm.syncError}</AlertDescription>
        </Alert>
      )}
      {!vm.isStudioOpen ? (
        <CrmShell activeTab="pipelines" onTabChange={handleTabChange}>
          <CrmWorkflowsDirectorySection
            t={t} isAr={isAr} workflows={vm.workflows} canManagePipelines={canManagePipelines}
            activeDealWorkflowId={vm.activeDealWorkflowId} activeLeadWorkflowId={vm.activeLeadWorkflowId}
            directoryFilter={vm.directoryFilter} setDirectoryFilter={vm.setDirectoryFilter}
            directorySearch={vm.directorySearch} setDirectorySearch={vm.setDirectorySearch}
            filteredDirectoryWorkflows={vm.filteredDirectoryWorkflows}
            onOpenCreateWorkflow={(type) => { vm.setNewWfEntityType(type); vm.setCreateWorkflowModalOpen(true); }}
            onOpenStudioForWorkflow={vm.openStudioForWorkflow}
            onCloneWorkflow={vm.handleCloneWorkflow}
            onActivateWorkflow={vm.handleActivateWorkflow}
            onDeleteWorkflow={vm.handleDeleteWorkflow}
          />
        </CrmShell>
      ) : (
        <CrmWorkflowFullscreenStudio
          t={t} isAr={isAr} canManagePipelines={canManagePipelines} workflows={vm.workflows} selectedWorkflow={vm.selectedWorkflow}
          selectedWorkflowId={vm.selectedWorkflowId} activeEntity={vm.activeEntity}
          viewMode={vm.viewMode} setViewMode={vm.setViewMode} zoom={vm.zoom} setZoom={vm.setZoom}
          activeStages={vm.activeStages} transitions={vm.transitions} selectedStage={vm.selectedStage}
          selectedTransition={vm.selectedTransition} selectedStageKey={vm.selectedStageKey}
          selectedTransitionId={vm.selectedTransitionId} setSelectedStageKey={vm.setSelectedStageKey}
          setSelectedTransitionId={vm.setSelectedTransitionId} hasChanges={vm.hasChanges}
          validationBanner={vm.validationBanner} setValidationBanner={vm.setValidationBanner}
          crmCustomFields={vm.crmCustomFields} openRuleCatalogSignal={vm.openRuleCatalogSignal}
          onSelectWorkflow={vm.openStudioForWorkflow} onSwitchEntity={vm.handleSwitchEntity}
          onBackToList={() => vm.setIsStudioOpen(false)} onResetDraft={vm.handleResetDraft}
          onSave={vm.handleSave} onValidateRules={vm.handleValidateRules}
          onImportWorkflowJson={vm.handleImportWorkflowJson}
          onOpenAddStage={() => vm.setAddStageModalOpen(true)}
          onOpenAddTransition={vm.openAddTransitionWithPreselect}
          onOpenRuleForStage={vm.handleOpenRuleForStage} onNodeMove={vm.handleNodeMove}
          onStageChange={vm.handleStageChange} onToggleAllowAnyTransition={vm.handleToggleAllowAnyTransition}
          onMoveOrder={vm.handleMoveStageOrder} onRemoveStage={vm.handleRemoveStage}
          onReplaceStage={vm.handleReplaceStage} onTransitionChange={vm.handleTransitionChange}
          onDeleteTransition={vm.handleDeleteTransition} onCreateTransition={vm.openAddTransitionWithPreselect}
          onAddCrmCustomField={vm.addCrmCustomField} onApplyLayoutPositions={vm.handleApplyLayoutPositions}
          canUndo={vm.canUndo} canRedo={vm.canRedo} onUndo={vm.handleUndo} onRedo={vm.handleRedo}
        />
      )}

      <CrmWorkflowStudioDialogs
        t={t} isAr={isAr} activeEntity={vm.activeEntity} activeStages={vm.activeStages}
        addStageModalOpen={vm.addStageModalOpen} setAddStageModalOpen={vm.setAddStageModalOpen}
        newStageNameEn={vm.newStageNameEn} setNewStageNameEn={vm.setNewStageNameEn}
        newStageNameAr={vm.newStageNameAr} setNewStageNameAr={vm.setNewStageNameAr}
        newStageProb={vm.newStageProb} setNewStageProb={vm.setNewStageProb}
        newStageSla={vm.newStageSla} setNewStageSla={vm.setNewStageSla}
        newStageColorToken={vm.newStageColorToken} setNewStageColorToken={vm.setNewStageColorToken}
        newStageCustomHex={vm.newStageCustomHex} setNewStageCustomHex={vm.setNewStageCustomHex}
        newStageConvertsLead={vm.newStageConvertsLead} setNewStageConvertsLead={vm.setNewStageConvertsLead}
        newStageAutoConnect={vm.newStageAutoConnect} setNewStageAutoConnect={vm.setNewStageAutoConnect}
        newStageAllowFromAny={vm.newStageAllowFromAny} setNewStageAllowFromAny={vm.setNewStageAllowFromAny}
        onAddStageSubmit={vm.handleAddStageSubmit}
        addTransitionModalOpen={vm.addTransitionModalOpen} setAddTransitionModalOpen={vm.setAddTransitionModalOpen}
        newTransFrom={vm.newTransFrom} setNewTransFrom={vm.setNewTransFrom}
        newTransTo={vm.newTransTo} setNewTransTo={vm.setNewTransTo}
        newTransNameEn={vm.newTransNameEn} setNewTransNameEn={vm.setNewTransNameEn}
        newTransNameAr={vm.newTransNameAr} setNewTransNameAr={vm.setNewTransNameAr}
        onAddTransitionSubmit={vm.handleAddTransitionSubmit}
        createWorkflowModalOpen={vm.createWorkflowModalOpen} setCreateWorkflowModalOpen={vm.setCreateWorkflowModalOpen}
        newWfEntityType={vm.newWfEntityType} setNewWfEntityType={vm.setNewWfEntityType}
        newWfNameEn={vm.newWfNameEn} setNewWfNameEn={vm.setNewWfNameEn}
        newWfNameAr={vm.newWfNameAr} setNewWfNameAr={vm.setNewWfNameAr}
        newWfDescEn={vm.newWfDescEn} setNewWfDescEn={vm.setNewWfDescEn}
        newWfDescAr={vm.newWfDescAr} setNewWfDescAr={vm.setNewWfDescAr}
        onCreateWorkflowSubmit={vm.handleCreateWorkflowSubmit}
      />
    </div>
  );
}
