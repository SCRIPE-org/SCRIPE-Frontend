"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@core/ui/breadcrumb";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

export interface PageBreadcrumbsProps {
  /**
   * Breadcrumb segments to display.
   * If a segment has href, it becomes a clickable link; otherwise, it's the current page (non-clickable).
   * The last segment without href is typically the current page.
   */
  segments: BreadcrumbSegment[];
  /**
   * Whether to show home link. Defaults to true.
   * Home always links to "/".
   */
  showHome?: boolean;
  /**
   * Home label text. Defaults to "Home" or translated "nav.home".
   */
  homeLabel?: string;
  /**
   * Whether to show back button arrow. Defaults to false.
   * When true, displays a back button with direction-aware arrow next to breadcrumbs.
   */
  showBackButton?: boolean;
  /**
   * Callback when back button is clicked. If not provided, uses router.back().
   */
  onBack?: () => void;
}

/**
 * Gets the appropriate back arrow icon based on text direction
 * @param direction - Text direction ("rtl" or "ltr")
 * @returns Arrow component
 */
export function getBackArrowIcon(direction: "rtl" | "ltr") {
  return direction === "rtl" ? ArrowRight : ArrowLeft;
}

/**
 * Generic Breadcrumbs Component
 *
 * A pure, reusable component that renders breadcrumbs based on provided segments.
 * No hardcoded page references or translations - completely generic and reusable.
 *
 * @example
 * ```tsx
 * <PageBreadcrumbs
 *   showHome={false}
 *   segments={[
 *     { label: "Settings", href: "/settings" },
 *     { label: "Users", href: "/settings/users" },
 *     { label: "User Details" }, // Current page, no href
 *   ]}
 * />
 * ```
 */
export function PageBreadcrumbs({
  segments,
  showHome = false,
  homeLabel,
  showBackButton = false,
  onBack,
}: PageBreadcrumbsProps) {
  const router = useRouter();
  const { t, direction } = useI18n();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const displayHomeLabel = homeLabel || t("nav.home") || "Home";

  return (
    <div className="flex items-center gap-4">
      {showBackButton && (
        <Button variant="ghost" size="icon" onClick={handleBack}>
          {direction === "rtl" ? (
            <ArrowRight className="h-5 w-5" />
          ) : (
            <ArrowLeft className="h-5 w-5" />
          )}
        </Button>
      )}
      <Breadcrumb>
        <BreadcrumbList>
          {showHome && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{displayHomeLabel}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {segments.length > 0 && <BreadcrumbSeparator />}
            </>
          )}
          {segments.map((segment, idx) => {
            const isLast = idx === segments.length - 1;
            const showSeparator = idx > 0 || (idx === 0 && showHome);

            return (
              <React.Fragment key={segment.href || segment.label || idx}>
                {showSeparator && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast || !segment.href ? (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={segment.href}>{segment.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
