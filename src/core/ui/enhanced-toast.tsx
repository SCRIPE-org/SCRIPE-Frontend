"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@core/common/utils"
import { useSettings } from "@core/providers/settings-provider"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

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
        class: "rounded-lg border-2 border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
      },
      {
        variant: "success",
        design: "classic",
        class: "rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4 shadow-md dark:border-emerald-700 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200",
      },
      {
        variant: "destructive",
        design: "classic",
        class: "rounded-lg border-2 border-red-200 bg-red-50 p-4 shadow-md dark:border-red-700 dark:bg-red-900/20 text-red-800 dark:text-red-200",
      },
      {
        variant: "warning",
        design: "classic",
        class: "rounded-lg border-2 border-amber-200 bg-amber-50 p-4 shadow-md dark:border-amber-700 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200",
      },
      {
        variant: "info",
        design: "classic",
        class: "rounded-lg border-2 border-blue-200 bg-blue-50 p-4 shadow-md dark:border-blue-700 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200",
      },
      
      // Neon Design Variants
      {
        variant: "default",
        design: "neon",
        class: "rounded-xl bg-gray-900/90 p-4 text-gray-100 shadow-[0_0_20px_rgba(156,163,175,0.5)] ring-1 ring-gray-400/50",
      },
      {
        variant: "success",
        design: "neon",
        class: "rounded-xl bg-black/90 p-4 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.8)] ring-2 ring-green-400/50",
      },
      {
        variant: "destructive",
        design: "neon",
        class: "rounded-xl bg-black/90 p-4 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.8)] ring-2 ring-red-400/50",
      },
      {
        variant: "warning",
        design: "neon",
        class: "rounded-xl bg-black/90 p-4 text-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.8)] ring-2 ring-yellow-400/50",
      },
      {
        variant: "info",
        design: "neon",
        class: "rounded-xl bg-black/90 p-4 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8)] ring-2 ring-cyan-400/50",
      },
      
      // Glassmorphism Design Variants
      {
        variant: "default",
        design: "glassmorphism",
        class: "rounded-2xl bg-white/10 p-4 text-gray-800 dark:text-gray-200",
      },
      {
        variant: "success",
        design: "glassmorphism",
        class: "rounded-2xl bg-emerald-500/20 p-4 text-emerald-900 dark:text-emerald-100 border-emerald-300/30",
      },
      {
        variant: "destructive",
        design: "glassmorphism",
        class: "rounded-2xl bg-red-500/20 p-4 text-red-900 dark:text-red-100 border-red-300/30",
      },
      {
        variant: "warning",
        design: "glassmorphism",
        class: "rounded-2xl bg-amber-500/20 p-4 text-amber-900 dark:text-amber-100 border-amber-300/30",
      },
      {
        variant: "info",
        design: "glassmorphism",
        class: "rounded-2xl bg-blue-500/20 p-4 text-blue-900 dark:text-blue-100 border-blue-300/30",
      },
      
      // Neumorphism Design Variants
      {
        variant: "default",
        design: "neumorphism",
        class: "rounded-2xl bg-gray-100 p-4 text-gray-800 shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.7),inset_2px_2px_6px_rgba(0,0,0,0.1)] dark:bg-gray-800 dark:text-gray-200 dark:shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.1),inset_2px_2px_6px_rgba(0,0,0,0.3)]",
      },
      {
        variant: "success",
        design: "neumorphism",
        class: "rounded-2xl bg-emerald-100 p-4 text-emerald-800 shadow-[inset_-2px_-2px_6px_rgba(16,185,129,0.2),inset_2px_2px_6px_rgba(5,150,105,0.3)] dark:bg-emerald-900/30 dark:text-emerald-200",
      },
      {
        variant: "destructive",
        design: "neumorphism",
        class: "rounded-2xl bg-red-100 p-4 text-red-800 shadow-[inset_-2px_-2px_6px_rgba(239,68,68,0.2),inset_2px_2px_6px_rgba(220,38,38,0.3)] dark:bg-red-900/30 dark:text-red-200",
      },
      {
        variant: "warning",
        design: "neumorphism",
        class: "rounded-2xl bg-amber-100 p-4 text-amber-800 shadow-[inset_-2px_-2px_6px_rgba(245,158,11,0.2),inset_2px_2px_6px_rgba(217,119,6,0.3)] dark:bg-amber-900/30 dark:text-amber-200",
      },
      {
        variant: "info",
        design: "neumorphism",
        class: "rounded-2xl bg-blue-100 p-4 text-blue-800 shadow-[inset_-2px_-2px_6px_rgba(59,130,246,0.2),inset_2px_2px_6px_rgba(37,99,235,0.3)] dark:bg-blue-900/30 dark:text-blue-200",
      },
      
      // Aurora Design Variants
      {
        variant: "default",
        design: "aurora",
        class: "rounded-2xl bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 p-4 text-white",
      },
      {
        variant: "success",
        design: "aurora",
        class: "rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 p-4 text-white animate-gradient-x",
      },
      {
        variant: "destructive",
        design: "aurora",
        class: "rounded-2xl bg-gradient-to-br from-red-400 via-pink-500 to-rose-600 p-4 text-white animate-gradient-x",
      },
      {
        variant: "warning",
        design: "aurora",
        class: "rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-4 text-white animate-gradient-x",
      },
      {
        variant: "info",
        design: "aurora",
        class: "rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 p-4 text-white animate-gradient-x",
      },
      
      // Cosmic Design Variants
      {
        variant: "default",
        design: "cosmic",
        class: "rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 text-white",
      },
      {
        variant: "success",
        design: "cosmic",
        class: "rounded-2xl bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 p-4 text-emerald-100",
      },
      {
        variant: "destructive",
        design: "cosmic",
        class: "rounded-2xl bg-gradient-to-br from-red-900 via-rose-800 to-pink-900 p-4 text-red-100",
      },
      {
        variant: "warning",
        design: "cosmic",
        class: "rounded-2xl bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900 p-4 text-amber-100",
      },
      {
        variant: "info",
        design: "cosmic",
        class: "rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 p-4 text-blue-100",
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
        class: "rounded border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100 p-4",
      },
      {
        variant: "destructive",
        design: "minimal",
        class: "rounded border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100 p-4",
      },
      {
        variant: "warning",
        design: "minimal",
        class: "rounded border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100 p-4",
      },
      {
        variant: "info",
        design: "minimal",
        class: "rounded border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100 p-4",
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
        class: "rounded-lg border-green-300/50 bg-green-100/90 backdrop-blur-sm text-green-800 dark:bg-green-900/30 dark:text-green-200 p-4 shadow-lg",
      },
      {
        variant: "destructive",
        design: "modern",
        class: "rounded-lg border-red-300/50 bg-red-100/90 backdrop-blur-sm text-red-800 dark:bg-red-900/30 dark:text-red-200 p-4 shadow-lg",
      },
      {
        variant: "warning",
        design: "modern",
        class: "rounded-lg border-yellow-300/50 bg-yellow-100/90 backdrop-blur-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 p-4 shadow-lg",
      },
      {
        variant: "info",
        design: "modern",
        class: "rounded-lg border-blue-300/50 bg-blue-100/90 backdrop-blur-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 p-4 shadow-lg",
      },
      
      // Gradient Design Variants
      {
        variant: "default",
        design: "gradient",
        class: "rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 shadow-xl",
      },
      {
        variant: "success",
        design: "gradient",
        class: "rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 shadow-xl",
      },
      {
        variant: "destructive",
        design: "gradient",
        class: "rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white p-4 shadow-xl",
      },
      {
        variant: "warning",
        design: "gradient",
        class: "rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 shadow-xl",
      },
      {
        variant: "info",
        design: "gradient",
        class: "rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 shadow-xl",
      },
      
      // Outlined Design Variants
      {
        variant: "default",
        design: "outlined",
        class: "rounded-lg border-2 border-gray-300 bg-transparent backdrop-blur-sm text-gray-700 dark:border-gray-600 dark:text-gray-300 p-4",
      },
      {
        variant: "success",
        design: "outlined",
        class: "rounded-lg border-2 border-green-500 bg-transparent backdrop-blur-sm text-green-700 dark:text-green-300 p-4",
      },
      {
        variant: "destructive",
        design: "outlined",
        class: "rounded-lg border-2 border-red-500 bg-transparent backdrop-blur-sm text-red-700 dark:text-red-300 p-4",
      },
      {
        variant: "warning",
        design: "outlined",
        class: "rounded-lg border-2 border-yellow-500 bg-transparent backdrop-blur-sm text-yellow-700 dark:text-yellow-300 p-4",
      },
      {
        variant: "info",
        design: "outlined",
        class: "rounded-lg border-2 border-blue-500 bg-transparent backdrop-blur-sm text-blue-700 dark:text-blue-300 p-4",
      },
    ],
    defaultVariants: {
      variant: "default",
      design: "classic",
    },
  }
)

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  design?: ToastStyle;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant, design: overrideDesign, ...props }, ref) => {
  const { toastStyle } = useSettings();
  
  // Use override design if provided, otherwise use settings
  const design = overrideDesign || toastStyle;
  
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant, design }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

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
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Enhanced Toast Content with Icon
interface ToastContentProps {
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  title?: string
  description?: string
  showIcon?: boolean
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
  }

  const IconComponent = icons[variant]

  return (
    <div ref={ref} className={cn("flex items-start gap-3", className)} {...props}>
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1 space-y-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
    </div>
  )
})
ToastContent.displayName = "ToastContent"

type ToastActionElement = React.ReactElement<typeof ToastAction>

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
}
