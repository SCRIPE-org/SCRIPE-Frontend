// UI-EXCEPTION: compact studio layout
/**
 * Set Restrictions Dialog
 *
 * Dialog for managing field-level restrictions on a user group.
 * Users can add permission codes and specify which fields to restrict.
 * Uses "nuke-and-pave" SetRestrictions endpoint.
 */
"use client";

import { useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Lock, Plus, X, Trash2 } from "lucide-react";
import { useSetRestrictionsViewModel } from "../viewmodels/useSetRestrictionsViewModel";

interface Restriction {
  permissionCode: string;
  restrictedFields: string[];
}

interface SetRestrictionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRestrictions: Restriction[];
  onSubmit: (restrictions: Restriction[]) => void;
  isSubmitting?: boolean;
  tenantId?: string;
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
  const { t, availablePermissions, isLoadingPermissions } = useSetRestrictionsViewModel({
    tenantId,
    open,
  });
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);
  const [newPermissionCode, setNewPermissionCode] = useState("");
  const [newField, setNewField] = useState("");
  const [activeRestrictionIndex, setActiveRestrictionIndex] = useState<number | null>(null);

  // Distinct resource options mapped with localized label
  const resourceOptions = useMemo(() => {
    const uniqueResources = Array.from(
      new Set(availablePermissions.map((p) => p.resource).filter(Boolean))
    );
    return uniqueResources
      .map((res) => ({
        value: res,
        label: t(`nav.${res}`) || res.charAt(0).toUpperCase() + res.slice(1),
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
      setRestrictions(
        currentRestrictions.map((r) => ({
          permissionCode: r.permissionCode,
          restrictedFields: [...r.restrictedFields],
        }))
      );
      setNewPermissionCode("");
      setNewField("");
      setActiveRestrictionIndex(null);
    }
  }

  const addRestriction = () => {
    const code = newPermissionCode.trim();
    if (!code) return;
    if (restrictions.some((r) => r.permissionCode === code)) return;
    setRestrictions([...restrictions, { permissionCode: code, restrictedFields: [] }]);
    setNewPermissionCode("");
    setActiveRestrictionIndex(restrictions.length);
  };

  const removeRestriction = (index: number) => {
    setRestrictions(restrictions.filter((_, i) => i !== index));
    if (activeRestrictionIndex === index) setActiveRestrictionIndex(null);
  };

  const addField = (index: number) => {
    const field = newField.trim();
    if (!field) return;
    const updated = [...restrictions];
    if (!updated[index].restrictedFields.includes(field)) {
      updated[index].restrictedFields.push(field);
      setRestrictions(updated);
    }
    setNewField("");
  };

  const removeField = (rIndex: number, field: string) => {
    const updated = [...restrictions];
    updated[rIndex].restrictedFields = updated[rIndex].restrictedFields.filter((f) => f !== field);
    setRestrictions(updated);
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
      <div className="space-y-4 py-2">
        {/* Add new restriction */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Lock className="h-4 w-4" aria-hidden="true" />
            {t("userGroups.restrictionsTab.addPermission")}
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <GenericSelect
                value={newPermissionCode}
                onValueChange={(val: string | string[]) => setNewPermissionCode(val as string)}
                options={resourceOptions}
                placeholder={t("userGroups.restrictionsTab.permissionPlaceholder")}
                loading={isLoadingPermissions}
                searchable
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addRestriction}
              disabled={!newPermissionCode.trim()}
              aria-label={t("userGroups.restrictionsTab.addPermission")}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Existing restrictions list */}
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {restrictions.length === 0 ? (
            <p className="py-6 text-center text-sm text-nx-ink-3">
              {t("userGroups.noRestrictions")}
            </p>
          ) : (
            restrictions.map((restriction, rIndex) => (
              <div
                key={restriction.permissionCode}
                className="space-y-2 rounded-nx-md border border-nx-line p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium">
                    {restriction.permissionCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive/90"
                    onClick={() => removeRestriction(rIndex)}
                    aria-label={`${t("userGroups.restrictionsTab.removeRestriction")}: ${restriction.permissionCode}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>

                {/* Fields */}
                <div className="flex flex-wrap gap-1">
                  {restriction.restrictedFields.map((field) => (
                    <Badge key={field} variant="secondary" className="gap-1 text-xs">
                      {field}
                      <button
                        type="button"
                        onClick={() => removeField(rIndex, field)}
                        className="ms-1 hover:text-destructive"
                        aria-label={t("userGroups.restrictionsTab.removeField", { field })}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Add field input */}
                <div className="flex gap-2">
                  <Input
                    value={activeRestrictionIndex === rIndex ? newField : ""}
                    onChange={(e) => {
                      setActiveRestrictionIndex(rIndex);
                      setNewField(e.target.value);
                    }}
                    onFocus={() => setActiveRestrictionIndex(rIndex)}
                    placeholder={t("userGroups.restrictionsTab.fieldPlaceholder")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addField(rIndex);
                      }
                    }}
                    className="h-8 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setActiveRestrictionIndex(rIndex);
                      addField(rIndex);
                    }}
                    disabled={activeRestrictionIndex !== rIndex || !newField.trim()}
                    aria-label={t("userGroups.restrictionsTab.addField")}
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-nx-line pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} loading={isSubmitting}>
            {t("userGroups.restrictionsTab.saveRestrictions")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
