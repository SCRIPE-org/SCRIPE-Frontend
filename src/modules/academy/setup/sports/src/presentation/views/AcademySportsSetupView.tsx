"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { getModuleApiService } from "@/core/services/api-factory";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Search,
  Check,
  Edit2,
  Plus
} from "lucide-react";

export interface AcademySetupSport {
  id?: string;
  sportId: string;
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
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "disciplines" | "programs" | "settings">("overview");
  const [loading, setLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSportOpen, setIsAddSportOpen] = useState(false);

  const api = useMemo(() => getModuleApiService("ACADEMY"), []);

  const fetchSports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<AcademySetupSport[]>("/v1/academy/setup/sports");
      const mapped = (data || []).map((s) => ({
        ...s,
        id: s.sportId || s.id || "",
      }));
      setSports(mapped);
      if (mapped.length > 0 && !selectedSportId) {
        // default select Football or first enabled sport
        const football = mapped.find((s) => s.code === "FOOTBALL");
        setSelectedSportId(football ? football.id! : mapped[0].id!);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load sports setup catalog";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [api, selectedSportId]);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  const handleToggleSport = async (sport: AcademySetupSport) => {
    const sId = sport.id || sport.sportId;
    setActionInProgressId(sId);
    setError(null);
    setSuccessMessage(null);
    try {
      if (sport.isEnabled) {
        await api.post(`/v1/academy/setup/sports/${sId}/disable`, {});
        setSuccessMessage(
          isAr
            ? `تم تعطيل رياضة "${sport.nameAr}" بنجاح في الأكاديمية.`
            : `Sport "${sport.nameEn}" successfully disabled for this academy.`
        );
      } else {
        await api.post(`/v1/academy/setup/sports/${sId}/enable`, {});
        setSuccessMessage(
          isAr
            ? `تم تفعيل رياضة "${sport.nameAr}" بنجاح! أصبحت متاحة الآن في البرامج وتسجيل الرياضيين.`
            : `Sport "${sport.nameEn}" successfully enabled! Now active across programs and athlete intake.`
        );
      }
      await fetchSports();
    } catch (err: unknown) {
      let msg = "Action failed";
      if (err instanceof Error) {
        msg = err.message;
      }
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

  const selectedSport = useMemo(() => {
    return sports.find((s) => s.id === selectedSportId) || sports[0] || null;
  }, [sports, selectedSportId]);

  const enabledCount = useMemo(() => sports.filter((s) => s.isEnabled).length, [sports]);
  const activeProgramsTotal = useMemo(
    () => sports.reduce((acc, s) => acc + (s.activeProgramsCount || 0), 0),
    [sports]
  );

  const getDisciplinesForSport = (code: string) => {
    switch (code.toUpperCase()) {
      case "FOOTBALL":
        return [
          { name: isAr ? "كرة قدم 11 ضد 11" : "Football 11-a-side", sub: isAr ? "مفعلة · خارجي" : "Enabled · Outdoor" },
          { name: isAr ? "كرة قدم 7 ضد 7" : "Football 7-a-side", sub: isAr ? "مفعلة · خارجي" : "Enabled · Outdoor" },
          { name: isAr ? "كرة قدم الصالات" : "Futsal", sub: isAr ? "مفعلة · داخلي" : "Enabled · Indoor" },
        ];
      case "SWIMMING":
        return [
          { name: isAr ? "السباحة الحرة" : "Freestyle", sub: isAr ? "مفعلة · مسبح أولمبي" : "Enabled · Olympic" },
          { name: isAr ? "سباحة الفراشة" : "Butterfly", sub: isAr ? "مفعلة · مسبح مغطى" : "Enabled · Indoor" },
          { name: isAr ? "سباحة الظهر والصدر" : "Backstroke & Breaststroke", sub: isAr ? "مفعلة · تدريب تقني" : "Enabled · Squad" },
        ];
      case "BASKETBALL":
        return [
          { name: isAr ? "كرة سلة قياسية 5 ضد 5" : "Standard 5-a-side", sub: isAr ? "معتمدة · صالة مغلقة" : "Sanctioned · Indoor" },
          { name: isAr ? "كرة سلة 3 ضد 3" : "3x3 Basketball", sub: isAr ? "معتمدة · نصف ملعب" : "Sanctioned · Half Court" },
        ];
      case "PADEL":
        return [
          { name: isAr ? "بادل زوجي" : "Doubles Classic", sub: isAr ? "معتمدة · ملعب زجاجي" : "Sanctioned · Glass Court" },
          { name: isAr ? "بادل فردي" : "Singles Technical", sub: isAr ? "معتمدة · تدريب خاص" : "Sanctioned · Training" },
        ];
      case "MARTIAL_ARTS":
        return [
          { name: isAr ? "كاراتيه كاتا وكوميتيه" : "Karate Kata & Kumite", sub: isAr ? "معتمدة · دوجو" : "Sanctioned · Dojo" },
          { name: isAr ? "تايكوندو" : "Taekwondo WTF", sub: isAr ? "معتمدة · حلبة مغلقة" : "Sanctioned · Poomsae" },
        ];
      case "TENNIS":
        return [
          { name: isAr ? "تنس ملاعب ترابية" : "Clay Court Singles", sub: isAr ? "معتمدة · ترابي" : "Sanctioned · Clay" },
          { name: isAr ? "تنس ملاعب صلبة" : "Hard Court Development", sub: isAr ? "معتمدة · صلب" : "Sanctioned · Hard" },
        ];
      default:
        return [
          { name: isAr ? "تدريب عام" : "General Training", sub: isAr ? "معتمد" : "Sanctioned" },
        ];
    }
  };

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
    <div className="space-y-6 p-4 sm:p-6 max-w-[1600px] mx-auto text-nx-ink font-sans" dir={dir}>
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-nx-ink-3 mb-1">
            <Link href="/academy" className="hover:underline flex items-center gap-1 text-nx-ink-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              {isAr ? "لوحة الأكاديمية" : "Academy Operations"}
            </Link>
            <span>/</span>
            <span>{isAr ? "الإعدادات والمواقع" : "Settings & Locations"}</span>
            <span>/</span>
            <span className="text-nx-ink font-bold">{isAr ? "إعدادات الرياضات" : "Sports Setup"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#222923] to-[#0d1110] border border-[#454d41] text-[#c8ff05] shadow-lg">
              <span className="text-2xl font-bold">◈</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-nx-ink">
                {isAr ? "إعدادات الرياضات والتخصصات" : "Sports Setup"}
              </h1>
              <p className="text-xs text-nx-ink-3 mt-0.5">
                {isAr
                  ? "تفعيل وتعطيل الرياضات المعتمدة سيادياً في أكاديميتك من الكتالوج المركزي SportsCore دون تكرار."
                  : "Configure supported sports and disciplines without duplicating canonical sport definitions."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSports}
            disabled={loading}
            className="rounded-lg border border-[#353d3c] bg-[#111416] px-3.5 py-2 text-xs font-bold text-nx-ink hover:bg-[#1a1f21] transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#c8ff05] ${loading ? "animate-spin" : ""}`} />
            <span>{isAr ? "مزامنة الكتالوج" : "Sync Registry"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddSportOpen(true)}
            className="rounded-lg bg-[#c8ff05] border border-[#c8ff05] px-4 py-2 text-xs font-bold text-[#131600] shadow-[0_0_24px_rgba(199,255,0,0.18)] hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{isAr ? "إضافة رياضة" : "Add Sport"}</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="h-[105px] rounded-xl border border-[#7ca100] bg-gradient-to-br from-[#1c2602] to-[#101314] p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[#c8ff05] text-lg font-bold">◈</span>
            <span className="text-[10px] font-bold text-[#c8ff05] bg-[#c8ff05]/20 px-1.5 py-0.5 rounded border border-[#c8ff05]/30">+1</span>
          </div>
          <div>
            <div className="text-2xl font-black text-[#c8ff05] font-mono leading-none">{enabledCount}</div>
            <div className="text-xs text-nx-ink-2 mt-1 font-medium">{isAr ? "الرياضات المفعلة" : "Configured Sports"}</div>
          </div>
        </div>

        <div className="h-[105px] rounded-xl border border-[#353d3c] bg-gradient-to-br from-[#171b1b] to-[#101314] p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[#9aa1a6] text-lg font-bold">▤</span>
          </div>
          <div>
            <div className="text-2xl font-black text-nx-ink font-mono leading-none">12</div>
            <div className="text-xs text-nx-ink-2 mt-1 font-medium">{isAr ? "التخصصات النشطة" : "Active Disciplines"}</div>
          </div>
        </div>

        <div className="h-[105px] rounded-xl border border-[#353d3c] bg-gradient-to-br from-[#171b1b] to-[#101314] p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[#9aa1a6] text-lg font-bold">▦</span>
          </div>
          <div>
            <div className="text-2xl font-black text-nx-ink font-mono leading-none">{activeProgramsTotal || 2}</div>
            <div className="text-xs text-nx-ink-2 mt-1 font-medium">{isAr ? "البرامج المرتبطة بالرياضات" : "Sport-linked Programs"}</div>
          </div>
        </div>

        <div className="h-[105px] rounded-xl border border-[#353d3c] bg-gradient-to-br from-[#171b1b] to-[#101314] p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[#c8ff05] text-lg font-bold">☑</span>
          </div>
          <div>
            <div className="text-2xl font-black text-nx-ink font-mono leading-none">100%</div>
            <div className="text-xs text-nx-ink-2 mt-1 font-medium">{isAr ? "أكواد الرياضات المعتمدة" : "Verified Sport Codes"}</div>
          </div>
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <Alert variant="destructive" className="border-rose-500/30 bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isAr ? "تنبيه متعلق بإدارة الرياضات" : "Sports Management Alert"}</AlertTitle>
          <AlertDescription className="mt-1 text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <AlertTitle className="font-semibold text-xs">{isAr ? "نجحت العملية" : "Success"}</AlertTitle>
          <AlertDescription className="text-xs">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Sport Registry (approx 5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#32393c] bg-[#101214] flex flex-col h-[580px] overflow-hidden">
          <div className="h-12 border-b border-[#2a3033] px-5 flex items-center justify-between bg-[#14171a]">
            <span className="font-bold text-sm tracking-wide text-nx-ink">
              {isAr ? "سجل الرياضات المعتمد" : "Sport Registry"}
            </span>
            <span className="text-xs text-nx-ink-3">
              {sports.length} {isAr ? "رياضات" : "sports"}
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col space-y-3 overflow-hidden">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-nx-ink-3" />
              <input
                type="text"
                placeholder={isAr ? "بحث في الرياضات أو التخصصات..." : "Search sport or discipline..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#343b3e] bg-[#0b0e10] pl-9 pr-3 py-2 text-xs text-nx-ink placeholder:text-nx-ink-3 focus:border-[#c8ff05] focus:outline-none"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : filteredSports.length === 0 ? (
                <div className="p-6 text-center text-xs text-nx-ink-3">
                  {isAr ? "لا توجد رياضات مطابقة." : "No sports match your search."}
                </div>
              ) : (
                filteredSports.map((sport) => {
                  const isSelected = selectedSport?.id === sport.id;
                  const disciplinesCount = getDisciplinesForSport(sport.code).length;

                  return (
                    <div
                      key={sport.id}
                      onClick={() => setSelectedSportId(sport.id!)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#222e00] to-[#121804] border-[#5a7800] shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                          : "bg-[#14171a] border-[#2a3033] hover:border-[#424a4e]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a2307] text-[#c8ff05] border border-[#5a7800] shrink-0">
                          <SportIcon code={sport.code} className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-nx-ink">
                            {isAr ? sport.nameAr : sport.nameEn}
                          </div>
                          <div className="text-[11px] text-nx-ink-3">
                            {disciplinesCount} {isAr ? "تخصصات" : "disciplines"} · {sport.activeProgramsCount || 0} {isAr ? "برامج" : "programs"}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          sport.isEnabled
                            ? "bg-[#1c2707] text-[#c8ff05] border-[#5a7800]"
                            : "bg-[#1f2224] text-[#8e9598] border-[#343b3e]"
                        }`}
                      >
                        {sport.isEnabled ? (isAr ? "مفعلة" : "Enabled") : (isAr ? "معطلة" : "Disabled")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Sport Configuration (approx 7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#32393c] bg-[#101214] flex flex-col h-[580px] overflow-hidden">
          <div className="h-12 border-b border-[#2a3033] px-5 flex items-center justify-between bg-[#14171a]">
            <span className="font-bold text-sm tracking-wide text-nx-ink">
              {isAr ? "تكوين الرياضة المختارة" : "Sport Configuration"}
            </span>
            <div className="flex items-center gap-2">
              {selectedSport && (
                <button
                  type="button"
                  onClick={() => handleToggleSport(selectedSport)}
                  disabled={actionInProgressId === (selectedSport.id || selectedSport.sportId)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedSport.isEnabled
                      ? "border border-[#80404b] text-[#ff909b] hover:bg-[#80404b]/20"
                      : "bg-[#c8ff05] text-[#131600] hover:brightness-105"
                  }`}
                >
                  {actionInProgressId === (selectedSport.id || selectedSport.sportId) ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : selectedSport.isEnabled ? (
                    isAr ? "تعطيل الرياضة" : "Disable Sport"
                  ) : (
                    isAr ? "تفعيل الرياضة" : "Enable Sport"
                  )}
                </button>
              )}
              <button
                type="button"
                className="rounded-lg border border-[#41474a] bg-[#111416] px-3 py-1.5 text-xs font-bold text-nx-ink hover:bg-[#1a1f21] flex items-center gap-1"
              >
                <Edit2 className="h-3.5 w-3.5 text-[#c8ff05]" />
                <span>{isAr ? "تعديل الإعدادات" : "Edit Sport"}</span>
              </button>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col space-y-4 overflow-y-auto">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-[#2a3033] pb-2 text-xs font-bold text-nx-ink-3">
              <span
                onClick={() => setActiveTab("overview")}
                className={`cursor-pointer pb-2 transition-all ${
                  activeTab === "overview"
                    ? "text-[#c8ff05] border-b-2 border-[#c8ff05]"
                    : "hover:text-nx-ink"
                }`}
              >
                {isAr ? "نظرة عامة على الرياضة" : "Sport Overview"}
              </span>
              <span
                onClick={() => setActiveTab("disciplines")}
                className={`cursor-pointer pb-2 transition-all ${
                  activeTab === "disciplines"
                    ? "text-[#c8ff05] border-b-2 border-[#c8ff05]"
                    : "hover:text-nx-ink"
                }`}
              >
                {isAr ? "التخصصات" : "Disciplines"}
              </span>
              <span
                onClick={() => setActiveTab("programs")}
                className={`cursor-pointer pb-2 transition-all ${
                  activeTab === "programs"
                    ? "text-[#c8ff05] border-b-2 border-[#c8ff05]"
                    : "hover:text-nx-ink"
                }`}
              >
                {isAr ? "البرامج المرتبطة" : "Programs"}
              </span>
              <span
                onClick={() => setActiveTab("settings")}
                className={`cursor-pointer pb-2 transition-all ${
                  activeTab === "settings"
                    ? "text-[#c8ff05] border-b-2 border-[#c8ff05]"
                    : "hover:text-nx-ink"
                }`}
              >
                {isAr ? "الإعدادات" : "Settings"}
              </span>
            </div>

            {selectedSport ? (
              <>
                {/* Selected Sport Hero Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-nx-ink-3 uppercase tracking-wider">
                      {isAr ? "الرياضة المحددة" : "Selected Sport"}
                    </div>
                    <h2 className="text-2xl font-black text-nx-ink mt-1 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a2307] text-[#c8ff05] border border-[#5a7800] shrink-0">
                        <SportIcon code={selectedSport.code} className="h-5 w-5" />
                      </div>
                      <span>{isAr ? selectedSport.nameAr : selectedSport.nameEn}</span>
                    </h2>
                    <div className="text-xs text-nx-ink-3 mt-1 font-sans">
                      {selectedSport.descriptionEn || "Canonical sport mapping · tenant configuration"}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      selectedSport.isEnabled
                        ? "bg-[#1c2707] text-[#c8ff05] border-[#5a7800]"
                        : "bg-[#1f2224] text-[#8e9598] border-[#343b3e]"
                    }`}
                  >
                    {selectedSport.isEnabled ? (isAr ? "مفعلة" : "Enabled") : (isAr ? "غير مفعلة" : "Disabled")}
                  </span>
                </div>

                {/* Metric Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[#30383a] bg-[#141b1b] p-3 text-center">
                    <div className="text-[10px] font-bold text-nx-ink-3 uppercase tracking-wider">
                      {isAr ? "التخصصات" : "Disciplines"}
                    </div>
                    <div className="text-2xl font-black text-[#c8ff05] font-mono mt-0.5">
                      {getDisciplinesForSport(selectedSport.code).length}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#30383a] bg-[#141b1b] p-3 text-center">
                    <div className="text-[10px] font-bold text-nx-ink-3 uppercase tracking-wider">
                      {isAr ? "البرامج" : "Programs"}
                    </div>
                    <div className="text-2xl font-black text-[#c8ff05] font-mono mt-0.5">
                      {selectedSport.activeProgramsCount || 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#30383a] bg-[#141b1b] p-3 text-center">
                    <div className="text-[10px] font-bold text-nx-ink-3 uppercase tracking-wider">
                      {isAr ? "المشاركات" : "Participations"}
                    </div>
                    <div className="text-2xl font-black text-nx-ink font-mono mt-0.5">
                      {selectedSport.activeProgramsCount > 0 ? "142" : "0"}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#2a3033]" />

                {/* Supported Disciplines Grid */}
                <div>
                  <div className="text-[10px] font-bold text-nx-ink-3 uppercase tracking-wider mb-2.5">
                    {isAr ? "التخصصات المعتمدة للرياضة" : "Supported Disciplines"}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {getDisciplinesForSport(selectedSport.code).map((d, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#151a1c] border border-[#323b3d]">
                        <strong className="text-xs font-bold text-nx-ink block">{d.name}</strong>
                        <p className="text-[11px] text-[#a3adad] mt-1">{d.sub}</p>
                      </div>
                    ))}
                    <div className="p-3 rounded-xl bg-[#151a1c] border border-dashed border-[#323b3d] flex flex-col justify-center cursor-pointer hover:border-[#c8ff05]/50 transition-colors">
                      <strong className="text-xs font-bold text-[#c8ff05] block">
                        {isAr ? "+ إضافة تخصص" : "+ Add discipline"}
                      </strong>
                      <p className="text-[11px] text-nx-ink-3 mt-1">
                        {isAr ? "يتطلب صلاحية الإدارة" : "Requires permission"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Canonical Note */}
                <div className="mt-auto rounded-xl bg-[#0c1510] border border-[#345327] p-3 text-xs text-[#c9dfb4] leading-relaxed">
                  ✓ {isAr
                    ? "إعدادات الرياضات تضبط استخدام الرياضات في الأكاديمية. تظل تقييمات كرة القدم التخصصية منفصلة عن النواة العامة."
                    : "Sports Setup configures Academy sport use. Sport-specific football evaluations remain outside the generic Academy core."}
                </div>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center text-xs text-nx-ink-3">
                {isAr ? "الرجاء اختيار رياضة من السجل." : "Select a sport from the registry."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Sport Dialog (ACAD-UX-01) */}
      <AddSportDialog
        isOpen={isAddSportOpen}
        onClose={() => setIsAddSportOpen(false)}
        sports={sports}
        onEnableSport={handleToggleSport}
        actionInProgressId={actionInProgressId}
        isAr={isAr}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sport-Specific Consistent Icons (ACAD-UX-02)
// ---------------------------------------------------------------------------
function SportIcon({ code, className = "h-5 w-5" }: { code: string; className?: string }) {
  switch (code.toUpperCase()) {
    case "FOOTBALL":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="m14.83 9.17 4.24-4.24" />
          <path d="m14.83 14.83 4.24 4.24" />
          <path d="m9.17 14.83-4.24 4.24" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case "BASKETBALL":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2.1 10.5a18.3 18.3 0 0 0 19.8 0" />
          <path d="M2.1 13.5a18.3 18.3 0 0 1 19.8 0" />
          <path d="M12 2v20" />
        </svg>
      );
    case "TENNIS":
    case "PADEL":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      );
    case "SWIMMING":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        </svg>
      );
    case "MARTIAL_ARTS":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m14.5 17.5 3 3 3-3-3-3z" />
          <path d="m4 20 5-5" />
          <path d="m9 9 5 5" />
          <path d="m15 3 6 6-4 4-6-6z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      );
  }
}

// ---------------------------------------------------------------------------
// Add & Enable Canonical Sport Dialog (ACAD-UX-01)
// ---------------------------------------------------------------------------
function AddSportDialog({
  isOpen,
  onClose,
  sports,
  onEnableSport,
  actionInProgressId,
  isAr,
}: {
  isOpen: boolean;
  onClose: () => void;
  sports: AcademySetupSport[];
  onEnableSport: (sport: AcademySetupSport) => Promise<void>;
  actionInProgressId: string | null;
  isAr: boolean;
}) {
  const [filterQuery, setFilterQuery] = useState("");

  if (!isOpen) return null;

  const filtered = sports.filter((s) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.nameAr.toLowerCase().includes(q)
    );
  });

  const availableToEnable = filtered.filter((s) => !s.isEnabled);
  const alreadyEnabled = filtered.filter((s) => s.isEnabled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#32393c] bg-[#101214] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#2a3033] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a2307] text-[#c8ff05] border border-[#5a7800]">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-nx-ink">
                {isAr ? "إضافة وتفعيل رياضة معتمدة" : "Add & Enable Sport"}
              </h2>
              <p className="text-[11px] text-nx-ink-3">
                {isAr
                  ? "البحث والتفعيل المباشر من كتالوج الرياضات السيادي SportsCore دون تكرار."
                  : "Search and enable canonical sports from SportsCore registry."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-nx-ink-3 hover:text-nx-ink text-sm font-semibold p-1.5 rounded-lg hover:bg-[#1a1e21] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-nx-ink-3" />
          <input
            type="text"
            placeholder={isAr ? "بحث في الرياضات المعتمدة..." : "Search canonical sports..."}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full rounded-lg border border-[#343b3e] bg-[#0b0e10] pl-9 pr-3 py-2 text-xs text-nx-ink placeholder:text-nx-ink-3 focus:border-[#c8ff05] focus:outline-none"
          />
        </div>

        {/* List of Sports */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {/* Section 1: Available to Enable */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-[#c8ff05] uppercase tracking-wider">
              {isAr ? `الرياضات المتاحة للتفعيل (${availableToEnable.length})` : `Available to Enable (${availableToEnable.length})`}
            </div>
            {availableToEnable.length === 0 ? (
              <div className="p-3 text-center text-xs text-nx-ink-3 border border-dashed border-[#2a3033] rounded-xl">
                {isAr ? "لا توجد رياضات غير مفعلة مطابقة." : "All matching canonical sports are already enabled."}
              </div>
            ) : (
              availableToEnable.map((sport) => {
                const sId = sport.id || sport.sportId;
                const isBusy = actionInProgressId === sId;
                return (
                  <div
                    key={sId}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#2a3033] bg-[#14171a] hover:border-[#5a7800] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#1a2307] text-[#c8ff05] border border-[#5a7800] flex items-center justify-center">
                        <SportIcon code={sport.code} className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {isAr ? sport.nameAr : sport.nameEn}
                        </div>
                        <div className="text-[10px] text-nx-ink-3 font-mono">
                          Code: {sport.code}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onEnableSport(sport)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c8ff05] text-[#131600] text-xs font-bold shadow-[0_0_12px_rgba(200,255,5,0.15)] hover:brightness-105 disabled:opacity-50 cursor-pointer"
                    >
                      {isBusy ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      <span>{isAr ? "تفعيل" : "Enable"}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Section 2: Already Enabled */}
          <div className="space-y-2 pt-2 border-t border-[#222629]">
            <div className="text-[11px] font-bold text-nx-ink-3 uppercase tracking-wider">
              {isAr ? `الرياضات المفعلة مسبقاً (${alreadyEnabled.length})` : `Already Enabled (${alreadyEnabled.length})`}
            </div>
            {alreadyEnabled.map((sport) => {
              const sId = sport.id || sport.sportId;
              return (
                <div
                  key={sId}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#222629] bg-[#0c1012] opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#14181a] text-[#8e9598] border border-[#2a3033] flex items-center justify-center">
                      <SportIcon code={sport.code} className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#d0d6d8]">
                        {isAr ? sport.nameAr : sport.nameEn}
                      </div>
                      <div className="text-[10px] text-nx-ink-3 font-mono">
                        Code: {sport.code}
                      </div>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#5a7800] bg-[#1c2707] text-[#c8ff05]">
                    <Check className="h-3 w-3" />
                    <span>{isAr ? "مفعلة" : "Active"}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-[#2a3033] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#353d3c] bg-[#14171a] text-xs font-bold text-white hover:bg-[#1a1e21] cursor-pointer"
          >
            {isAr ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
