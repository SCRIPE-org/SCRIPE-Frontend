"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useExternalLocationsViewModel } from "../viewmodels/useExternalLocationsViewModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Badge } from "@core/ui/badge";
import {
  MapPin,
  Plus,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  Phone,
  User,
  Info,
} from "lucide-react";

export function ExternalLocationsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_LOCATIONS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_LOCATIONS_CREATE);

  const locator = useAcademyServiceLocator();
  const {
    state,
    openCreateDialog,
    closeCreateDialog,
    createLocation,
    reload,
  } = useExternalLocationsViewModel(locator.locationsRepository);

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameAr) return;

    const ok = await createLocation({
      nameEn,
      nameAr,
      address: address || null,
      contactName: contactName || null,
      contactPhone: contactPhone || null,
      notes: notes || null,
    });

    if (ok) {
      setNameEn("");
      setNameAr("");
      setAddress("");
      setContactName("");
      setContactPhone("");
      setNotes("");
    }
  };

  if (!canView) {
    return (
      <div className="mx-auto my-12 max-w-xl p-6" dir={dir}>
        <Alert variant="destructive">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold text-nx-ink">Access Restricted</AlertTitle>
          <AlertDescription className="mt-2 text-xs text-nx-ink-2">
            You do not have permission to view Academy External Locations.
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
              <MapPin className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-nx-ink">
                {t("academyLocations.title") || "External Training Locations"}
              </h1>
              <p className="text-xs text-nx-ink-2">
                {t("academyLocations.subtitle") ||
                  "Manage unmanaged external facilities (rented pitches, community pools). Decoupled from Venue."}
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
              Add Location
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
      {state.stage === "ready" && state.locations.length === 0 && (
        <Card className="border border-dashed border-nx-line p-8 text-center">
          <MapPin className="mx-auto size-10 text-nx-ink-3" />
          <h3 className="mt-3 text-sm font-semibold text-nx-ink">No External Locations</h3>
          <p className="mt-1 text-xs text-nx-ink-2">
            Record training sites operated outside the primary organization facilities.
          </p>
          {canCreate && (
            <div className="mt-4">
              <Button size="sm" onClick={openCreateDialog} className="gap-2 text-xs">
                <Plus className="size-3.5" />
                Add External Location
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Locations Grid */}
      {state.stage === "ready" && state.locations.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.locations.map((loc) => (
            <Card key={loc.id} className="border border-nx-line bg-nx-surface">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] border-nx-line text-nx-accent-fill font-medium">
                    {loc.availabilityDisclaimer}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-nx-ink mt-2">
                  {language === "ar" ? loc.nameAr : loc.nameEn}
                </CardTitle>
                {loc.address && (
                  <CardDescription className="text-xs text-nx-ink-2">
                    {loc.address}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-xs">
                {loc.contactName && (
                  <div className="flex items-center gap-1.5 text-nx-ink-2">
                    <User className="size-3.5" />
                    <span>{loc.contactName}</span>
                  </div>
                )}
                {loc.contactPhone && (
                  <div className="flex items-center gap-1.5 text-nx-ink-2">
                    <Phone className="size-3.5" />
                    <span dir="ltr">{loc.contactPhone}</span>
                  </div>
                )}
                {loc.notes && (
                  <div className="flex items-start gap-1.5 text-[11px] text-nx-ink-3 bg-nx-raised p-2 rounded border border-nx-line">
                    <Info className="size-3 mt-0.5" />
                    <span>{loc.notes}</span>
                  </div>
                )}
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
              <h2 className="text-base font-bold text-nx-ink">Add External Training Location</h2>
              <button onClick={closeCreateDialog} className="text-nx-ink-3 hover:text-nx-ink text-sm font-semibold">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-nx-raised rounded border border-nx-line text-xs text-nx-ink-2 space-y-1">
                <span className="font-semibold text-nx-ink">Truthful Availability Disclaimer:</span>
                <p className="text-[11px] text-nx-ink-3">
                  External locations are unmanaged manual facilities. Availability is not verified against Venue resource bookings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Name (English) *</label>
                  <input
                    required
                    type="text"
                    placeholder="Community Sports Pitch"
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
                    placeholder="ملعب الرياضة المجتمعي"
                    dir="rtl"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-nx-ink">Physical Address</label>
                <input
                  type="text"
                  placeholder="Street, District, City"
                  className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Facility manager"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-nx-ink">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+9665..."
                    dir="ltr"
                    className="w-full h-9 rounded-md border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-nx-ink">Operational Notes</label>
                <textarea
                  rows={2}
                  placeholder="Rental agreement terms, gate codes, etc."
                  className="w-full rounded-md border border-nx-line bg-nx-surface p-2 text-xs text-nx-ink"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
                <Button type="button" variant="outline" size="sm" onClick={closeCreateDialog} disabled={state.submitting}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={state.submitting}>
                  {state.submitting ? "Saving..." : "Save Location"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
