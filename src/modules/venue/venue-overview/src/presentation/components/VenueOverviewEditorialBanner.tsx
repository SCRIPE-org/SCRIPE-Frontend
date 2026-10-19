"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@core/ui/button";

interface Props {
  facilityName?: string;
  onNewBooking?: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function VenueOverviewEditorialBanner({
  facilityName = "Nasr City Club",
  onNewBooking,
  t,
}: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-nx-xl border border-nx-line/60 bg-gradient-to-br from-emerald-950 via-slate-900 to-black p-5 text-white shadow-md"
      data-testid="venue-overview-editorial-banner"
    >
      {/* Background Court Lighting Motif */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none"
        style={{ backgroundImage: "url('/images/venue/venue-promo-banner.svg')" }}
      />
      <div className="absolute -top-12 -end-12 size-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -start-8 size-40 rounded-full bg-lime-400/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px] space-y-4">
        <div className="space-y-1.5 max-w-sm">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="size-3" aria-hidden="true" />
            <span>Community Pulse</span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
            Great games build stronger communities.
          </h3>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            Modern facilities, seamless bookings, and happier players at {facilityName}.
          </p>
        </div>

        <div>
          {onNewBooking ? (
            <Button
              type="button"
              onClick={onNewBooking}
              className="gap-2 bg-nx-accent hover:bg-nx-accent/90 text-nx-accent-contrast font-bold text-xs h-9 px-4 rounded-nx-lg shadow-sm"
            >
              <span>Keep the games going</span>
              <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              asChild
              className="gap-2 bg-nx-accent hover:bg-nx-accent/90 text-nx-accent-contrast font-bold text-xs h-9 px-4 rounded-nx-lg shadow-sm"
            >
              <Link href="/venue/calendar">
                <span>Keep the games going</span>
                <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
