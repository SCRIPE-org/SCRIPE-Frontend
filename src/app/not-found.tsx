"use client";

import { DashboardLayout } from "@core/ui/layout/dashboard-layout";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Home, ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <DashboardLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          size="lg"
          icon={SearchX}
          title={t("common.pageNotFound")}
          description={t("common.pageNotFoundDescription")}
          action={
            <Button onClick={() => router.push("/")} className="gap-2">
              <Home className="h-4 w-4" aria-hidden="true" />
              {t("common.goHome")}
            </Button>
          }
          secondaryAction={
            <Button onClick={() => router.back()} variant="outline" className="gap-2">
              {/* "Back" points toward the trailing edge in RTL, so the glyph mirrors. */}
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              {t("common.goBack")}
            </Button>
          }
        />
      </div>
    </DashboardLayout>
  );
}
