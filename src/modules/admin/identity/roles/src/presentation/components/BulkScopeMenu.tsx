/**
 * Bulk Scope Menu
 *
 * The bulk half of the scope story — and deliberately NOT a select field.
 *
 * There is exactly one scope *field* in this surface: the per-permission
 * `Scope override` select inside PermissionConfigDialog. It is authoritative —
 * it is the only control that writes a real assignment (scopeOverride +
 * restrictedFields) for one named permission, and it is what the matrix dot and
 * the row pill read back.
 *
 * Applying a scope to EVERY assigned permission at once is a fire-and-forget
 * ACTION, not a value the surface holds. Rendering it as a second bordered
 * combobox next to the search box made two identical-looking fields stack up
 * and made it impossible to tell which one you were editing — so it is a
 * labelled menu button now. The write path is unchanged: the caller still
 * receives the same scope strings and still pushes them through its own bulk
 * handler.
 *
 * @module roles/presentation/components
 */
"use client";

import { ChevronDown, Layers } from "lucide-react";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { cn } from "@core/common/utils";
import { PermissionScopes } from "../../domain/types/PermissionTypes";

/**
 * Interface defining property specifications, keys types, and structural contract rules for bulk scope menu props.
 */
export interface BulkScopeMenuProps {
  /** The scope last applied in bulk — same prop the old select carried. */
  value: string;
  /** Receives the chosen scope. The caller writes it through its own bulk handler. */
  onValueChange: (scope: string) => void;
  /** Nothing to apply to (no permission assigned yet, or still loading). */
  disabled?: boolean;
  /** Whether cross-tenant `all_tenants` scope option may be offered (false for tenant roles). */
  allowAllTenants?: boolean;
  /** Optional explanation shown in a tooltip when `disabled` is true. */
  disabledReason?: string;
  className?: string;
}

/**
 * Presentation UI component rendering the bulk scope action menu.
 * Scope options mirror the backend DataScope constants exactly:
 * own · own_tenant · hierarchy · all_tenants.
 */
export function BulkScopeMenu({
  value,
  onValueChange,
  disabled,
  allowAllTenants = true,
  disabledReason,
  className,
}: BulkScopeMenuProps) {
  const { t } = useI18n();
  const userTenantId = useAppStore((s) => s.user?.tenantId ?? null);
  const canUseAllTenants = allowAllTenants && !userTenantId;

  const scopeOptions = [
    { value: PermissionScopes.OwnTenant, label: t("role.scopeOwnTenant") },
    { value: PermissionScopes.Own, label: t("role.scopeOwn") },
    { value: PermissionScopes.Hierarchy, label: t("role.scopeHierarchy") },
    ...(canUseAllTenants
      ? [{ value: PermissionScopes.AllTenants, label: t("role.scopeAllTenants") }]
      : []),
  ];

  const activeLabel = scopeOptions.find((option) => option.value === value)?.label;

  const triggerButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      data-testid="bulk-scope-menu-trigger"
      className={cn("h-9 shrink-0 gap-2", className)}
    >
      <Layers className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
      <span className="truncate">{t("role.bulkScope")}</span>
      {activeLabel && (
        <span className="truncate border-s border-nx-line ps-2 text-xs text-nx-ink-2">
          {activeLabel}
        </span>
      )}
      <ChevronDown className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
    </Button>
  );

  if (disabled) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-flex">
              {triggerButton}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            {disabledReason || t("role.bulkScopeSelectHint")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>

      {/* The label spells out the blast radius, so the menu can never be read
          as "the scope of the thing I am looking at". */}
      <DropdownMenuContent align="end" className="w-[16rem]">
        <DropdownMenuLabel className="text-xs font-normal text-nx-ink-2">
          {t("role.applyToAll")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {scopeOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
