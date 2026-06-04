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
  username: string;
  region: string | null;
  defaultLocale: "en" | "ar";
  timezone: string;
}

// ─── Rich feature value for a specific edition ─────────────────────────────

export interface PublicFeature {
  /** Display name in English */
  name: string;
  /** Display name in Arabic (null if not set) */
  nameAr: string | null;
  /** Description / tooltip */
  description: string | null;
  /**
   * UI grouping: "Modules", "Quotas", "Security", "Support", etc.
   * Used to build category sections in the comparison table.
   */
  category: string;
  /** How to interpret the value */
  valueType: "Boolean" | "Numeric" | "Text";
  /**
   * The value for this edition:
   *   Boolean → "true" | "false"
   *   Numeric → "10" | "-1" (unlimited) | "100"
   *   Text    → "24/7 Support" | "1 GB" | "Community only"
   */
  value: string;
  sortOrder: number;
  /**
   * Per-edition display label override (English).
   * When set, plan cards show this text instead of the feature name + raw value.
   * E.g., "Up to 25 Admins" instead of "Max Admins: 25".
   */
  displayLabelEn?: string | null;
  /** Per-edition display label override (Arabic). */
  displayLabelAr?: string | null;
  /** If true, this is a marketing feature (e.g. "24/7 Support") — not enforced at runtime. */
  isMarketingOnly?: boolean;
}

// ─── Public edition from the API ───────────────────────────────────────────

export interface PublicEdition {
  id: string;
  name: string;
  tagline: string | null;
  tier: number;
  /** Edition category for tab grouping: "General", "ERP", "Healthcare" */
  category: string | null;
  monthlyPrice: number | null;
  annualPrice: number | null;
  currency: string;
  trialDays: number;
  badge: string | null;
  /** Top 5 features shown on the plan card */
  topFeatures: PublicFeature[];
  /** All features for the comparison table */
  allFeatures: PublicFeature[];
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
