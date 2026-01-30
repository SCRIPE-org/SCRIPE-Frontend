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
import { Alert, AlertDescription } from "@core/ui/alert";
import { appLogger } from "@core/common/logger";

export default function NotAuthorizedView() {
  const router = useRouter();
  const { t, language } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Error Card */}
        <Card className="text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <CardHeader className="relative">
            {/* Icon with animated glow */}
            <div className="mx-auto mb-4 relative">
              <div className="w-24 h-24 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-destructive/20 rounded-full animate-pulse pointer-events-none" />
                <Shield className="w-12 h-12 text-destructive relative z-10" />
              </div>
            </div>

            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {t("notAuthorized.title")}
            </CardTitle>

            <CardDescription className="text-lg mt-2">
              {t("notAuthorized.description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            {/* Status Alert */}
            <div className="relative w-full rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div
                className={`flex items-start ${
                  language === "ar" ? "space-x-reverse space-x-3" : "space-x-3"
                }`}
              >
                <AlertTriangle className="text-destructive mt-0.5 flex-shrink-0" />
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <strong className="text-destructive">
                    {t("notAuthorized.accessDeniedAlert")}
                  </strong>{" "}
                  {t("notAuthorized.accessDeniedMessage")}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
              <Button
                onClick={() => {
                  appLogger.ui("Back button clicked");
                  router.back();
                  router.back();
                }}
                variant="default"
                size="lg"
                className="w-full group relative z-30 cursor-pointer"
                type="button"
              >
                {language == "en" ? (
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform " />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform " />
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
                className="w-full group relative z-30 cursor-pointer"
                type="button"
              >
                <Home className="w-4 h-4 mx-2 group-hover:scale-110 transition-transform" />
                {t("notAuthorized.goHome")}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div
              className={`flex items-center justify-center text-sm text-muted-foreground ${
                language === "ar" ? "space-x-reverse space-x-2" : "space-x-2"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t("notAuthorized.contactAdmin")}</span>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Help Card */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div
              className={`flex items-start ${
                language === "ar" ? "space-x-reverse space-x-4" : "space-x-4"
              }`}
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {t("notAuthorized.needAccessTitle")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
