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
import { venueContainer } from "@modules/venue/di";
import type { Site } from "../../domain/entities/Site";

interface SiteQuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdSiteId: string) => void;
}

export function SiteQuickCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: SiteQuickCreateDialogProps) {
  const { t } = useI18n();
  const { success, error: toastError } = useEnhancedToast();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [timeZone, setTimeZone] = useState("UTC");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const siteId = await venueContainer.siteRepository.create({
        name: name.trim(),
        address: address.trim() || undefined,
        timeZone: timeZone.trim() || undefined,
      });

      success(t("venueProfile.siteCreatedSuccess") || "Site created successfully");
      setName("");
      setAddress("");
      setTimeZone("UTC");
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
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("venueProfile.quickCreateSite")}</DialogTitle>
            <DialogDescription>
              {t("venueProfile.quickCreateSiteDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="site-quick-name">{t("venueProfile.siteName")}</Label>
              <Input
                id="site-quick-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("venueProfile.siteNamePlaceholder")}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-quick-address">{t("venueProfile.siteAddress")}</Label>
              <Input
                id="site-quick-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("venueProfile.siteAddressPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-quick-timezone">{t("venueProfile.siteTimeZone")}</Label>
              <Input
                id="site-quick-timezone"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                placeholder={t("venueProfile.siteTimeZonePlaceholder")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim() || saving}>
              {saving ? t("venueProfile.creatingSite") : t("venueProfile.createSiteAction")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
