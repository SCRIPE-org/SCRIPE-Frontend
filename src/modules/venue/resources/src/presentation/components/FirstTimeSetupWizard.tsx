"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription } from "@core/ui/alert";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  User,
  Users,
  AlertCircle,
  FileCheck,
  RotateCcw,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { Facility } from "@modules/venue/facility/src/domain/entities/Facility";
import type {
  CourtCreationResult,
  CourtSetupItem,
  FirstTimeSetupInput,
} from "../../domain/entities/ResourceWorkspaceItem";
import { mapVenueError } from "@modules/venue/shared/src/utils/venueErrorMapper";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: FirstTimeSetupInput) => Promise<boolean>;
  submitting: boolean;
  errorMessage?: string | null;
  facilities?: Facility[];
  lastResults?: CourtCreationResult[];
}

const COMMON_TIMEZONES = [
  "Africa/Cairo",
  "Asia/Riyadh",
  "Asia/Dubai",
  "UTC",
  "Europe/London",
  "America/New_York",
];

const SPORT_TYPES = [
  "Padel",
  "Football",
  "Tennis",
  "Basketball",
  "Squash",
  "Swimming",
  "Volleyball",
];

export function FirstTimeSetupWizard({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  errorMessage,
  facilities = [],
  lastResults = [],
}: Props) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [step, setStep] = useState<number>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [managementMode, setManagementMode] = useState<"solo" | "team">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("scripe_venue_management_mode");
      if (saved === "team" || saved === "solo") return saved;
    }
    return "solo";
  });

  const handleSelectManagementMode = (mode: "solo" | "team") => {
    setManagementMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("scripe_venue_management_mode", mode);
      window.dispatchEvent(new Event("venue-management-mode-changed"));
    }
  };

  const [facilityMode, setFacilityMode] = useState<"existing" | "new">(() => {
    return facilities.length > 0 ? "existing" : "new";
  });
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(() => {
    return facilities.length > 0 ? facilities[0].id : "";
  });
  const [branchName, setBranchName] = useState(() => {
    return facilities.length > 0 ? facilities[0].name : "Nasr City";
  });
  const [timeZoneId, setTimeZoneId] = useState("Africa/Cairo");
  const [sportType, setSportType] = useState("Padel");
  const [courtItems, setCourtItems] = useState<CourtSetupItem[]>([
    { clientKey: "court-0", name: "Padel Court 1" },
    { clientKey: "court-1", name: "Padel Court 2" },
    { clientKey: "court-2", name: "Padel Court 3" },
  ]);
  const [isOpen247, setIsOpen247] = useState(true);
  const [opensAt, setOpensAt] = useState("08:00");
  const [closesAt, setClosesAt] = useState("00:00");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [pricePerSlot, setPricePerSlot] = useState(800);
  const [currencyCode, setCurrencyCode] = useState("EGP");
  const [finished, setFinished] = useState(false);
  const [partialResults, setPartialResults] = useState<CourtCreationResult[]>([]);

  const DRAFT_STORAGE_KEY = "scripe_venue_wizard_draft";

  // Restore draft from sessionStorage on mount (preserving resource IDs across browser refresh)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.courtItems) && parsed.courtItems.length > 0) {
          setCourtItems(parsed.courtItems);
          if (parsed.branchName) setBranchName(parsed.branchName);
          if (parsed.sportType) setSportType(parsed.sportType);
          if (parsed.selectedFacilityId) setSelectedFacilityId(parsed.selectedFacilityId);
          if (parsed.facilityMode) setFacilityMode(parsed.facilityMode);
          if (parsed.slotDurationMinutes) setSlotDurationMinutes(parsed.slotDurationMinutes);
          if (parsed.pricePerSlot) setPricePerSlot(parsed.pricePerSlot);
          if (parsed.currencyCode) setCurrencyCode(parsed.currencyCode);
          if (parsed.isOpen247 !== undefined) setIsOpen247(parsed.isOpen247);
          const hasUncompleted = parsed.courtItems.some((c: any) => !c.success);
          if (hasUncompleted) {
            setStep(3);
          }
        }
      }
    } catch {
      // sessionStorage fallback
    }
  }, []);

  const addCourt = () => {
    const nextIdx = courtItems.length + 1;
    setCourtItems([
      ...courtItems,
      { clientKey: `court-${Date.now()}-${nextIdx}`, name: `${sportType} Court ${nextIdx}` },
    ]);
  };

  const updateCourt = (index: number, val: string) => {
    const updated = [...courtItems];
    updated[index] = { ...updated[index], name: val };
    setCourtItems(updated);
  };

  const removeCourt = (index: number) => {
    if (courtItems.length <= 1) return;
    setCourtItems(courtItems.filter((_, i) => i !== index));
  };

  const handleFinish = async (publishImmediately: boolean = true) => {
    setSubmitError(null);
    try {
      const activeCourtItems = courtItems.filter((c) => c.name.trim().length > 0);
      const effectiveFacilityId =
        facilityMode === "existing" && selectedFacilityId ? selectedFacilityId : undefined;
      const effectiveBranchName =
        facilityMode === "existing" && selectedFacilityId
          ? facilities.find((f) => f.id === selectedFacilityId)?.name || branchName.trim()
          : branchName.trim() || "Main Branch";

      const legacyCourtNames = activeCourtItems.map((c) => c.name.trim());
      const legacyResourceMap: Record<string, string> = {};
      for (const c of activeCourtItems) {
        if (c.resourceId) {
          legacyResourceMap[c.name.trim()] = c.resourceId;
        }
      }

      const success = await onSubmit({
        branchName: effectiveBranchName,
        facilityId: effectiveFacilityId,
        timeZoneId,
        sportType,
        courts: legacyCourtNames,
        courtItems: activeCourtItems,
        isOpen247,
        customWorkingHours: isOpen247
          ? undefined
          : {
              opensAt,
              closesAt,
              days: [0, 1, 2, 3, 4, 5, 6],
            },
        slotDurationMinutes,
        startIncrementMinutes: slotDurationMinutes,
        pricePerSlot,
        currencyCode,
        publishImmediately,
        existingCourtResources: legacyResourceMap,
      });

      if (success) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        }
        setFinished(true);
        setStep(4);
      } else {
        if (lastResults && lastResults.length > 0) {
          setPartialResults(lastResults);
          // Identity-safe update of courtItems with returned server resource IDs and step statuses
          const updatedItems = activeCourtItems.map((item, idx) => {
            const res = lastResults[idx] || lastResults.find((r) => r.name === item.name);
            if (res) {
              return {
                ...item,
                resourceId: res.resourceId || item.resourceId,
                isCalendarSaved: res.isCalendarSaved ?? item.isCalendarSaved,
                isPublished: res.isPublished ?? item.isPublished,
                isPriceConfigured: res.isPriceConfigured ?? item.isPriceConfigured,
                stepFailed: res.stepFailed,
                error: res.error,
                success: res.success,
              };
            }
            return item;
          });
          setCourtItems(updatedItems);

          // Persist draft across refresh
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(
                DRAFT_STORAGE_KEY,
                JSON.stringify({
                  branchName: effectiveBranchName,
                  selectedFacilityId: effectiveFacilityId,
                  facilityMode,
                  timeZoneId,
                  sportType,
                  courtItems: updatedItems,
                  isOpen247,
                  slotDurationMinutes,
                  pricePerSlot,
                  currencyCode,
                })
              );
            } catch {
              // quota / storage failure fallback
            }
          }
        }
        setSubmitError(
          errorMessage ||
            (isRtl
              ? "تعذر إكمال بعض أو كل خطوات الإعداد. يرجى مراجعة التفاصيل أدناه."
              : "Unable to complete all court setup steps. Check the details below.")
        );
      }
    } catch (err: unknown) {
      const safe = mapVenueError(err, isRtl ? "ar" : "en");
      setSubmitError(safe.message);
    }
  };

  const retryFailedCourts = () => {
    // Only retry the items that are not yet completely successful
    const failedItems = courtItems.filter((c) => !c.success);
    if (failedItems.length > 0) {
      setCourtItems(failedItems);
    }
    setSubmitError(null);
    setStep(3);
  };

  const resetAndClose = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    setStep(1);
    setSubmitError(null);
    setFinished(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-6" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader className="border-b border-nx-line pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#C6FF00]/20 text-[#0D0D0E] dark:text-[#C6FF00]">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-nx-ink">
                {t("resources.wizard.title", { defaultValue: "Venue First-Time Setup" })}
              </DialogTitle>
              <p className="text-xs text-nx-ink-2">
                {t("resources.wizard.subtitle", {
                  defaultValue: "Complete your venue configuration in 3 simple steps.",
                })}
              </p>
            </div>
          </div>

          {/* Stepper Progress Bar (Exact 3 Steps) */}
          {!finished && (
            <div className="flex items-center justify-between gap-1.5 mt-4 text-[11px] font-semibold text-nx-ink-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 text-center py-1.5 border-b-2 transition-colors ${
                    step === s
                      ? "border-[#C6FF00] text-nx-ink font-bold"
                      : step > s
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "border-nx-line text-nx-ink-3"
                  }`}
                >
                  {s === 1 && t("resources.wizard.step1", { defaultValue: "1. WHERE" })}
                  {s === 2 && t("resources.wizard.step2", { defaultValue: "2. WHAT" })}
                  {s === 3 && t("resources.wizard.step3", { defaultValue: "3. WHEN & HOW MUCH" })}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* STEP 1: WHERE (Facility / Location Context) */}
        {step === 1 && (
          <div className="space-y-4 py-3">
            {/* Explicit Mode Selector if authorized facilities exist */}
            {facilities.length > 0 && (
              <div className="flex rounded-lg border border-nx-line p-1 bg-nx-raised/40 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setFacilityMode("existing");
                    if (facilities.length > 0) {
                      setSelectedFacilityId(facilities[0].id);
                      setBranchName(facilities[0].name);
                    }
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                    facilityMode === "existing"
                      ? "bg-[#C6FF00] text-[#0D0D0E] shadow-xs"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {t("resources.wizard.useExistingFacility", { defaultValue: "Select Existing Facility" })}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFacilityMode("new");
                    setSelectedFacilityId("");
                    setBranchName("");
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                    facilityMode === "new"
                      ? "bg-[#C6FF00] text-[#0D0D0E] shadow-xs"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {t("resources.wizard.createNewFacility", { defaultValue: "Create New Facility" })}
                </button>
              </div>
            )}

            {/* Existing Authorized Facilities Picker */}
            {facilityMode === "existing" && facilities.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-nx-ink">
                  {t("resources.wizard.authorizedFacility", { defaultValue: "Authorized Facility / Location" })}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {facilities.map((fac) => (
                    <button
                      type="button"
                      key={fac.id}
                      onClick={() => {
                        setSelectedFacilityId(fac.id);
                        setBranchName(fac.name);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedFacilityId === fac.id
                          ? "border-[#C6FF00] bg-[#C6FF00]/10 ring-1 ring-[#C6FF00] font-semibold"
                          : "border-nx-line bg-nx-surface hover:bg-nx-raised"
                      }`}
                    >
                      <p className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-nx-ink-3" />
                        <span>{fac.name}</span>
                      </p>
                      <p className="text-[10px] text-nx-ink-3 mt-0.5">{fac.code || "Standard Branch"}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* New Facility Name Input */}
            {facilityMode === "new" && (
              <div className="space-y-2">
                <Label htmlFor="wizard-branch" className="text-sm font-semibold">
                  {t("resources.wizard.branchName", { defaultValue: "Facility / Location Name" })}
                </Label>
                <Input
                  id="wizard-branch"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder={t("resources.wizard.branchPlaceholder", {
                    defaultValue: "e.g. Nasr City Club - Main Center",
                  })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="wizard-tz" className="text-sm font-semibold">
                {t("resources.wizard.timezone", { defaultValue: "Timezone" })}
              </Label>
              <select
                id="wizard-tz"
                className="w-full rounded-nx-md border border-nx-line bg-nx-surface px-3 py-2 text-xs font-medium text-nx-ink"
                value={timeZoneId}
                onChange={(e) => setTimeZoneId(e.target.value)}
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-nx-line/60">
              <Label className="text-sm font-semibold">
                {t("resources.wizard.managementMode", { defaultValue: "Who will manage this venue?" })}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectManagementMode("solo")}
                  className={`p-2.5 rounded-nx-md border text-left transition-all ${
                    managementMode === "solo"
                      ? "border-[#C6FF00] bg-[#C6FF00]/10 ring-1 ring-[#C6FF00]"
                      : "border-nx-line hover:bg-nx-surfaceSubtle"
                  }`}
                >
                  <p className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                    <User className="size-3.5 text-nx-accent" aria-hidden="true" />
                    <span>{t("resources.wizard.justMe", { defaultValue: "Just me" })}</span>
                  </p>
                  <p className="text-[10px] text-nx-ink-2 mt-0.5">
                    {t("resources.wizard.justMeHelp", { defaultValue: "Operate everything directly. Simple & fast." })}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectManagementMode("team")}
                  className={`p-2.5 rounded-nx-md border text-left transition-all ${
                    managementMode === "team"
                      ? "border-[#C6FF00] bg-[#C6FF00]/10 ring-1 ring-[#C6FF00]"
                      : "border-nx-line hover:bg-nx-surfaceSubtle"
                  }`}
                >
                  <p className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                    <Users className="size-3.5 text-nx-accent" aria-hidden="true" />
                    <span>{t("resources.wizard.team", { defaultValue: "Me and my team" })}</span>
                  </p>
                  <p className="text-[10px] text-nx-ink-2 mt-0.5">
                    {t("resources.wizard.teamHelp", { defaultValue: "Invite managers and receptionists in Settings." })}
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Courts & Spaces */}
        {step === 2 && (
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t("resources.wizard.sportTypeLabel", { defaultValue: "Type" })}
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {SPORT_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      setSportType(type);
                      setCourtItems(courtItems.map((c, i) => ({ ...c, name: `${type} Court ${i + 1}` })));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      sportType === type
                        ? "bg-[#C6FF00] text-[#0D0D0E] shadow-xs"
                        : "bg-nx-surface border border-nx-line text-nx-ink hover:bg-nx-raised"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t("resources.wizard.courtsLabel", { defaultValue: "Courts & Spaces to Add" })}
              </Label>
              <p className="text-xs text-nx-ink-3">
                {t("resources.wizard.courtsHelp", {
                  defaultValue: "Add the names of the courts or spaces you operate.",
                })}
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {courtItems.map((courtItem, index) => (
                  <div key={courtItem.clientKey || index} className="flex items-center gap-2">
                    <Input
                      value={courtItem.name}
                      onChange={(e) => updateCourt(index, e.target.value)}
                      placeholder={t("resources.wizard.courtPlaceholder", {
                        defaultValue: "Name (e.g. Padel Court 1)",
                      })}
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCourt(index)}
                      disabled={courtItems.length <= 1}
                      className="h-8 w-8 p-0 text-nx-ink-3 hover:text-destructive"
                      aria-label="Remove court"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCourt}
                className="mt-2 text-xs gap-1"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                <span>{t("resources.wizard.addMoreCourts", { defaultValue: "+ Add Another Court / Space" })}</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: WHEN & HOW MUCH (Operating Schedule, Slot Duration, Pricing, and Review) */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Operating Schedule & Booking Slot Duration */}
              <div className="space-y-4">
                {/* 1. Operating Schedule */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-nx-ink-3">
                    {t("resources.workingHours.mode", { defaultValue: "1. Operating Schedule" })}
                  </Label>

                  <div className="space-y-2">
                    {/* Option A: Open 24/7 */}
                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        isOpen247
                          ? "border-[#C6FF00] bg-[#C6FF00]/10 ring-1 ring-[#C6FF00]"
                          : "border-nx-line bg-nx-surface hover:bg-nx-surfaceSubtle"
                      }`}
                    >
                      <input
                        type="radio"
                        name="working-hours-mode"
                        checked={isOpen247}
                        onChange={() => setIsOpen247(true)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                          <Clock className="size-3.5 text-nx-accent" aria-hidden="true" />
                          <span>{t("resources.workingHours.open247", { defaultValue: "Open 24 Hours (24/7)" })}</span>
                        </p>
                        <p className="text-[10px] text-nx-ink-2 mt-0.5">
                          {t("resources.workingHours.open247Description", {
                            defaultValue: "Open all day and night every day of the week.",
                          })}
                        </p>
                      </div>
                    </label>

                    {/* Option B: Custom Hours */}
                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        !isOpen247
                          ? "border-[#C6FF00] bg-[#C6FF00]/10 ring-1 ring-[#C6FF00]"
                          : "border-nx-line bg-nx-surface hover:bg-nx-surfaceSubtle"
                      }`}
                    >
                      <input
                        type="radio"
                        name="working-hours-mode"
                        checked={!isOpen247}
                        onChange={() => setIsOpen247(false)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                          <Building2 className="size-3.5 text-nx-ink-2" aria-hidden="true" />
                          <span>{t("resources.workingHours.custom", { defaultValue: "Custom Working Hours" })}</span>
                        </p>
                        <p className="text-[10px] text-nx-ink-2 mt-0.5">
                          {t("resources.workingHours.customDescription", {
                            defaultValue: "Specify daily opening and closing hours.",
                          })}
                        </p>

                        {!isOpen247 && (
                          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-nx-line/60">
                            <div>
                              <Label className="text-[10px] text-nx-ink-3">
                                {t("resources.workingHours.openTime", { defaultValue: "Opens At" })}
                              </Label>
                              <Input
                                type="time"
                                value={opensAt}
                                onChange={(e) => setOpensAt(e.target.value)}
                                className="h-7 text-xs mt-0.5"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-nx-ink-3">
                                {t("resources.workingHours.closeTime", { defaultValue: "Closes At" })}
                              </Label>
                              <Input
                                type="time"
                                value={closesAt}
                                onChange={(e) => setClosesAt(e.target.value)}
                                className="h-7 text-xs mt-0.5"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* 2. Booking Slot Duration */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-nx-ink-3">
                    {t("resources.bookingRules.slotDuration", { defaultValue: "2. Booking Slot Duration" })}
                  </Label>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { duration: 30, label: "30 min" },
                      { duration: 60, label: "60 min (Standard)" },
                      { duration: 90, label: "90 min" },
                      { duration: 120, label: "120 min (2h)" },
                    ].map(({ duration, label }) => (
                      <button
                        type="button"
                        key={duration}
                        onClick={() => setSlotDurationMinutes(duration)}
                        className={`p-2 rounded-xl border text-left rtl:text-right transition-all ${
                          slotDurationMinutes === duration
                            ? "border-[#C6FF00] bg-[#C6FF00]/10 font-bold text-nx-ink ring-1 ring-[#C6FF00]"
                            : "border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink-2"
                        }`}
                      >
                        <p className="text-xs font-semibold">{label}</p>
                        <p className="text-[10px] text-nx-ink-3">Every {duration}m</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing & Configuration Review */}
              <div className="space-y-4">
                {/* 3. Pricing */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-nx-ink-3">
                    {t("resources.pricing.title", { defaultValue: "3. Pricing" })}
                  </Label>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="wizard-price" className="text-[11px] font-medium text-nx-ink-2">
                        {t("resources.pricing.pricePerSlot", { defaultValue: "Price per Slot" })}
                      </Label>
                      <div className="relative">
                        <Input
                          id="wizard-price"
                          type="number"
                          min={0}
                          step={10}
                          value={pricePerSlot}
                          onChange={(e) => setPricePerSlot(Number(e.target.value) || 0)}
                          className="pr-12 rtl:pr-3 rtl:pl-12 text-sm font-semibold h-9"
                        />
                        <span className="absolute right-3 rtl:right-auto rtl:left-3 top-2 text-xs font-bold text-nx-ink-3">
                          {currencyCode}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="wizard-currency" className="text-[11px] font-medium text-nx-ink-2">
                        {t("resources.pricing.currency", { defaultValue: "Currency" })}
                      </Label>
                      <select
                        id="wizard-currency"
                        className="w-full h-9 rounded-nx-md border border-nx-line bg-nx-surface px-2.5 text-xs font-semibold text-nx-ink"
                        value={currencyCode}
                        onChange={(e) => setCurrencyCode(e.target.value)}
                      >
                        <option value="EGP">EGP (Egyptian Pound)</option>
                        <option value="SAR">SAR (Saudi Riyal)</option>
                        <option value="AED">AED (UAE Dirham)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Configuration Review Summary */}
                <div className="p-3 rounded-xl border border-nx-border bg-nx-raised/40 text-xs space-y-2">
                  <span className="font-bold text-nx-ink text-[11px] uppercase tracking-wider">
                    Configuration Review
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-nx-ink-2">
                    <div>
                      <span className="text-nx-ink-3">Facility: </span>
                      <span className="font-semibold text-nx-ink truncate block">{branchName}</span>
                    </div>
                    <div>
                      <span className="text-nx-ink-3">Sport: </span>
                      <span className="font-semibold text-nx-ink truncate block">{sportType}</span>
                    </div>
                    <div>
                      <span className="text-nx-ink-3">Courts: </span>
                      <span className="font-semibold text-nx-ink block">{courtItems.length} spaces</span>
                    </div>
                    <div>
                      <span className="text-nx-ink-3">Rate: </span>
                      <span className="font-semibold text-nx-ink block">{pricePerSlot} {currencyCode} / {slotDurationMinutes}m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(submitError || errorMessage) && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="size-4" aria-hidden="true" />
                <AlertDescription className="text-xs font-medium">
                  {submitError || errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Partial Failure Breakdown & Safe Retry */}
            {partialResults.length > 0 && partialResults.some((r) => !r.success) && (
              <div className="mt-3 p-3 rounded-xl border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-2">
                <p className="font-bold text-amber-800 dark:text-amber-200">
                  Partial Creation Status:
                </p>
                <div className="space-y-1">
                  {partialResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-semibold">{r.name}</span>
                      {r.success ? (
                        <span className="text-emerald-600 font-bold text-[11px]">Created ✓</span>
                      ) : (
                        <span className="text-amber-600 text-[11px] font-medium">
                          Failed ({r.stepFailed || "create"}): {r.error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={retryFailedCourts}
                  className="w-full mt-2 text-xs border-amber-400 text-amber-800 hover:bg-amber-100"
                >
                  <RotateCcw className="size-3.5 mr-1.5" />
                  <span>Retry Only Failed Courts</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Finished / Ready */}
        {(step === 4 || finished) && (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-nx-ink">
                {t("resources.wizard.readyTitle", { defaultValue: "Your Venue is Ready!" })}
              </h3>
              <p className="text-xs text-nx-ink-2 max-w-sm mx-auto">
                {t("resources.wizard.readySubtitle", {
                  defaultValue:
                    "Courts, working hours, booking slots, and pricing have been configured and published.",
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="sm" className="font-bold bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0D0D0E] shadow-sm">
                <a href="/venue/calendar">
                  <CalendarDays className="size-4 mr-1.5" aria-hidden="true" />
                  <span>{t("resources.wizard.goToCalendar", { defaultValue: "Open Calendar" })}</span>
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={resetAndClose}>
                <span>{t("resources.wizard.goToResources", { defaultValue: "View Courts & Spaces" })}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        {!finished && (
          <div className="flex items-center justify-between border-t border-nx-line pt-4 mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={step === 1 || submitting}
              onClick={() => setStep(step - 1)}
            >
              {t("resources.wizard.back", { defaultValue: "Back" })}
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setStep(step + 1)}
                className="font-semibold"
              >
                {t("resources.wizard.next", { defaultValue: "Next Step" })}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {/* Save as Draft Option */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  onClick={() => void handleFinish(false)}
                  className="font-medium text-xs border-nx-border"
                >
                  <FileCheck className="size-3.5 mr-1.5" />
                  <span>Save as Draft</span>
                </Button>

                {/* Primary Complete & Publish Action */}
                <Button
                  type="button"
                  size="sm"
                  disabled={submitting}
                  loading={submitting}
                  onClick={() => void handleFinish(true)}
                  className="font-bold bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0D0D0E] shadow-sm"
                >
                  {submitting
                    ? t("resources.wizard.finishing", { defaultValue: "Setting up venue..." })
                    : t("resources.wizard.finish", { defaultValue: "Complete Setup & Publish" })}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
