import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

// THE field surface — Input, Textarea and the Select trigger render the same
// skin, so a form reads as one control repeated, never as three components.
//
// Every state is designed here, not just rest and focus:
//   rest      sunken --nx-ground behind a hairline
//   hover     the hairline lifts one step
//   focus     the lit edge: border to accent + the --nx-focus inset line and
//             wash ring. No offset halo, no coloured drop shadow.
//   invalid   the same edge re-hued to --nx-danger, driven by aria-invalid
//             (FormControl already sets it) — colour and an icon-free message,
//             never a shouting fill
//   disabled  a flat --nx-raised slab with --nx-ink-3 ink: DEDICATED tokens,
//             never opacity math over a tinted surface
//
// Read-only is the Input/Textarea's own business (in CSS terms a button
// trigger is :read-only too), so it lives on those two components, not here.
//
// The state ladder is ordered, not accidental. Tailwind emits hover →
// focus-visible → disabled → aria-[…] in that order, so each later state wins
// the tie against the one before it; where a state has to beat something of
// EQUAL rank the modifier is stacked to outrank it by specificity (the
// aria-[invalid]:hover / aria-[invalid]:focus-visible pairs, and the
// disabled+invalid guard). The result: a focused field never falls back to a
// hover hairline, an inert field never answers the pointer, and the error edge
// survives every interaction.
//
// Only colour/edge properties transition, at micro speed; motion-reduce drops
// even that.
const fieldVariants = cva(
  cn(
    "flex w-full text-nx-ink placeholder:text-nx-ink-3",
    "transition-[color,border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
    "focus-visible:outline-none",
    // error edge — rest, hover and focus, each one step above the state it must beat
    "aria-[invalid=true]:border-nx-danger",
    "aria-[invalid=true]:hover:border-nx-danger",
    "aria-[invalid=true]:focus-visible:border-nx-danger",
    "aria-[invalid=true]:focus-visible:shadow-[inset_0_0_0_1px_var(--nx-danger),0_0_0_3px_color-mix(in_srgb,var(--nx-danger)_18%,transparent)]",
    // inert by design — a filled slab, no hairline contrast, no focus ring;
    // inert outranks invalid, because a field nobody can fix must not shout
    "disabled:cursor-not-allowed disabled:border-nx-line disabled:bg-nx-raised disabled:text-nx-ink-3 disabled:shadow-none",
    "disabled:aria-[invalid=true]:border-nx-line"
  ),
  {
    variants: {
      // The Settings inputStyle values, mapped onto token-backed styles.
      inputStyle: {
        default:
          "rounded-nx-control border border-nx-line bg-nx-ground hover:border-nx-line-hi focus-visible:border-nx-accent focus-visible:shadow-nx-focus",
        rounded:
          "rounded-full border border-nx-line bg-nx-ground px-4 hover:border-nx-line-hi focus-visible:border-nx-accent focus-visible:shadow-nx-focus",
        // one edge carries everything: focus doubles the underline to 2px with
        // an inset line rather than growing the border (which would shift text)
        underlined:
          "rounded-none border-0 border-b border-nx-line bg-transparent px-0 hover:border-nx-line-hi focus-visible:border-nx-accent focus-visible:shadow-[inset_0_-1px_0_0_var(--nx-accent)] disabled:bg-transparent",
        filled:
          "rounded-nx-control border border-transparent bg-nx-raised hover:bg-nx-raised-2 focus-visible:border-nx-accent focus-visible:shadow-nx-focus",
      },
    },
    defaultVariants: {
      inputStyle: "default",
    },
  }
);

// Stored settings can hold legacy values the variant map no longer knows;
// cva would silently apply NO style for those, so unknowns fall back to
// default here. The stored-value migration itself is Wave C's job.
const KNOWN_FIELD_STYLES = ["default", "rounded", "underlined", "filled"] as const;
type FieldStyle = (typeof KNOWN_FIELD_STYLES)[number];

const resolveFieldStyle = (value: string | undefined | null): FieldStyle =>
  (KNOWN_FIELD_STYLES as readonly string[]).includes(value ?? "")
    ? (value as FieldStyle)
    : "default";

// Read-only is NOT disabled: the value stays full-ink and selectable (these
// fields exist to be copied — client secrets, callback URLs), but the field
// sheds its fill and its hover answer so it stops promising an edit. Guarded
// with :enabled because a disabled input also matches :read-only in CSS.
const READ_ONLY_FIELD =
  "read-only:enabled:cursor-default read-only:enabled:bg-transparent read-only:enabled:hover:bg-transparent read-only:enabled:hover:border-nx-line";

// Digits that can be compared column-to-column get tabular figures; prose
// types keep proportional ones.
const NUMERIC_INPUT_TYPES = new Set([
  "number",
  "tel",
  "date",
  "datetime-local",
  "time",
  "month",
  "week",
]);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof fieldVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputStyle, ...props }, ref) => {
    const settings = useSettings();

    return (
      <input
        type={type}
        className={cn(
          // sizing + file-input chrome stay input-specific; the surface is shared.
          // text-base below md keeps iOS from zooming the viewport on focus.
          "h-10 px-3 py-2 text-base md:text-sm",
          // the file button reads as a small secondary control, not naked text.
          // The inert pair is written file:disabled: (not disabled:file:) on
          // purpose: variants apply right-to-left, so this emits
          // `:disabled::file-selector-button` — a pseudo-class BEFORE the
          // pseudo-element, which is the only order CSS accepts.
          "file:me-3 file:cursor-pointer file:rounded-nx-sm file:border-0 file:bg-nx-raised file:px-3 file:py-1 file:text-sm file:font-medium file:text-nx-ink-2 hover:file:bg-nx-raised-2 file:disabled:cursor-not-allowed file:disabled:bg-nx-raised-2 file:disabled:text-nx-ink-3",
          type && NUMERIC_INPUT_TYPES.has(type) && "tabular-nums",
          fieldVariants({
            inputStyle: inputStyle ?? resolveFieldStyle(settings.inputStyle),
          }),
          READ_ONLY_FIELD,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, fieldVariants, resolveFieldStyle, READ_ONLY_FIELD };
