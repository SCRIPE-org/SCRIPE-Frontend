"use client";

import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  Home,
  AlertTriangle,
  Lock,
  HelpCircle,
  ArrowRight,
  LogOut,
} from "lucide-react";
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
  const { t, language } = useI18n();
  const logoutStore = useAppStore((state) => state.logout);
  const { authRepository } = useServices();
  const queryClient = useQueryClient();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/20 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Error Card */}
        <Card className="relative overflow-hidden border-white/5 bg-background/80 text-center backdrop-blur-md duration-500 animate-in fade-in zoom-in-95">
          {/* Background Pattern */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/10" />
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-destructive/5 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

          <CardHeader className="relative">
            {/* Icon with static glow */}
            <div className="relative mx-auto mb-4">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-destructive/20 to-destructive/10">
                {/* Static glow — this used to "animate-pulse" forever behind a
                    static icon, decoration with no functional purpose. A
                    still blurred wash reads just as intentional. */}
                <div className="pointer-events-none absolute inset-0 rounded-full bg-destructive/20" />
                <Shield className="relative z-10 h-12 w-12 text-destructive" />
              </div>
            </div>

            <CardTitle className="text-3xl font-bold text-foreground">
              {t("notAuthorized.title")}
            </CardTitle>

            <CardDescription className="mt-2 text-lg">
              {t("notAuthorized.description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 space-y-6">
            {/* Status Alert */}
            <div className="relative w-full rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div
                className={`flex items-start ${
                  language === "ar" ? "space-x-3 space-x-reverse" : "space-x-3"
                }`}
              >
                <AlertTriangle className="mt-0.5 flex-shrink-0 text-destructive" />
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <strong className="text-destructive">
                    {t("notAuthorized.accessDeniedAlert")}
                  </strong>{" "}
                  {t("notAuthorized.accessDeniedMessage")}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative z-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Button
                onClick={() => {
                  appLogger.ui("Back button clicked");
                  router.back();
                }}
                variant="default"
                size="lg"
                className="group relative z-30 w-full cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--destructive)/0.5)]"
                type="button"
              >
                {language == "en" ? (
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                )}
                {t("notAuthorized.goBack")}
              </Button>

              <Button
                onClick={() => {
                  appLogger.ui("Home button clicked");
                  router.push("/");
                }}
                variant="outline"
                size="lg"
                className="group relative z-30 w-full cursor-pointer"
                type="button"
              >
                <Home className="mx-2 h-4 w-4 transition-transform group-hover:scale-110" />
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
                className="group relative z-30 w-full cursor-pointer"
                type="button"
              >
                <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                {t("nav.logout")}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

            <div
              className={`flex items-center justify-center text-sm text-muted-foreground ${
                language === "ar" ? "space-x-2 space-x-reverse" : "space-x-2"
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>{t("notAuthorized.contactAdmin")}</span>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Help Card */}
        <Card className="bg-muted/30 delay-150 duration-700 animate-in fade-in slide-in-from-bottom-4 fill-mode-both">
          <CardContent className="pt-6">
            <div
              className={`flex items-start ${
                language === "ar" ? "space-x-4 space-x-reverse" : "space-x-4"
              }`}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {t("notAuthorized.needAccessTitle")}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
