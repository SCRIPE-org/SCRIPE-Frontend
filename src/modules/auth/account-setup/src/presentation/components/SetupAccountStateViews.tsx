"use client";

import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { useRouter } from "next/navigation";
// PageState type is used only as a prop type in the parent view.

interface StateViewProps {
  errorMessage?: string;
  tokenData?: { adminUsername?: string } | null;
  onRetry?: () => void;
}

/**
 * SetupAccountStateViews — Loading/invalid/success/error cards.
 *
 * Extracted from SetupAccountView so the main view focuses only on
 * the active form state, keeping it under 200 lines.
 */

export function SetupLoadingView() {
  const { t } = useI18n();
  return (
    <Card className="w-full max-w-md border-border/50 shadow-xl">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("auth.accountSetup.validating")}</p>
      </CardContent>
    </Card>
  );
}

export function SetupInvalidView({ errorMessage }: StateViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <Card className="w-full max-w-md border-destructive/30 shadow-xl">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="rounded-full bg-destructive/10 p-4">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{t("auth.accountSetup.invalidTitle")}</h2>
        <p className="max-w-xs text-center text-sm text-muted-foreground">{errorMessage}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/login")}>
          {t("auth.goToLogin")}
        </Button>
      </CardContent>
    </Card>
  );
}

export function SetupSuccessView({ tokenData }: StateViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <Card className="w-full max-w-md border-green-500/30 shadow-xl">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="rounded-full bg-green-500/10 p-4">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{t("auth.accountSetup.successTitle")}</h2>
        <p className="max-w-xs text-center text-sm text-muted-foreground">{t("auth.accountSetup.successDescription")}</p>
        <div className="mt-2 rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{tokenData?.adminUsername}</span>
        </div>
        <Button className="mt-4 w-full max-w-[200px]" onClick={() => router.push("/login")}>
          {t("auth.loginButton")}
        </Button>
      </CardContent>
    </Card>
  );
}

export function SetupErrorView({ errorMessage, onRetry }: StateViewProps) {
  const { t } = useI18n();
  return (
    <Card className="w-full max-w-md border-destructive/30 shadow-xl">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{t("auth.accountSetup.activationFailedTitle")}</h2>
        <p className="max-w-xs text-center text-sm text-muted-foreground">{errorMessage}</p>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          {t("auth.accountSetup.tryAgain")}
        </Button>
      </CardContent>
    </Card>
  );
}

export function PasswordCheck({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />}
      {label}
    </div>
  );
}
