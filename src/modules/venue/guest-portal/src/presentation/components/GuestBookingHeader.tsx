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

  const statusLabel =
    t(`guestPortal.status.${booking.status}`) || booking.status;

  return (
    <header className="w-full bg-nx-surfaceSubtle/80 backdrop-blur-md border-b border-nx-line/60 px-4 py-3 sm:px-6 sticky top-0 z-30 transition-all">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Venue Brand & Eyebrow */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-nx-lg bg-nx-accent/10 text-nx-accent border border-nx-accent/20">
            <Building2 className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-nx-accent tracking-wide uppercase truncate">
              {booking.venueName}
            </span>
            <span className="block text-[11px] text-nx-ink-3">
              {t("guestPortal.noAppRequired")}
            </span>
          </div>
        </div>

        {/* Right: Status & Language Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={getStatusVariant(booking.status) as any}
            className="text-xs px-2.5 py-0.5 font-medium shadow-sm capitalize"
          >
            {statusLabel}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLanguage}
            className="h-8 px-2 text-xs font-medium text-nx-ink-2 hover:text-nx-ink flex items-center gap-1.5"
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
