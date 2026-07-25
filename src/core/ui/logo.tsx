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
  /**
   * Overrides the workspace `logoSize` setting for this instance.
   * Omit to follow the setting.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Retired. Idle logo motion was removed — see the note above the component.
   * The union is unchanged so existing call sites keep compiling.
   */
  animation?: "none" | "spin" | "pulse" | "bounce" | "fancy";
  /** When true, renders a plain container instead of a Link. Use when Logo is already inside a Link. */
  disableLink?: boolean;
}

const SIZE_CLASSES = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
} as const;

const TEXT_SIZE_CLASSES = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
} as const;

type LogoScale = keyof typeof SIZE_CLASSES;

const resolveScale = (value: string | undefined | null): LogoScale =>
  value != null && value in SIZE_CLASSES ? (value as LogoScale) : "md";

/**
 * Logo — the brand mark in the shell.
 *
 * Two things this component did that it no longer does.
 *
 * 1. It never stood still. `logoAnimation` mapped every stored value onto a
 *    looping Tailwind animation utility, and the "fancy" value stacked two of
 *    them — a brand mark rotating forever in the corner of every page. Idle
 *    motion is out of the system, so all of those resolve to stillness; the
 *    setting is still read and stored, it simply has no idle expression left.
 *    Hover is a colour move at the micro step instead of a blanket opacity dip.
 *
 * 2. It ignored `size`. The prop was declared, defaulted to "md" and then never
 *    used — every render read `settings.logoSize`, so `<Logo size="sm" />` in
 *    the collapsed sidebar rail rendered at the workspace size. The prop is now
 *    an override and the setting is the fallback.
 */
export function Logo({
  className,
  showText = true,
  size,
  animation: _animation,
  disableLink = false,
}: LogoProps) {
  const settings = useSettings();
  const { logoUrl: tenantLogoUrl } = useTenantBranding();
  // A tenant logo on an external domain can 404. The old handler set
  // display:none on the element and left a hole where the brand was, under a
  // comment claiming it fell back to the sparkles mark. Now it actually does.
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [tenantLogoUrl]);

  if (!settings.showLogo) {
    return null;
  }

  const scale = size ?? resolveScale(settings.logoSize);
  const iconClass = SIZE_CLASSES[scale];

  const renderIcon = () => {
    switch (settings.logoType) {
      case "shield":
        return <Shield className={iconClass} aria-hidden="true" />;
      case "image":
        if (imageFailed) {
          return <Sparkles className={iconClass} aria-hidden="true" />;
        }
        return (
          <span className={cn("relative block", iconClass)}>
            {/* Native element on purpose: tenant logos live on dynamic external
                domains, which next/image cannot be configured for ahead of time.
                src is a real runtime URL from the tenant branding provider, and
                a failed load falls through to the sparkles mark above. */}
            <img
              src={tenantLogoUrl}
              alt={settings.logoText || "Logo"}
              className="h-full w-full object-contain"
              onError={() => setImageFailed(true)}
            />
          </span>
        );
      case "custom":
        return null;
      case "sparkles":
      default:
        return <Sparkles className={iconClass} aria-hidden="true" />;
    }
  };

  const content = (
    <>
      {renderIcon()}
      {showText && settings.logoType === "custom" && (
        <span className={cn("font-semibold", TEXT_SIZE_CLASSES[scale])}>{settings.logoText}</span>
      )}
    </>
  );

  const sharedClass = cn("inline-flex items-center gap-2 rounded-nx-sm", className);

  if (disableLink) {
    // Not a link, so no pointer cursor and no hover affordance: the previous
    // version claimed both on a plain <div>.
    return <div className={sharedClass}>{content}</div>;
  }

  return (
    <Link
      href="/"
      className={cn(
        sharedClass,
        "transition-colors duration-nx-micro ease-nx-enter hover:text-nx-accent focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
      )}
    >
      {content}
    </Link>
  );
}
