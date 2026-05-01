"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ChevronLeft, RefreshCw, Users } from "lucide-react";
import { useConsentViewModel } from "../viewmodels/useConsentViewModel";
import type { ConsentStatus } from "../../domain/entities/ConsentStatus";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";

// ── Consent Card ──────────────────────────────────────────────────────────────

function ConsentCard({ consent }: { consent: ConsentStatus }) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 hover:border-white/[0.15] transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${consent.isGranted ? "bg-emerald-500/20" : "bg-slate-500/20"}`}>
            {consent.isGranted
              ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              : <XCircle className="w-4 h-4 text-slate-400" />
            }
          </div>
          <div>
            <p className="text-sm text-white font-semibold">{consent.purposeName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{consent.purposeKey}</p>
          </div>
        </div>
        <Badge className={`text-xs border flex-shrink-0 ${consent.isGranted ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}>
          {consent.isGranted ? t("compliance.granted") : t("compliance.withdrawn")}
        </Badge>
      </div>

      {consent.requiresReConsent && (
        <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center gap-2 text-xs text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          {t("compliance.requiresReConsent")}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-white/[0.05] text-xs text-slate-500">
        {t("compliance.lastUpdated")}: {consent.lastUpdatedAt.toLocaleDateString()}
      </div>
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function ConsentView() {
  const { t } = useI18n();
  const router = useRouter();
  const { consents, grantedCount, withdrawnCount, reConsentCount, isLoading, refetch } = useConsentViewModel();

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.08] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/compliance")}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
              aria-label={t("common.back") ?? "Back"}
            >
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-600/30 border border-teal-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t("compliance.consentTitle")}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {grantedCount} {t("compliance.granted")} · {withdrawnCount} {t("compliance.withdrawn")} · {reConsentCount} {t("compliance.requiresReConsent")}
              </p>
            </div>
          </div>
          <Button
            id="compliance-consent-refresh"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-white/[0.08] text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1600px] mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-slate-600 border-t-teal-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">{t("common.loading")}</p>
            </div>
          </div>
        ) : consents.length === 0 ? (
          <div className="flex items-center justify-center h-64 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="text-sm font-medium text-slate-400">{t("compliance.noConsents")}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {consents.map(c => <ConsentCard key={c.purposeId} consent={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
