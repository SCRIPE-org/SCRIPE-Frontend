"use client";

import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Switch } from "@core/ui/switch";
import type { CreateTenantPlanRequest } from "../../../domain/entities/TenantPlanRequests";

interface TenantPlanStepBasicsProps {
  form: Partial<CreateTenantPlanRequest>;
  updateForm: (updates: Partial<CreateTenantPlanRequest>) => void;
  t: (key: string) => string;
}

export function TenantPlanStepBasics({ form, updateForm, t }: TenantPlanStepBasicsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">{t("entitlements.tenantPlans.planName") || "Plan Name"} <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            value={form.name || ""}
            onChange={(e) => updateForm({ name: e.target.value })}
            placeholder={t("entitlements.tenantPlans.namePlaceholder") || "e.g. Premium"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">{t("entitlements.tenantPlans.color") || "Brand Color (Hex)"}</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              value={form.color || ""}
              onChange={(e) => updateForm({ color: e.target.value })}
              placeholder="#3b82f6"
            />
            <div 
              className="w-10 h-10 rounded-md border shrink-0" 
              style={{ backgroundColor: form.color || "transparent" }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayNameEn">{t("entitlements.tenantPlans.displayNameEn") || "Display Name (EN)"}</Label>
          <Input
            id="displayNameEn"
            value={form.displayNameEn || ""}
            onChange={(e) => updateForm({ displayNameEn: e.target.value })}
            placeholder={t("entitlements.tenantPlans.displayNameEnPlaceholder") || "Premium"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayNameAr">{t("entitlements.tenantPlans.displayNameAr") || "Display Name (AR)"}</Label>
          <Input
            id="displayNameAr"
            value={form.displayNameAr || ""}
            onChange={(e) => updateForm({ displayNameAr: e.target.value })}
            dir="rtl"
            placeholder={t("entitlements.tenantPlans.displayNameArPlaceholder") || "الممتازة"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">{t("entitlements.tenantPlans.tagline") || "Tagline"}</Label>
          <Input
            id="tagline"
            value={form.tagline || ""}
            onChange={(e) => updateForm({ tagline: e.target.value })}
            placeholder={t("entitlements.tenantPlans.taglinePlaceholder") || "Best for growing teams"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="badgeText">{t("entitlements.tenantPlans.badgeText") || "Badge Text"}</Label>
          <Input
            id="badgeText"
            value={form.badgeText || ""}
            onChange={(e) => updateForm({ badgeText: e.target.value })}
            placeholder={t("entitlements.tenantPlans.badgeTextPlaceholder") || "Most Popular"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tierLevel">{t("entitlements.tenantPlans.tier") || "Tier Level"}</Label>
          <Input
            id="tierLevel"
            type="number"
            min={0}
            value={form.tierLevel ?? 0}
            onChange={(e) => updateForm({ tierLevel: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">{t("entitlements.tenantPlans.sortOrder") || "Sort Order"}</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            value={form.sortOrder ?? 0}
            onChange={(e) => updateForm({ sortOrder: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("common.description") || "Description"}</Label>
        <Textarea
          id="description"
          value={form.description || ""}
          onChange={(e) => updateForm({ description: e.target.value })}
          rows={3}
          placeholder={t("entitlements.tenantPlans.descriptionPlaceholder") || "Brief description..."}
        />
      </div>

      <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("entitlements.tenantPlans.isPublic") || "Publicly Visible"}</Label>
            <p className="text-sm text-muted-foreground">
              {t("entitlements.tenantPlans.isPublicDesc") || "Show this plan on the public pricing page."}
            </p>
          </div>
          <Switch
            checked={form.isPublic ?? true}
            onCheckedChange={(checked) => updateForm({ isPublic: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("entitlements.tenantPlans.isContactSalesOnly") || "Contact Sales Only"}</Label>
            <p className="text-sm text-muted-foreground">
              {t("entitlements.tenantPlans.isContactSalesOnlyDesc") || "Hide prices and show 'Contact Us' button."}
            </p>
          </div>
          <Switch
            checked={form.isContactSalesOnly ?? false}
            onCheckedChange={(checked) => updateForm({ isContactSalesOnly: checked })}
          />
        </div>
      </div>
    </div>
  );
}
