/**
 * Restricted-fields tag editor with free-text input, optional custom-field datalist
 * suggestions, case-insensitive deduplication, and required-field conflict alerts.
 *
 * @module roles/presentation/components
 */
"use client";

import { Plus, X } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import type { RestrictableCustomFieldKey } from "@core/hooks/use-restrictable-custom-field-keys";

/**
 * Props for PermissionRestrictedFieldsEditor.
 */
export interface PermissionRestrictedFieldsEditorProps {
  restrictedFields: string[];
  newField: string;
  onNewFieldChange: (value: string) => void;
  canAddField: boolean;
  onAddField: () => void;
  onRemoveField: (field: string) => void;
  availableSuggestions: RestrictableCustomFieldKey[];
  chosenRequiredFields: string[];
  isTruncated: boolean;
  isReadOnly?: boolean;
}

/**
 * Presentation UI component rendering the restricted-fields tag editor inside PermissionConfigDialog.
 */
export function PermissionRestrictedFieldsEditor({
  restrictedFields,
  newField,
  onNewFieldChange,
  canAddField,
  onAddField,
  onRemoveField,
  availableSuggestions,
  chosenRequiredFields,
  isTruncated,
  isReadOnly = false,
}: PermissionRestrictedFieldsEditorProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-1.5">
      <Label htmlFor="permission-restricted-field">{t("role.restrictedFields")}</Label>
      <div className="flex gap-2">
        <Input
          id="permission-restricted-field"
          value={newField}
          onChange={(e) => onNewFieldChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!isReadOnly) onAddField();
            }
          }}
          disabled={isReadOnly}
          placeholder={t("role.enterField")}
          className="flex-1"
          /* Suggestions are LAYERED ON, never replacing free text. Restricted
             fields also name built-in record properties, which are not
             enumerable from here at all, so an options-only control would remove
             the ability to restrict them. A native datalist keeps the input free
             text, needs no new component (none in @core/ui accepts both), and
             stays keyboard- and screen-reader-navigable by construction. */
          list={
            availableSuggestions.length > 0 ? "permission-restricted-field-options" : undefined
          }
        />
        {availableSuggestions.length > 0 && (
          <datalist id="permission-restricted-field-options">
            {availableSuggestions.map((entry) => (
              <option
                key={entry.key}
                value={entry.key}
                /* The label carries the warning, because a datalist option has
                   nowhere else to put one. */
                label={
                  entry.isRequired
                    ? `${entry.labelEn} — ${t("role.restrictedFieldRequiredWarning")}`
                    : entry.labelEn
                }
              />
            ))}
          </datalist>
        )}
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={onAddField}
          disabled={isReadOnly || !canAddField}
          aria-label={t("common.add")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <ul className="flex min-h-[2.5rem] list-none flex-wrap gap-1.5 rounded-nx-md border border-nx-line bg-nx-hover p-2">
        {restrictedFields.length === 0 ? (
          <li className="self-center text-sm text-nx-ink-3">{t("role.noRestrictions")}</li>
        ) : (
          restrictedFields.map((field) => (
            <li key={field}>
              <Badge variant="secondary" className="gap-1 pe-1">
                <bdi dir="ltr" className="truncate font-mono">
                  {field}
                </bdi>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isReadOnly}
                  onClick={() => onRemoveField(field)}
                  aria-label={`${t("common.remove")} ${field}`}
                  className="grid h-4 w-4 place-items-center rounded-full p-0 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-raised-2 focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </Button>
              </Badge>
            </li>
          ))
        )}
      </ul>
      <p className="text-xs text-nx-ink-3">{t("role.restrictionHint")}</p>
      {chosenRequiredFields.length > 0 && (
        <p role="alert" className="text-xs text-nx-danger">
          {t("role.restrictedFieldsRequiredConflict", {
            fields: chosenRequiredFields.join(", "),
          })}
        </p>
      )}
      {isTruncated && (
        <p className="text-xs text-nx-ink-3">{t("role.restrictedFieldsTruncated")}</p>
      )}
    </div>
  );
}
