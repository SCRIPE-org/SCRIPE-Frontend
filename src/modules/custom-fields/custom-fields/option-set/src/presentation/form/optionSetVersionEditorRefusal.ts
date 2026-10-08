import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import {
  optionSetItemIssueMessageKey,
  type OptionSetItemIssue,
} from "./optionSetItemRules";
import type { OptionSetRefusal } from "./optionSetRefusalTypes";

/**
 * Documentation for module export
 */
export interface SaveRefusalCheckParams {
  canUpdate: boolean;
  set: OptionSet | null;
  isPlatformContext: boolean;
  version: OptionSetVersion | null;
  isReady: boolean;
  issues: readonly OptionSetItemIssue[];
}

/**
 * Evaluates why saving an option set version is refused, or null if allowed.
 */
export function evaluateOptionSetVersionSaveRefusal({
  canUpdate,
  set,
  isPlatformContext,
  version,
  isReady,
  issues,
}: SaveRefusalCheckParams): OptionSetRefusal | null {
  if (!canUpdate) {
    return { reason: "permission", messageKey: "optionSet.permissions.update" };
  }
  if (!set) {
    return { reason: "notLoaded", messageKey: "optionSet.detailLoadFailed" };
  }
  if (!set.isContentEditable) {
    return { reason: "systemManaged", messageKey: "optionSet.refusals.systemManaged" };
  }
  if (set.isPlatformOwned && !isPlatformContext) {
    return { reason: "platformOwned", messageKey: "optionSet.refusals.platformOwned" };
  }
  if (!version) {
    return { reason: "notLoaded", messageKey: "optionSet.versionLoadFailed" };
  }
  if (!version.isEditable) {
    return { reason: "notDraft", messageKey: "optionSet.refusals.notDraft" };
  }
  if (!isReady) {
    return { reason: "notLoaded", messageKey: "optionSet.versionLoadFailed" };
  }
  const firstIssue = issues[0];
  if (firstIssue) {
    return {
      reason: "invalid",
      messageKey: optionSetItemIssueMessageKey(firstIssue.code),
      params: firstIssue.params,
    };
  }
  return null;
}
