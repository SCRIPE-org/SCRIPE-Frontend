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
    <Card className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <CardHeader className="pb-2 pt-8 text-center">
        <div className="shadow-xs mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          {t("auth.accountSetup.welcomeTitle", { tenant: tenantName || BRAND.name })}
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-muted-foreground">
          {t("auth.accountSetup.welcomeSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-8 pt-2 sm:px-8">
        {/* Administrator Credentials Summary Box */}
        <div className="min-w-0 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <Avatar className="shadow-xs h-12 w-12 shrink-0 border border-border">
              {profileImageUrl ? (
                <AvatarImage src={profileImageUrl} alt={adminName} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                  {adminName || "Administrator"}
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
              <p className="truncate text-xs text-muted-foreground">{adminEmail}</p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2 border-t border-border/40 pt-2 text-xs">
            <div className="min-w-0 space-y-0.5">
              <span className="text-muted-foreground">{t("auth.accountSetup.organization")}</span>
              <p className="truncate font-medium text-foreground">{tenantName || "—"}</p>
            </div>
            <div className="min-w-0 space-y-0.5">
              <span className="text-muted-foreground">Assigned Role</span>
              <p className="flex items-center gap-1 truncate font-medium text-foreground">
                <Shield className="h-3 w-3 shrink-0 text-primary" />
                <span className="truncate">{t("auth.accountSetup.superAdminRole")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-xs text-muted-foreground">
          {t("auth.accountSetup.securityNotice")}
        </p>

        {/* Launch Workspace CTA */}
        <Button
          size="lg"
          className="shadow-xs w-full gap-2 font-semibold"
          onClick={() => {
            const redirectUrl = adminEmail
              ? `/login?email=${encodeURIComponent(adminEmail)}`
              : "/login";
            router.push(redirectUrl);
          }}
        >
          <span>{t("auth.accountSetup.enterWorkspace")}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
