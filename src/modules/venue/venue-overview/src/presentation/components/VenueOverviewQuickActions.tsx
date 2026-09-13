"use client";

import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@core/ui/button";

interface Props {
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function VenueOverviewQuickActions({ t }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/venue/bookings/new">
        <Button
          type="button"
          size="sm"
          className="gap-2 bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500 shadow-nx-sm font-semibold"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span>{t("venueOverview.quickActions.newBooking")}</span>
        </Button>
      </Link>

      <Link href="/venue/calendar">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-nx-line text-nx-ink hover:bg-nx-hover"
        >
          <Calendar className="size-4 text-nx-accent" aria-hidden="true" />
          <span>{t("venueOverview.quickActions.openCalendar")}</span>
        </Button>
      </Link>
    </div>
  );
}
