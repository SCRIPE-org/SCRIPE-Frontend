"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { getModuleApiService } from "@/core/services/api-factory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Badge } from "@core/ui/badge";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Search,
  Check,
  Power,
  Layers,
  Sparkles
} from "lucide-react";

export interface AcademySetupSport {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isEnabled: boolean;
  activeProgramsCount: number;
}

export function AcademySportsSetupView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";

  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_VIEW);

  const [sports, setSports] = useState<AcademySetupSport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const api = useMemo(() => getModuleApiService("ACADEMY"), []);

  const fetchSports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<AcademySetupSport[]>("/v1/academy/setup/sports");
      setSports(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load sports setup catalog";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  const handleToggleSport = async (sport: AcademySetupSport) => {
    setActionInProgressId(sport.id);
    setError(null);
    setSuccessMessage(null);
    try {
      if (sport.isEnabled) {
        // Disable
        await api.post(`/v1/academy/setup/sports/${sport.id}/disable`, {});
        setSuccessMessage(
          isAr
            ? `تم تعطيل رياضة "${sport.nameAr}" بنجاح في الأكاديمية.`
            : `Sport "${sport.nameEn}" successfully disabled for this academy.`
        );
      } else {
        // Enable
        await api.post(`/v1/academy/setup/sports/${sport.id}/enable`, {});
        setSuccessMessage(
          isAr
            ? `تم تفعيل رياضة "${sport.nameAr}" بنجاح! أصبحت متاحة الآن في البرامج وتسجيل الرياضيين.`
            : `Sport "${sport.nameEn}" successfully enabled! Now active across programs and athlete intake.`
        );
      }
      // Refresh list to sync states and counts
      await fetchSports();
    } catch (err: unknown) {
      let msg = "Action failed";
      if (err instanceof Error) {
        msg = err.message;
      }
      // If error response has data message from 409 Conflict
      const anyErr = err as { response?: { data?: { message?: string } } };
      if (anyErr.response?.data?.message) {
        msg = anyErr.response.data.message;
      }
      setError(msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  const filteredSports = useMemo(() => {
    if (!searchQuery.trim()) return sports;
    const q = searchQuery.toLowerCase();
    return sports.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.nameAr.toLowerCase().includes(q) ||
        (s.descriptionEn && s.descriptionEn.toLowerCase().includes(q))
    );
  }, [sports, searchQuery]);

  const enabledCount = useMemo(() => sports.filter((s) => s.isEnabled).length, [sports]);

  if (!canView) {
    return (
      <div className="p-6" dir={dir}>
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{isAr ? "غير مصرح" : "Unauthorized"}</AlertTitle>
          <AlertDescription>
            {isAr
              ? "ليس لديك صلاحية لإدارة إعدادات الرياضات في الأكاديمية."
              : "You do not have permission to manage Academy sports configuration."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto" dir={dir}>
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/academy" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              {isAr ? "لوحة الأكاديمية" : "Academy Overview"}
            </Link>
            <span>/</span>
            <span>{isAr ? "الإعدادات" : "Setup"}</span>
            <span>/</span>
            <span className="text-foreground font-medium">{isAr ? "إدارة الرياضات" : "Sports Management"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Activity className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                {isAr ? "إعدادات الرياضات والتخصصات" : "Academy Sports & Catalog Management"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "تفعيل وتعطيل الرياضات المعتمدة سيادياً في أكاديميتك من الكتالوج المركزي SportsCore."
                  : "Activate and manage tenant-enabled sports from the canonical SportsCore authority."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSports} disabled={loading} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{isAr ? "تحديث" : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 text-xs text-blue-900 dark:text-blue-300 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-sm">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{isAr ? "المرجعية السيادية لكتالوج الرياضات (SportsCore)" : "Canonical SportsCore Catalog Architecture"}</span>
        </div>
        <p>
          {isAr
            ? "الرياضات والتخصصات معرفة مركزياً عبر SportsCore لمنع التكرار وضمان الاتساق. يمكنك هنا تفعيل الرياضات التي تقدمها أكاديميتك؛ وعند تفعيل رياضة (مثل السباحة)، ستصبح متاحة تلقائياً في تعريف البرامج وتصنيفات الرياضيين وجداول الحصص."
            : "Sports and disciplines are canonically managed in SportsCore to guarantee taxonomy integrity. Activating a sport (such as Swimming) immediately enables it across Academy Programs, Athlete Intake, Sport Participations, and Course Offerings. Sports with active programs cannot be disabled."}
        </p>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isAr ? "تنبيه متعلق بإدارة الرياضات" : "Sports Management Alert"}</AlertTitle>
          <AlertDescription className="mt-1 text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertTitle className="font-semibold text-xs">{isAr ? "نجحت العملية" : "Success"}</AlertTitle>
          <AlertDescription className="text-xs">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Overview Stats & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-2.5 py-1 bg-background font-medium">
            {isAr
              ? `الرياضات المفعلة: ${enabledCount} من أصل ${sports.length}`
              : `Active Sports: ${enabledCount} of ${sports.length}`}
          </Badge>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={isAr ? "ابحث بالاسم أو الرمز..." : "Search sports by name or code..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border pl-9 pr-3 py-1.5 text-xs bg-background shadow-sm"
          />
        </div>
      </div>

      {/* Sports Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredSports.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>{isAr ? "لا توجد رياضات تطابق معايير البحث." : "No sports found matching criteria."}</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSports.map((sport) => {
            const isBusy = actionInProgressId === sport.id;

            return (
              <Card
                key={sport.id}
                className={`flex flex-col justify-between transition-all border ${
                  sport.isEnabled
                    ? "border-primary/40 bg-card shadow-sm"
                    : "border-muted bg-muted/20 opacity-80"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {sport.code}
                        </span>
                        <Badge
                          variant={sport.isEnabled ? "default" : "secondary"}
                          className={`text-[10px] ${
                            sport.isEnabled
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "text-muted-foreground"
                          }`}
                        >
                          {sport.isEnabled
                            ? isAr
                              ? "مفعلة بالأكاديمية"
                              : "Active in Academy"
                            : isAr
                            ? "غير مفعلة"
                            : "Disabled"}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold">
                        {isAr ? sport.nameAr : sport.nameEn}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {isAr ? sport.nameEn : sport.nameAr}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                    {isAr
                      ? sport.descriptionAr || sport.descriptionEn || "رياضة معتمدة في المنظومة."
                      : sport.descriptionEn || sport.descriptionAr || "Canonical accredited sport."}
                  </p>

                  {/* Active Programs Badge */}
                  <div className="pt-2 border-t flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      {isAr ? "البرامج النشطة:" : "Active Programs:"}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-mono ${
                        sport.activeProgramsCount > 0
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "text-muted-foreground"
                      }`}
                    >
                      {sport.activeProgramsCount}
                    </Badge>
                  </div>

                  {/* Toggle Button */}
                  <div className="pt-2 flex items-center justify-end">
                    <Button
                      size="sm"
                      variant={sport.isEnabled ? "outline" : "default"}
                      disabled={isBusy}
                      onClick={() => handleToggleSport(sport)}
                      className={`gap-1.5 text-xs w-full sm:w-auto ${
                        sport.isEnabled
                          ? "border-destructive/30 hover:bg-destructive/10 text-destructive"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      }`}
                    >
                      {isBusy ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>{isAr ? "جاري التحديث..." : "Updating..."}</span>
                        </>
                      ) : sport.isEnabled ? (
                        <>
                          <Power className="h-3.5 w-3.5" />
                          <span>{isAr ? "تعطيل الرياضة" : "Deactivate Sport"}</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>{isAr ? "تفعيل في الأكاديمية" : "Activate Sport"}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
