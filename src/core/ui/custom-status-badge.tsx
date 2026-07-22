"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { useSettings, BadgeStyle } from "@core/providers/settings-provider";
import { Check, X, AlertTriangle, Info, Clock, Zap } from "lucide-react";

export type StatusType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "pending"
  | "active"
  | "inactive"
  | "completed"
  | "failed"
  | "processing"
  | "cancelled";

interface CustomStatusBadgeProps {
  status: StatusType;
  text?: string;
  design?: BadgeStyle;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  success: {
    icon: Check,
    colors: {
      default: "bg-success/15 text-success border-success/20",
      modern: "bg-success/5 text-success border-success/20 backdrop-blur-sm",
      glass: "bg-success/10 text-success border-success/20 backdrop-blur-xl shadow-lg",
      neon: "bg-background text-success border-success/50 shadow-[0_0_10px_hsl(var(--success)/0.3)]",
      gradient:
        "bg-gradient-to-r from-success to-success/80 text-success-foreground border-0 shadow-lg",
      outlined: "bg-transparent text-success border-2 border-success",
      filled: "bg-success text-success-foreground border-success shadow-md",
      minimal: "bg-transparent text-success border-0",
      pill: "bg-success/15 text-success border-success/20",
      square: "bg-success/15 text-success border-success/20",
    },
  },
  error: {
    icon: X,
    colors: {
      default: "bg-destructive/15 text-destructive border-destructive/20",
      modern: "bg-destructive/5 text-destructive border-destructive/20 backdrop-blur-sm",
      glass: "bg-destructive/10 text-destructive border-destructive/20 backdrop-blur-xl shadow-lg",
      neon: "bg-background text-destructive border-destructive/50 shadow-[0_0_10px_hsl(var(--destructive)/0.3)]",
      gradient:
        "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground border-0 shadow-lg",
      outlined: "bg-transparent text-destructive border-2 border-destructive",
      filled: "bg-destructive text-destructive-foreground border-destructive shadow-md",
      minimal: "bg-transparent text-destructive border-0",
      pill: "bg-destructive/15 text-destructive border-destructive/20",
      square: "bg-destructive/15 text-destructive border-destructive/20",
    },
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      default: "bg-warning/15 text-warning border-warning/20",
      modern: "bg-warning/5 text-warning border-warning/20 backdrop-blur-sm",
      glass: "bg-warning/10 text-warning border-warning/20 backdrop-blur-xl shadow-lg",
      neon: "bg-background text-warning border-warning/50 shadow-[0_0_10px_hsl(var(--warning)/0.3)]",
      gradient:
        "bg-gradient-to-r from-warning to-warning/80 text-warning-foreground border-0 shadow-lg",
      outlined: "bg-transparent text-warning border-2 border-warning",
      filled: "bg-warning text-warning-foreground border-warning shadow-md",
      minimal: "bg-transparent text-warning border-0",
      pill: "bg-warning/15 text-warning border-warning/20",
      square: "bg-warning/15 text-warning border-warning/20",
    },
  },
  info: {
    icon: Info,
    colors: {
      default: "bg-info/15 text-info border-info/20",
      modern: "bg-info/5 text-info border-info/20 backdrop-blur-sm",
      glass: "bg-info/10 text-info border-info/20 backdrop-blur-xl shadow-lg",
      neon: "bg-background text-info border-info/50 shadow-[0_0_10px_hsl(var(--info)/0.3)]",
      gradient: "bg-gradient-to-r from-info to-info/80 text-info-foreground border-0 shadow-lg",
      outlined: "bg-transparent text-info border-2 border-info",
      filled: "bg-info text-info-foreground border-info shadow-md",
      minimal: "bg-transparent text-info border-0",
      pill: "bg-info/15 text-info border-info/20",
      square: "bg-info/15 text-info border-info/20",
    },
  },
  pending: {
    icon: Clock,
    colors: {
      default: "bg-warning/15 text-warning border-warning/20",
      modern: "bg-warning/5 text-warning border-warning/20 backdrop-blur-sm",
      glass: "bg-warning/10 text-warning border-warning/20 backdrop-blur-xl shadow-lg",
      neon: "bg-background text-warning border-warning/50 shadow-[0_0_10px_hsl(var(--warning)/0.3)]",
      gradient:
        "bg-gradient-to-r from-warning to-warning/80 text-warning-foreground border-0 shadow-lg",
      outlined: "bg-transparent text-warning border-2 border-warning",
      filled: "bg-warning text-warning-foreground border-warning shadow-md",
      minimal: "bg-transparent text-warning border-0",
      pill: "bg-warning/15 text-warning border-warning/20",
      square: "bg-warning/15 text-warning border-warning/20",
    },
  },
  processing: {
    icon: Zap,
    colors: {
      default: "bg-primary/15 text-primary border-primary/20",
      modern: "bg-primary/5 text-primary border-primary/20 backdrop-blur-sm",
      glass: "bg-primary/10 text-primary border-primary/20 backdrop-blur-xl shadow-lg",
      neon: "bg-background text-primary border-primary/50 shadow-[0_0_10px_hsl(var(--primary)/0.3)]",
      gradient:
        "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-lg",
      outlined: "bg-transparent text-primary border-2 border-primary",
      filled: "bg-primary text-primary-foreground border-primary shadow-md",
      minimal: "bg-transparent text-primary border-0",
      pill: "bg-primary/15 text-primary border-primary/20",
      square: "bg-primary/15 text-primary border-primary/20",
    },
  },
};

// Map common status aliases
const statusAliases: Record<string, StatusType> = {
  active: "success",
  inactive: "error",
  completed: "success",
  failed: "error",
  cancelled: "error",
};

export function CustomStatusBadge({
  status,
  text,
  design,
  size = "md",
  showIcon = true,
  className,
}: CustomStatusBadgeProps) {
  const settings = useSettings();

  // Use design from props or fall back to settings badgeStyle
  const effectiveDesign: BadgeStyle = (design || settings.badgeStyle) as BadgeStyle;

  // Resolve status aliases
  const resolvedStatus = statusAliases[status] || status;
  const config = statusConfig[resolvedStatus as keyof typeof statusConfig] ?? statusConfig.info;

  // Get text to display
  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1);

  // Get icon
  const IconComponent = config.icon;

  // Get colors based on design
  const colorClasses = config.colors[effectiveDesign] || config.colors.default;

  // Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
    lg: "px-3 py-2 text-base",
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // Shape classes based on design
  const shapeClasses = {
    default: "rounded-full",
    modern: "rounded-lg",
    glass: "rounded-xl",
    neon: "rounded-md",
    gradient: "rounded-full",
    outlined: "rounded-lg",
    filled: "rounded-md",
    minimal: "rounded-none",
    pill: "rounded-full",
    square: "rounded-sm",
  };

  // Border classes
  const borderClasses = effectiveDesign === "minimal" ? "border-0" : "border";

  // Animation classes for processing status
  const animationClasses = status === "processing" ? "animate-pulse" : "";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-all duration-200",
        sizeClasses[size],
        shapeClasses[effectiveDesign],
        borderClasses,
        colorClasses,
        animationClasses,
        "hover:scale-105 hover:shadow-md",
        className
      )}
    >
      {showIcon && (
        <IconComponent
          className={cn(iconSizeClasses[size], status === "processing" && "animate-spin")}
        />
      )}
      <span className="select-none">{displayText}</span>
    </span>
  );
}

export default CustomStatusBadge;
