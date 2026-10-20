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
import { getVenueContainer } from "@modules/venue/di";
import type { Facility } from "@modules/venue/facility/src/domain/entities/Facility";
import { getSavedFacilityId } from "@modules/venue/shared/src/presentation/utils/venueFacilityPersistence";

export function VenueSettingsView() {
  const { t, language, setLanguage, direction } = useI18n();
  const user = useAppStore((s) => s.user);

  // Authoritative permissions
  const canViewTeam = usePermission(VENUE_PERMISSIONS.TEAM_VIEW);
  const canViewSettings = usePermission(VENUE_PERMISSIONS.FACILITY_VIEW);

  // Active Tab state
  const [activeTab, setActiveTab] = useState("branch");

  // Facility / Branch state
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  useEffect(() => {
    let mounted = true;
    try {
      const container = getVenueContainer();
      if (container.facilityRepository?.getAll) {
        container.facilityRepository
          .getAll({ page: 1, pageSize: 20 })
          .then((res) => {
            if (mounted && res?.items?.length) {
              const validId = getSavedFacilityId(res.items, user?.tenantId);
              const match = res.items.find((f) => f.id === validId) ?? res.items[0];
              setSelectedFacility(match);
            }
          })
          .catch(() => {});
      }
    } catch {
      // Graceful fallback
    }
    return () => {
      mounted = false;
    };
  }, [user?.tenantId]);

  // Management Mode state (Solo vs Team)
  const [managementMode, setManagementMode] = useState<"solo" | "team">(() => {
    if (typeof window !== "undefined") {
      const mode = localStorage.getItem("scripe_venue_management_mode");
      if (mode === "team" || mode === "solo") return mode;
    }
    return "solo";
  });

  const handleModeChange = (mode: "solo" | "team") => {
    setManagementMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("scripe_venue_management_mode", mode);
      window.dispatchEvent(new Event("venue-management-mode-changed"));
    }
  };

  const branchName = selectedFacility?.name || t("venueSettings.branch.noSelection");
  const branchTimezone = t("venueSettings.branch.timezoneUnavailable");

  return (
    <div
      className="space-y-6 max-w-[1200px] mx-auto text-nx-ink"
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
        <TabsList className="bg-nx-surface border border-nx-line p-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-nx-lg border border-nx-line p-3.5 bg-nx-surfaceSubtle space-y-1">
                  <div className="text-[11px] font-medium text-nx-ink-3">
                    {t("venueSettings.branch.name")}
                  </div>
                  <div className="text-sm font-bold text-nx-ink flex items-center gap-2">
                    <Building2 className="size-4 text-nx-accent" />
                    <span>{branchName}</span>
                  </div>
                </div>

                <div className="rounded-nx-lg border border-nx-line p-3.5 bg-nx-surfaceSubtle space-y-1">
                  <div className="text-[11px] font-medium text-nx-ink-3">
                    {t("venueSettings.branch.timezone")}
                  </div>
                  <div className="text-sm font-bold text-nx-ink flex items-center gap-2">
                    <Clock className="size-4 text-nx-accent" />
                    <span>{branchTimezone}</span>
                  </div>
                </div>
              </div>

              <Alert className="py-2.5 bg-nx-accent/5 border-nx-accent/20 text-nx-ink">
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
                <div className="flex items-start justify-between gap-4 p-3.5 rounded-nx-lg border border-nx-line bg-nx-surface">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-nx-ink">
                      {t("venueSettings.booking.courtRulesTitle")}
                    </div>
                    <p className="text-xs text-nx-ink-2">
                      {t("venueSettings.booking.courtRulesDescription")}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="text-xs shrink-0 border-nx-line">
                    <Link href="/venue/resources">
                      <span>{t("venueSettings.booking.courtsLink")}</span>
                      <ChevronRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>

                <div className="flex items-start justify-between gap-4 p-3.5 rounded-nx-lg border border-nx-line bg-nx-surface">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-nx-ink">
                      {t("venueSettings.booking.windowTitle")}
                    </div>
                    <p className="text-xs text-nx-ink-2">
                      {t("venueSettings.booking.windowDescription")}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold border-nx-line bg-nx-surfaceSubtle text-nx-ink">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleModeChange("solo")}
                  className={`text-start p-4 rounded-nx-xl border transition-all ${
                    managementMode === "solo"
                      ? "border-nx-accent bg-nx-accent/5 ring-1 ring-nx-accent shadow-xs"
                      : "border-nx-line hover:border-nx-line/80 bg-nx-surface"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-nx-ink">
                      {t("venueSettings.team.soloTitle")}
                    </span>
                    {managementMode === "solo" && <Check className="size-4 text-nx-accent" />}
                  </div>
                  <p className="text-xs text-nx-ink-2">
                    {t("venueSettings.team.soloDescription")}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("team")}
                  className={`text-start p-4 rounded-nx-xl border transition-all ${
                    managementMode === "team"
                      ? "border-nx-accent bg-nx-accent/5 ring-1 ring-nx-accent shadow-xs"
                      : "border-nx-line hover:border-nx-line/80 bg-nx-surface"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-nx-ink">
                      {t("venueSettings.team.teamTitle")}
                    </span>
                    {managementMode === "team" && <Check className="size-4 text-nx-accent" />}
                  </div>
                  <p className="text-xs text-nx-ink-2">
                    {t("venueSettings.team.teamDescription")}
                  </p>
                </button>
              </div>

              {managementMode === "team" && canViewTeam && (
                <div className="pt-2 flex items-center justify-between p-3.5 rounded-nx-lg border border-nx-line bg-nx-surfaceSubtle">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-nx-ink">
                      {t("venueSettings.team.manageTitle")}
                    </div>
                    <div className="text-[11px] text-nx-ink-2">
                      {t("venueSettings.team.manageDescription")}
                    </div>
                  </div>
                  <Button asChild size="sm" className="text-xs font-bold gap-1.5">
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
              <div className="flex items-center justify-between p-3.5 rounded-nx-lg border border-nx-line bg-nx-surface">
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
                  <CardDescription className="text-xs mt-1 text-nx-ink-2">
                    {t("venueSettings.advanced.description")}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-nx-surfaceSubtle text-nx-ink-2 border-nx-line">
                  {t("venueSettings.advanced.badge")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Branch & Facility Registry */}
                <Link
                  href="/venue/facilities"
                  className="flex items-start justify-between p-3.5 rounded-nx-lg border border-nx-line hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle transition-colors group"
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
                  <ChevronRight className="size-4 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180 shrink-0 mt-1" />
                </Link>

                {/* Operating Hours Matrix */}
                <Link
                  href="/venue/availability"
                  className="flex items-start justify-between p-3.5 rounded-nx-lg border border-nx-line hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle transition-colors group"
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
                  <ChevronRight className="size-4 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180 shrink-0 mt-1" />
                </Link>

                {/* Sites & Campuses */}
                <Link
                  href="/venue/sites"
                  className="flex items-start justify-between p-3.5 rounded-nx-lg border border-nx-line hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle transition-colors group"
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
                  <ChevronRight className="size-4 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180 shrink-0 mt-1" />
                </Link>

                {/* Pricing Catalog */}
                <Link
                  href="/venue/pricing"
                  className="flex items-start justify-between p-3.5 rounded-nx-lg border border-nx-line hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle transition-colors group"
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
                  <ChevronRight className="size-4 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180 shrink-0 mt-1" />
                </Link>

                {/* Resource Builder */}
                <Link
                  href="/venue/resource-builder"
                  className="flex items-start justify-between p-3.5 rounded-nx-lg border border-nx-line hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle transition-colors group"
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
                  <ChevronRight className="size-4 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180 shrink-0 mt-1" />
                </Link>

                {/* Resource Profiles */}
                <Link
                  href="/venue/resource-profiles"
                  className="flex items-start justify-between p-3.5 rounded-nx-lg border border-nx-line hover:border-nx-accent/50 hover:bg-nx-surfaceSubtle transition-colors group"
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
                  <ChevronRight className="size-4 text-nx-ink-3 group-hover:text-nx-accent rtl:rotate-180 shrink-0 mt-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
