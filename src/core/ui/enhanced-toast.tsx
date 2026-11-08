"use client";

import * as React from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@core/common/utils";

// Re-export Sileo components and types for complete backward-and-forward ergonomics
export * from "./sileo-toast";

// Legacy style types preserved for backwards compatibility and settings
export type ToastStyle =
  | "classic"
  | "neon"
  | "glassmorphism"
  | "neumorphism"
  | "aurora"
  | "cosmic"
  | "minimal"
  | "modern"
  | "gradient"
  | "outlined";

const SURVIVING_DESIGNS = ["classic", "minimal", "modern"] as const;
type ToastDesignSurvivor = (typeof SURVIVING_DESIGNS)[number];

const LEGACY_DESIGN_FALLBACK: Partial<Record<string, ToastDesignSurvivor>> = {
  neon: "modern",
  glassmorphism: "modern",
  aurora: "modern",
  cosmic: "modern",
  gradient: "modern",
  neumorphism: "classic",
  outlined: "minimal",
};

export function normalizeToastDesign(value: string | null | undefined): ToastDesignSurvivor {
  if (value && (SURVIVING_DESIGNS as readonly string[]).includes(value)) {
    return value as ToastDesignSurvivor;
  }
  return (value && LEGACY_DESIGN_FALLBACK[value]) || "classic";
}

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  design?: ToastStyle;
}

export const ToastProvider: React.FC<{ children: React.ReactNode; swipeDirection?: string }> = ({
  children,
}) => <div className="sileo-toast-preview-provider contents">{children}</div>;

export const ToastViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed top-0 z-toast flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:end-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
);
ToastViewport.displayName = "ToastViewport";

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", design, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-nx-lg border p-3.5 shadow-nx-popover transition-all",
          "border-nx-line-hi bg-nx-surface text-nx-ink",
          variant === "success" && "border-success/40",
          variant === "destructive" && "border-destructive/40",
          variant === "warning" && "border-warning/40",
          variant === "info" && "border-info/40",
          design === "minimal" && "shadow-none border-nx-line",
          design === "modern" && "bg-nx-raised shadow-nx-modal",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "text-balance text-sm font-semibold leading-tight tracking-tight text-nx-ink",
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-pretty text-xs leading-snug text-nx-ink-2", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "absolute end-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-nx-sm text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink transition-colors",
      className
    )}
    {...props}
  >
    <X aria-hidden="true" className="h-3.5 w-3.5" />
  </button>
));
ToastClose.displayName = "ToastClose";

export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-nx-control border border-nx-line-hi bg-transparent px-3 text-xs font-medium text-nx-ink hover:bg-nx-hover transition-colors",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

const TOAST_ICON = {
  default: { Glyph: Info, tint: "text-nx-ink-3", bg: "bg-nx-raised" },
  destructive: { Glyph: AlertCircle, tint: "text-destructive", bg: "bg-destructive/10" },
  success: { Glyph: CheckCircle, tint: "text-success", bg: "bg-success/10" },
  warning: { Glyph: AlertTriangle, tint: "text-warning", bg: "bg-warning/10" },
  info: { Glyph: Info, tint: "text-info", bg: "bg-info/10" },
} as const;

export interface ToastContentProps {
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  title?: string;
  description?: string;
  showIcon?: boolean;
}

export const ToastContent = React.forwardRef<
  HTMLDivElement,
  ToastContentProps & React.HTMLAttributes<HTMLDivElement>
>(({ variant = "default", title, description, showIcon = true, className, ...props }, ref) => {
  const iconConfig = TOAST_ICON[variant] || TOAST_ICON.default;
  const { Glyph, tint, bg } = iconConfig;

  return (
    <div ref={ref} className={cn("flex min-w-0 items-start gap-3", className)} {...props}>
      {showIcon && (
        <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", bg)}>
          <Glyph aria-hidden="true" className={cn("h-3.5 w-3.5", tint)} />
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-0.5">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
    </div>
  );
});
ToastContent.displayName = "ToastContent";

export type ToastActionElement = React.ReactElement<typeof ToastAction>;
