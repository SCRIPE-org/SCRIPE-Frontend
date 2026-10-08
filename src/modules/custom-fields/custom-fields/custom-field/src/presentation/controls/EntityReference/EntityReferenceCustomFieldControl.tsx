"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { AlertCircle } from "lucide-react";
import { Popover } from "@core/ui/popover";
import { SelectTrigger } from "@core/crud/components/select/select-trigger";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { useEntityLookupSearch } from "../../../../../entity-lookup/src/presentation/hooks/useEntityLookupSearch";
import {
  useResolveEntityReference,
  type EntityReferenceResolveStatus,
} from "../../../../../entity-lookup/src/presentation/hooks/useResolveEntityReference";
import type {
  EntityLookupItem,
  EntityLookupType,
} from "../../../../../entity-lookup/src/data/models/EntityLookupModel";
import type { CustomFieldEntityReferenceValue } from "../../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import { I18N } from "./referenceControlPanelParts";
import { ReferenceTypeSelector } from "./ReferenceTypeSelector";
import { EntityReferencePanel } from "./EntityReferencePanel";
import {
  resolveEntityReferenceFieldText,
  renderEntityReferenceHint,
} from "./entityReferenceStatusHelpers";

/**
 * Documentation for module export
 */
export interface EntityReferenceCustomFieldControlProps {
  id: string;
  label?: string;
  targetEntityTypeKey?: string | null;
  value: CustomFieldEntityReferenceValue | null;
  onChange: (next: CustomFieldEntityReferenceValue | null) => void;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
  error?: string;
}

/**
 * Dedicated edit control for EntityReference and UserReference custom fields.
 *
 * Supports paginated asynchronous entity lookup, dynamic display name resolution,
 * optional entity type selection for unpinned reference definitions, and status indicators
 * for unauthorized, inactive, or unresolvable referenced records.
 */
export function EntityReferenceCustomFieldControl({
  id,
  label,
  targetEntityTypeKey,
  value,
  onChange,
  required,
  disabled,
  invalid,
  describedBy,
  placeholder,
  error,
}: EntityReferenceCustomFieldControlProps): React.ReactElement {
  const { t } = useI18n();
  const hintId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [chosenType, setChosenType] = React.useState<EntityLookupType | null>(null);
  const [draft, setDraft] = React.useState("");

  const pinnedTarget =
    typeof targetEntityTypeKey === "string" && targetEntityTypeKey.trim() !== ""
      ? targetEntityTypeKey
      : null;

  const needsTypeChoice = pinnedTarget === null;
  const effectiveTarget = pinnedTarget ?? chosenType?.key ?? null;
  const hasTarget = effectiveTarget !== null;
  const canPick = hasTarget && !disabled;

  const search = useEntityLookupSearch({
    entityTypeKey: effectiveTarget,
    enabled: canPick && open,
  });

  const resolution = useResolveEntityReference(value);

  const hasValue = value !== null && value !== undefined;
  const status: EntityReferenceResolveStatus = hasValue ? resolution.status : "idle";
  const item: EntityLookupItem | null = hasValue ? resolution.item : null;

  const isResolving = hasValue && (status === "idle" || status === "loading");
  const isForbidden = status === "forbidden";
  const isDormant = status === "resolved" && item?.isActive === false;

  const inactiveSuffix = t(`${I18N}.inactiveSuffix`);

  const fieldText = resolveEntityReferenceFieldText(hasValue, status, item, t);

  const options: GenericSelectOption[] = search.items.map((entry) => ({
    value: entry.id,
    label: entry.displayName,
    ...(entry.secondary ? { description: entry.secondary } : {}),
    ...(entry.isActive === false
      ? {
          icon: (
            <Badge variant="inactive" className="shrink-0">
              {inactiveSuffix}
            </Badge>
          ),
        }
      : {}),
  }));

  const handleOpenChange = (next: boolean) => {
    if (next && (!canPick || isForbidden)) return;
    setOpen(next);
    if (!next) {
      setDraft("");
      search.setQuery("");
    }
  };

  const handleQueryChange = (next: string) => {
    setDraft(next);
    search.setQuery(next);
  };

  const handleSelect = (option: GenericSelectOption) => {
    if (effectiveTarget === null) return;
    onChange({ entityTypeKey: effectiveTarget, entityId: option.value });
    handleOpenChange(false);
  };

  const handleClear = () => onChange(null);

  const hint = renderEntityReferenceHint({
    hasTarget,
    status,
    item,
    isDormant,
    inactiveSuffix,
    t,
  });

  const describedByValue =
    [describedBy, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      {needsTypeChoice && (
        <ReferenceTypeSelector
          recordFieldId={id}
          recordFieldLabel={label}
          disabled={disabled}
          chosenType={chosenType}
          onChosenTypeChange={setChosenType}
        />
      )}

      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && (
            <span className="text-destructive ms-1" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <SelectTrigger
          id={id}
          open={open}
          multi={false}
          disabled={disabled || !hasTarget}
          readOnly={isForbidden}
          invalid={invalid || status === "invalid"}
          required={required}
          describedBy={describedByValue}
          ariaLabel={label ?? id}
          placeholder={placeholder ?? t(`${I18N}.placeholder`)}
          selectedOptions={hasValue ? [{ value: value.entityId, label: fieldText }] : []}
          displayLabel={fieldText}
          maxSelectedDisplay={1}
          allowClear={!required && !isForbidden}
          onClear={handleClear}
          onRemoveOne={handleClear}
          wrapperProps={isResolving ? { "aria-busy": true } : {}}
        />

        {canPick && (
          <EntityReferencePanel
            draft={draft}
            onDraftChange={handleQueryChange}
            options={options}
            selectedValueId={value?.entityId}
            onSelect={handleSelect}
            isLoading={search.isLoading}
            error={search.error}
            hasNextPage={search.hasNextPage}
            isLoadingMore={search.isLoadingMore}
            onLoadMore={search.loadMore}
            onReload={search.reload}
          />
        )}
      </Popover>

      {invalid && error && (
        <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {hint && <div id={hintId}>{hint}</div>}

      {status === "error" && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2 text-xs"
          onClick={resolution.retry}
        >
          {t(`${I18N}.retry`)}
        </Button>
      )}
    </div>
  );
}
