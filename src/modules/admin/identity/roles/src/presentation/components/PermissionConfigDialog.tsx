// UI-EXCEPTION: compact studio layout
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
import { X, Plus } from "lucide-react";
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
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
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
  };
  currentAssignment?: PermissionAssignmentJson;
  onSave: (assignment: PermissionAssignmentJson) => void;
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
  onSave,
}: PermissionConfigDialogProps) {
  const { t } = useI18n();

  const [scope, setScope] = useState<string>(PermissionScopes.Default);
  const [restrictedFields, setRestrictedFields] = useState<string[]>([]);
  const [newField, setNewField] = useState("");

  // Initialize state from current assignment
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCurrentAssignment, setPrevCurrentAssignment] = useState(currentAssignment);
  if (open !== prevOpen || currentAssignment !== prevCurrentAssignment) {
    setPrevOpen(open);
    setPrevCurrentAssignment(currentAssignment);
    if (open) {
      setScope(currentAssignment?.scopeOverride || PermissionScopes.Default);
      setRestrictedFields(currentAssignment?.restrictedFields || []);
      setNewField("");
    }
  }

  const trimmedField = newField.trim();
  const canAddField = trimmedField.length > 0 && !restrictedFields.includes(trimmedField);

  const handleAddField = () => {
    if (!canAddField) return;
    setRestrictedFields([...restrictedFields, trimmedField]);
    setNewField("");
  };

  const handleRemoveField = (field: string) => {
    setRestrictedFields(restrictedFields.filter((f) => f !== field));
  };

  const handleSave = () => {
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
    { value: PermissionScopes.AllTenants, label: t("role.scopeAllTenants") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[26rem]">
        <DialogHeader>
          <DialogTitle>{t("permission.configure")}</DialogTitle>
          {/* The subject, stated once and unambiguously: this dialog edits THIS
              permission, never the role as a whole. */}
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <span className="min-w-0 truncate text-nx-ink">{permission.displayName}</span>
            <Badge variant="secondary" className="shrink-0 font-mono text-[11px]">
              {permission.code}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* ── Scope override — the one authoritative scope field ── */}
          <div className="space-y-1.5">
            {/* No htmlFor: GenericSelect's trigger is a role="combobox" div, not
                a labelable control — a for/id pair here would be a lie. */}
            <Label>{t("role.scopeOverride")}</Label>
            <GenericSelect
              type="single"
              options={scopeOptions}
              value={scope}
              onValueChange={(val: string | string[]) => setScope(val as string)}
              placeholder={t("role.selectScope")}
            />
            <p className="text-xs text-nx-ink-3">{t("role.scopeHint")}</p>
          </div>

          {/* ── Restricted fields (tag input) ── */}
          <div className="space-y-1.5">
            <Label htmlFor="permission-restricted-field">{t("role.restrictedFields")}</Label>
            <div className="flex gap-2">
              <Input
                id="permission-restricted-field"
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddField();
                  }
                }}
                placeholder={t("role.enterField")}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={handleAddField}
                disabled={!canAddField}
                aria-label={t("common.add")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <ul className="flex min-h-[2.5rem] list-none flex-wrap gap-1.5 rounded-nx-md border border-nx-line bg-nx-hover p-2">
              {restrictedFields.length === 0 ? (
                <li className="self-center text-sm text-nx-ink-3">{t("role.noRestrictions")}</li>
              ) : (
                restrictedFields.map((field) => (
                  <li key={field}>
                    <Badge variant="secondary" className="gap-1 pe-1">
                      <span className="truncate">{field}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field)}
                        aria-label={`${t("common.remove")} ${field}`}
                        className="grid h-4 w-4 place-items-center rounded-full transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-raised-2 focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  </li>
                ))
              )}
            </ul>
            <p className="text-xs text-nx-ink-3">{t("role.restrictionHint")}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
