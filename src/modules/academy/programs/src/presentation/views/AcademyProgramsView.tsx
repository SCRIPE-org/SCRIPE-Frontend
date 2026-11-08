"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyProgramsViewModel } from "../viewmodels/useAcademyProgramsViewModel";
import type { ProgramLevel, GenderCriteria } from "../../domain/entities/AcademyProgram";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Badge } from "@core/ui/badge";
import {
  Layers,
  Plus,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export function AcademyProgramsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_CREATE);
  const canPublish = usePermission(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_UPDATE);

  const locator = useAcademyServiceLocator();
  const {
    state,
    setFilterSport,
    openCreateDialog,
    closeCreateDialog,
    createProgram,
    publishProgram,
    reload,
  } = useAcademyProgramsViewModel(locator.programsRepository);

  // Form state
  const [sportId, setSportId] = useState("");
  const [code, setCode] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [minAge, setMinAge] = useState(6);
  const [maxAge, setMaxAge] = useState(16);
  const [level, setLevel] = useState<ProgramLevel>("Beginner");
  const [genderCriteria, setGenderCriteria] = useState<GenderCriteria>("Mixed");

  const isFormValid = Boolean(sportId && code.trim() && nameEn.trim() && nameAr.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportId || !code || !nameEn || !nameAr) return;

    const ok = await createProgram({
      sportId,
      code,
      nameEn,
      nameAr,
      descriptionEn: descriptionEn || null,
      descriptionAr: descriptionAr || null,
      minAge: Number(minAge),
      maxAge: Number(maxAge),
      level,
      genderCriteria,
    });

    if (ok) {
      setCode("");
      setNameEn("");
      setNameAr("");
      setDescriptionEn("");
      setDescriptionAr("");
    }
  };

  if (!canView) {
    return (
      <div className="mx-auto my-12 max-w-xl p-6" dir={dir}>
        <Alert variant="destructive">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold text-nx-ink">Access Restricted</AlertTitle>
          <AlertDescription className="mt-2 text-xs text-nx-ink-2">
            You do not have permission to view Academy Programs.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/academy"
              className="flex size-8 items-center justify-center rounded-md border border-nx-line text-nx-ink-2 hover:bg-nx-raised transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex size-10 items-center justify-center rounded-md bg-nx-raised border border-nx-line text-nx-ink">
              <Layers className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-nx-ink">
                {t("academyPrograms.title") || "Multi-Sport Programs"}
              </h1>
              <p className="text-xs text-nx-ink-2">
                {t("academyPrograms.subtitle") ||
                  "Configure foundational and elite sporting curriculums linked to Sports Core taxonomy."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={reload}
            disabled={state.stage === "loading"}
            className="gap-2 text-xs border-nx-line"
          >
            <RefreshCw className={`size-3.5 ${state.stage === "loading" ? "animate-spin" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>
          {canCreate && (
            <Button size="sm" onClick={openCreateDialog} className="gap-2 text-xs">
              <Plus className="size-3.5" />
              {isAr ? "إنشاء برنامج" : "Create Program"}
            </Button>
          )}
        </div>
      </div>

      {state.errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-nx-ink-2">
          {isAr ? "تصفية حسب الرياضة:" : "Sport Filter:"}
        </label>
        <select
          className="h-8 rounded-md border border-nx-line bg-nx-surface px-2.5 text-xs text-nx-ink"
          value={state.selectedSportId || ""}
          onChange={(e) => setFilterSport(e.target.value || undefined)}
        >
          <option value="">{isAr ? "جميع الرياضات" : "All Sports"}</option>
          {state.sports.map((s) => (
            <option key={s.id} value={s.id}>
              {language === "ar" ? s.nameAr : s.nameEn} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {state.stage === "loading" && (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {state.stage === "ready" && state.programs.length === 0 && (
        <Card className="border border-dashed border-nx-line p-8 text-center">
          <Layers className="mx-auto size-10 text-nx-ink-3" />
          <h3 className="mt-3 text-sm font-semibold text-nx-ink">
            {isAr ? "لا توجد برامج مسجلة" : "No Programs Configured"}
          </h3>
          <p className="mt-1 text-xs text-nx-ink-2">
            {isAr ? "أنشئ برنامجك التدريبي الأول لربطه بالرياضات والفصول التدريبية." : "Establish your multi-sport academy catalog by adding training programs."}
          </p>
          {canCreate && (
            <div className="mt-4">
              <Button size="sm" onClick={openCreateDialog} className="gap-2 text-xs">
                <Plus className="size-3.5" />
                {isAr ? "إضافة أول برنامج" : "Add First Program"}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Program Grid */}
      {state.stage === "ready" && state.programs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.programs.map((program) => {
            const sport = state.sports.find((s) => s.id === program.sportId);
            const sportName = sport
              ? language === "ar"
                ? sport.nameAr
                : sport.nameEn
              : "Sport";

            return (
              <Card key={program.id} className="border border-nx-line bg-nx-surface">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] border-nx-line">
                      {sportName}
                    </Badge>
                    <Badge
                      variant={program.status === "Published" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {program.status === "Published" ? (isAr ? "منشور" : "Published") : (isAr ? "مسودة" : "Draft")}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-nx-ink mt-2">
                    {language === "ar" ? program.nameAr : program.nameEn}
                  </CardTitle>
                  <CardDescription className="text-xs text-nx-ink-2">
                    {isAr ? "الرمز:" : "Code:"} {program.code} • v{program.version}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-nx-ink-2 line-clamp-2">
                    {language === "ar"
                      ? program.descriptionAr || "لا يوجد وصف مدخل"
                      : program.descriptionEn || "No description provided"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-nx-raised p-2 rounded border border-nx-line text-nx-ink-2">
                    <div>
                      <span className="font-semibold text-nx-ink">{isAr ? "الأعمار:" : "Ages:"}</span> {program.minAge} - {program.maxAge} {isAr ? "سنة" : "yrs"}
                    </div>
                    <div>
                      <span className="font-semibold text-nx-ink">{isAr ? "المستوى:" : "Level:"}</span> {
                        program.level === "Beginner" ? (isAr ? "مبتدئ" : "Beginner") :
                        program.level === "Intermediate" ? (isAr ? "متوسط" : "Intermediate") :
                        program.level === "Advanced" ? (isAr ? "متقدم" : "Advanced") : (isAr ? "نخبة" : "Elite")
                      }
                    </div>
                    <div>
                      <span className="font-semibold text-nx-ink">{isAr ? "فئة الجنس:" : "Gender:"}</span> {
                        program.genderCriteria === "Mixed" ? (isAr ? "مختلط" : "Mixed") :
                        program.genderCriteria === "BoysOnly" ? (isAr ? "بنين فقط" : "Boys Only") : (isAr ? "بنات فقط" : "Girls Only")
                      }
                    </div>
                  </div>
                  {program.status === "Draft" && canPublish && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={state.submitting}
                      onClick={() => publishProgram(program.id)}
                      className="w-full gap-2 text-xs border-nx-line hover:border-nx-accent-fill"
                    >
                      <Sparkles className="size-3.5 text-nx-accent-fill" />
                      {isAr ? "نشر البرنامج" : "Publish Program"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {state.isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-nx-line bg-nx-surface p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto" dir={dir}>
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <h2 className="text-base font-bold text-nx-ink">
                {isAr ? "إنشاء برنامج رياضي جديد" : "Create New Program"}
              </h2>
              <button
                onClick={closeCreateDialog}
                className="text-nx-ink-3 hover:text-nx-ink text-sm font-semibold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Actionable Dependency Warning if Sports Taxonomy is empty or failed */}
            {state.sports.length === 0 && (
              <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-700 dark:text-amber-300 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="size-4 shrink-0" />
                  {isAr ? "تصنيف الرياضات غير متوفر حالياً" : "Sports Taxonomy Unavailable"}
                </div>
                <p>
                  {isAr
                    ? "لا توجد رياضات معتمدة متوفرة من SportsCore. لا يمكن إنشاء برامج بدون اختيار رياضة معتمدة."
                    : "No canonical sports were retrieved from SportsCore. Programs require a valid canonical sport."}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-1 text-[11px] h-7"
                  onClick={reload}
                >
                  {isAr ? "إعادة تحميل الرياضات" : "Retry Loading Sports"}
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-nx-ink">
                  {isAr ? "تصنيف الرياضة الأساسية *" : "Sport Taxonomy *"}
                </label>
                <select
                  disabled={state.sports.length === 0}
                  className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink disabled:opacity-50"
                  value={sportId}
                  onChange={(e) => setSportId(e.target.value)}
                >
                  <option value="">
                    {isAr ? "-- اختر الرياضة المعتمدة --" : "-- Select canonical sport --"}
                  </option>
                  {state.sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isAr ? s.nameAr : s.nameEn} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">
                    {isAr ? "رمز البرنامج *" : "Program Code *"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PROG-FB-JR"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">
                    {isAr ? "مستوى البرنامج *" : "Level *"}
                  </label>
                  <select
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={level}
                    onChange={(e) => setLevel(e.target.value as ProgramLevel)}
                  >
                    <option value="Beginner">{isAr ? "مبتدئ (Beginner)" : "Beginner"}</option>
                    <option value="Intermediate">{isAr ? "متوسط (Intermediate)" : "Intermediate"}</option>
                    <option value="Advanced">{isAr ? "متقدم (Advanced)" : "Advanced"}</option>
                    <option value="Elite">{isAr ? "نخبة (Elite)" : "Elite"}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">
                    {isAr ? "الاسم (إنجليزي) *" : "Name (English) *"}
                  </label>
                  <input
                    type="text"
                    placeholder="Junior Football Development"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">
                    {isAr ? "الاسم (عربي) *" : "Name (Arabic) *"}
                  </label>
                  <input
                    type="text"
                    placeholder="برنامج تطوير كرة القدم"
                    dir="rtl"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">
                    {isAr ? "الحد الأدنى للعمر *" : "Min Age *"}
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={25}
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">
                    {isAr ? "الحد الأقصى للعمر *" : "Max Age *"}
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={25}
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">
                    {isAr ? "فئة الجنس *" : "Gender Criteria *"}
                  </label>
                  <select
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={genderCriteria}
                    onChange={(e) => setGenderCriteria(e.target.value as GenderCriteria)}
                  >
                    <option value="Mixed">{isAr ? "مختلط (Mixed)" : "Mixed"}</option>
                    <option value="BoysOnly">{isAr ? "بنين فقط (Boys Only)" : "Boys Only"}</option>
                    <option value="GirlsOnly">{isAr ? "بنات فقط (Girls Only)" : "Girls Only"}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-nx-ink">
                  {isAr ? "الوصف (إنجليزي)" : "Description (English)"}
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border border-nx-line bg-nx-surface p-2 text-xs text-nx-ink"
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                />
              </div>

              {/* Actionable inline validation helper */}
              {!isFormValid && (
                <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  {isAr
                    ? "يرجى تعبئة الحقول الإلزامية: الرياضة، رمز البرنامج، والاسم باللغتين الإنجليزية والعربية."
                    : "Please fill all required fields: Sport taxonomy, Program Code, and English & Arabic names."}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeCreateDialog}
                  disabled={state.submitting}
                  className="text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={state.submitting || !isFormValid || state.sports.length === 0}
                  className="text-xs"
                >
                  {state.submitting
                    ? (isAr ? "جاري الحفظ..." : "Saving...")
                    : (isAr ? "حفظ البرنامج" : "Save Program")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
