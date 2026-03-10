"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useServices } from "@core/providers/service-provider";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@core/ui/card";
import { ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { secureTokenService } from "@core/common/secure-token-service";
import { appLogger } from "@core/common/logger";

/**
 * OAuthConsentView — SPA Consent Screen for OIDC Provider flows
 * 
 * Flow:
 * 1. Backend /connect/authorize redirects here (302 full-page nav)
 * 2. In-memory access token is LOST (full-page nav clears JS memory)
 * 3. We silently refresh the token via httpOnly refresh cookie 
 * 4. User sees the consent screen and clicks Allow
 * 5. We POST a hidden form to /connect/authorize with the fresh JWT
 * 6. Backend validates, issues auth code, redirects to client app
 */
export function OAuthConsentView() {
      const searchParams = useSearchParams();
      const router = useRouter();
      const { t, direction } = useI18n();
      const { operationError } = useEnhancedToast();
      const { authRepository } = useServices();

      const isAuthenticated = useAppStore((state) => state.isAuthenticated);
      const setAuth = useAppStore((state) => state.setAuth);
      const logout = useAppStore((state) => state.logout);
      const user = useAppStore((state) => state.user);
      const hasHydrated = useAppStore((state) => state._hasHydrated);

      const [isApproving, setIsApproving] = useState(false);
      const [isDenying, setIsDenying] = useState(false);
      const [isRestoringSession, setIsRestoringSession] = useState(true); // Start as loading
      const hasAttemptedRefresh = useRef(false);

      const clientId = searchParams.get("client_id");
      const redirectUri = searchParams.get("redirect_uri");
      const scope = searchParams.get("scope");
      const state = searchParams.get("state");

      // ─── Step 1: Restore the in-memory access token ───
      // After a full-page redirect from the backend, the in-memory token is GONE.
      // We must silently refresh using the httpOnly refresh token cookie.
      useEffect(() => {
            if (!hasHydrated) return;
            if (hasAttemptedRefresh.current) return;
            hasAttemptedRefresh.current = true;

            const restoreSession = async () => {
                  // Case A: Token already in memory (user navigated from within the SPA)
                  if (secureTokenService.hasToken()) {
                        appLogger.debug("[OAuthConsent] Token already in memory, ready.");
                        setIsRestoringSession(false);
                        return;
                  }

                  // Case B: Store says authenticated but no token (full-page redirect scenario)
                  if (isAuthenticated) {
                        appLogger.debug("[OAuthConsent] No token in memory. Attempting silent refresh...");
                        try {
                              const result = await authRepository.refreshToken();
                              if (result.kind === "ok") {
                                    const me = await authRepository.getMe();
                                    if (me) {
                                          setAuth(me, me.permissions || [], []);
                                          appLogger.debug("[OAuthConsent] Token restored successfully via silent refresh.");
                                          setIsRestoringSession(false);
                                          return;
                                    }
                              }
                        } catch (err) {
                              appLogger.error("[OAuthConsent] Silent refresh failed:", err);
                              // If refresh failed, attempt to log out from the backend to clear any lingering session
                              try {
                                    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                                    const baseHost = backendUrl.replace(/\/api$/, "");
                                    await fetch(`${baseHost}/api/v1/auth/logout`, { method: "POST", credentials: "include" });
                              } catch (logoutError) {
                                    appLogger.error("[OAuthConsent] Failed to explicitly log out after silent refresh failure:", logoutError);
                              }
                        }
                        // Refresh failed → session truly expired
                        appLogger.debug("[OAuthConsent] Refresh failed. Redirecting to login.");
                  }

                  // Case C: Not authenticated at all → redirect to login with return URL
                  const currentParams = searchParams.toString();
                  const redirectPath = encodeURIComponent(`/authorize?${currentParams}`);
                  secureTokenService.clearTokens();
                  logout();
                  router.replace(`/login?redirect=${redirectPath}`);
            };

            restoreSession();
      }, [hasHydrated, isAuthenticated, authRepository, setAuth, logout, router, searchParams]);

      const handleApprove = () => {
            setIsApproving(true);
            try {
                  const accessToken = secureTokenService.getAccessToken();
                  if (!accessToken) {
                        throw new Error(t("oauth.sessionExpired"));
                  }

                  // Build the URL to the backend OpenIddict OIDC server endpoint
                  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                  // OpenIddict endpoints are at the root, not under /api
                  const baseHost = backendUrl.replace(/\/api$/, "");
                  const actionUrl = `${baseHost}/connect/authorize`;

                  // Create a hidden form dynamically to POST to the OpenIddict endpoint
                  const form = document.createElement("form");
                  form.method = "POST";
                  form.action = actionUrl;
                  form.style.display = "none";

                  // Add only standard OIDC parameters (filter out display_name and other non-OIDC params)
                  const oidcParams = new Set([
                        "client_id", "redirect_uri", "response_type", "scope", "state",
                        "code_challenge", "code_challenge_method", "nonce", "response_mode",
                        "prompt", "login_hint", "acr_values", "consent_ticket"
                  ]);
                  searchParams.forEach((value, key) => {
                        if (oidcParams.has(key)) {
                              const input = document.createElement("input");
                              input.type = "hidden";
                              input.name = key;
                              input.value = value;
                              form.appendChild(input);
                        }
                  });

                  // INJECT our SPA JWT Token to securely authenticate the OpenIddict request!
                  const tokenInput = document.createElement("input");
                  tokenInput.type = "hidden";
                  tokenInput.name = "access_token";
                  tokenInput.value = accessToken;
                  form.appendChild(tokenInput);

                  document.body.appendChild(form);

                  // Submit immediately — this navigates the user away to the API, 
                  // which will then issue a 302 HTTP Redirect back to the 3rd Party App.
                  form.submit();

            } catch (err) {
                  setIsApproving(false);
                  appLogger.error("Approval failed:", err);
                  operationError(err instanceof Error ? err.message : t("auth.sso.callbackErrorGeneric"));
            }
      };

      const handleDeny = () => {
            setIsDenying(true);
            // If denied, we must redirect back to the client application with an access_denied error
            if (redirectUri) {
                  const url = new URL(redirectUri);
                  url.searchParams.append("error", "access_denied");
                  url.searchParams.append("error_description", "The user denied access to your application.");
                  if (state) {
                        url.searchParams.append("state", state);
                  }
                  window.location.href = url.toString();
            } else {
                  // Fallback if no redirect URI
                  router.push("/");
            }
      };

      // Loading: waiting for hydration or token restoration
      if (!hasHydrated || isRestoringSession) {
            return (
                  <div className="flex min-h-screen items-center justify-center p-6">
                        <div className="text-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                        </div>
                  </div>
            );
      }

      if (!clientId || !redirectUri) {
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

      // Format requested scopes for display
      const requestedScopes = scope ? scope.split(" ") : ["openid", "profile"];
      const displayName = searchParams.get("display_name");
      const appName = displayName || clientId;

      // Ensure form parameters are correctly mapped for the POST request
      const formParams = Array.from(searchParams.entries()).map(([key, value]) => ({
            name: key,
            value: value,
      }));
      // The authorization endpoint path
      const authorizeUrl = "/connect/authorize";

      return (
            <div className="flex min-h-screen items-center justify-center bg-background/95 p-6" dir={direction}>
                  <Card className="w-full max-w-md shadow-xl ring-1 ring-border/50">
                        <CardHeader className="text-center pb-6">
                              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 ring-8 ring-primary/5">
                                    <ShieldCheck className="h-8 w-8 text-primary" />
                              </div>
                              <CardTitle className="text-2xl font-bold tracking-tight">{t("oauth.consentTitle")}</CardTitle>
                              <CardDescription className="text-base mt-2">
                                    <strong className="text-foreground">{appName}</strong> {t("oauth.isRequestingAccess")}
                              </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                              <div className="rounded-xl border bg-card p-4 shadow-sm">
                                    <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider text-muted-foreground">
                                          {t("oauth.willBeAbleTo")}
                                    </h4>
                                    <ul className="space-y-3">
                                          {requestedScopes.map((s) => (
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
                                          {t("oauth.signedInAs")} <strong className="text-foreground">{user?.displayName || user?.username}</strong>.
                                          <br />
                                          {t("oauth.notYou")}{" "}
                                          <button
                                                type="button"
                                                className="text-primary hover:underline font-medium"
                                                onClick={() => {
                                                      // Log out and redirect to login, preserving the OAuth params
                                                      const currentParams = searchParams.toString();
                                                      const redirectPath = encodeURIComponent(`/authorize?${currentParams}`);
                                                      secureTokenService.clearTokens();
                                                      logout();
                                                      router.replace(`/login?redirect=${redirectPath}`);
                                                }}
                                          >
                                                {t("oauth.switchAccount")}
                                          </button>
                                    </p>
                              </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3 pt-6 border-t bg-muted/20">
                              <form
                                    method="POST"
                                    action={authorizeUrl}
                                    className="w-full"
                                    onSubmit={(e) => {
                                          if (isApproving || isDenying) {
                                                e.preventDefault();
                                                return;
                                          }
                                          // Set loading state AFTER form submission has begun
                                          setIsApproving(true);
                                    }}
                              >
                                    {formParams.map((p) => (
                                          <input key={p.name} type="hidden" name={p.name} value={p.value} />
                                    ))}
                                    <Button
                                          type="submit"
                                          className="w-full h-12 text-base font-medium shadow-sm transition-all hover:bg-primary/90"
                                          disabled={isApproving || isDenying}
                                    >
                                          {isApproving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                          {t("oauth.allowAccess")}
                                    </Button>
                              </form>
                              <Button
                                    variant="outline"
                                    className="w-full h-12 text-base font-medium"
                                    onClick={handleDeny}
                                    disabled={isApproving || isDenying}
                              >
                                    {isDenying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    {t("oauth.cancelAndReturn")}
                              </Button>
                        </CardFooter>
                  </Card>
            </div>
      );
}
