"use client";

/**
 * Custom Field Visibility Rules Administration Dialog (Wave 5 row 5.3)
 *
 * Allows administrators to view, create, edit, and delete data-driven visibility rules
 * that show/hide a custom field on forms depending on sibling field values.
 */
import * as React from "react";
import { AlertTriangle, Sliders } from "lucide-react";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { useI18n } from "@core/providers/i18n-provider";
import type { CustomField } from "../../domain/entities/CustomField";
import type { FieldVisibilityRuleAdmin } from "../../domain/entities/FieldInsight";
import { FieldVisibilityRuleEditor } from "./FieldVisibilityRuleEditor";
import { FieldVisibilityRuleList } from "./FieldVisibilityRuleList";

export interface FieldVisibilityRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldId: string;
  fieldLabel: string;
  fieldKey: string;
  isRequired: boolean;

  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  rules: readonly FieldVisibilityRuleAdmin[];
  isRulesLoading: boolean;
  isRulesError: boolean;
  rulesErrorMessage?: string | null;
  onRetryRules: () => void;

  siblingFields: readonly CustomField[];
  isSiblingFieldsLoading: boolean;

  onCreateRule: (expressionJson: string, priority?: number) => Promise<boolean>;
  onUpdateRule: (id: string, expressionJson: string, priority?: number) => Promise<boolean>;
  onDeleteRule: (id: string) => Promise<boolean>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function FieldVisibilityRulesDialog({
  open,
  onOpenChange,
  fieldLabel,
  fieldKey,
  isRequired,
  canCreate,
  canUpdate,
  canDelete,
  rules,
  isRulesLoading,
  isRulesError,
  rulesErrorMessage,
  onRetryRules,
  siblingFields,
  isSiblingFieldsLoading,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  isCreating,
  isUpdating,
  isDeleting,
}: FieldVisibilityRulesDialogProps): React.ReactElement {
  const { t } = useI18n();

  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<FieldVisibilityRuleAdmin | null>(null);

  React.useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setIsEditorOpen(false);
        setEditingRule(null);
      });
    }
  }, [open]);

  const isBusy = isCreating || isUpdating || isDeleting;

  const handleOpenCreate = () => {
    setEditingRule(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (rule: FieldVisibilityRuleAdmin) => {
    setEditingRule(rule);
    setIsEditorOpen(true);
  };

  const handleCancelEditor = () => {
    setIsEditorOpen(false);
    setEditingRule(null);
  };

  const handleSaveRule = async (expressionJson: string, priority: number): Promise<boolean> => {
    if (editingRule) {
      const ok = await onUpdateRule(editingRule.id, expressionJson, priority);
      if (ok) {
        setIsEditorOpen(false);
        setEditingRule(null);
      }
      return ok;
    } else {
      const ok = await onCreateRule(expressionJson, priority);
      if (ok) {
        setIsEditorOpen(false);
      }
      return ok;
    }
  };

  const handleDelete = async (id: string) => {
    await onDeleteRule(id);
  };

  const body = (() => {
    if (isRequired) {
      return (
        <Alert variant="warning" className="my-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("customField.visibilityRules.requiredFieldTitle")}</AlertTitle>
          <AlertDescription>
            {t("customField.visibilityRules.requiredFieldDescription")}
          </AlertDescription>
        </Alert>
      );
    }

    if (isRulesLoading) {
      return (
        <div className="space-y-3" data-testid="visibility-rules-loading">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }

    if (isRulesError) {
      return (
        <ErrorMessage
          size="sm"
          message={rulesErrorMessage || t("customField.visibilityRules.loadFailed")}
          onRetry={onRetryRules}
        />
      );
    }

    return (
      <div className="space-y-4">
        <FieldVisibilityRuleList
          rules={rules}
          siblingFields={siblingFields}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
          isBusy={isBusy}
          isEditorOpen={isEditorOpen}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onDelete={handleDelete}
        />

        {isEditorOpen && (
          <FieldVisibilityRuleEditor
            key={editingRule ? editingRule.id : "new-rule"}
            editingRule={editingRule}
            siblingFields={siblingFields}
            isSiblingFieldsLoading={isSiblingFieldsLoading}
            isBusy={isBusy}
            onCancel={handleCancelEditor}
            onSave={handleSaveRule}
          />
        )}
      </div>
    );
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("customField.visibilityRules.title", { field: fieldLabel || fieldKey })}
          </DialogTitle>
          <DialogDescription>
            {t("customField.visibilityRules.description")}
          </DialogDescription>
        </DialogHeader>

        {body}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
