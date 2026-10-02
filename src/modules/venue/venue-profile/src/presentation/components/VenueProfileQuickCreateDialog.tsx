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
import { SiteQuickCreateDialog } from "@modules/venue/site/src/presentation/components/SiteQuickCreateDialog";
import { Plus } from "lucide-react";
import type { Site } from "@modules/venue/site/src/domain/entities/Site";

interface VenueProfileQuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdVenueProfileId: string) => void;
  defaultSiteId?: string;
}

export function VenueProfileQuickCreateDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultSiteId,
}: VenueProfileQuickCreateDialogProps) {
  const { t } = useI18n();
  const { success, error: toastError } = useEnhancedToast();

  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [siteId, setSiteId] = useState(defaultSiteId ?? "");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [siteQuickCreateOpen, setSiteQuickCreateOpen] = useState(false);

  const [errors, setErrors] = useState<{ siteId?: string; code?: string; name?: string }>({});

  const loadSites = useCallback(async () => {
    try {
      setLoadingSites(true);
      const res = await venueContainer.siteRepository.getAll({ page: 1, pageSize: 100 });
      setSites(res.items);
      if (!siteId && res.items.length > 0) {
        setSiteId(res.items[0].id);
      }
    } catch {
      // Fail safely
    } finally {
      setLoadingSites(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (open) {
      void loadSites();
      if (defaultSiteId) {
        setSiteId(defaultSiteId);
      }
    }
  }, [open, defaultSiteId, loadSites]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { siteId?: string; code?: string; name?: string } = {};

    if (!siteId.trim()) {
      newErrors.siteId = t("validation.required") || "Site is required";
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
      const createdId = await venueContainer.venueProfileRepository.create({
        siteId: siteId.trim(),
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
      });

      success(t("venueProfile.createdSuccess") || "Venue Profile created successfully");
      setCode("");
      setName("");
      setDescription("");
      setErrors({});
      onOpenChange(false);
      onSuccess?.(createdId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("common.error");
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSiteCreated = async (newSiteId: string) => {
    await loadSites();
    setSiteId(newSiteId);
    if (errors.siteId) {
      setErrors((prev) => ({ ...prev, siteId: undefined }));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[540px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t("venueProfile.addNew") || "New Venue Profile"}</DialogTitle>
              <DialogDescription>
                {t("venueProfile.description") || "Define the operational profile for a site."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="venue-site-select" className="text-xs font-medium">
                    {t("venueProfile.fields.siteId")} <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-xs text-nx-accent hover:text-nx-accent/80"
                    onClick={() => setSiteQuickCreateOpen(true)}
                  >
                    <Plus className="mr-1 size-3" />
                    {t("venueProfile.quickCreateSite") || "New Site"}
                  </Button>
                </div>
                <GenericSelect
                  type="searchable"
                  searchType="client"
                  allowClear={false}
                  aria-label={t("venueProfile.fields.siteId")}
                  options={sites.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  value={siteId}
                  onValueChange={(val: string | string[]) => {
                    const selected = Array.isArray(val) ? val[0] ?? "" : val;
                    setSiteId(selected);
                    if (errors.siteId) setErrors((prev) => ({ ...prev, siteId: undefined }));
                  }}
                  placeholder={loadingSites ? t("common.loading") : t("venueProfile.placeholders.siteId")}
                />
                {errors.siteId && <p className="text-xs text-destructive">{errors.siteId}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue-code" className="text-xs font-medium">
                  {t("venueProfile.fields.code")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="venue-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
                  }}
                  placeholder={t("venueProfile.placeholders.code") || "e.g. VENUE-01"}
                  required
                  maxLength={50}
                  aria-invalid={!!errors.code || undefined}
                />
                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue-name" className="text-xs font-medium">
                  {t("venueProfile.fields.name")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="venue-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder={t("venueProfile.placeholders.name") || "e.g. Main Complex"}
                  required
                  maxLength={200}
                  aria-invalid={!!errors.name || undefined}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue-desc" className="text-xs font-medium">
                  {t("venueProfile.fields.description")}
                </Label>
                <Textarea
                  id="venue-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("venueProfile.placeholders.description")}
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
              <Button type="submit" disabled={!name.trim() || !code.trim() || !siteId.trim() || saving}>
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SiteQuickCreateDialog
        open={siteQuickCreateOpen}
        onOpenChange={setSiteQuickCreateOpen}
        onSuccess={handleSiteCreated}
      />
    </>
  );
}
