"use client";

/**
 * MinimalWelcome — Fallback for users without dashboard permissions.
 *
 * Composes the core EmptyState (dashed container, icon, action slots) so the
 * "account active" moment shares the product's one empty anatomy, with links
 * to profile/settings as the next steps.
 * Displayed on "/" when user has no `dashboard.view` permission.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { EmptyState } from "@core/ui/empty-state";
import { Button } from "@core/ui/button";
import { ShieldCheck, User, Settings } from "lucide-react";
import Link from "next/link";

export function MinimalWelcome() {
  const { t } = useI18n();

  return (
    <EmptyState
      icon={ShieldCheck}
      title={t("overview.minimal.title")}
      description={t("overview.minimal.description")}
      size="lg"
      action={
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile">
            <User className="me-1.5 h-4 w-4" />
            {t("overview.minimal.profile")}
          </Link>
        </Button>
      }
      secondaryAction={
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings">
            <Settings className="me-1.5 h-4 w-4" />
            {t("overview.minimal.settings")}
          </Link>
        </Button>
      }
    />
  );
}
