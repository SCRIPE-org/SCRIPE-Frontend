"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Not-found boundary for the (modules) group. The group's own layout.tsx
 * (DashboardLayout — header, sidebar, nav) stays mounted above this, so the
 * wrapper below only needs to fill the content slot, not the viewport.
 */
export default function ModulesNotFound() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <EmptyState
        icon={SearchX}
        title={t("common.pageNotFound")}
        description={t("common.pageNotFoundDescription")}
        action={
          <Button asChild>
            <Link href="/">{t("common.goHome")}</Link>
          </Button>
        }
        size="lg"
        bare
      />
    </div>
  );
}
