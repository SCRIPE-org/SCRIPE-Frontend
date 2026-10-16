import * as React from "react";
import { Badge } from "@core/ui/badge";
import type { EntityReferenceResolveStatus } from "../../../../../entity-lookup/src/presentation/hooks/useResolveEntityReference";
import type { EntityLookupItem } from "../../../../../entity-lookup/src/data/models/EntityLookupModel";
import { I18N } from "./referenceControlPanelParts";

/**
 * Resolves the display text shown in the closed combobox trigger.
 */
export function resolveEntityReferenceFieldText(
  hasValue: boolean,
  status: EntityReferenceResolveStatus,
  item: EntityLookupItem | null,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (!hasValue) return "";
  switch (status) {
    case "resolved":
      return item?.displayName ?? t(`${I18N}.resolving`);
    case "forbidden":
      return t(`${I18N}.forbidden`);
    case "missing":
      return t(`${I18N}.missing`);
    case "invalid":
      return t(`${I18N}.invalid`);
    case "error":
      return t(`${I18N}.resolveFailed`);
    default:
      return t(`${I18N}.resolving`);
  }
}

/**
 * Documentation for module export
 */
export interface RenderHintParams {
  hasTarget: boolean;
  status: EntityReferenceResolveStatus;
  item: EntityLookupItem | null;
  isDormant: boolean;
  inactiveSuffix: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Renders the described-by helper/hint block below the trigger.
 */
export function renderEntityReferenceHint({
  hasTarget,
  status,
  item,
  isDormant,
  inactiveSuffix,
  t,
}: RenderHintParams): React.ReactNode {
  if (!hasTarget) {
    return <p className="text-xs text-nx-ink-3">{t(`${I18N}.noTargetConfigured`)}</p>;
  }
  if (status === "resolved" && item) {
    return (
      <div className="flex items-center gap-2 text-xs text-nx-ink-3">
        <span className="sr-only">{t(`${I18N}.selectedLabel`)}</span>
        {item.secondary && <span className="truncate">{item.secondary}</span>}
        {isDormant && (
          <Badge variant="inactive" className="shrink-0">
            {inactiveSuffix}
          </Badge>
        )}
      </div>
    );
  }
  return null;
}
