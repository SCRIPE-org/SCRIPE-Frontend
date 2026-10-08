import * as React from "react";
import { Inbox, SearchX, ShieldOff, Unplug } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { PopoverContent } from "@core/ui/popover";
import { Command, CommandInput, CommandList } from "@core/ui/command";
import { SelectOptionRow } from "@core/crud/components/select/select-option-row";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import type { EntityLookupError } from "../../../../../entity-lookup/src/domain/entities/EntityLookupError";
import { I18N, LoadingRows } from "./referenceControlPanelParts";

/**
 * Documentation for module export
 */
export interface EntityReferencePanelProps {
  draft: string;
  onDraftChange: (next: string) => void;
  options: GenericSelectOption[];
  selectedValueId?: string;
  onSelect: (option: GenericSelectOption) => void;
  isLoading: boolean;
  error: EntityLookupError | null;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onReload: () => void;
}

/**
 * The search and options popover panel for EntityReferenceCustomFieldControl.
 */
export function EntityReferencePanel({
  draft,
  onDraftChange,
  options,
  selectedValueId,
  onSelect,
  isLoading,
  error,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
  onReload,
}: EntityReferencePanelProps): React.ReactElement {
  const { t } = useI18n();

  const renderBody = () => {
    if (error) {
      if (error.kind === "forbidden") {
        return (
          <EmptyState
            bare
            size="sm"
            icon={ShieldOff}
            title={t(`${I18N}.searchForbidden`)}
            description={t(`${I18N}.searchForbiddenHint`)}
          />
        );
      }
      if (error.kind === "unavailable") {
        return (
          <EmptyState
            bare
            size="sm"
            icon={Unplug}
            title={t(`${I18N}.searchUnavailable`)}
            description={t(`${I18N}.searchUnavailableHint`)}
          />
        );
      }
      return (
        <div className="p-2">
          <ErrorMessage size="sm" message={t(`${I18N}.searchFailed`)} onRetry={onReload} />
        </div>
      );
    }
    if (isLoading) {
      return <LoadingRows />;
    }
    if (options.length === 0) {
      return draft.trim() ? (
        <EmptyState bare size="sm" icon={SearchX} title={t(`${I18N}.noResults`)} description={draft} />
      ) : (
        <EmptyState bare size="sm" icon={Inbox} title={t(`${I18N}.noResults`)} />
      );
    }
    return options.map((option) => (
      <SelectOptionRow
        key={option.value}
        option={option}
        selected={option.value === selectedValueId}
        multi={false}
        onSelect={onSelect}
      />
    ));
  };

  return (
    <PopoverContent
      align="start"
      className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
    >
      <Command label={t("select.optionsLabel")} shouldFilter={false}>
        <CommandInput
          aria-label={t("select.searchLabel")}
          placeholder={t(`${I18N}.searchPlaceholder`)}
          value={draft}
          onValueChange={onDraftChange}
        />

        <span className="sr-only" aria-live="polite">
          {isLoading
            ? t(`${I18N}.searching`)
            : t("components.select.optionsAvailable", { count: options.length })}
        </span>

        <CommandList>{renderBody()}</CommandList>

        {hasNextPage && (
          <div className="border-t border-nx-line p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? t("common.loading") : t(`${I18N}.loadMore`)}
            </Button>
          </div>
        )}
      </Command>
    </PopoverContent>
  );
}
