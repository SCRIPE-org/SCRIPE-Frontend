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

/**
 * Presentation UI component rendering the tenant plan step basics.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantPlanStepBasics({ form, updateForm, t }: TenantPlanStepBasicsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            {t("entitlements.tenantPlans.planName")}{" "}
            <span aria-hidden="true" className="text-nx-danger">
              *
            </span>
          </Label>
          <Input
            id="name"
            value={form.name || ""}
            onChange={(e) => updateForm({ name: e.target.value })}
            placeholder={t("entitlements.tenantPlans.namePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">
            {t("entitlements.tenantPlans.color")}
          </Label>
          <div className="flex gap-2">
            <Input
              id="color"
              value={form.color || ""}
              onChange={(e) => updateForm({ color: e.target.value })}
              placeholder={t("entitlements.tenantPlans.colorPlaceholder")}
            />
            {/* Live swatch of the tenant's own chosen brand color — inherently
                data-driven, not a design-system color, so it paints directly
                from `form.color` rather than an nx token. */}
            <div
              className="h-10 w-10 shrink-0 rounded-nx-control border border-nx-line"
              style={{ backgroundColor: form.color || "transparent" }}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayNameEn">
            {t("entitlements.tenantPlans.displayNameEn")}
          </Label>
          <Input
            id="displayNameEn"
            value={form.displayNameEn || ""}
            onChange={(e) => updateForm({ displayNameEn: e.target.value })}
            placeholder={t("entitlements.tenantPlans.displayNameEnPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayNameAr">
            {t("entitlements.tenantPlans.displayNameAr")}
          </Label>
          <Input
            id="displayNameAr"
            value={form.displayNameAr || ""}
            onChange={(e) => updateForm({ displayNameAr: e.target.value })}
            dir="rtl"
            placeholder={t("entitlements.tenantPlans.displayNameArPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">{t("entitlements.tenantPlans.tagline")}</Label>
          <Input
            id="tagline"
            value={form.tagline || ""}
            onChange={(e) => updateForm({ tagline: e.target.value })}
            placeholder={t("entitlements.tenantPlans.taglinePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="badgeText">
            {t("entitlements.tenantPlans.badgeText")}
          </Label>
          <Input
            id="badgeText"
            value={form.badgeText || ""}
            onChange={(e) => updateForm({ badgeText: e.target.value })}
            placeholder={t("entitlements.tenantPlans.badgeTextPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tierLevel">{t("entitlements.tenantPlans.tier")}</Label>
          <Input
            id="tierLevel"
            type="number"
            min={0}
            value={form.tierLevel ?? 0}
            onChange={(e) => updateForm({ tierLevel: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">
            {t("entitlements.tenantPlans.sortOrder")}
          </Label>
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
        <Label htmlFor="description">{t("common.description")}</Label>
        <Textarea
          id="description"
          value={form.description || ""}
          onChange={(e) => updateForm({ description: e.target.value })}
          rows={3}
          placeholder={t("entitlements.tenantPlans.descriptionPlaceholder")}
        />
      </div>

      <div className="space-y-4 rounded-nx-md border border-nx-line bg-nx-raised p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="isPublic">{t("entitlements.tenantPlans.isPublic")}</Label>
            <p className="text-sm leading-relaxed text-nx-ink-2">
              {t("entitlements.tenantPlans.isPublicDesc")}
            </p>
          </div>
          <Switch
            id="isPublic"
            checked={form.isPublic ?? true}
            onCheckedChange={(checked) => updateForm({ isPublic: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="isContactSalesOnly">
              {t("entitlements.tenantPlans.isContactSalesOnly")}
            </Label>
            <p className="text-sm leading-relaxed text-nx-ink-2">
              {t("entitlements.tenantPlans.isContactSalesOnlyDesc")}
            </p>
          </div>
          <Switch
            id="isContactSalesOnly"
            checked={form.isContactSalesOnly ?? false}
            onCheckedChange={(checked) => updateForm({ isContactSalesOnly: checked })}
          />
        </div>
      </div>
    </div>
  );
}
