/**
 * FlatSection Component
 *
 * Renders the secondary section for irregular or fine-grained permissions that do not
 * map neatly into standard CRUD action columns. Organizes permissions into category sub-groups
 * with tri-state select-all controls and inline scope/field configuration dialog triggers.
 */
"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@core/ui/checkbox";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { Permission } from "@modules/identity/permissions";
import { PermissionConfigDialog } from "./PermissionConfigDialog";
import { scopeLabel } from "./scope-label";
import { isCustomConfig } from "./MatrixCell";
import { TriStateCheckbox } from "./TriStateCheckbox";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";

/**
 * Properties for the FlatSection component.
 */
export interface FlatSectionProps {
  /** Indicates whether the parent module also displays a tabular matrix above this section. */
  hasMatrix: boolean;
  /** Collection of permissions that do not align with core CRUD grid columns. */
  permissions: Permission[];
  /** Set of currently active permission codes. */
  selectedPermissionCodes: Set<string>;
  /** Optional map of existing permission assignment overrides. */
  assignments?: Map<string, PermissionAssignmentJson>;
  /** Optional custom CSS class name. */
  className?: string;
  /** Callback fired when an individual permission code is toggled. */
  onTogglePermission: (code: string) => void;
  /** Callback fired to toggle a group of permissions (bulk select/deselect). */
  onToggleGroup: (permissions: Permission[]) => void;
  /** Optional callback fired when a permission's override configuration is saved. */
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

/**
 * Renders the irregular permissions list grouped by resource category.
 */
export function FlatSection({
  hasMatrix,
  permissions,
  selectedPermissionCodes,
  assignments,
  className,
  onTogglePermission,
  onToggleGroup,
  onUpdateConfig,
}: FlatSectionProps) {
  const { t } = useI18n();

  // Group flat permissions by their category for clear cognitive hierarchy
  const permsByCategory = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const cat = p.category || "General";
      const list = map.get(cat) ?? [];
      list.push(p);
      map.set(cat, list);
    }
    return map;
  }, [permissions]);

  const selectedInFlat = permissions.reduce(
    (n, p) => n + (selectedPermissionCodes.has(p.code) ? 1 : 0),
    0
  );

  return (
    <div className={cn(hasMatrix && "border-t border-nx-line", className)}>
      <div className="bg-nx-surface-sunken/40 flex items-center justify-between border-b border-nx-line px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-2">
          {t("roleDetail.additionalCapabilities")}
        </span>
        <span className="text-[11px] font-normal tabular-nums text-nx-ink-3">
          {selectedInFlat} / {permissions.length}
        </span>
      </div>

      {Array.from(permsByCategory.entries()).map(([categoryName, catPerms]) => {
        const catSelected = catPerms.filter((p) => selectedPermissionCodes.has(p.code)).length;

        return (
          <div key={categoryName} className="border-nx-line/60 border-b last:border-b-0">
            {permsByCategory.size > 1 && (
              <div className="bg-nx-surface-sunken/20 flex items-center justify-between px-4 py-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <TriStateCheckbox
                    total={catPerms.length}
                    selected={catSelected}
                    disabled={catPerms.length === 0}
                    onToggle={() => onToggleGroup(catPerms)}
                    label={categoryName}
                  />
                  <span className="font-medium text-nx-ink-2">{categoryName}</span>
                </div>
                <span className="text-[11px] tabular-nums text-nx-ink-3">
                  {catSelected} / {catPerms.length}
                </span>
              </div>
            )}

            {catPerms.map((permission) => (
              <FlatPermRow
                key={permission.id}
                permission={permission}
                isSelected={selectedPermissionCodes.has(permission.code)}
                assignment={assignments?.get(permission.code)}
                onToggle={() => onTogglePermission(permission.code)}
                onUpdateConfig={onUpdateConfig}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Properties for the FlatPermRow component.
 */
export interface FlatPermRowProps {
  /** The domain permission model for this row. */
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
 * Renders an individual permission item within the irregular permissions list.
 */
export function FlatPermRow({
  permission,
  isSelected,
  assignment,
  className,
  onToggle,
  onUpdateConfig,
}: FlatPermRowProps) {
  const { t, language } = useI18n();
  const [showConfig, setShowConfig] = useState(false);
  const custom = isCustomConfig(assignment);
  const hasRestrictions = (assignment?.restrictedFields?.length ?? 0) > 0;
  const scopeOverrideText =
    t("role.scopeOverride") !== "role.scopeOverride"
      ? t("role.scopeOverride")
      : t("roles.scopeOverride");
  const scopeButtonLabel = `${permission.getLocalizedName(language)} — ${scopeOverrideText}`;

  return (
    <div
      className={cn(
        "flex h-9 items-center gap-3 px-4 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none",
        className
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        aria-label={permission.getLocalizedName(language)}
      />
      <span className="min-w-0 flex-1 truncate text-sm text-nx-ink">
        {permission.getLocalizedName(language)}
      </span>

      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="hidden shrink-0 cursor-help font-mono text-xs text-nx-ink-3 sm:inline"
              tabIndex={0}
            >
              {permission.code}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{permission.code}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isSelected && onUpdateConfig && (
        <>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfig(true)}
                  aria-label={scopeButtonLabel}
                  className={cn(
                    "h-6 shrink-0 gap-1 rounded-nx-sm px-2 py-0.5 text-[11px] font-normal transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    "focus-visible:shadow-nx-focus focus-visible:outline-none",
                    custom
                      ? "bg-nx-accent-wash/30 hover:bg-nx-accent-wash/50 border-nx-accent text-nx-accent"
                      : "border-nx-line text-nx-ink-3 hover:border-nx-line-hi hover:text-nx-ink-2"
                  )}
                >
                  {hasRestrictions && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-nx-accent" />
                  )}
                  <span>{scopeLabel(t, assignment?.scopeOverride)}</span>
                  {hasRestrictions && (
                    <Badge
                      variant="default"
                      className="h-4 px-1 text-[10px] font-medium leading-none"
                    >
                      {assignment!.restrictedFields!.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{scopeButtonLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
        </>
      )}
    </div>
  );
}
