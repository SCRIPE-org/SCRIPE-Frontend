// FILE-EXCEPTION: file length
// ═══════════════════════════════════════════════════════════════════════════
// Signup Domain Entities
// ═══════════════════════════════════════════════════════════════════════════

import { User } from "@modules/auth/core/domain/entities/User";

// ─── Wizard navigation ───────────────────────────────────────────────────────

/**
 * All possible steps in the signup wizard.
 * Ordered logically; the actual transition rules live in useSignupWizardState.
 */
export type SignupStep =
  | "discovery" // Step 0: Conversational discovery (Q1 business, Q2 team, Q3 priority)
  // NOTE: the standalone "category" step was retired — the vertical is asked ONCE in
  // Discovery Q1 and flows into the plan picker's initialCategory filter (no double-ask).
  | "plan" // Step 1: Choose edition/plan (currency-aware; vertical pre-filtered from Discovery Q1)
  | "account" // Step 3: Name, email, password
  | "verification" // Step 4: Email OTP
  | "workspace" // Step 5: Org name, subdomain, username
  | "contact-sales" // Step 5b: Lead form (wizard ends here for contact-sales editions)
  | "review" // Step 6: Review & confirm
  | "provisioning" // Step 7: Creating tenant (free mode only)
  | "complete"; // Step 8: Done

/** Server-authoritative checkout mode — the frontend NEVER infers this. */
export type CheckoutMode = "free" | "trial" | "checkout" | "contact-sales";

// ─── Plan selection snapshot ─────────────────────────────────────────────────

/**
 * Snapshot of the chosen plan, captured at selectPlan() time.
 * Drives the Review step copy and the provisioning flow branching.
 * All values come verbatim from the server — never computed client-side.
 */
export interface SelectedPlan {
  id: string;
  name: string;
  trialDays: number | null;
  checkoutMode: CheckoutMode;
  monthlyPrice: number | null;
  annualPrice: number | null;
  currency: string;
  /** Server-decided: "amount" | "free" | "custom" — never inferred from prices */
  priceDisplay: "amount" | "free" | "custom";
}

// ─── Persisted wizard state (sessionStorage snapshot for Stripe round-trip) ──

/**
 * Shape stored in sessionStorage by persistWizardState().
 * Password is intentionally excluded for security.
 */
export interface PersistedWizardState {
  step: SignupStep;
  wizardData: Omit<SignupWizardData, "password">;
  selectedPlan: SelectedPlan | null;
}

// ─── Plan picker view model types ────────────────────────────────────────────

/**
 * Presentation-ready edition shape used by PlanPickerStep and its ViewModel.
 * Produced by SignupMapper.toPlanEdition() — never constructed ad-hoc.
 */
export interface PlanEdition {
  id: string;
  name: string;
  tagline: string;
  tierLevel: number;
  /** Category slug ("general", "erp", …) */
  category: string | null;
  /** Localized category display name (server-resolved) */
  categoryDisplayName: string | null;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  /** Server-decided: "amount" | "free" | "custom" — never inferred from prices */
  priceDisplay: "amount" | "free" | "custom";
  trialDays: number | null;
  badge: string | null;
  topFeatures: PublicFeature[];
  allFeatures: PublicFeature[];
  /** Server-decided verbatim — drives ALL branching */
  checkoutMode: CheckoutMode;
  /** Original API entity — handed back to the wizard on selection */
  raw: PublicEdition;
}

/** Data for a single cell in the feature comparison table. */
export interface ComparisonCellData {
  value: string;
  valueType: string;
  displayLabelEn: string | null;
  displayLabelAr: string | null;
}

/** A single feature row in the comparison table, with values per edition. */
export interface ComparisonFeatureRow {
  featureName: string;
  label: string;
  values: Record<string, ComparisonCellData>;
}

/** A grouped category section in the comparison table. */
export interface ComparisonCategory {
  key: string;
  label: string;
  features: ComparisonFeatureRow[];
}

export interface SignupWizardData {
  // Step 0/1 — Category + Plan
  categoryKey: string | null;
  editionId: string | null;
  billingCycle: "Monthly" | "Annual" | "Lifetime" | null;
  /** Display + checkout currency — user-selectable (USD/EUR/SAR), defaults SAR for Arabic */
  currency: string;

  // Discovery Intelligence — Q1/Q2/Q3 (all optional, null = skipped)
  /** Category key chosen in Discovery Q1 (mirrors categoryKey but kept separate for CRM) */
  businessType: string | null;
  /** Team size band from Discovery Q2: "solo" | "2-10" | "11-50" | "51-200" | "200+" */
  teamSize: string | null;
  /** Primary priority from Discovery Q3: "analytics" | "automation" | "security" | ... */
  primaryPriority: string | null;
  /**
   * Recommended tier computed by the recommendation engine after Q3.
   * Used by PlanCard to show the "Recommended for you" badge.
   * "free" | "pro" | "business" | "enterprise" | null (not yet computed)
   */
  recommendedTier: string | null;
  /**
   * Translatable locale-key reasons backing the recommendation (from the backend scorer),
   * e.g. ["recommendation.reason.team.small", "recommendation.reason.vertical_match"].
   * Rendered under the recommended plan card. Null until Discovery completes.
   */
  recommendationReasons: string[] | null;

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
  /** Edition category slug for tab grouping: "general", "erp", "healthcare" */
  categoryKey: string | null;
  /** Localized category display name (server-resolved from Accept-Language) */
  categoryDisplayName: string | null;
  monthlyPrice: number | null;
  annualPrice: number | null;
  currency: string;
  /**
   * Server-decided price rendering: "amount" | "free" | "custom".
   * The frontend never infers free/custom from price values.
   */
  priceDisplay: "amount" | "free" | "custom";
  trialDays: number;
  badge: string | null;
  /** Top 5 features shown on the plan card */
  topFeatures: PublicFeature[];
  /** All features for the comparison table */
  allFeatures: PublicFeature[];
  /** Server-decided — drives ALL wizard branching. Never inferred client-side. */
  checkoutMode: "free" | "trial" | "checkout" | "contact-sales";
  isRecommended: boolean;
}

/** Category from GET /signup/categories — drives the Organization step. */
export interface PublicCategory {
  id: string;
  /** Stable slug ("general", "erp", "healthcare") sent back as the editions filter */
  key: string;
  /** Localized display name (server-resolved) */
  displayName: string;
  description: string | null;
  /** Arabic description for bilingual Discovery cards */
  descriptionAr: string | null;
  /**
   * Lucide icon name (e.g. "building-2", "heart-pulse", "factory").
   * Frontend renders dynamic icons without hardcoding by slug.
   */
  iconKey: string | null;
  /** Cheapest non-free monthly price in the requested currency; null = free/custom only */
  fromPriceMonthly: number | null;
  currency: string;
  sortOrder: number;
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
  /**
   * Server-decided register outcome:
   *   "active"   → free edition: tokens issued immediately, proceed to provisioning UI
   *   "checkout" → trial/paid: redirect the browser to checkoutUrl (Stripe-hosted page)
   */
  mode: "active" | "checkout";

  // ── mode === "active" ──
  accessToken: string | null;
  // Note: refreshToken is intentionally absent here.
  // CookieAuthMiddleware intercepts the /register response and moves the
  // refresh token to an httpOnly cookie before the client ever sees the body.
  // Storing it client-side would be a security violation.
  expiresAt: string | null;
  tenantId: string | null;
  tenantCode: string | null;
  tenantName: string | null;
  redirectUrl: string | null;
  user: User | null;

  // ── mode === "checkout" ──
  /** Stripe-hosted checkout URL — redirect with window.location.href */
  checkoutUrl: string | null;
  /** Opaque polling token: store in sessionStorage, poll GET /signup/status on /signup/finalize */
  signupRef: string | null;
}

/** GET /signup/status response — the finalize page polls this. */
export interface SignupStatusResult {
  status:
    | "pending"
    | "awaiting_payment"
    | "active"
    | "consumed"
    | "failed"
    | "abandoned"
    | "unknown";
  statusMessage: string | null;
  expiresAt: string | null;
}

export interface SignupCheckoutStatusResult {
  status: "pending" | "processing" | "completed" | "failed" | "expired" | "unknown";
  supportReference: string;
  message: string;
}

/** POST /signup/complete-session response — same auth shape as a free register. */
export interface SignupCompleteResult {
  accessToken: string;
  expiresAt: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  redirectUrl: string;
  user: User | null;
}

// ─── Resume / Change-plan ─────────────────────────────────────────────────────

/** Result of POST /signup/resume — plan snapshot for the resume modal. */
export interface ResumeSessionResult {
  status:
    | "pending"
    | "awaiting_payment"
    | "active"
    | "failed"
    | "consumed"
    | "abandoned"
    | "unknown";
  editionId: string | null;
  billingCycle: "monthly" | "yearly" | null;
  currency: string | null;
  expiresAt: string | null;
}

/** Result of POST /signup/change-plan — the new Stripe checkout URL to redirect to. */
export interface ChangePlanResult {
  checkoutUrl: string;
}

export interface ChangePlanPayload {
  signupRef: string;
  newEditionId: string;
  billingCycle: string;
  currency: string;
}

// ─── Pricing Context — geo-detected currency + exchange rates ────────────────

/** A single supported currency with display metadata and live exchange rate. */
export interface SupportedCurrency {
  /** ISO 4217 code — e.g. "EGP" */
  code: string;
  /** Display symbol — e.g. "£" */
  symbol: string;
  /** English name — e.g. "Egyptian Pound" */
  nameEn: string;
  /** Arabic name — e.g. "جنيه مصري" */
  nameAr: string;
  /**
   * How many units of this currency equal 1 USD (from open.er-api.com, cached 24h).
   * Example: 50.85 means 1 USD = 50.85 EGP.
   * Use this to display approximate local prices when no custom price is set.
   */
  rateFromUsd: number;
}

/**
 * Result of GET /api/v1/auth/signup/pricing-context.
 * Tells the plan picker which currency to default to and provides all FX rates.
 */
export interface PricingContext {
  /** Detected country code (ISO 3166-1 alpha-2), null if unknown. */
  detectedCountry: string | null;
  /** Recommended currency for the detected country — default "USD". */
  recommendedCurrency: string;
  /** All 15 supported currencies with symbols and live USD rates. */
  supportedCurrencies: SupportedCurrency[];
}

// ─── Recommendation result from backend scorer ───────────────────────────────

/**
 * Result of GET /api/v1/auth/signup/recommendation.
 * Server scores the Discovery Q1/Q2/Q3 answers against the live edition catalog.
 */
export interface SignupRecommendationResult {
  /** "free" | "standard" | "enterprise" | "ultimate" */
  recommendedTier: string;
  /** Human-readable edition name, e.g. "Pro", "Ultra" */
  recommendedEditionName: string;
  /** Raw score — diagnostic only, not shown in UI */
  score: number;
  /** "scored" | "catalog_empty" */
  reason: string;
  /**
   * Translatable locale keys explaining WHY this tier was recommended,
   * e.g. "recommendation.reason.team.small". Rendered under the recommended plan card.
   */
  reasons: string[];
}
