"use client";

/**
 * MinimalWelcome — Fallback card for users without dashboard permissions.
 *
 * Shows a clean "account active" status with links to profile/settings.
 * Displayed on "/" when user has no `dashboard.view` permission.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { ShieldCheck, User, Settings } from "lucide-react";
import Link from "next/link";

export function MinimalWelcome() {
  const { t } = useI18n();

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
        </div>
        <CardTitle className="text-lg">{t("overview.minimal.title")}</CardTitle>
        <CardDescription>{t("overview.minimal.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center gap-3 pt-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile">
            <User className="mr-1.5 h-4 w-4" />
            {t("overview.minimal.profile")}
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings">
            <Settings className="mr-1.5 h-4 w-4" />
            {t("overview.minimal.settings")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
