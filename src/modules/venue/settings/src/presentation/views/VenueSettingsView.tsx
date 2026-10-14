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
  const isRtl = language === "ar";
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

  const branchName = selectedFacility?.name || "Nasr City Club";
  const branchTimezone = "Africa/Cairo";

  // Helper with fallback for test mocks returning raw keys or options
  const tr = (key: string, enFallback: string, arFallback: string, params?: Record<string, string | number>) => {
    const val = t(key, { defaultValue: isRtl ? arFallback : enFallback, ...params });
    if (val && val !== key) return val;
    return isRtl ? arFallback : enFallback;
  };

  return (
    <div
      className="space-y-6 max-w-[1200px] mx-auto text-nx-ink"
      dir={direction}
      data-testid="venue-settings-view"
    >
      {/* Header */}
      <PageHeader
        icon={Settings}
        title={tr("venueSettings.title", "Venue Settings", "إعدادات المنشأة")}
        description={tr(
          "venueSettings.description",
          "Branch profiles, booking defaults, team collaboration, and advanced configuration.",
          "بيانات الفرع، الإعدادات الافتراضية للحجز، فريق العمل، والتفضيلات المتقدمة."
        )}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-nx-surface border border-nx-line p-1">
          <TabsTrigger value="branch" className="gap-1.5 text-xs font-semibold">
            <Building2 className="size-3.5" aria-hidden="true" />
            <span>{tr("venueSettings.tabs.branch", "Branch & Venue", "الفرع والمنشأة")}</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-1.5 text-xs font-semibold">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            <span>{tr("venueSettings.tabs.booking", "Booking Defaults", "قواعد الحجز")}</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs font-semibold">
            <Users className="size-3.5" aria-hidden="true" />
            <span>{tr("venueSettings.tabs.team", "Team & Access", "فريق العمل")}</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 text-xs font-semibold">
            <Globe2 className="size-3.5" aria-hidden="true" />
            <span>{tr("venueSettings.tabs.preferences", "Preferences", "التفضيلات")}</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-1.5 text-xs font-semibold">
            <Sliders className="size-3.5" aria-hidden="true" />
            <span>{tr("venueSettings.tabs.advanced", "Advanced", "الإعدادات المتقدمة")}</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Branch & Venue */}
        <TabsContent value="branch" className="space-y-6">
          <Card className="border-nx-line bg-nx-surface">
            <CardHeader>
              <CardTitle className="text-base font-bold text-nx-ink">
                {tr("venueSettings.branch.title", "Operating Branch Details", "بيانات الفرع الحالي")}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {tr(
                  "venueSettings.branch.description",
                  "Authoritative branch location, active timezone, and operating profile.",
                  "معلومات الفرع الرياضي وموقعه ومنطقته الزمنية المعتمدة."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-nx-lg border border-nx-line p-3.5 bg-nx-surfaceSubtle space-y-1">
                  <div className="text-[11px] font-medium text-nx-ink-3">
                    {tr("venueSettings.branch.name", "Branch Name", "اسم الفرع")}
                  </div>
                  <div className="text-sm font-bold text-nx-ink flex items-center gap-2">
                    <Building2 className="size-4 text-nx-accent" />
                    <span>{branchName}</span>
                  </div>
                </div>

                <div className="rounded-nx-lg border border-nx-line p-3.5 bg-nx-surfaceSubtle space-y-1">
                  <div className="text-[11px] font-medium text-nx-ink-3">
                    {tr("venueSettings.branch.timezone", "Operating Timezone", "المنطقة الزمنية المعتمدة")}
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
                  {tr(
                    "venueSettings.branch.multiBranchNote",
                    "To configure multiple branches or update physical campus records, open Advanced Settings → Branch Registry.",
                    "لإضافة فروع أخرى أو تعديل السجلات المؤسسية متعددة المواقع، انتقل إلى الإعدادات المتقدمة ← سجل الفروع والمرافق."
                  )}
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
                {tr("venueSettings.booking.title", "Global Booking Preferences", "الإعدادات الافتراضية للحجز")}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {tr(
                  "venueSettings.booking.description",
                  "Venue-wide scheduling defaults and booking policies.",
                  "القواعد التشغيلية العامة للحجوزات في المنشأة."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 p-3.5 rounded-nx-lg border border-nx-line bg-nx-surface">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-nx-ink">
                      {tr(
                        "venueSettings.booking.courtRulesTitle",
                        "Court-Specific Rules Architecture",
                        "فترات الحجز المحددة للملعب"
                      )}
                    </div>
                    <p className="text-xs text-nx-ink-2">
                      {tr(
                        "venueSettings.booking.courtRulesDescription",
                        "Slot duration (60 min, 90 min, etc.), pricing, and working hours are configured canonically inside each Court's Detail view.",
                        "يتم تحديد مدة فترة الحجز (60 دقيقة، 90 دقيقة، إلخ) والأسعار وساعات العمل لكل ملعب بشكل مستقل ومباشر."
                      )}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="text-xs shrink-0 border-nx-line">
                    <Link href="/venue/resources">
                      <span>{tr("venueSettings.booking.courtsLink", "Courts & Spaces", "الملاعب والمساحات")}</span>
                      <ChevronRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>

                <div className="flex items-start justify-between gap-4 p-3.5 rounded-nx-lg border border-nx-line bg-nx-surface">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-nx-ink">
                      {tr(
                        "venueSettings.booking.windowTitle",
                        "Advance Booking Window",
                        "نافذة الحجز المسبق الافتراضية"
                      )}
                    </div>
                    <p className="text-xs text-nx-ink-2">
                      {tr(
                        "venueSettings.booking.windowDescription",
                        "Maximum days in advance clients and operators can reserve slots (Default: 14 days).",
                        "الحد الأقصى المسموح به للعملاء لحجز المواعيد مستقبلاً (افتراضياً: 14 يوماً)."
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold border-nx-line bg-nx-surfaceSubtle text-nx-ink">
                    {tr("venueSettings.booking.windowDays", "14 Days", "14 يوم", { count: 14 })}
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
                {tr(
                  "venueSettings.team.title",
                  "Venue Management Mode & Collaboration",
                  "نمط إدارة المنشأة وصلاحيات الفريق"
                )}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {tr(
                  "venueSettings.team.description",
                  "Control whether you operate solo or collaborate with staff members.",
                  "اختر ما إذا كنت تدير المنشأة منفرداً أو بالتعاون مع فريق عمل."
                )}
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
                      {tr("venueSettings.team.soloTitle", "Just Me (Solo Owner)", "أنا فقط (إدارة فردية)")}
                    </span>
                    {managementMode === "solo" && <Check className="size-4 text-nx-accent" />}
                  </div>
                  <p className="text-xs text-nx-ink-2">
                    {tr(
                      "venueSettings.team.soloDescription",
                      "Keep navigation simple and clean. Team management is hidden from normal menus.",
                      "إخفاء تبويب فريق العمل لتبسيط القوائم الجانبية وسلاسة التشغيل اليومي."
                    )}
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
                      {tr(
                        "venueSettings.team.teamTitle",
                        "Me and My Team (Collaborative)",
                        "أنا وفريقي (إدارة مشتركة)"
                      )}
                    </span>
                    {managementMode === "team" && <Check className="size-4 text-nx-accent" />}
                  </div>
                  <p className="text-xs text-nx-ink-2">
                    {tr(
                      "venueSettings.team.teamDescription",
                      "Expose Team in the secondary sidebar to invite managers, receptionists, and assign roles.",
                      "إظهار قسم فريق العمل في القائمة الجانبية لإدارة الموظفين والمديرين والصلاحيات."
                    )}
                  </p>
                </button>
              </div>

              {managementMode === "team" && canViewTeam && (
                <div className="pt-2 flex items-center justify-between p-3.5 rounded-nx-lg border border-nx-line bg-nx-surfaceSubtle">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-nx-ink">
                      {tr(
                        "venueSettings.team.manageTitle",
                        "Manage Team Members & Permissions",
                        "إدارة أعضاء الفريق والصلاحيات"
                      )}
                    </div>
                    <div className="text-[11px] text-nx-ink-2">
                      {tr(
                        "venueSettings.team.manageDescription",
                        "Configure staff accounts, roles, and administrative access.",
                        "إضافة مديري الفروع ومشغلي الحجوزات وتعيين أدوارهم."
                      )}
                    </div>
                  </div>
                  <Button asChild size="sm" className="text-xs font-bold gap-1.5">
                    <Link href="/admins">
                      <ShieldCheck className="size-3.5" />
                      <span>{tr("venueSettings.team.openTeam", "Open Team Management", "فتح فريق العمل")}</span>
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
                {tr(
                  "venueSettings.preferences.title",
                  "Language & Regional Preferences",
                  "تفضيلات العرض واللغة"
                )}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-2">
                {tr(
                  "venueSettings.preferences.description",
                  "Customize your user interface language and layout direction.",
                  "تخصيص لغة واجهة النظام واتجاه العرض."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-nx-lg border border-nx-line bg-nx-surface">
                <div>
                  <div className="text-xs font-bold text-nx-ink">
                    {tr("venueSettings.preferences.languageTitle", "Interface Language", "لغة المنظومة")}
                  </div>
                  <div className="text-xs text-nx-ink-2">
                    {tr(
                      "venueSettings.preferences.languageDescription",
                      "English and Arabic with native RTL support",
                      "العربية والإنجليزية مدعومتان بالكامل"
                    )}
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
                    {tr(
                      "venueSettings.advanced.title",
                      "Advanced Administrative Configuration",
                      "الإعدادات المتقدمة وسجلات النظام"
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 text-nx-ink-2">
                    {tr(
                      "venueSettings.advanced.description",
                      "Technical registries and multi-campus configurations for power operators and administrators.",
                      "سجلات فنية ومصفوفات تشغيلية موسعة للمشرفين ومديري النظام."
                    )}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-nx-surfaceSubtle text-nx-ink-2 border-nx-line">
                  {tr("venueSettings.advanced.badge", "Admin Only", "للمشرفين فقط")}
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
                      <span>{tr("venueSettings.advanced.registries.facilitiesTitle", "Branch & Facility Registry", "سجل الفروع والمرافق")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {tr("venueSettings.advanced.registries.facilitiesDesc", "Physical facility branches and multi-location metadata.", "إدارة الفروع الإضافية والمرافق الرياضية الفعلية.")}
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
                      <span>{tr("venueSettings.advanced.registries.availabilityTitle", "Operating Hours & Matrix", "مصفوفة ساعات العمل والتوافر")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {tr("venueSettings.advanced.registries.availabilityDesc", "Multi-window shifts, schedule matrices, and date exceptions.", "جداول التوافر الموسعة والاستثناءات وتعارض المواعيد.")}
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
                      <span>{tr("venueSettings.advanced.registries.sitesTitle", "Sites & Campuses", "المواقع والمجمعات الرياضية")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {tr("venueSettings.advanced.registries.sitesDesc", "Enterprise site boundaries and campus hierarchy.", "التنظيم الهيكلي للمجمعات الرياضية متعددة المواقع.")}
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
                      <span>{tr("venueSettings.advanced.registries.pricingTitle", "Commercial Pricing Catalog", "كتالوج التسعير وقواعد الأسعار")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {tr("venueSettings.advanced.registries.pricingDesc", "Authoritative catalog price books and tax categories.", "قواعد التسعير المتقدمة وفئات الضرائب والخصومات.")}
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
                      <span>{tr("venueSettings.advanced.registries.builderTitle", "Resource Builder", "سجل الموارد والملاعب الفني")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {tr("venueSettings.advanced.registries.builderDesc", "Direct schedulable resource schema configuration.", "التعريف البرمجي لقدرات المساحات والربط التقني.")}
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
                      <span>{tr("venueSettings.advanced.registries.profilesTitle", "Resource Profiles", "نماذج ملفات المساحات")}</span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      {tr("venueSettings.advanced.registries.profilesDesc", "Archetype policy templates across facility spaces.", "قوالب السياسات التشغيلية المشتركة للملاعب.")}
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
