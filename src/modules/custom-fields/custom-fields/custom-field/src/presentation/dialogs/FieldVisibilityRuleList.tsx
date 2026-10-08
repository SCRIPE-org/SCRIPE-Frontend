"use client";

import * as React from "react";
import { Eye, Info, Pencil, Plus, Sliders, Trash2 } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { useI18n } from "@core/providers/i18n-provider";
import type { CustomField } from "../../domain/entities/CustomField";
import type { FieldVisibilityRuleAdmin } from "../../domain/entities/FieldInsight";
import { parseFieldVisibilityExpressionJson } from "../viewmodels/useFieldVisibilityRulesViewModel";

/**
 * Documentation for module export
 */
export interface FieldVisibilityRuleListProps {
  rules: readonly FieldVisibilityRuleAdmin[];
  siblingFields: readonly CustomField[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isBusy: boolean;
  isEditorOpen: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (rule: FieldVisibilityRuleAdmin) => void;
  onDelete: (id: string) => void;
}

/**
 * Documentation for FieldVisibilityRuleList
 */
export function FieldVisibilityRuleList({
  rules,
  siblingFields,
  canCreate,
  canUpdate,
  canDelete,
  isBusy,
  isEditorOpen,
  onOpenCreate,
  onOpenEdit,
  onDelete,
}: FieldVisibilityRuleListProps): React.ReactElement {
  const { t, language } = useI18n();

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

  return (
    <>
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
            onClick={onOpenCreate}
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
                    onClick={() => onOpenEdit(rule)}
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
                    onClick={() => onDelete(rule.id)}
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
    </>
  );
}
