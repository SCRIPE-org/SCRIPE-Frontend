/**
 * Container component orchestrating all modal dialogs and drawers for CustomFieldListView.
 *
 * Encapsulates the 7 lifecycle and governance dialogs:
 * 1. Detail inspection dialog
 * 2. Audit history dialog
 * 3. Impact analysis & delete confirmation dialog
 * 4. Option set binding dialog
 * 5. Data-driven visibility rules dialog
 * 6. Value-type conversion & rollback dialog
 * 7. Definition version history & drafts drawer
 */
"use client";

import React from "react";
import type { CustomField } from "../../../domain/entities/CustomField";
import { CustomFieldDetailDialog } from "../../dialogs/CustomFieldDetailDialog";
import { FieldHistoryDialog } from "../../dialogs/FieldHistoryDialog";
import { FieldImpactDialog } from "../../dialogs/FieldImpactDialog";
import { OptionSetBindingDialog } from "../../dialogs/OptionSetBindingDialog";
import { FieldVisibilityRulesDialog } from "../../dialogs/FieldVisibilityRulesDialog";
import { ConvertValueTypeDialog } from "../../dialogs/ConvertValueTypeDialog";
import { FieldVersionHistoryDrawer } from "../../dialogs/FieldVersionHistoryDrawer";
import type { useFieldInsightViewModel } from "../../viewmodels/useFieldInsightViewModel";
import type { useOptionSetBindingViewModel } from "../../viewmodels/useOptionSetBindingViewModel";
import type { useFieldVisibilityRulesViewModel } from "../../viewmodels/useFieldVisibilityRulesViewModel";
import type { useConvertValueTypeViewModel } from "../../viewmodels/useConvertValueTypeViewModel";
import type { useFieldVersionsViewModel } from "../../viewmodels/useFieldVersionsViewModel";
import type { useCustomFieldViewModel } from "../../viewmodels/useCustomFieldViewModel";

export interface CustomFieldDialogsContainerProps {
  detailFieldId: string | null;
  closeDetail: () => void;
  insightFieldLabel: (fieldId: string | null) => string;
  canUpdate: boolean;
  isPlatformContext: boolean;
  vm: ReturnType<typeof useCustomFieldViewModel>["vm"];
  insight: ReturnType<typeof useFieldInsightViewModel>;
  optionSetBinding: ReturnType<typeof useOptionSetBindingViewModel>;
  visibilityRules: ReturnType<typeof useFieldVisibilityRulesViewModel>;
  convertValueType: ReturnType<typeof useConvertValueTypeViewModel>;
  fieldVersions: ReturnType<typeof useFieldVersionsViewModel>;
}

export const CustomFieldDialogsContainer = React.memo(function CustomFieldDialogsContainer({
  detailFieldId,
  closeDetail,
  insightFieldLabel,
  canUpdate,
  isPlatformContext,
  vm,
  insight,
  optionSetBinding,
  visibilityRules,
  convertValueType,
  fieldVersions,
}: CustomFieldDialogsContainerProps) {
  const items = vm.items as CustomField[] | undefined;

  return (
    <>
      <CustomFieldDetailDialog
        open={detailFieldId !== null}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
        fieldId={detailFieldId}
        fieldLabel={insightFieldLabel(detailFieldId)}
        canEdit={
          canUpdate &&
          (isPlatformContext ||
            (detailFieldId
              ? !items?.find((item) => item.id === detailFieldId)?.isGlobal
              : false))
        }
        onEdit={(field) => vm.openEditModal(field)}
      />

      <FieldHistoryDialog
        open={insight.historyFieldId !== null}
        onOpenChange={(open) => {
          if (!open) insight.closeHistory();
        }}
        fieldLabel={insightFieldLabel(insight.historyFieldId)}
        history={insight.history}
        isLoading={insight.isHistoryLoading}
        isError={insight.isHistoryError}
        errorMessage={insight.historyErrorMessage}
        page={insight.historyPage}
        onPageChange={insight.setHistoryPage}
      />

      <FieldImpactDialog
        open={insight.usageFieldId !== null}
        onOpenChange={(open) => {
          if (!open) insight.closeUsage();
        }}
        fieldLabel={insightFieldLabel(insight.usageFieldId)}
        usage={insight.usage}
        isLoading={insight.isUsageLoading}
        isError={insight.isUsageError}
        onConfirmDelete={
          insight.isConfirmingDelete && insight.usageFieldId !== null
            ? async () => {
                await insight.confirmDelete(insight.usageFieldId!);
                await vm.refreshItems();
              }
            : undefined
        }
      />

      {optionSetBinding.target && (
        <OptionSetBindingDialog
          open
          onOpenChange={(open) => {
            if (!open) optionSetBinding.closeBinding();
          }}
          fieldLabel={optionSetBinding.target.fieldLabel}
          canBind={optionSetBinding.canBind}
          bindableSets={optionSetBinding.bindableSets}
          isSetsLoading={optionSetBinding.isSetsLoading}
          isSetsError={optionSetBinding.isSetsError}
          onRetrySets={optionSetBinding.refetchSets}
          isVersionLoading={optionSetBinding.isVersionLoading}
          isVersionError={optionSetBinding.isVersionError}
          onRetryVersion={optionSetBinding.refetchVersion}
          hasActiveVersion={optionSetBinding.hasActiveVersion}
          boundSet={optionSetBinding.boundSet}
          onAttach={optionSetBinding.attach}
          onDetach={optionSetBinding.unbind}
          isAttaching={optionSetBinding.isAttaching}
          isDetaching={optionSetBinding.isUnbinding}
        />
      )}

      {visibilityRules.target && (
        <FieldVisibilityRulesDialog
          open
          onOpenChange={(open) => {
            if (!open) visibilityRules.closeRules();
          }}
          fieldId={visibilityRules.target.fieldId}
          fieldLabel={visibilityRules.target.fieldLabel}
          fieldKey={visibilityRules.target.fieldKey}
          isRequired={visibilityRules.target.isRequired}
          canView={visibilityRules.canView}
          canCreate={visibilityRules.canCreate}
          canUpdate={visibilityRules.canUpdate}
          canDelete={visibilityRules.canDelete}
          rules={visibilityRules.rules}
          isRulesLoading={visibilityRules.isRulesLoading}
          isRulesError={visibilityRules.isRulesError}
          rulesErrorMessage={visibilityRules.rulesErrorMessage}
          onRetryRules={visibilityRules.refetchRules}
          siblingFields={visibilityRules.siblingFields}
          isSiblingFieldsLoading={visibilityRules.isSiblingFieldsLoading}
          onCreateRule={visibilityRules.createRule}
          onUpdateRule={visibilityRules.updateRule}
          onDeleteRule={visibilityRules.deleteRule}
          isCreating={visibilityRules.isCreating}
          isUpdating={visibilityRules.isUpdating}
          isDeleting={visibilityRules.isDeleting}
        />
      )}

      {convertValueType.target && (
        <ConvertValueTypeDialog
          open
          onOpenChange={(open) => {
            if (!open) convertValueType.closeConvert();
          }}
          fieldId={convertValueType.target.fieldId}
          fieldLabel={convertValueType.target.fieldLabel}
          fieldKey={convertValueType.target.fieldKey}
          currentType={convertValueType.target.currentType}
          availableTargetTypes={convertValueType.availableTargetTypes}
          selectedTargetType={convertValueType.selectedTargetType}
          onSelectTargetType={convertValueType.setSelectedTargetType}
          confirmDataLoss={convertValueType.confirmDataLoss}
          onConfirmDataLossChange={convertValueType.setConfirmDataLoss}
          conversionKind={convertValueType.conversionKind}
          isLossy={convertValueType.isLossy}
          canExecute={convertValueType.canExecute}
          canUpdate={convertValueType.canUpdate}
          isConverting={convertValueType.isConverting}
          onExecuteConvert={convertValueType.executeConvert}
          lastResult={convertValueType.lastResult}
          isRollingBack={convertValueType.isRollingBack}
          onExecuteRollback={convertValueType.executeRollback}
          lastRollbackResult={convertValueType.lastRollbackResult}
        />
      )}

      {fieldVersions.target && (
        <FieldVersionHistoryDrawer
          isOpen={fieldVersions.isOpen}
          onClose={fieldVersions.closeVersions}
          target={fieldVersions.target}
          versionsData={fieldVersions.versionsData}
          isLoading={fieldVersions.isLoading}
          isCreatingDraft={fieldVersions.isCreatingDraft}
          isPublishing={fieldVersions.isPublishing}
          isDiscarding={fieldVersions.isDiscarding}
          canPublish={fieldVersions.canPublish}
          isPlatformContext={isPlatformContext}
          onCreateDraft={fieldVersions.handleCreateDraft}
          onPublish={fieldVersions.handlePublish}
          onDiscard={fieldVersions.handleDiscard}
        />
      )}
    </>
  );
});
