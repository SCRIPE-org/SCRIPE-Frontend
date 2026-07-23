"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      // z-toast (1100) sits ABOVE z-modal (1000): a toast fired while a dialog
      // is open — saving inside a modal, the most common case there is — must
      // render in front of it. `sm:end-0` keeps it on the correct side in RTL.
      "fixed top-0 z-toast flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:end-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// The persisted toastStyle setting historically offered ten designs; the type
// keeps every stored value so old settings still typecheck, and
// normalizeToastDesign collapses retired names onto the surviving three.
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

// Nearest-survivor mapping for retired designs. Gradient-wallpaper styles
// (neon/glassmorphism/aurora/cosmic/gradient) collapse onto modern's raised
// surface; neumorphism's soft card reads closest to classic; outlined's quiet
// hairline reads closest to minimal. Unknown values fall back to classic.
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

const toastVariants = cva(
  // transform+opacity only; enter at the 200ms standard beat, exit on the exit
  // curve. Reduced motion keeps the crossfade and drops the edge slide — the
  // motion-safe: gate covers every slide class. The closed-state slide is
  // direction-aware: toasts live at the inline END, so they leave to the right
  // in LTR and to the left in RTL (the old hardcoded right was the wrong side
  // there, and Radix swipe hands off to the same exit).
  "group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden p-4 transition-[transform,opacity] duration-nx-standard ease-nx-enter motion-reduce:transition-none data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-safe:data-[state=open]:slide-in-from-top-full motion-safe:data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:ease-nx-exit data-[state=closed]:fade-out-0 motion-safe:ltr:data-[state=closed]:slide-out-to-right-full motion-safe:rtl:data-[state=closed]:slide-out-to-left-full",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        success: "",
        warning: "",
        info: "",
      },
      design: {
        // Classic — the card: surface ground, hairline edge, popover depth
        classic: "",

        // Minimal — flat and quiet: hairline only, no shadow
        minimal: "",

        // Modern — the raised step: light collects on it via the deeper shadow
        modern: "",
      },
    },
    compoundVariants: [
      // Classic Design Variants — solid nx surface so text stays legible over
      // any page content; status speaks through the border and ink only.
      {
        variant: "default",
        design: "classic",
        class: "rounded-nx-lg border border-nx-line-hi bg-nx-surface text-nx-ink shadow-nx-popover",
      },
      {
        variant: "success",
        design: "classic",
        class: "rounded-nx-lg border border-success/40 bg-nx-surface text-success shadow-nx-popover",
      },
      {
        variant: "destructive",
        design: "classic",
        class:
          "rounded-nx-lg border border-destructive/40 bg-nx-surface text-destructive shadow-nx-popover",
      },
      {
        variant: "warning",
        design: "classic",
        class: "rounded-nx-lg border border-warning/40 bg-nx-surface text-warning shadow-nx-popover",
      },
      {
        variant: "info",
        design: "classic",
        class: "rounded-nx-lg border border-info/40 bg-nx-surface text-info shadow-nx-popover",
      },

      // Minimal Design Variants
      {
        variant: "default",
        design: "minimal",
        class: "rounded-nx-sm border border-nx-line bg-nx-surface text-nx-ink",
      },
      {
        variant: "success",
        design: "minimal",
        class: "rounded-nx-sm border border-success/30 bg-nx-surface text-success",
      },
      {
        variant: "destructive",
        design: "minimal",
        class: "rounded-nx-sm border border-destructive/30 bg-nx-surface text-destructive",
      },
      {
        variant: "warning",
        design: "minimal",
        class: "rounded-nx-sm border border-warning/30 bg-nx-surface text-warning",
      },
      {
        variant: "info",
        design: "minimal",
        class: "rounded-nx-sm border border-info/30 bg-nx-surface text-info",
      },

      // Modern Design Variants
      {
        variant: "default",
        design: "modern",
        class: "rounded-nx-md border border-nx-line-hi bg-nx-raised text-nx-ink shadow-nx-modal",
      },
      {
        variant: "success",
        design: "modern",
        class: "rounded-nx-md border border-success/50 bg-nx-raised text-success shadow-nx-modal",
      },
      {
        variant: "destructive",
        design: "modern",
        class:
          "rounded-nx-md border border-destructive/50 bg-nx-raised text-destructive shadow-nx-modal",
      },
      {
        variant: "warning",
        design: "modern",
        class: "rounded-nx-md border border-warning/50 bg-nx-raised text-warning shadow-nx-modal",
      },
      {
        variant: "info",
        design: "modern",
        class: "rounded-nx-md border border-info/50 bg-nx-raised text-info shadow-nx-modal",
      },
    ],
    defaultVariants: {
      variant: "default",
      design: "classic",
    },
  }
);

interface ToastProps
  extends
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    // The cva only knows the surviving designs; the public prop keeps the full
    // historical ToastStyle union and is normalized before it reaches the cva.
    Omit<VariantProps<typeof toastVariants>, "design"> {
  design?: ToastStyle;
}

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
  ({ className, variant, design: overrideDesign, ...props }, ref) => {
    const { toastStyle } = useSettings();

    // Per-toast design wins; otherwise the workspace setting. Either source may
    // still carry a retired style name — normalize onto the surviving designs.
    const design = normalizeToastDesign(overrideDesign ?? toastStyle);

    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant, design }), className)}
        {...props}
      />
    );
  }
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-nx-control border border-nx-line-hi bg-transparent px-3 text-sm font-medium transition-[background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute end-2 top-2 rounded-nx-sm p-1 text-nx-ink-3 opacity-0 transition-opacity duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:text-nx-ink group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-nx-focus",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// Enhanced Toast Content with Icon
interface ToastContentProps {
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  title?: string;
  description?: string;
  showIcon?: boolean;
}

const ToastContent = React.forwardRef<
  HTMLDivElement,
  ToastContentProps & React.HTMLAttributes<HTMLDivElement>
>(({ variant = "default", title, description, showIcon = true, className, ...props }, ref) => {
  const icons = {
    default: Info,
    destructive: AlertCircle,
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const IconComponent = icons[variant];

  return (
    <div ref={ref} className={cn("flex items-start gap-3", className)} {...props}>
      {showIcon && (
        <div className="mt-0.5 flex-shrink-0">
          <IconComponent className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1 space-y-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
    </div>
  );
});
ToastContent.displayName = "ToastContent";

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastContent,
};
