"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Shield } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useTenantBranding } from "@core/providers/tenant-branding-provider";
import { cn } from "@core/common/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  animation?: "none" | "spin" | "pulse" | "bounce" | "fancy";
  /** When true, renders a plain container instead of a Link. Use when Logo is already inside a Link. */
  disableLink?: boolean;
}

export function Logo({ className, showText = true, size = "md", animation = "none", disableLink = false }: LogoProps) {
  const settings = useSettings();
  const { logoUrl: tenantLogoUrl } = useTenantBranding();

  if (!settings.showLogo) {
    return null;
  }

  const sizeClasses = {
    xs: "h-4 w-4",
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10",
  };

  const textSizeClasses = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const animationClasses = {
    none: "",
    spin: "animate-spin",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    fancy: "animate-pulse hover:animate-bounce transition-all duration-300",
  };

  const renderIcon = () => {
    const iconClass = cn(
      sizeClasses[settings.logoSize],
      animationClasses[settings.logoAnimation],
      "transition-all duration-200"
    );

    switch (settings.logoType) {
      case "sparkles":
        return <Sparkles className={iconClass} />;
      case "shield":
        return <Shield className={iconClass} />;
      case "image":
        return (
          <div className={cn(sizeClasses[settings.logoSize], "relative")}>
            {/* Use native <img> — tenant logos are on dynamic external domains */}
            <img
              src={tenantLogoUrl}
              alt="Logo"
              className={cn(
                "h-full w-full object-contain",
                animationClasses[settings.logoAnimation]
              )}
              onError={(e) => {
                // Fallback to sparkles icon if image fails to load
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        );
      case "custom":
        return null;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const content = (
    <>
      {renderIcon()}
      {showText && settings.logoType === "custom" && (
        <span className={cn("font-semibold", textSizeClasses[settings.logoSize])}>
          {settings.logoText}
        </span>
      )}
    </>
  );

  const sharedClass = cn(
    "flex cursor-pointer items-center gap-2 transition-opacity duration-200 hover:opacity-80",
    className
  );

  if (disableLink) {
    return <div className={sharedClass}>{content}</div>;
  }

  return (
    <Link href="/" className={sharedClass}>
      {content}
    </Link>
  );
}
