"use client";

import React, { memo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Progress } from "@core/ui/progress";
import { Lock, Smartphone, KeyRound, Sparkles, ExternalLink } from "lucide-react";
import type { AuthMethodPosture } from "../../domain/entities/SecurityEntities";

interface AuthMethodsPostureProps {
  methods: AuthMethodPosture[];
  cardClasses?: string;
}

const METHOD_ICONS: Record<string, typeof Lock> = {
  pwd: Lock,
  mfa: Smartphone,
  sso: KeyRound,
  passkey: Sparkles,
};

/**
 * AuthMethodsPosture
 */
export const AuthMethodsPosture = memo(function AuthMethodsPosture({
  methods,
  cardClasses,
}: AuthMethodsPostureProps) {
  const { t } = useI18n();

  return (
    <Card className={`h-full flex flex-col ${cardClasses || ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {t("security.authMethods.title") || "Authentication Methods"}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("security.authMethods.description") ||
                  "Credential policies and authentication factor adoption"}
              </CardDescription>
            </div>
          </div>

          <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary gap-1">
            <Link href="/admins">
              <span>{t("security.manage") || "Manage"}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {methods.map((method) => {
            const Icon = METHOD_ICONS[method.id] || Lock;

            return (
              <div
                key={method.id}
                className="flex flex-col justify-between rounded-lg border border-border/70 bg-card/60 p-3.5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-md bg-muted/60 p-2 text-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{method.name}</p>
                      <p className="text-lg font-bold text-foreground tracking-tight mt-0.5">
                        {method.coverage}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      method.status === "enforced"
                        ? "success"
                        : method.status === "active"
                        ? "default"
                        : "outline"
                    }
                    className="text-[10px] uppercase font-bold shrink-0"
                  >
                    {method.status}
                  </Badge>
                </div>

                {/* Optional progress bar for percentage based adoption */}
                {typeof method.adoptionPercentage === "number" && (
                  <div className="space-y-1">
                    <Progress value={method.adoptionPercentage} className="h-1.5" />
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {method.details}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
