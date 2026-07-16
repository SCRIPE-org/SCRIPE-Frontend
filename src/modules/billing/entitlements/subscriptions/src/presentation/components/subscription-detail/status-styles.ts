/**
 * Status Design Tokens
 *
 * Visual styling constants for subscription status indicators.
 * Used across HeroCard, HistorySection, and other status-aware components.
 */
import {
  CheckCircle2,
  Timer,
  PauseCircle,
  XCircle,
  Clock,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { createElement } from "react";

/**
 * Interface defining property specifications, keys types, and structural contract rules for status style.
 */
export interface StatusStyle {
  gradient: string;
  glow: string;
  icon: React.ReactNode;
  dotColor: string;
}

/**
 * Exported constant defining parameters and fields for s t a t u s_ s t y l e s configurations.
 */
export const STATUS_STYLES: Record<string, StatusStyle> = {
  Active: {
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    glow: "shadow-emerald-500/5",
    icon: createElement(CheckCircle2, { className: "h-5 w-5 text-emerald-500" }),
    dotColor: "bg-emerald-500",
  },
  Trialing: {
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    glow: "shadow-amber-500/5",
    icon: createElement(Timer, { className: "h-5 w-5 text-amber-500" }),
    dotColor: "bg-amber-500",
  },
  Suspended: {
    gradient: "from-red-500/10 via-red-500/5 to-transparent",
    glow: "shadow-red-500/5",
    icon: createElement(PauseCircle, { className: "h-5 w-5 text-red-500" }),
    dotColor: "bg-red-500",
  },
  Canceled: {
    gradient: "from-zinc-500/10 via-zinc-500/5 to-transparent",
    glow: "shadow-zinc-500/5",
    icon: createElement(XCircle, { className: "h-5 w-5 text-zinc-500" }),
    dotColor: "bg-zinc-500",
  },
  Expired: {
    gradient: "from-zinc-500/10 via-zinc-500/5 to-transparent",
    glow: "shadow-zinc-500/5",
    icon: createElement(Clock, { className: "h-5 w-5 text-zinc-500" }),
    dotColor: "bg-zinc-500",
  },
  PendingPayment: {
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    glow: "shadow-blue-500/5",
    icon: createElement(CreditCard, { className: "h-5 w-5 text-blue-500" }),
    dotColor: "bg-blue-500",
  },
  PastDue: {
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    glow: "shadow-orange-500/5",
    icon: createElement(AlertTriangle, { className: "h-5 w-5 text-orange-500" }),
    dotColor: "bg-orange-500",
  },
};

/**
 * Exported constant defining parameters and fields for d e f a u l t_ s t a t u s_ s t y l e configurations.
 */
export const DEFAULT_STATUS_STYLE = STATUS_STYLES.Active;
