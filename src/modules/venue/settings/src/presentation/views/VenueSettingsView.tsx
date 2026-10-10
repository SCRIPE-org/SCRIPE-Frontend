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
  AlertCircle,
  ExternalLink,
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
  const branchCode = selectedFacility?.code || "MAIN";
  const branchTimezone = "Africa/Cairo";

  return (
    <div
      className="space-y-6 max-w-[1200px] mx-auto text-nx-ink"
      dir={direction}
      data-testid="venue-settings-view"
    >
      {/* Header */}
      <PageHeader
        icon={Settings}
        title={t("venueNav.settings", { defaultValue: isRtl ? "إعدادات المنشأة" : "Venue Settings" })}
        description={
          isRtl
            ? "بيانات الفرع، الإعدادات الافتراضية للحجز، فريق العمل، والتفضيلات المتقدمة."
            : "Branch profiles, booking defaults, team collaboration, and advanced configuration."
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-nx-surface border border-nx-line p-1">
          <TabsTrigger value="branch" className="gap-1.5 text-xs font-semibold">
            <Building2 className="size-3.5" aria-hidden="true" />
            <span>{isRtl ? "الفرع والمنشأة" : "Branch & Venue"}</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-1.5 text-xs font-semibold">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            <span>{isRtl ? "قواعد الحجز" : "Booking Defaults"}</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs font-semibold">
            <Users className="size-3.5" aria-hidden="true" />
            <span>{isRtl ? "فريق العمل" : "Team & Access"}</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 text-xs font-semibold">
            <Globe2 className="size-3.5" aria-hidden="true" />
            <span>{isRtl ? "التفضيلات" : "Preferences"}</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-1.5 text-xs font-semibold">
            <Sliders className="size-3.5" aria-hidden="true" />
            <span>{isRtl ? "الإعدادات المتقدمة" : "Advanced"}</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Branch & Venue */}
        <TabsContent value="branch" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                {isRtl ? "بيانات الفرع الحالي" : "Operating Branch Details"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isRtl
                  ? "معلومات الفرع الرياضي وموقعه ومنطقته الزمنية المعتمدة."
                  : "Authoritative branch location, active timezone, and operating profile."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <div className="text-[11px] font-medium text-slate-500">
                    {isRtl ? "اسم الفرع" : "Branch Name"}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Building2 className="size-4 text-blue-500" />
                    <span>{branchName}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <div className="text-[11px] font-medium text-slate-500">
                    {isRtl ? "المنطقة الزمنية المعتمدة" : "Operating Timezone"}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="size-4 text-indigo-500" />
                    <span>{branchTimezone}</span>
                  </div>
                </div>
              </div>

              <Alert className="py-2.5 bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 text-blue-900 dark:text-blue-200">
                <Info className="size-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-xs">
                  {isRtl
                    ? "لإضافة فروع أخرى أو تعديل السجلات المؤسسية متعددة المواقع، انتقل إلى الإعدادات المتقدمة ← سجل الفروع والمرافق."
                    : "To configure multiple branches or update physical campus records, open Advanced Settings → Branch Registry."}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Booking Defaults */}
        <TabsContent value="booking" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                {isRtl ? "الإعدادات الافتراضية للحجز" : "Global Booking Preferences"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isRtl
                  ? "القواعد التشغيلية العامة للحجوزات في المنشأة."
                  : "Venue-wide scheduling defaults and booking policies."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {isRtl ? "فترات الحجز المحددة للملعب" : "Court-Specific Rules Architecture"}
                    </div>
                    <p className="text-xs text-slate-500">
                      {isRtl
                        ? "يتم تحديد مدة فترة الحجز (60 دقيقة، 90 دقيقة، إلخ) والأسعار وساعات العمل لكل ملعب بشكل مستقل ومباشر."
                        : "Slot duration (60 min, 90 min, etc.), pricing, and working hours are configured canonically inside each Court's Detail view."}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="text-xs shrink-0">
                    <Link href="/venue/resources">
                      <span>{isRtl ? "الملاعب والمساحات" : "Courts & Spaces"}</span>
                      <ChevronRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>

                <div className="flex items-start justify-between gap-4 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {isRtl ? "نافذة الحجز المسبق الافتراضية" : "Advance Booking Window"}
                    </div>
                    <p className="text-xs text-slate-500">
                      {isRtl
                        ? "الحد الأقصى المسموح به للعملاء لحجز المواعيد مستقبلاً (افتراضياً: 14 يوماً)."
                        : "Maximum days in advance clients and operators can reserve slots (Default: 14 days)."}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    14 {isRtl ? "يوم" : "Days"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Team & Access */}
        <TabsContent value="team" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                {isRtl ? "نمط إدارة المنشأة وصلاحيات الفريق" : "Venue Management Mode & Collaboration"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isRtl
                  ? "اختر ما إذا كنت تدير المنشأة منفرداً أو بالتعاون مع فريق عمل."
                  : "Control whether you operate solo or collaborate with staff members."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleModeChange("solo")}
                  className={`text-start p-4 rounded-xl border transition-all ${
                    managementMode === "solo"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {isRtl ? "أنا فقط (إدارة فردية)" : "Just Me (Solo Owner)"}
                    </span>
                    {managementMode === "solo" && <Check className="size-4 text-blue-600" />}
                  </div>
                  <p className="text-xs text-slate-500">
                    {isRtl
                      ? "إخفاء تبويب فريق العمل لتبسيط القوائم الجانبية وسلاسة التشغيل اليومي."
                      : "Keep navigation simple and clean. Team management is hidden from normal menus."}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("team")}
                  className={`text-start p-4 rounded-xl border transition-all ${
                    managementMode === "team"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {isRtl ? "أنا وفريقي (إدارة مشتركة)" : "Me and My Team (Collaborative)"}
                    </span>
                    {managementMode === "team" && <Check className="size-4 text-blue-600" />}
                  </div>
                  <p className="text-xs text-slate-500">
                    {isRtl
                      ? "إظهار قسم فريق العمل في القائمة الجانبية لإدارة الموظفين والمديرين والصلاحيات."
                      : "Expose Team in the secondary sidebar to invite managers, receptionists, and assign roles."}
                  </p>
                </button>
              </div>

              {managementMode === "team" && canViewTeam && (
                <div className="pt-2 flex items-center justify-between p-3.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      {isRtl ? "إدارة أعضاء الفريق والصلاحيات" : "Manage Team Members & Permissions"}
                    </div>
                    <div className="text-[11px] text-indigo-700 dark:text-indigo-300">
                      {isRtl ? "إضافة مديري الفروع ومشغلي الحجوزات وتعيين أدوارهم." : "Configure staff accounts, roles, and administrative access."}
                    </div>
                  </div>
                  <Button asChild size="sm" className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                    <Link href="/admins">
                      <ShieldCheck className="size-3.5" />
                      <span>{isRtl ? "فتح فريق العمل" : "Open Team Management"}</span>
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                {isRtl ? "تفضيلات العرض واللغة" : "Language & Regional Preferences"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isRtl
                  ? "تخصيص لغة واجهة النظام واتجاه العرض."
                  : "Customize your user interface language and layout direction."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {isRtl ? "لغة المنظومة" : "Interface Language"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isRtl ? "العربية والإنجليزية مدعومتان بالكامل" : "English and Arabic with native RTL support"}
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
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">
                    {isRtl ? "الإعدادات المتقدمة وسجلات النظام" : "Advanced Administrative Configuration"}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {isRtl
                      ? "سجلات فنية ومصفوفات تشغيلية موسعة للمشرفين ومديري النظام."
                      : "Technical registries and multi-campus configurations for power operators and administrators."}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {isRtl ? "للمشرفين فقط" : "Admin Only"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Branch & Facility Registry */}
                <Link
                  href="/venue/facilities"
                  className="flex items-start justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                      <Building2 className="size-4 text-blue-500" />
                      <span>{isRtl ? "سجل الفروع والمرافق" : "Branch & Facility Registry"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isRtl ? "إدارة الفروع الإضافية والمرافق الرياضية الفعلية." : "Physical facility branches and multi-location metadata."}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-600 rtl:rotate-180 shrink-0 mt-1" />
                </Link>

                {/* Operating Hours Matrix */}
                <Link
                  href="/venue/availability"
                  className="flex items-start justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                      <Clock className="size-4 text-indigo-500" />
                      <span>{isRtl ? "مصفوفة ساعات العمل والتوافر" : "Operating Hours & Matrix"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isRtl ? "جداول التوافر الموسعة والاستثناءات وتعارض المواعيد." : "Multi-window shifts, schedule matrices, and date exceptions."}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-600 rtl:rotate-180 shrink-0 mt-1" />
                </Link>

                {/* Sites & Campuses */}
                <Link
                  href="/venue/sites"
                  className="flex items-start justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                      <MapPin className="size-4 text-emerald-500" />
                      <span>{isRtl ? "المواقع والمجمعات الرياضية" : "Sites & Campuses"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isRtl ? "التنظيم الهيكلي للمجمعات الرياضية متعددة المواقع." : "Enterprise site boundaries and campus hierarchy."}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-600 rtl:rotate-180 shrink-0 mt-1" />
                </Link>

                {/* Pricing Catalog */}
                <Link
                  href="/venue/pricing"
                  className="flex items-start justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                      <CircleDollarSign className="size-4 text-amber-500" />
                      <span>{isRtl ? "كتالوج التسعير وقواعد الأسعار" : "Commercial Pricing Catalog"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isRtl ? "قواعد التسعير المتقدمة وفئات الضرائب والخصومات." : "Authoritative catalog price books and tax categories."}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-600 rtl:rotate-180 shrink-0 mt-1" />
                </Link>

                {/* Resource Builder */}
                <Link
                  href="/venue/resource-builder"
                  className="flex items-start justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                      <Sliders className="size-4 text-purple-500" />
                      <span>{isRtl ? "سجل الموارد والملاعب الفني" : "Resource Builder"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isRtl ? "التعريف البرمجي لقدرات المساحات والربط التقني." : "Direct schedulable resource schema configuration."}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-600 rtl:rotate-180 shrink-0 mt-1" />
                </Link>

                {/* Resource Profiles */}
                <Link
                  href="/venue/resource-profiles"
                  className="flex items-start justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                      <Layers className="size-4 text-teal-500" />
                      <span>{isRtl ? "نماذج ملفات المساحات" : "Resource Profiles"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isRtl ? "قوالب السياسات التشغيلية المشتركة للملاعب." : "Archetype policy templates across facility spaces."}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-600 rtl:rotate-180 shrink-0 mt-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
