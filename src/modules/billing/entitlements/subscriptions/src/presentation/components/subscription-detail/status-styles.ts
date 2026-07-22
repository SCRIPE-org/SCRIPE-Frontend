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
    gradient: "from-success/10 via-success/5 to-transparent",
    glow: "shadow-success/5",
    icon: createElement(CheckCircle2, { className: "h-5 w-5 text-success" }),
    dotColor: "bg-success",
  },
  Trialing: {
    gradient: "from-warning/10 via-warning/5 to-transparent",
    glow: "shadow-warning/5",
    icon: createElement(Timer, { className: "h-5 w-5 text-warning" }),
    dotColor: "bg-warning",
  },
  Suspended: {
    gradient: "from-destructive/10 via-destructive/5 to-transparent",
    glow: "shadow-destructive/5",
    icon: createElement(PauseCircle, { className: "h-5 w-5 text-destructive" }),
    dotColor: "bg-destructive",
  },
  Canceled: {
    gradient: "from-muted-foreground/10 via-muted-foreground/5 to-transparent",
    glow: "shadow-foreground/5",
    icon: createElement(XCircle, { className: "h-5 w-5 text-muted-foreground" }),
    dotColor: "bg-muted-foreground",
  },
  Expired: {
    gradient: "from-muted-foreground/10 via-muted-foreground/5 to-transparent",
    glow: "shadow-foreground/5",
    icon: createElement(Clock, { className: "h-5 w-5 text-muted-foreground" }),
    dotColor: "bg-muted-foreground",
  },
  PendingPayment: {
    gradient: "from-info/10 via-info/5 to-transparent",
    glow: "shadow-info/5",
    icon: createElement(CreditCard, { className: "h-5 w-5 text-info" }),
    dotColor: "bg-info",
  },
  PastDue: {
    gradient: "from-warning/10 via-warning/5 to-transparent",
    glow: "shadow-warning/5",
    icon: createElement(AlertTriangle, { className: "h-5 w-5 text-warning" }),
    dotColor: "bg-warning",
  },
};

/**
 * Exported constant defining parameters and fields for d e f a u l t_ s t a t u s_ s t y l e configurations.
 */
export const DEFAULT_STATUS_STYLE = STATUS_STYLES.Active;
