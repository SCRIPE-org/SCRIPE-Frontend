/**
 * Currency Display Toggle
 *
 * Dropdown to switch the global display currency.
 * Three modes: Native (original), Session (just this time), Always (persisted).
 *
 * Live exchange rates are managed via useCurrencyRates hook.
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useCurrencyPreference } from "@core/store/useCurrencyPreference";
import { useConvertedAmount } from "@core/hooks/useConvertedAmount";
import { useCurrencyRates } from "@core/hooks/useCurrencyRates";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { Separator } from "@core/ui/separator";
import { Check, Globe, RotateCcw, Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@core/common/utils";

// One row shape for every choice in the panel: a 32px target, hover on the
// ink-derived tint, and the lit-edge focus ring the rest of the product uses.
// These rows had no focus treatment at all before — the whole list was
// unusable from the keyboard in the dark.
const ROW =
  "flex min-h-8 w-full items-center gap-2 px-3 py-1.5 text-sm text-nx-ink transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover focus-visible:outline-none focus-visible:shadow-nx-focus";

/** Display currencies — the most commonly used for display */
const DISPLAY_CURRENCIES = [
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
  { code: "SAR", flag: "🇸🇦", name: "Saudi Riyal" },
  { code: "AED", flag: "🇦🇪", name: "UAE Dirham" },
  { code: "EGP", flag: "🇪🇬", name: "Egyptian Pound" },
  { code: "TRY", flag: "🇹🇷", name: "Turkish Lira" },
  { code: "INR", flag: "🇮🇳", name: "Indian Rupee" },
] as const;

interface CurrencyDisplayToggleProps {
  className?: string;
}

export function CurrencyDisplayToggle({ className }: CurrencyDisplayToggleProps) {
  const { t } = useI18n();
  const { displayCurrency, displayMode, setDisplayCurrency, resetToNative, isLoadingRates } =
    useCurrencyPreference();

  const { isConverting } = useConvertedAmount();
  const { fetchRates, fetchError } = useCurrencyRates();
  const [alwaysChecked, setAlwaysChecked] = useState(displayMode === "always");
  const [open, setOpen] = useState(false);

  function handleSelectCurrency(code: string) {
    const mode: "session" | "always" = alwaysChecked ? "always" : "session";
    setDisplayCurrency(code, mode);
    setOpen(false);
  }

  function handleReset() {
    resetToNative();
    setAlwaysChecked(false);
    setOpen(false);
  }

  const currentFlag = DISPLAY_CURRENCIES.find((c) => c.code === displayCurrency)?.flag || "💱";

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) fetchRates();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5", className)}
          aria-label={t("currency.displayToggle") || "Currency"}
        >
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-xs tabular-nums">
            {isConverting
              ? `${currentFlag} ${displayCurrency}`
              : t("currency.displayToggle") || "Currency"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        {/* Panel head: title, then the one-line explanation a step down */}
        <div className="border-b border-nx-line px-3 py-2">
          <p className="text-sm font-medium text-nx-ink">
            {t("currency.displayToggle") || "Display Currency"}
          </p>
          <p className="text-xs text-nx-ink-3">
            {t("currency.toggleDesc") || "Preview amounts in another currency"}
          </p>
        </div>

        {/* Native option — same row shape as the list below it, so the choice
            reads as one set: 32px rows, tick reserved on the start edge. */}
        <button
          type="button"
          className={cn(ROW, "py-2")}
          onClick={handleReset}
          aria-pressed={displayMode === "native"}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            <Check
              className={cn(
                "h-3.5 w-3.5 text-nx-accent",
                displayMode === "native" ? "visible" : "invisible"
              )}
              aria-hidden="true"
            />
          </span>
          <span aria-hidden="true">🌐</span>
          <span className="flex-1 text-start">{t("currency.native") || "Native (original)"}</span>
        </button>

        <Separator />

        {/* Loading state */}
        {isLoadingRates && (
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-nx-ink-3">
            <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
            {t("common.loading") || "Loading..."}
          </div>
        )}

        {/* Currency list */}
        {!isLoadingRates && (
          <div className="max-h-48 overflow-y-auto">
            {DISPLAY_CURRENCIES.map((c) => {
              const active = displayMode !== "native" && displayCurrency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  className={ROW}
                  onClick={() => handleSelectCurrency(c.code)}
                  aria-pressed={active}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    <Check
                      className={cn("h-3.5 w-3.5 text-nx-accent", active ? "visible" : "invisible")}
                      aria-hidden="true"
                    />
                  </span>
                  <span aria-hidden="true">{c.flag}</span>
                  <span className={cn("flex-1 text-start", active && "font-medium")}>{c.code}</span>
                  <span className="truncate text-xs text-nx-ink-3">{c.name}</span>
                </button>
              );
            })}
          </div>
        )}

        <Separator />

        {/* Always toggle — the product's own Checkbox, not a bare browser one */}
        <div className="px-3 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <Checkbox
              checked={alwaysChecked}
              onCheckedChange={(checked) => {
                const next = checked === true;
                setAlwaysChecked(next);
                if (isConverting) {
                  setDisplayCurrency(displayCurrency, next ? "always" : "session");
                }
              }}
            />
            <span className="text-nx-ink-2">
              {t("currency.alwaysUse") || "Always use selected currency"}
            </span>
          </label>
        </div>

        {/* Rates source info */}
        <div className="flex items-center justify-between gap-2 px-3 pb-2">
          <p className="text-xs text-nx-ink-3">
            {fetchError
              ? t("currency.fallbackRates") || "⚠ Using cached rates (offline)"
              : t("currency.liveRates") || "✓ Live rates from server"}
          </p>
          <button
            type="button"
            onClick={() => fetchRates(true)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-nx-sm text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
            title={t("currency.refreshRates") || "Refresh rates"}
            aria-label={t("currency.refreshRates") || "Refresh rates"}
          >
            <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Reset button */}
        {isConverting && (
          <>
            <Separator />
            <button
              type="button"
              className={cn(ROW, "text-xs text-nx-ink-2")}
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t("currency.resetToNative") || "Reset to native"}
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
