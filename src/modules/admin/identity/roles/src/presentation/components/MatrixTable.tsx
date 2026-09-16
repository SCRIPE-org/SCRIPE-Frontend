/**
 * MatrixTable Component
 *
 * Renders the two-dimensional capability grid mapping permission categories to core CRUD actions.
 * Provides column-level and row-level tri-state bulk selection controls.
 */
"use client";

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
import type { Permission } from "@modules/identity/permissions";
import { TriStateCheckbox } from "./TriStateCheckbox";
import { MatrixCell } from "./MatrixCell";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";

/** Canonical core CRUD action identifiers that align into matrix columns. */
export const CORE_ACTIONS = ["view", "create", "update", "delete"] as const;

/** Mapping of core action identifiers to their respective localization keys. */
export const CORE_ACTION_LABEL_KEYS: Record<(typeof CORE_ACTIONS)[number], string> = {
  view: "common.view",
  create: "common.create",
  update: "common.update",
  delete: "common.delete",
};

/**
 * Converts snake_case or hyphenated tokens into capitalized human-readable titles.
 *
 * @param token - The raw action or resource identifier.
 * @returns The formatted title case string.
 */
export function humanize(token: string): string {
  const spaced = token.replace(/_/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Represents a single row in the permission capability matrix.
 */
export interface MatrixRow {
  /** The display label for the resource category. */
  category: string;
  /** One slot per core action column; null where that action does not exist. */
  cells: (Permission | null)[];
}

/**
 * Properties for the MatrixTable component.
 */
export interface MatrixTableProps {
  /** The parent module name being rendered. */
  module: string;
  /** List of core action keys present in this module's grid. */
  coreActions: string[];
  /** Structured rows containing category labels and action cells. */
  rows: MatrixRow[];
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
 * Renders the tabular capability matrix for a module's core permissions.
 */
export function MatrixTable({
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

  /** Gathers all active permissions for a specific action column across all rows. */
  const columnPerms = (col: number): Permission[] =>
    rows.map((r) => r.cells[col]).filter((p): p is Permission => !!p);

  /** Resolves localized or humanized action column header text. */
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
