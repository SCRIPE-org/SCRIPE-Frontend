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

/**
 * Interface defining property specifications, keys types, and structural contract rules for permission module matrix props.
 */
export interface PermissionModuleMatrixProps {
  module: string;
  categories: PermissionCategoryGroup[];
  isExpanded: boolean;
  selectedPermissionCodes: Set<string>;
  assignments?: Map<string, PermissionAssignmentJson>;
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

/** Humanise an action / code token for a header or fallback label ("view_details" → "View details"). */
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
      const byAction = new Map<string, Permission[]>();
      for (const p of cat.permissions) {
        const arr = byAction.get(p.action) ?? [];
        arr.push(p);
        byAction.set(p.action, arr);
      }
      // A category fits the grid only when each core action resolves to a single
      // permission — otherwise the whole category drops to the flat list so no
      // permission is ever hidden behind an ambiguous cell.
      const collision = present.some((a) => (byAction.get(a)?.length ?? 0) > 1);
      const cells = present.map((a) => {
        const arr = byAction.get(a);
        return arr && arr.length === 1 ? arr[0] : null;
      });
      const hasCore = cells.some(Boolean);

      if (!collision && hasCore) {
        matrixRows.push({ category: cat.category, cells });
        for (const p of cat.permissions) {
          if (!present.includes(p.action as (typeof CORE_ACTIONS)[number])) flatPerms.push(p);
        }
      } else {
        flatPerms.push(...cat.permissions);
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
    <section className="border-b border-nx-line last:border-b-0">
      {/* ── Module sub-header — sticky guide-post while the matrix scrolls ── */}
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={onToggleModule}
        className={cn(
          "sticky top-0 z-raised flex w-full items-center gap-2.5 bg-nx-surface px-4 text-start",
          "h-11 border-b border-nx-line-hi",
          "transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none",
          "focus-visible:shadow-nx-focus focus-visible:outline-none",
          // The lit edge: a module that carries any grant wears a 2px accent bar
          // on the reading edge, so the eye finds the live modules in one pass.
          // `sticky` is already a positioned ancestor — adding `relative` here
          // would win the position conflict in cn() and kill the stickiness.
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
      </button>

      {isExpanded && (
        <>
          {/* ── The scannable matrix — categories × core actions (scrolls on its own axis) ── */}
          {rows.length > 0 && coreActions.length > 0 && (
            <div className="overflow-x-auto">
              <MatrixTable
                coreActions={coreActions}
                rows={rows}
                selectedPermissionCodes={selectedPermissionCodes}
                assignments={assignments}
                onTogglePermission={onTogglePermission}
                onToggleGroup={onToggleGroup}
                onUpdateConfig={onUpdateConfig}
              />
            </div>
          )}

          {/* ── Irregular permissions that don't fit the action grid ── */}
          {flat.length > 0 && (
            <FlatSection
              hasMatrix={rows.length > 0}
              permissions={flat}
              selectedPermissionCodes={selectedPermissionCodes}
              assignments={assignments}
              onTogglePermission={onTogglePermission}
              onUpdateConfig={onUpdateConfig}
            />
          )}
        </>
      )}
    </section>
  );
}

// ── The matrix table ────────────────────────────────────────────────────────

interface MatrixTableProps {
  coreActions: string[];
  rows: MatrixRow[];
  selectedPermissionCodes: Set<string>;
  assignments?: Map<string, PermissionAssignmentJson>;
  onTogglePermission: (code: string) => void;
  onToggleGroup: (permissions: Permission[]) => void;
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

function MatrixTable({
  coreActions,
  rows,
  selectedPermissionCodes,
  assignments,
  onTogglePermission,
  onToggleGroup,
  onUpdateConfig,
}: MatrixTableProps) {
  // Column select-all reaches every real cell in that action's column across the module.
  const columnPerms = (col: number): Permission[] =>
    rows.map((r) => r.cells[col]).filter((p): p is Permission => !!p);

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-nx-line">
          <th scope="col" className="w-full min-w-[180px] px-4 text-start" />
          {coreActions.map((action, col) => {
            const perms = columnPerms(col);
            const selected = perms.filter((p) => selectedPermissionCodes.has(p.code)).length;
            return (
              <th key={action} scope="col" className="w-[92px] px-2 py-2 align-bottom">
                <div className="flex flex-col items-center gap-1">
                  <TriStateCheckbox
                    total={perms.length}
                    selected={selected}
                    disabled={perms.length === 0}
                    onToggle={() => onToggleGroup(perms)}
                    label={humanize(action)}
                  />
                  <span className="text-[11px] font-medium text-nx-ink-3">{humanize(action)}</span>
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const rowPerms = row.cells.filter((p): p is Permission => !!p);
          const rowSelected = rowPerms.filter((p) => selectedPermissionCodes.has(p.code)).length;
          return (
            <tr
              key={row.category}
              className="border-b border-nx-line transition-colors duration-nx-micro ease-nx-enter last:border-b-0 hover:bg-nx-hover motion-reduce:transition-none"
            >
              <th scope="row" className="h-9 px-4 text-start font-normal">
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
              </th>
              {row.cells.map((perm, col) => (
                <td key={coreActions[col]} className="h-9 px-2 text-center align-middle">
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
                    <span className="text-nx-ink-3" aria-hidden="true">
                      —
                    </span>
                  )}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── A single matrix cell: checkbox + a persistent (never hover) scope affordance ──

interface MatrixCellProps {
  permission: Permission;
  isSelected: boolean;
  assignment?: PermissionAssignmentJson;
  onToggle: () => void;
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

function MatrixCell({
  permission,
  isSelected,
  assignment,
  onToggle,
  onUpdateConfig,
}: MatrixCellProps) {
  const { t, language } = useI18n();
  const [showConfig, setShowConfig] = useState(false);
  const custom = isCustomConfig(assignment);
  const label = `${permission.getLocalizedName(language)} — ${t("role.scopeOverride")}: ${scopeLabel(
    t,
    assignment?.scopeOverride
  )}`;

  return (
    <span className="inline-flex items-center justify-center gap-0.5">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        aria-label={permission.getLocalizedName(language)}
      />
      {isSelected && onUpdateConfig && (
        // Persistent, low-emphasis scope affordance — reachable on touch and
        // keyboard, never a hover reveal. The dot stays 8px so the grid keeps
        // its rhythm; the pressable box around it is a real target.
        <button
          type="button"
          onClick={() => setShowConfig(true)}
          title={label}
          aria-label={label}
          className={cn(
            "grid h-6 w-5 shrink-0 place-items-center rounded-nx-sm",
            "transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none",
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
        </button>
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
  onTogglePermission: (code: string) => void;
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

function FlatSection({
  hasMatrix,
  permissions,
  selectedPermissionCodes,
  assignments,
  onTogglePermission,
  onUpdateConfig,
}: FlatSectionProps) {
  const { t } = useI18n();
  return (
    <div className={cn(hasMatrix && "border-t border-nx-line")}>
      {hasMatrix && (
        <div className="px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-nx-ink-3">
          {t("roleDetail.otherCategory")}
        </div>
      )}
      {permissions.map((permission) => (
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
}

interface FlatPermRowProps {
  permission: Permission;
  isSelected: boolean;
  assignment?: PermissionAssignmentJson;
  onToggle: () => void;
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

function FlatPermRow({
  permission,
  isSelected,
  assignment,
  onToggle,
  onUpdateConfig,
}: FlatPermRowProps) {
  const { t, language } = useI18n();
  const [showConfig, setShowConfig] = useState(false);
  const custom = isCustomConfig(assignment);

  return (
    <div className="flex h-9 items-center gap-3 px-4 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        aria-label={permission.getLocalizedName(language)}
      />
      <span className="min-w-0 flex-1 truncate text-sm text-nx-ink">
        {permission.getLocalizedName(language)}
      </span>
      {/* Code stays on the same line (mono, quiet) so rows keep one height. */}
      <span
        className="hidden shrink-0 font-mono text-xs text-nx-ink-3 sm:inline"
        title={permission.code}
      >
        {permission.code}
      </span>
      {isSelected && onUpdateConfig && (
        <>
          <button
            type="button"
            onClick={() => setShowConfig(true)}
            aria-label={`${permission.getLocalizedName(language)} — ${t("role.scopeOverride")}`}
            className={cn(
              "shrink-0 rounded-nx-sm border px-2 py-0.5 text-[11px] transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "focus-visible:shadow-nx-focus focus-visible:outline-none",
              custom
                ? "border-nx-accent text-nx-accent"
                : "border-nx-line text-nx-ink-3 hover:border-nx-line-hi hover:text-nx-ink-2"
            )}
          >
            {scopeLabel(t, assignment?.scopeOverride)}
          </button>
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

// ── Shared bits ──────────────────────────────────────────────────────────────

interface TriStateCheckboxProps {
  total: number;
  selected: number;
  disabled?: boolean;
  onToggle: () => void;
  label: string;
}

/**
 * A real tri-state select-all: full accent fill when every child is on, a hollow
 * accent-washed box for the partial state (no misleading check glyph), plain when off.
 */
function TriStateCheckbox({ total, selected, disabled, onToggle, label }: TriStateCheckboxProps) {
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
      className="data-[state=indeterminate]:border-nx-accent data-[state=indeterminate]:bg-nx-accent-wash data-[state=indeterminate]:text-nx-accent data-[state=indeterminate]:[&_svg]:hidden"
    />
  );
}
