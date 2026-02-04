/**
 * Branding Section Component
 *
 * Section for tenant branding settings (company name, logo, colors).
 * Pure UI - receives all data and handlers from parent view via props.
 */
"use client";

import {
      Card,
      CardContent,
      CardDescription,
      CardHeader,
      CardTitle,
} from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Palette } from "lucide-react";
import type { TenantSettings } from "../../domain/entities/TenantSettings";

interface BrandingSectionProps {
      settings: TenantSettings;
      updateField: <K extends keyof TenantSettings>(field: K, value: TenantSettings[K]) => void;
      t: (key: string) => string;
}

export function BrandingSection({ settings, updateField, t }: BrandingSectionProps) {
      return (
            <Card>
                  <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                              <Palette className="h-5 w-5" />
                              {t("tenantSettings.branding")}
                        </CardTitle>
                        <CardDescription>
                              {t("tenantSettings.brandingDescription")}
                        </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                              <Label htmlFor="companyName">{t("tenantSettings.companyName")}</Label>
                              <Input
                                    id="companyName"
                                    value={settings.companyName ?? ""}
                                    onChange={(e) => updateField("companyName", e.target.value || null)}
                              />
                              <p className="text-xs text-muted-foreground">
                                    {t("tenantSettings.companyNameHelp")}
                              </p>
                        </div>
                        <div className="space-y-2">
                              <Label htmlFor="logoUrl">{t("tenantSettings.logoUrl")}</Label>
                              <Input
                                    id="logoUrl"
                                    value={settings.logoUrl ?? ""}
                                    onChange={(e) => updateField("logoUrl", e.target.value || null)}
                              />
                              <p className="text-xs text-muted-foreground">
                                    {t("tenantSettings.logoUrlHelp")}
                              </p>
                        </div>
                        <div className="space-y-2">
                              <Label htmlFor="primaryColor">{t("tenantSettings.primaryColor")}</Label>
                              <div className="flex gap-2">
                                    <Input
                                          id="primaryColor"
                                          value={settings.primaryColor ?? ""}
                                          onChange={(e) => updateField("primaryColor", e.target.value || null)}
                                          placeholder="#3b82f6"
                                    />
                                    {settings.primaryColor && (
                                          <div
                                                className="h-9 w-9 rounded border flex-shrink-0"
                                                style={{ backgroundColor: settings.primaryColor }}
                                          />
                                    )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                    {t("tenantSettings.primaryColorHelp")}
                              </p>
                        </div>
                  </CardContent>
            </Card>
      );
}
