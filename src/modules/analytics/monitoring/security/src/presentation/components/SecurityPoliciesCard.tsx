"use client";

import React, { memo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { ShieldCheck, Lock, Clock, ShieldAlert, Zap, ExternalLink } from "lucide-react";
import type { SecurityPolicyPosture } from "../../domain/entities/SecurityEntities";

interface SecurityPoliciesCardProps {
  policies: SecurityPolicyPosture[];
  cardClasses?: string;
}

const POLICY_ICONS: Record<string, typeof Lock> = {
  "password-policy": Lock,
  "session-timeout": Clock,
  "account-lockout": ShieldAlert,
  "rate-limiting": Zap,
};

export const SecurityPoliciesCard = memo(function SecurityPoliciesCard({
  policies,
  cardClasses,
}: SecurityPoliciesCardProps) {
  const { t } = useI18n();

  return (
    <Card className={`h-full flex flex-col ${cardClasses || ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-emerald-500/10 p-1.5 text-emerald-500">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {t("security.policies.title") || "Security Policies Posture"}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("security.policies.description") ||
                  "Platform-enforced security boundaries and baseline policies"}
              </CardDescription>
            </div>
          </div>

          <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary gap-1">
            <Link href="/settings">
              <span>{t("security.manage") || "Manage"}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {policies.map((policy) => {
            const Icon = POLICY_ICONS[policy.id] || Lock;

            return (
              <div
                key={policy.id}
                className="flex flex-col justify-between rounded-lg border border-border/70 bg-card/60 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-emerald-500/10 p-1.5 text-emerald-500">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">{policy.name}</p>
                  </div>

                  <Badge
                    variant="success"
                    className="text-[10px] uppercase font-bold shrink-0"
                  >
                    {policy.status}
                  </Badge>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {policy.details}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
