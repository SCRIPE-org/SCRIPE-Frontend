"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { MoneyInvoice, MoneyPayment, MoneyPaymentTimeline } from "../../domain/entities/Money";

/**
 * Documentation for const
 */
export const MANUAL_PAYMENT_METHODS = ["Cash", "Card", "POS", "BankTransfer", "Other"] as const;
type ManualPaymentMethod = (typeof MANUAL_PAYMENT_METHODS)[number];

/**
 * Documentation for module export
 */
export interface PaymentsViewModelMessages {
  fallbackError: string;
  validation: string;
  allocationPending: (paymentNumber: string) => string;
}

/**
 * Documentation for module export
 */
export interface PaymentsViewModelOptions {
  canView: boolean;
  canRecord: boolean;
  canIssueReceipt: boolean;
  canRefund: boolean;
  initialInvoiceId: string | null;
  messages: PaymentsViewModelMessages;
}

/**
 * Documentation for usePaymentsViewModel
 */
export function usePaymentsViewModel({
  canView,
  canRecord,
  canIssueReceipt,
  canRefund,
  initialInvoiceId,
  messages,
}: PaymentsViewModelOptions) {
  const { moneyRepository } = getVenueContainer();
  const [invoices, setInvoices] = useState<MoneyInvoice[] | null>(null);
  const [payments, setPayments] = useState<MoneyPayment[] | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<ManualPaymentMethod>("Cash");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refundPayment, setRefundPayment] = useState<MoneyPayment | null>(null);
  const [refundInvoiceId, setRefundInvoiceId] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundReference, setRefundReference] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [allocatingPayment, setAllocatingPayment] = useState<MoneyPayment | null>(null);
  const [allocationInvoiceId, setAllocationInvoiceId] = useState("");
  const [allocationAmount, setAllocationAmount] = useState("");
  const [allocating, setAllocating] = useState(false);
  const [timeline, setTimeline] = useState<MoneyPaymentTimeline | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const load = useCallback(async (preserveError = false) => {
    if (!preserveError) setError(null);
    try {
      const [invoicePage, paymentPage] = await Promise.all([
        moneyRepository.getInvoices(),
        moneyRepository.getPayments(),
      ]);
      setInvoices(invoicePage.items);
      setPayments(paymentPage.items);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messages.fallbackError);
    }
  }, [messages.fallbackError, moneyRepository]);

  useEffect(() => {
    if (canView) {
      void Promise.resolve().then(() => {
        void load();
      });
    }
  }, [canView, load]);

  useEffect(() => {
    if (!initialInvoiceId || !invoices?.some((invoice) => invoice.id === initialInvoiceId)) return;
    void Promise.resolve().then(() => {
      setSelectedInvoiceId(initialInvoiceId);
      const invoice = invoices.find((item) => item.id === initialInvoiceId);
      setAmount(invoice ? String(invoice.outstandingAmount) : "");
    });
  }, [initialInvoiceId, invoices]);

  const selectedInvoice = invoices?.find((invoice) => invoice.id === selectedInvoiceId) ?? null;
  const invoiceOptions = useMemo(
    () => (invoices ?? [])
      .filter((invoice) => invoice.outstandingAmount > 0)
      .map((invoice) => ({
        value: invoice.id,
        label: `${invoice.invoiceNumber} — ${invoice.currencyCode} ${invoice.outstandingAmount}`,
      })),
    [invoices]
  );

  const selectInvoice = useCallback((invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    const invoice = invoices?.find((item) => item.id === invoiceId);
    setAmount(invoice ? String(invoice.outstandingAmount) : "");
  }, [invoices]);

  const submit = useCallback(async () => {
    const numericAmount = Number(amount);
    if (!canRecord || !selectedInvoice || !reason.trim() || !Number.isFinite(numericAmount)
      || numericAmount <= 0 || numericAmount > selectedInvoice.outstandingAmount) {
      setError(messages.validation);
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payment = await moneyRepository.recordPayment({
        payerPartyId: selectedInvoice.payerPartyId,
        reservationId: selectedInvoice.reservationId,
        schedulableResourceId: selectedInvoice.schedulableResourceId,
        facilityResourceProfileId: null,
        method,
        currencyCode: selectedInvoice.currencyCode,
        amount: numericAmount,
        idempotencyKey: crypto.randomUUID(),
        externalReference: reference.trim() || null,
        reason: reason.trim(),
      });
      try {
        await moneyRepository.allocatePayment(payment.id, selectedInvoice.id, numericAmount, crypto.randomUUID());
        if (canIssueReceipt) await moneyRepository.issueReceipt(payment.id, crypto.randomUUID());
        setNotice("saved");
      } catch {
        // The payment fact is durable; never re-record it after allocation/receipt recovery fails.
        setError(messages.allocationPending(payment.paymentNumber));
      }
      await load(true);
      setAmount("");
      setReference("");
      setReason("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messages.fallbackError);
    } finally {
      setSaving(false);
    }
  }, [amount, canIssueReceipt, canRecord, load, messages, method, moneyRepository, reason, reference, selectedInvoice]);

  const refundCurrencyCode = refundPayment?.currencyCode;
  const refundInvoiceOptions = useMemo(
    () => (invoices ?? [])
      .filter((invoice) => invoice.currencyCode === refundCurrencyCode)
      .map((invoice) => ({ value: invoice.id, label: `${invoice.invoiceNumber} — ${invoice.currencyCode} ${invoice.effectiveTotalAmount}` })),
    [invoices, refundCurrencyCode]
  );

  const beginRefund = useCallback((payment: MoneyPayment) => {
    setRefundPayment(payment);
    const matchingInvoice = invoices?.find((invoice) => invoice.reservationId === payment.reservationId
      && invoice.currencyCode === payment.currencyCode);
    setRefundInvoiceId(matchingInvoice?.id ?? "");
    setRefundAmount(String(payment.amount));
    setRefundReason("");
    setRefundReference("");
    setError(null);
    setNotice(null);
  }, [invoices]);

  const submitRefund = useCallback(async () => {
    const numericAmount = Number(refundAmount);
    if (!canRefund || !refundPayment || !refundInvoiceId || !refundReason.trim()
      || !Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > refundPayment.amount) {
      setError(messages.validation);
      return;
    }
    setRefunding(true);
    setError(null);
    setNotice(null);
    try {
      await moneyRepository.refundPayment(refundPayment.id, {
        invoiceId: refundInvoiceId,
        amount: numericAmount,
        idempotencyKey: crypto.randomUUID(),
        reason: refundReason.trim(),
        externalReference: refundReference.trim() || null,
      });
      setNotice("refunded");
      setRefundPayment(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messages.fallbackError);
    } finally {
      setRefunding(false);
    }
  }, [canRefund, load, messages, moneyRepository, refundAmount, refundInvoiceId, refundPayment, refundReason, refundReference]);

  const allocatingCurrencyCode = allocatingPayment?.currencyCode;
  const allocationInvoiceOptions = useMemo(
    () => (invoices ?? [])
      .filter((invoice) => invoice.currencyCode === allocatingCurrencyCode && invoice.outstandingAmount > 0)
      .map((invoice) => ({
        value: invoice.id,
        label: `${invoice.invoiceNumber} — ${invoice.currencyCode} ${invoice.outstandingAmount}`,
      })),
    [invoices, allocatingCurrencyCode]
  );

  const beginAllocate = useCallback((payment: MoneyPayment) => {
    setAllocatingPayment(payment);
    const matchingInvoice = invoices?.find((invoice) =>
      invoice.reservationId === payment.reservationId &&
      invoice.currencyCode === payment.currencyCode &&
      invoice.outstandingAmount > 0
    );
    const defaultInvoice = matchingInvoice ?? invoices?.find((invoice) =>
      invoice.currencyCode === payment.currencyCode && invoice.outstandingAmount > 0
    );
    setAllocationInvoiceId(defaultInvoice?.id ?? "");
    const maxAllocatable = Math.min(
      payment.unallocatedAmount,
      defaultInvoice?.outstandingAmount ?? payment.unallocatedAmount
    );
    setAllocationAmount(maxAllocatable > 0 ? String(maxAllocatable) : "");
    setError(null);
    setNotice(null);
  }, [invoices]);

  const cancelAllocate = useCallback(() => {
    setAllocatingPayment(null);
    setAllocationInvoiceId("");
    setAllocationAmount("");
  }, []);

  const submitAllocation = useCallback(async () => {
    const numericAmount = Number(allocationAmount);
    if (!canRecord || !allocatingPayment || !allocationInvoiceId || !Number.isFinite(numericAmount)
      || numericAmount <= 0 || numericAmount > allocatingPayment.unallocatedAmount) {
      setError(messages.validation);
      return;
    }
    const targetInvoice = invoices?.find((inv) => inv.id === allocationInvoiceId);
    if (!targetInvoice || numericAmount > targetInvoice.outstandingAmount) {
      setError(messages.validation);
      return;
    }

    setAllocating(true);
    setError(null);
    setNotice(null);
    try {
      await moneyRepository.allocatePayment(
        allocatingPayment.id,
        allocationInvoiceId,
        numericAmount,
        crypto.randomUUID()
      );
      if (canIssueReceipt) {
        try {
          await moneyRepository.issueReceipt(allocatingPayment.id, crypto.randomUUID());
        } catch {
          // Allocation succeeded even if receipt issue is unavailable
        }
      }
      setNotice("allocated");
      setAllocatingPayment(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messages.fallbackError);
    } finally {
      setAllocating(false);
    }
  }, [allocationAmount, allocationInvoiceId, allocatingPayment, canIssueReceipt, canRecord, invoices, load, messages, moneyRepository]);

  const openTimeline = useCallback(async (paymentId: string) => {
    setTimelineLoading(true);
    setError(null);
    try {
      setTimeline(await moneyRepository.getPaymentTimeline(paymentId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messages.fallbackError);
    } finally {
      setTimelineLoading(false);
    }
  }, [messages.fallbackError, moneyRepository]);

  return {
    invoices,
    payments,
    loading: invoices === null || payments === null,
    selectedInvoice,
    selectedInvoiceId,
    amount,
    method,
    reference,
    reason,
    error,
    notice,
    saving,
    refundPayment,
    refundInvoiceId,
    refundAmount,
    refundReason,
    refundReference,
    refunding,
    allocatingPayment,
    allocationInvoiceId,
    allocationAmount,
    allocating,
    allocationInvoiceOptions,
    timeline,
    timelineLoading,
    refundInvoiceOptions,
    invoiceOptions,
    load,
    selectInvoice,
    setAmount,
    setMethod,
    setReference,
    setReason,
    submit,
    beginRefund,
    setRefundInvoiceId,
    setRefundAmount,
    setRefundReason,
    setRefundReference,
    submitRefund,
    beginAllocate,
    cancelAllocate,
    setAllocationInvoiceId,
    setAllocationAmount,
    submitAllocation,
    openTimeline,
    closeTimeline: () => setTimeline(null),
  };
}
