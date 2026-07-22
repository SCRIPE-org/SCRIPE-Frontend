// UI-EXCEPTION: compact studio layout
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@core/ui/card";
import { ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useOAuthConsentViewModel } from "../viewmodels/useOAuthConsentViewModel";

/**
 * OAuthConsentView — SPA Consent Screen for OIDC Provider flows
 * Pure UI Component - All logic handled by useOAuthConsentViewModel
 */
export function OAuthConsentView() {
  const { t, direction } = useI18n();
  const vm = useOAuthConsentViewModel();

  // Loading: waiting for hydration or token restoration
  if (!vm.hasHydrated || vm.isRestoringSession) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6" dir={direction}>
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!vm.clientId || !vm.redirectUri) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background p-6"
        dir={direction}
      >
        <Card className="w-full max-w-md border-destructive shadow-xl">
          <CardHeader className="pb-2 text-center">
            <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <CardTitle>{t("oauth.invalidRequestTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="pb-6 text-center text-muted-foreground">
            <p>{t("oauth.invalidRequestDesc")}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("oauth.backToDashboard")}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { formAction, formParams, accessToken, formRef } = vm;

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background/95 p-6"
      dir={direction}
    >
      <Card className="w-full max-w-md shadow-xl ring-1 ring-border/50">
        <CardHeader className="pb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("oauth.consentTitle")}
          </CardTitle>
          <CardDescription className="mt-2 text-base">
            <strong className="text-foreground">{vm.appName}</strong>{" "}
            {t("oauth.isRequestingAccess")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground text-muted-foreground">
              {t("oauth.willBeAbleTo")}
            </h4>
            <ul className="space-y-3">
              {vm.requestedScopes.map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-medium leading-none text-foreground">
                      {s === "openid"
                        ? t("oauth.scopes.openid")
                        : s === "profile"
                          ? t("oauth.scopes.profile")
                          : s === "email"
                            ? t("oauth.scopes.email")
                            : s === "offline_access"
                              ? t("oauth.scopes.offline_access")
                              : t("oauth.defaultScope", { scope: s })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              {t("oauth.signedInAs")}{" "}
              <strong className="text-foreground">{vm.userDisplayName}</strong>.
              <br />
              {t("oauth.notYou")}{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={vm.handleSwitchAccount}
              >
                {t("oauth.switchAccount")}
              </button>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 pt-6">
          <Button
            className="h-12 w-full text-base font-medium shadow-sm transition-all hover:bg-primary/90"
            onClick={vm.handleApprove}
            loading={vm.isApproving}
            disabled={vm.isDenying}
          >
            {t("oauth.allowAccess")}
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full text-base font-medium"
            onClick={vm.handleDeny}
            loading={vm.isDenying}
            disabled={vm.isApproving}
          >
            {t("oauth.cancelAndReturn")}
          </Button>
        </CardFooter>
      </Card>

      {/* Declarative Hidden Form (Controlled by ViewModel) */}
      {formAction && accessToken && (
        <form
          ref={formRef}
          method="POST"
          action={formAction}
          className="hidden"
          style={{ display: "none" }}
        >
          {Object.entries(formParams).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <input type="hidden" name="access_token" value={accessToken} />
        </form>
      )}
    </div>
  );
}
