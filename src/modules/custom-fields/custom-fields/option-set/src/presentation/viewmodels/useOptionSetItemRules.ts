/**
 * Hook providing option set item validation and payload conversion utilities.
 */
"use client";

import { useCallback } from "react";
import {
  collectOptionSetItemIssues,
  optionSetItemIssueMessageKey,
  toOptionSetItemInputs,
  type OptionSetItemRuleRow,
  type OptionSetItemIssue,
  type OptionSetItemIssueCode,
} from "../form/optionSetItemRules";

/**
 * Documentation for module export
 */
export function useOptionSetItemRules() {
  const validate = useCallback((rows: readonly OptionSetItemRuleRow[]): OptionSetItemIssue[] => {
    return collectOptionSetItemIssues(rows);
  }, []);

  const toPayload = useCallback((rows: readonly OptionSetItemRuleRow[]) => {
    return toOptionSetItemInputs(rows);
  }, []);

  const getMessageKey = useCallback((code: OptionSetItemIssueCode): string => {
    return optionSetItemIssueMessageKey(code);
  }, []);

  return {
    validate,
    toPayload,
    getMessageKey,
    collectOptionSetItemIssues,
    toOptionSetItemInputs,
    optionSetItemIssueMessageKey,
  };
}

export * from "../form/optionSetItemRules";
