// ═══════════════════════════════════════════════════════════════════════════
// reviewLogic — pure unit tests (Vitest)
//
// Covers the Review-phase branching contract + resume detection that F8–F10 add:
//   • checkoutMode → CTA / heading / payment-language mapping (free shows ZERO
//     payment language; trial/checkout do);
//   • free is the only in-page provisioning mode (others redirect to Stripe);
//   • resume modal shows only for resumable server states with a present ref.
// No React — these are pure functions over server-decided inputs.
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { reviewCopyKeysForMode, isInPageProvisioning, shouldShowResumeModal } from "./reviewLogic";
import type { CheckoutMode, ResumeSessionResult } from "../../../domain/entities";

describe("reviewCopyKeysForMode", () => {
  it("free → create-workspace CTA and ZERO payment language", () => {
    const c = reviewCopyKeysForMode("free");
    expect(c.ctaKey).toBe("signup.review.createWorkspaceCta");
    expect(c.titleKey).toBe("signup.review.freeTitle");
    expect(c.showsPaymentLanguage).toBe(false);
  });

  it("trial → start-trial CTA and payment language allowed", () => {
    const c = reviewCopyKeysForMode("trial");
    expect(c.ctaKey).toBe("signup.review.startTrialShortCta");
    expect(c.titleKey).toBe("signup.review.trialTitle");
    expect(c.showsPaymentLanguage).toBe(true);
  });

  it("checkout → subscribe CTA (price interpolated by caller) and payment language", () => {
    const c = reviewCopyKeysForMode("checkout");
    expect(c.ctaKey).toBe("signup.review.subscribeCta");
    expect(c.titleKey).toBe("signup.review.checkoutTitle");
    expect(c.showsPaymentLanguage).toBe(true);
  });

  it("contact-sales falls back to checkout copy defensively (never throws)", () => {
    const c = reviewCopyKeysForMode("contact-sales");
    expect(c.titleKey).toBe("signup.review.checkoutTitle");
    expect(c.showsPaymentLanguage).toBe(true);
  });

  it("free is the ONLY mode with no payment language", () => {
    const modes: CheckoutMode[] = ["free", "trial", "checkout", "contact-sales"];
    const noPayment = modes.filter((m) => !reviewCopyKeysForMode(m).showsPaymentLanguage);
    expect(noPayment).toEqual(["free"]);
  });
});

describe("isInPageProvisioning", () => {
  it("only free provisions in-page; trial/checkout/contact-sales redirect", () => {
    expect(isInPageProvisioning("free")).toBe(true);
    expect(isInPageProvisioning("trial")).toBe(false);
    expect(isInPageProvisioning("checkout")).toBe(false);
    expect(isInPageProvisioning("contact-sales")).toBe(false);
  });
});

describe("shouldShowResumeModal", () => {
  const make = (status: ResumeSessionResult["status"]): ResumeSessionResult => ({
    status,
    editionId: "ed_1",
    billingCycle: "monthly",
    currency: "USD",
    expiresAt: null,
  });

  it("shows for pending / awaiting_payment with a present ref", () => {
    expect(shouldShowResumeModal("ref_1", make("pending"))).toBe(true);
    expect(shouldShowResumeModal("ref_1", make("awaiting_payment"))).toBe(true);
  });

  it("hides for terminal / unknown server states", () => {
    expect(shouldShowResumeModal("ref_1", make("active"))).toBe(false);
    expect(shouldShowResumeModal("ref_1", make("consumed"))).toBe(false);
    expect(shouldShowResumeModal("ref_1", make("failed"))).toBe(false);
    expect(shouldShowResumeModal("ref_1", make("abandoned"))).toBe(false);
    expect(shouldShowResumeModal("ref_1", make("unknown"))).toBe(false);
  });

  it("hides when the ref or the resume info is missing", () => {
    expect(shouldShowResumeModal(null, make("pending"))).toBe(false);
    expect(shouldShowResumeModal("ref_1", null)).toBe(false);
  });
});
