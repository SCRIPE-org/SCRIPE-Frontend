"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Building2,
  CalendarDays,
  Users,
  Globe2,
  Sliders,
  ShieldCheck,
  ChevronRight,
  Info,
  Clock,
  Layers,
  MapPin,
  CircleDollarSign,
  Check,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { PageHeader } from "@core/ui/page-header";
import { Badge } from "@core/ui/badge";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { useAppStore } from "@core/store/useAppStore";
import { useVenueSettingsViewModel } from "../viewmodels/useVenueSettingsViewModel";

export function VenueSettingsView() {
  const { t, language, setLanguage, direction } = useI18n();
  const user = useAppStore((s) => s.user);

  // Authoritative permissions
  const canViewTeam = usePermission(VENUE_PERMISSIONS.TEAM_VIEW);
  const canViewSettings = usePermission(VENUE_PERMISSIONS.FACILITY_VIEW);

  // Active Tab state
  const [activeTab, setActiveTab] = useState("branch");

  const {
    selectedFacility,
    setSelectedFacility,
    managementMode,
    handleModeChange,
  } = useVenueSettingsViewModel({ tenantId: user?.tenantId ?? undefined });

  const branchName = selectedFacility?.name || t("venueSettings.branch.noSelection");
  const branchTimezone = t("venueSettings.branch.timezoneUnavailable");

  return (
    <div
      className="mx-auto max-w-[1200px] space-y-6 text-nx-ink"
      dir={direction}
      data-testid="venue-settings-view"
    >
      {/* Header */}
      <PageHeader
        icon={Settings}
        title={t("venueSettings.title")}
        description={t("venueSettings.description")}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="border border-nx-line bg-nx-surface p-1">
          <TabsTrigger value="branch" className="gap-1.5 text-xs font-semibold">
            <Building2 className="size-3.5" aria-hidden="true" />
            <span>{t("venueSettings.tabs.branch")}</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-1.5 text-xs font-semibold">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            <span>{t("venueSettings.tabs.booking")}</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs font-semibold">
            <Users className="size-3.5" aria-hidden="true" />
            <span>{t("venueSettings.tabs.team")}</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 text-xs font-semibold">
            <Globe2 className="size-3.5" aria-hidden="true" />
            <span>{t("venueSettings.tabs.preferences")}</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-1.5 text-xs font-semibold">
            <Sliders className="size-3.5" aria-hidden="true" />
            <span>{t("venueSettings.tabs.advanced")}</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Branch & Venue */}
        <TabsContent value="branch" className="space-y-6">
          <Card className="border-nx-line bg-nx-surface">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("venueSettings.branch.title")}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {t("venueSettings.branch.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-nx-surfaceSubtle space-y-1 rounded-nx-lg border border-nx-line p-3.5">
                  <div className="text-[11px] font-medium text-nx-ink-3">
                    {t("venueSettings.branch.name")}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-nx-ink">
                    <Building2 className="size-4 text-nx-accent" />
                    <span>{branchName}</span>
                  </div>
                </div>

                <div className="bg-nx-surfaceSubtle space-y-1 rounded-nx-lg border border-nx-line p-3.5">
                  <div className="text-[11px] font-medium text-nx-ink-3">
                    {t("venueSettings.branch.timezone")}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-nx-ink">
                    <Clock className="size-4 text-nx-accent" />
                    <span>{branchTimezone}</span>
                  </div>
                </div>
              </div>

              <Alert className="bg-nx-accent/5 border-nx-accent/20 py-2.5 text-nx-ink">
                <Info className="size-4 text-nx-accent" />
                <AlertDescription className="text-xs">
                  {t("venueSettings.branch.multiBranchNote")}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Booking Defaults */}
        <TabsContent value="booking" className="space-y-6">
          <Card className="border-nx-line bg-nx-surface">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("venueSettings.booking.title")}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {t("venueSettings.booking.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 rounded-nx-lg border border-nx-line bg-nx-surface p-3.5">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-nx-ink">
                      {t("venueSettings.booking.courtRulesTitle")}
                    </div>
                    <p className="text-xs text-nx-ink-2">
                      {t("venueSettings.booking.courtRulesDescription")}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-nx-line text-xs"
                  >
                    <Link href="/venue/resources">
                      <span>{t("venueSettings.booking.courtsLink")}</span>
                      <ChevronRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>

                <div className="flex items-start justify-between gap-4 rounded-nx-lg border border-nx-line bg-nx-surface p-3.5">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-nx-ink">
                      {t("venueSettings.booking.windowTitle")}
                    </div>
                    <p className="text-xs text-nx-ink-2">
                      {t("venueSettings.booking.windowDescription")}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-nx-surfaceSubtle border-nx-line text-xs font-semibold text-nx-ink"
                  >
                    {t("venueSettings.booking.windowDays", { count: 14 })}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Team & Access */}
        <TabsContent value="team" className="space-y-6">
          <Card className="border-nx-line bg-nx-surface">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("venueSettings.team.title")}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {t("venueSettings.team.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleModeChange("solo")}
                  className={`h-auto w-full flex-col items-stretch justify-start rounded-nx-xl border p-4 text-start transition-all ${
                    managementMode === "solo"
                      ? "bg-nx-accent/5 shadow-xs border-nx-accent ring-1 ring-nx-accent"
                      : "hover:border-nx-line/80 border-nx-line bg-nx-surface"
                  }`}
                >
                  <div className="mb-2 flex w-full items-center justify-between">
                    <span className="text-xs font-bold text-nx-ink">
                      {t("venueSettings.team.soloTitle")}
                    </span>
                    {managementMode === "solo" && <Check className="size-4 text-nx-accent" />}
                  </div>
                  <p className="whitespace-normal text-start text-xs font-normal text-nx-ink-2">{t("venueSettings.team.soloDescription")}</p>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleModeChange("team")}
                  className={`h-auto w-full flex-col items-stretch justify-start rounded-nx-xl border p-4 text-start transition-all ${
                    managementMode === "team"
                      ? "bg-nx-accent/5 shadow-xs border-nx-accent ring-1 ring-nx-accent"
                      : "hover:border-nx-line/80 border-nx-line bg-nx-surface"
                  }`}
                >
                  <div className="mb-2 flex w-full items-center justify-between">
                    <span className="text-xs font-bold text-nx-ink">
                      {t("venueSettings.team.teamTitle")}
                    </span>
                    {managementMode === "team" && <Check className="size-4 text-nx-accent" />}
                  </div>
                  <p className="whitespace-normal text-start text-xs font-normal text-nx-ink-2">{t("venueSettings.team.teamDescription")}</p>
                </Button>
              </div>

              {managementMode === "team" && canViewTeam && (
                <div className="bg-nx-surfaceSubtle flex items-center justify-between rounded-nx-lg border border-nx-line p-3.5 pt-2">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-nx-ink">
                      {t("venueSettings.team.manageTitle")}
                    </div>
                    <div className="text-[11px] text-nx-ink-2">
                      {t("venueSettings.team.manageDescription")}
                    </div>
                  </div>
                  <Button asChild size="sm" className="gap-1.5 text-xs font-bold">
                    <Link href="/admins">
                      <ShieldCheck className="size-3.5" />
                      <span>{t("venueSettings.team.openTeam")}</span>
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-nx-line bg-nx-surface">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("venueSettings.preferences.title")}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {t("venueSettings.preferences.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-nx-lg border border-nx-line bg-nx-surface p-3.5">
                <div>
                  <div className="text-xs font-bold text-nx-ink">
                    {t("venueSettings.preferences.languageTitle")}
                  </div>
                  <div className="text-xs text-nx-ink-2">
                    {t("venueSettings.preferences.languageDescription")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={language === "en" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("en")}
                    className="text-xs font-bold"
                  >
                    English
                  </Button>
                  <Button
                    type="button"
                    variant={language === "ar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("ar")}
                    className="text-xs font-bold"
                  >
                    العربية
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Advanced Settings (Progressive Disclosure) */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="border-nx-line bg-nx-surface">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-nx-ink">
                    {t("venueSettings.advanced.title")}
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs text-nx-ink-2">
                    {t("venueSettings.advanced.description")}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-nx-surfaceSubtle border-nx-line text-xs text-nx-ink-2"
                >
                  {t("venueSettings.advanced.badge")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Branch & Facility Registry */}
                <Link
                  href="/venue/facilities"
                  className="hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle group flex items-start justify-between rounded-nx-lg border border-nx-line p-3.5 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-nx-ink group-hover:text-nx-accent">
                      <Building2 className="size-4 text-nx-accent" />
                      <span>{t("venueSettings.advanced.registries.facilitiesTitle")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {t("venueSettings.advanced.registries.facilitiesDesc")}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180" />
                </Link>

                {/* Operating Hours Matrix */}
                <Link
                  href="/venue/availability"
                  className="hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle group flex items-start justify-between rounded-nx-lg border border-nx-line p-3.5 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-nx-ink group-hover:text-nx-accent">
                      <Clock className="size-4 text-nx-accent" />
                      <span>{t("venueSettings.advanced.registries.availabilityTitle")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {t("venueSettings.advanced.registries.availabilityDesc")}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180" />
                </Link>

                {/* Sites & Campuses */}
                <Link
                  href="/venue/sites"
                  className="hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle group flex items-start justify-between rounded-nx-lg border border-nx-line p-3.5 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-nx-ink group-hover:text-nx-accent">
                      <MapPin className="size-4 text-nx-accent" />
                      <span>{t("venueSettings.advanced.registries.sitesTitle")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {t("venueSettings.advanced.registries.sitesDesc")}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180" />
                </Link>

                {/* Pricing Catalog */}
                <Link
                  href="/venue/pricing"
                  className="hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle group flex items-start justify-between rounded-nx-lg border border-nx-line p-3.5 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-nx-ink group-hover:text-nx-accent">
                      <CircleDollarSign className="size-4 text-nx-accent" />
                      <span>{t("venueSettings.advanced.registries.pricingTitle")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {t("venueSettings.advanced.registries.pricingDesc")}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180" />
                </Link>

                {/* Resource Builder */}
                <Link
                  href="/venue/resource-builder"
                  className="hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle group flex items-start justify-between rounded-nx-lg border border-nx-line p-3.5 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-nx-ink group-hover:text-nx-accent">
                      <Sliders className="size-4 text-nx-accent" />
                      <span>{t("venueSettings.advanced.registries.builderTitle")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {t("venueSettings.advanced.registries.builderDesc")}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180" />
                </Link>

                {/* Resource Profiles */}
                <Link
                  href="/venue/resource-profiles"
                  className="hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle group flex items-start justify-between rounded-nx-lg border border-nx-line p-3.5 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-nx-ink group-hover:text-nx-accent">
                      <Layers className="size-4 text-nx-accent" />
                      <span>{t("venueSettings.advanced.registries.profilesTitle")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {t("venueSettings.advanced.registries.profilesDesc")}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
