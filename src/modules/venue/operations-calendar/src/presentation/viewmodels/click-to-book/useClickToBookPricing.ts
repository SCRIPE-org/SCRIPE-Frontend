"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type {
  CustomerSummary,
  PriceQuote,
} from "@modules/venue";
import type { getVenueContainer } from "@modules/venue/di";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";
import { getIntentKey, getQuoteIntent } from "./clickToBookIntents";

interface UseClickToBookPricingProps {
  commercialPricingRepository: ReturnType<typeof getVenueContainer>["commercialPricingRepository"];
  selectedResource: CalendarResource | null;
  selectedCustomer: CustomerSummary | null;
  startUtc: string;
  endUtc: string;
  canOverridePrice: boolean;
  tRef: MutableRefObject<(key: string, params?: Record<string, string | number>) => string>;
  onQuoteLoaded: (grandTotal: number) => void;
}

/**
 * Sub-hook managing authoritative pricing quotes, price-change notices, and price overrides.
 */
export function useClickToBookPricing({
  commercialPricingRepository,
  selectedResource,
  selectedCustomer,
  startUtc,
  endUtc,
  canOverridePrice,
  tRef,
  onQuoteLoaded,
}: UseClickToBookPricingProps) {
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteExpiredMessage, setQuoteExpiredMessage] = useState(false);

  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  const previousQuoteRef = useRef<PriceQuote | null>(null);
  const [priceChangeNotice, setPriceChangeNotice] = useState<{
    oldPrice: number;
    newPrice: number;
    currency: string;
  } | null>(null);

  const quoteIntentRef = useRef<{
    fingerprint: string;
    key: string;
    expiresAtUtc: string;
  } | null>(null);
  const overrideIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);

  const onQuoteLoadedRef = useRef(onQuoteLoaded);
  useEffect(() => {
    onQuoteLoadedRef.current = onQuoteLoaded;
  }, [onQuoteLoaded]);

  const resetPricingState = useCallback(() => {
    previousQuoteRef.current = null;
    setPriceChangeNotice(null);
    setQuote(null);
    quoteIntentRef.current = null;
    setQuoteLoading(false);
    setQuoteError(null);
    setQuoteExpiredMessage(false);
    setOverrideOpen(false);
    setOverrideAmount("");
    setOverrideReason("");
    setOverrideLoading(false);
    setOverrideError(null);
  }, []);

  const fetchAuthoritativeQuote = useCallback(async () => {
    if (!selectedResource || !selectedCustomer) return;
    setQuoteLoading(true);
    setQuoteError(null);
    setQuoteExpiredMessage(false);

    try {
      const config = await commercialPricingRepository.getResourceConfiguration(
        selectedResource.id,
      );
      if (config?.effectiveFromUtc && Date.parse(config.effectiveFromUtc) > Date.now()) {
        setQuote(null);
        setQuoteError(tRef.current("operationsCalendar.clickToBook.pricing.activating"));
        return;
      }

      const quoteIntent = getQuoteIntent(
        quoteIntentRef,
        JSON.stringify([
          selectedResource.id,
          selectedCustomer.id,
          config.offeringId,
          config.currencyCode || "EGP",
          startUtc,
          endUtc,
          1,
        ]),
      );

      const calcQuote = await commercialPricingRepository.calculateQuote({
        offeringId: config.offeringId,
        resourceId: selectedResource.id,
        partyId: selectedCustomer.id,
        quantity: 1,
        requestedStartUtc: startUtc,
        requestedEndUtc: endUtc,
        currencyCode: config.currencyCode || "EGP",
        expiresAtUtc: quoteIntent.expiresAtUtc,
        idempotencyKey: quoteIntent.key,
      });

      if (
        previousQuoteRef.current &&
        calcQuote.grandTotal !== previousQuoteRef.current.grandTotal
      ) {
        setPriceChangeNotice({
          oldPrice: previousQuoteRef.current.grandTotal,
          newPrice: calcQuote.grandTotal,
          currency: calcQuote.currencyCode || "EGP",
        });
      }

      previousQuoteRef.current = calcQuote;
      setQuote(calcQuote);
      onQuoteLoadedRef.current(calcQuote.grandTotal);
    } catch (err) {
      setQuote(null);
      setQuoteError(
        err instanceof Error
          ? err.message
          : tRef.current("operationsCalendar.clickToBook.pricing.failed"),
      );
    } finally {
      setQuoteLoading(false);
    }
  }, [commercialPricingRepository, endUtc, selectedCustomer, selectedResource, startUtc, tRef]);

  const handleApplyPriceOverride = useCallback(async () => {
    if (!quote || !canOverridePrice || overrideLoading) return;
    const amount = Number(overrideAmount);
    if (!Number.isFinite(amount) || amount === 0) return;
    if (!overrideReason.trim()) return;

    setOverrideLoading(true);
    setOverrideError(null);
    try {
      const applied = await commercialPricingRepository.overrideQuote(quote.id, {
        adjustmentAmount: amount,
        reason: overrideReason.trim(),
        idempotencyKey: getIntentKey(
          overrideIntentRef,
          JSON.stringify([quote.id, amount, overrideReason.trim()]),
        ),
      });
      setQuote((current) =>
        current && current.id === quote.id
          ? { ...current, grandTotal: applied.overriddenGrandTotal }
          : current,
      );
      setOverrideOpen(false);
    } catch (err) {
      setOverrideError(
        err instanceof Error
          ? err.message
          : tRef.current("operationsCalendar.clickToBook.pricing.overrideFailed"),
      );
    } finally {
      setOverrideLoading(false);
    }
  }, [
    commercialPricingRepository,
    canOverridePrice,
    overrideAmount,
    overrideLoading,
    overrideReason,
    quote,
    tRef,
  ]);

  return {
    quote,
    quoteLoading,
    quoteError,
    quoteExpiredMessage,
    setQuoteExpiredMessage,
    overrideOpen,
    setOverrideOpen,
    overrideAmount,
    setOverrideAmount,
    overrideReason,
    setOverrideReason,
    overrideLoading,
    overrideError,
    priceChangeNotice,
    setPriceChangeNotice,
    fetchAuthoritativeQuote,
    handleApplyPriceOverride,
    resetPricingState,
  };
}
