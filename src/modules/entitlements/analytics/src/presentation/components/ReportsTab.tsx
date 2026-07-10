// FILE-EXCEPTION: file length
"use client";
/**
 * ReportsTab — Premium scheduled report preferences + on-demand report generation.
 * Uses domain entity types only (no data-layer imports).
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useToast } from "@core/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { Input } from "@core/ui/input";
import { Calendar, Clock, Download, FileText, Mail, Save, Settings2 } from "lucide-react";
import { formatDateUtc } from "@core/common/utils";
import type {
  ReportPreference,
  UpdateReportPreferenceRequest,
} from "../../domain/entities/AnalyticsEntities";

interface ReportsTabProps {
  preference: ReportPreference | null;
  onSave: (data: UpdateReportPreferenceRequest) => Promise<void>;
  onGenerateReport: () => Promise<void>;
  isLoading?: boolean;
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
  isSaving,
  isGenerating,
}: ReportsTabProps) {
  const { t } = useI18n();
  const { toast } = useToast();

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
        title: t("entitlements.analytics.reports.saveSuccess") || "Preferences Saved",
        description:
          t("entitlements.analytics.reports.saveSuccessDesc") ||
          "Your report preferences have been updated.",
      });
    } catch {
      toast({
        title: t("entitlements.analytics.reports.saveError") || "Save Failed",
        description:
          t("entitlements.analytics.reports.saveErrorDesc") ||
          "Could not save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async () => {
    try {
      await onGenerateReport();
      toast({
        title: t("entitlements.analytics.reports.generateSuccess") || "Report Generated",
        description:
          t("entitlements.analytics.reports.generateSuccessDesc") ||
          "Your PDF report has been downloaded.",
      });
    } catch {
      toast({
        title: t("entitlements.analytics.reports.generateError") || "Report Failed",
        description:
          t("entitlements.analytics.reports.generateErrorDesc") ||
          "Could not generate the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: Scheduled Report Settings */}
      <Card className="overflow-hidden border border-border/30 shadow-sm">
        <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20">
              <Settings2 className="h-4 w-4 text-emerald-600" />
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
            <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
            <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("entitlements.analytics.reports.includedSections")}
            </Label>
            <div className="space-y-3 rounded-lg border border-border/20 bg-muted/20 p-3">
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
          <Button
            onClick={handleSave}
            loading={isSaving}
            className="mt-4 w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700"
          >
            <Save className="h-4 w-4" />
            {t("entitlements.analytics.reports.savePreferences")}
          </Button>
        </CardContent>
      </Card>

      {/* Right: On-Demand Report Generation */}
      <Card className="overflow-hidden border border-border/30 shadow-sm">
        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-600/20">
              <FileText className="h-4 w-4 text-blue-600" />
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
              <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl" />
              <div className="relative rounded-full border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-6">
                <Download className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              {t("entitlements.analytics.reports.generateInfo")}
            </p>
            <Button
              onClick={handleGenerateReport}
              loading={isGenerating}
              variant="outline"
              className="gap-2 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/5"
              size="lg"
            >
              <Calendar className="h-4 w-4" />
              {t("entitlements.analytics.reports.generateButton")}
            </Button>
          </div>

          {/* Last sent info */}
          {preference?.lastSentAt && (
            <div className="border-t border-border/20 pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                {t("entitlements.analytics.reports.lastSent")}:{" "}
                <span className="font-semibold">
                  {formatDateUtc(preference.lastSentAt)}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
