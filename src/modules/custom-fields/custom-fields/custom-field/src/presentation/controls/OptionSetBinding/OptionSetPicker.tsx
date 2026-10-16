"use client";

/**
 * The searchable combobox over the caller's readable, published option sets -- one half of the
 * option-set binding dialog, the other being `OptionSetBindingDialog`'s own action buttons.
 *
 * Its own file for the same reason `ReferenceTypeSelector` is: it is one independent combobox, built
 * from the same primitives that one uses (`Popover`/`PopoverContent`, `Command`/`CommandInput`/
 * `CommandList`, `SelectTrigger` and `SelectOptionRow` verbatim) so nothing about the combobox
 * surface, the keyboard-open path or the RTL treatment is re-implemented here.
 *
 * PICKING A SET IS NOT BINDING IT. This component only reports which set is currently highlighted;
 * `OptionSetBindingDialog` decides what a highlighted set means (bind / rebind / unbind are three
 * separate actions with three separate buttons -- see that file and `useOptionSetBindingViewModel`'s
 * header for why they are not folded into "pick, then save").
 *
 * The list is CALLER-SUPPLIED (`sets`), already filtered to `OptionSet.isBindable`, rather than
 * fetched in here -- unlike `ReferenceTypeOptions`, which owns its own fetch because it is the only
 * consumer of that endpoint on its screen. Here the same list is shared with the option-set admin
 * screen through `useOptionSetViewModel`'s cache, so owning a second fetch would only risk it
 * disagreeing with that cache about what "bindable" means.
 */
import * as React from "react";
import { Layers } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Popover, PopoverContent } from "@core/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandList } from "@core/ui/command";
import { SelectTrigger } from "@core/crud/components/select/select-trigger";
import { SelectOptionRow } from "@core/crud/components/select/select-option-row";
import type { OptionSet } from "../../../../../option-set/src/domain/entities/OptionSet";

/**
 * Documentation for module export
 */
export interface OptionSetPickerProps {
  id: string;
  label: string;
  /** Already filtered to bindable (readable + published) sets -- see this file's header. */
  sets: readonly OptionSet[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  language: string;
  selectedSetId: string | null;
  onSelect: (set: OptionSet) => void;
  disabled?: boolean;
  describedBy?: string;
}

/**
 * Documentation for OptionSetPicker
 */
export function OptionSetPicker({
  id,
  label,
  sets,
  isLoading,
  isError,
  onRetry,
  language,
  selectedSetId,
  onSelect,
  disabled,
  describedBy,
}: OptionSetPickerProps): React.ReactElement {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);

  const selected = sets.find((set) => set.id === selectedSetId) ?? null;
  const selectedLabel = selected ? selected.displayLabel(language) : "";

  const handleOpenChange = (next: boolean) => {
    // Same guard SelectTrigger's own doc comment calls load-bearing on ReferenceTypeSelector: it is a
    // <div>, so Radix's `disabled` attribute alone does not stop a pointer click.
    if (next && disabled) return;
    setOpen(next);
  };

  const handleSelect = (set: OptionSet) => {
    onSelect(set);
    setOpen(false);
  };

  const body = (() => {
    if (isLoading) {
      return (
        <div className="p-2 text-sm text-nx-ink-3" role="status">
          {t("common.loading")}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="p-2">
          <ErrorMessage
            size="sm"
            message={t("customField.optionSetBinding.loadSetsFailed")}
            onRetry={onRetry}
          />
        </div>
      );
    }

    if (sets.length === 0) {
      // A real, reachable state -- not every deployment has a published shared set yet, and this
      // screen is one place an admin would come to notice that.
      return (
        <EmptyState
          bare
          size="sm"
          icon={Layers}
          title={t("customField.optionSetBinding.noSetsAvailable")}
          description={t("customField.optionSetBinding.noSetsAvailableHint")}
        />
      );
    }

    return (
      <>
        <CommandEmpty>{t("customField.optionSetBinding.noResults")}</CommandEmpty>
        {sets.map((set) => (
          <SelectOptionRow
            key={set.id}
            option={{
              value: set.id,
              label: set.displayLabel(language),
              description: set.isPlatformOwned
                ? t("customField.optionSetBinding.platformOwned")
                : undefined,
            }}
            selected={set.id === selectedSetId}
            multi={false}
            onSelect={() => handleSelect(set)}
          />
        ))}
      </>
    );
  })();

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <SelectTrigger
          id={id}
          open={open}
          multi={false}
          disabled={disabled}
          describedBy={describedBy}
          placeholder={t("customField.optionSetBinding.pickerPlaceholder")}
          // See select-trigger.tsx's own doc comment: role="combobox" computes no accessible name
          // from a `<label for>` alone, so this is the field's real name, not the visible <Label>.
          ariaLabel={label}
          selectedOptions={selected ? [{ value: selected.id, label: selectedLabel }] : []}
          displayLabel={selectedLabel}
          maxSelectedDisplay={1}
          // Nothing to clear to: an empty picker selection is not a legal input to any of the three
          // actions, so there is no "unset" affordance here distinct from just picking another set.
          allowClear={false}
          onClear={() => undefined}
          onRemoveOne={() => undefined}
        />

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0"
        >
          <Command label={t("select.optionsLabel")}>
            <CommandInput
              aria-label={t("select.searchLabel")}
              placeholder={t("customField.optionSetBinding.searchPlaceholder")}
            />
            <CommandList>{body}</CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
