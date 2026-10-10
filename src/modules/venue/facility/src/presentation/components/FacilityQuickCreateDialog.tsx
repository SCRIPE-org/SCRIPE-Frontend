"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { venueContainer } from "@modules/venue/di";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueProfileQuickCreateDialog } from "@modules/venue/venue-profile/src/presentation/components/VenueProfileQuickCreateDialog";
import { Plus } from "lucide-react";
import type { VenueProfile } from "@modules/venue/venue-profile/src/domain/entities/VenueProfile";
import { mapVenueError } from "@modules/venue/shared/src/utils/venueErrorMapper";

interface FacilityQuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdFacilityId: string) => void;
  defaultVenueProfileId?: string;
}

export function FacilityQuickCreateDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultVenueProfileId,
}: FacilityQuickCreateDialogProps) {
  const { t } = useI18n();
  const { success, error: toastError } = useEnhancedToast();
  const canCreateVenueProfile = usePermission(VENUE_PERMISSIONS.VENUE_PROFILE_CREATE);

  const [venueProfiles, setVenueProfiles] = useState<VenueProfile[]>([]);
  const [loadingVenueProfiles, setLoadingVenueProfiles] = useState(false);
  const [venueProfileId, setVenueProfileId] = useState(defaultVenueProfileId ?? "");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [venueProfileQuickCreateOpen, setVenueProfileQuickCreateOpen] = useState(false);

  const [errors, setErrors] = useState<{ venueProfileId?: string; code?: string; name?: string }>({});

  const loadVenueProfiles = useCallback(async () => {
    try {
      setLoadingVenueProfiles(true);
      const res = await venueContainer.venueProfileRepository.getAll({ page: 1, pageSize: 100 });
      setVenueProfiles(res.items);
      if (res.items.length > 0) {
        setVenueProfileId((current) => current || res.items[0].id);
      } else {
        // If no venue profiles exist yet for the tenant, auto-create one
        try {
          const sites = await venueContainer.siteRepository.getAll({ page: 1, pageSize: 10 });
          let siteId = sites.items[0]?.id;
          if (!siteId) {
            siteId = await venueContainer.siteRepository.create({
              name: "Main Complex",
              timeZone: "UTC",
            });
          }
          const vpId = await venueContainer.venueProfileRepository.create({
            siteId,
            code: `VP_${Date.now().toString().slice(-6)}`,
            name: "Main Venue",
            description: "Default venue profile",
          });
          const recheck = await venueContainer.venueProfileRepository.getAll({ page: 1, pageSize: 100 });
          setVenueProfiles(recheck.items);
          setVenueProfileId(vpId);
        } catch {
          // Fall back gracefully
        }
      }
    } catch {
      // Fail safely
    } finally {
      setLoadingVenueProfiles(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadVenueProfiles();
      if (defaultVenueProfileId) {
        setVenueProfileId(defaultVenueProfileId);
      }
    }
  }, [open, defaultVenueProfileId, loadVenueProfiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { venueProfileId?: string; code?: string; name?: string } = {};

    let targetVenueProfileId = venueProfileId.trim();
    if (!targetVenueProfileId && venueProfiles.length > 0) {
      targetVenueProfileId = venueProfiles[0].id;
      setVenueProfileId(targetVenueProfileId);
    }

    if (!code.trim()) {
      newErrors.code = t("validation.required") || "Code is required";
    }
    if (!name.trim()) {
      newErrors.name = t("validation.required") || "Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      // If still missing venueProfileId, resolve or create on demand
      if (!targetVenueProfileId) {
        const sites = await venueContainer.siteRepository.getAll({ page: 1, pageSize: 10 });
        let siteId = sites.items[0]?.id;
        if (!siteId) {
          siteId = await venueContainer.siteRepository.create({
            name: name.trim() || "Main Sports Site",
            timeZone: "UTC",
          });
        }
        targetVenueProfileId = await venueContainer.venueProfileRepository.create({
          siteId,
          code: `VP_${Date.now().toString().slice(-6)}`,
          name: name.trim() || "Main Venue",
          description: "Authoritative venue profile",
        });
        setVenueProfileId(targetVenueProfileId);
      }

      const createdId = await venueContainer.facilityRepository.create({
        venueProfileId: targetVenueProfileId,
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
      });

      success(t("facility.createdSuccess") || "Facility created successfully");
      setCode("");
      setName("");
      setDescription("");
      setErrors({});
      onOpenChange(false);
      onSuccess?.(createdId);
    } catch (err: unknown) {
      const safeError = mapVenueError(err);
      toastError(safeError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVenueProfileCreated = async (newVenueProfileId: string) => {
    await loadVenueProfiles();
    setVenueProfileId(newVenueProfileId);
    if (errors.venueProfileId) {
      setErrors((prev) => ({ ...prev, venueProfileId: undefined }));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[540px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t("facility.addNew") || "New Facility"}</DialogTitle>
              <DialogDescription>
                {t("facility.description") || "Add a facility (building, court, or field block) to a venue profile."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label id="facility-venue-label" htmlFor="facility-venue-select" className="text-xs font-medium">
                    {t("facility.fields.venueProfileId")} <span className="text-destructive">*</span>
                  </Label>
                  {canCreateVenueProfile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-xs text-nx-accent hover:text-nx-accent/80"
                      onClick={() => setVenueProfileQuickCreateOpen(true)}
                    >
                      <Plus className="mr-1 size-3" />
                      {t("facility.quickCreateVenueProfile") || "New Venue Profile"}
                    </Button>
                  )}
                </div>
                <GenericSelect
                  id="facility-venue-select"
                  aria-labelledby="facility-venue-label"
                  type="searchable"
                  searchType="client"
                  allowClear={false}
                  options={venueProfiles.map((v) => ({
                    value: v.id,
                    label: v.name,
                  }))}
                  value={venueProfileId}
                  onValueChange={(val: string | string[]) => {
                    const selected = Array.isArray(val) ? val[0] ?? "" : val;
                    setVenueProfileId(selected);
                    if (errors.venueProfileId) setErrors((prev) => ({ ...prev, venueProfileId: undefined }));
                  }}
                  placeholder={loadingVenueProfiles ? t("common.loading") : t("facility.placeholders.venueProfileId")}
                />
                {errors.venueProfileId && <p className="text-xs text-destructive">{errors.venueProfileId}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facility-code" className="text-xs font-medium">
                  {t("facility.fields.code")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="facility-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
                  }}
                  placeholder={t("facility.placeholders.code") || "e.g. BLD-A"}
                  required
                  maxLength={50}
                  aria-invalid={!!errors.code || undefined}
                />
                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facility-name" className="text-xs font-medium">
                  {t("facility.fields.name")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="facility-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder={t("facility.placeholders.name") || "e.g. Main Pitch"}
                  required
                  maxLength={200}
                  aria-invalid={!!errors.name || undefined}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facility-desc" className="text-xs font-medium">
                  {t("facility.fields.description")}
                </Label>
                <Textarea
                  id="facility-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("facility.placeholders.description")}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={!name.trim() || !code.trim() || !venueProfileId.trim() || saving}>
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <VenueProfileQuickCreateDialog
        open={venueProfileQuickCreateOpen}
        onOpenChange={setVenueProfileQuickCreateOpen}
        onSuccess={handleVenueProfileCreated}
      />
    </>
  );
}
