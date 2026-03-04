/**
 * Currency Display Toggle
 *
 * Dropdown to switch the global display currency.
 * Three modes: Native (original), Session (just this time), Always (persisted).
 *
 * Fetches live exchange rates from backend GET /v1/currency/rates.
 * Rates are cached in Zustand store after first fetch.
 */
"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useCurrencyPreference, type CurrencyDisplayMode } from "@core/store/useCurrencyPreference";
import { useConvertedAmount } from "@core/hooks/useConvertedAmount";
import { getCoreContainer } from "@core/di";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { Button } from "@core/ui/button";
import {
      Popover,
      PopoverContent,
      PopoverTrigger,
} from "@core/ui/popover";
import { Separator } from "@core/ui/separator";
import { Check, Globe, RotateCcw, Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@core/common/utils";

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

/**
 * Fallback rates used ONLY if the backend API is unreachable.
 * These are never shown as the primary source — backend is always tried first.
 */
const FALLBACK_RATES: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      SAR: 3.75,
      AED: 3.67,
      EGP: 50.5,
      TRY: 32.5,
      INR: 83.5,
};

interface CurrencyDisplayToggleProps {
      className?: string;
}

export function CurrencyDisplayToggle({ className }: CurrencyDisplayToggleProps) {
      const { t } = useI18n();
      const {
            displayCurrency,
            displayMode,
            exchangeRates,
            setDisplayCurrency,
            resetToNative,
            setRates,
            setLoadingRates,
            isLoadingRates,
      } = useCurrencyPreference();

      const { isConverting } = useConvertedAmount();
      const [alwaysChecked, setAlwaysChecked] = useState(displayMode === "always");
      const [open, setOpen] = useState(false);
      const [fetchError, setFetchError] = useState(false);

      // ── Fetch rates from backend API ──────────────────────────────
      const fetchRatesFromBackend = useCallback(
            async (force = false) => {
                  // Skip if already loaded and not forcing refresh
                  if (exchangeRates && !force) return;

                  setLoadingRates(true);
                  setFetchError(false);

                  try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
                        const url = API_ENDPOINTS.ENTITLEMENTS.CURRENCY.RATES("USD");
                        const token = getCoreContainer().apiService.getAuthToken();
                        const response = await fetch(`${apiUrl}${url}`, {
                              method: "GET",
                              credentials: "include",
                              headers: {
                                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                              },
                        });

                        if (!response.ok) {
                              throw new Error(`Failed to fetch rates: ${response.status}`);
                        }

                        const data = await response.json();

                        // Backend returns { USD: 1, EUR: 0.92, ... } as decimals
                        const rates: Record<string, number> = {};
                        for (const [key, value] of Object.entries(data)) {
                              rates[key] = Number(value);
                        }

                        setRates(rates, "USD");
                  } catch {
                        // Fallback to static rates if backend is unreachable
                        setFetchError(true);
                        if (!exchangeRates) {
                              setRates(FALLBACK_RATES, "USD");
                        }
                  }
            },
            [exchangeRates, setLoadingRates, setRates]
      );

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
                        if (o) fetchRatesFromBackend();
                  }}
            >
                  <PopoverTrigger asChild>
                        <Button
                              variant="outline"
                              size="sm"
                              className={cn("gap-1.5", className)}
                        >
                              <Globe className="h-3.5 w-3.5" />
                              <span className="text-xs">
                                    {isConverting ? `${currentFlag} ${displayCurrency}` : (t("currency.displayToggle") || "Currency")}
                              </span>
                        </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 p-0">
                        <div className="px-3 py-2 border-b">
                              <p className="text-sm font-medium">
                                    {t("currency.displayToggle") || "Display Currency"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                    {t("currency.toggleDesc") || "Preview amounts in another currency"}
                              </p>
                        </div>

                        {/* Native option */}
                        <button
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                              onClick={handleReset}
                        >
                              <span className="h-4 w-4 flex items-center justify-center">
                                    {displayMode === "native" && <Check className="h-3.5 w-3.5 text-primary" />}
                              </span>
                              <span>🌐</span>
                              <span className="flex-1 text-left">
                                    {t("currency.native") || "Native (original)"}
                              </span>
                        </button>

                        <Separator />

                        {/* Loading state */}
                        {isLoadingRates && (
                              <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    {t("common.loading") || "Loading..."}
                              </div>
                        )}

                        {/* Currency list */}
                        {!isLoadingRates && (
                              <div className="max-h-48 overflow-y-auto">
                                    {DISPLAY_CURRENCIES.map((c) => (
                                          <button
                                                key={c.code}
                                                type="button"
                                                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                                                onClick={() => handleSelectCurrency(c.code)}
                                          >
                                                <span className="h-4 w-4 flex items-center justify-center">
                                                      {displayMode !== "native" && displayCurrency === c.code && (
                                                            <Check className="h-3.5 w-3.5 text-primary" />
                                                      )}
                                                </span>
                                                <span>{c.flag}</span>
                                                <span className="flex-1 text-left">{c.code}</span>
                                                <span className="text-xs text-muted-foreground">{c.name}</span>
                                          </button>
                                    ))}
                              </div>
                        )}

                        <Separator />

                        {/* Always toggle */}
                        <div className="px-3 py-2">
                              <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                          type="checkbox"
                                          checked={alwaysChecked}
                                          onChange={(e) => {
                                                setAlwaysChecked(e.target.checked);
                                                if (isConverting) {
                                                      setDisplayCurrency(displayCurrency, e.target.checked ? "always" : "session");
                                                }
                                          }}
                                          className="rounded border-muted-foreground"
                                    />
                                    <span className="text-muted-foreground">
                                          {t("currency.alwaysUse") || "Always use selected currency"}
                                    </span>
                              </label>
                        </div>

                        {/* Rates source info */}
                        <div className="px-3 pb-2 flex items-center justify-between">
                              <p className="text-[10px] text-muted-foreground/60 italic">
                                    {fetchError
                                          ? (t("currency.fallbackRates") || "⚠ Using cached rates (offline)")
                                          : (t("currency.liveRates") || "✓ Live rates from server")}
                              </p>
                              <button
                                    type="button"
                                    onClick={() => fetchRatesFromBackend(true)}
                                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                                    title={t("currency.refreshRates") || "Refresh rates"}
                              >
                                    <RefreshCcw className="h-3 w-3" />
                              </button>
                        </div>

                        {/* Reset button */}
                        {isConverting && (
                              <>
                                    <Separator />
                                    <button
                                          type="button"
                                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition-colors"
                                          onClick={handleReset}
                                    >
                                          <RotateCcw className="h-3 w-3" />
                                          {t("currency.resetToNative") || "Reset to native"}
                                    </button>
                              </>
                        )}
                  </PopoverContent>
            </Popover>
      );
}
