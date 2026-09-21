"use client";

import React, { useMemo, useState } from "react";
import { Building2, Clock3, Lock, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { TimezonePicker } from "@modules/custom-fields";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Checkbox } from "@core/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { EmptyState } from "@core/ui/empty-state";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { Textarea } from "@core/ui/textarea";
import { GenericSelect } from "@core/crud/components/generic-select";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueResourceNav } from "@modules/venue/shared/src/presentation/components/VenueResourceNav";
import type {
  FacilityResourceProfile,
  FacilityResourceProfileWrite,
  UsageType,
} from "../../domain/entities/FacilityResourceProfile";
import { useFacilityResourceProfilesViewModel } from "../viewmodels/useFacilityResourceProfilesViewModel";

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

export const FacilityResourceProfilesView = React.memo(function FacilityResourceProfilesView() {
  useModuleLocales(() => import("../../../locales"), "venue.resourceProfile");
  const { t } = useI18n();
  const vm = useFacilityResourceProfilesViewModel();
  const canView = usePermission(VENUE_PERMISSIONS.FACILITY_RESOURCE_PROFILE_VIEW);
  const canCreate = usePermission(VENUE_PERMISSIONS.FACILITY_RESOURCE_PROFILE_CREATE);
  const canUpdate = usePermission(VENUE_PERMISSIONS.FACILITY_RESOURCE_PROFILE_UPDATE);
  const { success, error: toastError } = useEnhancedToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState<FacilityResourceProfileWrite>(() => emptyForm(""));
  const [saving, setSaving] = useState(false);

  const facilityOptions = useMemo(
    () => vm.facilities.map((facility) => ({ value: facility.id, label: facility.name })),
    [vm.facilities]
  );

  if (!canView) {
    return <EmptyState icon={Lock} title={t("notAuthorized.title")} description={t("notAuthorized.description")} />;
  }

  if (vm.loading && vm.facilities.length === 0) return <LoadingSpinner showText={false} />;

  const beginCreate = () => {
    setEditingId(undefined);
    setForm(emptyForm(vm.selectedFacilityId));
    setOpen(true);
  };

  const beginEdit = async (profile: FacilityResourceProfile) => {
    try {
      const detail = await vm.loadDetail(profile.id);
      setEditingId(profile.id);
      setForm(toForm(detail));
      setOpen(true);
    } catch (caught) {
      toastError({ title: caught instanceof Error ? caught.message : t("common.error") });
    }
  };

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
    if (!form.facilityId || !form.code.trim() || !form.name.trim() || !form.resourceKindCode.trim() || !form.timeZoneId || form.days === 0 || form.opensAt >= form.closesAt || usageTypes.length === 0) {
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
      await vm.save(
        {
          ...form,
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description?.trim() || undefined,
          resourceKindCode: form.resourceKindCode.trim(),
          usageTypes,
        },
        editingId
      );
      setOpen(false);
      success({ title: t(editingId ? "resourceProfile.updated" : "resourceProfile.created") });
    } catch (caught) {
      toastError({ title: caught instanceof Error ? caught.message : t("common.error") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <VenueResourceNav />
      <PageHeader
        icon={Building2}
        title={t("resourceProfile.title")}
        description={t("resourceProfile.description")}
        actions={canCreate ? <Button onClick={beginCreate}><Plus className="size-4" />{t("resourceProfile.add")}</Button> : undefined}
      />

      <div className="max-w-md space-y-2">
        <Label>{t("resourceProfile.facility")}</Label>
        <GenericSelect
          type="searchable"
          searchType="client"
          allowClear={false}
          aria-label={t("resourceProfile.facility")}
          options={facilityOptions}
          value={vm.selectedFacilityId}
          onValueChange={(value: string | string[]) => vm.setSelectedFacilityId(Array.isArray(value) ? value[0] ?? "" : value)}
          placeholder={t("resourceProfile.selectFacility")}
        />
      </div>

      {vm.error && <EmptyState icon={Building2} title={t("common.error")} description={vm.error.message} action={<Button variant="outline" onClick={() => void vm.refresh()}>{t("common.retry")}</Button>} />}
      {!vm.error && !vm.loading && vm.facilities.length === 0 && <EmptyState icon={Building2} title={t("resourceProfile.noFacilities")} description={t("resourceProfile.noFacilitiesDescription")} />}
      {!vm.error && vm.selectedFacilityId && vm.profiles.length === 0 && <EmptyState icon={Building2} title={t("resourceProfile.empty")} description={t("resourceProfile.emptyDescription")} />}

      <div className="grid gap-4 lg:grid-cols-2">
        {vm.profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{profile.code}</Badge>
                  <Badge variant="outline">{profile.resourceKindCode}</Badge>
                </div>
              </div>
              {canUpdate && <Button variant="ghost" size="icon" aria-label={t("common.edit")} onClick={() => void beginEdit(profile)}><Pencil className="size-4" /></Button>}
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-nx-ink-2">
              {profile.description && <p>{profile.description}</p>}
              <p className="flex items-center gap-2"><Clock3 className="size-4" />{t("resourceProfile.detailsOpen")}</p>
              <p className="flex items-center gap-2"><Tag className="size-4" />{t("resourceProfile.detailsUsage")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <form onSubmit={submit} className="space-y-6">
            <DialogHeader>
              <DialogTitle>{t(editingId ? "resourceProfile.editTitle" : "resourceProfile.createTitle")}</DialogTitle>
              <DialogDescription>{t("resourceProfile.formDescription")}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="profile-code">{t("resourceProfile.fields.code")}</Label><Input id="profile-code" required maxLength={50} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="profile-name">{t("resourceProfile.fields.name")}</Label><Input id="profile-name" required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="profile-kind">{t("resourceProfile.fields.kind")}</Label><Input id="profile-kind" required maxLength={50} value={form.resourceKindCode} onChange={(e) => setForm({ ...form, resourceKindCode: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="profile-timezone">{t("resourceProfile.fields.timezone")}</Label><TimezonePicker id="profile-timezone" aria-label={t("resourceProfile.fields.timezone")} value={form.timeZoneId} onChange={(timeZoneId: string) => setForm({ ...form, timeZoneId })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-description">{t("resourceProfile.fields.description")}</Label><Textarea id="profile-description" maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>

            <fieldset className="space-y-3 rounded-nx-md border border-nx-line p-4">
              <legend className="px-2 text-sm font-semibold">{t("resourceProfile.fields.operatingDays")}</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {DAYS.map((day) => <label key={day.key} className="flex items-center gap-2 text-sm"><Checkbox checked={(form.days & day.value) !== 0} onCheckedChange={(checked) => setForm({ ...form, days: checked ? form.days | day.value : form.days & ~day.value })} />{t(`resourceProfile.days.${day.key}`)}</label>)}
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2"><Label htmlFor="profile-opens">{t("resourceProfile.fields.opensAt")}</Label><Input id="profile-opens" type="time" value={form.opensAt} onChange={(e) => setForm({ ...form, opensAt: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="profile-closes">{t("resourceProfile.fields.closesAt")}</Label><Input id="profile-closes" type="time" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="profile-setup">{t("resourceProfile.fields.setup")}</Label><Input id="profile-setup" type="number" min={0} value={form.setupBufferMinutes} onChange={(e) => setForm({ ...form, setupBufferMinutes: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label htmlFor="profile-cleanup">{t("resourceProfile.fields.cleanup")}</Label><Input id="profile-cleanup" type="number" min={0} value={form.cleanupBufferMinutes} onChange={(e) => setForm({ ...form, cleanupBufferMinutes: Number(e.target.value) })} /></div>
              </div>
            </fieldset>

            <fieldset className="space-y-3 rounded-nx-md border border-nx-line p-4">
              <legend className="px-2 text-sm font-semibold">{t("resourceProfile.fields.usageTypes")}</legend>
              {form.usageTypes.map((usage, index) => <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-2"><Input aria-label={t("resourceProfile.fields.usageCode")} placeholder={t("resourceProfile.fields.usageCode")} value={usage.code} onChange={(e) => updateUsageType(index, { code: e.target.value })} /><Input aria-label={t("resourceProfile.fields.usageLabel")} placeholder={t("resourceProfile.fields.usageLabel")} value={usage.label} onChange={(e) => updateUsageType(index, { label: e.target.value })} /><Button type="button" variant="ghost" size="icon" aria-label={t("common.delete")} disabled={form.usageTypes.length === 1} onClick={() => setForm({ ...form, usageTypes: form.usageTypes.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 className="size-4" /></Button></div>)}
              <Button type="button" variant="outline" onClick={() => setForm({ ...form, usageTypes: [...form.usageTypes, { code: "", label: "" }] })}><Plus className="size-4" />{t("resourceProfile.addUsage")}</Button>
            </fieldset>

            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button><Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("common.save")}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});
