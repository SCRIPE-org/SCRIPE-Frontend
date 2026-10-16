"use client";

import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Home, AlertTriangle, Lock, HelpCircle, LogOut } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@core/ui/card";
import { Button } from "@core/ui/button";
import { appLogger } from "@core/common/logger";
import { useAppStore } from "@/core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import { useQueryClient } from "@tanstack/react-query";

export default function NotAuthorizedView() {
  const router = useRouter();
  const { t } = useI18n();
  const logoutStore = useAppStore((state) => state.logout);
  const { authRepository } = useServices();
  const queryClient = useQueryClient();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-nx-ground via-[color:color-mix(in_srgb,var(--nx-ground)_95%,transparent)] to-[color:color-mix(in_srgb,var(--nx-raised)_20%,transparent)] p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Error Card */}
        <Card className="relative overflow-hidden border-nx-line bg-[color:color-mix(in_srgb,var(--nx-ground)_80%,transparent)] text-center duration-nx-panel ease-nx-enter animate-in fade-in zoom-in-95 motion-reduce:animate-none">
          {/* Background Pattern */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/10" />
          <div className="pointer-events-none absolute end-0 top-0 h-32 w-32 rounded-full bg-destructive/5 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 start-0 h-24 w-24 rounded-full bg-nx-accent-wash blur-2xl" />

          <CardHeader className="relative">
            {/* Icon with static glow */}
            <div className="relative mx-auto mb-4">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-destructive/20 to-destructive/10">
                {/* Static glow — this used to "animate-pulse" forever behind a
                    static icon, decoration with no functional purpose. A
                    still blurred wash reads just as intentional. */}
                <div className="pointer-events-none absolute inset-0 rounded-full bg-destructive/20" />
                <Shield
                  aria-hidden="true"
                  className="relative z-raised h-12 w-12 text-destructive"
                />
              </div>
            </div>

            <CardTitle className="text-3xl font-bold text-nx-ink">
              {t("notAuthorized.title")}
            </CardTitle>

            <CardDescription className="mt-2 text-lg">
              {t("notAuthorized.description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-raised space-y-6">
            {/* Status Alert */}
            <div className="relative w-full rounded-nx-control border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 text-destructive"
                />
                <div className="text-start">
                  <strong className="text-destructive">
                    {t("notAuthorized.accessDeniedAlert")}
                  </strong>{" "}
                  {t("notAuthorized.accessDeniedMessage")}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative z-raised grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Button
                onClick={() => {
                  appLogger.ui("Back button clicked");
                  router.back();
                }}
                variant="default"
                size="lg"
                className="relative z-raised w-full cursor-pointer"
                type="button"
              >
                <ArrowLeft aria-hidden="true" className="me-2 h-4 w-4 rtl:rotate-180" />
                {t("notAuthorized.goBack")}
              </Button>

              <Button
                onClick={() => {
                  appLogger.ui("Home button clicked");
                  router.push("/");
                }}
                variant="outline"
                size="lg"
                className="relative z-raised w-full cursor-pointer"
                type="button"
              >
                <Home aria-hidden="true" className="me-2 h-4 w-4" />
                {t("notAuthorized.goHome")}
              </Button>

              <Button
                onClick={async () => {
                  appLogger.ui("Sign out button clicked");
                  try {
                    await authRepository.logout();
                  } catch {
                    // ignore
                  } finally {
                    logoutStore();
                    queryClient.clear();
                    router.push("/login");
                  }
                }}
                variant="secondary"
                size="lg"
                className="relative z-raised w-full cursor-pointer"
                type="button"
              >
                <LogOut aria-hidden="true" className="me-2 h-4 w-4" />
                {t("nav.logout")}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-nx-line to-transparent" />

            <div className="flex items-center justify-center gap-2 text-sm text-nx-ink-3">
              <HelpCircle aria-hidden="true" className="h-4 w-4" />
              <span>{t("notAuthorized.contactAdmin")}</span>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Help Card */}
        <Card className="bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] delay-150 duration-nx-panel ease-nx-enter animate-in fade-in slide-in-from-bottom-4 fill-mode-both motion-reduce:animate-none">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-nx-control bg-nx-accent-wash">
                <Lock aria-hidden="true" className="h-5 w-5 text-nx-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-nx-ink">{t("notAuthorized.needAccessTitle")}</h3>
                <p className="text-sm leading-relaxed text-nx-ink-2">
                  {t("notAuthorized.needAccessDescription")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
