"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MapPin, Plus, RefreshCw, Search, Navigation } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useExternalLocationsViewModel } from "../viewmodels/useExternalLocationsViewModel";

function getLocationThumbnail(name?: string | null, address?: string | null): string | null {
  const terms = [name, address].filter(Boolean).join(" ").toLowerCase();
  if (terms.includes("alpha")) return "/images/academy/backgrounds/venue-photography/qa-field-alpha-thumb-reference.webp";
  if (terms.includes("beta")) return "/images/academy/backgrounds/venue-photography/qa-field-beta-thumb-reference.webp";
  if (terms.includes("gamma")) return "/images/academy/backgrounds/venue-photography/qa-field-gamma-thumb-reference.webp";
  if (terms.includes("dome") || terms.includes("indoor")) return "/images/academy/backgrounds/venue-photography/indoor-dome-thumb-reference.webp";
  if (terms.includes("hall") || terms.includes("main")) return "/images/academy/backgrounds/venue-photography/main-hall-thumb-reference.webp";
  if (terms.includes("west") || terms.includes("ground")) return "/images/academy/backgrounds/venue-photography/west-training-ground-thumb-reference.webp";
  if (terms.includes("pitch") || terms.includes("field") || terms.includes("stadium")) return "/images/academy/backgrounds/venue-photography/qa-field-alpha-thumb-reference.webp";
  return null;
}

export function ExternalLocationsView() {
  const { language } = useI18n();
  const isAr = language === "ar";
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_LOCATIONS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_LOCATIONS_CREATE);
  const locator = useAcademyServiceLocator();
  const { state, openCreateDialog, closeCreateDialog, createLocation, reload } =
    useExternalLocationsViewModel(locator.locationsRepository);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  const locations = state.locations;
  const filteredLocations = locations.filter((location) => {
    const query = searchQuery.trim().toLowerCase();
    return !query || [location.nameEn, location.nameAr, location.address]
      .some((value) => value?.toLowerCase().includes(query));
  });
  const selectedLocation = filteredLocations.find((location) => location.id === selectedLocationId)
    ?? filteredLocations[0] ?? null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nameEn.trim() || !nameAr.trim()) return;
    const saved = await createLocation({
      nameEn: nameEn.trim(), nameAr: nameAr.trim(),
      address: address.trim() || null,
      contactName: contactName.trim() || null,
      contactPhone: contactPhone.trim() || null,
      notes: notes.trim() || null,
    });
    if (saved) {
      setNameEn(""); setNameAr(""); setAddress("");
      setContactName(""); setContactPhone(""); setNotes("");
    }
  }

  if (!canView) {
    return <p className="p-6 text-nx-ink" role="alert">
      {isAr ? "ليس لديك صلاحية لعرض مواقع التدريب الخارجية." : "You do not have permission to view Academy external locations."}
    </p>;
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="mx-auto max-w-[1600px] space-y-6 p-4 text-nx-ink sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-nx-line pb-4">
        <div>
          <Link href="/academy" className="text-xs text-nx-ink-2 hover:underline">
            {isAr ? "عمليات الأكاديمية" : "Academy Operations"}
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-black">
            <MapPin className="text-nx-accent" />{isAr ? "مواقع التدريب" : "Training Locations"}
          </h1>
          <p className="mt-1 text-xs text-nx-ink-2">
            {isAr ? "مواقع التدريب الخارجية المسجلة في الأكاديمية." : "Academy external training locations on record."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={reload} disabled={state.stage === "loading"}>
            <RefreshCw className={state.stage === "loading" ? "animate-spin" : ""} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>
          {canCreate && <Button type="button" onClick={openCreateDialog}>
            <Plus />{isAr ? "إضافة موقع" : "Add Location"}
          </Button>}
        </div>
      </header>

      {state.stage === "loading" && <div role="status" className="flex items-center gap-2 rounded-xl border border-nx-line p-4">
        <LoadingSpinner size="sm" />{isAr ? "جارٍ تحميل المواقع..." : "Loading locations..."}
      </div>}
      {state.stage === "error" && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 p-4 text-sm">
        <span>{state.errorMessage || (isAr ? "تعذر تحميل المواقع." : "Unable to load locations.")}</span>
        <Button type="button" variant="outline" onClick={reload}>{isAr ? "إعادة المحاولة" : "Retry"}</Button>
      </div>}

      {state.stage === "ready" && <>
        <div className="rounded-xl border border-nx-line bg-nx-surface p-4">
          <div className="text-2xl font-black">{locations.length}</div>
          <div className="text-xs text-nx-ink-2">{isAr ? "إجمالي المواقع الخارجية" : "Total External Locations"}</div>
        </div>

        {locations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-nx-line p-8 text-center text-sm text-nx-ink-2">
            {isAr ? "لا توجد مواقع خارجية مسجلة." : "No external locations found."}
          </div>
        ) : <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <section className="space-y-3 lg:col-span-5" aria-label={isAr ? "قائمة المواقع" : "Locations"}>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-2.5 size-4 text-nx-ink-2" />
              <Input aria-label={isAr ? "البحث عن المواقع" : "Search locations"} value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={isAr ? "البحث بالاسم أو العنوان" : "Search by name or address"}
                className="ps-9" />
            </div>
            {filteredLocations.length === 0 ? <p className="rounded-xl border border-nx-line p-4 text-sm text-nx-ink-2">
              {isAr ? "لا توجد مواقع مطابقة." : "No locations match your search."}
            </p> : filteredLocations.map((location) => {
              const thumb = getLocationThumbnail(location.nameEn, location.address);
              return (
                <Button key={location.id} type="button" variant="ghost"
                  onClick={() => setSelectedLocationId(location.id)}
                  aria-pressed={selectedLocation?.id === location.id}
                  className="h-auto w-full justify-start gap-3 rounded-xl border border-nx-line bg-nx-surface p-3 text-start hover:border-nx-accent">
                  <div className="size-12 shrink-0 rounded-lg overflow-hidden bg-nx-raised border border-nx-line relative flex items-center justify-center">
                    {thumb ? (
                      <img src={thumb} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                    ) : (
                      <MapPin className="size-5 text-nx-accent" />
                    )}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-sm truncate">{isAr ? location.nameAr || location.nameEn : location.nameEn}</span>
                    {location.address && <span className="mt-0.5 block text-xs text-nx-ink-2 truncate">{location.address}</span>}
                    <span className="mt-1 block text-[10px] text-nx-ink-2">
                      {location.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "غير نشط" : "Inactive")}
                    </span>
                  </span>
                </Button>
              );
            })}
          </section>

          <section className="relative isolate overflow-hidden rounded-xl border border-nx-line bg-nx-surface p-5 lg:col-span-7 space-y-5" aria-label={isAr ? "تفاصيل الموقع" : "Location details"}>
            {selectedLocation && <>
              {/* Location Hero Header with Photography */}
              <div className="relative isolate overflow-hidden rounded-xl border border-nx-line bg-nx-raised min-h-[140px] flex items-end p-5">
                <div className="pointer-events-none absolute inset-0 z-0">
                  <img
                    src="/images/academy/backgrounds/venue-photography/football-pitch-night-hero.webp"
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover object-center opacity-75 dark:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nx-surface via-nx-surface/40 to-transparent" />
                </div>
                <div className="relative z-10 w-full flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white">{isAr ? selectedLocation.nameAr || selectedLocation.nameEn : selectedLocation.nameEn}</h2>
                    <p className="mt-0.5 text-xs text-nx-ink-2">{selectedLocation.address || (isAr ? "العنوان غير متوفر" : "Address unavailable")}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent">
                    {selectedLocation.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "غير نشط" : "Inactive")}
                  </span>
                </div>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div><dt className="text-xs text-nx-ink-2">{isAr ? "الحالة" : "Status"}</dt><dd className="font-medium">{selectedLocation.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "غير نشط" : "Inactive")}</dd></div>
                <div><dt className="text-xs text-nx-ink-2">{isAr ? "مسؤول الموقع" : "Contact Person"}</dt><dd className="font-medium">{selectedLocation.contactName || (isAr ? "غير متوفر" : "Unavailable")}</dd></div>
                <div><dt className="text-xs text-nx-ink-2">{isAr ? "رقم الهاتف" : "Contact Phone"}</dt><dd className="font-medium">{selectedLocation.contactPhone || (isAr ? "غير متوفر" : "Unavailable")}</dd></div>
                <div><dt className="text-xs text-nx-ink-2">{isAr ? "الفرع" : "Branch ID"}</dt><dd className="break-all font-mono text-xs">{selectedLocation.branchId || (isAr ? "غير محدد" : "Not specified")}</dd></div>
              </dl>
              {selectedLocation.notes && <div><h3 className="text-xs font-semibold">{isAr ? "ملاحظات تشغيلية" : "Operational Notes"}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-nx-ink-2">{selectedLocation.notes}</p></div>}
              <p className="rounded-lg border border-nx-line p-3 text-xs text-nx-ink-2">
                {selectedLocation.availabilityDisclaimer || (isAr ? "لم يتم التحقق من توفر الحجز." : "Booking availability is unverified.")}
              </p>
              <Button type="button" variant="outline" disabled={!selectedLocation.address}
                onClick={() => selectedLocation.address && window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.address)}`,
                  "_blank", "noopener,noreferrer"
                )}>
                <Navigation />{isAr ? "الاتجاهات عبر الخريطة" : "Get Directions"}
              </Button>
            </>}
          </section>
        </div>}
      </>}

      {state.isCreateOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div role="dialog" aria-modal="true" aria-labelledby="create-location-title" className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-nx-line bg-nx-surface p-6">
          <div className="flex items-center justify-between">
            <h2 id="create-location-title" className="text-lg font-bold">{isAr ? "إضافة موقع تدريب خارجي" : "Add External Training Location"}</h2>
            <Button type="button" variant="ghost" onClick={closeCreateDialog} aria-label={isAr ? "إغلاق" : "Close"}>×</Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><Label htmlFor="location-name-en">{isAr ? "الاسم بالإنجليزية" : "Name (English)"}</Label><Input id="location-name-en" required value={nameEn} onChange={(event) => setNameEn(event.target.value)} /></div>
            <div><Label htmlFor="location-name-ar">{isAr ? "الاسم بالعربية" : "Name (Arabic)"}</Label><Input id="location-name-ar" required value={nameAr} onChange={(event) => setNameAr(event.target.value)} /></div>
            <div><Label htmlFor="location-address">{isAr ? "العنوان" : "Address"}</Label><Input id="location-address" value={address} onChange={(event) => setAddress(event.target.value)} /></div>
            <div><Label htmlFor="location-contact">{isAr ? "مسؤول الموقع" : "Contact Person"}</Label><Input id="location-contact" value={contactName} onChange={(event) => setContactName(event.target.value)} /></div>
            <div><Label htmlFor="location-phone">{isAr ? "رقم الهاتف" : "Contact Phone"}</Label><Input id="location-phone" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} /></div>
            <div><Label htmlFor="location-notes">{isAr ? "ملاحظات تشغيلية" : "Operational Notes"}</Label><Textarea id="location-notes" value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
            {state.errorMessage && <p role="alert" className="text-sm text-destructive">{state.errorMessage}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeCreateDialog}>{isAr ? "إلغاء" : "Cancel"}</Button>
              <Button type="submit" disabled={state.submitting}>{isAr ? "حفظ الموقع" : "Save Location"}</Button>
            </div>
          </form>
        </div>
      </div>}
    </div>
  );
}
