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
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
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
        <LoadingSpinner />
      </div>
    );
  }

  if (!vm.clientId || !vm.redirectUri) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-nx-ground p-6"
        dir={direction}
      >
        <Card className="w-full max-w-md border-destructive/40">
          <CardHeader className="pb-2 text-center">
            <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-destructive" aria-hidden="true" />
            <CardTitle>{t("oauth.invalidRequestTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="pb-6 text-center text-nx-ink-2">
            <p>{t("oauth.invalidRequestDesc")}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                {t("oauth.backToDashboard")}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { formAction, formParams, accessToken, formRef } = vm;

  return (
    <div className="flex min-h-screen items-center justify-center bg-nx-ground p-6" dir={direction}>
      <Card className="w-full max-w-md">
        <CardHeader className="pb-6 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-nx-accent-wash"
            aria-hidden="true"
          >
            <ShieldCheck className="h-8 w-8 text-nx-accent" />
          </div>
          <CardTitle>{t("oauth.consentTitle")}</CardTitle>
          <CardDescription className="mt-2">
            <strong className="font-semibold text-nx-ink">{vm.appName}</strong>{" "}
            {t("oauth.isRequestingAccess")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-nx-md border border-nx-line bg-nx-surface p-4">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-nx-ink-2">
              {t("oauth.willBeAbleTo")}
            </h4>
            <ul className="space-y-3">
              {vm.requestedScopes.map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium leading-none text-nx-ink">
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

          <div className="text-center text-sm text-nx-ink-2">
            <p>
              {t("oauth.signedInAs")}{" "}
              <strong className="font-semibold text-nx-ink">{vm.userDisplayName}</strong>.
              <br />
              {t("oauth.notYou")}{" "}
              <button
                type="button"
                className="font-medium text-nx-accent hover:underline focus-visible:shadow-nx-focus focus-visible:outline-none"
                onClick={vm.handleSwitchAccount}
              >
                {t("oauth.switchAccount")}
              </button>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-nx-line bg-nx-raised pt-6">
          <Button
            className="h-12 w-full text-base font-medium"
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
