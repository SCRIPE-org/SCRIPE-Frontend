"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useNavigation } from "@core/providers/navigation-provider";
import { useAppStore } from "@core/store/useAppStore";
import { getAuthContainer } from "@modules/auth/di";
import { handleOidcCallback, handleSamlCallback } from "./sso-callback-handlers";

export type SsoCallbackKind = "oidc" | "saml";
export type SsoCallbackState = "processing" | "success" | "error" | "no_linked_account";

export interface SsoCallbackError {
  title: string;
  message: string;
}

export function useSsoCallbackHandler(kind: SsoCallbackKind) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const { refreshNavigation } = useNavigation();
  const queryClient = useQueryClient();
  const { operationSuccess } = useEnhancedToast();
  const hasProcessed = useRef(false);

  const [state, setState] = useState<SsoCallbackState>("processing");
  const [errorInfo, setErrorInfo] = useState<SsoCallbackError | null>(null);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const { authRepository, ssoRepository } = getAuthContainer();

    const deps = {
      authRepository,
      ssoRepository,
      setAuth,
      setSubscriptionInfo,
      refreshNavigation,
      invalidateQueries: () => queryClient.invalidateQueries(),
      operationSuccess,
      t,
    };

    const setters = {
      setState,
      setErrorInfo,
      redirectTo: (path: string) => router.replace(path),
    };

    setTimeout(() => {
      if (kind === "oidc") {
        handleOidcCallback(searchParams, deps, setters);
      } else {
        handleSamlCallback(searchParams, deps, setters);
      }
    }, 0);
  }, [
    kind,
    operationSuccess,
    queryClient,
    refreshNavigation,
    router,
    searchParams,
    setAuth,
    setSubscriptionInfo,
    t,
  ]);

  return { state, errorInfo };
}
