"use client";

/**
 * Custom Field Visibility Rules Administration Dialog (Wave 5 row 5.3)
 *
 * Allows administrators to view, create, edit, and delete data-driven visibility rules
 * that show/hide a custom field on forms depending on sibling field values.
 */
import * as React from "react";
import {
  AlertTriangle,
  Code,
  Eye,
  EyeOff,
  Plus,
  Sliders,
  Trash2,
  Pencil,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
import type { CustomField } from "../../domain/entities/CustomField";
import type { FieldVisibilityRuleAdmin } from "../../domain/entities/FieldInsight";
import {
  FIELD_VISIBILITY_OPERATORS,
  type FieldVisibilityOperator,
} from "../../../../custom-field-value/src/domain/fieldVisibility";
import {
  buildFieldVisibilityExpressionJson,
  parseFieldVisibilityExpressionJson,
} from "../viewmodels/useFieldVisibilityRulesViewModel";

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
  canView,
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
  const { t, language } = useI18n();

  // Form state for creating or editing a rule
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editingRuleId, setEditingRuleId] = React.useState<string | null>(null);
  const [selectedOperandKey, setSelectedOperandKey] = React.useState<string>("");
  const [selectedOperator, setSelectedOperator] = React.useState<FieldVisibilityOperator>("equals");
  const [valueInput, setValueInput] = React.useState<string>("");
  const [priorityInput, setPriorityInput] = React.useState<number>(0);
  const [isAdvancedJson, setIsAdvancedJson] = React.useState(false);
  const [rawJsonInput, setRawJsonInput] = React.useState<string>("");
  const [formError, setFormError] = React.useState<string | null>(null);

  // Reset editor when dialog opens or closes
  React.useEffect(() => {
    if (!open) {
      setIsEditorOpen(false);
      setEditingRuleId(null);
      setSelectedOperandKey("");
      setSelectedOperator("equals");
      setValueInput("");
      setPriorityInput(0);
      setIsAdvancedJson(false);
      setRawJsonInput("");
      setFormError(null);
    }
  }, [open]);

  const isBusy = isCreating || isUpdating || isDeleting;

  const handleOpenCreate = () => {
    setEditingRuleId(null);
    setSelectedOperandKey(siblingFields.length > 0 ? siblingFields[0].key : "");
    setSelectedOperator("equals");
    setValueInput("");
    setPriorityInput(0);
    setIsAdvancedJson(false);
    setRawJsonInput(
      buildFieldVisibilityExpressionJson({
        operandFieldKey: siblingFields.length > 0 ? siblingFields[0].key : "",
        operator: "equals",
        value: "",
      })
    );
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (rule: FieldVisibilityRuleAdmin) => {
    setEditingRuleId(rule.id);
    setPriorityInput(rule.priority);
    setFormError(null);

    const parsed = parseFieldVisibilityExpressionJson(rule.expressionJson);
    if (parsed) {
      setSelectedOperandKey(parsed.operandFieldKey);
      setSelectedOperator(parsed.operator as FieldVisibilityOperator);
      setValueInput(
        Array.isArray(parsed.value)
          ? parsed.value.join(", ")
          : parsed.value !== undefined && parsed.value !== null
            ? String(parsed.value)
            : ""
      );
      setIsAdvancedJson(false);
    } else {
      setIsAdvancedJson(true);
    }
    setRawJsonInput(rule.expressionJson);
    setIsEditorOpen(true);
  };

  const handleCancelEditor = () => {
    setIsEditorOpen(false);
    setEditingRuleId(null);
    setFormError(null);
  };

  const handleSaveRule = async () => {
    setFormError(null);

    let expressionJsonToSubmit: string;

    if (isAdvancedJson) {
      if (!rawJsonInput.trim()) {
        setFormError(t("customField.visibilityRules.validation.jsonRequired"));
        return;
      }
      try {
        JSON.parse(rawJsonInput);
        expressionJsonToSubmit = rawJsonInput;
      } catch {
        setFormError(t("customField.visibilityRules.validation.invalidJson"));
        return;
      }
    } else {
      if (!selectedOperandKey) {
        setFormError(t("customField.visibilityRules.validation.operandRequired"));
        return;
      }

      let parsedValue: unknown = undefined;
      const isZeroArity = selectedOperator === "isEmpty" || selectedOperator === "isNotEmpty";
      const isListArity = selectedOperator === "in" || selectedOperator === "notIn";

      if (!isZeroArity) {
        if (!valueInput.trim()) {
          setFormError(t("customField.visibilityRules.validation.valueRequired"));
          return;
        }

        if (isListArity) {
          parsedValue = valueInput
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
          if ((parsedValue as string[]).length === 0) {
            setFormError(t("customField.visibilityRules.validation.listValueRequired"));
            return;
          }
        } else if (selectedOperator === "greaterThan" || selectedOperator === "lessThan") {
          const num = Number(valueInput);
          parsedValue = !isNaN(num) && valueInput.trim() !== "" ? num : valueInput.trim();
        } else {
          parsedValue = valueInput.trim();
        }
      }

      expressionJsonToSubmit = buildFieldVisibilityExpressionJson({
        operandFieldKey: selectedOperandKey,
        operator: selectedOperator,
        value: parsedValue,
      });
    }

    if (editingRuleId) {
      const ok = await onUpdateRule(editingRuleId, expressionJsonToSubmit, priorityInput);
      if (ok) setIsEditorOpen(false);
    } else {
      const ok = await onCreateRule(expressionJsonToSubmit, priorityInput);
      if (ok) setIsEditorOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    await onDeleteRule(id);
  };

  const getOperandLabel = (operandKey: string | null | undefined): string => {
    if (!operandKey) return "—";
    const sibling = siblingFields.find((f) => f.key === operandKey);
    if (!sibling) return operandKey;
    const label = language === "ar" && sibling.labelAr ? sibling.labelAr : sibling.labelEn;
    return `${label || sibling.key} (${sibling.key})`;
  };

  const getOperatorLabel = (operator: string | null | undefined): string => {
    if (!operator) return "—";
    const key = `customField.visibilityRules.operators.${operator}`;
    const translated = t(key);
    return translated !== key ? translated : operator;
  };

  const renderRuleSummary = (rule: FieldVisibilityRuleAdmin) => {
    if (rule.isUnreadable) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="destructive">{t("customField.visibilityRules.unreadableBadge")}</Badge>
          <span className="text-xs text-destructive">
            {t("customField.visibilityRules.unreadableDescription")}
          </span>
        </div>
      );
    }

    const parsed = parseFieldVisibilityExpressionJson(rule.expressionJson);
    const operandDisplay = getOperandLabel(rule.operandFieldKey || parsed?.operandFieldKey);
    const operatorDisplay = getOperatorLabel(rule.operator || parsed?.operator);
    const val = parsed?.value;
    const valDisplay = Array.isArray(val)
      ? `[${val.join(", ")}]`
      : val !== undefined && val !== null
        ? String(val)
        : null;

    return (
      <div className="flex flex-wrap items-center gap-1.5 text-sm text-nx-ink">
        <span className="font-medium text-nx-ink-2">{t("customField.visibilityRules.visibleWhen")}</span>
        <Badge variant="outline" className="font-mono text-xs">
          {operandDisplay}
        </Badge>
        <span className="font-semibold text-primary">{operatorDisplay}</span>
        {valDisplay !== null && (
          <Badge variant="secondary" className="font-mono text-xs">
            {valDisplay}
          </Badge>
        )}
      </div>
    );
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
        {/* Rules Count & Monotone Logic Note */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            <span className="text-sm font-medium text-nx-ink-2">
              {t("customField.visibilityRules.rulesCount", { count: rules.length })}
            </span>
          </div>

          {!isEditorOpen && canCreate && rules.length < 10 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleOpenCreate}
              disabled={isBusy}
            >
              <Plus className="me-1 h-3.5 w-3.5" />
              {t("customField.visibilityRules.addRule")}
            </Button>
          )}
        </div>

        {rules.length > 1 && (
          <div className="flex items-start gap-2 rounded-md bg-nx-raised p-2.5 text-xs text-nx-ink-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span>{t("customField.visibilityRules.andLogicNote")}</span>
          </div>
        )}

        {/* Existing Rules List */}
        {rules.length === 0 && !isEditorOpen ? (
          <EmptyState
            bare
            size="sm"
            icon={Eye}
            title={t("customField.visibilityRules.noRulesTitle")}
            description={t("customField.visibilityRules.noRulesDescription")}
          />
        ) : (
          <div className="space-y-2.5">
            {rules.map((rule, idx) => (
              <div
                key={rule.id || idx}
                className="flex items-center justify-between rounded-md border border-nx-line bg-card p-3 shadow-sm transition-colors hover:border-nx-line-strong"
              >
                <div className="space-y-1">
                  {renderRuleSummary(rule)}
                  <div className="flex items-center gap-2 text-xs text-nx-ink-4">
                    <span>
                      {t("customField.visibilityRules.priority")}: {rule.priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {canUpdate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-nx-ink-3 hover:text-nx-ink"
                      onClick={() => handleOpenEdit(rule)}
                      disabled={isBusy}
                      title={t("common.edit")}
                      aria-label={t("common.edit")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(rule.id)}
                      disabled={isBusy}
                      title={t("common.delete")}
                      aria-label={t("common.delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline Add / Edit Rule Form */}
        {isEditorOpen && (
          <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-between border-b border-primary/20 pb-2">
              <h4 className="text-sm font-semibold text-nx-ink">
                {editingRuleId
                  ? t("customField.visibilityRules.editRuleTitle")
                  : t("customField.visibilityRules.addRuleTitle")}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-nx-ink-3"
                onClick={() => setIsAdvancedJson(!isAdvancedJson)}
              >
                <Code className="me-1 h-3 w-3" />
                {isAdvancedJson
                  ? t("customField.visibilityRules.formMode")
                  : t("customField.visibilityRules.advancedJson")}
              </Button>
            </div>

            {formError && (
              <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                {formError}
              </div>
            )}

            {isAdvancedJson ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-nx-ink-2">
                  {t("customField.visibilityRules.rawJsonPayload")}
                </label>
                <textarea
                  className="h-32 w-full rounded-md border border-nx-line bg-background p-2 font-mono text-xs text-nx-ink focus:outline-none focus:ring-1 focus:ring-primary"
                  value={rawJsonInput}
                  onChange={(e) => setRawJsonInput(e.target.value)}
                  placeholder='{ "version": 1, "visibleWhen": { ... } }'
                  disabled={isBusy}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Sibling Field Selector */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-nx-ink-2">
                    {t("customField.visibilityRules.operandFieldLabel")}
                  </label>
                  {isSiblingFieldsLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : siblingFields.length === 0 ? (
                    <p className="text-xs text-nx-ink-4">
                      {t("customField.visibilityRules.noSiblingFields")}
                    </p>
                  ) : (
                    <Select
                      value={selectedOperandKey}
                      onValueChange={setSelectedOperandKey}
                      disabled={isBusy}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={t("customField.visibilityRules.selectOperandPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {siblingFields.map((field) => (
                          <SelectItem key={field.id} value={field.key}>
                            {language === "ar" && field.labelAr
                              ? `${field.labelAr} (${field.key})`
                              : `${field.labelEn || field.key} (${field.key})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Operator Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-nx-ink-2">
                    {t("customField.visibilityRules.operatorLabel")}
                  </label>
                  <Select
                    value={selectedOperator}
                    onValueChange={(val) => setSelectedOperator(val as FieldVisibilityOperator)}
                    disabled={isBusy}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_VISIBILITY_OPERATORS.map((op) => (
                        <SelectItem key={op} value={op}>
                          {getOperatorLabel(op)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Comparand Value Input */}
                {selectedOperator !== "isEmpty" && selectedOperator !== "isNotEmpty" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-nx-ink-2">
                      {t("customField.visibilityRules.valueLabel")}
                    </label>
                    <Input
                      type="text"
                      className="h-9 text-xs"
                      value={valueInput}
                      onChange={(e) => setValueInput(e.target.value)}
                      placeholder={
                        selectedOperator === "in" || selectedOperator === "notIn"
                          ? t("customField.visibilityRules.listValuePlaceholder")
                          : t("customField.visibilityRules.valuePlaceholder")
                      }
                      disabled={isBusy}
                    />
                    {(selectedOperator === "in" || selectedOperator === "notIn") && (
                      <p className="text-[11px] text-nx-ink-4">
                        {t("customField.visibilityRules.listValueHelp")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center pt-6 text-xs text-nx-ink-3">
                    {t("customField.visibilityRules.noValueNeeded")}
                  </div>
                )}

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-nx-ink-2">
                    {t("customField.visibilityRules.priorityLabel")}
                  </label>
                  <Input
                    type="number"
                    className="h-9 text-xs"
                    value={priorityInput}
                    onChange={(e) => setPriorityInput(parseInt(e.target.value, 10) || 0)}
                    disabled={isBusy}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelEditor}
                disabled={isBusy}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveRule}
                disabled={isBusy}
              >
                {editingRuleId ? t("common.save") : t("customField.visibilityRules.saveRule")}
              </Button>
            </div>
          </div>
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
