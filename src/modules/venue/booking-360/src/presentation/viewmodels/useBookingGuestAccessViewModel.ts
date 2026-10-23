"use client";

import { useState, useCallback, useEffect } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { GuestAccessStatus } from "../../domain/entities/Booking360";

export interface UseBookingGuestAccessViewModelProps {
  reservationId: string;
  customerEmail?: string | null;
}

export function useBookingGuestAccessViewModel({
  reservationId,
  customerEmail,
}: UseBookingGuestAccessViewModelProps) {
  const { booking360Repository } = getVenueContainer();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<GuestAccessStatus | null>(null);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      setFeedbackError(null);
      const res = await booking360Repository.getGuestAccessStatus(reservationId);
      setStatus(res);
    } catch {
      setStatus({
        hasActiveLink: false,
        isRevoked: false,
      });
    } finally {
      setLoading(false);
    }
  }, [booking360Repository, reservationId]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleGenerateLink = async () => {
    try {
      setGenerating(true);
      setFeedbackError(null);
      setSendSuccess(null);
      const res = await booking360Repository.generateGuestAccess(reservationId);

      const fullUrl = res.guestAccessLink.startsWith("http")
        ? res.guestAccessLink
        : `${typeof window !== "undefined" ? window.location.origin : ""}${res.guestAccessLink}`;

      setActiveLink(fullUrl);
      setStatus({
        hasActiveLink: true,
        expiresAtUtc: res.expiresAtUtc,
        isRevoked: false,
      });
    } catch (err: any) {
      setFeedbackError(err?.message || "Failed to generate guest link.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeLink) return;
    navigator.clipboard.writeText(activeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendLink = async () => {
    try {
      setSending(true);
      setFeedbackError(null);
      setSendSuccess(null);
      const res = await booking360Repository.sendGuestLink(
        reservationId,
        customerEmail || undefined
      );

      if (res.sent) {
        setSendSuccess(`Guest link dispatched to ${res.recipient || "customer"}.`);
      } else {
        setFeedbackError(
          "Email delivery could not be completed. You can copy and share the link manually."
        );
      }
    } catch (err: any) {
      setFeedbackError(err?.message || "Failed to dispatch guest link.");
    } finally {
      setSending(false);
    }
  };

  const handleRevokeLink = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Are you sure you want to revoke this guest link? The customer will no longer be able to view or manage their booking with it."
      )
    ) {
      return;
    }

    try {
      setRevoking(true);
      setFeedbackError(null);
      setSendSuccess(null);
      await booking360Repository.revokeGuestAccess(reservationId, "Revoked by operator");
      setActiveLink(null);
      await loadStatus();
    } catch (err: any) {
      setFeedbackError(err?.message || "Failed to revoke guest link.");
    } finally {
      setRevoking(false);
    }
  };

  return {
    loading,
    status,
    activeLink,
    copied,
    generating,
    sending,
    revoking,
    sendSuccess,
    feedbackError,
    handleGenerateLink,
    handleCopyLink,
    handleSendLink,
    handleRevokeLink,
  };
}
