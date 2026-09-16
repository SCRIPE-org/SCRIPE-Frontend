import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type { OptionSetRefusal } from "./optionSetRefusalTypes";

export function checkOwnershipRefusal(
  set: OptionSet,
  isPlatformContext: boolean
): OptionSetRefusal | null {
  if (set.isPlatformOwned && !isPlatformContext) {
    return { reason: "platformOwned", messageKey: "optionSet.refusals.platformOwned" };
  }
  return null;
}

export function checkSetLevelRefusal(
  set: OptionSet,
  isPlatformContext: boolean
): OptionSetRefusal | null {
  if (!set.isContentEditable) {
    return { reason: "systemManaged", messageKey: "optionSet.refusals.systemManaged" };
  }
  return checkOwnershipRefusal(set, isPlatformContext);
}

export function checkUpdateRefusal(
  set: OptionSet,
  canUpdate: boolean,
  isPlatformContext: boolean
): OptionSetRefusal | null {
  if (!canUpdate) {
    return { reason: "permission", messageKey: "optionSet.permissions.update" };
  }
  return checkSetLevelRefusal(set, isPlatformContext);
}

export function checkDeleteRefusal(
  set: OptionSet,
  canDelete: boolean,
  isPlatformContext: boolean
): OptionSetRefusal | null {
  if (!canDelete) {
    return { reason: "permission", messageKey: "optionSet.permissions.delete" };
  }
  return checkSetLevelRefusal(set, isPlatformContext);
}

export function checkCreateVersionRefusal(
  set: OptionSet,
  canCreate: boolean,
  isPlatformContext: boolean
): OptionSetRefusal | null {
  if (!canCreate) {
    return { reason: "permission", messageKey: "optionSet.permissions.create" };
  }
  return checkSetLevelRefusal(set, isPlatformContext);
}

export function checkPublishRefusal(
  set: OptionSet,
  version: OptionSetVersion,
  canPublish: boolean,
  isPlatformContext: boolean
): OptionSetRefusal | null {
  if (!canPublish) {
    return { reason: "permission", messageKey: "optionSet.permissions.publish" };
  }
  const setLevel = checkSetLevelRefusal(set, isPlatformContext);
  if (setLevel) return setLevel;

  if (version.isPublished) {
    return { reason: "alreadyPublished", messageKey: "optionSet.refusals.alreadyPublished" };
  }
  if (!version.canPublish) {
    return { reason: "notDraft", messageKey: "optionSet.refusals.notDraft" };
  }
  if (version.itemCount === 0) {
    return { reason: "emptyVersion", messageKey: "optionSet.refusals.emptyVersion" };
  }
  return null;
}
