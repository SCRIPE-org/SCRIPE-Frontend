/**
 * discoveryConstants.ts
 *
 * Shared constants and animation variants for the Discovery wizard.
 *
 * What lives here:
 *   - LUCIDE_MAP   — maps backend iconKey strings to Lucide React components
 *   - slideVariants / dotVariants — Framer Motion variants for step transitions
 *
 * What was removed (now engine-driven):
 *   - TEAM_SIZES, PRIORITIES_GENERAL, PRIORITIES_ERP, PRIORITIES_HEALTHCARE,
 *     getPrioritiesForBusinessType() — all question/option data is returned by
 *     the Onboarding Intelligence Engine API and rendered dynamically.
 */
import {
  Building2,
  HeartPulse,
  Factory,
  Store,
  Code2,
  GraduationCap,
  Globe,
  HelpCircle,
  Users,
  Zap,
  Shield,
  BarChart3,
  Workflow,
  Headphones,
  Puzzle,
  Sparkles,
  Lock,
  Settings,
  Database,
  Briefcase,
  Layers,
  ShoppingCart,
  TrendingUp,
  FileText,
  Server,
  Cloud,
  LayoutDashboard,
  Activity,
  CheckCircle,
  Star,
  Package,
} from "lucide-react";
import type { Variants } from "framer-motion";

// ─── Lucide icon map (from backend iconKey strings) ─────────────────────────
// Keys are the iconKey values returned by the Onboarding Intelligence Engine.
// Components that render engine options look up the icon here at render time.
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
  briefcase: Briefcase,
  layers: Layers,
  "shopping-cart": ShoppingCart,
  "trending-up": TrendingUp,
  "file-text": FileText,
  server: Server,
  cloud: Cloud,
  "layout-dashboard": LayoutDashboard,
  activity: Activity,
  "check-circle": CheckCircle,
  star: Star,
  package: Package,
};

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
  active: { scale: 1.2, opacity: 1 },
  inactive: { scale: 1, opacity: 0.3 },
};
