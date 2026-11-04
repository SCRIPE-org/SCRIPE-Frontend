"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useProgramOfferingsViewModel } from "../viewmodels/useProgramOfferingsViewModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Badge } from "@core/ui/badge";
import {
  CalendarDays,
  Plus,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  Users,
  MapPin,
} from "lucide-react";

export function ProgramOfferingsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_OFFERINGS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_OFFERINGS_CREATE);

  const locator = useAcademyServiceLocator();
  const {
    state,
    openCreateDialog,
    closeCreateDialog,
    createOffering,
    reload,
  } = useProgramOfferingsViewModel(locator.offeringsRepository);

  // Form State
  const [programId, setProgramId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [externalLocationId, setExternalLocationId] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-12-15");
  const [maxCapacity, setMaxCapacity] = useState(25);
  const [minCapacity, setMinCapacity] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId || !branchId || !seasonId || !nameEn || !nameAr) return;

    const ok = await createOffering({
      programId,
      branchId,
      seasonId,
      externalLocationId: externalLocationId || null,
      nameEn,
      nameAr,
      startDate,
      endDate,
      maxCapacity: Number(maxCapacity),
      minCapacity: Number(minCapacity),
    });

    if (ok) {
      setNameEn("");
      setNameAr("");
    }
  };

  if (!canView) {
    return (
      <div className="mx-auto my-12 max-w-xl p-6" dir={dir}>
        <Alert variant="destructive">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold text-nx-ink">Access Restricted</AlertTitle>
          <AlertDescription className="mt-2 text-xs text-nx-ink-2">
            You do not have permission to view Academy Offerings.
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
              <CalendarDays className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-nx-ink">
                {t("academyOfferings.title") || "Program Offerings & Terms"}
              </h1>
              <p className="text-xs text-nx-ink-2">
                {t("academyOfferings.subtitle") ||
                  "Deliver programs across operational branches and seasons with governed capacity bounds."}
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
              Create Offering
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

      {/* Loading state */}
      {state.stage === "loading" && (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {state.stage === "ready" && state.offerings.length === 0 && (
        <Card className="border border-dashed border-nx-line p-8 text-center">
          <CalendarDays className="mx-auto size-10 text-nx-ink-3" />
          <h3 className="mt-3 text-sm font-semibold text-nx-ink">No Offerings Established</h3>
          <p className="mt-1 text-xs text-nx-ink-2">
            Link programs to seasons and branches to start accepting athlete enrollments.
          </p>
          {canCreate && (
            <div className="mt-4">
              <Button size="sm" onClick={openCreateDialog} className="gap-2 text-xs">
                <Plus className="size-3.5" />
                Add First Offering
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Offerings Grid */}
      {state.stage === "ready" && state.offerings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.offerings.map((offering) => (
            <Card key={offering.id} className="border border-nx-line bg-nx-surface">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] border-nx-line">
                    {offering.status}
                  </Badge>
                  <span className="text-[11px] text-nx-ink-3 font-mono">
                    {offering.startDate} → {offering.endDate}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-nx-ink mt-2">
                  {language === "ar" ? offering.nameAr : offering.nameEn}
                </CardTitle>
                <CardDescription className="text-xs text-nx-ink-2 flex items-center gap-1.5">
                  <MapPin className="size-3" />
                  Branch: {offering.branchId.slice(0, 8)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between bg-nx-raised p-2.5 rounded border border-nx-line text-xs">
                  <div className="flex items-center gap-1.5 text-nx-ink-2">
                    <Users className="size-3.5" />
                    <span>Enrolled / Capacity:</span>
                  </div>
                  <span className="font-semibold text-nx-ink">
                    {offering.enrolledCount} / {offering.maxCapacity}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {state.isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-nx-line bg-nx-surface p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <h2 className="text-base font-bold text-nx-ink">Create Program Offering</h2>
              <button onClick={closeCreateDialog} className="text-nx-ink-3 hover:text-nx-ink text-sm font-semibold">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Program UUID *</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter Program ID..."
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink font-mono"
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Season UUID *</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter Season ID..."
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink font-mono"
                    value={seasonId}
                    onChange={(e) => setSeasonId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Branch UUID *</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter Branch ID..."
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink font-mono"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">External Location (Optional)</label>
                  <input
                    type="text"
                    placeholder="External Location UUID..."
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink font-mono"
                    value={externalLocationId}
                    onChange={(e) => setExternalLocationId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Name (English) *</label>
                  <input
                    required
                    type="text"
                    placeholder="Term 1 Junior Football"
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
                    placeholder="كرة قدم الناشئين الفصل الأول"
                    dir="rtl"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Start Date *</label>
                  <input
                    required
                    type="date"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">End Date *</label>
                  <input
                    required
                    type="date"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Min Capacity *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={minCapacity}
                    onChange={(e) => setMinCapacity(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Max Capacity *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
                <Button type="button" variant="outline" size="sm" onClick={closeCreateDialog} disabled={state.submitting}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={state.submitting}>
                  {state.submitting ? "Saving..." : "Save Offering"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
