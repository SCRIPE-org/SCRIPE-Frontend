"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Globe, Building2 } from "lucide-react";
import type { GuestBooking } from "../../domain/entities/GuestBooking";

interface GuestBookingHeaderProps {
  booking: GuestBooking;
  language: string;
  onToggleLanguage: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function GuestBookingHeader({
  booking,
  language,
  onToggleLanguage,
  t,
}: GuestBookingHeaderProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "active";
      case "CheckedIn":
        return "default";
      case "Completed":
        return "secondary";
      case "Cancelled":
      case "Rejected":
        return "destructive";
      case "Held":
      case "Requested":
        return "warning";
      default:
        return "outline";
    }
  };

  const statusLabel = t(`guestPortal.status.${booking.status}`) || booking.status;

  return (
    <header className="bg-nx-surfaceSubtle/80 border-nx-line/60 sticky top-0 z-30 w-full border-b px-4 py-3 backdrop-blur-md transition-all sm:px-6">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        {/* Left: Venue Brand & Eyebrow */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="bg-nx-accent/10 border-nx-accent/20 flex size-9 shrink-0 items-center justify-center rounded-nx-lg border text-nx-accent">
            <Building2 className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-xs font-semibold uppercase tracking-wide text-nx-accent">
              {booking.venueName}
            </span>
            <span className="block text-[11px] text-nx-ink-3">
              {t("guestPortal.noAppRequired")}
            </span>
          </div>
        </div>

        {/* Right: Status & Language Toggle */}
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant={getStatusVariant(booking.status) as any}
            className="px-2.5 py-0.5 text-xs font-medium capitalize shadow-sm"
          >
            {statusLabel}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLanguage}
            className="flex h-8 items-center gap-1.5 px-2 text-xs font-medium text-nx-ink-2 hover:text-nx-ink"
            aria-label="Toggle Language"
          >
            <Globe className="size-3.5 text-nx-ink-3" aria-hidden="true" />
            <span className="uppercase">{language === "ar" ? "EN" : "عربي"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
