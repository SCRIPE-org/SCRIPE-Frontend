// ═══════════════════════════════════════════════════════════════════════════
// Signup Domain Constants
//
// Single source of truth for all compile-time constants in the signup domain.
// These live here (not in ViewModels) because they describe the domain's rules.
// ═══════════════════════════════════════════════════════════════════════════

import type { SignupWizardData } from "../entities";

// ─── Validation rules ────────────────────────────────────────────────────────

/** Minimum password length enforced on both client (Zod) and server (FluentValidation). */
export const PASSWORD_MIN_LENGTH = 12;

/**
 * Valid subdomain pattern.
 * - Starts and ends with a letter or digit
 * - Middle may contain letters, digits, or hyphens
 * - Minimum 3 characters
 */
export const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
export const SUBDOMAIN_MIN_LENGTH = 3;

// ─── Category / plan ordering ─────────────────────────────────────────────────

/**
 * Preferred display order for edition category tabs.
 * Categories not in this list are sorted alphabetically after the listed ones.
 */
export const CATEGORY_ORDER = ["general", "erp", "healthcare", "education", "finance"] as const;

/**
 * Preferred display order for feature group rows in the comparison table.
 * Groups not in this list appear after the listed ones, sorted alphabetically.
 */
export const FEATURE_CATEGORY_ORDER = [
  "Users & Access",
  "Modules",
  "Quotas",
  "Billing",
  "Security",
  "Performance",
  "Configuration",
  "Support",
  "General",
] as const;

// ─── Wizard defaults ──────────────────────────────────────────────────────────

/**
 * Default wizard state at start.
 * - `currency` starts as "USD" and is overridden on mount by the backend
 *   pricing-context endpoint (geo-detected from CF-IPCountry header).
 * - `timezone` is resolved at module load time (not on every render).
 * - `defaultLocale` is "en" by default; the orchestrator ViewModel overrides it
 *   to "ar" if the user is in Arabic mode.
 */
export const INITIAL_WIZARD_DATA: SignupWizardData = {
  // Plan
  categoryKey: null,
  editionId: null,
  billingCycle: null,
  currency: "USD", // Overridden by pricingContext.recommendedCurrency once fetched
  // Discovery Intelligence (all optional, null = skipped by user)
  businessType: null,
  teamSize: null,
  primaryPriority: null,
  // Account
  fullName: "",
  email: "",
  password: "",
  acceptTerms: false,
  marketingOptIn: false,
  emailVerificationToken: null,
  // Workspace
  workspaceName: "",
  subdomain: "",
  username: "",
  region: null,
  defaultLocale: "en",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};
