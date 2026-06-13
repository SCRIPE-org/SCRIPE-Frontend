"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import type { SupportedCurrency } from "../../domain/entities";
import { ChevronDown, Search, MapPin, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Flag emoji helper ───────────────────────────────────────────────────────
// ISO 4217 currency code → ISO 3166-1 alpha-2 country code mapping
// Used to derive flag emoji from currency code (best-effort, not exhaustive)
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "US", EUR: "EU", GBP: "GB", SAR: "SA", AED: "AE",
  EGP: "EG", KWD: "KW", QAR: "QA", BHD: "BH", OMR: "OM",
  JOD: "JO", TRY: "TR", PKR: "PK", INR: "IN", CNY: "CN",
  JPY: "JP", KRW: "KR", MYR: "MY", SGD: "SG", AUD: "AU",
  CAD: "CA", CHF: "CH", SEK: "SE", NOK: "NO", DKK: "DK",
  MAD: "MA", TND: "TN", DZD: "DZ", NGN: "NG", ZAR: "ZA",
  BRL: "BR", MXN: "MX", ARS: "AR", CLP: "CL", COP: "CO",
};

/** Convert ISO 3166-1 alpha-2 country code to flag emoji */
function countryToFlag(code: string): string {
  try {
    return code
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
  } catch {
    return "🌐";
  }
}

/** Get a flag emoji for a currency code (falls back to 🌐) */
function currencyFlag(currencyCode: string): string {
  const countryCode = CURRENCY_TO_COUNTRY[currencyCode.toUpperCase()];
  if (!countryCode) return "🌐";
  // EU has no flag emoji via this method — use special fallback
  if (countryCode === "EU") return "🇪🇺";
  return countryToFlag(countryCode);
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface BillingCountrySelectorProps {
  /** Current currency code (e.g. "USD") */
  currency: string;
  /** Callback when user changes currency */
  onCurrencyChange: (code: string) => void;
  /** All currencies returned by the pricing context API */
  supportedCurrencies: SupportedCurrency[];
  /** Whether the pricing context is still loading */
  isLoading?: boolean;
  /** Geo-detected country code (shown as "Detected" badge) */
  detectedCountry?: string | null;
  /** Recommended currency code from geo-detection */
  recommendedCurrency?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingCountrySelector({
  currency,
  onCurrencyChange,
  supportedCurrencies,
  isLoading = false,
  detectedCountry,
  recommendedCurrency,
}: BillingCountrySelectorProps) {
  const { t, language } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Auto-focus search input when popover opens ────────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 60);
    }
  }, [open]);

  // ── Current currency metadata ─────────────────────────────────────────────
  const currentMeta = useMemo(
    () =>
      supportedCurrencies.find((c) => c.code === currency) ?? {
        code: currency,
        symbol: currency,
        nameEn: currency,
        nameAr: currency,
        rateFromUsd: 1,
      },
    [supportedCurrencies, currency]
  );

  const displayName = language === "ar" ? currentMeta.nameAr : currentMeta.nameEn;

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return supportedCurrencies;
    const q = search.toLowerCase();
    return supportedCurrencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.nameAr.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [supportedCurrencies, search]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          width: 160,
          height: 38,
        }}
      >
        <div
          className="h-4 w-4 animate-pulse rounded-full"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
        <div
          className="h-3 animate-pulse rounded"
          style={{ background: "rgba(255,255,255,0.08)", width: 80 }}
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-1.5">
      {/* ── Trigger button ── */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-full px-4 py-2 text-sm transition-all duration-200 hover:opacity-80"
        style={{
          background: open
            ? "rgba(34,211,238,0.12)"
            : "rgba(255,255,255,0.04)",
          border: open
            ? "1px solid rgba(34,211,238,0.35)"
            : "1px solid rgba(255,255,255,0.08)",
          color: open ? "#22D3EE" : "rgba(245,242,255,0.75)",
        }}
      >
        {/* Flag */}
        <span className="text-base leading-none" aria-hidden="true">
          {currencyFlag(currency)}
        </span>

        {/* Symbol + code */}
        <span className="font-semibold tracking-tight">
          {currentMeta.symbol}
        </span>
        <span className="font-medium">{currency}</span>

        {/* Geo-detected badge */}
        {recommendedCurrency === currency && detectedCountry && (
          <span
            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{
              background: "rgba(34,197,94,0.15)",
              color: "#4ade80",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <MapPin className="h-2 w-2" />
            {t("signup.plan.detected") || "Detected"}
          </span>
        )}

        <ChevronDown
          className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          style={{ color: "rgba(245,242,255,0.4)" }}
        />
      </button>

      {/* ── Currency note ── */}
      <p className="text-[11px]" style={{ color: "rgba(245,242,255,0.3)" }}>
        {t("signup.plan.currencyNote", { currency }) ||
          `Prices shown in ${currency}`}
      </p>

      {/* ── Dropdown popover ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            role="listbox"
            aria-label={t("signup.plan.selectCurrency") || "Select currency"}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl"
            style={{
              background: "rgba(18,15,38,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.1)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-2 px-3 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Search
                className="h-4 w-4 flex-shrink-0"
                style={{ color: "rgba(245,242,255,0.35)" }}
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("signup.plan.searchCurrency") || "Search currency…"}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/25"
                style={{ color: "rgba(245,242,255,0.9)" }}
              />
            </div>

            {/* Currency list */}
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p
                  className="px-4 py-6 text-center text-sm"
                  style={{ color: "rgba(245,242,255,0.3)" }}
                >
                  {t("signup.plan.noCurrencyFound") || "No currency found"}
                </p>
              ) : (
                filtered.map((c) => {
                  const isSelected = c.code === currency;
                  const isRecommended = c.code === recommendedCurrency && !!detectedCountry;
                  const name = language === "ar" ? c.nameAr : c.nameEn;

                  return (
                    <button
                      key={c.code}
                      role="option"
                      aria-selected={isSelected}
                      type="button"
                      onClick={() => {
                        onCurrencyChange(c.code);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150"
                      style={{
                        background: isSelected
                          ? "rgba(34,211,238,0.08)"
                          : "transparent",
                        color: isSelected
                          ? "#22D3EE"
                          : "rgba(245,242,255,0.75)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.background =
                            "rgba(255,255,255,0.04)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                        }
                      }}
                    >
                      {/* Flag */}
                      <span className="text-lg leading-none" aria-hidden="true">
                        {currencyFlag(c.code)}
                      </span>

                      {/* Symbol + code */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {c.code}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "rgba(245,242,255,0.4)" }}
                          >
                            {c.symbol}
                          </span>
                          {isRecommended && (
                            <span
                              className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
                              style={{
                                background: "rgba(34,197,94,0.15)",
                                color: "#4ade80",
                                border: "1px solid rgba(34,197,94,0.2)",
                              }}
                            >
                              <MapPin className="h-2 w-2" />
                              {t("signup.plan.detected") || "Detected"}
                            </span>
                          )}
                        </div>
                        <span
                          className="truncate text-xs"
                          style={{ color: "rgba(245,242,255,0.35)" }}
                        >
                          {name}
                        </span>
                      </div>

                      {/* Checkmark */}
                      {isSelected && (
                        <Check
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: "#22D3EE" }}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
