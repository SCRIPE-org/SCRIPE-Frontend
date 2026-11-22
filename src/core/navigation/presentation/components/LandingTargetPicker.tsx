"use client";

import { GroupedCombobox } from "@core/ui/grouped-combobox";
import type {
  LandingTargetCatalog,
  LandingTargetScopeMode,
} from "../../domain/entities/LandingTargetCatalog";
import type { NavigationData } from "../../domain/entities/NavigationData";
import type { WorkspaceGroup } from "../../domain/entities/WorkspaceGroup";
import {
  buildStructuredLandingTargetOptions,
  type LandingTargetOptionLabels,
  type StructuredLandingOption,
} from "../../domain/utils/landing-target-options";

export interface LandingTargetPickerProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Pre-built options; if omitted, built from workspaceGroups + catalog + scopeMode + labels. */
  options?: StructuredLandingOption[];
  language?: string;
  workspaceGroups?: WorkspaceGroup[];
  cachedWorkspaces?: Map<string, NavigationData>;
  catalog?: LandingTargetCatalog | null;
  scopeMode?: LandingTargetScopeMode;
  currentTarget?: string | null;
  labels?: LandingTargetOptionLabels;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "data-testid"?: string;
  className?: string;
}

/**
 * Reusable grouped searchable landing-target picker composing `@core/ui/grouped-combobox`.
 * Surfaces all unlocked workspaces & authorized leaf pages with RTL-safe `<bdi>` segments
 * and readable localized fallback for unavailable legacy targets.
 */
export function LandingTargetPicker({
  id,
  value,
  onValueChange,
  options,
  language = "en",
  workspaceGroups = [],
  cachedWorkspaces,
  catalog,
  scopeMode = "current_context",
  currentTarget,
  labels,
  placeholder,
  searchPlaceholder,
  emptyText,
  loading = false,
  disabled = false,
  invalid = false,
  describedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "data-testid": dataTestId,
  className,
}: LandingTargetPickerProps) {
  const resolvedOptions =
    options ??
    (labels
      ? buildStructuredLandingTargetOptions({
          language,
          workspaceGroups,
          cachedWorkspaces,
          catalog,
          scopeMode,
          currentTarget: currentTarget ?? value,
          labels,
        })
      : []);

  return (
    <GroupedCombobox
      id={id}
      value={value}
      onValueChange={onValueChange}
      options={resolvedOptions}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      loading={loading}
      disabled={disabled}
      invalid={invalid}
      describedBy={describedBy}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-testid={dataTestId}
      className={className}
    />
  );
}
