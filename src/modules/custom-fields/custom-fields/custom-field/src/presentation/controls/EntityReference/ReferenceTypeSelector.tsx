"use client";

/**
 * The TYPE combobox an UNPINNED EntityReference field gets, and the only thing in this
 * control that reads the available-types endpoint.
 *
 * Its own file because it is its own combobox. `EntityReferenceCustomFieldControl` renders
 * two of them -- a type selector that gates a record picker -- and they share exactly one
 * piece of state: the chosen type, which the parent owns because it decides what the record
 * picker searches. Everything else here is private to this half: its open state, its trigger,
 * its panel, its fetch, and its three empty/failed/filtered renderings.
 *
 * **Neither combobox ever moves focus to the other.** Each owns its own `Popover`, each
 * Popover returns focus to its OWN trigger on close (Radix's default), and neither file calls
 * `.focus()` anywhere -- a rule the split now makes structural rather than something somebody
 * has to remember. Picking a type leaves the operator on the type field with the record field
 * newly enabled one Tab away; it deliberately does NOT auto-open the record picker, which
 * would yank focus out from under someone still reading what they just chose. This selector
 * precedes the record field in the DOM because it gates it.
 *
 * **The available-types list is fetched when the panel opens, not on mount.**
 * `ReferenceTypeOptions` below lives inside `PopoverContent`, which Radix mounts only while
 * the panel is open -- see that component's own comment. A record form whose reference fields
 * nobody touches issues no request at all.
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
import { useEntityLookupAvailableTypes } from "../../../../../entity-lookup/src/presentation/hooks/useEntityLookupAvailableTypes";
import type { EntityLookupType } from "../../../../../entity-lookup/src/data/models/EntityLookupModel";
import { I18N, LoadingRows, typeDisplayName } from "./referenceControlPanelParts";

/**
 * The type list -- and the only thing in this file that reads the
 * available-types endpoint.
 *
 * Its own component for one structural reason: it is rendered inside
 * `PopoverContent`, which Radix mounts only while that panel is open, so the
 * fetch is gated on the panel actually being opened without any `enabled`
 * bookkeeping in the parent -- and a record form whose reference fields nobody
 * touches issues no request at all. The hook is react-query-backed, so
 * reopening reads its cache rather than the network.
 *
 * It owns the whole panel body, live region included, rather than just the
 * rows: the two things worth announcing -- "still loading" and "N types" -- are
 * both facts only this component holds, and passing them back up to be
 * announced there would mean lifting the fetch back out of the lazy mount.
 *
 * Three answers, three renderings, for the same reason the record panel splits
 * its own: an empty list, a failed fetch and an unmatched filter are three
 * different facts, and only the middle one is worth a retry. `isEmpty` comes
 * from the hook rather than from `types.length === 0`, which is also true
 * mid-flight and after a failure -- see that hook's own doc comment.
 */
function ReferenceTypeOptions({
  selectedKey,
  onSelect,
}: {
  /** Currently chosen type key, so its row carries the tick. */
  selectedKey: string | null;
  onSelect: (type: EntityLookupType) => void;
}): React.ReactElement {
  const { t, language } = useI18n();
  const { types, isLoading, isError, isEmpty, refetch } = useEntityLookupAvailableTypes();

  const body = (() => {
    if (isLoading) return <LoadingRows />;

    if (isError) {
      // A transport failure, and the only branch here a retry can fix. There is
      // no `forbidden` arm on purpose: this endpoint answers "you may not
      // reference anything" with a 200 and an empty array, so a permission
      // outcome arrives as `isEmpty` and never as an error.
      return (
        <div className="p-2">
          <ErrorMessage size="sm" message={t(`${I18N}.typesFailed`)} onRetry={refetch} />
        </div>
      );
    }

    if (isEmpty) {
      // Two causes, and the copy names both without asserting either: the
      // server filters this list on provider composition AS WELL AS permission,
      // so in a split deployment it is empty for a reason no permission grant
      // would fix.
      return (
        <EmptyState
          bare
          size="sm"
          icon={Layers}
          title={t(`${I18N}.noTypesAvailable`)}
          description={t(`${I18N}.noTypesAvailableHint`)}
        />
      );
    }

    return (
      <>
        {/* cmdk filters this list itself (`shouldFilter` is left on, unlike the
            record panel where the SERVER filters), so it also owns the "your
            filter matched nothing" case -- which is a different sentence from
            "there is nothing you may reference" above. */}
        <CommandEmpty>{t(`${I18N}.typeNoResults`)}</CommandEmpty>
        {types.map((type) => (
          <SelectOptionRow
            key={type.key}
            option={{
              value: type.key,
              label: typeDisplayName(type, language),
              // The owning module as the row's second line. `EntityLookupType`
              // documents this field as being for grouping a long list rather
              // than filtering one; showing it here is neither -- it is
              // disambiguation, because two modules may each register a type
              // whose display name reads the same.
              description: type.owningModule,
            }}
            selected={type.key === selectedKey}
            multi={false}
            onSelect={() => onSelect(type)}
          />
        ))}
      </>
    );
  })();

  return (
    <>
      {/* Announced, not just drawn -- the same treatment the record panel gets,
          and needed here for the same reason: the first open of this panel is a
          network round trip, and a list that silently fills in underneath a
          screen-reader user gives them nothing. */}
      <span className="sr-only" aria-live="polite">
        {isLoading
          ? t("common.loading")
          : t("components.select.optionsAvailable", { count: types.length })}
      </span>
      <CommandList>{body}</CommandList>
    </>
  );
}

/**
 * Documentation for module export
 */
export interface ReferenceTypeSelectorProps {
  /**
   * The RECORD field's id. This selector derives its own from it rather than taking a second
   * `useId`: `<Label htmlFor>` has to point at this element, and a caller that wants to reach
   * either field from outside (a test, an anchor, a focus call after a validation summary) can
   * then compute both ids from the one it was given.
   */
  recordFieldId: string;
  /** The RECORD field's label, used to name THIS field ("Record type for <field>"). */
  recordFieldLabel?: string;
  disabled?: boolean;
  /**
   * The chosen type. Owned by the parent, because it is what decides which entity type the
   * record picker searches and what a new pick is stamped with.
   */
  chosenType: EntityLookupType | null;
  /**
   * Records the chosen type. Called before this component closes its own panel, so focus goes
   * back to the type trigger -- where Radix returns it from the popover it owns. The record
   * picker is deliberately left closed and unfocused; see this file's header.
   *
   * The parent does NOT clear the held value in response. A value keeps its own
   * `entityTypeKey`, so it still resolves and still reads back correctly after the offer
   * changes; this is the same "the pin wins the offer without costing the value its display
   * name" split the definition-level pin already relies on.
   */
  onChosenTypeChange: (type: EntityLookupType) => void;
}

/**
 * Documentation for ReferenceTypeSelector
 */
export function ReferenceTypeSelector({
  recordFieldId,
  recordFieldLabel,
  disabled,
  chosenType,
  onChosenTypeChange,
}: ReferenceTypeSelectorProps): React.ReactElement {
  const { t, language } = useI18n();
  const [typeOpen, setTypeOpen] = React.useState(false);

  const typeFieldId = `${recordFieldId}__type`;
  const typeFieldLabel = t(`${I18N}.typeLabel`);
  const chosenTypeLabel = chosenType ? typeDisplayName(chosenType, language) : "";

  const handleTypeOpenChange = (next: boolean) => {
    // Same reasoning as the record picker's own `handleOpenChange`: `SelectTrigger` is a
    // <div>, so Radix's `disabled` attribute does not stop a pointer click on its own.
    if (next && disabled) return;
    setTypeOpen(next);
  };

  /** Records the chosen type and closes only the TYPE panel -- see `onChosenTypeChange`. */
  const handleTypeSelect = (type: EntityLookupType) => {
    onChosenTypeChange(type);
    setTypeOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={typeFieldId} className="text-sm font-medium">
        {typeFieldLabel}
      </Label>

      <Popover open={typeOpen} onOpenChange={handleTypeOpenChange}>
        <SelectTrigger
          id={typeFieldId}
          open={typeOpen}
          multi={false}
          disabled={disabled}
          // Never `required`: what the form requires is a RECORD, and
          // marking this one required would report a second missing field
          // for one empty value.
          placeholder={t(`${I18N}.typePlaceholder`)}
          // The visible label is short; the accessible name names the field
          // it belongs to, so two reference fields on one form do not both
          // announce as "Record type". The short label is a substring of
          // it, which is what WCAG's Label-in-Name asks for.
          ariaLabel={t(`${I18N}.typeLabelFor`, { field: recordFieldLabel ?? recordFieldId })}
          selectedOptions={
            chosenType ? [{ value: chosenType.key, label: chosenTypeLabel }] : []
          }
          displayLabel={chosenTypeLabel}
          maxSelectedDisplay={1}
          // Nothing to clear TO. The field is already unpinned; emptying
          // this selector would only re-disable the record picker, so the
          // way to change a wrong choice is to pick another type.
          allowClear={false}
          onClear={() => undefined}
          onRemoveOne={() => undefined}
        />

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
        >
          {/* `shouldFilter` left ON, unlike the record panel: this list is
              client-held and small, so cmdk is the right filter and no
              server round trip is involved. */}
          <Command label={t("select.optionsLabel")}>
            <CommandInput
              aria-label={t("select.searchLabel")}
              placeholder={t(`${I18N}.typeSearchPlaceholder`)}
            />
            {/* Mounted with the panel, which is what defers the fetch --
                see the component's own doc comment. */}
            <ReferenceTypeOptions
              selectedKey={chosenType?.key ?? null}
              onSelect={handleTypeSelect}
            />
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
