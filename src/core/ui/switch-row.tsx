"use client";

import * as React from "react";
import { cn } from "@core/common/utils";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";

export interface SwitchRowProps {
  /** The control's accessible name. Rendered as a real <label htmlFor>. */
  label: React.ReactNode;
  /** Optional supporting copy, wired to the switch through aria-describedby. */
  description?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** In-flight mutation — keeps the live colours, blocks interaction. */
  busy?: boolean;
  /** Displayed but not editable. Stays focusable. */
  readOnly?: boolean;
  invalid?: boolean;
  /** Defaults to a generated id; supply one only to match an external label. */
  id?: string;
  className?: string;
}

/**
 * A labelled switch row: name and description on the inline start, control on
 * the inline end.
 *
 * This exists because the pattern had been re-implemented three times locally
 * and only one of those associated its label with the control — the other two
 * rendered the name as a plain <span>/<p>, which leaves the switch with no
 * accessible name and no click target on the text.
 *
 * The name sits before the control in the DOM, so `peer-disabled:` cannot
 * reach it (a peer only styles FOLLOWING siblings). Disabled dimming is
 * therefore applied explicitly rather than left to a selector that would
 * silently never match.
 */
export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  busy,
  readOnly,
  invalid,
  id,
  className,
}: SwitchRowProps) {
  const generatedId = React.useId();
  const switchId = id ?? generatedId;
  const descriptionId = description ? `${switchId}-description` : undefined;

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0 space-y-1">
        <Label
          htmlFor={switchId}
          className={cn(disabled ? "cursor-not-allowed text-nx-ink-3" : "cursor-pointer")}
        >
          {label}
        </Label>
        {description && (
          <p id={descriptionId} className="text-xs leading-relaxed text-nx-ink-3">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        busy={busy}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        aria-describedby={descriptionId}
      />
    </div>
  );
}
