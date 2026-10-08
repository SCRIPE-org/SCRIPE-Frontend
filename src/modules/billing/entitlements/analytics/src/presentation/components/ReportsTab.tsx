// FILE-EXCEPTION: file length
"use client";
/**
 * ReportsTab — Premium scheduled report preferences + on-demand report generation.
 * Uses domain entity types only (no data-layer imports).
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { Input } from "@core/ui/input";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import { Calendar, Clock, Download, FileText, Mail, Save, Settings2 } from "lucide-react";
import { cn, formatDateUtc } from "@core/common/utils";
import type {
  ReportPreference,
  UpdateReportPreferenceRequest,
} from "../../domain/entities/AnalyticsEntities";

interface ReportsTabProps {
  preference: ReportPreference | null;
  onSave: (data: UpdateReportPreferenceRequest) => Promise<void>;
  onGenerateReport: () => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  isSaving?: boolean;
  isGenerating?: boolean;
}

/**
 * Presentation UI component rendering the reports tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ReportsTab({
  preference,
  onSave,
  onGenerateReport,
  isLoading,
  error,
  onRetry,
  isSaving,
  isGenerating,
}: ReportsTabProps) {
  const { t } = useI18n();
  const { toast } = useEnhancedToast();

  const [cadence, setCadence] = useState(preference?.cadence ?? "None");
  const [email, setEmail] = useState(preference?.email ?? "");
  const [includeTenantBreakdown, setIncludeTenantBreakdown] = useState(
    preference?.includeTenantBreakdown ?? true
  );
  const [includeCohortAnalysis, setIncludeCohortAnalysis] = useState(
    preference?.includeCohortAnalysis ?? true
  );
  const [includeHealthScores, setIncludeHealthScores] = useState(
    preference?.includeHealthScores ?? true
  );
  const [includeForecasting, setIncludeForecasting] = useState(
    preference?.includeForecasting ?? true
  );
  const [currency, setCurrency] = useState(preference?.currency ?? "USD");

  // Sync state when preference loads/changes
  const [prevPref, setPrevPref] = useState(preference);
  if (preference !== prevPref) {
    setPrevPref(preference);
    if (preference) {
      setCadence(preference.cadence);
      setEmail(preference.email);
      setIncludeTenantBreakdown(preference.includeTenantBreakdown);
      setIncludeCohortAnalysis(preference.includeCohortAnalysis);
      setIncludeHealthScores(preference.includeHealthScores);
      setIncludeForecasting(preference.includeForecasting);
      setCurrency(preference.currency);
    }
  }

  const handleSave = async () => {
    try {
      await onSave({
        cadence,
        email,
        includeTenantBreakdown,
        includeCohortAnalysis,
        includeHealthScores,
        includeForecasting,
        currency,
      });
      toast({
        title: t("entitlements.analytics.reports.saveSuccess"),
        description: t("entitlements.analytics.reports.saveSuccessDesc"),
      });
    } catch {
      toast({
        title: t("entitlements.analytics.reports.saveError"),
        description: t("entitlements.analytics.reports.saveErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async () => {
    try {
      await onGenerateReport();
      toast({
        title: t("entitlements.analytics.reports.generateSuccess"),
        description: t("entitlements.analytics.reports.generateSuccessDesc"),
      });
    } catch {
      toast({
        title: t("entitlements.analytics.reports.generateError"),
        description: t("entitlements.analytics.reports.generateErrorDesc"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={t("common.error")} onRetry={onRetry} />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: Scheduled Report Settings */}
      <Card className="overflow-hidden border border-[color:color-mix(in_srgb,var(--nx-line)_30%,transparent)]">
        <div className="h-0.5 bg-gradient-to-r from-success to-success/70" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-gradient-to-br from-success/20 to-success/20">
              <Settings2 className="h-4 w-4 text-success" />
            </div>
            {t("entitlements.analytics.reports.scheduleTitle")}
          </CardTitle>
          <CardDescription>
            {t("entitlements.analytics.reports.scheduleDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Cadence */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
              <Clock className="h-3.5 w-3.5" />
              {t("entitlements.analytics.reports.cadence")}
            </Label>
            <Select value={cadence} onValueChange={setCadence}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">
                  {t("entitlements.analytics.reports.cadenceNone")}
                </SelectItem>
                <SelectItem value="Daily">
                  {t("entitlements.analytics.reports.cadenceDaily")}
                </SelectItem>
                <SelectItem value="Weekly">
                  {t("entitlements.analytics.reports.cadenceWeekly")}
                </SelectItem>
                <SelectItem value="Monthly">
                  {t("entitlements.analytics.reports.cadenceMonthly")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
              <Mail className="h-3.5 w-3.5" />
              {t("entitlements.analytics.reports.email")}
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("entitlements.analytics.reports.currency")}
            </Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="TRY">TRY (₺)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Section Toggles */}
          <div className="space-y-3 pt-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("entitlements.analytics.reports.includedSections")}
            </Label>
            <div className="space-y-3 rounded-nx-md border border-[color:color-mix(in_srgb,var(--nx-line)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--nx-raised)_20%,transparent)] p-3">
              {[
                {
                  id: "tenant-breakdown",
                  label: t("entitlements.analytics.reports.tenantBreakdown"),
                  checked: includeTenantBreakdown,
                  onChange: setIncludeTenantBreakdown,
                },
                {
                  id: "cohort-analysis",
                  label: t("entitlements.analytics.reports.cohortAnalysis"),
                  checked: includeCohortAnalysis,
                  onChange: setIncludeCohortAnalysis,
                },
                {
                  id: "health-scores",
                  label: t("entitlements.analytics.reports.healthScores"),
                  checked: includeHealthScores,
                  onChange: setIncludeHealthScores,
                },
                {
                  id: "forecasting",
                  label: t("entitlements.analytics.reports.forecasting"),
                  checked: includeForecasting,
                  onChange: setIncludeForecasting,
                },
              ].map(({ id, label, checked, onChange }) => (
                <div key={id} className="flex items-center justify-between">
                  <Label htmlFor={id} className="cursor-pointer text-sm">
                    {label}
                  </Label>
                  <Switch id={id} checked={checked} onCheckedChange={onChange} />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} loading={isSaving} className="mt-4 w-full gap-2">
            <Save className="h-4 w-4" />
            {t("entitlements.analytics.reports.savePreferences")}
          </Button>
        </CardContent>
      </Card>

      {/* Right: On-Demand Report Generation */}
      <Card className="overflow-hidden border border-[color:color-mix(in_srgb,var(--nx-line)_30%,transparent)]">
        <div className="h-0.5 bg-gradient-to-r from-info to-info/70" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-gradient-to-br from-info/20 to-info/20">
              <FileText className="h-4 w-4 text-info" />
            </div>
            {t("entitlements.analytics.reports.generateTitle")}
          </CardTitle>
          <CardDescription>
            {t("entitlements.analytics.reports.generateDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-5 py-8">
            <div className="relative">
              <div
                className={cn(
                  "absolute inset-0 rounded-full bg-info/20 blur-xl",
                  isGenerating && "bg-info/30"
                )}
              />
              <div className="relative rounded-full border border-info/20 bg-gradient-to-br from-info/10 to-info/10 p-6">
                <Download className="h-12 w-12 text-info" />
              </div>
            </div>
            <p className="max-w-xs text-center text-sm text-nx-ink-2">
              {t("entitlements.analytics.reports.generateInfo")}
            </p>
            <Button
              onClick={handleGenerateReport}
              loading={isGenerating}
              variant="outline"
              className="gap-2 border-info/30 hover:border-info/50 hover:bg-info/5"
              size="lg"
            >
              <Calendar className="h-4 w-4" />
              {t("entitlements.analytics.reports.generateButton")}
            </Button>
          </div>

          {/* Last sent info */}
          {preference?.lastSentAt && (
            <div className="border-t border-[color:color-mix(in_srgb,var(--nx-line)_20%,transparent)] pt-4 text-center">
              <p className="text-xs text-nx-ink-3">
                {t("entitlements.analytics.reports.lastSent")}:{" "}
                <span className="font-semibold">{formatDateUtc(preference.lastSentAt)}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
