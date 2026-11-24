/**
 * Permission Config Dialog
 *
 * The AUTHORITATIVE scope control of the whole permissions surface, and the only
 * scope *field* left in it. Everything else that mentions a scope — the matrix
 * dot, the flat-row pill, the bulk menu — either reads this value back or writes
 * through the same `onSave` contract.
 *
 * Its one job is to be unmistakably about ONE permission: the code is stated in
 * the header, and the field is captioned with what it overrides. The bulk
 * control deliberately does not look like this.
 *
 * @module roles/presentation/components
 */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Badge } from "@core/ui/badge";
import { PermissionRestrictedFieldsEditor } from "./PermissionRestrictedFieldsEditor";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { CUSTOM_FIELDS_PERMISSIONS, extractPermissionResource } from "@core/common/types/permissions";
import { useAppStore } from "@core/store/useAppStore";
import { useRestrictableCustomFieldKeys } from "@core/hooks/use-restrictable-custom-field-keys";
import {
  PermissionScopes,
  type PermissionAssignmentJson,
} from "../../domain/types/PermissionTypes";

/**
 * Interface defining property specifications, keys types, and structural contract rules for permission config dialog props.
 */
export interface PermissionConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: {
    id: string;
    code: string;
    displayName: string;
    resource?: string;
  };
  currentAssignment?: PermissionAssignmentJson;
  /** Whether cross-tenant `all_tenants` scope option may be offered (false for tenant roles). */
  allowAllTenants?: boolean;
  /** Read-only lock mode (for edition-synced or unauthorized views). */
  isReadOnly?: boolean;
  onSave: (assignment: PermissionAssignmentJson) => void;
}

function resolveInitialScope(currentAssignment?: PermissionAssignmentJson): string {
  const rawScope = currentAssignment?.scopeOverride?.trim();
  const lowerScope = rawScope?.toLowerCase();
  return !rawScope || lowerScope === "default" || lowerScope === "tenant"
    ? PermissionScopes.Default
    : rawScope;
}

/**
 * Presentation UI component rendering the permission config dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PermissionConfigDialog({
  open,
  onOpenChange,
  permission,
  currentAssignment,
  allowAllTenants = true,
  isReadOnly = false,
  onSave,
}: PermissionConfigDialogProps) {
  const { t } = useI18n();
  const userTenantId = useAppStore((s) => s.user?.tenantId ?? null);
  const canUseAllTenants = allowAllTenants && !userTenantId;

  /**
   * Permission codes follow `{resource}.{action}` where `resource` can contain
   * dots (`crm.opportunities.read`) or `action` can have known compound suffixes
   * (`crm.opportunities.stage.override`). Prefer the explicit backend resource when
   * passed from the matrix/flat row and fall back to canonical extraction.
   */
  const permissionResource =
    permission.resource?.trim() || extractPermissionResource(permission.code);

  // Both candidate endpoints require `custom-fields.view`. A role administrator
  // holding `roles.*` without it is an ordinary configuration, and must degrade to
  // plain free text rather than get a 403 on every dialog open.
  const canReadCustomFields = usePermission(CUSTOM_FIELDS_PERMISSIONS.CUSTOM_FIELD_VIEW);
  const suggestions = useRestrictableCustomFieldKeys(open ? permissionResource : undefined, {
    enabled: canReadCustomFields && !isReadOnly,
  });

  const [scope, setScope] = useState<string>(() => resolveInitialScope(currentAssignment));
  const [restrictedFields, setRestrictedFields] = useState<string[]>(
    () => currentAssignment?.restrictedFields ?? []
  );
  const [newField, setNewField] = useState("");

  // Sync state when open or currentAssignment transitions after mount
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCurrentAssignment, setPrevCurrentAssignment] = useState(currentAssignment);
  if (open !== prevOpen || currentAssignment !== prevCurrentAssignment) {
    setPrevOpen(open);
    setPrevCurrentAssignment(currentAssignment);
    if (open) {
      setScope(resolveInitialScope(currentAssignment));
      setRestrictedFields(currentAssignment?.restrictedFields ?? []);
      setNewField("");
    }
  }

  const trimmedField = newField.trim();
  /**
   * Duplicate detection is case-INSENSITIVE, matching the server: it compares these
   * hand-typed names with `OrdinalIgnoreCase` on every enforcement surface. The old
   * exact-case check let an admin add both `Salary` and `salary`, which are one
   * restriction wearing two tags — and now that the picker offers canonical keys, a
   * mixed-case pair is easy to produce by typing one and clicking the other.
   */
  const isAlreadyRestricted = (field: string) =>
    restrictedFields.some((existing) => existing.toLowerCase() === field.toLowerCase());
  const canAddField = trimmedField.length > 0 && !isAlreadyRestricted(trimmedField);

  /** Suggestions not already chosen — the list the datalist actually offers. */
  const availableSuggestions = suggestions.keys.filter((entry) => !isAlreadyRestricted(entry.key));

  /**
   * Required custom fields among the chosen tags. Restricting one is refused
   * server-side and takes the WHOLE save down, not just that tag, so this is warned
   * about before the admin presses save rather than discovered after every other edit
   * in the dialog is discarded. Advisory only: the flag is a snapshot, and a field
   * flipped to required afterwards still fails.
   */
  const chosenRequiredFields = restrictedFields.filter((field) =>
    suggestions.keys.some(
      (entry) => entry.isRequired && entry.key.toLowerCase() === field.toLowerCase()
    )
  );

  const handleAddField = () => {
    if (!canAddField) return;
    setRestrictedFields([...restrictedFields, trimmedField]);
    setNewField("");
  };

  const handleRemoveField = (field: string) => {
    setRestrictedFields(restrictedFields.filter((f) => f !== field));
  };

  const handleSave = () => {
    if (isReadOnly || hasInvalidAllTenantsSelection) return;
    const assignment: PermissionAssignmentJson = {
      permissionId: permission.id,
      scopeOverride: scope === PermissionScopes.Default ? undefined : scope,
      restrictedFields: restrictedFields.length > 0 ? restrictedFields : undefined,
    };
    onSave(assignment);
    onOpenChange(false);
  };

  // Scope Options - matching backend DataScope constants
  const scopeOptions = [
    { value: PermissionScopes.Default, label: t("role.scopeDefault") },
    { value: PermissionScopes.Own, label: t("role.scopeOwn") },
    { value: PermissionScopes.OwnTenant, label: t("role.scopeOwnTenant") },
    { value: PermissionScopes.Hierarchy, label: t("role.scopeHierarchy") },
    ...(canUseAllTenants
      ? [{ value: PermissionScopes.AllTenants, label: t("role.scopeAllTenants") }]
      : []),
  ];
  const hasInvalidAllTenantsSelection =
    !canUseAllTenants && scope.toLowerCase() === PermissionScopes.AllTenants;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[26rem]"
        data-testid="permission-config-dialog"
      >
        <DialogHeader>
          <DialogTitle>{t("permission.configure")}</DialogTitle>
          {/* The subject, stated once and unambiguously: this dialog edits THIS
              permission, never the role as a whole. */}
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <span className="min-w-0 truncate text-nx-ink">{permission.displayName}</span>
            <Badge variant="secondary" className="shrink-0 font-mono text-[11px]">
              <bdi dir="ltr">{permission.code}</bdi>
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* ── Scope override — the one authoritative scope field ── */}
          <div className="space-y-1.5">
            {/* No htmlFor: GenericSelect's trigger is a role="combobox" div, not
                a labelable control — a for/id pair here would be a lie. */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label id="permission-scope-label">{t("role.scopeOverride")}</Label>
              <Badge
                variant="outline"
                data-testid="permission-config-resource-badge"
                className="font-mono text-xs"
              >
                <bdi dir="ltr">{permissionResource}</bdi>
              </Badge>
            </div>
            <GenericSelect
              type="single"
              options={scopeOptions}
              value={scope}
              onValueChange={(val: string | string[]) => setScope(val as string)}
              placeholder={t("role.selectScope")}
              disabled={isReadOnly}
              aria-labelledby="permission-scope-label"
            />
            {hasInvalidAllTenantsSelection ? (
              <p role="alert" className="text-xs text-nx-warning-strong">
                {t("role.scopeAllTenantsRestricted")}
              </p>
            ) : (
              <p className="text-xs text-nx-ink-3">{t("role.scopeHint")}</p>
            )}
          </div>

          <PermissionRestrictedFieldsEditor
            restrictedFields={restrictedFields}
            newField={newField}
            onNewFieldChange={setNewField}
            canAddField={canAddField}
            onAddField={handleAddField}
            onRemoveField={handleRemoveField}
            availableSuggestions={availableSuggestions}
            chosenRequiredFields={chosenRequiredFields}
            isTruncated={suggestions.isTruncated}
            isReadOnly={isReadOnly}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isReadOnly || hasInvalidAllTenantsSelection}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
