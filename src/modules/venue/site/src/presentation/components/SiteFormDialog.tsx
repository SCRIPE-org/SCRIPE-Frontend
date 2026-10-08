"use client";

import React, { useState, useEffect } from "react";
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
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useVenueServiceLocatorStatic } from "@modules/venue";
import type { Site } from "../../domain/entities/Site";
import {
  SiteLocationFields,
  type SiteLocationState,
} from "./SiteLocationFields";
import { getDefaultTimeZoneForCountry } from "@core/constants/countries";

interface SiteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: Site | null;
  onSuccess?: (siteId: string) => void;
}

const DEFAULT_LOCATION: SiteLocationState = {
  countryCode: "SA",
  timeZone: "Asia/Riyadh",
  state: "",
  city: "",
  district: "",
  postalCode: "",
  street: "",
  address: "",
};

/**
 * Documentation for SiteFormDialog
 */
export function SiteFormDialog({
  open,
  onOpenChange,
  site,
  onSuccess,
}: SiteFormDialogProps) {
  const { t } = useI18n();
  const { success, error: toastError } = useEnhancedToast();

  const [name, setName] = useState("");
  const [location, setLocation] = useState<SiteLocationState>(DEFAULT_LOCATION);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (open) {
      void Promise.resolve().then(() => {
        if (site) {
          setName(site.name || "");
          const tz = site.timeZone || "UTC";
          const addr = site.address || "";
          setLocation({
            ...DEFAULT_LOCATION,
            timeZone: tz,
            street: addr,
            address: addr,
          });
        } else {
          setName("");
          setLocation({
            ...DEFAULT_LOCATION,
            timeZone: getDefaultTimeZoneForCountry("SA"),
          });
        }
        setNameError("");
      });
    }
  }, [open, site]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t("validation.required") || "Name is required");
      return;
    }

    setSaving(true);
    try {
      const finalAddress = location.address.trim() || location.street.trim() || undefined;
      const finalTz = location.timeZone.trim() || undefined;

      let resultId = site?.id || "";
      if (site?.id) {
        await useVenueServiceLocatorStatic.siteRepository.update(site.id, {
          name: name.trim(),
          address: finalAddress,
          timeZone: finalTz,
        });
        success(t("site.updatedSuccess") || "Site updated successfully");
      } else {
        resultId = await useVenueServiceLocatorStatic.siteRepository.create({
          name: name.trim(),
          address: finalAddress,
          timeZone: finalTz,
        });
        success(t("site.createdSuccess") || "Site created successfully");
      }

      onOpenChange(false);
      onSuccess?.(resultId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("common.error");
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!site?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? t("site.editTitle") : t("site.addNew")}
            </DialogTitle>
            <DialogDescription>
              {t("site.operatingTerritoryDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Site Name */}
            <div className="space-y-1.5">
              <Label htmlFor="site-dialog-name" className="text-xs font-medium">
                {t("site.fields.name")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="site-dialog-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder={t("site.placeholders.name")}
                required
                autoFocus
                maxLength={200}
                aria-invalid={!!nameError || undefined}
              />
              {nameError && (
                <p className="text-xs text-destructive">{nameError}</p>
              )}
            </div>

            {/* Geographic Territory & Time Zone Engine */}
            <SiteLocationFields
              location={location}
              onChange={setLocation}
            />
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
            <Button type="submit" disabled={!name.trim() || saving}>
              {saving
                ? t("common.saving")
                : isEdit
                ? t("common.save")
                : t("site.addNew")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
