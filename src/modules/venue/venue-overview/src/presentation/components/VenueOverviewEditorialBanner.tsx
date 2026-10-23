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
      className="rounded-nx-xl border-nx-line/60 relative overflow-hidden border bg-gradient-to-br from-emerald-950 via-black to-black p-5 text-white shadow-md"
      data-testid="venue-overview-editorial-banner"
    >
      {/* Background Court Lighting Motif */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
        style={{ backgroundImage: "url('/images/venue/venue-promo-banner.svg')" }}
      />
      <div className="pointer-events-none absolute -end-12 -top-12 size-48 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -start-8 size-40 rounded-full bg-lime-400/15 blur-2xl" />

      <div className="relative z-10 flex h-full min-h-[140px] flex-col justify-between space-y-4">
        <div className="max-w-sm space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-lime-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime-300">
            <Sparkles className="size-3" aria-hidden="true" />
            <span>Community Pulse</span>
          </div>
          <h3 className="text-base font-black leading-tight tracking-tight text-white sm:text-lg">
            Great games build stronger communities.
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-white/80">
            Modern facilities, seamless bookings, and happier players at {facilityName}.
          </p>
        </div>

        <div>
          {onNewBooking ? (
            <Button
              type="button"
              onClick={onNewBooking}
              className="hover:bg-nx-accent/90 text-nx-on-fill h-9 gap-2 rounded-nx-lg bg-nx-accent px-4 text-xs font-bold shadow-sm"
            >
              <span>Keep the games going</span>
              <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              asChild
              className="hover:bg-nx-accent/90 text-nx-on-fill h-9 gap-2 rounded-nx-lg bg-nx-accent px-4 text-xs font-bold shadow-sm"
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
