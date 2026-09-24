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
    <Card className="w-full max-w-lg border border-border bg-card shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="text-center pb-2 pt-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          {t("auth.accountSetup.welcomeTitle", { tenant: tenantName || BRAND.name })}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          {t("auth.accountSetup.welcomeSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-2 pb-8 px-6 sm:px-8">
        {/* Administrator Credentials Summary Box */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar className="h-12 w-12 border border-border shadow-xs shrink-0">
              {profileImageUrl ? (
                <AvatarImage src={profileImageUrl} alt={adminName} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-foreground text-sm truncate">
                  {adminName || "Administrator"}
                </span>
                {adminUsername && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-mono px-1.5 py-0 shrink-0 max-w-[140px] truncate"
                  >
                    @{adminUsername}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs min-w-0">
            <div className="space-y-0.5 min-w-0">
              <span className="text-muted-foreground">{t("auth.accountSetup.organization")}</span>
              <p className="font-medium text-foreground truncate">{tenantName || "—"}</p>
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-muted-foreground">Assigned Role</span>
              <p className="font-medium text-foreground flex items-center gap-1 truncate">
                <Shield className="h-3 w-3 text-primary shrink-0" />
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
          className="w-full gap-2 font-semibold shadow-xs"
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
