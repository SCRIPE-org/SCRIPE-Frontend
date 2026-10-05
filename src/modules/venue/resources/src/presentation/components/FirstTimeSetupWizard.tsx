"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  CircleDollarSign,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { FirstTimeSetupInput } from "../../domain/entities/ResourceWorkspaceItem";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: FirstTimeSetupInput) => Promise<boolean>;
  submitting: boolean;
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
}: Props) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [step, setStep] = useState<number>(1);
  const [branchName, setBranchName] = useState("Nasr City");
  const [timeZoneId, setTimeZoneId] = useState("Africa/Cairo");
  const [sportType, setSportType] = useState("Padel");
  const [courts, setCourts] = useState<string[]>([
    "Padel Court 1",
    "Padel Court 2",
    "Football Pitch A",
  ]);
  const [isOpen247, setIsOpen247] = useState(true);
  const [opensAt, setOpensAt] = useState("08:00");
  const [closesAt, setClosesAt] = useState("00:00");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [pricePerSlot, setPricePerSlot] = useState(800);
  const [currencyCode, setCurrencyCode] = useState("EGP");
  const [finished, setFinished] = useState(false);

  const addCourt = () => {
    setCourts([...courts, `${sportType} Court ${courts.length + 1}`]);
  };

  const updateCourt = (index: number, val: string) => {
    const updated = [...courts];
    updated[index] = val;
    setCourts(updated);
  };

  const removeCourt = (index: number) => {
    if (courts.length <= 1) return;
    setCourts(courts.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    const success = await onSubmit({
      branchName: branchName.trim() || "Main Branch",
      timeZoneId,
      sportType,
      courts: courts.filter((c) => c.trim().length > 0),
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
    });

    if (success) {
      setFinished(true);
      setStep(6);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setFinished(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader className="border-b border-nx-line pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-nx-accent/10 text-nx-accent">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-nx-ink">
                {t("resources.wizard.title", { defaultValue: "Venue First-Time Setup" })}
              </DialogTitle>
              <p className="text-xs text-nx-ink-2">
                {t("resources.wizard.subtitle", {
                  defaultValue: "Complete your venue configuration in 5 simple steps.",
                })}
              </p>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {!finished && (
            <div className="flex items-center justify-between gap-1 mt-4 text-[11px] font-semibold text-nx-ink-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`flex-1 text-center py-1 border-b-2 transition-colors ${
                    step === s
                      ? "border-nx-accent text-nx-accent"
                      : step > s
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "border-nx-line text-nx-ink-3"
                  }`}
                >
                  {s === 1 && t("resources.wizard.step1", { defaultValue: "1. Branch" })}
                  {s === 2 && t("resources.wizard.step2", { defaultValue: "2. Courts" })}
                  {s === 3 && t("resources.wizard.step3", { defaultValue: "3. Hours" })}
                  {s === 4 && t("resources.wizard.step4", { defaultValue: "4. Slot" })}
                  {s === 5 && t("resources.wizard.step5", { defaultValue: "5. Price" })}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* STEP 1: Branch */}
        {step === 1 && (
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="wizard-branch" className="text-sm font-semibold">
                {t("resources.wizard.branchName", { defaultValue: "Branch Name" })}
              </Label>
              <Input
                id="wizard-branch"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder={t("resources.wizard.branchPlaceholder", {
                  defaultValue: "e.g. Nasr City Club",
                })}
              />
            </div>

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
          </div>
        )}

        {/* STEP 2: Courts & Fields */}
        {step === 2 && (
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t("resources.wizard.sportTypeLabel", { defaultValue: "Default Sport / Type" })}
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {SPORT_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setSportType(type)}
                    className={`px-3 py-1 rounded-nx-md text-xs font-medium transition-colors ${
                      sportType === type
                        ? "bg-nx-accent text-white"
                        : "bg-nx-surfaceSubtle border border-nx-line text-nx-ink hover:bg-nx-hover"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t("resources.wizard.courtsLabel", { defaultValue: "Courts / Fields to Add" })}
              </Label>
              <p className="text-xs text-nx-ink-3">
                {t("resources.wizard.courtsHelp", {
                  defaultValue: "Add the names of the courts or fields you operate.",
                })}
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {courts.map((court, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={court}
                      onChange={(e) => updateCourt(index, e.target.value)}
                      placeholder={t("resources.wizard.courtPlaceholder", {
                        defaultValue: "Court name (e.g. Padel 1)",
                      })}
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCourt(index)}
                      disabled={courts.length <= 1}
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
                <span>{t("resources.wizard.addMoreCourts", { defaultValue: "+ Add Another Court" })}</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Working Hours */}
        {step === 3 && (
          <div className="space-y-4 py-3">
            <Label className="text-sm font-semibold">
              {t("resources.workingHours.mode", { defaultValue: "Operating Schedule" })}
            </Label>

            <div className="space-y-3">
              {/* Option A: Open 24/7 */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-nx-md border cursor-pointer transition-all ${
                  isOpen247
                    ? "border-nx-accent bg-nx-accent/5 ring-1 ring-nx-accent"
                    : "border-nx-line hover:bg-nx-surfaceSubtle"
                }`}
              >
                <input
                  type="radio"
                  name="working-hours-mode"
                  checked={isOpen247}
                  onChange={() => setIsOpen247(true)}
                  className="mt-1"
                />
                <div>
                  <p className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                    <Clock className="size-3.5 text-nx-accent" aria-hidden="true" />
                    <span>{t("resources.workingHours.open247", { defaultValue: "Open 24 Hours (24/7)" })}</span>
                  </p>
                  <p className="text-[11px] text-nx-ink-2 mt-0.5">
                    {t("resources.workingHours.open247Description", {
                      defaultValue: "Court is bookable all day and night every day of the week.",
                    })}
                  </p>
                </div>
              </label>

              {/* Option B: Custom Hours */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-nx-md border cursor-pointer transition-all ${
                  !isOpen247
                    ? "border-nx-accent bg-nx-accent/5 ring-1 ring-nx-accent"
                    : "border-nx-line hover:bg-nx-surfaceSubtle"
                }`}
              >
                <input
                  type="radio"
                  name="working-hours-mode"
                  checked={!isOpen247}
                  onChange={() => setIsOpen247(false)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-nx-ink-2" aria-hidden="true" />
                    <span>{t("resources.workingHours.custom", { defaultValue: "Custom Working Hours" })}</span>
                  </p>
                  <p className="text-[11px] text-nx-ink-2 mt-0.5">
                    {t("resources.workingHours.customDescription", {
                      defaultValue: "Specify exact daily opening and closing hours.",
                    })}
                  </p>

                  {!isOpen247 && (
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-nx-line/60">
                      <div>
                        <Label className="text-[11px] text-nx-ink-3">
                          {t("resources.workingHours.openTime", { defaultValue: "Opens At" })}
                        </Label>
                        <Input
                          type="time"
                          value={opensAt}
                          onChange={(e) => setOpensAt(e.target.value)}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-nx-ink-3">
                          {t("resources.workingHours.closeTime", { defaultValue: "Closes At" })}
                        </Label>
                        <Input
                          type="time"
                          value={closesAt}
                          onChange={(e) => setClosesAt(e.target.value)}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Booking Slot */}
        {step === 4 && (
          <div className="space-y-4 py-3">
            <div>
              <Label className="text-sm font-semibold">
                {t("resources.bookingRules.slotDuration", { defaultValue: "Default Booking Slot" })}
              </Label>
              <p className="text-xs text-nx-ink-3 mt-0.5">
                {t("resources.bookingRules.slotDurationHelp", {
                  defaultValue: "How long each standard booking session lasts.",
                })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { duration: 30, label: "30 min" },
                { duration: 60, label: "60 min (Standard)" },
                { duration: 90, label: "90 min" },
                { duration: 120, label: "120 min (2 Hours)" },
              ].map(({ duration, label }) => (
                <button
                  type="button"
                  key={duration}
                  onClick={() => setSlotDurationMinutes(duration)}
                  className={`p-3 rounded-nx-md border text-left transition-all ${
                    slotDurationMinutes === duration
                      ? "border-nx-accent bg-nx-accent/10 font-bold text-nx-ink ring-1 ring-nx-accent"
                      : "border-nx-line hover:bg-nx-surfaceSubtle text-nx-ink-2"
                  }`}
                >
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px] text-nx-ink-3 mt-0.5">
                    Starts every {duration}m
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Pricing */}
        {step === 5 && (
          <div className="space-y-4 py-3">
            <div>
              <Label className="text-sm font-semibold">
                {t("resources.pricing.title", { defaultValue: "Standard Price" })}
              </Label>
              <p className="text-xs text-nx-ink-3 mt-0.5">
                {t("resources.pricing.description", {
                  defaultValue: "Standard authoritative price per booking slot.",
                })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="wizard-price" className="text-xs font-medium">
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
                    className="pr-12 text-sm font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-nx-ink-3">
                    {currencyCode}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wizard-currency" className="text-xs font-medium">
                  {t("resources.pricing.currency", { defaultValue: "Currency" })}
                </Label>
                <select
                  id="wizard-currency"
                  className="w-full h-9 rounded-nx-md border border-nx-line bg-nx-surface px-3 py-1.5 text-xs font-semibold text-nx-ink"
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
        )}

        {/* STEP 6: Finished / Ready */}
        {step === 6 && (
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
              <Button asChild size="sm" className="font-semibold">
                <a href="/venue/calendar">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  <span>{t("resources.wizard.goToCalendar", { defaultValue: "Open Calendar" })}</span>
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={resetAndClose}>
                <span>{t("resources.wizard.goToResources", { defaultValue: "View Courts & Fields" })}</span>
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

            {step < 5 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setStep(step + 1)}
                className="font-semibold"
              >
                {t("resources.wizard.next", { defaultValue: "Next Step" })}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={submitting}
                loading={submitting}
                onClick={() => void handleFinish()}
                className="font-bold bg-nx-accent text-white"
              >
                {submitting
                  ? t("resources.wizard.finishing", { defaultValue: "Setting up venue..." })
                  : t("resources.wizard.finish", { defaultValue: "Complete Setup & Publish" })}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
