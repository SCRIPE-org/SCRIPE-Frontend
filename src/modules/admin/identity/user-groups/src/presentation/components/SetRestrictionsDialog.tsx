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
import { useSudoStore } from "@core/store/useSudoStore";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect } from "@core/crud/components/generic-select";
import { AlertTriangle, Info, Lock, Plus } from "lucide-react";
import { useSetRestrictionsViewModel } from "../viewmodels/useSetRestrictionsViewModel";
import { RestrictionRowCard, type RestrictionItem } from "./RestrictionRowCard";
import {
  commitRestrictionDrafts,
  formatRestrictableResourceLabel,
  mergeRestrictedFields,
  resolveRestrictableResource,
} from "./restriction-resource-label";

interface SetRestrictionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRestrictions: RestrictionItem[];
  onSubmit: (restrictions: RestrictionItem[]) => Promise<unknown> | void;
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
  const [draftFieldsByCode, setDraftFieldsByCode] = useState<Record<string, string>>({});
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

  // Pre-fill from current restrictions when dialog transitions open
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setRestrictions(cloneRestrictions(currentRestrictions));
      setDraftFieldsByCode({});
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
    const removed = restrictions[index];
    setRestrictions((prev) => prev.filter((_, i) => i !== index));
    if (removed) {
      setDraftFieldsByCode((prev) => {
        if (!(removed.permissionCode in prev)) return prev;
        const next = { ...prev };
        delete next[removed.permissionCode];
        return next;
      });
    }
    setDuplicateResourceNotice(null);
  };

  const setRowDraftField = (index: number, value: string) => {
    const target = restrictions[index];
    if (!target) return;
    setDraftFieldsByCode((prev) => ({
      ...prev,
      [target.permissionCode]: value,
    }));
  };

  const addField = (
    index: number,
    rawField: string
  ): { added: string[]; duplicates: string[] } => {
    const target = restrictions[index];
    if (!target) return { added: [], duplicates: [] };
    const { nextFields, added, duplicates } = mergeRestrictedFields(
      target.restrictedFields,
      rawField
    );
    if (added.length > 0) {
      setRestrictions((prev) =>
        prev.map((item, idx) =>
          idx === index ? { ...item, restrictedFields: nextFields } : item
        )
      );
    }
    return { added, duplicates };
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

  const handleSave = async () => {
    const { committedRestrictions, nextDrafts } = commitRestrictionDrafts(
      restrictions,
      draftFieldsByCode
    );
    setRestrictions(committedRestrictions);
    setDraftFieldsByCode(nextDrafts);

    try {
      await onSubmit(committedRestrictions);
    } catch {
      // ViewModel surfaces error/Sudo cancellation feedback; preserve edits and keep dialog open.
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && useSudoStore.getState().modalOpen) return;
    onOpenChange(nextOpen);
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={handleClose}
      title={t("userGroups.restrictionsTab.manageRestrictions")}
      description={t("userGroups.restrictionsTab.manageRestrictionsDesc")}
      size="lg"
    >
      <div data-testid="set-restrictions-dialog" className="flex max-h-[72dvh] flex-col gap-4 py-1">
        <div className="shrink-0 space-y-4">
          <Alert data-testid="restriction-additive-hint" variant="info" className="py-2.5">
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="text-xs">
              {t("userGroups.restrictionsTab.additiveNotice")}
            </AlertDescription>
          </Alert>
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
              <Alert variant="warning" role="alert" className="py-2">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription className="text-xs">{duplicateResourceNotice}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Bounded scrollable restrictions list so footer buttons remain visible */}
        <div data-testid="restrictions-list-scroll" className="min-h-0 flex-1 space-y-3 overflow-y-auto pe-1">
          {restrictions.length === 0 ? (
            <p className="py-6 text-center text-sm text-nx-ink-3">{t("userGroups.noRestrictions")}</p>
          ) : (
            restrictions.map((restriction, rIndex) => (
              <RestrictionRowCard
                key={restriction.permissionCode} restriction={restriction} index={rIndex} open={open}
                canReadCustomFields={canReadCustomFields} availablePermissions={availablePermissions}
                draftField={draftFieldsByCode[restriction.permissionCode] ?? ""} t={t}
                onDraftFieldChange={setRowDraftField} onRemoveRestriction={removeRestriction}
                onAddField={addField} onRemoveField={removeField}
              />
            ))
          )}
        </div>

        <div data-testid="set-restrictions-footer" className="flex shrink-0 justify-end gap-2 border-t border-nx-line pt-4">
          <Button type="button" variant="outline" data-skip-blur-commit="true" onClick={() => handleClose(false)} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={handleSave} loading={isSubmitting} data-testid="save-restrictions-button">
            {t("userGroups.restrictionsTab.saveRestrictions")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
