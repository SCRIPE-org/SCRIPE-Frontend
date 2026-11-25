"use client";

import { useId, useState } from "react";
import { AlertTriangle, Plus, Trash2, X } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { useRestrictableCustomFieldKeys } from "@core/hooks/use-restrictable-custom-field-keys";
import {
  formatRestrictableResourceLabel,
  resolveRestrictableResource,
  splitDraftFieldTokens,
  type PermissionResourceCandidate,
} from "./restriction-resource-label";

/** Single permission/resource restriction row mapping a code or resource to restricted field keys. */
export interface RestrictionItem {
  permissionCode: string;
  restrictedFields: string[];
}

interface RestrictionRowCardProps {
  restriction: RestrictionItem;
  index: number;
  open: boolean;
  canReadCustomFields: boolean;
  availablePermissions: ReadonlyArray<PermissionResourceCandidate>;
  draftField: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  onDraftFieldChange: (index: number, value: string) => void;
  onRemoveRestriction: (index: number) => void;
  onAddField: (index: number, rawField: string) => { added: string[]; duplicates: string[] };
  onRemoveField: (index: number, field: string) => void;
}

/**
 * Renders one resource restriction card inside SetRestrictionsDialog.
 * Owns its own custom-field suggestion query, unique datalist id, and draft
 * input state so hooks never run inside loops and rows stay isolated.
 */
export function RestrictionRowCard({
  restriction,
  index,
  open,
  canReadCustomFields,
  availablePermissions,
  draftField,
  t,
  onDraftFieldChange,
  onRemoveRestriction,
  onAddField,
  onRemoveField,
}: RestrictionRowCardProps) {
  const datalistId = useId();
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);

  const canonicalResource = resolveRestrictableResource(
    restriction.permissionCode,
    availablePermissions
  );
  const resourceLabel = formatRestrictableResourceLabel(
    restriction.permissionCode,
    t,
    availablePermissions
  );

  const {
    keys: suggestionKeys,
    isLoading: isLoadingSuggestions,
    isTruncated,
    isAvailable,
  } = useRestrictableCustomFieldKeys(open ? canonicalResource : undefined, {
    enabled: open && canReadCustomFields,
  });

  const requiredKeyMap = new Set(
    suggestionKeys.filter((item) => item.isRequired).map((item) => item.key.toLowerCase())
  );

  const selectedRequiredFields = restriction.restrictedFields.filter((field) =>
    requiredKeyMap.has(field.toLowerCase())
  );

  const draftTokens = splitDraftFieldTokens(draftField);
  const draftRequiredToken = draftTokens.find((tok) => requiredKeyMap.has(tok.toLowerCase()));
  const existingFieldSet = new Set(restriction.restrictedFields.map((f) => f.toLowerCase()));
  const liveDuplicateToken = draftTokens.find((tok) => existingFieldSet.has(tok.toLowerCase()));
  const unselectedSuggestions = suggestionKeys.filter(
    (item) => !existingFieldSet.has(item.key.toLowerCase())
  );

  const tryAddField = (rawField: string, fromSuggestion = false) => {
    if (!rawField.trim()) return;
    const { added, duplicates } = onAddField(index, rawField);
    if (duplicates.length > 0) {
      setDuplicateNotice(t("userGroups.restrictionsTab.duplicateField", { field: duplicates[0] }));
    } else {
      setDuplicateNotice(null);
    }
    if (!fromSuggestion && added.length > 0) {
      onDraftFieldChange(index, "");
    }
  };

  const activeDuplicateMessage =
    duplicateNotice ??
    (liveDuplicateToken
      ? t("userGroups.restrictionsTab.duplicateField", { field: liveDuplicateToken })
      : null);

  const fallbackHintKey = !canReadCustomFields
    ? "userGroups.restrictionsTab.suggestionsUnavailable"
    : !isLoadingSuggestions && !isAvailable
      ? "userGroups.restrictionsTab.suggestionsNotConfigured"
      : null;

  return (
    <div
      data-testid={`restriction-row-${canonicalResource || restriction.permissionCode}`}
      className="space-y-3 rounded-nx-md border border-nx-line bg-nx-surface p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-nx-ink">{resourceLabel}</span>
          <bdi
            dir="ltr"
            className="rounded-nx-xs bg-nx-raised px-1.5 py-0.5 font-mono text-xs text-nx-ink-2"
          >
            {canonicalResource || restriction.permissionCode}
          </bdi>
          {canonicalResource &&
            canonicalResource !== restriction.permissionCode.trim().toLowerCase() && (
              <bdi dir="ltr" className="font-mono text-[11px] text-nx-ink-3">
                ({restriction.permissionCode})
              </bdi>
            )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive/90"
          data-skip-blur-commit="true"
          onClick={() => onRemoveRestriction(index)}
          aria-label={`${t("userGroups.restrictionsTab.removeRestriction")}: ${restriction.permissionCode}`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>

      {/* Selected restricted field chips */}
      <div className="flex flex-wrap gap-1.5">
        {restriction.restrictedFields.length === 0 ? (
          <span className="text-xs text-nx-ink-3">
            {t("userGroups.restrictionsTab.noFieldsYet")}
          </span>
        ) : (
          restriction.restrictedFields.map((field) => {
            const isReq = requiredKeyMap.has(field.toLowerCase());
            return (
              <Badge
                key={field}
                variant={isReq ? "outline" : "secondary"}
                className="gap-1 text-xs"
              >
                <bdi dir="ltr">{field}</bdi>
                {isReq && (
                  <span className="text-[10px] font-medium text-nx-warning-strong">
                    ({t("userGroups.restrictionsTab.requiredBadge")})
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveField(index, field)}
                  className="ms-1 h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
                  aria-label={t("userGroups.restrictionsTab.removeField", { field })}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </Button>
              </Badge>
            );
          })
        )}
      </div>

      {/* Required-field warning */}
      {(selectedRequiredFields.length > 0 || Boolean(draftRequiredToken)) && (
        <Alert variant="warning" role="alert" className="py-2">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription className="text-xs">
            {t("userGroups.restrictionsTab.requiredFieldAlert", {
              field: selectedRequiredFields[0] ?? draftRequiredToken ?? "",
            })}
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate field inline notice */}
      {activeDuplicateMessage && (
        <Alert variant="warning" role="alert" className="py-2">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription className="text-xs">{activeDuplicateMessage}</AlertDescription>
        </Alert>
      )}

      {/* Add field input + datalist suggestions */}
      <div className="flex gap-2">
        <Input
          list={datalistId}
          value={draftField}
          onChange={(e) => {
            onDraftFieldChange(index, e.target.value);
            if (duplicateNotice) setDuplicateNotice(null);
          }}
          onBlur={(e) => {
            const nextFocus = e.relatedTarget as HTMLElement | null;
            if (!nextFocus?.closest('[data-skip-blur-commit="true"]') && draftField.trim()) {
              tryAddField(draftField);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              tryAddField(draftField);
            }
          }}
          placeholder={t("userGroups.restrictionsTab.fieldPlaceholder")}
          aria-label={t("userGroups.restrictionsTab.addField")}
          data-testid={`restriction-field-input-${canonicalResource || restriction.permissionCode}`}
          className="h-8 text-xs"
        />
        <datalist id={datalistId}>
          {suggestionKeys.map((item) => {
            const label = item.isRequired ? `${item.labelEn} (${t("userGroups.restrictionsTab.requiredBadge")})` : item.labelEn;
            return <option key={item.key} value={item.key} aria-label={label}>{label}</option>;
          })}
        </datalist>
        <Button
          type="button" variant="outline" size="sm" className="h-8"
          data-skip-blur-commit="true" onClick={() => tryAddField(draftField)} disabled={!draftField.trim()}
          aria-label={t("userGroups.restrictionsTab.addField")}
          data-testid={`restriction-field-add-${canonicalResource || restriction.permissionCode}`}
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
        </Button>
      </div>
      {canReadCustomFields && isLoadingSuggestions && (
        <p className="text-[11px] text-nx-ink-3">{t("userGroups.restrictionsTab.loadingSuggestions")}</p>
      )}
      {canReadCustomFields && !isLoadingSuggestions && unselectedSuggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] text-nx-ink-3">{t("userGroups.restrictionsTab.customFieldHint")}</p>
          <div className="flex flex-wrap gap-1">
            {unselectedSuggestions.slice(0, 12).map((item) => (
              <Button
                key={item.key} type="button" variant="outline" size="sm" className="h-6 gap-1 px-2 text-[11px]"
                onClick={() => tryAddField(item.key, true)}
                data-testid={`restriction-suggestion-${canonicalResource || restriction.permissionCode}-${item.key}`}
              >
                <Plus className="h-2.5 w-2.5" aria-hidden="true" />
                <bdi dir="ltr">{item.key}</bdi>
                {item.isRequired && <span className="text-nx-warning-strong">({t("userGroups.restrictionsTab.requiredBadge")})</span>}
              </Button>
            ))}
          </div>
          {isTruncated && <p className="text-[11px] text-nx-ink-3">{t("userGroups.restrictionsTab.suggestionsTruncated")}</p>}
        </div>
      )}
      {fallbackHintKey && <p className="text-[11px] text-nx-ink-3">{t(fallbackHintKey)}</p>}
    </div>
  );
}
