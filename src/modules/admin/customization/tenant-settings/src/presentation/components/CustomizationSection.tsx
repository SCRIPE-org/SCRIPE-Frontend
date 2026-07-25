// FILE-EXCEPTION: file length
"use client";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";

import { useCustomizationViewModel } from "../viewmodels/useCustomizationViewModel";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Switch } from "@core/ui/switch";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { EmptyState } from "@core/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@core/ui/table";
import {
  RotateCcw,
  History,
  Settings,
  User,
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
}

/** Maps an audit-log change type to the badge tone that best reports it. */
function changeTypeVariant(changeType: string): BadgeProps["variant"] {
  if (changeType === "rollback") return "info";
  if (changeType === "draft-discard") return "warning";
  if (changeType.includes("safe-mode")) return "default";
  if (changeType === "publish") return "default";
  return "secondary";
}

/**
 * CustomizationSection — Audit Log + Admin Preferences + System Settings
 * Draft/Publish controls removed — that flow is for Phase 6 (Customizer Studio).
 * Basic branding saves directly via the main settings form.
 */
export function CustomizationSection({ settings }: CustomizationSectionProps) {
  const { t, direction } = useI18n();
  const vm = useCustomizationViewModel();
  const c = (key: string) => t(`tenantSettings.customization.${key}`);
  const isRtl = direction === "rtl";

  return (
    <div className="space-y-6">
      {/* ── Launch Customizer Studio ────────────── */}
      <Card className="border-[color:color-mix(in_srgb,var(--nx-accent)_25%,transparent)] bg-nx-accent-wash">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-nx-accent" aria-hidden="true" />
            {c("studioTitle")}
          </CardTitle>
          <CardDescription>{c("layoutDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="gap-2">
            <Link href="/customizer">
              <Paintbrush className="h-4 w-4" aria-hidden="true" />
              {c("studioTitle")}
              <ExternalLink className="ms-1 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* ── Unpublished Draft Indicator ────────────── */}
      {settings.draftBrandingJson && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-warning">
              <Paintbrush className="h-5 w-5" aria-hidden="true" />
              {c("draftPending")}
            </CardTitle>
            <CardDescription>
              {c("draftPendingDesc")}
              {" · "}
              {c("currentVersion")}: <Badge variant="outline">v{settings.settingsVersion}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 border-warning/30 text-warning hover:bg-warning/10"
            >
              <Link href="/customizer">
                <Paintbrush className="h-4 w-4" aria-hidden="true" />
                {c("reviewDraft")}
                <ExternalLink className="ms-1 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Version History (Audit Log) ────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" aria-hidden="true" />
            {c("versionHistory")}
          </CardTitle>
          <CardDescription>
            {c("versionHistoryDesc")} · {c("currentVersion")}:{" "}
            <Badge variant="outline">v{settings.settingsVersion}</Badge>
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
              <div className="overflow-hidden rounded-nx-md border border-nx-line">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-nx-line-hi bg-nx-hover">
                      <TableHead>{c("version")}</TableHead>
                      <TableHead>{c("action")}</TableHead>
                      <TableHead>{c("changedBy")}</TableHead>
                      <TableHead>{c("date")}</TableHead>
                      <TableHead className="text-end">{c("rollback")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vm.auditLog.items.map((entry) => (
                      <TableRow key={`${entry.versionNumber}-${entry.changedAt}`}>
                        <TableCell>
                          <Badge variant="outline">v{entry.versionNumber}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={changeTypeVariant(entry.changeType)}>
                            {entry.changeType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-nx-ink-2">
                          {entry.changedByAdminName || "—"}
                        </TableCell>
                        <TableCell className="text-nx-ink-2">
                          {formatDateTimeUtc(entry.changedAt)}
                        </TableCell>
                        <TableCell className="text-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => vm.rollback(entry.versionNumber)}
                            disabled={vm.isRollingBack}
                          >
                            <RotateCcw className="me-1 h-3 w-3" aria-hidden="true" />
                            {c("restore")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-nx-ink-3">
                  {c("page")} {vm.auditPage} · {vm.auditLog.totalCount} {c("totalEntries")}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => vm.setAuditPage((p: number) => Math.max(1, p - 1))}
                    disabled={vm.auditPage <= 1}
                    aria-label={t("table.previousPage")}
                  >
                    {isRtl ? (
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => vm.setAuditPage((p: number) => p + 1)}
                    disabled={vm.auditLog.items.length < 10}
                    aria-label={t("table.nextPage")}
                  >
                    {isRtl ? (
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState bare size="sm" icon={History} title={c("noHistory")} />
          )}
        </CardContent>
      </Card>

      {/* ── Admin Preferences (User-Friendly Controls) ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" aria-hidden="true" />
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
            <div className="border-t border-nx-line pt-3 text-xs text-nx-ink-3">
              <p>{c("prefsInfo")}</p>
            </div>

            {/* Save Button with Success Animation */}
            <Button
              onClick={vm.saveAdminPrefs}
              disabled={!vm.isPrefsChanged && !vm.isSaveSuccess}
              loading={vm.isSavingAdminPrefs}
              size="sm"
              className={
                vm.isSaveSuccess
                  ? "pointer-events-none bg-success transition-colors duration-nx-panel ease-nx-enter motion-reduce:transition-none hover:bg-success"
                  : "transition-colors duration-nx-panel ease-nx-enter motion-reduce:transition-none"
              }
            >
              {!vm.isSavingAdminPrefs &&
                (vm.isSaveSuccess ? (
                  <>
                    <CheckCircle2 className="me-2 h-4 w-4" aria-hidden="true" />
                    {c("prefsSaved")}
                  </>
                ) : (
                  <>
                    <Settings className="me-2 h-4 w-4" aria-hidden="true" />
                    {c("savePreferences")}
                  </>
                ))}
              {vm.isSavingAdminPrefs && c("savingPreferences")}
            </Button>
          </>
        </CardContent>
      </Card>

      {/* ── System Settings (Platform Defaults) ──── */}
      {!vm.systemSettingsError && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" aria-hidden="true" />
              {c("systemSettings")}
            </CardTitle>
            <CardDescription>{c("systemSettingsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {vm.isSystemSettingsLoading ? (
              <Skeleton className="h-[100px] w-full" />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
function SystemSettingCard({
  label,
  value,
  emptyText,
}: {
  label: string;
  value?: string | null;
  emptyText: string;
}) {
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
      <p className="mb-1 text-sm font-medium text-nx-ink">{label}</p>
      {displayValue ? (
        <pre className="max-h-32 overflow-auto rounded-nx-sm bg-nx-raised p-2 text-xs text-nx-ink-2">
          {displayValue}
        </pre>
      ) : (
        <div className="flex items-center gap-2 rounded-nx-sm border border-dashed border-nx-line p-3 text-xs text-nx-ink-3">
          <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
          {emptyText}
        </div>
      )}
    </div>
  );
}
