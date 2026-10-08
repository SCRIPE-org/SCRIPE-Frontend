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

import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import type { Permission, PermissionCategoryGroup } from "@modules/identity/permissions";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";
import { CORE_ACTIONS, humanize, MatrixTable, type MatrixRow } from "./MatrixTable";
import { FlatSection } from "./FlatSection";

/**
 * Interface defining property specifications, keys types, and structural contract rules for permission module matrix props.
 */
export interface PermissionModuleMatrixProps {
  /** The unique module identifier or display name. */
  module: string;
  /** Categorized permission tree groups belonging to this module. */
  categories: PermissionCategoryGroup[];
  /** Whether the module section is expanded in the accordion view. */
  isExpanded: boolean;
  /** Set of currently assigned permission codes. */
  selectedPermissionCodes: Set<string>;
  /** Map of existing permission assignment overrides, keyed by permission code. */
  assignments?: Map<string, PermissionAssignmentJson>;
  /** Optional custom CSS class name. */
  className?: string;
  /** Callback fired when the module header accordion toggle is clicked. */
  onToggleModule: () => void;
  /** Callback fired when an individual permission code is toggled. */
  onTogglePermission: (code: string) => void;
  /** Set-semantic bulk toggle (select-all / deselect-all) reused for rows AND columns. */
  onToggleGroup: (permissions: Permission[]) => void;
  /** Optional callback fired when a permission override configuration is saved. */
  onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

/**
 * Presentation UI component rendering a single module's permission matrix.
 * Arranges layout boundaries and accessibility targets using the core design library (@core/ui/*).
 *
 * @param props - Component properties configuring matrix presentation and event handlers.
 * @returns Rendered module matrix with accordion header, CRUD table, and irregular permissions.
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
  // Split the backend module into a griddable matrix plus a flat remainder.
  // Memoised on category identity so layout calculation runs once per data change.
  const { coreActions, rows, flat, allPerms } = useMemo(() => {
    const all = categories.flatMap((c) => c.permissions);
    const present = CORE_ACTIONS.filter((a) => all.some((p) => p.action === a));

    const matrixRows: MatrixRow[] = [];
    const flatPerms: Permission[] = [];

    for (const cat of categories) {
      // Split category permissions by resource so multi-resource categories
      // produce distinct matrix rows.
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
            byResource.size > 1 ? `${cat.category} — ${humanize(res)}` : cat.category;

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
