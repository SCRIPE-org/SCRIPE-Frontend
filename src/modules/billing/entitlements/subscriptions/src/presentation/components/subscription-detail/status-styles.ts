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
  icon: React.ReactNode;
  dotColor: string;
}

/**
 * Exported constant defining parameters and fields for s t a t u s_ s t y l e s configurations.
 */
export const STATUS_STYLES: Record<string, StatusStyle> = {
  Active: {
    icon: createElement(CheckCircle2, { className: "h-5 w-5 text-success" }),
    dotColor: "bg-success",
  },
  Trialing: {
    icon: createElement(Timer, { className: "h-5 w-5 text-warning" }),
    dotColor: "bg-warning",
  },
  Suspended: {
    icon: createElement(PauseCircle, { className: "h-5 w-5 text-destructive" }),
    dotColor: "bg-destructive",
  },
  Canceled: {
    icon: createElement(XCircle, { className: "h-5 w-5 text-nx-ink-3" }),
    dotColor: "bg-nx-ink-3",
  },
  Expired: {
    icon: createElement(Clock, { className: "h-5 w-5 text-nx-ink-3" }),
    dotColor: "bg-nx-ink-3",
  },
  PendingPayment: {
    icon: createElement(CreditCard, { className: "h-5 w-5 text-info" }),
    dotColor: "bg-info",
  },
  PastDue: {
    icon: createElement(AlertTriangle, { className: "h-5 w-5 text-warning" }),
    dotColor: "bg-warning",
  },
};

/**
 * Exported constant defining parameters and fields for d e f a u l t_ s t a t u s_ s t y l e configurations.
 */
export const DEFAULT_STATUS_STYLE = STATUS_STYLES.Active;
