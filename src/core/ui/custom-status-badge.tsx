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
      default:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
      modern:
        "bg-green-50/80 text-green-700 border-green-200/50 backdrop-blur-sm dark:bg-green-900/10 dark:text-green-400 dark:border-green-700/20",
      glass:
        "bg-green-500/10 text-green-600 border-green-500/20 backdrop-blur-xl shadow-lg dark:bg-green-400/10 dark:text-green-400 dark:border-green-400/20",
      neon: "bg-green-950 text-green-400 border-green-400/50 shadow-[0_0_10px_rgba(34,197,94,0.3)] dark:bg-green-950/50 dark:shadow-[0_0_15px_rgba(34,197,94,0.4)]",
      gradient:
        "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg dark:from-green-600 dark:to-emerald-600",
      outlined:
        "bg-transparent text-green-600 border-2 border-green-500 dark:text-green-400 dark:border-green-400",
      filled:
        "bg-green-500 text-white border-green-500 shadow-md dark:bg-green-600 dark:border-green-600",
      minimal: "bg-transparent text-green-600 border-0 dark:text-green-400",
      pill: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
      square:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
    },
  },
  error: {
    icon: X,
    colors: {
      default:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
      modern:
        "bg-red-50/80 text-red-700 border-red-200/50 backdrop-blur-sm dark:bg-red-900/10 dark:text-red-400 dark:border-red-700/20",
      glass:
        "bg-red-500/10 text-red-600 border-red-500/20 backdrop-blur-xl shadow-lg dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/20",
      neon: "bg-red-950 text-red-400 border-red-400/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] dark:bg-red-950/50 dark:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
      gradient:
        "bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-lg dark:from-red-600 dark:to-rose-600",
      outlined:
        "bg-transparent text-red-600 border-2 border-red-500 dark:text-red-400 dark:border-red-400",
      filled:
        "bg-red-500 text-white border-red-500 shadow-md dark:bg-red-600 dark:border-red-600",
      minimal: "bg-transparent text-red-600 border-0 dark:text-red-400",
      pill: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
      square:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
    },
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      default:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30",
      modern:
        "bg-yellow-50/80 text-yellow-700 border-yellow-200/50 backdrop-blur-sm dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-700/20",
      glass:
        "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 backdrop-blur-xl shadow-lg dark:bg-yellow-400/10 dark:text-yellow-400 dark:border-yellow-400/20",
      neon: "bg-yellow-950 text-yellow-400 border-yellow-400/50 shadow-[0_0_10px_rgba(234,179,8,0.3)] dark:bg-yellow-950/50 dark:shadow-[0_0_15px_rgba(234,179,8,0.4)]",
      gradient:
        "bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg dark:from-yellow-600 dark:to-amber-600",
      outlined:
        "bg-transparent text-yellow-600 border-2 border-yellow-500 dark:text-yellow-400 dark:border-yellow-400",
      filled:
        "bg-yellow-500 text-white border-yellow-500 shadow-md dark:bg-yellow-600 dark:border-yellow-600",
      minimal: "bg-transparent text-yellow-600 border-0 dark:text-yellow-400",
      pill: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30",
      square:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30",
    },
  },
  info: {
    icon: Info,
    colors: {
      default:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
      modern:
        "bg-blue-50/80 text-blue-700 border-blue-200/50 backdrop-blur-sm dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-700/20",
      glass:
        "bg-blue-500/10 text-blue-600 border-blue-500/20 backdrop-blur-xl shadow-lg dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20",
      neon: "bg-blue-950 text-blue-400 border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.3)] dark:bg-blue-950/50 dark:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
      gradient:
        "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg dark:from-blue-600 dark:to-cyan-600",
      outlined:
        "bg-transparent text-blue-600 border-2 border-blue-500 dark:text-blue-400 dark:border-blue-400",
      filled:
        "bg-blue-500 text-white border-blue-500 shadow-md dark:bg-blue-600 dark:border-blue-600",
      minimal: "bg-transparent text-blue-600 border-0 dark:text-blue-400",
      pill: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
      square:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
    },
  },
  pending: {
    icon: Clock,
    colors: {
      default:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30",
      modern:
        "bg-orange-50/80 text-orange-700 border-orange-200/50 backdrop-blur-sm dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-700/20",
      glass:
        "bg-orange-500/10 text-orange-600 border-orange-500/20 backdrop-blur-xl shadow-lg dark:bg-orange-400/10 dark:text-orange-400 dark:border-orange-400/20",
      neon: "bg-orange-950 text-orange-400 border-orange-400/50 shadow-[0_0_10px_rgba(249,115,22,0.3)] dark:bg-orange-950/50 dark:shadow-[0_0_15px_rgba(249,115,22,0.4)]",
      gradient:
        "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg dark:from-orange-600 dark:to-amber-600",
      outlined:
        "bg-transparent text-orange-600 border-2 border-orange-500 dark:text-orange-400 dark:border-orange-400",
      filled:
        "bg-orange-500 text-white border-orange-500 shadow-md dark:bg-orange-600 dark:border-orange-600",
      minimal: "bg-transparent text-orange-600 border-0 dark:text-orange-400",
      pill: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30",
      square:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30",
    },
  },
  processing: {
    icon: Zap,
    colors: {
      default:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30",
      modern:
        "bg-purple-50/80 text-purple-700 border-purple-200/50 backdrop-blur-sm dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-700/20",
      glass:
        "bg-purple-500/10 text-purple-600 border-purple-500/20 backdrop-blur-xl shadow-lg dark:bg-purple-400/10 dark:text-purple-400 dark:border-purple-400/20",
      neon: "bg-purple-950 text-purple-400 border-purple-400/50 shadow-[0_0_10px_rgba(147,51,234,0.3)] dark:bg-purple-950/50 dark:shadow-[0_0_15px_rgba(147,51,234,0.4)]",
      gradient:
        "bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0 shadow-lg dark:from-purple-600 dark:to-violet-600",
      outlined:
        "bg-transparent text-purple-600 border-2 border-purple-500 dark:text-purple-400 dark:border-purple-400",
      filled:
        "bg-purple-500 text-white border-purple-500 shadow-md dark:bg-purple-600 dark:border-purple-600",
      minimal: "bg-transparent text-purple-600 border-0 dark:text-purple-400",
      pill: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30",
      square:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30",
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
  const effectiveDesign: BadgeStyle = (design ||
    settings.badgeStyle) as BadgeStyle;

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
          className={cn(
            iconSizeClasses[size],
            status === "processing" && "animate-spin"
          )}
        />
      )}
      <span className="select-none">{displayText}</span>
    </span>
  );
}

export default CustomStatusBadge;
