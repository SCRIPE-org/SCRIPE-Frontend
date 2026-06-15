// ═══════════════════════════════════════════════════════════════════════════
// reviewLogic — pure helpers for the Review phase + resume detection (F8–F10).
//
// Extracted from the components/viewmodel so the branching contract is unit
// testable without rendering React. No imports beyond domain types — these are
// pure functions over the server-decided checkoutMode and a resume snapshot.
// ═══════════════════════════════════════════════════════════════════════════

import type { CheckoutMode, ResumeSessionResult } from "../../../domain/entities";

/** i18n keys for the Review CTA + heading/subtitle, keyed by checkoutMode. */
export interface ReviewCopyKeys {
  /** CTA label key (subscribe additionally needs the {{price}} param). */
  ctaKey: string;
  titleKey: string;
  subtitleKey: string;
  /** Whether ANY payment language is allowed on this screen. Free → false. */
  showsPaymentLanguage: boolean;
}

/**
 * Maps the server-decided checkoutMode onto the Review screen's copy contract.
 * Free shows ZERO payment language; trial/checkout do. The frontend NEVER infers
 * the mode — it is passed through verbatim from the selected plan snapshot.
 */
export function reviewCopyKeysForMode(mode: CheckoutMode): ReviewCopyKeys {
  switch (mode) {
    case "free":
      return {
        ctaKey: "signup.review.createWorkspaceCta",
        titleKey: "signup.review.freeTitle",
        subtitleKey: "signup.review.freeSubtitle",
        showsPaymentLanguage: false,
      };
    case "trial":
      return {
        ctaKey: "signup.review.startTrialShortCta",
        titleKey: "signup.review.trialTitle",
        subtitleKey: "signup.review.trialSubtitle",
        showsPaymentLanguage: true,
      };
    case "checkout":
      return {
        ctaKey: "signup.review.subscribeCta",
        titleKey: "signup.review.checkoutTitle",
        subtitleKey: "signup.review.checkoutSubtitle",
        showsPaymentLanguage: true,
      };
    case "contact-sales":
    default:
      // contact-sales never reaches Review (it diverts at the plan phase); we
      // fall back to checkout copy defensively rather than throwing.
      return {
        ctaKey: "signup.review.checkoutCta",
        titleKey: "signup.review.checkoutTitle",
        subtitleKey: "signup.review.checkoutSubtitle",
        showsPaymentLanguage: true,
      };
  }
}

/**
 * Whether the in-page free provisioning runs (vs. a Stripe redirect). Only the
 * free mode provisions in-page; trial/checkout hand off to Stripe.
 */
export function isInPageProvisioning(mode: CheckoutMode): boolean {
  return mode === "free";
}

/**
 * Decides whether the resume modal should be shown for a persisted signupRef.
 * Only sessions the server still considers resumable (pending / awaiting_payment)
 * qualify; terminal / unknown states (and a missing ref) do not.
 */
export function shouldShowResumeModal(
  ref: string | null,
  info: ResumeSessionResult | null,
): boolean {
  if (!ref || !info) return false;
  return info.status === "pending" || info.status === "awaiting_payment";
}
