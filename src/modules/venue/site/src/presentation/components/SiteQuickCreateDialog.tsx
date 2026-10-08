"use client";

import React, { useState } from "react";
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
import {
  SiteLocationFields,
  type SiteLocationState,
} from "./SiteLocationFields";
import { getDefaultTimeZoneForCountry } from "@core/constants/countries";

interface SiteQuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdSiteId: string) => void;
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
 * Documentation for SiteQuickCreateDialog
 */
export function SiteQuickCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: SiteQuickCreateDialogProps) {
  const { t } = useI18n();
  const { success, error: toastError } = useEnhancedToast();
  const [name, setName] = useState("");
  const [location, setLocation] = useState<SiteLocationState>(() => ({
    ...DEFAULT_LOCATION,
    timeZone: getDefaultTimeZoneForCountry("SA"),
  }));
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

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

      const siteId = await useVenueServiceLocatorStatic.siteRepository.create({
        name: name.trim(),
        address: finalAddress,
        timeZone: finalTz,
      });

      success(t("site.createdSuccess") || "Site created successfully");
      setName("");
      setLocation({
        ...DEFAULT_LOCATION,
        timeZone: getDefaultTimeZoneForCountry("SA"),
      });
      setNameError("");
      onOpenChange(false);
      onSuccess?.(siteId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("common.error");
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("site.addNew")}</DialogTitle>
            <DialogDescription>
              {t("site.operatingTerritoryDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="site-quick-name" className="text-xs font-medium">
                {t("site.fields.name")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="site-quick-name"
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
              {saving ? t("common.saving") : t("site.addNew")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
