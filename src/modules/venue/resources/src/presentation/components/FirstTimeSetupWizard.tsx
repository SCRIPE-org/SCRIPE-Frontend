// FILE-EXCEPTION: rule bypass for existing large file
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
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
      const preparedCourtItems = activeCourtItems.map((item) => {
        const fingerprint = JSON.stringify([
          currencyCode || "EGP",
          pricePerSlot,
          slotDurationMinutes,
          slotDurationMinutes,
        ]);
        return item.priceIntentFingerprint === fingerprint && item.priceIntentKey
          ? item
          : {
              ...item,
              priceIntentFingerprint: fingerprint,
              priceIntentKey: crypto.randomUUID(),
            };
      });
      setCourtItems(preparedCourtItems);
      const effectiveBranchName =
        facilityMode === "existing" && selectedFacilityId
          ? facilities.find((f) => f.id === selectedFacilityId)?.name || branchName.trim()
          : branchName.trim() || "Main Branch";

      const legacyCourtNames = preparedCourtItems.map((c) => c.name.trim());
      const legacyResourceMap: Record<string, string> = {};
      for (const c of preparedCourtItems) {
        if (c.resourceId) {
          legacyResourceMap[c.name.trim()] = c.resourceId;
        }
      }

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
              courtItems: preparedCourtItems,
              isOpen247,
              slotDurationMinutes,
              pricePerSlot,
              currencyCode,
            })
          );
        } catch {
          // Storage can be disabled; in-memory retry state remains intact.
        }
      }

      const success = await onSubmit({
        branchName: effectiveBranchName,
        facilityId: effectiveFacilityId,
        timeZoneId,
        sportType,
        courts: legacyCourtNames,
        courtItems: preparedCourtItems,
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
          const updatedItems = preparedCourtItems.map((item, idx) => {
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
        setSubmitError(errorMessage || t("resources.wizard.partialSetupError"));
      }
    } catch (err: unknown) {
      const safe = mapVenueError(err, language);
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
            <div className="mt-4 flex items-center justify-between gap-1.5 text-[11px] font-semibold text-nx-ink-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 border-b-2 py-1.5 text-center transition-colors ${
                    step === s
                      ? "border-[#C6FF00] font-bold text-nx-ink"
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
              <div className="bg-nx-raised/40 flex gap-1 rounded-lg border border-nx-line p-1">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setFacilityMode("existing");
                    if (facilities.length > 0) {
                      setSelectedFacilityId(facilities[0].id);
                      setBranchName(facilities[0].name);
                    }
                  }}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                    facilityMode === "existing"
                      ? "shadow-xs bg-[#C6FF00] text-[#0D0D0E]"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {t("resources.wizard.useExistingFacility", {
                    defaultValue: "Select Existing Facility",
                  })}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setFacilityMode("new");
                    setSelectedFacilityId("");
                    setBranchName("");
                  }}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                    facilityMode === "new"
                      ? "shadow-xs bg-[#C6FF00] text-[#0D0D0E]"
                      : "text-nx-ink-2 hover:text-nx-ink"
                  }`}
                >
                  {t("resources.wizard.createNewFacility", { defaultValue: "Create New Facility" })}
                </Button>
              </div>
            )}

            {/* Existing Authorized Facilities Picker */}
            {facilityMode === "existing" && facilities.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-nx-ink">
                  {t("resources.wizard.authorizedFacility", {
                    defaultValue: "Authorized Facility / Location",
                  })}
                </Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {facilities.map((fac) => (
                    <Button
                      variant="ghost"
                      type="button"
                      key={fac.id}
                      onClick={() => {
                        setSelectedFacilityId(fac.id);
                        setBranchName(fac.name);
                      }}
                      className={`rounded-xl border p-2.5 text-left transition-all ${
                        selectedFacilityId === fac.id
                          ? "border-[#C6FF00] bg-[#C6FF00]/10 font-semibold ring-1 ring-[#C6FF00]"
                          : "border-nx-line bg-nx-surface hover:bg-nx-raised"
                      }`}
                    >
                      <p className="flex items-center gap-1.5 text-xs font-bold text-nx-ink">
                        <Building2 className="size-3.5 text-nx-ink-3" />
                        <span>{fac.name}</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-nx-ink-3">
                        {fac.code ||
                          t("resources.wizard.standardFacility", {
                            defaultValue: "Standard Facility",
                          })}
                      </p>
                    </Button>
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
              <GenericSelect
                id="wizard-tz"
                value={timeZoneId}
                options={COMMON_TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
                aria-label={t("resources.wizard.timezone", { defaultValue: "Timezone" })}
                onValueChange={(value: string | string[]) => {
                  if (typeof value === "string") setTimeZoneId(value);
                }}
                className="w-full"
              />
            </div>

            <div className="border-nx-line/60 space-y-2 border-t pt-2">
              <Label className="text-sm font-semibold">
                {t("resources.wizard.managementMode", {
                  defaultValue: "Who will manage this venue?",
                })}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => handleSelectManagementMode("solo")}
                  className={`rounded-nx-md border p-2.5 text-left transition-all ${
                    managementMode === "solo"
                      ? "border-[#C6FF00] bg-[#C6FF00]/10 ring-1 ring-[#C6FF00]"
                      : "hover:bg-nx-surfaceSubtle border-nx-line"
                  }`}
                >
                  <p className="flex items-center gap-1.5 text-xs font-bold text-nx-ink">
                    <User className="size-3.5 text-nx-accent" aria-hidden="true" />
                    <span>{t("resources.wizard.justMe", { defaultValue: "Just me" })}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-nx-ink-2">
                    {t("resources.wizard.justMeHelp", {
                      defaultValue: "Operate everything directly. Simple & fast.",
                    })}
                  </p>
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => handleSelectManagementMode("team")}
                  className={`rounded-nx-md border p-2.5 text-left transition-all ${
                    managementMode === "team"
                      ? "border-[#C6FF00] bg-[#C6FF00]/10 ring-1 ring-[#C6FF00]"
                      : "hover:bg-nx-surfaceSubtle border-nx-line"
                  }`}
                >
                  <p className="flex items-center gap-1.5 text-xs font-bold text-nx-ink">
                    <Users className="size-3.5 text-nx-accent" aria-hidden="true" />
                    <span>{t("resources.wizard.team", { defaultValue: "Me and my team" })}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-nx-ink-2">
                    {t("resources.wizard.teamHelp", {
                      defaultValue: "Invite managers and receptionists in Settings.",
                    })}
                  </p>
                </Button>
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
                  <Button
                    variant="ghost"
                    type="button"
                    key={type}
                    onClick={() => {
                      setSportType(type);
                      setCourtItems(
                        courtItems.map((c, i) => ({ ...c, name: `${type} Court ${i + 1}` }))
                      );
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      sportType === type
                        ? "shadow-xs bg-[#C6FF00] text-[#0D0D0E]"
                        : "border border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
                    }`}
                  >
                    {t(`resources.sports.${type}`, { defaultValue: type })}
                  </Button>
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

              <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
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
                      aria-label={t("resources.wizard.removeCourt", {
                        defaultValue: "Remove court",
                      })}
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
                className="mt-2 gap-1 text-xs"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                <span>
                  {t("resources.wizard.addMoreCourts", {
                    defaultValue: "+ Add Another Court / Space",
                  })}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: WHEN & HOW MUCH (Operating Schedule, Slot Duration, Pricing, and Review) */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Left Column: Operating Schedule & Booking Slot Duration */}
              <div className="space-y-4">
                {/* 1. Operating Schedule */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-nx-ink-3">
                    {t("resources.workingHours.mode", { defaultValue: "1. Operating Schedule" })}
                  </Label>

                  <RadioGroup
                    value={isOpen247 ? "open247" : "custom"}
                    onValueChange={(value) => setIsOpen247(value === "open247")}
                    className="space-y-2"
                  >
                    {/* Option A: Open 24/7 */}
                    <div
                      className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-all ${
                        isOpen247
                          ? "border-[#C6FF00] bg-[#C6FF00]/10 ring-1 ring-[#C6FF00]"
                          : "hover:bg-nx-surfaceSubtle border-nx-line bg-nx-surface"
                      }`}
                    >
                      <RadioGroupItem id="wizard-open247" value="open247" className="mt-0.5" />
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-bold text-nx-ink">
                          <Clock className="size-3.5 text-nx-accent" aria-hidden="true" />
                          <Label htmlFor="wizard-open247" className="cursor-pointer">
                            {t("resources.workingHours.open247", {
                              defaultValue: "Open 24 Hours (24/7)",
                            })}
                          </Label>
                        </p>
                        <p className="mt-0.5 text-[10px] text-nx-ink-2">
                          {t("resources.workingHours.open247Description", {
                            defaultValue: "Open all day and night every day of the week.",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Option B: Custom Hours */}
                    <div
                      className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-all ${
                        !isOpen247
                          ? "border-[#C6FF00] bg-[#C6FF00]/10 ring-1 ring-[#C6FF00]"
                          : "hover:bg-nx-surfaceSubtle border-nx-line bg-nx-surface"
                      }`}
                    >
                      <RadioGroupItem id="wizard-custom-hours" value="custom" className="mt-0.5" />
                      <div className="flex-1">
                        <p className="flex items-center gap-1.5 text-xs font-bold text-nx-ink">
                          <Building2 className="size-3.5 text-nx-ink-2" aria-hidden="true" />
                          <Label htmlFor="wizard-custom-hours" className="cursor-pointer">
                            {t("resources.workingHours.custom", {
                              defaultValue: "Custom Working Hours",
                            })}
                          </Label>
                        </p>
                        <p className="mt-0.5 text-[10px] text-nx-ink-2">
                          {t("resources.workingHours.customDescription", {
                            defaultValue: "Specify daily opening and closing hours.",
                          })}
                        </p>

                        {!isOpen247 && (
                          <div className="border-nx-line/60 mt-2 grid grid-cols-2 gap-2 border-t pt-2">
                            <div>
                              <Label className="text-[10px] text-nx-ink-3">
                                {t("resources.workingHours.openTime", { defaultValue: "Opens At" })}
                              </Label>
                              <Input
                                type="time"
                                value={opensAt}
                                onChange={(e) => setOpensAt(e.target.value)}
                                className="mt-0.5 h-7 text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-nx-ink-3">
                                {t("resources.workingHours.closeTime", {
                                  defaultValue: "Closes At",
                                })}
                              </Label>
                              <Input
                                type="time"
                                value={closesAt}
                                onChange={(e) => setClosesAt(e.target.value)}
                                className="mt-0.5 h-7 text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* 2. Booking Slot Duration */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-nx-ink-3">
                    {t("resources.bookingRules.slotDuration", {
                      defaultValue: "2. Booking Slot Duration",
                    })}
                  </Label>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { duration: 30, labelKey: "duration30" },
                      { duration: 60, labelKey: "duration60" },
                      { duration: 90, labelKey: "duration90" },
                      { duration: 120, labelKey: "duration120" },
                    ].map(({ duration, labelKey }) => (
                      <Button
                        variant="ghost"
                        type="button"
                        key={duration}
                        onClick={() => setSlotDurationMinutes(duration)}
                        className={`rounded-xl border p-2 text-left transition-all rtl:text-right ${
                          slotDurationMinutes === duration
                            ? "border-[#C6FF00] bg-[#C6FF00]/10 font-bold text-nx-ink ring-1 ring-[#C6FF00]"
                            : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised"
                        }`}
                      >
                        <p className="text-xs font-semibold">
                          {t(`resources.bookingRules.${labelKey}`, {
                            defaultValue: `${duration} minutes`,
                          })}
                        </p>
                        <p className="text-[10px] text-nx-ink-3">
                          {t("resources.wizard.everyMinutes", {
                            defaultValue: "Every {{value}} minutes",
                            value: duration,
                          })}
                        </p>
                      </Button>
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
                      <Label
                        htmlFor="wizard-price"
                        className="text-[11px] font-medium text-nx-ink-2"
                      >
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
                          className="h-9 pr-12 text-sm font-semibold rtl:pl-12 rtl:pr-3"
                        />
                        <span className="absolute right-3 top-2 text-xs font-bold text-nx-ink-3 rtl:left-3 rtl:right-auto">
                          {currencyCode}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="wizard-currency"
                        className="text-[11px] font-medium text-nx-ink-2"
                      >
                        {t("resources.pricing.currency", { defaultValue: "Currency" })}
                      </Label>
                      <GenericSelect
                        id="wizard-currency"
                        value={currencyCode}
                        options={[
                          {
                            value: "EGP",
                            label: t("resources.pricing.currencies.EGP", {
                              defaultValue: "EGP (Egyptian Pound)",
                            }),
                          },
                          {
                            value: "SAR",
                            label: t("resources.pricing.currencies.SAR", {
                              defaultValue: "SAR (Saudi Riyal)",
                            }),
                          },
                          {
                            value: "AED",
                            label: t("resources.pricing.currencies.AED", {
                              defaultValue: "AED (UAE Dirham)",
                            }),
                          },
                          {
                            value: "USD",
                            label: t("resources.pricing.currencies.USD", {
                              defaultValue: "USD (US Dollar)",
                            }),
                          },
                          {
                            value: "EUR",
                            label: t("resources.pricing.currencies.EUR", {
                              defaultValue: "EUR (Euro)",
                            }),
                          },
                        ]}
                        aria-label={t("resources.wizard.currencyLabel", {
                          defaultValue: "Currency",
                        })}
                        onValueChange={(value: string | string[]) => {
                          if (typeof value === "string") setCurrencyCode(value);
                        }}
                        className="h-9 w-full text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Configuration Review Summary */}
                <div className="border-nx-border bg-nx-raised/40 space-y-2 rounded-xl border p-3 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-nx-ink">
                    {t("resources.wizard.configurationReview", {
                      defaultValue: "Configuration Review",
                    })}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-nx-ink-2">
                    <div>
                      <span className="text-nx-ink-3">Facility: </span>
                      <span className="block truncate font-semibold text-nx-ink">{branchName}</span>
                    </div>
                    <div>
                      <span className="text-nx-ink-3">Sport: </span>
                      <span className="block truncate font-semibold text-nx-ink">{sportType}</span>
                    </div>
                    <div>
                      <span className="text-nx-ink-3">Courts: </span>
                      <span className="block font-semibold text-nx-ink">
                        {courtItems.length} spaces
                      </span>
                    </div>
                    <div>
                      <span className="text-nx-ink-3">Rate: </span>
                      <span className="block font-semibold text-nx-ink">
                        {pricePerSlot} {currencyCode} / {slotDurationMinutes}m
                      </span>
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
              <div className="mt-3 space-y-2 rounded-xl border border-amber-300 bg-amber-50/50 p-3 text-xs dark:bg-amber-950/20">
                <p className="font-bold text-amber-800 dark:text-amber-200">
                  Partial Creation Status:
                </p>
                <div className="space-y-1">
                  {partialResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-semibold">{r.name}</span>
                      {r.success ? (
                        <span className="text-[11px] font-bold text-emerald-600">Created ✓</span>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-600">
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
                  className="mt-2 w-full border-amber-400 text-xs text-amber-800 hover:bg-amber-100"
                >
                  <RotateCcw className="mr-1.5 size-3.5" />
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
              <p className="mx-auto max-w-sm text-xs text-nx-ink-2">
                {t("resources.wizard.readySubtitle", {
                  defaultValue:
                    "Courts, working hours, booking slots, and pricing have been configured and published.",
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                asChild
                size="sm"
                className="bg-[#C6FF00] font-bold text-[#0D0D0E] shadow-sm hover:bg-[#b5eb00]"
              >
                <a href="/venue/calendar">
                  <CalendarDays className="mr-1.5 size-4" aria-hidden="true" />
                  <span>
                    {t("resources.wizard.goToCalendar", { defaultValue: "Open Calendar" })}
                  </span>
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={resetAndClose}>
                <span>
                  {t("resources.wizard.goToResources", { defaultValue: "View Courts & Spaces" })}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        {!finished && (
          <div className="mt-2 flex items-center justify-between border-t border-nx-line pt-4">
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
                  className="border-nx-border text-xs font-medium"
                >
                  <FileCheck className="mr-1.5 size-3.5" />
                  <span>Save as Draft</span>
                </Button>

                {/* Primary Complete & Publish Action */}
                <Button
                  type="button"
                  size="sm"
                  disabled={submitting}
                  loading={submitting}
                  onClick={() => void handleFinish(true)}
                  className="bg-[#C6FF00] font-bold text-[#0D0D0E] shadow-sm hover:bg-[#b5eb00]"
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
