"use client";

import { Plus } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import {
  useCrmEntitySearchViewModel,
  type CrmEntitySearchItem,
  type CrmEntitySearchKind,
  type CrmQuickCreateEntityInput,
} from "../viewmodels/useCrmEntitySearchViewModel";
import {
  CrmEntityQuickCreateDialog,
  type CrmEntityQuickCreateInitialValues,
} from "./CrmEntityQuickCreateDialog";

export type { CrmEntityQuickCreateInitialValues };

export interface CrmEntitySearchSelectProps {
  entityKind: CrmEntitySearchKind;
  value?: string | null;
  onChange: (value: string, selectedItem?: CrmEntitySearchItem) => void;
  initialLabel?: string | null;
  initialDescription?: string | null;
  accountId?: string;
  valueMode?: "id" | "partyId";
  enableQuickCreate?: boolean;
  quickCreateDefaultKind?: "account" | "contact";
  quickCreateInitialValues?: CrmEntityQuickCreateInitialValues;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  noResultsText?: string;
  allowClear?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  debounceMs?: number;
  pageSize?: number;
  id?: string;
  name?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "data-testid"?: string;
}

/**
 * Reusable server-searchable tenant CRM entity/assignee combobox with optional inline quick-create.
 * Displays human names and subtitles while keeping encrypted tenant IDs strictly out of labels.
 */
export function CrmEntitySearchSelect({
  entityKind,
  value,
  onChange,
  initialLabel,
  initialDescription,
  accountId,
  valueMode,
  enableQuickCreate = false,
  quickCreateDefaultKind = "contact",
  quickCreateInitialValues,
  placeholder,
  searchPlaceholder,
  emptyText,
  noResultsText,
  allowClear = true,
  disabled = false,
  readOnly = false,
  invalid = false,
  required = false,
  debounceMs = 250,
  pageSize = 25,
  id,
  name,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "data-testid": testId,
}: CrmEntitySearchSelectProps) {
  const { t } = useI18n();
  const vm = useCrmEntitySearchViewModel({
    entityKind,
    value,
    initialLabel,
    initialDescription,
    accountId,
    valueMode,
    pageSize,
  });

  const defaultPlaceholder =
    entityKind === "account"
      ? t("crm.entitySearch.placeholderAccount")
      : entityKind === "contact"
        ? t("crm.entitySearch.placeholderContact")
        : entityKind === "user" || entityKind === "team" || entityKind === "assignee"
          ? t("crm.entitySearch.placeholderAssignee")
          : t("crm.entitySearch.placeholderParty");

  const supportsQuickCreate = entityKind === "party" || entityKind === "account" || entityKind === "contact";
  const showQuickCreate = Boolean(enableQuickCreate && supportsQuickCreate && !disabled && !readOnly);

  const resolvedQuickCreateInitialValues: CrmEntityQuickCreateInitialValues | undefined =
    quickCreateInitialValues || vm.lastSearchQuery
      ? {
          ...quickCreateInitialValues,
          nameEn: quickCreateInitialValues?.nameEn || vm.lastSearchQuery || undefined,
          accountNameEn:
            quickCreateInitialValues?.accountNameEn ||
            quickCreateInitialValues?.nameEn ||
            vm.lastSearchQuery ||
            undefined,
          contactNameEn:
            quickCreateInitialValues?.contactNameEn ||
            quickCreateInitialValues?.nameEn ||
            vm.lastSearchQuery ||
            undefined,
        }
      : undefined;

  const handleValueChange = (nextVal: string | string[]) => {
    const scalar = Array.isArray(nextVal) ? (nextVal[0] ?? "") : (nextVal ?? "");
    onChange(scalar, scalar ? vm.getCachedItem(scalar) : undefined);
  };

  const handleQuickCreateSubmit = async (input: CrmQuickCreateEntityInput) => {
    const created = await vm.handleQuickCreate(input);
    onChange(created.value, created.item);
  };

  return (
    <div className={cn("flex items-center gap-1.5 w-full", className)} data-testid={testId}>
      <div className="flex-1 min-w-0">
        <GenericSelect
          id={id}
          name={name}
          options={vm.fallbackOptions}
          value={value ?? ""}
          onValueChange={handleValueChange}
          type="searchable"
          searchType="server"
          onServerSearch={vm.handleServerSearch}
          debounceMs={debounceMs}
          allowClear={allowClear}
          placeholder={placeholder ?? defaultPlaceholder}
          searchPlaceholder={searchPlaceholder ?? t("crm.entitySearch.searchPlaceholder")}
          emptyText={emptyText ?? t("crm.entitySearch.emptyText")}
          noResultsText={noResultsText ?? t("crm.entitySearch.noResultsText")}
          disabled={disabled}
          readOnly={readOnly}
          invalid={invalid}
          required={required}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className="w-full"
        />
      </div>

      {showQuickCreate && supportsQuickCreate && (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => vm.setIsQuickCreateOpen(true)}
            title={t("crm.entitySearch.quickCreateBtn")}
            aria-label={t("crm.entitySearch.quickCreateBtn")}
            data-testid={testId ? `${testId}-quick-create-btn` : "crm-entity-quick-create-btn"}
            className="h-9 px-2.5 shrink-0 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised gap-1 text-xs"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">{t("crm.entitySearch.quickCreateBtn")}</span>
          </Button>

          <CrmEntityQuickCreateDialog
            open={vm.isQuickCreateOpen}
            onOpenChange={vm.setIsQuickCreateOpen}
            entityKind={entityKind}
            defaultSubKind={quickCreateDefaultKind}
            primaryAccountId={accountId}
            initialValues={resolvedQuickCreateInitialValues}
            isSubmitting={vm.isCreating}
            onSubmit={handleQuickCreateSubmit}
          />
        </>
      )}
    </div>
  );
}
