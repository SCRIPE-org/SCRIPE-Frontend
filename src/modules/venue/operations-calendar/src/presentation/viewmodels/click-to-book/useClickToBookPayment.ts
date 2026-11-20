"use client";

import { useCallback, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type {
  CustomerSummary,
  ISchedulableResourceRepository,
  PriceQuote,
} from "@modules/venue";
import type { getVenueContainer } from "@modules/venue/di";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";
import { extractApiErrorMessage, getIntentKey } from "./clickToBookIntents";

export type ClickToBookPaymentMethod = "Cash" | "Card" | "POS" | "BankTransfer" | "Other";

interface UseClickToBookPaymentProps {
  moneyRepository: ReturnType<typeof getVenueContainer>["moneyRepository"];
  schedulableResourceRepository: ISchedulableResourceRepository;
  resources: CalendarResource[];
  selectedResource: CalendarResource | null;
  selectedCustomer: CustomerSummary | null;
  reservationId: string | null;
  quote: PriceQuote | null;
  canRecordPayment: boolean;
  tRef: MutableRefObject<(key: string, params?: Record<string, string | number>) => string>;
}

/**
 * Sub-hook managing booking-time payment selection, profile resolution,
 * idempotent payment recording, and post-confirmation manual retries.
 */
export function useClickToBookPayment({
  moneyRepository,
  schedulableResourceRepository,
  resources,
  selectedResource,
  selectedCustomer,
  reservationId,
  quote,
  canRecordPayment,
  tRef,
}: UseClickToBookPaymentProps) {
  const [paymentChoice, setPaymentChoice] = useState<"later" | "now">("later");
  const [payNowAmount, setPayNowAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<ClickToBookPaymentMethod>("Cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentPartialFailure, setPaymentPartialFailure] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
  const [recordingPaymentManual, setRecordingPaymentManual] = useState(false);

  const paymentIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);
  const allocationIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);

  const resetPaymentState = useCallback(() => {
    setPaymentChoice("later");
    setPayNowAmount(0);
    setAmountPaid(0);
    setPaymentPartialFailure(false);
    setPaymentErrorMessage(null);
    paymentIntentRef.current = null;
    allocationIntentRef.current = null;
  }, []);

  const resolveFacilityProfileId = useCallback(
    async (resource: CalendarResource): Promise<string> => {
      let profileId: string | null = resource.profileId || null;
      if (!profileId && resources.length > 0) {
        profileId = resources.find((r) => r.id === resource.id)?.profileId ?? null;
      }
      if (!profileId && schedulableResourceRepository?.getById) {
        try {
          const fullResource = await schedulableResourceRepository.getById(resource.id);
          profileId = fullResource?.facilityResourceProfileId ?? null;
        } catch {
          // Handled cleanly by the missing-profile check below
        }
      }
      if (!profileId) {
        throw new Error(
          tRef.current("operationsCalendar.clickToBook.payment.missingResourceProfile"),
        );
      }
      return profileId;
    },
    [resources, schedulableResourceRepository, tRef],
  );

  const recordAndAllocatePayment = useCallback(
    async (params: {
      targetReservationId: string;
      resource: CalendarResource;
      customerId: string;
      amount: number;
      currencyCode: string;
      reason: string;
      accumulatePaid: boolean;
    }) => {
      try {
        const profileId = await resolveFacilityProfileId(params.resource);
        const extRef = paymentReference.trim() || null;
        const payment = await moneyRepository.recordPayment({
          reservationId: params.targetReservationId,
          payerPartyId: params.customerId,
          schedulableResourceId: params.resource.id,
          facilityResourceProfileId: profileId,
          amount: params.amount,
          currencyCode: params.currencyCode,
          method: paymentMethod,
          externalReference: extRef,
          reason: params.reason,
          idempotencyKey: getIntentKey(
            paymentIntentRef,
            JSON.stringify([
              params.targetReservationId,
              params.customerId,
              params.resource.id,
              profileId,
              params.amount,
              params.currencyCode,
              paymentMethod,
              extRef,
              params.reason,
            ]),
          ),
        });

        if (params.accumulatePaid) {
          setAmountPaid((prev) => prev + params.amount);
        } else {
          setAmountPaid(params.amount);
        }
        setPaymentPartialFailure(false);
        setPaymentErrorMessage(null);

        try {
          const invoicePage = await moneyRepository.getInvoices(1, 10, {
            reservationId: params.targetReservationId,
          });
          const invoice =
            invoicePage?.items?.find((inv) => inv.reservationId === params.targetReservationId) ??
            invoicePage?.items?.[0];
          if (invoice) {
            await moneyRepository.allocatePayment(
              payment.id,
              invoice.id,
              params.amount,
              getIntentKey(
                allocationIntentRef,
                JSON.stringify([payment.id, invoice.id, params.amount]),
              ),
            );
          }
        } catch {
          // Outbox materialization may still be processing; payment record preserved
        }
      } catch (payErr: unknown) {
        const msg = extractApiErrorMessage(
          payErr,
          tRef.current("operationsCalendar.clickToBook.payment.recordFailed"),
        );
        setPaymentErrorMessage(msg);
        if (!params.accumulatePaid) {
          setAmountPaid(0);
        }
        setPaymentPartialFailure(true);
      }
    },
    [moneyRepository, paymentMethod, paymentReference, resolveFacilityProfileId, tRef],
  );

  const remainingBalance = Math.max(0, (quote?.grandTotal ?? 0) - amountPaid);

  const handleManualRecordPayment = async () => {
    if (!canRecordPayment || !reservationId || !selectedCustomer || !quote || !selectedResource) {
      return;
    }
    setRecordingPaymentManual(true);
    setPaymentErrorMessage(null);
    try {
      const toPay =
        payNowAmount > 0
          ? payNowAmount
          : remainingBalance > 0
            ? remainingBalance
            : quote.grandTotal;
      await recordAndAllocatePayment({
        targetReservationId: reservationId,
        resource: selectedResource,
        customerId: selectedCustomer.id,
        amount: toPay,
        currencyCode: quote.currencyCode || "EGP",
        reason: tRef.current("operationsCalendar.clickToBook.payment.manualAuditNote"),
        accumulatePaid: true,
      });
    } finally {
      setRecordingPaymentManual(false);
    }
  };

  return {
    paymentChoice,
    setPaymentChoice,
    payNowAmount,
    setPayNowAmount,
    paymentMethod,
    setPaymentMethod,
    paymentReference,
    setPaymentReference,
    amountPaid,
    paymentPartialFailure,
    paymentErrorMessage,
    recordingPaymentManual,
    remainingBalance,
    recordAndAllocatePayment,
    handleManualRecordPayment,
    resetPaymentState,
  };
}
