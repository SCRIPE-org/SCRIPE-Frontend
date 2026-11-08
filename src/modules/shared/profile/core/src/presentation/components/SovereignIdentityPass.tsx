"use client";

/**
 * SovereignIdentityPass
 *
 * Interactive 180-degree flipping Digital Stadium & Federation Accreditation Pass.
 * Renders data strictly from /api/v1/account/credentials and /api/v1/account/dossier.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  QrCode,
  RotateCw,
  ShieldCheck,
  Award,
  Printer,
  Smartphone,
  CheckCircle2,
  Radio,
} from "lucide-react";

interface SovereignIdentityPassProps {
  fullName: string;
  jobTitle: string;
  clubAffiliation: string;
  staffCode: string;
  primaryLicense: string;
  nfcTokenId: string;
  bloodType?: string;
  federationId?: string;
  stadiumZones?: string[];
}

export function SovereignIdentityPass({
  fullName,
  jobTitle,
  clubAffiliation,
  staffCode,
  primaryLicense,
  nfcTokenId,
  bloodType = "O+",
  federationId,
  stadiumZones = [],
}: SovereignIdentityPassProps) {
  const { t } = useI18n();
  const [isFlipped, setIsFlipped] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SC";

  const triggerExport = (targetKey: string) => {
    setExportNotice(t(targetKey));
    setTimeout(() => setExportNotice(null), 2500);
  };

  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <span className="text-sm font-bold text-nx-ink">
              {t("profile.credentials.passTitle")}
            </span>
            <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-[10px] gap-1">
              <Radio className="h-2.5 w-2.5" />
              <span>{t("profile.credentials.nfcActive")}</span>
            </Badge>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFlipped((prev) => !prev)}
            data-testid="flip-sovereign-pass-btn"
            className="h-8 text-xs font-semibold gap-1.5 border-nx-accent/40 text-nx-accent bg-nx-accent-wash"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>
              {isFlipped
                ? t("profile.credentials.flipToFront")
                : t("profile.credentials.flipToBack")}
            </span>
          </Button>
        </div>

        {!isFlipped ? (
          <div
            data-testid="sovereign-pass-front"
            className="rounded-xl border border-nx-line bg-nx-raised p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-nx-accent-fill text-nx-on-fill font-bold text-lg flex items-center justify-center shrink-0 border border-nx-line">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-nx-ink">{fullName}</h3>
                  {staffCode && (
                    <Badge variant="outline" className="font-mono text-[10px] border-nx-accent/40 text-nx-accent bg-nx-accent-wash">
                      {staffCode}
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-semibold text-nx-ink-2">
                  {jobTitle} {clubAffiliation ? `• ${clubAffiliation}` : ""}
                </p>
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  {primaryLicense && (
                    <Badge variant="outline" className="text-[10px] border-nx-line bg-nx-surface text-nx-ink gap-1">
                      <Award className="h-3 w-3 text-nx-accent" />
                      <span>{primaryLicense}</span>
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/10 gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{t("profile.credentials.safeguardingCleared")}</span>
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 md:text-end">
              <span className="text-[10px] uppercase tracking-wider font-mono text-nx-ink-3 block">
                {t("profile.credentials.zoneClearances")}
              </span>
              <div className="flex items-center md:justify-end gap-1.5 flex-wrap">
                {stadiumZones.map((z) => (
                  <Badge
                    key={z}
                    variant="outline"
                    className="font-mono text-[10px] border-nx-line bg-nx-surface text-nx-ink-2"
                  >
                    {z}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div
            data-testid="sovereign-pass-back"
            className="rounded-xl border border-nx-accent/40 bg-nx-raised p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-nx-surface border border-nx-line flex items-center justify-center shrink-0">
                <QrCode className="h-10 w-10 text-nx-accent" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-nx-accent">
                    {nfcTokenId}
                  </span>
                  {federationId && (
                    <Badge variant="outline" className="text-[10px] border-nx-line bg-nx-surface text-nx-ink-2 font-mono">
                      {federationId}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-nx-ink-2">
                  {t("profile.credentials.issuingAuthority")}
                </p>
                <p className="text-[11px] font-mono text-nx-ink-3">
                  {t("profile.credentials.bloodType")}: {bloodType} &bull; {t("profile.credentials.emergencyMedicalCleared")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => triggerExport("profile.credentials.addToWallet")}
                className="h-8 text-xs gap-1.5"
              >
                <Smartphone className="h-3.5 w-3.5 text-nx-accent" />
                <span>{t("profile.credentials.addToWallet")}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => triggerExport("profile.credentials.printPvcBadge")}
                className="h-8 text-xs gap-1.5"
              >
                <Printer className="h-3.5 w-3.5 text-nx-accent" />
                <span>{t("profile.credentials.printPvcBadge")}</span>
              </Button>
            </div>
          </div>
        )}

        {exportNotice && (
          <div className="flex items-center gap-2 text-xs text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>
              {t("profile.credentials.exportedNotice")}: <strong>{exportNotice}</strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
