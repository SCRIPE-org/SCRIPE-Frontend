"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { CrmShell, CRM_TAB_ROUTES, type CrmTabId } from "@modules/crm";
import { usePipelineStudioViewModel } from "../viewmodels/usePipelineStudioViewModel";
import { CrmWorkflowsDirectorySection } from "../components/workflow/CrmWorkflowsDirectorySection";
import { CrmWorkflowFullscreenStudio } from "../components/workflow/CrmWorkflowFullscreenStudio";
import { CrmWorkflowStudioDialogs } from "../components/workflow/CrmWorkflowStudioDialogs";
import { PipelineStudioSkeleton } from "../components/workflow/PipelineStudioSkeleton";

export interface PipelineManagementViewProps {
  defaultOpenStudio?: boolean;
}

export function PipelineManagementView({
  defaultOpenStudio = false,
}: PipelineManagementViewProps = {}) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const vm = usePipelineStudioViewModel(defaultOpenStudio);

  const handleTabChange = (tab: CrmTabId) => {
    const route = CRM_TAB_ROUTES[tab];
    if (route) router.push(route);
  };

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
      {!vm.isStudioOpen ? (
        <CrmShell activeTab="pipelines" onTabChange={handleTabChange}>
          <CrmWorkflowsDirectorySection
            t={t}
            isAr={isAr}
            workflows={vm.workflows}
            activeDealWorkflowId={vm.activeDealWorkflowId}
            activeLeadWorkflowId={vm.activeLeadWorkflowId}
            directoryFilter={vm.directoryFilter}
            setDirectoryFilter={vm.setDirectoryFilter}
            directorySearch={vm.directorySearch}
            setDirectorySearch={vm.setDirectorySearch}
            filteredDirectoryWorkflows={vm.filteredDirectoryWorkflows}
            onOpenCreateWorkflow={(type) => {
              vm.setNewWfEntityType(type);
              vm.setCreateWorkflowModalOpen(true);
            }}
            onOpenStudioForWorkflow={vm.openStudioForWorkflow}
            onCloneWorkflow={vm.handleCloneWorkflow}
            onActivateWorkflow={vm.handleActivateWorkflow}
            onDeleteWorkflow={vm.handleDeleteWorkflow}
          />
        </CrmShell>
      ) : (
        <CrmWorkflowFullscreenStudio
          t={t}
          isAr={isAr}
          workflows={vm.workflows}
          selectedWorkflow={vm.selectedWorkflow}
          selectedWorkflowId={vm.selectedWorkflowId}
          activeEntity={vm.activeEntity}
          viewMode={vm.viewMode}
          setViewMode={vm.setViewMode}
          zoom={vm.zoom}
          setZoom={vm.setZoom}
          activeStages={vm.activeStages}
          transitions={vm.transitions}
          selectedStage={vm.selectedStage}
          selectedTransition={vm.selectedTransition}
          selectedStageKey={vm.selectedStageKey}
          selectedTransitionId={vm.selectedTransitionId}
          setSelectedStageKey={vm.setSelectedStageKey}
          setSelectedTransitionId={vm.setSelectedTransitionId}
          hasChanges={vm.hasChanges}
          validationBanner={vm.validationBanner}
          setValidationBanner={vm.setValidationBanner}
          crmCustomFields={vm.crmCustomFields}
          openRuleCatalogSignal={vm.openRuleCatalogSignal}
          onSelectWorkflow={vm.openStudioForWorkflow}
          onSwitchEntity={vm.handleSwitchEntity}
          onBackToList={() => vm.setIsStudioOpen(false)}
          onResetDraft={vm.handleResetDraft}
          onSave={vm.handleSave}
          onValidateRules={vm.handleValidateRules}
          onOpenAddStage={() => vm.setAddStageModalOpen(true)}
          onOpenAddTransition={vm.openAddTransitionWithPreselect}
          onOpenRuleForStage={vm.handleOpenRuleForStage}
          onNodeMove={vm.handleNodeMove}
          onStageChange={vm.handleStageChange}
          onToggleAllowAnyTransition={vm.handleToggleAllowAnyTransition}
          onMoveOrder={vm.handleMoveStageOrder}
          onRemoveStage={vm.handleRemoveStage}
          onReplaceStage={vm.handleReplaceStage}
          onTransitionChange={vm.handleTransitionChange}
          onDeleteTransition={vm.handleDeleteTransition}
          onCreateTransition={vm.openAddTransitionWithPreselect}
          onAddCrmCustomField={vm.addCrmCustomField}
          onApplyLayoutPositions={vm.handleApplyLayoutPositions}
          canUndo={vm.canUndo}
          canRedo={vm.canRedo}
          onUndo={vm.handleUndo}
          onRedo={vm.handleRedo}
        />
      )}

      <CrmWorkflowStudioDialogs
        t={t}
        isAr={isAr}
        activeEntity={vm.activeEntity}
        activeStages={vm.activeStages}
        addStageModalOpen={vm.addStageModalOpen}
        setAddStageModalOpen={vm.setAddStageModalOpen}
        newStageNameEn={vm.newStageNameEn}
        setNewStageNameEn={vm.setNewStageNameEn}
        newStageNameAr={vm.newStageNameAr}
        setNewStageNameAr={vm.setNewStageNameAr}
        newStageProb={vm.newStageProb}
        setNewStageProb={vm.setNewStageProb}
        newStageSla={vm.newStageSla}
        setNewStageSla={vm.setNewStageSla}
        newStageConvertsLead={vm.newStageConvertsLead}
        setNewStageConvertsLead={vm.setNewStageConvertsLead}
        newStageAutoConnect={vm.newStageAutoConnect}
        setNewStageAutoConnect={vm.setNewStageAutoConnect}
        newStageAllowFromAny={vm.newStageAllowFromAny}
        setNewStageAllowFromAny={vm.setNewStageAllowFromAny}
        onAddStageSubmit={vm.handleAddStageSubmit}
        addTransitionModalOpen={vm.addTransitionModalOpen}
        setAddTransitionModalOpen={vm.setAddTransitionModalOpen}
        newTransFrom={vm.newTransFrom}
        setNewTransFrom={vm.setNewTransFrom}
        newTransTo={vm.newTransTo}
        setNewTransTo={vm.setNewTransTo}
        newTransNameEn={vm.newTransNameEn}
        setNewTransNameEn={vm.setNewTransNameEn}
        newTransNameAr={vm.newTransNameAr}
        setNewTransNameAr={vm.setNewTransNameAr}
        onAddTransitionSubmit={vm.handleAddTransitionSubmit}
        createWorkflowModalOpen={vm.createWorkflowModalOpen}
        setCreateWorkflowModalOpen={vm.setCreateWorkflowModalOpen}
        newWfEntityType={vm.newWfEntityType}
        setNewWfEntityType={vm.setNewWfEntityType}
        newWfNameEn={vm.newWfNameEn}
        setNewWfNameEn={vm.setNewWfNameEn}
        newWfNameAr={vm.newWfNameAr}
        setNewWfNameAr={vm.setNewWfNameAr}
        newWfDescEn={vm.newWfDescEn}
        setNewWfDescEn={vm.setNewWfDescEn}
        newWfDescAr={vm.newWfDescAr}
        setNewWfDescAr={vm.setNewWfDescAr}
        onCreateWorkflowSubmit={vm.handleCreateWorkflowSubmit}
      />
    </div>
  );
}
