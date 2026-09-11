/**
 * TriStateCheckbox Component
 *
 * Provides a tri-state checkbox supporting checked, unchecked, and indeterminate states
 * using @core/ui/checkbox.
 */
"use client";

import { Checkbox } from "@core/ui/checkbox";
import { cn } from "@core/common/utils";

/**
 * Properties for the TriStateCheckbox component.
 */
export interface TriStateCheckboxProps {
  /** Total number of sub-items. */
  total: number;
  /** Number of selected sub-items. */
  selected: number;
  /** Whether the checkbox is disabled. */
  disabled?: boolean;
  /** Callback fired when the checkbox state toggles. */
  onToggle: () => void;
  /** Accessible label for the checkbox. */
  label: string;
  /** Optional custom CSS class name. */
  className?: string;
}

/**
 * A tri-state select-all checkbox: full accent fill when every child is on, a hollow
 * accent-washed box for the partial state, and plain when off.
 */
export function TriStateCheckbox({
  total,
  selected,
  disabled,
  onToggle,
  label,
  className,
}: TriStateCheckboxProps) {
  const all = total > 0 && selected === total;
  const some = selected > 0 && selected < total;
  return (
    <Checkbox
      checked={all ? true : some ? "indeterminate" : false}
      onCheckedChange={onToggle}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "data-[state=indeterminate]:border-nx-accent data-[state=indeterminate]:bg-nx-accent-wash data-[state=indeterminate]:text-nx-accent data-[state=indeterminate]:[&_svg]:hidden",
        className
      )}
    />
  );
}
