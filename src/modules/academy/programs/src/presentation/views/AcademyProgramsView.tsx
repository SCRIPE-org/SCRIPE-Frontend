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
} from "lucide-react";

export function AcademyProgramsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
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
            Refresh
          </Button>
          {canCreate && (
            <Button size="sm" onClick={openCreateDialog} className="gap-2 text-xs">
              <Plus className="size-3.5" />
              Create Program
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
        <label className="text-xs font-medium text-nx-ink-2">Sport Filter:</label>
        <select
          className="h-8 rounded-md border border-nx-line bg-nx-surface px-2.5 text-xs text-nx-ink"
          value={state.selectedSportId || ""}
          onChange={(e) => setFilterSport(e.target.value || undefined)}
        >
          <option value="">All Sports</option>
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
          <h3 className="mt-3 text-sm font-semibold text-nx-ink">No Programs Configured</h3>
          <p className="mt-1 text-xs text-nx-ink-2">
            Establish your multi-sport academy catalog by adding training programs.
          </p>
          {canCreate && (
            <div className="mt-4">
              <Button size="sm" onClick={openCreateDialog} className="gap-2 text-xs">
                <Plus className="size-3.5" />
                Add First Program
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
                      {program.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-nx-ink mt-2">
                    {language === "ar" ? program.nameAr : program.nameEn}
                  </CardTitle>
                  <CardDescription className="text-xs text-nx-ink-2">
                    Code: {program.code} • v{program.version}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-nx-ink-2 line-clamp-2">
                    {language === "ar"
                      ? program.descriptionAr || "لا يوجد وصف"
                      : program.descriptionEn || "No description provided"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-nx-raised p-2 rounded border border-nx-line text-nx-ink-2">
                    <div>
                      <span className="font-semibold text-nx-ink">Ages:</span> {program.minAge} - {program.maxAge} yrs
                    </div>
                    <div>
                      <span className="font-semibold text-nx-ink">Level:</span> {program.level}
                    </div>
                    <div>
                      <span className="font-semibold text-nx-ink">Gender:</span> {program.genderCriteria}
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
                      Publish Program
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
          <div className="w-full max-w-lg rounded-lg border border-nx-line bg-nx-surface p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <h2 className="text-base font-bold text-nx-ink">Create New Program</h2>
              <button
                onClick={closeCreateDialog}
                className="text-nx-ink-3 hover:text-nx-ink text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-nx-ink">Sport Taxonomy *</label>
                <select
                  required
                  className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                  value={sportId}
                  onChange={(e) => setSportId(e.target.value)}
                >
                  <option value="">Select canonical sport...</option>
                  {state.sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {language === "ar" ? s.nameAr : s.nameEn} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Program Code *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. PROG-FB-JR"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Level *</label>
                  <select
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={level}
                    onChange={(e) => setLevel(e.target.value as ProgramLevel)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Name (English) *</label>
                  <input
                    required
                    type="text"
                    placeholder="Junior Football Development"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Name (Arabic) *</label>
                  <input
                    required
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
                  <label className="text-xs font-semibold text-nx-ink">Min Age *</label>
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
                  <label className="text-xs font-semibold text-nx-ink">Max Age *</label>
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
                  <label className="text-xs font-semibold text-nx-ink">Gender Criteria *</label>
                  <select
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={genderCriteria}
                    onChange={(e) => setGenderCriteria(e.target.value as GenderCriteria)}
                  >
                    <option value="Mixed">Mixed</option>
                    <option value="BoysOnly">Boys Only</option>
                    <option value="GirlsOnly">Girls Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-nx-ink">Description (English)</label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border border-nx-line bg-nx-surface p-2 text-xs text-nx-ink"
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeCreateDialog}
                  disabled={state.submitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={state.submitting} className="text-xs">
                  {state.submitting ? "Saving..." : "Save Program"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
