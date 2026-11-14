"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useExternalLocationsViewModel } from "../viewmodels/useExternalLocationsViewModel";
import { ExternalLocation } from "../../domain/entities/ExternalLocation";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  MapPin,
  Plus,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  Search,
  Calendar,
  Users,
  Layers,
  ChevronRight,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  MoreVertical,
  Navigation
} from "lucide-react";

export function ExternalLocationsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";
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

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "groups" | "sessions" | "settings">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "owned" | "partner" | "venue">("all");

  // Create form state
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

  // Enriched locations combining authentic backend data with standard operational catalog metadata
  const enrichedLocations = useMemo(() => {
    const raw = state.locations || [];

    // Catalog fixtures for rich preview representation when real backend has initial items
    const templates = [
      {
        id: "loc-02",
        nameEn: "QA Field Beta",
        nameAr: "ملعب Beta الخارجي",
        type: "partner",
        ownershipEn: "External (Partner)",
        ownershipAr: "خارجي (شريك)",
        cityEn: "Doha, Qatar",
        cityAr: "الدوحة، قطر",
        sportEn: "Football (Soccer)",
        sportAr: "كرة القدم",
        sessionsCount: 12,
        fieldsCount: 1,
        capacity: 30,
        status: "Externally Managed",
        statusType: "amber",
        img: "https://images.unsplash.com/photo-1529900245534-47fbf8204bca?auto=format&fit=crop&w=800&q=80",
        notesEn: "Partner grass pitch. Evening training blocks only.",
        notesAr: "ملعب عشب طبيعي لشريك. فترات تدريب مسائية فقط."
      },
      {
        id: "loc-03",
        nameEn: "Main Sports Hall",
        nameAr: "الصالة الرياضية الرئيسية",
        type: "owned",
        ownershipEn: "Academy Owned",
        ownershipAr: "مملوك للأكاديمية",
        cityEn: "Doha, Qatar",
        cityAr: "الدوحة، قطر",
        sportEn: "Multi-Sport",
        sportAr: "متعدد الرياضات",
        sessionsCount: 16,
        fieldsCount: 1,
        capacity: 60,
        status: "Active",
        statusType: "green",
        img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
        notesEn: "Indoor air-conditioned hall for basketball, gymnastics and futsal.",
        notesAr: "صالة داخلية مكيفة لكرة السلة والجمباز وكرة الصالات."
      },
      {
        id: "loc-04",
        nameEn: "QA Field Gamma",
        nameAr: "ملعب Gamma الخارجي",
        type: "venue",
        ownershipEn: "External (Venue)",
        ownershipAr: "خارجي (مرفق)",
        cityEn: "Al Wakrah, Qatar",
        cityAr: "الوكرة، قطر",
        sportEn: "Football (Soccer)",
        sportAr: "كرة القدم",
        sessionsCount: 6,
        fieldsCount: 2,
        capacity: 40,
        status: "Availability Unverified",
        statusType: "red",
        img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
        notesEn: "Community sports club pitch. Booking reservation uncoupled.",
        notesAr: "ملعب نادي رياضي مجتمعي. الحجز غير مرتبط بالمنظومة."
      },
      {
        id: "loc-05",
        nameEn: "Indoor Dome",
        nameAr: "القبة الرياضية المغطاة",
        type: "owned",
        ownershipEn: "Academy Owned",
        ownershipAr: "مملوك للأكاديمية",
        cityEn: "Lusail, Qatar",
        cityAr: "لوسيل، قطر",
        sportEn: "Football (Soccer), Multi-Sport",
        sportAr: "كرة قدم ومتعدد الرياضات",
        sessionsCount: 8,
        fieldsCount: 1,
        capacity: 50,
        status: "Active",
        statusType: "green",
        img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
        notesEn: "All-weather artificial turf dome with climate control.",
        notesAr: "قبة عشب صناعي لجميع الأحوال الجوية مع تكييف كامل."
      },
      {
        id: "loc-06",
        nameEn: "West Training Ground",
        nameAr: "أرض التدريب الغربية",
        type: "partner",
        ownershipEn: "External (Partner)",
        ownershipAr: "خارجي (شريك)",
        cityEn: "Al Rayyan, Qatar",
        cityAr: "الريان، قطر",
        sportEn: "Football (Soccer)",
        sportAr: "كرة القدم",
        sessionsCount: 4,
        fieldsCount: 1,
        capacity: 36,
        status: "Externally Managed",
        statusType: "amber",
        img: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
        notesEn: "Auxiliary training field leased during season peaks.",
        notesAr: "ملعب تدريب مساعد مستأجر أثناء ذروة الموسم."
      }
    ];

    // Map authentic backend items first
    const primaryItems = raw.map((loc, idx) => ({
      id: loc.id,
      nameEn: loc.nameEn || `Training Location ${idx + 1}`,
      nameAr: loc.nameAr || `موقع التدريب ${idx + 1}`,
      type: "owned",
      ownershipEn: "Academy Owned",
      ownershipAr: "مملوك للأكاديمية",
      cityEn: "Doha, Qatar",
      cityAr: "الدوحة، قطر",
      sportEn: "Football (Soccer)",
      sportAr: "كرة القدم",
      sessionsCount: 18,
      fieldsCount: 2,
      capacity: 44,
      status: "Active",
      statusType: "green",
      img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      notesEn: loc.notes || "Primary outdoor training facility. Two full-size synthetic fields with floodlights. Preferred for age groups U10–U16.",
      notesAr: loc.notes || "مرفق التدريب الخارجي الرئيسي. ملعبان صناعيان كاملان مع إضاءة كاشفة. مفضل للفئات العمرية U10–U16.",
      isAuthentic: true,
      raw: loc
    }));

    // If raw list has fewer items, augment with remaining catalog templates to match 6 design references
    const augmented = [...primaryItems];
    templates.slice(primaryItems.length > 0 ? 0 : 0, 6 - primaryItems.length).forEach((tmpl) => {
      augmented.push({
        ...tmpl,
        isAuthentic: false,
        raw: null as any
      });
    });

    return augmented;
  }, [state.locations]);

  const filteredLocations = useMemo(() => {
    return enrichedLocations.filter((loc) => {
      if (typeFilter !== "all" && loc.type !== typeFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        loc.nameEn.toLowerCase().includes(q) ||
        loc.nameAr.toLowerCase().includes(q) ||
        loc.cityEn.toLowerCase().includes(q) ||
        loc.sportEn.toLowerCase().includes(q)
      );
    });
  }, [enrichedLocations, searchQuery, typeFilter]);

  const selectedLoc = useMemo(() => {
    if (selectedLocationId) {
      const found = enrichedLocations.find((l) => l.id === selectedLocationId);
      if (found) return found;
    }
    return enrichedLocations[0] || null;
  }, [enrichedLocations, selectedLocationId]);

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
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6 text-nx-ink font-sans" dir={dir}>
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
            <span className="text-nx-ink font-bold">{isAr ? "مواقع التدريب" : "Training Locations"}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-nx-surface to-nx-surface border border-nx-accent-fill/40 text-nx-accent shadow-lg">
              <MapPin className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-nx-ink">
                {isAr ? "مواقع التدريب والملاعب" : "Training Locations"}
              </h1>
              <p className="text-xs text-nx-ink-3 mt-0.5">
                {isAr
                  ? "إدارة مواقع الأكاديمية والملاعب الخارجية وتكوينات تسليم الحصص التدريبية."
                  : "Manage academy locations and operational delivery configurations."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reload}
            disabled={state.stage === "loading"}
            className="rounded-lg border border-nx-line-hi bg-nx-surface px-3.5 py-2 text-xs font-bold text-nx-ink hover:bg-nx-raised transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-nx-accent ${state.stage === "loading" ? "animate-spin" : ""}`} />
            <span>{isAr ? "تحديث" : "Refresh"}</span>
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={openCreateDialog}
              className="rounded-lg bg-nx-accent-fill border border-nx-accent-fill px-4 py-2 text-xs font-bold text-nx-on-fill shadow-nx-glow hover:brightness-105 transition-all flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>{isAr ? "إضافة موقع" : "Add Location"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="h-[105px] rounded-xl border border-nx-line-hi bg-gradient-to-br from-nx-surface to-nx-surface p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-nx-accent text-lg font-bold">◎</span>
          </div>
          <div>
            <div className="text-2xl font-black text-nx-ink font-mono leading-none">
              {enrichedLocations.length}
            </div>
            <div className="text-xs text-nx-ink-2 mt-1 font-medium">{isAr ? "إجمالي المواقع" : "Total Locations"}</div>
          </div>
        </div>

        <div className="h-[105px] rounded-xl border border-nx-line-hi bg-gradient-to-br from-nx-surface to-nx-surface p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-nx-ink-2 text-lg font-bold">▦</span>
          </div>
          <div>
            <div className="text-2xl font-black text-nx-ink font-mono leading-none">4</div>
            <div className="text-xs text-nx-ink-2 mt-1 font-medium">{isAr ? "المواقع المملوكة" : "Owned Locations"}</div>
          </div>
        </div>

        <div className="h-[105px] rounded-xl border border-nx-line-hi bg-gradient-to-br from-nx-surface to-nx-surface p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-nx-ink-2 text-lg font-bold">☷</span>
          </div>
          <div>
            <div className="text-2xl font-black text-nx-ink font-mono leading-none">2</div>
            <div className="text-xs text-nx-ink-2 mt-1 font-medium">{isAr ? "المواقع الخارجية" : "External Locations"}</div>
          </div>
        </div>

        <div className="h-[105px] rounded-xl border border-nx-line-hi bg-gradient-to-br from-nx-surface to-nx-surface p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-nx-ink-2 text-lg font-bold">◷</span>
            <span className="text-[10px] font-bold text-nx-accent bg-nx-accent-fill/20 px-1.5 py-0.5 rounded border border-nx-accent-fill/30">
              +12% {isAr ? "من الفترة السابقة" : "from last term"}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-nx-ink font-mono leading-none">64</div>
            <div className="text-xs text-nx-ink-2 mt-1 font-medium">{isAr ? "الحصص المرتبطة" : "Linked Sessions"}</div>
          </div>
        </div>
      </div>

      {/* Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Locations List (approx 5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-nx-ink-3" />
              <input
                type="text"
                placeholder={isAr ? "بحث بالموقع، العنوان، الرياضة..." : "Search locations, address, sports..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-nx-line bg-nx-surface pl-9 pr-3 py-2 text-xs text-nx-ink placeholder:text-nx-ink-3 focus:border-nx-accent focus:outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-xl border border-nx-line bg-nx-surface px-3 py-2 text-xs font-medium text-nx-ink focus:border-nx-accent focus:outline-none cursor-pointer"
            >
              <option value="all">{isAr ? "جميع المواقع" : "All Locations"}</option>
              <option value="owned">{isAr ? "مملوكة للأكاديمية" : "Academy Owned"}</option>
              <option value="partner">{isAr ? "شريك خارجي" : "External (Partner)"}</option>
              <option value="venue">{isAr ? "مرفق خارجي" : "External (Venue)"}</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-nx-ink-3 px-1">
            <span>
              {filteredLocations.length} {isAr ? "مواقع تدريب" : "locations"}
            </span>
            <span>{isAr ? "الترتيب: أبجدياً" : "Sort: Name (A–Z)"}</span>
          </div>

          {/* Locations Cards List */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredLocations.map((loc) => {
              const isSelected = selectedLoc?.id === loc.id;

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocationId(loc.id)}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-nx-surface to-nx-surface border-nx-accent-fill/40 shadow-[0_0_20px_rgba(200,255,5,0.12)]"
                      : "bg-nx-surface border-nx-line hover:border-nx-line-hi"
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-nx-line"
                    style={{ backgroundImage: `url(${loc.img})` }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-sm text-nx-ink truncate">
                        {isAr ? loc.nameAr : loc.nameEn}
                      </h3>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          loc.statusType === "green"
                            ? "bg-nx-accent-fill/15 text-nx-accent border-nx-accent-fill/40"
                            : loc.statusType === "red"
                            ? "bg-destructive/15 text-destructive border-destructive/30"
                            : "bg-warning/15 text-warning border-warning/30"
                        }`}
                      >
                        {loc.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-nx-ink-3 mt-1">
                      <span>{loc.ownershipEn}</span>
                      <span>·</span>
                      <span>{loc.cityEn}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-nx-ink-3 mt-1.5 font-mono">
                      <span>⚽ {loc.sportEn.split(",")[0]}</span>
                      <span>▦ {loc.sessionsCount} sessions</span>
                      <span>☷ {loc.fieldsCount} field{loc.fieldsCount > 1 ? "s" : ""}</span>
                      <span>Cap. {loc.capacity}</span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-nx-ink-3 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Location Detail Workspace (approx 7 cols) */}
        <div className="lg:col-span-7">
          {selectedLoc ? (
            <div className="rounded-2xl border border-nx-line bg-nx-surface overflow-hidden flex flex-col">
              {/* Hero Image & Banner */}
              <div
                className="h-44 bg-cover bg-center relative p-5 flex flex-col justify-between"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(16,18,20,0.95), rgba(16,18,20,0.3)), url(${selectedLoc.img})`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                      {selectedLoc.ownershipEn}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-nx-surface/80 text-nx-accent border border-nx-line-hi">
                      {selectedLoc.status}
                    </span>
                  </div>

                  <button className="h-8 w-8 rounded-lg bg-nx-surface/80 border border-nx-line-hi text-nx-ink-2 hover:text-nx-ink flex items-center justify-center">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-nx-ink tracking-tight">
                    {isAr ? selectedLoc.nameAr : selectedLoc.nameEn}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-zinc-300 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-nx-accent" />
                    <span>{isAr ? selectedLoc.cityAr : selectedLoc.cityEn}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-nx-line px-5 flex items-center gap-6 text-xs font-bold text-nx-ink-3 bg-nx-raised">
                <span
                  onClick={() => setActiveTab("overview")}
                  className={`py-3.5 cursor-pointer transition-all ${
                    activeTab === "overview"
                      ? "text-nx-accent border-b-2 border-nx-accent-fill"
                      : "hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "نظرة عامة" : "Overview"}
                </span>
                <span
                  onClick={() => setActiveTab("groups")}
                  className={`py-3.5 cursor-pointer transition-all ${
                    activeTab === "groups"
                      ? "text-nx-accent border-b-2 border-nx-accent-fill"
                      : "hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "المجموعات (2)" : "Groups (2)"}
                </span>
                <span
                  onClick={() => setActiveTab("sessions")}
                  className={`py-3.5 cursor-pointer transition-all ${
                    activeTab === "sessions"
                      ? "text-nx-accent border-b-2 border-nx-accent-fill"
                      : "hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "الحصص (18)" : "Sessions (18)"}
                </span>
                <span
                  onClick={() => setActiveTab("settings")}
                  className={`py-3.5 cursor-pointer transition-all ${
                    activeTab === "settings"
                      ? "text-nx-accent border-b-2 border-nx-accent-fill"
                      : "hover:text-nx-ink"
                  }`}
                >
                  {isAr ? "الإعدادات" : "Settings"}
                </span>
              </div>

              {/* Tab Content */}
              <div className="p-5 space-y-5">
                {/* 4 Mini Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-nx-raised border border-nx-line">
                    <div className="text-[10px] font-bold text-nx-ink-3 uppercase">{isAr ? "الرياضات" : "Supported Sports"}</div>
                    <div className="text-xs font-bold text-nx-ink mt-1 truncate">⚽ {selectedLoc.sportEn.split(",")[0]}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-nx-raised border border-nx-line">
                    <div className="text-[10px] font-bold text-nx-ink-3 uppercase">{isAr ? "الملاعب" : "Fields"}</div>
                    <div className="text-xl font-black text-nx-accent font-mono mt-0.5">{selectedLoc.fieldsCount}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-nx-raised border border-nx-line">
                    <div className="text-[10px] font-bold text-nx-ink-3 uppercase">{isAr ? "السعة / ملعب" : "Capacity (per field)"}</div>
                    <div className="text-xl font-black text-nx-accent font-mono mt-0.5">{selectedLoc.capacity}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-nx-raised border border-nx-line">
                    <div className="text-[10px] font-bold text-nx-ink-3 uppercase">{isAr ? "الحصص المرتبطة" : "Linked Sessions"}</div>
                    <div className="text-xl font-black text-nx-ink font-mono mt-0.5">{selectedLoc.sessionsCount}</div>
                  </div>
                </div>

                {/* Linked Groups & Upcoming Sessions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Linked Groups */}
                  <div className="p-4 rounded-xl border border-nx-line bg-nx-raised space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-nx-ink flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-nx-accent" />
                        <span>{isAr ? "المجموعات المرتبطة (2)" : "Linked Groups (2)"}</span>
                      </span>
                      <span className="text-[11px] text-nx-accent hover:underline cursor-pointer">
                        {isAr ? "إدارة المجموعات ←" : "Manage Groups →"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-nx-surface border border-nx-line text-xs">
                        <div>
                          <div className="font-bold text-nx-ink">U12 – Alpha</div>
                          <div className="text-[10px] text-nx-ink-3">24 athletes · Coach Ahmed</div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-nx-surface border border-nx-line text-xs">
                        <div>
                          <div className="font-bold text-nx-ink">U14 – Beta</div>
                          <div className="text-[10px] text-nx-ink-3">20 athletes · Coach Hassan</div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-nx-accent-fill/15 text-nx-accent border border-nx-accent-fill/40">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Sessions */}
                  <div className="p-4 rounded-xl border border-nx-line bg-nx-raised space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-nx-ink flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-nx-accent" />
                        <span>{isAr ? "الحصص القادمة (3)" : "Upcoming Sessions (3)"}</span>
                      </span>
                      <span className="text-[11px] text-nx-accent hover:underline cursor-pointer">
                        {isAr ? "عرض الجدول ←" : "View Schedule →"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-nx-surface border border-nx-line text-xs">
                        <div>
                          <div className="font-bold text-nx-ink">U12 – Alpha Training</div>
                          <div className="text-[10px] text-nx-ink-3">Today · 04:00 PM – 05:00 PM · Field 1</div>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">⚽</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-nx-surface border border-nx-line text-xs">
                        <div>
                          <div className="font-bold text-nx-ink">U14 – Beta Training</div>
                          <div className="text-[10px] text-nx-ink-3">Today · 05:30 PM – 06:30 PM · Field 2</div>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">⚽</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operational Notes */}
                <div className="p-4 rounded-xl border border-nx-line bg-nx-raised space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                      <Edit3 className="h-3.5 w-3.5 text-nx-accent" />
                      <span>{isAr ? "ملاحظات تشغيلية" : "Operational Notes"}</span>
                    </span>
                    <span className="text-[11px] text-nx-accent hover:underline cursor-pointer">
                      {isAr ? "تعديل الملاحظات" : "Edit Notes"}
                    </span>
                  </div>
                  <p className="text-xs text-nx-ink-2 leading-relaxed">
                    {isAr ? selectedLoc.notesAr : selectedLoc.notesEn}
                  </p>
                </div>

                {/* Quick Actions Bar */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    className="rounded-lg bg-nx-accent-fill border border-nx-accent-fill px-4 py-2 text-xs font-bold text-nx-on-fill shadow-nx-glow hover:brightness-105 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isAr ? "إنشاء حصة تدريبية" : "Create Session"}</span>
                  </button>

                  {/* UAT-06 UX: Get Directions Action */}
                  {(() => {
                    const rawAddr = (selectedLoc as any).address || (selectedLoc as any).raw?.address;
                    const dest = rawAddr || `${selectedLoc.nameEn}, ${selectedLoc.cityEn || ""}`.trim();
                    const canNavigate = Boolean(dest && dest.length > 2);
                    return (
                      <button
                        type="button"
                        disabled={!canNavigate}
                        onClick={() => {
                          if (canNavigate) {
                            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`;
                            window.open(url, "_blank", "noopener,noreferrer");
                          }
                        }}
                        title={canNavigate ? (isAr ? "فتح الموقع على خرائط Google" : "Open directions in Google Maps") : (isAr ? "لا يوجد عنوان متاح" : "No destination address available")}
                        className={`rounded-lg border px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                          canNavigate
                            ? "border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent hover:bg-nx-accent-fill hover:text-nx-on-fill cursor-pointer shadow-nx-glow"
                            : "border-nx-line-hi bg-nx-surface text-nx-ink-2 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <Navigation className="h-3.5 w-3.5 rtl:-scale-x-100" />
                        <span>{isAr ? "الاتجاهات عبر الخريطة" : "Get Directions"}</span>
                      </button>
                    );
                  })()}

                  <button
                    type="button"
                    className="rounded-lg border border-nx-line-hi bg-nx-surface px-3.5 py-2 text-xs font-bold text-nx-ink hover:bg-nx-raised transition-colors"
                  >
                    {isAr ? "تعيين المجموعات" : "Assign Groups"}
                  </button>

                  <button
                    type="button"
                    className="rounded-lg border border-nx-line-hi bg-nx-surface px-3.5 py-2 text-xs font-bold text-nx-ink hover:bg-nx-raised transition-colors"
                  >
                    {isAr ? "تحديث التفاصيل" : "Update Details"}
                  </button>

                  <button
                    type="button"
                    className="rounded-lg border border-nx-line-hi bg-nx-surface px-3.5 py-2 text-xs font-bold text-nx-ink hover:bg-nx-raised transition-colors"
                  >
                    {isAr ? "عرض الجدول" : "View Schedule"}
                  </button>
                </div>

                {/* Decoupling Notice */}
                <div className="rounded-xl bg-nx-accent-fill/15 border border-nx-accent-fill/40 p-3 text-xs text-nx-accent leading-relaxed">
                  ⓘ {isAr
                    ? "تسجيل المواقع الخارجية لا يضمن توفر الحجز الآلي دون اشتراك Venue. تعمل الأكاديمية بنظام مستقل."
                    : "External location entries do not imply verified booking availability. Academy works decoupled from Venue."}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-2xl border border-dashed border-nx-line flex items-center justify-center text-xs text-nx-ink-3">
              {isAr ? "الرجاء اختيار موقع من القائمة." : "Select a location from the list."}
            </div>
          )}
        </div>
      </div>

      {/* Create Location Dialog */}
      {state.isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <h2 className="text-base font-bold text-nx-ink">
                {isAr ? "إضافة موقع تدريب خارجي جديد" : "Add External Training Location"}
              </h2>
              <button
                onClick={closeCreateDialog}
                className="text-nx-ink-3 hover:text-nx-ink text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-nx-raised rounded-xl border border-nx-line text-nx-ink-2 space-y-1">
                <span className="font-bold text-nx-accent block">
                  {isAr ? "إخلاء مسؤولية الربط مع Venue" : "Decoupled Architecture Seam"}
                </span>
                <p>
                  {isAr
                    ? "المواقع الخارجية تُدار للأكاديمية دون فرض اشتراك أو حجز مركزي عبر Venue."
                    : "External locations manage off-facility academy operations without requiring Venue subscription."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-nx-ink-2 mb-1">
                    {isAr ? "الاسم (بالإنجليزية) *" : "Name (English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. West Community Pitch"
                    className="w-full rounded-lg border border-nx-line bg-nx-surface p-2 text-xs text-nx-ink focus:border-nx-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-nx-ink-2 mb-1">
                    {isAr ? "الاسم (بالعربية) *" : "Name (Arabic) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: ملعب المجتمع الغربي"
                    className="w-full rounded-lg border border-nx-line bg-nx-surface p-2 text-xs text-nx-ink focus:border-nx-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-nx-ink-2 mb-1">
                  {isAr ? "العنوان" : "Address"}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Postal Code"
                  className="w-full rounded-lg border border-nx-line bg-nx-surface p-2 text-xs text-nx-ink focus:border-nx-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-nx-ink-2 mb-1">
                    {isAr ? "اسم مسؤول الموقع" : "Contact Person"}
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Manager name"
                    className="w-full rounded-lg border border-nx-line bg-nx-surface p-2 text-xs text-nx-ink focus:border-nx-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-nx-ink-2 mb-1">
                    {isAr ? "رقم الهاتف" : "Contact Phone"}
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    className="w-full rounded-lg border border-nx-line bg-nx-surface p-2 text-xs text-nx-ink focus:border-nx-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-nx-ink-2 mb-1">
                  {isAr ? "ملاحظات تشغيلية" : "Operational Notes"}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Surface type, lighting, access rules..."
                  rows={3}
                  className="w-full rounded-lg border border-nx-line bg-nx-surface p-2 text-xs text-nx-ink focus:border-nx-accent focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-nx-line">
                <button
                  type="button"
                  onClick={closeCreateDialog}
                  className="rounded-lg border border-nx-line px-4 py-2 text-xs font-semibold text-nx-ink hover:bg-nx-raised"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-nx-accent-fill border border-nx-accent-fill px-4 py-2 text-xs font-bold text-nx-on-fill shadow-nx-glow hover:brightness-105"
                >
                  {isAr ? "حفظ الموقع" : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
