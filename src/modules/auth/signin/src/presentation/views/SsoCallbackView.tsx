/**
 * SsoCallbackView — Handles IdP redirect after SSO login
 *
 * This view is shown at /sso/callback after the external identity provider
 * redirects back. It reads the authorization code from URL params,
 * exchanges it via the backend, and completes the login.
 *
 * @module auth/signin/views
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import { useNavigation } from "@core/providers/navigation-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Button } from "@core/ui/button";
import { AlertTriangle, ArrowLeft, ShieldAlert, UserX } from "lucide-react";
import Link from "next/link";
import { completeSsoCallback } from "../../../../hooks/useSsoProviders";
import { appLogger } from "@/core/common/logger";
import { getModuleApiService } from "@core/services/api-factory";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { secureTokenService } from "@core/common/secure-token-service";

type CallbackState = "processing" | "success" | "error" | "no_linked_account";

interface CallbackError {
      title: string;
      message: string;
      email?: string;
      providerName?: string;
}

export function SsoCallbackView() {
      const router = useRouter();
      const searchParams = useSearchParams();
      const { t, direction } = useI18n();
      const { authRepository } = useServices();
      const setAuth = useAppStore((state) => state.setAuth);
      const { refreshNavigation } = useNavigation();
      const queryClient = useQueryClient();
      const { operationSuccess } = useEnhancedToast();
      const hasProcessed = useRef(false);

      const [state, setState] = useState<CallbackState>("processing");
      const [errorInfo, setErrorInfo] = useState<CallbackError | null>(null);

      useEffect(() => {
            if (hasProcessed.current) return;
            hasProcessed.current = true;

            const code = searchParams.get("code");
            const stateParam = searchParams.get("state");

            if (!code || !stateParam) {
                  setState("error");
                  setErrorInfo({
                        title: t("auth.sso.callbackError"),
                        message: t("auth.sso.missingParams"),
                  });
                  return;
            }

            async function handleCallback() {
                  try {
                        const result = await completeSsoCallback(code!, stateParam!);

                        // SSO callback returned linked account — complete login
                        // The callback returns accessToken, we need to save it and fetch User via auth repository
                        if (result.type === "admin" && result.accessToken) {
                              secureTokenService.setAccessToken(result.accessToken);

                              // Fetch admin profile to complete login
                              const user = await authRepository.getMe();
                              setAuth(user, user.permissions || [], []);

                              operationSuccess(t("auth.welcomeBack"));

                              try {
                                    await refreshNavigation(false, true);
                              } catch (navError) {
                                    appLogger.error("Failed to fetch navigation after SSO:", navError);
                              }

                              queryClient.invalidateQueries();

                              setState("success");
                              setTimeout(() => {
                                    router.replace("/");
                              }, 300);
                        } else {
                              // User type SSO login (not implemented for admin panel)
                              setState("error");
                              setErrorInfo({
                                    title: t("auth.sso.callbackError"),
                                    message: t("auth.sso.unsupportedAccountType"),
                              });
                        }
                  } catch (err: unknown) {
                        // Check for "no_linked_account" error
                        if (
                              err instanceof Error &&
                              err.message.includes("no_linked_account")
                        ) {
                              const errObj = err as any;
                              const details = errObj.details || {};
                              const isAuthenticated = useAppStore.getState().isAuthenticated;
                              const isLinkingSession = sessionStorage.getItem("sso_linking") === "true";

                              if (isAuthenticated || isLinkingSession) {
                                    sessionStorage.removeItem("sso_linking");
                                    try {
                                          const api = getModuleApiService("IDENTITY");
                                          await api.post(
                                                API_ENDPOINTS.PROFILE.LINK_EXTERNAL_LOGIN,
                                                {
                                                      identityProviderId: details.identityProviderId,
                                                      providerName: details.providerName || details.provider,
                                                      providerKey: details.providerKey || details.subject,
                                                      email: details.email,
                                                      displayName: details.name,
                                                }
                                          );
                                          operationSuccess(t("sso.accountLinkedSuccess"));
                                          router.replace("/profile/security");
                                          return;
                                    } catch (linkErr) {
                                          appLogger.error("Auto-link failed:", linkErr);
                                          // Fall through to error state
                                    }
                              }

                              setState("no_linked_account");
                              setErrorInfo({
                                    title: t("auth.sso.noLinkedAccount"),
                                    message: t("auth.sso.noLinkedAccountDesc"),
                              });
                              return;
                        }

                        setState("error");
                        setErrorInfo({
                              title: t("auth.sso.callbackError"),
                              message:
                                    err instanceof Error
                                          ? err.message
                                          : t("auth.sso.callbackErrorGeneric"),
                        });
                  }
            }

            handleCallback();
      }, [searchParams]);

      return (
            <div
                  className="flex min-h-screen items-center justify-center bg-background p-6"
                  dir={direction}
            >
                  <div className="w-full max-w-md">
                        {/* Processing */}
                        {state === "processing" && (
                              <div className="flex flex-col items-center gap-6 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                                          <LoadingSpinner size="md" showText={false} />
                                    </div>
                                    <div>
                                          <h2 className="text-xl font-semibold text-foreground">
                                                {t("auth.sso.callbackProcessing")}
                                          </h2>
                                          <p className="mt-2 text-sm text-muted-foreground">
                                                {t("auth.sso.callbackProcessingDesc")}
                                          </p>
                                    </div>
                              </div>
                        )}

                        {/* Success */}
                        {state === "success" && (
                              <div className="flex flex-col items-center gap-6 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10">
                                          <span className="text-4xl">✓</span>
                                    </div>
                                    <div>
                                          <h2 className="text-xl font-semibold text-foreground">
                                                {t("auth.sso.loginSuccess")}
                                          </h2>
                                          <p className="mt-2 text-sm text-muted-foreground">
                                                {t("auth.sso.redirecting")}
                                          </p>
                                    </div>
                              </div>
                        )}

                        {/* No Linked Account */}
                        {state === "no_linked_account" && (
                              <div className="flex flex-col items-center gap-6 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10">
                                          <UserX className="h-10 w-10 text-amber-500" />
                                    </div>
                                    <div>
                                          <h2 className="text-xl font-semibold text-foreground">
                                                {errorInfo?.title}
                                          </h2>
                                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                                {errorInfo?.message}
                                          </p>
                                    </div>
                                    <div className="flex gap-3">
                                          <Button variant="outline" className="gap-2" asChild>
                                                <Link href="/login">
                                                      <ArrowLeft className="h-4 w-4" />
                                                      {t("auth.sso.backToLogin")}
                                                </Link>
                                          </Button>
                                    </div>
                              </div>
                        )}

                        {/* Generic Error */}
                        {state === "error" && (
                              <div className="flex flex-col items-center gap-6 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
                                          <ShieldAlert className="h-10 w-10 text-destructive" />
                                    </div>
                                    <div>
                                          <h2 className="text-xl font-semibold text-foreground">
                                                {errorInfo?.title}
                                          </h2>
                                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                                {errorInfo?.message}
                                          </p>
                                    </div>
                                    <Button variant="outline" className="gap-2" asChild>
                                          <Link href="/login">
                                                <ArrowLeft className="h-4 w-4" />
                                                {t("auth.sso.backToLogin")}
                                          </Link>
                                    </Button>
                              </div>
                        )}
                  </div>
            </div>
      );
}

export default SsoCallbackView;
