"use client";

import { DashboardLayout } from "@core/ui/layout/dashboard-layout";
import { Button } from "@core/ui/button";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <DashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
            <h2 className="text-2xl font-semibold">{t("common.pageNotFound")}</h2>
            <p className="text-muted-foreground">
              {t("common.pageNotFoundDescription")}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.goBack")}
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              {t("common.goHome")}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
