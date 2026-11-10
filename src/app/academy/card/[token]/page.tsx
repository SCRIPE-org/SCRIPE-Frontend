"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AthleteCard } from "@modules/academy/athletes/src/presentation/components/AthleteCard";
import type { AthleteCard as AthleteCardModel } from "@modules/academy/athletes/src/domain/entities/AcademyAthlete";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { ShieldCheck, ShieldAlert, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PublicAthleteCardPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [cardData, setCardData] = useState<AthleteCardModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCard = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5136/api";
      const cleanBase = baseUrl.replace(/\/+$/, "");
      const res = await fetch(`${cleanBase}/v1/academy/athletes/card/${token}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Invalid or expired digital athlete pass. Verification failed.");
        }
        throw new Error(`Verification service returned status ${res.status}.`);
      }

      const data = await res.json();
      setCardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify athlete card.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Verification Container */}
      <div className="w-full max-w-xl space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
            <span>SCRIPE Sovereign Verification Authority</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Digital Athlete Credential
          </h1>
          <p className="text-xs text-muted-foreground">
            Official academy identity verification portal • بوابة التحقق من العضوية الرسمية
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl border bg-card p-12 text-center shadow-sm space-y-4">
            <LoadingSpinner size="lg" className="mx-auto text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Verifying cryptographic athlete token...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-bold text-base text-destructive">Verification Failed / فشل التحقق</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  This card reference is either inactive, revoked, or invalid. Please check with your academy administration.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={fetchCard} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Verification
              </Button>
              <Link href="/">
                <Button size="sm" variant="ghost" className="gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  SCRIPE Home
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Verified Success State */}
        {!loading && cardData && (
          <div className="space-y-4">
            {/* Status Banner */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Cryptographically Verified Academy Athlete
                </span>
              </div>
              <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                Status: {cardData.status}
              </span>
            </div>

            {/* Render Athlete Card */}
            <AthleteCard cardData={cardData} showActions={true} />

            {/* Non-PII Safeguard Notice */}
            <div className="p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground border space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Minor Safeguarding & Privacy Assurance (FLS Protected)</span>
              </div>
              <p>
                This public pass presents only verified athletic credentials. In compliance with SCRIPE minor safeguarding, national IDs, residential data, medical alerts, and guardian identities remain strictly redacted.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
