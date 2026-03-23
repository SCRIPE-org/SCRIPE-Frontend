"use client";

import { useCustomizationViewModel } from "../viewmodels/useCustomizationViewModel";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Switch } from "@core/ui/switch";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  RotateCcw,
  History,
  Settings,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Info,
  Paintbrush,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { TenantSettings } from "../../domain/entities/TenantSettings";

interface CustomizationSectionProps {
  settings: TenantSettings;
  t: (key: string) => string;
}

/**
 * CustomizationSection — Audit Log + Admin Preferences + System Settings
 * Draft/Publish controls removed — that flow is for Phase 6 (Customizer Studio).
 * Basic branding saves directly via the main settings form.
 */
export function CustomizationSection({ settings, t }: CustomizationSectionProps) {
  const vm = useCustomizationViewModel();
  const c = (key: string) => t(`tenantSettings.customization.${key}`);

  return (
    <div className="space-y-6">
      {/* ── Launch Customizer Studio ────────────── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-primary" />
            {c("studioTitle")}
          </CardTitle>
          <CardDescription>
            {c("layoutDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="gap-2">
            <Link href="/customizer">
              <Paintbrush className="h-4 w-4" />
              {c("studioTitle")}
              <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* ── Unpublished Draft Indicator ────────────── */}
      {settings.draftBrandingJson && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Paintbrush className="h-5 w-5" />
              {c("draftPending") || "Unpublished Draft"}
            </CardTitle>
            <CardDescription>
              {c("draftPendingDesc") || "You have unsaved changes in the Customizer Studio that haven't been published yet."}
              {" · "}{c("currentVersion") || "Current version"}: <Badge variant="outline">v{settings.settingsVersion}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400">
              <Link href="/customizer">
                <Paintbrush className="h-4 w-4" />
                {c("reviewDraft") || "Review & Publish Draft"}
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Version History (Audit Log) ────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {c("versionHistory")}
          </CardTitle>
          <CardDescription>
            {c("versionHistoryDesc")} · {c("currentVersion")}: <Badge variant="outline">v{settings.settingsVersion}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vm.isAuditLogLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : vm.auditLog && vm.auditLog.items.length > 0 ? (
            <>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-start font-medium">{c("version")}</th>
                      <th className="p-3 text-start font-medium">{c("action")}</th>
                      <th className="p-3 text-start font-medium">{c("changedBy")}</th>
                      <th className="p-3 text-start font-medium">{c("date")}</th>
                      <th className="p-3 text-end font-medium">{c("rollback")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vm.auditLog.items.map((entry) => (
                      <tr key={`${entry.versionNumber}-${entry.changedAt}`} className="border-b hover:bg-muted/30">
                        <td className="p-3">
                          <Badge variant="outline">v{entry.versionNumber}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={entry.changeType === "publish" ? "default" : "secondary"}
                            className={
                              entry.changeType === "rollback" ? "bg-blue-500" :
                              entry.changeType === "draft-discard" ? "bg-orange-500" :
                              entry.changeType.includes("safe-mode") ? "bg-purple-500" : ""
                            }
                          >
                            {entry.changeType}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{entry.changedByAdminName || "—"}</td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(entry.changedAt).toLocaleString()}
                        </td>
                        <td className="p-3 text-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => vm.rollback(entry.versionNumber)}
                            disabled={vm.isRollingBack}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            {c("restore")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {c("page")} {vm.auditPage} · {vm.auditLog.totalCount} {c("totalEntries")}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => vm.setAuditPage((p: number) => Math.max(1, p - 1))}
                    disabled={vm.auditPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => vm.setAuditPage((p: number) => p + 1)}
                    disabled={vm.auditLog.items.length < 10}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground py-4 text-center">{c("noHistory")}</p>
          )}
        </CardContent>
      </Card>

      {/* ── Admin Preferences (User-Friendly Controls) ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {c("adminPrefs")}
          </CardTitle>
          <CardDescription>{c("adminPrefsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <>
              {/* Theme Selector */}
              <div className="grid gap-2">
                <Label>{c("theme")}</Label>
                <Select
                  value={vm.prefsForm.theme}
                  onValueChange={(val) => vm.updatePrefsField("theme", val)}
                >
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">{c("themeDark")}</SelectItem>
                    <SelectItem value="light">{c("themeLight")}</SelectItem>
                    <SelectItem value="system">{c("themeSystem")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sidebar Collapsed Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{c("sidebarCollapsed")}</Label>
                </div>
                <Switch
                  checked={vm.prefsForm.sidebarCollapsed}
                  onCheckedChange={(val) => vm.updatePrefsField("sidebarCollapsed", val)}
                />
              </div>

              {/* Language Selector */}
              <div className="grid gap-2">
                <Label>{c("language")}</Label>
                <Select
                  value={vm.prefsForm.language}
                  onValueChange={(val) => vm.updatePrefsField("language", val)}
                >
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{c("langEn")}</SelectItem>
                    <SelectItem value="ar">{c("langAr")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Info about how prefs work */}
              <div className="text-xs text-muted-foreground border-t pt-3">
                <p>{c("prefsInfo")}</p>
              </div>

              {/* Save Button with Success Animation */}
              <Button
                onClick={vm.saveAdminPrefs}
                disabled={vm.isSavingAdminPrefs || (!vm.isPrefsChanged && !vm.isSaveSuccess)}
                size="sm"
                className={vm.isSaveSuccess ? "bg-green-600 hover:bg-green-600 pointer-events-none transition-colors duration-300" : "transition-colors duration-300"}
              >
                {vm.isSavingAdminPrefs ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{c("savingPreferences")}</>
                ) : vm.isSaveSuccess ? (
                  <><CheckCircle2 className="mr-2 h-4 w-4" />{c("prefsSaved")}</>
                ) : (
                  <><Settings className="mr-2 h-4 w-4" />{c("savePreferences")}</>
                )}
              </Button>
            </>
        </CardContent>
      </Card>

      {/* ── System Settings (Platform Defaults) ──── */}
      {!vm.systemSettingsError && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {c("systemSettings")}
            </CardTitle>
            <CardDescription>{c("systemSettingsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {vm.isSystemSettingsLoading ? (
              <Skeleton className="h-[100px] w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SystemSettingCard
                  label={c("defaultTheme")}
                  value={vm.systemSettings?.defaultThemeJson}
                  emptyText={c("notConfigured")}
                />
                <SystemSettingCard
                  label={c("layoutCatalog")}
                  value={vm.systemSettings?.layoutCatalogJson}
                  emptyText={c("notConfigured")}
                />
                <SystemSettingCard
                  label={c("slotRegistry")}
                  value={vm.systemSettings?.slotRegistryJson}
                  emptyText={c("notConfigured")}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Renders a system setting value or a friendly "not configured" message */
function SystemSettingCard({ label, value, emptyText }: { label: string; value?: string | null; emptyText: string }) {
  const displayValue = (() => {
    if (!value) return null;
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  })();

  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      {displayValue ? (
        <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
          {displayValue}
        </pre>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground border border-dashed border-border rounded p-3">
          <Info className="h-3 w-3 shrink-0" />
          {emptyText}
        </div>
      )}
    </div>
  );
}
