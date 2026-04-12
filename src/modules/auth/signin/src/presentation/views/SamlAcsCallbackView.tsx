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
import { ShieldAlert, ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";
import { appLogger } from "@/core/common/logger";
import { secureTokenService } from "@core/common/secure-token-service";


type CallbackState = "processing" | "success" | "error" | "no_linked_account";

interface CallbackError {
      title: string;
      message: string;
}

/**
 * SamlAcsCallbackView — Handles SAML Assertion Consumer Service redirect
 * 
 * The backend verifies the SAML XML Assertion from the IdP.
 * It then issues a 302 Redirect to this page, passing the access_token in the query string.
 * This view extracts the token, fetches the user profile, and logs the user in.
 */
export function SamlAcsCallbackView() {
      const router = useRouter();
      const searchParams = useSearchParams();
      const { t, direction } = useI18n();
      const { authRepository } = useServices();
      const setAuth = useAppStore((state) => state.setAuth);
      const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
      const { refreshNavigation } = useNavigation();
      const queryClient = useQueryClient();
      const { operationSuccess } = useEnhancedToast();
      const hasProcessed = useRef(false);

      const [state, setState] = useState<CallbackState>("processing");
      const [errorInfo, setErrorInfo] = useState<CallbackError | null>(null);

      useEffect(() => {
            if (hasProcessed.current) return;
            hasProcessed.current = true;

            const errorParam = searchParams.get("error");
            const accessToken = searchParams.get("access_token");
            const type = searchParams.get("type"); // 'admin' or 'user'

            // Handle errors explicitly returned by the backend
            if (errorParam) {
                  const errMessage = decodeURIComponent(errorParam);

                  // Check if it's a linking issue
                  if (errMessage.includes("no_linked_account") || errMessage.includes("automatically linked")) {

                        // Extract linking details from query string if provided
                        const providerId = searchParams.get("providerId");
                        const email = searchParams.get("email");
                        const name = searchParams.get("name");
                        const providerName = searchParams.get("providerName");
                        const subject = searchParams.get("subject");

                        const isAuthenticated = useAppStore.getState().isAuthenticated;
                        const isLinkingSession = sessionStorage.getItem("sso_linking") === "true";

                        // Auto-link flow
                        if ((isAuthenticated || isLinkingSession) && providerId && providerName && email && subject) {
                              sessionStorage.removeItem("sso_linking");

                              const linkAccount = async () => {
                                    try {
                                          await authRepository.linkExternalLogin({
                                                identityProviderId: providerId,
                                                providerName: providerName,
                                                providerKey: subject,
                                                email: email,
                                                displayName: name ?? undefined,
                                          });
                                          operationSuccess(t("sso.accountLinkedSuccess"));
                                          router.replace("/profile/security");
                                    } catch (linkErr) {
                                          appLogger.error("SAML auto-link failed:", linkErr);
                                          setState("error");
                                          setErrorInfo({
                                                title: t("auth.sso.callbackError"),
                                                message: linkErr instanceof Error ? linkErr.message : "Failed to link account",
                                          });
                                    }
                              };

                              linkAccount();
                              return;
                        }

                        // Display nice no-linked-account UI
                        setState("no_linked_account");
                        setErrorInfo({
                              title: t("auth.sso.noLinkedAccount"),
                              message: t("auth.sso.noLinkedAccountDesc"),
                        });
                        return;
                  }

                  // Generic explicit error from backend
                  setState("error");
                  setErrorInfo({
                        title: t("auth.sso.callbackError"),
                        message: errMessage,
                  });
                  return;
            }

            // Standard Login Flow
            if (!accessToken) {
                  setState("error");
                  setErrorInfo({
                        title: t("auth.sso.callbackError"),
                        message: t("auth.sso.missingParams"),
                  });
                  return;
            }

            async function fetchProfile() {
                  try {
                        if (type === "admin") {
                              secureTokenService.setAccessToken(accessToken!);

                              // Fetch admin profile to complete login
                              const user = await authRepository.getMe();
                              setAuth(user, user.permissions || [], []);

                              // Propagate subscription info from SAML callback query params
                              const subStatus = searchParams.get("subscription_status");
                              const subGracePhase = searchParams.get("grace_phase");
                              const subEditionName = searchParams.get("edition_name");
                              setSubscriptionInfo(
                                    subStatus ?? null,
                                    subGracePhase ?? null,
                                    subEditionName ?? null
                              );

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
                              setState("error");
                              setErrorInfo({
                                    title: t("auth.sso.callbackError"),
                                    message: t("auth.sso.unsupportedAccountType"),
                              });
                        }
                  } catch (err: unknown) {
                        setState("error");
                        setErrorInfo({
                              title: t("auth.sso.callbackError"),
                              message: err instanceof Error ? err.message : t("auth.sso.callbackErrorGeneric"),
                        });
                  }
            }

            fetchProfile();
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

export default SamlAcsCallbackView;
