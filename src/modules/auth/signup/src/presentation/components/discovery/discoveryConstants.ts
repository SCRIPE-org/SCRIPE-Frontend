/**
 * discoveryConstants.ts
 *
 * All static data and animation variants for the Discovery wizard.
 * Separated from components to keep each file focused and testable.
 * Labels are KEYS, not raw strings — components call t(key) at render time.
 */
import {
  Building2, HeartPulse, Factory, Store, Code2, GraduationCap,
  Globe, HelpCircle, Users, Zap, Shield, BarChart3, Workflow,
  Headphones, Puzzle, Sparkles, Lock, Settings, Database,
} from "lucide-react";
import type { Variants } from "framer-motion";

// ─── Lucide icon map (from backend iconKey strings) ─────────────────────────
export const LUCIDE_MAP: Record<string, React.ElementType> = {
  "building-2": Building2,
  "heart-pulse": HeartPulse,
  factory: Factory,
  store: Store,
  code2: Code2,
  "graduation-cap": GraduationCap,
  globe: Globe,
  "help-circle": HelpCircle,
  users: Users,
  zap: Zap,
  shield: Shield,
  "bar-chart-3": BarChart3,
  workflow: Workflow,
  headphones: Headphones,
  puzzle: Puzzle,
  sparkles: Sparkles,
  lock: Lock,
  settings: Settings,
  database: Database,
};

// ─── Team size options (Q2) — labelKey + sublabelKey map to signup.discovery.teamSize locale section ─
export interface TeamSizeOption {
  value: string;
  labelKey: string;
  sublabelKey: string;
  icon: string;
}

export const TEAM_SIZES: TeamSizeOption[] = [
  { value: "solo",    labelKey: "signup.discovery.teamSize.solo",       sublabelKey: "signup.discovery.teamSize.soloSub",       icon: "👤" },
  { value: "2-10",    labelKey: "signup.discovery.teamSize.small",      sublabelKey: "signup.discovery.teamSize.smallSub",      icon: "👥" },
  { value: "11-50",   labelKey: "signup.discovery.teamSize.medium",     sublabelKey: "signup.discovery.teamSize.mediumSub",     icon: "🏢" },
  { value: "51-200",  labelKey: "signup.discovery.teamSize.growing",    sublabelKey: "signup.discovery.teamSize.growingSub",    icon: "🌆" },
  { value: "200+",    labelKey: "signup.discovery.teamSize.enterprise", sublabelKey: "signup.discovery.teamSize.enterpriseSub", icon: "🏙️" },
];

// ─── Priority options (Q3) — DYNAMIC per businessType ────────────────────────
export interface PriorityOption {
  value: string;
  labelKey: string;
  icon: React.ElementType;
  color: string;
}

/**
 * General / default priority options — shown when no specific industry match.
 */
export const PRIORITIES_GENERAL: PriorityOption[] = [
  { value: "analytics",      labelKey: "signup.discovery.priority.analytics",      icon: BarChart3,  color: "#8B5CF6" },
  { value: "automation",     labelKey: "signup.discovery.priority.automation",     icon: Workflow,   color: "#06B6D4" },
  { value: "security",       labelKey: "signup.discovery.priority.security",       icon: Shield,     color: "#10B981" },
  { value: "collaboration",  labelKey: "signup.discovery.priority.collaboration",  icon: Users,      color: "#F59E0B" },
  { value: "integrations",   labelKey: "signup.discovery.priority.integrations",   icon: Puzzle,     color: "#EC4899" },
  { value: "support",        labelKey: "signup.discovery.priority.support",        icon: Headphones, color: "#6366F1" },
  { value: "speed",          labelKey: "signup.discovery.priority.speed",          icon: Zap,        color: "#EF4444" },
  { value: "customization",  labelKey: "signup.discovery.priority.customization",  icon: Code2,      color: "#14B8A6" },
];

/**
 * ERP-specific priorities — shown for ERP / factory / similar industries.
 */
export const PRIORITIES_ERP: PriorityOption[] = [
  { value: "automation",     labelKey: "signup.discovery.priority.automation",     icon: Workflow,   color: "#06B6D4" },
  { value: "analytics",      labelKey: "signup.discovery.priority.analytics",      icon: BarChart3,  color: "#8B5CF6" },
  { value: "integrations",   labelKey: "signup.discovery.priority.integrations",   icon: Puzzle,     color: "#EC4899" },
  { value: "multi-tenant",   labelKey: "signup.discovery.priority.multiTenant",    icon: Building2,  color: "#F59E0B" },
  { value: "compliance",     labelKey: "signup.discovery.priority.compliance",     icon: Shield,     color: "#10B981" },
  { value: "api-access",     labelKey: "signup.discovery.priority.apiAccess",      icon: Database,   color: "#3B82F6" },
  { value: "white-label",    labelKey: "signup.discovery.priority.whiteLabel",     icon: Settings,   color: "#14B8A6" },
  { value: "sso",            labelKey: "signup.discovery.priority.sso",            icon: Lock,       color: "#6366F1" },
];

/**
 * Healthcare-specific priorities — emphasize compliance and security.
 */
export const PRIORITIES_HEALTHCARE: PriorityOption[] = [
  { value: "hipaa",            labelKey: "signup.discovery.priority.hipaa",           icon: Shield,     color: "#10B981" },
  { value: "patient-data",     labelKey: "signup.discovery.priority.patientData",     icon: Lock,       color: "#6366F1" },
  { value: "audit",            labelKey: "signup.discovery.priority.audit",           icon: Database,   color: "#8B5CF6" },
  { value: "integrations",     labelKey: "signup.discovery.priority.integrations",    icon: Puzzle,     color: "#EC4899" },
  { value: "analytics",        labelKey: "signup.discovery.priority.analytics",       icon: BarChart3,  color: "#8B5CF6" },
  { value: "sso",              labelKey: "signup.discovery.priority.sso",             icon: Lock,       color: "#F59E0B" },
  { value: "dedicated-support",labelKey: "signup.discovery.priority.dedicatedSupport",icon: Headphones, color: "#06B6D4" },
  { value: "compliance",       labelKey: "signup.discovery.priority.compliance",      icon: Shield,     color: "#14B8A6" },
];

/**
 * Get priorities for Q3 based on Q1 businessType answer.
 * Falls back to PRIORITIES_GENERAL for unknown industry types.
 */
export function getPrioritiesForBusinessType(businessType: string | null): PriorityOption[] {
  if (!businessType) return PRIORITIES_GENERAL;
  const key = businessType.toLowerCase();
  if (key === "erp" || key === "factory" || key === "manufacturing") return PRIORITIES_ERP;
  if (key === "healthcare" || key === "medical") return PRIORITIES_HEALTHCARE;
  return PRIORITIES_GENERAL;
}

/**
 * @deprecated Use getPrioritiesForBusinessType() instead.
 * Kept for backward compatibility with components importing PRIORITIES.
 */
export const PRIORITIES: PriorityOption[] = PRIORITIES_GENERAL;

// ─── Framer Motion variants ───────────────────────────────────────────────────
export const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 32 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.18 },
  }),
};

export const dotVariants: Variants = {
  active:   { scale: 1.2, opacity: 1 },
  inactive: { scale: 1,   opacity: 0.3 },
};
