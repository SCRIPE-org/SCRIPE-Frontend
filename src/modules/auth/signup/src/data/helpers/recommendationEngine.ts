/**
 * recommendationEngine.ts
 *
 * Pure scoring function — no external dependencies, fully testable.
 *
 * Inputs: Discovery Q1 (businessType), Q2 (teamSize), Q3 (primaryPriority)
 * Output: "free" | "pro" | "ultra" | "enterprise"
 *
 * Scoring rules:
 *   teamSize:       solo=0, 2-10=1, 11-50=2, 51-200=3, 200+=4
 *   enterpriseSignals: healthcare/erp + (compliance|sso|hipaa|audit|white-label) = +2
 *   proSignals:        analytics|automation|integrations|api-access = +1
 *
 * Thresholds:
 *   ≤0 → "free"
 *   1-2 → "pro"
 *   3-4 → "ultra"
 *   ≥5  → "enterprise"
 */

export type RecommendedTier = "free" | "pro" | "ultra" | "enterprise";

interface DiscoveryAnswers {
  businessType: string | null;
  teamSize: string | null;
  primaryPriority: string | null;
}

const TEAM_SIZE_SCORES: Record<string, number> = {
  solo: 0,
  "2-10": 1,
  "11-50": 2,
  "51-200": 3,
  "200+": 4,
};

const ENTERPRISE_SIGNALS = new Set([
  "compliance",
  "sso",
  "hipaa",
  "audit",
  "white-label",
  "dedicated-support",
  "patient-data",
  "multi-tenant",
]);

const PRO_SIGNALS = new Set([
  "analytics",
  "automation",
  "integrations",
  "api-access",
  "customization",
  "collaboration",
]);

const ENTERPRISE_INDUSTRIES = new Set(["healthcare", "erp"]);

/**
 * Computes the recommended subscription tier based on Discovery answers.
 *
 * @returns One of "free" | "pro" | "business" | "enterprise"
 */
export function computeRecommendedTier(answers: DiscoveryAnswers): RecommendedTier {
  let score = 0;

  // ── Team size score ────────────────────────────────────────────────────────
  if (answers.teamSize) {
    score += TEAM_SIZE_SCORES[answers.teamSize] ?? 0;
  }

  // ── Priority-based signal ──────────────────────────────────────────────────
  // Multi-select: score ALL selected priorities, cap at 3 to avoid inflation
  const rawPriorities = (answers.primaryPriority ?? "")
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  let priorityScore = 0;
  for (const priority of rawPriorities) {
    if (ENTERPRISE_SIGNALS.has(priority)) priorityScore += 2;
    else if (PRO_SIGNALS.has(priority)) priorityScore += 1;
  }
  score += Math.min(priorityScore, 3); // cap at 3

  // ── Industry + compliance combo = strong enterprise signal ─────────────────
  const industry = answers.businessType?.toLowerCase() ?? "";
  const hasEnterpriseSignal = rawPriorities.some((p) => ENTERPRISE_SIGNALS.has(p));
  if (ENTERPRISE_INDUSTRIES.has(industry) && hasEnterpriseSignal) {
    score += 1; // bonus point for high-compliance industries
  }

  // ── Map score to tier ──────────────────────────────────────────────────────
  if (score <= 0) return "free";
  if (score <= 2) return "pro";
  if (score <= 4) return "ultra";
  return "enterprise";
}
