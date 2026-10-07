"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { TimezonePicker } from "@core/ui/timezone-picker";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { GenericSelect } from "@core/crud/components/generic-select";
import { FacilityQuickCreateDialog } from "@modules/venue/facility/src/presentation/components/FacilityQuickCreateDialog";
import type { Facility } from "@modules/venue/facility/src/domain/entities/Facility";
import type {
  FacilityResourceProfile,
  FacilityResourceProfileWrite,
  UsageType,
} from "../../domain/entities/FacilityResourceProfile";

const DAYS = [
  { key: "sunday", value: 1 },
  { key: "monday", value: 2 },
  { key: "tuesday", value: 4 },
  { key: "wednesday", value: 8 },
  { key: "thursday", value: 16 },
  { key: "friday", value: 32 },
  { key: "saturday", value: 64 },
] as const;

function emptyForm(facilityId: string): FacilityResourceProfileWrite {
  return {
    facilityId,
    code: "",
    name: "",
    description: "",
    resourceKindCode: "",
    timeZoneId: "UTC",
    days: 0,
    opensAt: "09:00",
    closesAt: "17:00",
    setupBufferMinutes: 0,
    cleanupBufferMinutes: 0,
    usageTypes: [{ code: "", label: "" }],
  };
}

function toForm(profile: FacilityResourceProfile): FacilityResourceProfileWrite {
  return {
    facilityId: profile.facilityId,
    code: profile.code,
    name: profile.name,
    description: profile.description ?? "",
    resourceKindCode: profile.resourceKindCode,
    timeZoneId: profile.operatingPolicy?.timeZoneId ?? "UTC",
    days: profile.operatingPolicy?.days ?? 0,
    opensAt: profile.operatingPolicy?.opensAt?.slice(0, 5) ?? "09:00",
    closesAt: profile.operatingPolicy?.closesAt?.slice(0, 5) ?? "17:00",
    setupBufferMinutes: profile.operatingPolicy?.setupBufferMinutes ?? 0,
    cleanupBufferMinutes: profile.operatingPolicy?.cleanupBufferMinutes ?? 0,
    usageTypes: profile.usageTypes.length ? profile.usageTypes : [{ code: "", label: "" }],
  };
}

interface FacilityResourceProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  facilities?: Facility[];
  editingProfile?: FacilityResourceProfile;
  onSave: (payload: FacilityResourceProfileWrite, id?: string) => Promise<void>;
  onFacilityCreated?: (facilityId: string) => void;
}

export function FacilityResourceProfileDialog({
  open,
  onOpenChange,
  facilityId,
  facilities,
  editingProfile,
  onSave,
  onFacilityCreated,
}: FacilityResourceProfileDialogProps) {
  const { t } = useI18n();
  const { success, error: toastError } = useEnhancedToast();
  const canCreateFacility = usePermission(VENUE_PERMISSIONS.FACILITY_CREATE);
  const [quickCreateFacilityOpen, setQuickCreateFacilityOpen] = useState(false);
  const [form, setForm] = useState<FacilityResourceProfileWrite>(() =>
    editingProfile ? toForm(editingProfile) : emptyForm(facilityId)
  );
  const [saving, setSaving] = useState(false);

  const facilityOptions = (facilities ?? []).map((f) => ({
    value: f.id,
    label: f.name ? `${f.name} (${f.code})` : f.code || f.id,
  }));

  useEffect(() => {
    if (open) {
      const initial = editingProfile ? toForm(editingProfile) : emptyForm(facilityId);
      if (!initial.facilityId && facilities && facilities.length > 0) {
        initial.facilityId = facilities[0].id;
      }
      void Promise.resolve().then(() => {
        setForm(initial);
      });
    }
  }, [open, editingProfile, facilityId, facilities]);

  const updateUsageType = (index: number, patch: Partial<UsageType>) => {
    setForm((current) => ({
      ...current,
      usageTypes: current.usageTypes.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const usageTypes = form.usageTypes
      .map((item) => ({ code: item.code.trim(), label: item.label.trim() }))
      .filter((item) => item.code && item.label);

    if (
      !form.facilityId ||
      !form.code.trim() ||
      !form.name.trim() ||
      !form.resourceKindCode.trim() ||
      !form.timeZoneId ||
      form.days === 0 ||
      form.opensAt >= form.closesAt ||
      usageTypes.length === 0
    ) {
      toastError({ title: t("resourceProfile.validation.complete") });
      return;
    }

    const usageCodes = usageTypes.map((item) => item.code.toLocaleLowerCase());
    if (new Set(usageCodes).size !== usageCodes.length) {
      toastError({ title: t("resourceProfile.validation.duplicateUsage") });
      return;
    }

    setSaving(true);
    try {
      await onSave(
        {
          ...form,
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description?.trim() || undefined,
          resourceKindCode: form.resourceKindCode.trim(),
          usageTypes,
        },
        editingProfile?.id
      );
      onOpenChange(false);
      success({
        title: t(editingProfile ? "resourceProfile.updated" : "resourceProfile.created"),
      });
    } catch (caught) {
      toastError({ title: caught instanceof Error ? caught.message : t("common.error") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <form onSubmit={submit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>
              {t(editingProfile ? "resourceProfile.editTitle" : "resourceProfile.createTitle")}
            </DialogTitle>
            <DialogDescription>{t("resourceProfile.formDescription")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            {facilityOptions.length > 0 && (
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label id="profile-dialog-facility-label" htmlFor="profile-dialog-facility-select">
                    {t("resourceProfile.facility")} <span className="text-destructive">*</span>
                  </Label>
                  {canCreateFacility && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-xs text-nx-accent hover:text-nx-accent/80"
                      onClick={() => setQuickCreateFacilityOpen(true)}
                    >
                      <Plus className="mr-1 size-3" />
                      {t("facility.addNew") || "New Facility"}
                    </Button>
                  )}
                </div>
                <GenericSelect
                  id="profile-dialog-facility-select"
                  aria-labelledby="profile-dialog-facility-label"
                  type="searchable"
                  searchType="client"
                  allowClear={false}
                  options={facilityOptions}
                  value={form.facilityId}
                  onValueChange={(val: string | string[]) => {
                    const selected = Array.isArray(val) ? val[0] ?? "" : val;
                    setForm((cur) => ({ ...cur, facilityId: selected }));
                  }}
                  placeholder={t("resourceProfile.selectFacility")}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="profile-code">{t("resourceProfile.fields.code")}</Label>
              <Input
                id="profile-code"
                required
                maxLength={50}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-name">{t("resourceProfile.fields.name")}</Label>
              <Input
                id="profile-name"
                required
                maxLength={200}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-kind">{t("resourceProfile.fields.kind")}</Label>
              <Input
                id="profile-kind"
                required
                maxLength={50}
                value={form.resourceKindCode}
                onChange={(e) => setForm({ ...form, resourceKindCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-timezone">{t("resourceProfile.fields.timezone")}</Label>
              <TimezonePicker
                id="profile-timezone"
                aria-label={t("resourceProfile.fields.timezone")}
                value={form.timeZoneId}
                onChange={(timeZoneId: string) => setForm({ ...form, timeZoneId })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="profile-description">{t("resourceProfile.fields.description")}</Label>
              <Textarea
                id="profile-description"
                maxLength={1000}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <fieldset className="space-y-3 rounded-nx-md border border-nx-line p-4">
            <legend className="px-2 text-sm font-semibold">
              {t("resourceProfile.fields.operatingDays")}
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DAYS.map((day) => (
                <div key={day.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`day-${day.key}`}
                    checked={(form.days & day.value) !== 0}
                    onCheckedChange={(checked) =>
                      setForm({
                        ...form,
                        days: checked ? form.days | day.value : form.days & ~day.value,
                      })
                    }
                  />
                  <Label htmlFor={`day-${day.key}`} className="text-sm cursor-pointer">
                    {t(`resourceProfile.days.${day.key}`)}
                  </Label>
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="profile-opens">{t("resourceProfile.fields.opensAt")}</Label>
                <Input
                  id="profile-opens"
                  type="time"
                  value={form.opensAt}
                  onChange={(e) => setForm({ ...form, opensAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-closes">{t("resourceProfile.fields.closesAt")}</Label>
                <Input
                  id="profile-closes"
                  type="time"
                  value={form.closesAt}
                  onChange={(e) => setForm({ ...form, closesAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-setup">{t("resourceProfile.fields.setup")}</Label>
                <Input
                  id="profile-setup"
                  type="number"
                  min={0}
                  value={form.setupBufferMinutes}
                  onChange={(e) =>
                    setForm({ ...form, setupBufferMinutes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-cleanup">{t("resourceProfile.fields.cleanup")}</Label>
                <Input
                  id="profile-cleanup"
                  type="number"
                  min={0}
                  value={form.cleanupBufferMinutes}
                  onChange={(e) =>
                    setForm({ ...form, cleanupBufferMinutes: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-nx-md border border-nx-line p-4">
            <legend className="px-2 text-sm font-semibold">
              {t("resourceProfile.fields.usageTypes")}
            </legend>
            {form.usageTypes.map((usage, index) => (
              <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                <Input
                  aria-label={t("resourceProfile.fields.usageCode")}
                  placeholder={t("resourceProfile.fields.usageCode")}
                  value={usage.code}
                  onChange={(e) => updateUsageType(index, { code: e.target.value })}
                />
                <Input
                  aria-label={t("resourceProfile.fields.usageLabel")}
                  placeholder={t("resourceProfile.fields.usageLabel")}
                  value={usage.label}
                  onChange={(e) => updateUsageType(index, { label: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("common.delete")}
                  disabled={form.usageTypes.length === 1}
                  onClick={() =>
                    setForm({
                      ...form,
                      usageTypes: form.usageTypes.filter(
                        (_, itemIndex) => itemIndex !== index
                      ),
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm({
                  ...form,
                  usageTypes: [...form.usageTypes, { code: "", label: "" }],
                })
              }
            >
              <Plus className="size-4" />
              {t("resourceProfile.addUsage")}
            </Button>
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <FacilityQuickCreateDialog
      open={quickCreateFacilityOpen}
      onOpenChange={setQuickCreateFacilityOpen}
      onSuccess={(newFacilityId) => {
        setForm((cur) => ({ ...cur, facilityId: newFacilityId }));
        onFacilityCreated?.(newFacilityId);
      }}
    />
  </>
  );
}
