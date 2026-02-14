"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Shield } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  animation?: "none" | "spin" | "pulse" | "bounce" | "fancy";
}

export function Logo({ className, showText = true, size = "md", animation = "none" }: LogoProps) {
  const settings = useSettings();

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
            <Image
              src={"/app-logo.png"}
              alt="Logo"
              fill
              className={cn("object-contain", animationClasses[settings.logoAnimation])}
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

  return (
    <Link
      href="/"
      className={cn(
        "flex cursor-pointer items-center gap-2 transition-opacity duration-200 hover:opacity-80",
        className
      )}
    >
      {renderIcon()}
      {showText && settings.logoType === "custom" && (
        <span className={cn("font-semibold", textSizeClasses[settings.logoSize])}>
          {settings.logoText}
        </span>
      )}
    </Link>
  );
}
