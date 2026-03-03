/**
 * Currency Display Toggle
 *
 * Dropdown to switch the global display currency.
 * Three modes: Native (original), Session (just this time), Always (persisted).
 *
 * Placed in dashboard/tenant page headers.
 */
"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useCurrencyPreference, type CurrencyDisplayMode } from "@core/store/useCurrencyPreference";
import { useConvertedAmount } from "@core/hooks/useConvertedAmount";
import { Button } from "@core/ui/button";
import {
      Popover,
      PopoverContent,
      PopoverTrigger,
} from "@core/ui/popover";
import { Separator } from "@core/ui/separator";
import { Check, Globe, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@core/common/utils";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

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
      const {
            displayCurrency,
            displayMode,
            exchangeRates,
            isLoadingRates,
            setDisplayCurrency,
            resetToNative,
            setRates,
            setLoadingRates,
      } = useCurrencyPreference();

      const { isConverting } = useConvertedAmount();
      const [alwaysChecked, setAlwaysChecked] = useState(displayMode === "always");
      const [open, setOpen] = useState(false);

      // Fetch exchange rates on first open (if not already cached)
      useEffect(() => {
            if (!open || exchangeRates || isLoadingRates) return;

            let cancelled = false;
            setLoadingRates(true);

            // Use the API service from the window if available, or fetch directly
            fetch(API_ENDPOINTS.ENTITLEMENTS.CURRENCY.RATES("USD"), {
                  credentials: "include",
                  headers: {
                        "Authorization": `Bearer ${getAccessToken()}`,
                        "Content-Type": "application/json",
                  },
            })
                  .then((res) => res.json())
                  .then((rates) => {
                        if (!cancelled && rates && typeof rates === "object") {
                              setRates(rates, "USD");
                        }
                  })
                  .catch(() => {
                        if (!cancelled) setLoadingRates(false);
                  });

            return () => { cancelled = true; };
      }, [open, exchangeRates, isLoadingRates, setRates, setLoadingRates]);

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
            <Popover open={open} onOpenChange={setOpen}>
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
                                    {t("currency.toggleDesc") || "Choose how amounts are displayed"}
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

                        {/* Currency list */}
                        <div className="max-h-48 overflow-y-auto">
                              {isLoadingRates && (
                                    <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          {t("common.loading") || "Loading rates..."}
                                    </div>
                              )}
                              {DISPLAY_CURRENCIES.map((c) => (
                                    <button
                                          key={c.code}
                                          type="button"
                                          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                                          onClick={() => handleSelectCurrency(c.code)}
                                          disabled={isLoadingRates && !exchangeRates}
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

                        <Separator />

                        {/* Always toggle */}
                        <div className="px-3 py-2">
                              <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                          type="checkbox"
                                          checked={alwaysChecked}
                                          onChange={(e) => {
                                                setAlwaysChecked(e.target.checked);
                                                // If already selecting a currency, update the mode
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

                        {/* Reset button (only shown when converting) */}
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

/** Helper to get access token from the secure token service */
function getAccessToken(): string {
      try {
            // Access the in-memory token service
            const { secureTokenService } = require("@core/common/secure-token-service");
            return secureTokenService.getAccessToken() || "";
      } catch {
            return "";
      }
}
