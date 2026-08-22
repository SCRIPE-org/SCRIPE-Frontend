"use client";

/**
 * EntityReference / UserReference's dedicated edit control -- Wave 4 item 4.
 *
 * One control serves BOTH value types. They differ only in which target type
 * key is supplied (`identity.user` for UserReference, whatever the definition
 * pins for EntityReference), which is data, not a control type -- so there is
 * one `FieldConfig["type"]` member (`"entity-reference"`) and one component,
 * the same "the UI is genuinely the same, only the data differs" reasoning
 * that kept Select and MultiSelect on one `GenericSelect`.
 *
 * **Why this does not go through `GenericSelect`, and why it is still not a
 * second select.** `GenericSelect` is the right primitive for a list the
 * client already holds or can fetch in one shot; three properties of a stored
 * entity reference put it outside that envelope, each verified against
 * `generic-select.tsx` / `use-select-options.ts` rather than assumed:
 *
 *   1. **Paged, accumulating server search.** Its whole server-search contract
 *      is `onServerSearch: (query) => Promise<GenericSelectOption[]>`, whose
 *      result REPLACES the option list (`setServerOptions(dedupeByValue(
 *      results))`). There is no page cursor, no accumulation, no
 *      `hasNextPage`, and no affordance in `SelectPanel` that could trigger a
 *      "load more" -- a lookup over a tenant's whole member table needs all
 *      four.
 *   2. **The label is not in the list.** A stored reference carries only
 *      `{ entityTypeKey, entityId }`; the display name comes from a separate
 *      `Resolve` call, and is deliberately NOT snapshotted (see the next
 *      paragraph). `useSelectOptions`'s closed-field fallback for a value it
 *      has no option for is `{ value: val, label: val }` -- which here would
 *      render the raw ENCRYPTED id in the field, the one thing this control
 *      must never do.
 *   3. **Failure is not one state.** `GenericSelect` has a single
 *      `error: string | null` channel, rendered inside the panel. This control
 *      has to render 403, 404 and 400 as three different sentences in the
 *      CLOSED field (see below), plus a fourth, valid-but-dormant state.
 *
 * So the panel body is composed here from the same primitives `GenericSelect`
 * is itself assembled from -- `Popover`/`PopoverContent`, `Command`/
 * `CommandInput`/`CommandList`, and `SelectOptionRow` verbatim for the rows --
 * and the field half is `SelectTrigger` verbatim, unchanged. Nothing about the
 * combobox surface, the keyboard open path, the clear affordance, the chevron
 * or the RTL treatment is re-implemented; only the list body differs, because
 * only the list body needs paging.
 *
 * **Display names are never stored, so they are never cached into form
 * state.** The backend projects a reference with no name on purpose: a
 * snapshotted name would be readable by anyone holding the OWNER record's
 * permission while the name itself is guarded by the TARGET type's. Every
 * render of a stored value therefore goes through `useResolveEntityReference`,
 * and the resolved name lives only in that hook -- it is never folded into
 * `value`, which stays exactly `{ entityTypeKey, entityId }` from load to
 * save.
 *
 * **`onChange` emits `{ entityTypeKey, entityId }`, always.** That is the
 * whole wire shape, in both directions: the backend's `Parse` reads those two
 * JSON properties and its `Project` writes them back. The
 * `EncryptedEntityId` in its `EntityReferenceInput` record is a CLR parameter
 * name, built positionally with no `[JsonPropertyName]` anywhere -- so
 * `encryptedEntityId` is not a property name this product ever sends, and
 * emitting it here would be a data-loss bug rather than a spelling choice: the
 * save would carry no `entityId`, which `Validate` refuses as the 422 written
 * for a half-filled reference. See the verified backend trace above
 * `isEntityReferenceValue` in `CustomFieldValueModel.ts`.
 *
 * **403, 404 and 400 stay three sentences.** They are three different facts
 * with three different fixes:
 *   - 403 the CALLER lacks the target type's `view` permission -- a fact about
 *     a role. The reference is fine; this user cannot read it. The field goes
 *     `readOnly` (readable, no picker, no grey slab -- `SelectTrigger`'s own
 *     distinction) rather than blank, because blanking it invites someone with
 *     no visibility into the target to overwrite a perfectly good reference.
 *   - 404 the record does not resolve -- deleted, soft-deleted, or another
 *     tenant's, deliberately merged into one answer server-side. A fact about
 *     the data. The field STAYS editable: re-picking is the fix.
 *   - 400 the stored id is malformed or tampered. Also editable, and
 *     additionally `aria-invalid`, because unlike a dangling reference this
 *     one is not a value the system ever legitimately produced.
 * Collapsing the first two into one grey dash is what makes a dangling
 * reference invisible for a year, and the two remedies (change a role / change
 * the data) have nothing to do with each other.
 *
 * **`isActive: false` is dormant, not deleted.** A deleted row does not
 * resolve at all -- it 404s. A dormant row is present, selectable, and still a
 * valid value, so it is marked with a chip rather than treated as an error or
 * filtered out of the list.
 *
 * **No target type configured is a first-class state, not an empty list.**
 * Definition-level target pinning for EntityReference is a separate work item;
 * until it lands a definition cannot say what its picker should offer.
 * `targetEntityTypeKey` is therefore a prop, and the absence of one renders a
 * disabled field plus a localized explanation -- never a dropdown that opens
 * onto nothing, which reads as "the server returned no records" and sends the
 * operator looking in the wrong place. UserReference, whose target is fixed at
 * `identity.user` by the backend's own allowlist, always has one and so ships
 * fully usable today.
 *
 * **A stored value still renders when the picker cannot be used.** Resolution
 * is driven by `value.entityTypeKey`, which travels with the value, not by
 * `targetEntityTypeKey`. So a field whose definition lost (or has not yet
 * gained) a pinned target still shows what it holds; only CHANGING it is
 * disabled. Hiding a value because the config that would let you edit it is
 * missing loses information for no gain.
 *
 * **Accessible name via `aria-label`, never `<Label htmlFor>` alone.** The
 * trigger is a `<div role="combobox">`, and per ARIA that role is Name From:
 * author -- a `for`/`htmlFor` pointing at it computes NO accessible name
 * (`select-trigger.tsx`'s own prop doc comment traces the mechanism, and Wave
 * 2 had to repair this in several places after the fact). The `<Label>` is
 * kept because it is real, clickable DOM wiring for sighted users; the name
 * comes from `aria-label={label ?? id}`.
 */
import * as React from "react";
import { Inbox, SearchX } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { Popover, PopoverContent } from "@core/ui/popover";
import { Command, CommandInput, CommandList } from "@core/ui/command";
import { SelectTrigger } from "@core/crud/components/select/select-trigger";
import { SelectOptionRow } from "@core/crud/components/select/select-option-row";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { useEntityLookupSearch } from "../../../entity-lookup/src/presentation/hooks/useEntityLookupSearch";
import {
  useResolveEntityReference,
  type EntityReferenceResolveStatus,
} from "../../../entity-lookup/src/presentation/hooks/useResolveEntityReference";
import type { EntityLookupItem } from "../../../entity-lookup/src/data/models/EntityLookupModel";
import type { CustomFieldEntityReferenceValue } from "../../../custom-field-value/src/data/models/CustomFieldValueModel";

/**
 * Locale key prefix for everything this control says. Collected in one
 * constant so the whole surface of strings this component depends on is
 * greppable from one place, rather than being spelled out fourteen times.
 */
const I18N = "customField.entityReference";

/** Skeleton rows shown while the first page is in flight -- same count `SelectPanel` uses, so the panel keeps its height and the list does not jump when results land. */
const LOADING_ROW_COUNT = 5;

export interface EntityReferenceCustomFieldControlProps {
  /**
   * Lands on the `role="combobox"` element, so the sibling `<Label htmlFor>`
   * binds to the real field and a click on the label focuses it. It is NOT
   * what computes the accessible name -- see this file's header comment.
   */
  id: string;
  label?: string;
  /** Target entity type key. null/undefined => render the "no target configured" state. */
  targetEntityTypeKey?: string | null;
  value: CustomFieldEntityReferenceValue | null;
  onChange: (next: CustomFieldEntityReferenceValue | null) => void;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
}

/**
 * The picker for `EntityReference` and `UserReference` custom-field values.
 *
 * Controlled: the parent owns `value`, and every selection or clear is
 * reported through `onChange` as `{ entityTypeKey, entityId }`. See this file's header
 * comment for the four states this renders (no target / resolving+resolved /
 * forbidden / missing / invalid) and why each is distinct.
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
}: EntityReferenceCustomFieldControlProps): React.ReactElement {
  const { t } = useI18n();
  const hintId = React.useId();
  const [open, setOpen] = React.useState(false);

  // The panel's search box is driven by LOCAL state, not by the hook's own
  // `query`. The hook documents `setQuery` as "debounced internally", and a
  // controlled input whose displayed value arrives 300ms late drops and
  // reorders characters under a fast typist. The hook still receives every
  // keystroke immediately -- it is the REQUEST that is debounced, never the
  // input -- exactly as `useSelectOptions` already splits the two.
  const [draft, setDraft] = React.useState("");

  // Whitespace-only is not a target key. A definition that stored " " would
  // otherwise open a picker against a type key the server cannot route.
  const hasTarget = typeof targetEntityTypeKey === "string" && targetEntityTypeKey.trim() !== "";
  const canPick = hasTarget && !disabled;

  // Gated on `open`, deliberately. A record form can carry a dozen reference
  // fields; firing a dozen first-page lookups on mount to populate lists
  // nobody has opened is a real cost, and unlike `GenericSelect` (which must
  // preload because its closed field reads its label out of the search
  // response) this control gets its closed-field label from `Resolve`, so it
  // needs nothing from the search endpoint until the panel is actually up.
  // `entityTypeKey: null` and `enabled: false` say different things to the
  // hook (no target at all vs. a target nobody has asked about yet), so both
  // are stated honestly rather than folding one into the other.
  const search = useEntityLookupSearch({
    entityTypeKey: hasTarget ? targetEntityTypeKey : null,
    enabled: canPick && open,
  });

  // Resolution is keyed off the VALUE's own type key, not the prop -- see this
  // file's header comment on why a held value still renders when the picker is
  // disabled.
  const resolution = useResolveEntityReference(value);

  const hasValue = value !== null && value !== undefined;
  // Normalised rather than read straight through: a hook that keeps its last
  // status after the reference is cleared would otherwise leave a stale
  // "missing" sentence in an empty field.
  const status: EntityReferenceResolveStatus = hasValue ? resolution.status : "idle";
  const item: EntityLookupItem | null = hasValue ? resolution.item : null;

  const isResolving = hasValue && (status === "idle" || status === "loading");
  const isForbidden = status === "forbidden";
  const isDormant = status === "resolved" && item?.isActive === false;

  const inactiveSuffix = t(`${I18N}.inactiveSuffix`);

  /**
   * What the CLOSED field says. Every branch returns real, localized text --
   * there is no path here that yields an empty field for a value that exists,
   * and none that yields the encrypted id.
   */
  const fieldText = (() => {
    if (!hasValue) return "";
    switch (status) {
      case "resolved":
        // A resolved status with no item is not a state the hook should
        // produce, but falling back to "resolving" beats rendering nothing.
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
  })();

  const options: GenericSelectOption[] = search.items.map((entry) => ({
    value: entry.id,
    label: entry.displayName,
    ...(entry.secondary ? { description: entry.secondary } : {}),
    // Dormant rows stay in the list and stay selectable; the chip is the only
    // difference. Filtering them out would make a legitimately held value
    // unreachable, and disabling them would make it unrenewable.
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
    // Load-bearing, not belt-and-braces -- and the reason `GenericSelect`
    // carries the identical guard in its own `handleOpenChange`. Radix's
    // `PopoverTrigger asChild disabled` puts a plain `disabled` ATTRIBUTE on
    // the trigger, and Radix gets away with wiring no check into its own
    // `onClick` because it normally renders a native `<button>`, where the
    // browser swallows the click. `SelectTrigger` is a `<div>` (a button may
    // not contain the chip/clear buttons it holds), so that attribute is
    // inert: without this line a pointer click opens a field that is supposed
    // to be inoperable -- including the no-target field, which would then show
    // exactly the empty dropdown this control exists to avoid. Keyboard is
    // already covered by `SelectTrigger`'s own `interactive` check.
    // Only OPENING is guarded; closing must always be allowed, or a field
    // disabled while its panel is up could never be shut again.
    if (next && (!canPick || isForbidden)) return;
    setOpen(next);
    // Closing drops the query, matching `GenericSelect`'s own `resetQuery()`
    // on close: reopening onto somebody else's half-typed search, with a list
    // filtered by a term no longer visible anywhere, reads as data loss.
    if (!next) {
      setDraft("");
      search.setQuery("");
    }
  };

  const handleQueryChange = (next: string) => {
    setDraft(next);
    search.setQuery(next);
  };

  /**
   * Emits the wire shape and closes the panel. `entityTypeKey` comes from the
   * picker's target, which is by construction the type that was searched --
   * never from the option, which carries only an id.
   */
  const handleSelect = (option: GenericSelectOption) => {
    onChange({ entityTypeKey: targetEntityTypeKey as string, entityId: option.value });
    handleOpenChange(false);
  };

  const handleClear = () => onChange(null);

  /**
   * The described-by region. Composed rather than overwritten: a caller that
   * passes `describedBy` (a form's own help/error text) keeps it, and this
   * control's own note is appended -- `aria-describedby` takes an id LIST, so
   * both are announced.
   */
  const hint = (() => {
    if (!hasTarget) {
      return <p className="text-xs text-nx-ink-3">{t(`${I18N}.noTargetConfigured`)}</p>;
    }
    if (status === "resolved" && item) {
      return (
        <div className="flex items-center gap-2 text-xs text-nx-ink-3">
          {/* The combobox's accessible NAME is the field label, so the value
              sitting inside the trigger is not part of it. This sr-only line
              is what actually tells a screen-reader user which record is
              currently selected when they land on the field. */}
          <span className="sr-only">
            {t(`${I18N}.selectedLabel`)}
          </span>
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
  })();

  const describedByValue =
    [describedBy, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  /**
   * The panel's list body. Five states, five different things -- the same
   * discipline `SelectPanel` documents, for the same reason: a failed request,
   * an empty type and an unmatched search are three different problems and one
   * shared "No Results" node hides all three.
   */
  const panelBody = (() => {
    if (search.error) {
      return (
        <div className="p-2">
          {/* Deliberately the localized key rather than anything read off the
              error object: the lookup error's own shape belongs to the data
              layer, and a raw server string would arrive untranslated. */}
          <ErrorMessage size="sm" message={t(`${I18N}.searchFailed`)} onRetry={search.reload} />
        </div>
      );
    }
    if (search.isLoading) {
      return (
        <div className="space-y-1 p-1" aria-hidden="true">
          {Array.from({ length: LOADING_ROW_COUNT }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full rounded-nx-sm" />
          ))}
        </div>
      );
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
        selected={option.value === value?.entityId}
        multi={false}
        onSelect={handleSelect}
      />
    ));
  })();

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <SelectTrigger
          id={id}
          open={open}
          multi={false}
          // No target and an explicitly disabled field are both "you cannot
          // operate this", and both must therefore also be un-openable by
          // keyboard -- `disabled` is what makes `SelectTrigger` drop out of
          // the tab order and disable Radix's trigger.
          disabled={disabled || !hasTarget}
          // 403 only. Readable, no picker, no grey slab -- see the header.
          readOnly={isForbidden}
          // A stored id the server rejected as malformed IS an invalid value,
          // and saying so through `aria-invalid` is the only channel a screen
          // reader has for it. The caller's own `invalid` still wins when set.
          invalid={invalid || status === "invalid"}
          required={required}
          describedBy={describedByValue}
          ariaLabel={label ?? id}
          placeholder={placeholder ?? t(`${I18N}.placeholder`)}
          // One synthetic option so the trigger knows it holds a value: that
          // is what turns on its clear affordance and the value-coloured text.
          // The label is the resolved name, never the encrypted id.
          selectedOptions={hasValue ? [{ value: value.entityId, label: fieldText }] : []}
          displayLabel={fieldText}
          maxSelectedDisplay={1}
          // Required fields keep their value: clearing one only trades a
          // resolvable reference for a validation error. A forbidden reference
          // is likewise not clearable, for the reason in the header comment.
          allowClear={!required && !isForbidden}
          onClear={handleClear}
          onRemoveOne={handleClear}
          // `aria-busy` rides in through wrapperProps because it is a
          // per-render fact about THIS control, not part of SelectTrigger's
          // own contract. Spread before its own aria attributes, so it cannot
          // collide with them.
          wrapperProps={isResolving ? { "aria-busy": true } : {}}
        />

        {/* Never mounted without a target: a dropdown that opens onto nothing
            reads as "the server has no records", which is a different problem
            from "this field was never configured". */}
        {canPick && (
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
          >
            {/*
              `label` names the listbox -- cmdk defaults it to the hardcoded
              English "Suggestions". `shouldFilter={false}` because the SERVER
              filters: letting cmdk score the rows again would hide results the
              backend deliberately matched on a secondary field.
            */}
            <Command label={t("select.optionsLabel")} shouldFilter={false}>
              <CommandInput
                aria-label={t("select.searchLabel")}
                placeholder={t(`${I18N}.searchPlaceholder`)}
                value={draft}
                onValueChange={handleQueryChange}
              />

              {/* Announced, not just drawn. A screen-reader user typing into a
                  server-backed search gets no feedback at all from a list that
                  silently re-renders underneath them. */}
              <span className="sr-only" aria-live="polite">
                {search.isLoading
                  ? t(`${I18N}.searching`)
                  : t("components.select.optionsAvailable", { count: options.length })}
              </span>

              <CommandList>{panelBody}</CommandList>

              {/* Paging is an explicit button, not a scroll sentinel: an
                  IntersectionObserver inside a portalled, height-capped panel
                  fires on mount in some collision cases and pages twice before
                  the user has scrolled at all. Outside CommandList so it is a
                  real Tab stop rather than a fake option row in the listbox. */}
              {search.hasNextPage && (
                <div className="border-t border-nx-line p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={search.loadMore}
                    disabled={search.isLoadingMore}
                  >
                    {search.isLoadingMore ? t("common.loading") : t(`${I18N}.loadMore`)}
                  </Button>
                </div>
              )}
            </Command>
          </PopoverContent>
        )}
      </Popover>

      {hint && <div id={hintId}>{hint}</div>}

      {/* Retry sits OUTSIDE the described-by region on purpose: interactive
          content inside an `aria-describedby` target is not reliably reachable
          from the description, so it would announce as unactionable text. */}
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
