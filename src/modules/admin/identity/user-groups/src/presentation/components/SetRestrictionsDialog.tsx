/**
 * Set Restrictions Dialog
 *
 * Dialog for managing field-level restrictions on a user group.
 * Users can add permission codes and specify which fields to restrict.
 * Uses "nuke-and-pave" SetRestrictions endpoint.
 */
"use client";

import { useId, useState, useMemo } from "react";
import { extractPermissionResource } from "@core/common/types/permissions";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect } from "@core/crud/components/generic-select";
import { AlertTriangle, Info, Lock, Plus } from "lucide-react";
import { useSetRestrictionsViewModel } from "../viewmodels/useSetRestrictionsViewModel";
import { RestrictionRowCard, type RestrictionItem } from "./RestrictionRowCard";
import {
  formatRestrictableResourceLabel,
  resolveRestrictableResource,
} from "./restriction-resource-label";

interface SetRestrictionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRestrictions: RestrictionItem[];
  onSubmit: (restrictions: RestrictionItem[]) => void;
  isSubmitting?: boolean;
  tenantId?: string;
}

function cloneRestrictions(items: RestrictionItem[]): RestrictionItem[] {
  return items.map((r) => ({
    permissionCode: r.permissionCode,
    restrictedFields: [...r.restrictedFields],
  }));
}

/**
 * Presentation UI component rendering the set restrictions dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SetRestrictionsDialog({
  open,
  onOpenChange,
  currentRestrictions,
  onSubmit,
  isSubmitting,
  tenantId,
}: SetRestrictionsDialogProps) {
  const { t, availablePermissions, isLoadingPermissions, canReadCustomFields } =
    useSetRestrictionsViewModel({
      tenantId,
      open,
    });
  const resourceSelectLabelId = useId();
  const [restrictions, setRestrictions] = useState<RestrictionItem[]>(() =>
    open ? cloneRestrictions(currentRestrictions) : []
  );
  const [newPermissionCode, setNewPermissionCode] = useState("");
  const [duplicateResourceNotice, setDuplicateResourceNotice] = useState<string | null>(null);

  // Distinct canonical resource options mapped with localized bilingual labels
  const resourceOptions = useMemo(() => {
    const uniqueResources = new Map<string, string>();
    for (const perm of availablePermissions) {
      const canonical = extractPermissionResource(perm.code, perm.resource).trim();
      if (!canonical) continue;
      const key = canonical.toLowerCase();
      if (!uniqueResources.has(key)) {
        uniqueResources.set(key, canonical);
      }
    }

    return Array.from(uniqueResources.values())
      .map((res) => ({
        value: res,
        label: formatRestrictableResourceLabel(res, t, availablePermissions),
        description: res,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [availablePermissions, t]);

  // Pre-fill from current
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCurrentRestrictions, setPrevCurrentRestrictions] = useState(currentRestrictions);
  if (open !== prevOpen || currentRestrictions !== prevCurrentRestrictions) {
    setPrevOpen(open);
    setPrevCurrentRestrictions(currentRestrictions);
    if (open) {
      setRestrictions(cloneRestrictions(currentRestrictions));
      setNewPermissionCode("");
      setDuplicateResourceNotice(null);
    }
  }

  const addRestriction = () => {
    const rawCode = newPermissionCode.trim();
    if (!rawCode) return;
    const canonical = resolveRestrictableResource(rawCode, availablePermissions) || rawCode;
    const exists = restrictions.some((r) => {
      const existingCanonical = resolveRestrictableResource(r.permissionCode, availablePermissions);
      return (
        existingCanonical.toLowerCase() === canonical.toLowerCase() ||
        r.permissionCode.trim().toLowerCase() === rawCode.toLowerCase()
      );
    });
    if (exists) {
      setDuplicateResourceNotice(t("userGroups.restrictionsTab.alreadyAdded"));
      return;
    }

    setRestrictions((prev) => [...prev, { permissionCode: canonical, restrictedFields: [] }]);
    setNewPermissionCode("");
    setDuplicateResourceNotice(null);
  };

  const removeRestriction = (index: number) => {
    setRestrictions((prev) => prev.filter((_, i) => i !== index));
    setDuplicateResourceNotice(null);
  };

  const addField = (index: number, rawField: string): boolean => {
    const field = rawField.trim();
    if (!field) return false;
    const target = restrictions[index];
    if (!target) return false;
    if (target.restrictedFields.some((f) => f.toLowerCase() === field.toLowerCase())) {
      return false;
    }
    setRestrictions((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              restrictedFields: [...item.restrictedFields, field],
            }
          : item
      )
    );
    return true;
  };

  const removeField = (rIndex: number, field: string) => {
    setRestrictions((prev) =>
      prev.map((item, idx) =>
        idx === rIndex
          ? {
              ...item,
              restrictedFields: item.restrictedFields.filter((f) => f !== field),
            }
          : item
      )
    );
  };

  const handleSave = () => {
    onSubmit(restrictions);
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("userGroups.restrictionsTab.manageRestrictions")}
      description={t("userGroups.restrictionsTab.manageRestrictionsDesc")}
      size="lg"
    >
      <div data-testid="set-restrictions-dialog" className="space-y-4 py-2">
        <Alert data-testid="restriction-additive-hint" variant="info" className="py-2.5">
          <Info className="h-4 w-4" aria-hidden="true" />
          <AlertDescription className="text-xs">
            {t("userGroups.restrictionsTab.additiveNotice")}
          </AlertDescription>
        </Alert>

        {/* Add new restriction */}
        <div className="space-y-2">
          <Label id={resourceSelectLabelId} className="flex items-center gap-2">
            <Lock className="h-4 w-4" aria-hidden="true" />
            {t("userGroups.restrictionsTab.addPermission")}
          </Label>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <GenericSelect
                aria-labelledby={resourceSelectLabelId}
                value={newPermissionCode}
                onValueChange={(val: string | string[]) => {
                  setNewPermissionCode(val as string);
                  if (duplicateResourceNotice) setDuplicateResourceNotice(null);
                }}
                options={resourceOptions}
                placeholder={t("userGroups.restrictionsTab.permissionPlaceholder")}
                loading={isLoadingPermissions}
                searchable
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRestriction}
              disabled={!newPermissionCode.trim()}
              aria-label={t("userGroups.restrictionsTab.addPermission")}
              data-testid="add-restriction-button"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          {duplicateResourceNotice && (
            <Alert variant="warning" className="py-2">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription className="text-xs">{duplicateResourceNotice}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Existing restrictions list */}
        <div className="space-y-3">
          {restrictions.length === 0 ? (
            <p className="py-6 text-center text-sm text-nx-ink-3">
              {t("userGroups.noRestrictions")}
            </p>
          ) : (
            restrictions.map((restriction, rIndex) => (
              <RestrictionRowCard
                key={restriction.permissionCode}
                restriction={restriction}
                index={rIndex}
                open={open}
                canReadCustomFields={canReadCustomFields}
                availablePermissions={availablePermissions}
                t={t}
                onRemoveRestriction={removeRestriction}
                onAddField={addField}
                onRemoveField={removeField}
              />
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-nx-line pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            loading={isSubmitting}
            data-testid="save-restrictions-button"
          >
            {t("userGroups.restrictionsTab.saveRestrictions")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
