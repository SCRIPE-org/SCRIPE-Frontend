/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { CheckCircle2, ArrowRight, Shield } from "lucide-react";
import { BRAND } from "@core/config/branding";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Documentation for module export
 */
export interface LaunchCelebrationCardProps {
  tenantName?: string;
  tenantCode?: string;
  adminUsername?: string;
  adminName: string;
  adminEmail?: string;
  profileImageUrl?: string;
}

/**
 * Launch Celebration Card (Stage 4) — Confetti and workspace launch summary.
 */
export function LaunchCelebrationCard({
  tenantName,
  tenantCode,
  adminUsername,
  adminName,
  adminEmail,
  profileImageUrl,
}: LaunchCelebrationCardProps) {
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    try {
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#8b5cf6"],
      });
      const t1 = setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#3b82f6", "#10b981", "#6366f1"],
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#f59e0b", "#8b5cf6", "#ec4899"],
        });
      }, 300);
      return () => clearTimeout(t1);
    } catch {
      // Graceful fallback if canvas is not supported in environment
    }
  }, []);

  const initials =
    adminName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "SA";

  return (
    <Card className="w-full max-w-lg overflow-hidden rounded-2xl border-nx-line bg-nx-surface">
      <CardHeader className="pb-2 pt-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-nx-line-hi bg-nx-accent-wash text-nx-accent">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-nx-ink">
          {t("auth.accountSetup.welcomeTitle", { tenant: tenantName || BRAND.name })}
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-nx-ink-2">
          {t("auth.accountSetup.welcomeSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-8 pt-2 sm:px-8">
        {/* Administrator Credentials Summary Box */}
        <div className="min-w-0 space-y-3 rounded-xl border border-nx-line bg-nx-raised p-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <Avatar className="h-12 w-12 shrink-0 border border-nx-line">
              {profileImageUrl ? (
                <AvatarImage src={profileImageUrl} alt={adminName} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-nx-accent-wash text-sm font-bold text-nx-accent">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-semibold text-nx-ink">
                  {adminName || t("auth.accountSetup.administrator")}
                </span>
                {adminUsername && (
                  <Badge
                    variant="secondary"
                    className="max-w-[140px] shrink-0 truncate px-1.5 py-0 font-mono text-[10px]"
                  >
                    @{adminUsername}
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-nx-ink-2">{adminEmail}</p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2 border-t border-nx-line pt-2 text-xs">
            <div className="min-w-0 space-y-0.5">
              <span className="text-nx-ink-2">{t("auth.accountSetup.organization")}</span>
              <p className="truncate font-medium text-nx-ink">{tenantName || "—"}</p>
            </div>
            <div className="min-w-0 space-y-0.5">
              <span className="text-nx-ink-2">{t("auth.accountSetup.assignedRole")}</span>
              <p className="flex items-center gap-1 truncate font-medium text-nx-ink">
                <Shield className="h-3 w-3 shrink-0 text-nx-accent" />
                <span className="truncate">{t("auth.accountSetup.superAdminRole")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-xs text-nx-ink-2">
          {t("auth.accountSetup.securityNotice")}
        </p>

        {/* Launch Workspace CTA */}
        <Button
          size="lg"
          className="w-full gap-2 font-semibold"
          onClick={() => {
            const params = new URLSearchParams();
            if (adminEmail) params.set("email", adminEmail);
            if (tenantCode) params.set("_tenant", tenantCode);
            const qs = params.toString();
            router.push(qs ? `/login?${qs}` : "/login");
          }}
        >
          <span>{t("auth.accountSetup.enterWorkspace")}</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </CardContent>
    </Card>
  );
}
