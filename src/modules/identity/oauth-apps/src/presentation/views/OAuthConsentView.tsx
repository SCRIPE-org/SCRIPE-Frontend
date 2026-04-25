"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@core/ui/card";
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
                              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                        </div>
                  </div>
            );
      }

      if (!vm.clientId || !vm.redirectUri) {
            return (
                  <div className="flex min-h-screen items-center justify-center bg-background p-6" dir={direction}>
                        <Card className="w-full max-w-md shadow-xl border-destructive">
                              <CardHeader className="text-center pb-2">
                                    <ShieldCheck className="w-12 h-12 mx-auto text-destructive mb-4" />
                                    <CardTitle>{t("oauth.invalidRequestTitle")}</CardTitle>
                              </CardHeader>
                              <CardContent className="text-center text-muted-foreground pb-6">
                                    <p>{t("oauth.invalidRequestDesc")}</p>
                              </CardContent>
                              <CardFooter>
                                    <Button className="w-full" variant="outline" asChild>
                                          <Link href="/"><ArrowLeft className="mr-2 w-4 h-4" /> {t("oauth.backToDashboard")}</Link>
                                    </Button>
                              </CardFooter>
                        </Card>
                  </div>
            );
      }

      return (
            <div className="flex min-h-screen items-center justify-center bg-background/95 p-6" dir={direction}>
                  <Card className="w-full max-w-md shadow-xl ring-1 ring-border/50">
                        <CardHeader className="text-center pb-6">
                              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 ring-8 ring-primary/5">
                                    <ShieldCheck className="h-8 w-8 text-primary" />
                              </div>
                              <CardTitle className="text-2xl font-bold tracking-tight">{t("oauth.consentTitle")}</CardTitle>
                              <CardDescription className="text-base mt-2">
                                    <strong className="text-foreground">{vm.appName}</strong> {t("oauth.isRequestingAccess")}
                              </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                              <div className="rounded-xl border bg-card p-4 shadow-sm">
                                    <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider text-muted-foreground">
                                          {t("oauth.willBeAbleTo")}
                                    </h4>
                                    <ul className="space-y-3">
                                          {vm.requestedScopes.map((s) => (
                                                <li key={s} className="flex items-start gap-3">
                                                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                                      <div>
                                                            <p className="text-sm font-medium text-foreground leading-none">
                                                                  {s === "openid" ? t("oauth.scopes.openid") :
                                                                        s === "profile" ? t("oauth.scopes.profile") :
                                                                              s === "email" ? t("oauth.scopes.email") :
                                                                                    s === "offline_access" ? t("oauth.scopes.offline_access") :
                                                                                          t("oauth.defaultScope", { scope: s })}
                                                            </p>
                                                      </div>
                                                </li>
                                          ))}
                                    </ul>
                              </div>

                              <div className="text-center text-sm text-muted-foreground">
                                    <p>
                                          {t("oauth.signedInAs")} <strong className="text-foreground">{vm.userDisplayName}</strong>.
                                          <br />
                                          {t("oauth.notYou")}{" "}
                                          <button
                                                type="button"
                                                className="text-primary hover:underline font-medium"
                                                onClick={vm.handleSwitchAccount}
                                          >
                                                {t("oauth.switchAccount")}
                                          </button>
                                    </p>
                              </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3 pt-6 border-t bg-muted/20">
                              <Button
                                    className="w-full h-12 text-base font-medium shadow-sm transition-all hover:bg-primary/90"
                                    onClick={vm.handleApprove}
                                    loading={vm.isApproving}
                                    disabled={vm.isDenying}
                              >
                                    {t("oauth.allowAccess")}
                              </Button>
                              <Button
                                    variant="outline"
                                    className="w-full h-12 text-base font-medium"
                                    onClick={vm.handleDeny}
                                    loading={vm.isDenying}
                                    disabled={vm.isApproving}
                              >
                                    {t("oauth.cancelAndReturn")}
                              </Button>
                        </CardFooter>
                  </Card>

                  {/* Declarative Hidden Form (Controlled by ViewModel) */}
                  {vm.formAction && vm.accessToken && (
                        <form
                              ref={vm.formRef}
                              method="POST"
                              action={vm.formAction}
                              className="hidden"
                              style={{ display: "none" }}
                        >
                              {Object.entries(vm.formParams).map(([key, value]) => (
                                    <input key={key} type="hidden" name={key} value={value} />
                              ))}
                              <input type="hidden" name="access_token" value={vm.accessToken} />
                        </form>
                  )}
            </div>
      );
}
