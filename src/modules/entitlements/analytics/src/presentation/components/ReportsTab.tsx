"use client";
/**
 * ReportsTab — Manage scheduled report preferences and generate on-demand reports.
 * Uses domain entity types only (no data-layer imports).
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { Input } from "@core/ui/input";
import {
  Calendar, Clock, Download, FileText, Mail, Save, Settings2,
} from "lucide-react";
import type { ReportPreference, UpdateReportPreferenceRequest } from "../../domain/entities/AnalyticsEntities";

interface ReportsTabProps {
  preference: ReportPreference | null;
  onSave: (data: UpdateReportPreferenceRequest) => Promise<void>;
  onGenerateReport: () => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
  isGenerating?: boolean;
}

export function ReportsTab({
  preference,
  onSave,
  onGenerateReport,
  isLoading,
  isSaving,
  isGenerating,
}: ReportsTabProps) {
  const { t } = useI18n();

  const [cadence, setCadence] = useState(preference?.cadence ?? "None");
  const [email, setEmail] = useState(preference?.email ?? "");
  const [includeTenantBreakdown, setIncludeTenantBreakdown] = useState(preference?.includeTenantBreakdown ?? true);
  const [includeCohortAnalysis, setIncludeCohortAnalysis] = useState(preference?.includeCohortAnalysis ?? true);
  const [includeHealthScores, setIncludeHealthScores] = useState(preference?.includeHealthScores ?? true);
  const [includeForecasting, setIncludeForecasting] = useState(preference?.includeForecasting ?? true);
  const [currency, setCurrency] = useState(preference?.currency ?? "USD");

  const handleSave = async () => {
    await onSave({
      cadence,
      email,
      includeTenantBreakdown,
      includeCohortAnalysis,
      includeHealthScores,
      includeForecasting,
      currency,
    });
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
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="h-5 w-5 text-emerald-500" />
            {t("entitlements.analytics.reports.scheduleTitle")}
          </CardTitle>
          <CardDescription>
            {t("entitlements.analytics.reports.scheduleDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Cadence */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {t("entitlements.analytics.reports.cadence")}
            </Label>
            <Select value={cadence} onValueChange={setCadence}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">{t("entitlements.analytics.reports.cadenceNone")}</SelectItem>
                <SelectItem value="Daily">{t("entitlements.analytics.reports.cadenceDaily")}</SelectItem>
                <SelectItem value="Weekly">{t("entitlements.analytics.reports.cadenceWeekly")}</SelectItem>
                <SelectItem value="Monthly">{t("entitlements.analytics.reports.cadenceMonthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
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
            <Label>{t("entitlements.analytics.reports.currency")}</Label>
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

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t("entitlements.analytics.reports.includedSections")}
            </Label>

            <div className="flex items-center justify-between">
              <Label htmlFor="tenant-breakdown" className="text-sm">
                {t("entitlements.analytics.reports.tenantBreakdown")}
              </Label>
              <Switch id="tenant-breakdown" checked={includeTenantBreakdown} onCheckedChange={setIncludeTenantBreakdown} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="cohort-analysis" className="text-sm">
                {t("entitlements.analytics.reports.cohortAnalysis")}
              </Label>
              <Switch id="cohort-analysis" checked={includeCohortAnalysis} onCheckedChange={setIncludeCohortAnalysis} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="health-scores" className="text-sm">
                {t("entitlements.analytics.reports.healthScores")}
              </Label>
              <Switch id="health-scores" checked={includeHealthScores} onCheckedChange={setIncludeHealthScores} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="forecasting" className="text-sm">
                {t("entitlements.analytics.reports.forecasting")}
              </Label>
              <Switch id="forecasting" checked={includeForecasting} onCheckedChange={setIncludeForecasting} />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            loading={isSaving}
            className="w-full gap-2 mt-4"
          >
            <Save className="h-4 w-4" />
            {t("entitlements.analytics.reports.savePreferences")}
          </Button>
        </CardContent>
      </Card>

      {/* Right: On-Demand Report Generation */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-500" />
            {t("entitlements.analytics.reports.generateTitle")}
          </CardTitle>
          <CardDescription>
            {t("entitlements.analytics.reports.generateDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-full bg-blue-500/10 p-6">
              <Download className="h-12 w-12 text-blue-500" />
            </div>
            <p className="text-center text-sm text-muted-foreground max-w-xs">
              {t("entitlements.analytics.reports.generateInfo")}
            </p>
            <Button
              onClick={onGenerateReport}
              loading={isGenerating}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              <Calendar className="h-4 w-4" />
              {t("entitlements.analytics.reports.generateButton")}
            </Button>
          </div>

          {/* Last sent info */}
          {preference?.lastSentAt && (
            <div className="border-t pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                {t("entitlements.analytics.reports.lastSent")}:{" "}
                <span className="font-medium">
                  {new Date(preference.lastSentAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
