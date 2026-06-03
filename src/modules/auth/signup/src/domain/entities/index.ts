// ═══════════════════════════════════════════════════════════════════════════
// Signup Domain Entities
// ═══════════════════════════════════════════════════════════════════════════

export interface SignupWizardData {
  // Step 1 — Plan
  editionId: string | null;
  billingCycle: "Monthly" | "Annual" | "Lifetime" | null;
  currency: string;
  promoCode: string;

  // Step 2 — Account
  fullName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  marketingOptIn: boolean;

  // Step 3 — Verification
  emailVerificationToken: string | null;

  // Step 4 — Workspace
  workspaceName: string;
  subdomain: string;
  region: string | null;
  defaultLocale: "en" | "ar";
  timezone: string;
}

export interface PublicEdition {
  id: string;
  name: string;
  tagline: string | null;
  tier: number;
  monthlyPrice: number | null;
  annualPrice: number | null;
  currency: string;
  trialDays: number;
  badge: string | null;
  topFeatures: string[];
  checkoutMode: "free" | "trial" | "checkout" | "contact-sales";
  isRecommended: boolean;
}

export interface SubdomainCheckResult {
  available: boolean;
  suggestion: string | null;
  reason: "taken" | "reserved" | "invalid_format" | null;
}

export interface SignupOtpResult {
  sent: boolean;
  retryAfterSeconds: number;
}

export interface SignupVerificationResult {
  isValid: boolean;
  verificationToken: string | null;
  error: string | null;
}

export interface SignupResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  redirectUrl: string;
  userProfile: Record<string, unknown> | null;
}
