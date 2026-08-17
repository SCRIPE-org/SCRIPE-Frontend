"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { fieldVariants, resolveFieldStyle } from "@core/ui/input";
import { PopoverTrigger, Popover, PopoverContent } from "@core/ui/popover";
import { Badge } from "@core/ui/badge";
import type { GenericSelectOption } from "../generic-select";

export interface SelectTriggerProps {
  id?: string;
  name?: string;
  open: boolean;
  multi: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  describedBy?: string;
  /** Accessible name for this element — see `GenericSelectProps["aria-label"]`'s doc comment. */
  ariaLabel?: string;
  /** Accessible name via reference — see `GenericSelectProps["aria-labelledby"]`'s doc comment. */
  ariaLabelledBy?: string;
  placeholder: string;
  selectedOptions: GenericSelectOption[];
  /** Full label for the single-selected option, including any tree path. */
  displayLabel: string;
  maxSelectedDisplay: number;
  allowClear: boolean;
  onClear: () => void;
  onRemoveOne: (option: GenericSelectOption) => void;
  className?: string;
  /**
   * Anything else the caller put on GenericSelect — data-*, testids and the
   * like. Passed as one object rather than an index signature, which would
   * widen every declared prop above to `unknown`.
   */
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * The field half of the select.
 *
 * It wears the SAME surface as Input and Textarea — `fieldVariants` from
 * input.tsx — so the workspace `inputStyle` setting applies to it. Previously
 * GenericSelect hand-rolled its own trigger chrome, so switching the workspace
 * to `underlined` turned every Input into a bottom rule while every
 * GenericSelect stayed a box, on the same form.
 *
 * THE WHOLE FIELD is the combobox, not a button nested inside it. That matters
 * for three reasons, each of which was a real defect when the button was inner:
 *   1. Radix anchors the panel to the trigger, so a narrow inner button made
 *      the panel detach from the field — and in a multi-select full of chips it
 *      shrank toward zero width and floated mid-field, on opposite sides in the
 *      two writing directions.
 *   2. Clicking the chevron, the padding, or the whitespace between chips did
 *      nothing, because only the inner button opened the panel.
 *   3. The accessible name of a `<button>` is its text content — and a
 *      multi-select's content lived in the sibling chips, so a populated
 *      multi-select announced itself with no name at all. Moving to a
 *      `<div role="combobox">` did NOT fix this by itself: per ARIA,
 *      role="combobox" is Name From: author, not Name From: contents, so a
 *      nameless `<button>` just became a nameless `<div>`. What actually
 *      closes it is the `ariaLabel`/`ariaLabelledBy` props below, applied
 *      to this same element as real `aria-label`/`aria-labelledby`
 *      attributes (Wave 2 Step 2.2's Task 7b a11y fix) -- see those props'
 *      own doc comments and `GenericSelectProps["aria-label"]`'s for the
 *      full mechanism.
 *
 * It is a `div`, not a `button`, because the chips carry their own remove
 * controls and a button may not contain a button.
 */
export const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  (
    {
      id,
      name,
      open,
      multi,
      disabled,
      readOnly,
      invalid,
      required,
      describedBy,
      ariaLabel,
      ariaLabelledBy,
      placeholder,
      selectedOptions,
      displayLabel,
      maxSelectedDisplay,
      allowClear,
      onClear,
      onRemoveOne,
      className,
      wrapperProps,
    },
    ref
  ) => {
    const { t } = useI18n();
    const settings = useSettings();
    const [overflowOpen, setOverflowOpen] = React.useState(false);

    const visibleChips = multi ? selectedOptions.slice(0, maxSelectedDisplay) : [];
    const overflowChips = multi ? selectedOptions.slice(maxSelectedDisplay) : [];
    const hasSelection = selectedOptions.length > 0;
    const interactive = !disabled && !readOnly;

    const removeButtonClasses =
      // 24px hit area on a 12px glyph; the negative margins buy it without
      // widening the chip.
      "-my-1 -me-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none";

    return (
      <PopoverTrigger asChild disabled={!interactive}>
        <div
          ref={ref}
          id={id}
          data-name={name}
          role="combobox"
          // Radix supplies aria-expanded and aria-controls (pointing at the
          // panel it actually renders). Only the popup TYPE is overridden —
          // Radix says "dialog", and this one is a listbox.
          aria-haspopup="listbox"
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          aria-disabled={disabled || undefined}
          aria-readonly={readOnly || undefined}
          // role="combobox" is Name From: author, not Name From: contents --
          // the visible chips/placeholder text below are NOT enough on their
          // own to give this element an accessible name (a prior version of
          // this comment claimed otherwise; verified wrong against real
          // testing-library/AT behavior during Wave 2 Step 2.2's Task 4/7b
          // a11y fix). `aria-labelledby` wins over `aria-label` per the
          // standard accessible-name computation order when a caller
          // supplies both.
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          tabIndex={interactive ? 0 : -1}
          className={cn(
            fieldVariants({ inputStyle: resolveFieldStyle(settings.inputStyle) }),
            "flex min-h-10 w-full flex-wrap items-center gap-1 px-3 py-1.5 text-sm",
            interactive ? "cursor-pointer" : "cursor-default",
            // while its list is up the field stays the active thing
            open && "border-nx-accent shadow-nx-focus",
            // READ_ONLY_FIELD is written with `read-only:enabled:` selectors,
            // which only ever match a form-associated element — on a div the
            // whole string is inert, so the treatment is spelled out here.
            readOnly && "bg-transparent hover:border-nx-line",
            disabled && "border-nx-line bg-nx-raised text-nx-ink-3 shadow-none",
            className
          )}
          {...wrapperProps}
        >
          {visibleChips.map((option) => (
            <Badge
              key={option.uniqueKey ?? option.value}
              variant="secondary"
              className="max-w-[12rem] gap-1 pe-1 ps-2"
            >
              <span className="truncate" title={option.label}>
                {option.label}
              </span>
              {interactive && (
                <button
                  type="button"
                  aria-label={t("select.chip.remove", { label: option.label })}
                  className={removeButtonClasses}
                  onClick={(event) => {
                    // Removing a chip must not also toggle the panel.
                    event.stopPropagation();
                    onRemoveOne(option);
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
            </Badge>
          ))}

          {overflowChips.length > 0 && (
            // "+N" opens the rest, each still individually removable. The old
            // build replaced ALL chips with a plain "N Selected" span past the
            // third selection, which silently removed the only way to deselect
            // one item without clearing everything.
            <Popover open={overflowOpen} onOpenChange={setOverflowOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rounded-nx-sm focus-visible:shadow-nx-focus focus-visible:outline-none"
                  aria-label={t("components.multiSelect.moreSelected", {
                    count: overflowChips.length,
                  })}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <Badge variant="secondary">+{overflowChips.length}</Badge>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56 space-y-1 p-2">
                {overflowChips.map((option) => (
                  <div
                    key={option.uniqueKey ?? option.value}
                    className="flex items-center justify-between gap-2 rounded-nx-sm px-2 py-1 text-sm"
                  >
                    <span className="truncate" title={option.label}>
                      {option.label}
                    </span>
                    {interactive && (
                      <button
                        type="button"
                        aria-label={t("select.chip.remove", { label: option.label })}
                        className={removeButtonClasses}
                        onClick={() => onRemoveOne(option)}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          )}

          {/* Single-select shows its value here; multi-select shows the
              placeholder only while nothing is chosen, because the chips above
              already carry the value. */}
          {(!multi || !hasSelection) && (
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                hasSelection && !multi ? "text-nx-ink" : "text-nx-ink-3"
              )}
              title={!multi && hasSelection ? displayLabel : undefined}
            >
              {multi ? placeholder : displayLabel || placeholder}
            </span>
          )}

          <div className="ms-auto flex shrink-0 items-center gap-1">
            {allowClear && interactive && hasSelection && (
              <button
                type="button"
                aria-label={t("common.clearSelection")}
                onClick={(event) => {
                  event.stopPropagation();
                  onClear();
                }}
                onKeyDown={(event) => event.stopPropagation()}
                className={cn(removeButtonClasses, "h-5 w-5")}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
            {!readOnly && (
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "h-4 w-4 shrink-0 text-nx-ink-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  open && "rotate-180"
                )}
              />
            )}
          </div>
        </div>
      </PopoverTrigger>
    );
  }
);

SelectTrigger.displayName = "SelectTrigger";
