/**
 * MatrixCell Component
 *
 * Renders a single cell inside the permission module matrix table, consisting of
 * a checkbox for toggling the permission assignment and an indicator/dialog trigger
 * for configuring scope overrides and field restrictions.
 */
"use client";

import { useState } from "react";
import { Checkbox } from "@core/ui/checkbox";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { Permission } from "@modules/identity/permissions";
import { PermissionConfigDialog } from "./PermissionConfigDialog";
import { EXPLICIT_SCOPES, scopeLabel } from "./scope-label";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";

/**
 * Checks whether a permission assignment carries a custom scope or restricted fields configuration.
 *
 * @param assignment - The permission assignment configuration to evaluate.
 * @returns True if the assignment has custom overrides; otherwise false.
 */
export function isCustomConfig(assignment?: PermissionAssignmentJson): boolean {
  if (!assignment) return false;
  if ((assignment.restrictedFields?.length ?? 0) > 0) return true;
  return !!assignment.scopeOverride && EXPLICIT_SCOPES.has(assignment.scopeOverride);
}

/**
 * Properties for the MatrixCell component.
 */
export interface MatrixCellProps {
  /** The domain permission model for this cell. */
  permission: Permission;
  /** Whether the permission is currently selected. */
  isSelected: boolean;
  /** Optional current assignment configuration. */
  assignment?: PermissionAssignmentJson;
  /** Optional custom CSS class name. */
  className?: string;
  /** Callback fired when the selection state is toggled. */
  onToggle: () => void;
  /** Optional callback fired when configuration is updated. */
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

/**
 * Renders an individual permission cell within the capability matrix table.
 */
export function MatrixCell({
  permission,
  isSelected,
  assignment,
  className,
  onToggle,
  onUpdateConfig,
}: MatrixCellProps) {
  const { t, language } = useI18n();
  const [showConfig, setShowConfig] = useState(false);
  const custom = isCustomConfig(assignment);
  const hasRestrictions = (assignment?.restrictedFields?.length ?? 0) > 0;
  const scopeOverrideText =
    t("role.scopeOverride") !== "role.scopeOverride"
      ? t("role.scopeOverride")
      : t("roles.scopeOverride");
  const label = `${permission.getLocalizedName(language)} — ${scopeOverrideText}: ${scopeLabel(
    t,
    assignment?.scopeOverride
  )}${hasRestrictions ? ` (${assignment!.restrictedFields!.length} restricted fields)` : ""}`;

  return (
    <span className={cn("inline-flex items-center justify-center gap-0.5", className)}>
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        aria-label={permission.getLocalizedName(language)}
      />
      {isSelected && onUpdateConfig && (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfig(true)}
                aria-label={label}
                className={cn(
                  "h-6 w-5 shrink-0 rounded-nx-sm p-0 hover:bg-nx-hover",
                  "focus-visible:shadow-nx-focus focus-visible:outline-none"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full border transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    custom ? "border-nx-accent bg-nx-accent-fill" : "border-nx-line"
                  )}
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {showConfig && (
        <PermissionConfigDialog
          open={showConfig}
          onOpenChange={setShowConfig}
          permission={{
            id: permission.id,
            code: permission.code,
            displayName: permission.getLocalizedName(language),
          }}
          currentAssignment={assignment}
          onSave={(next) => onUpdateConfig?.(permission.code, next)}
        />
      )}
    </span>
  );
}
