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
      // Same fix as toast.tsx, and this is the viewport that matters: enhanced-toast
      // is the toast system 100 files actually use, so at z-[100] most of the
      // product's toasts were invisible behind any open dialog.
      "fixed top-0 z-toast flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:end-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

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

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
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
        // Classic Design - Traditional with subtle borders
        classic: "",

        // Neon Design - Glowing cyberpunk style
        neon: "border-0 shadow-2xl backdrop-blur-sm",

        // Glassmorphism Design - Transparent glass effect
        glassmorphism: "backdrop-blur-xl border border-white/20 shadow-2xl",

        // Neumorphism Design - Soft 3D effect
        neumorphism: "border-0 shadow-inner",

        // Aurora Design - Magical gradient animations
        aurora: "border-0 shadow-2xl relative overflow-hidden",

        // Cosmic Design - Space theme with particles
        cosmic: "border-0 shadow-2xl relative overflow-hidden",

        // Minimal Design - Clean and simple
        minimal: "",

        // Modern Design - Contemporary with blur effects
        modern: "backdrop-blur-sm bg-opacity-90",

        // Gradient Design - Colorful gradients
        gradient: "bg-gradient-to-r border-0",

        // Outlined Design - Border focused
        outlined: "border-2 bg-transparent backdrop-blur-sm",
      },
    },
    compoundVariants: [
      // Classic Design Variants
      {
        variant: "default",
        design: "classic",
        class: "rounded-lg border-2 border-border bg-card p-4 shadow-md text-foreground",
      },
      {
        variant: "success",
        design: "classic",
        class: "rounded-lg border-2 border-success/40 bg-success/10 p-4 shadow-md text-success",
      },
      {
        variant: "destructive",
        design: "classic",
        class:
          "rounded-lg border-2 border-destructive/40 bg-destructive/10 p-4 shadow-md text-destructive",
      },
      {
        variant: "warning",
        design: "classic",
        class: "rounded-lg border-2 border-warning/40 bg-warning/10 p-4 shadow-md text-warning",
      },
      {
        variant: "info",
        design: "classic",
        class: "rounded-lg border-2 border-info/40 bg-info/10 p-4 shadow-md text-info",
      },

      // Neon Design Variants
      {
        variant: "default",
        design: "neon",
        class:
          "rounded-xl bg-muted/90 p-4 text-foreground shadow-[0_0_20px_hsl(var(--muted-foreground)/0.5)] ring-1 ring-border",
      },
      {
        variant: "success",
        design: "neon",
        class:
          "rounded-xl bg-background/90 p-4 text-success shadow-[0_0_30px_hsl(var(--success)/0.8)] ring-2 ring-success/50",
      },
      {
        variant: "destructive",
        design: "neon",
        class:
          "rounded-xl bg-background/90 p-4 text-destructive shadow-[0_0_30px_hsl(var(--destructive)/0.8)] ring-2 ring-destructive/50",
      },
      {
        variant: "warning",
        design: "neon",
        class:
          "rounded-xl bg-background/90 p-4 text-warning shadow-[0_0_30px_hsl(var(--warning)/0.8)] ring-2 ring-warning/50",
      },
      {
        variant: "info",
        design: "neon",
        class:
          "rounded-xl bg-background/90 p-4 text-info shadow-[0_0_30px_hsl(var(--info)/0.8)] ring-2 ring-info/50",
      },

      // Glassmorphism Design Variants
      {
        variant: "default",
        design: "glassmorphism",
        class: "rounded-2xl bg-white/10 p-4 text-foreground",
      },
      {
        variant: "success",
        design: "glassmorphism",
        class: "rounded-2xl bg-success/20 p-4 text-success border-success/30",
      },
      {
        variant: "destructive",
        design: "glassmorphism",
        class: "rounded-2xl bg-destructive/20 p-4 text-destructive border-destructive/30",
      },
      {
        variant: "warning",
        design: "glassmorphism",
        class: "rounded-2xl bg-warning/20 p-4 text-warning border-warning/30",
      },
      {
        variant: "info",
        design: "glassmorphism",
        class: "rounded-2xl bg-info/20 p-4 text-info border-info/30",
      },

      // Neumorphism Design Variants
      {
        variant: "default",
        design: "neumorphism",
        class:
          "rounded-2xl bg-muted p-4 text-foreground shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.7),inset_2px_2px_6px_rgba(0,0,0,0.1)] dark:shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.1),inset_2px_2px_6px_rgba(0,0,0,0.3)]",
      },
      {
        variant: "success",
        design: "neumorphism",
        class:
          "rounded-2xl bg-success/15 p-4 text-success shadow-[inset_-2px_-2px_6px_hsl(var(--success)/0.2),inset_2px_2px_6px_hsl(var(--success)/0.3)]",
      },
      {
        variant: "destructive",
        design: "neumorphism",
        class:
          "rounded-2xl bg-destructive/15 p-4 text-destructive shadow-[inset_-2px_-2px_6px_hsl(var(--destructive)/0.2),inset_2px_2px_6px_hsl(var(--destructive)/0.3)]",
      },
      {
        variant: "warning",
        design: "neumorphism",
        class:
          "rounded-2xl bg-warning/15 p-4 text-warning shadow-[inset_-2px_-2px_6px_hsl(var(--warning)/0.2),inset_2px_2px_6px_hsl(var(--warning)/0.3)]",
      },
      {
        variant: "info",
        design: "neumorphism",
        class:
          "rounded-2xl bg-info/15 p-4 text-info shadow-[inset_-2px_-2px_6px_hsl(var(--info)/0.2),inset_2px_2px_6px_hsl(var(--info)/0.3)]",
      },

      // Aurora Design Variants
      {
        variant: "default",
        design: "aurora",
        class:
          "rounded-2xl bg-gradient-to-br from-muted-foreground via-muted-foreground/80 to-foreground p-4 text-background",
      },
      {
        variant: "success",
        design: "aurora",
        class:
          "rounded-2xl bg-gradient-to-br from-success/80 via-success to-success/70 p-4 text-success-foreground animate-gradient-x",
      },
      {
        variant: "destructive",
        design: "aurora",
        class:
          "rounded-2xl bg-gradient-to-br from-destructive/80 via-destructive to-destructive/70 p-4 text-destructive-foreground animate-gradient-x",
      },
      {
        variant: "warning",
        design: "aurora",
        class:
          "rounded-2xl bg-gradient-to-br from-warning/80 via-warning to-warning/70 p-4 text-warning-foreground animate-gradient-x",
      },
      {
        variant: "info",
        design: "aurora",
        class:
          "rounded-2xl bg-gradient-to-br from-info/80 via-info to-info/70 p-4 text-info-foreground animate-gradient-x",
      },

      // Cosmic Design Variants
      {
        variant: "default",
        design: "cosmic",
        class:
          "rounded-2xl bg-gradient-to-br from-foreground via-primary to-foreground p-4 text-background",
      },
      {
        variant: "success",
        design: "cosmic",
        class:
          "rounded-2xl bg-gradient-to-br from-success via-primary to-success p-4 text-success-foreground",
      },
      {
        variant: "destructive",
        design: "cosmic",
        class:
          "rounded-2xl bg-gradient-to-br from-destructive via-primary to-destructive p-4 text-destructive-foreground",
      },
      {
        variant: "warning",
        design: "cosmic",
        class:
          "rounded-2xl bg-gradient-to-br from-warning via-primary to-warning p-4 text-warning-foreground",
      },
      {
        variant: "info",
        design: "cosmic",
        class:
          "rounded-2xl bg-gradient-to-br from-info via-primary to-info p-4 text-info-foreground",
      },

      // Minimal Design Variants
      {
        variant: "default",
        design: "minimal",
        class: "rounded border bg-background text-foreground p-4",
      },
      {
        variant: "success",
        design: "minimal",
        class: "rounded border-success/30 bg-success/10 text-success p-4",
      },
      {
        variant: "destructive",
        design: "minimal",
        class: "rounded border-destructive/30 bg-destructive/10 text-destructive p-4",
      },
      {
        variant: "warning",
        design: "minimal",
        class: "rounded border-warning/30 bg-warning/10 text-warning p-4",
      },
      {
        variant: "info",
        design: "minimal",
        class: "rounded border-info/30 bg-info/10 text-info p-4",
      },

      // Modern Design Variants
      {
        variant: "default",
        design: "modern",
        class: "rounded-lg border bg-background/90 backdrop-blur-sm text-foreground p-4 shadow-lg",
      },
      {
        variant: "success",
        design: "modern",
        class:
          "rounded-lg border-success/50 bg-success/15 backdrop-blur-sm text-success p-4 shadow-lg",
      },
      {
        variant: "destructive",
        design: "modern",
        class:
          "rounded-lg border-destructive/50 bg-destructive/15 backdrop-blur-sm text-destructive p-4 shadow-lg",
      },
      {
        variant: "warning",
        design: "modern",
        class:
          "rounded-lg border-warning/50 bg-warning/15 backdrop-blur-sm text-warning p-4 shadow-lg",
      },
      {
        variant: "info",
        design: "modern",
        class: "rounded-lg border-info/50 bg-info/15 backdrop-blur-sm text-info p-4 shadow-lg",
      },

      // Gradient Design Variants
      {
        variant: "default",
        design: "gradient",
        class:
          "rounded-lg bg-gradient-to-r from-muted-foreground to-foreground text-background p-4 shadow-xl",
      },
      {
        variant: "success",
        design: "gradient",
        class:
          "rounded-lg bg-gradient-to-r from-success to-success/80 text-success-foreground p-4 shadow-xl",
      },
      {
        variant: "destructive",
        design: "gradient",
        class:
          "rounded-lg bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground p-4 shadow-xl",
      },
      {
        variant: "warning",
        design: "gradient",
        class:
          "rounded-lg bg-gradient-to-r from-warning to-warning/80 text-warning-foreground p-4 shadow-xl",
      },
      {
        variant: "info",
        design: "gradient",
        class:
          "rounded-lg bg-gradient-to-r from-info to-info/80 text-info-foreground p-4 shadow-xl",
      },

      // Outlined Design Variants
      {
        variant: "default",
        design: "outlined",
        class:
          "rounded-lg border-2 border-border bg-transparent backdrop-blur-sm text-muted-foreground p-4",
      },
      {
        variant: "success",
        design: "outlined",
        class:
          "rounded-lg border-2 border-success bg-transparent backdrop-blur-sm text-success p-4",
      },
      {
        variant: "destructive",
        design: "outlined",
        class:
          "rounded-lg border-2 border-destructive bg-transparent backdrop-blur-sm text-destructive p-4",
      },
      {
        variant: "warning",
        design: "outlined",
        class:
          "rounded-lg border-2 border-warning bg-transparent backdrop-blur-sm text-warning p-4",
      },
      {
        variant: "info",
        design: "outlined",
        class: "rounded-lg border-2 border-info bg-transparent backdrop-blur-sm text-info p-4",
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
    VariantProps<typeof toastVariants> {
  design?: ToastStyle;
}

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
  ({ className, variant, design: overrideDesign, ...props }, ref) => {
    const { toastStyle } = useSettings();

    // Use override design if provided, otherwise use settings
    const design = overrideDesign || toastStyle;

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
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
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
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-destructive-foreground/70 group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive-foreground/50 group-[.destructive]:focus:ring-offset-destructive",
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
