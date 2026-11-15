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
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
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
    <div className="flex min-h-[100dvh] items-center justify-center bg-nx-ground p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Error Card — flat matte Nexus slab, zero gradients or blurs */}
        <Card className="border-nx-line bg-nx-surface text-center duration-nx-panel ease-nx-enter animate-in fade-in zoom-in-95 motion-reduce:animate-none">
          <CardHeader>
            <div
              aria-hidden="true"
              className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-nx-lg border border-destructive/30 bg-destructive/10 text-destructive"
            >
              <Shield className="h-8 w-8" />
            </div>

            <CardTitle className="text-2xl font-bold text-nx-ink sm:text-3xl">
              {t("notAuthorized.title")}
            </CardTitle>

            <CardDescription className="mt-2 text-base">
              {t("notAuthorized.description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Alert */}
            <Alert variant="destructive" className="text-start">
              <AlertTriangle aria-hidden="true" />
              <AlertTitle>{t("notAuthorized.accessDeniedAlert")}</AlertTitle>
              <AlertDescription>{t("notAuthorized.accessDeniedMessage")}</AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Button
                onClick={() => {
                  appLogger.ui("Back button clicked");
                  router.back();
                }}
                variant="default"
                size="lg"
                className="w-full"
                type="button"
              >
                <ArrowLeft aria-hidden="true" className="me-2 h-4 w-4 rtl:rotate-180" />
                {t("notAuthorized.goBack")}
              </Button>

              <Button
                onClick={() => {
                  appLogger.ui("Home button clicked");
                  const defaultPath = useAppStore.getState().defaultRedirectPath;
                  const safeTarget =
                    defaultPath && defaultPath !== "/" && defaultPath !== "/overview"
                      ? defaultPath
                      : "/hub";
                  router.push(safeTarget);
                }}
                variant="outline"
                size="lg"
                className="w-full"
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
                className="w-full"
                type="button"
              >
                <LogOut aria-hidden="true" className="me-2 h-4 w-4" />
                {t("nav.logout")}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <div className="h-px w-full bg-nx-line" />

            <div className="flex items-center justify-center gap-2 text-sm text-nx-ink-3">
              <HelpCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{t("notAuthorized.contactAdmin")}</span>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Help Card */}
        <Card className="border-nx-line bg-nx-surface delay-150 duration-nx-panel ease-nx-enter animate-in fade-in slide-in-from-bottom-4 fill-mode-both motion-reduce:animate-none">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-control border border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent">
                <Lock aria-hidden="true" className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 text-start">
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
