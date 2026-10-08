"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import type { CustomField } from "../../domain/entities/CustomField";
import type { FieldVisibilityRuleAdmin } from "../../domain/entities/FieldInsight";
import {
  type FieldVisibilityOperator,
} from "../../../../custom-field-value/src/domain/fieldVisibility";
import {
  buildFieldVisibilityExpressionJson,
  parseFieldVisibilityExpressionJson,
} from "../viewmodels/useFieldVisibilityRulesViewModel";

/**
 * Documentation for module export
 */
export interface UseFieldVisibilityRuleEditorStateProps {
  editingRule: FieldVisibilityRuleAdmin | null;
  siblingFields: readonly CustomField[];
  onSave: (expressionJson: string, priority: number) => Promise<boolean>;
}

/**
 * State and validation manager for editing field visibility rules.
 * Handles switching between structured form inputs and advanced JSON mode.
 */
export function useFieldVisibilityRuleEditorState({
  editingRule,
  siblingFields,
  onSave,
}: UseFieldVisibilityRuleEditorStateProps) {
  const { t } = useI18n();

  const [selectedOperandKey, setSelectedOperandKey] = React.useState<string>(() => {
    if (editingRule) {
      const parsed = parseFieldVisibilityExpressionJson(editingRule.expressionJson);
      return parsed?.operandFieldKey || "";
    }
    return siblingFields.length > 0 ? siblingFields[0].key : "";
  });

  const [selectedOperator, setSelectedOperator] = React.useState<FieldVisibilityOperator>(() => {
    if (editingRule) {
      const parsed = parseFieldVisibilityExpressionJson(editingRule.expressionJson);
      return (parsed?.operator as FieldVisibilityOperator) || "equals";
    }
    return "equals";
  });

  const [valueInput, setValueInput] = React.useState<string>(() => {
    if (editingRule) {
      const parsed = parseFieldVisibilityExpressionJson(editingRule.expressionJson);
      if (parsed) {
        return Array.isArray(parsed.value)
          ? parsed.value.join(", ")
          : parsed.value !== undefined && parsed.value !== null
            ? String(parsed.value)
            : "";
      }
    }
    return "";
  });

  const [priorityInput, setPriorityInput] = React.useState<number>(() => {
    return editingRule ? editingRule.priority : 0;
  });

  const [isAdvancedJson, setIsAdvancedJson] = React.useState<boolean>(() => {
    if (editingRule) {
      return parseFieldVisibilityExpressionJson(editingRule.expressionJson) === null;
    }
    return false;
  });

  const [rawJsonInput, setRawJsonInput] = React.useState<string>(() => {
    if (editingRule) {
      return editingRule.expressionJson;
    }
    return buildFieldVisibilityExpressionJson({
      operandFieldKey: siblingFields.length > 0 ? siblingFields[0].key : "",
      operator: "equals",
      value: "",
    });
  });

  const [formError, setFormError] = React.useState<string | null>(null);

  const getOperatorLabel = React.useCallback(
    (operator: string | null | undefined): string => {
      if (!operator) return "—";
      const key = `customField.visibilityRules.operators.${operator}`;
      const translated = t(key);
      return translated !== key ? translated : operator;
    },
    [t]
  );

  const handleSave = async () => {
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

    await onSave(expressionJsonToSubmit, priorityInput);
  };

  return {
    selectedOperandKey,
    setSelectedOperandKey,
    selectedOperator,
    setSelectedOperator,
    valueInput,
    setValueInput,
    priorityInput,
    setPriorityInput,
    isAdvancedJson,
    setIsAdvancedJson,
    rawJsonInput,
    setRawJsonInput,
    formError,
    getOperatorLabel,
    handleSave,
  };
}
