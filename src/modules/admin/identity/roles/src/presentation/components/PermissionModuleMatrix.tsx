/**
 * Permission Module Matrix Component
 *
 * Renders ONE backend module as a flat, scannable capability matrix instead of
 * the old box-in-box accordion. Because every permission code is `resource.action`
 * (roles.view, roles.create, …) the common CRUD actions line up into columns and
 * an operator can read a role's reach across every category WITHOUT expanding a
 * single node.
 *
 *   ── Module sub-header (sticky, chevron + count, lit edge when it carries any) ──
 *      │  category      │ View │ Create │ Update │ Delete │
 *      │  Admin mgmt    │  ☑   │   ☑    │   ☐    │   —    │
 *      └─ Additional (special actions that don't fit the grid) ─ flat rows
 *
 * ZERO client-side re-grouping of the backend tree: the module → category shape
 * is consumed as delivered; only the presentation layout (which action becomes a
 * column, which permission falls to the flat list) is derived here.
 *
 * This is the ONE permission renderer: the role detail page (PermissionTreeCard)
 * and the tenant "Manage permissions" dialog (RolePermissionsDialog) both mount
 * it, so a permission looks and behaves the same wherever it is edited.
 *
 * Consumed in: PermissionTreeCard, RolePermissionsDialog
 */
"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Checkbox } from "@core/ui/checkbox";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@core/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { Permission, PermissionCategoryGroup } from "@modules/identity/permissions";
import { PermissionConfigDialog } from "./PermissionConfigDialog";
import { EXPLICIT_SCOPES, scopeLabel } from "./scope-label";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";

// The canonical grid columns. These four actions recur across nearly every
// resource, so they form the scannable matrix; every other action (view_details,
// assign_roles, bulk_*, manage_permissions, …) is "irregular" and drops to the
// flat list under the module — the two-tier model the design calls for.
const CORE_ACTIONS = ["view", "create", "update", "delete"] as const;

// The grid columns are a closed set, so their headings come from the shared
// action vocabulary instead of a humanised backend token — "View" / "Create"
// were reaching the Arabic build untranslated, as both the column label and the
// select-all checkbox's accessible name.
const CORE_ACTION_LABEL_KEYS: Record<(typeof CORE_ACTIONS)[number], string> = {
  view: "common.view",
  create: "common.create",
  update: "common.update",
  delete: "common.delete",
};

/**
 * Interface defining property specifications, keys types, and structural contract rules for permission module matrix props.
 */
export interface PermissionModuleMatrixProps {
  module: string;
  categories: PermissionCategoryGroup[];
  isExpanded: boolean;
  selectedPermissionCodes: Set<string>;
  assignments?: Map<string, PermissionAssignmentJson>;
  className?: string;
  onToggleModule: () => void;
  onTogglePermission: (code: string) => void;
  /** Set-semantic bulk toggle (select-all / deselect-all) reused for rows AND columns. */
  onToggleGroup: (permissions: Permission[]) => void;
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

interface MatrixRow {
  category: string;
  /** One slot per core action column; null where that action has no permission here. */
  cells: (Permission | null)[];
}

/** A permission has a genuine override only when a field is restricted or an explicit scope was chosen. */
function isCustomConfig(assignment?: PermissionAssignmentJson): boolean {
  if (!assignment) return false;
  if ((assignment.restrictedFields?.length ?? 0) > 0) return true;
  return !!assignment.scopeOverride && EXPLICIT_SCOPES.has(assignment.scopeOverride);
}

/** Last-resort label for an action token the vocabulary does not name ("view_details" → "View details"). */
function humanize(token: string): string {
  const spaced = token.replace(/_/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Presentation UI component rendering a single module's permission matrix.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PermissionModuleMatrix({
  module,
  categories,
  isExpanded,
  selectedPermissionCodes,
  assignments,
  className,
  onToggleModule,
  onTogglePermission,
  onToggleGroup,
  onUpdateConfig,
}: PermissionModuleMatrixProps) {
  // Split the backend module into a griddable matrix plus a flat remainder. Memoised
  // on the category identity so the layout math runs once per data change, not per keystroke.
  const { coreActions, rows, flat, allPerms } = useMemo(() => {
    const all = categories.flatMap((c) => c.permissions);
    const present = CORE_ACTIONS.filter((a) => all.some((p) => p.action === a));

    const matrixRows: MatrixRow[] = [];
    const flatPerms: Permission[] = [];

    for (const cat of categories) {
      // Split category permissions by resource so multi-resource categories
      // (e.g. Identity Providers + OAuth Apps in "SSO & Identity") produce distinct matrix rows.
      const byResource = new Map<string, Permission[]>();
      for (const p of cat.permissions) {
        const res = p.resource || cat.category;
        const list = byResource.get(res) ?? [];
        list.push(p);
        byResource.set(res, list);
      }

      for (const [res, resPerms] of byResource.entries()) {
        const byAction = new Map<string, Permission[]>();
        for (const p of resPerms) {
          const arr = byAction.get(p.action) ?? [];
          arr.push(p);
          byAction.set(p.action, arr);
        }

        // A resource fits the grid only when each core action resolves to a single
        // permission — otherwise the whole resource drops to the flat list so no
        // permission is ever hidden behind an ambiguous cell.
        const collision = present.some((a) => (byAction.get(a)?.length ?? 0) > 1);
        const cells = present.map((a) => {
          const arr = byAction.get(a);
          return arr && arr.length === 1 ? arr[0] : null;
        });
        const hasCore = cells.some(Boolean);

        if (!collision && hasCore) {
          const rowLabel =
            byResource.size > 1
              ? `${cat.category} — ${humanize(res)}`
              : cat.category;

          matrixRows.push({ category: rowLabel, cells });
          for (const p of resPerms) {
            if (!present.includes(p.action as (typeof CORE_ACTIONS)[number])) {
              flatPerms.push(p);
            }
          }
        } else {
          flatPerms.push(...resPerms);
        }
      }
    }

    return { coreActions: present, rows: matrixRows, flat: flatPerms, allPerms: all };
  }, [categories]);

  const totalInModule = allPerms.length;
  const selectedInModule = allPerms.reduce(
    (n, p) => n + (selectedPermissionCodes.has(p.code) ? 1 : 0),
    0
  );

  return (
    <section className={cn("border-b border-nx-line last:border-b-0", className)}>
      {/* ── Module sub-header — sticky guide-post using @core/ui/button ── */}
      <Button
        type="button"
        variant="ghost"
        aria-expanded={isExpanded}
        onClick={onToggleModule}
        className={cn(
          "sticky top-0 z-raised flex h-11 w-full items-center justify-start gap-2.5 rounded-none border-b border-nx-line-hi bg-nx-surface px-4 text-start font-normal",
          "transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none",
          "focus-visible:shadow-nx-focus focus-visible:outline-none",
          // The lit edge: a module that carries any grant wears a 2px accent bar
          // on the reading edge, so the eye finds the live modules in one pass.
          "before:absolute before:inset-y-0 before:start-0 before:w-0.5",
          selectedInModule > 0 && "before:bg-nx-accent"
        )}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-nx-ink-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none rtl:-scale-x-100",
            isExpanded && "rotate-90"
          )}
          aria-hidden="true"
        />
        <span className="truncate text-sm font-semibold text-nx-ink-2">{module}</span>
        <span className="ms-auto shrink-0 text-xs tabular-nums text-nx-ink-3">
          <span className={cn(selectedInModule > 0 && "font-medium text-nx-accent")}>
            {selectedInModule}
          </span>{" "}
          / {totalInModule}
        </span>
      </Button>

      {isExpanded && (
        <>
          {/* ── The scannable matrix — categories × core actions using @core/ui/table ── */}
          {rows.length > 0 && coreActions.length > 0 && (
            <MatrixTable
              module={module}
              coreActions={coreActions}
              rows={rows}
              selectedPermissionCodes={selectedPermissionCodes}
              assignments={assignments}
              onTogglePermission={onTogglePermission}
              onToggleGroup={onToggleGroup}
              onUpdateConfig={onUpdateConfig}
            />
          )}

          {/* ── Irregular permissions that don't fit the action grid ── */}
          {flat.length > 0 && (
            <FlatSection
              hasMatrix={rows.length > 0}
              permissions={flat}
              selectedPermissionCodes={selectedPermissionCodes}
              assignments={assignments}
              onTogglePermission={onTogglePermission}
              onToggleGroup={onToggleGroup}
              onUpdateConfig={onUpdateConfig}
            />
          )}
        </>
      )}
    </section>
  );
}

// ── The matrix table using @core/ui/table components ──────────────────────────

interface MatrixTableProps {
  module: string;
  coreActions: string[];
  rows: MatrixRow[];
  selectedPermissionCodes: Set<string>;
  assignments?: Map<string, PermissionAssignmentJson>;
  className?: string;
  onTogglePermission: (code: string) => void;
  onToggleGroup: (permissions: Permission[]) => void;
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

function MatrixTable({
  module,
  coreActions,
  rows,
  selectedPermissionCodes,
  assignments,
  className,
  onTogglePermission,
  onToggleGroup,
  onUpdateConfig,
}: MatrixTableProps) {
  const { t } = useI18n();

  // Column select-all reaches every real cell in that action's column across the module.
  const columnPerms = (col: number): Permission[] =>
    rows.map((r) => r.cells[col]).filter((p): p is Permission => !!p);

  const actionLabel = (action: string): string => {
    const key = CORE_ACTION_LABEL_KEYS[action as (typeof CORE_ACTIONS)[number]];
    return key ? t(key) : humanize(action);
  };

  return (
    <Table className={cn("border-collapse text-sm", className)}>
      <TableHeader className="border-b border-nx-line-hi bg-nx-surface-sunken/60">
        <TableRow className="border-b-0 hover:bg-transparent">
          <TableHead
            scope="col"
            className="w-full min-w-[200px] px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wider text-nx-ink-2"
          >
            {t("roleDetail.resourceCategory")}
          </TableHead>
          {coreActions.map((action, col) => {
            const perms = columnPerms(col);
            const selected = perms.filter((p) => selectedPermissionCodes.has(p.code)).length;
            const label = actionLabel(action);
            const tooltip = t("roleDetail.toggleColumnTooltip", { action: label, module });
            return (
              <TableHead
                key={action}
                scope="col"
                className="w-[96px] px-2 py-2.5 text-center align-middle"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-2">
                    {label}
                  </span>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex">
                          <TriStateCheckbox
                            total={perms.length}
                            selected={selected}
                            disabled={perms.length === 0}
                            onToggle={() => onToggleGroup(perms)}
                            label={tooltip}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">{tooltip}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const rowPerms = row.cells.filter((p): p is Permission => !!p);
          const rowSelected = rowPerms.filter((p) => selectedPermissionCodes.has(p.code)).length;
          return (
            <TableRow
              key={row.category}
              className="border-b border-nx-line transition-colors duration-nx-micro ease-nx-enter last:border-b-0 hover:bg-nx-hover motion-reduce:transition-none"
            >
              <TableCell className="h-9 px-4 text-start font-normal">
                <div className="flex items-center gap-2.5">
                  <TriStateCheckbox
                    total={rowPerms.length}
                    selected={rowSelected}
                    disabled={rowPerms.length === 0}
                    onToggle={() => onToggleGroup(rowPerms)}
                    label={row.category}
                  />
                  <span className="truncate text-sm text-nx-ink">{row.category}</span>
                  <span className="ms-auto shrink-0 text-[11px] tabular-nums text-nx-ink-3">
                    {rowSelected}/{rowPerms.length}
                  </span>
                </div>
              </TableCell>
              {row.cells.map((perm, col) => (
                <TableCell
                  key={coreActions[col]}
                  className="h-9 px-2 text-center align-middle [&:has([role=checkbox])]:ps-2 [&:has([role=checkbox])]:pe-2"
                >
                  {perm ? (
                    <MatrixCell
                      permission={perm}
                      isSelected={selectedPermissionCodes.has(perm.code)}
                      assignment={assignments?.get(perm.code)}
                      onToggle={() => onTogglePermission(perm.code)}
                      onUpdateConfig={onUpdateConfig}
                    />
                  ) : (
                    // Where an action does not exist for this category — a quiet
                    // em-dash so the eye reads "no capability" without a gap.
                    <span className="select-none text-nx-ink-3" aria-hidden="true">
                      —
                    </span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ── A single matrix cell: checkbox + accessible scope affordance ───────────────

interface MatrixCellProps {
  permission: Permission;
  isSelected: boolean;
  assignment?: PermissionAssignmentJson;
  className?: string;
  onToggle: () => void;
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

function MatrixCell({
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
                    // Fills with the accent only when a real override exists.
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

// ── The flat "additional permissions" list under the module ──────────────────

interface FlatSectionProps {
  hasMatrix: boolean;
  permissions: Permission[];
  selectedPermissionCodes: Set<string>;
  assignments?: Map<string, PermissionAssignmentJson>;
  className?: string;
  onTogglePermission: (code: string) => void;
  onToggleGroup: (permissions: Permission[]) => void;
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

function FlatSection({
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
      <div className="flex items-center justify-between border-b border-nx-line bg-nx-surface-sunken/40 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-2">
          {t("roleDetail.additionalCapabilities")}
        </span>
        <span className="text-[11px] font-normal tabular-nums text-nx-ink-3">
          {selectedInFlat} / {permissions.length}
        </span>
      </div>

      {Array.from(permsByCategory.entries()).map(([categoryName, catPerms]) => {
        const catSelected = catPerms.filter((p) =>
          selectedPermissionCodes.has(p.code)
        ).length;

        return (
          <div key={categoryName} className="border-b border-nx-line/60 last:border-b-0">
            {/* Category sub-header within Additional Capabilities */}
            {permsByCategory.size > 1 && (
              <div className="flex items-center justify-between bg-nx-surface-sunken/20 px-4 py-1.5 text-xs">
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

interface FlatPermRowProps {
  permission: Permission;
  isSelected: boolean;
  assignment?: PermissionAssignmentJson;
  className?: string;
  onToggle: () => void;
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

function FlatPermRow({
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

      {/* Code stays on the same line (mono, quiet) with accessible tooltip */}
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
                      ? "border-nx-accent bg-nx-accent-wash/30 text-nx-accent hover:bg-nx-accent-wash/50"
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

// ── Shared TriStateCheckbox using @core/ui/checkbox ────────────────────────────

interface TriStateCheckboxProps {
  total: number;
  selected: number;
  disabled?: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}

/**
 * A real tri-state select-all: full accent fill when every child is on, a hollow
 * accent-washed box for the partial state (no misleading check glyph), plain when off.
 */
function TriStateCheckbox({
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
      // The primitive only styles the checked state; give the genuine Radix
      // indeterminate state its own quiet accent-wash look and drop the check glyph.
      className={cn(
        "data-[state=indeterminate]:border-nx-accent data-[state=indeterminate]:bg-nx-accent-wash data-[state=indeterminate]:text-nx-accent data-[state=indeterminate]:[&_svg]:hidden",
        className
      )}
    />
  );
}
