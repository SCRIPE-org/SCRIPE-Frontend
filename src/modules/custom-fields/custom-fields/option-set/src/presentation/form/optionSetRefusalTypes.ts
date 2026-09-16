import { toast } from "@core/hooks/use-enhanced-toast";

export type OptionSetTranslate = (key: string, params?: Record<string, string | number>) => string;

export type OptionSetRefusalReason =
  | "permission"
  | "systemManaged"
  | "platformOwned"
  | "notDraft"
  | "alreadyPublished"
  | "emptyVersion"
  | "notLoaded"
  | "invalid";

export interface OptionSetRefusal {
  reason: OptionSetRefusalReason;
  messageKey: string;
  params?: Record<string, string | number>;
}

export function reportOptionSetRefusal(refusal: OptionSetRefusal, t: OptionSetTranslate): void {
  const message = t(refusal.messageKey, refusal.params);

  if (refusal.reason === "permission") {
    toast.error({ title: t("optionSet.toast.permissionDenied"), description: message });
    return;
  }
  if (refusal.reason === "systemManaged") {
    toast.error({ title: t("optionSet.toast.systemManagedRefused"), description: message });
    return;
  }
  toast.error({ title: message });
}
