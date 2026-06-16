"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { secureTokenService } from "@core/common/secure-token-service";
import { useAppStore } from "@core/store/useAppStore";
import { User } from "@modules/auth/core/domain/entities/User";
import { authContainer } from "@modules/auth/di";
import { STORAGE_KEYS } from "@core/config/storage-keys";

/**
 * Finalize-page phases (spec §4.2 — the post-Stripe state machine):
 *
 *   processing → polling GET /signup/status every 3s (10s after 60s — G7)
 *   slow       → still pending after 2 min: degrade copy, keep polling at 10s (U13)
 *   completing → status hit "active": consuming the ref + hydrating auth
 *   success    → tokens issued; provisioning visuals; auto-redirect to dashboard
 *   failed     → checkout expired/failed: "Your card was not charged." (U10)
 *   consumed   → ref already used: point to login
 *   expired    → ref unknown/expired: "This link has expired." (U11)
 */
export type FinalizePhase =
  | "processing"
  | "slow"
  | "completing"
  | "success"
  | "direct_success"
  | "failed"
  | "review_required"
  | "consumed"
  | "expired"
  | "timeout";

const FAST_POLL_MS = 3_000;
const SLOW_POLL_MS = 10_000;
const SLOW_AFTER_MS = 60_000;
const DEGRADE_AFTER_MS = 120_000;
const ABORT_AFTER_MS = 30 * 60 * 1_000; // 30 min hard stop

export function useFinalizeViewModel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { signupRepository } = authContainer;

  const setAuth = useAppStore((s) => s.setAuth);
  const setSubscriptionInfo = useAppStore((s) => s.setSubscriptionInfo);
  const setDefaultRedirectPath = useAppStore((s) => s.setDefaultRedirectPath);
  const setTenantCode = useAppStore((s) => s.setTenantCode);

  const [phase, setPhase] = useState<FinalizePhase>("processing");
  const [error, setError] = useState("");
  const [supportReference, setSupportReference] = useState("");

  const refRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isCompletingRef = useRef(false);
  const stoppedRef = useRef(false);

  // ── Consume the ref → JWTs → dashboard (mirrors the free-flow auth hydration) ──
  const completeSession = useCallback(
    async (signupRef: string) => {
      if (isCompletingRef.current) return;
      isCompletingRef.current = true;
      setPhase("completing");

      try {
        const result = await signupRepository.completeSession(signupRef);

        secureTokenService.setAccessToken(result.accessToken);

        const user =
          result.user ??
          new User({
            id: "",
            username: "user",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            adminTypeName: "",
          });

        setAuth(user, user.permissions ?? [], [], true);
        if (result.tenantCode) setTenantCode(result.tenantCode);
        setSubscriptionInfo(null, null, null);
        setDefaultRedirectPath(result.redirectUrl || "/");
        queryClient.invalidateQueries();

        try {
          sessionStorage.removeItem(STORAGE_KEYS.SIGNUP_REF);
          sessionStorage.removeItem(STORAGE_KEYS.SIGNUP_WIZARD);
        } catch {
          // storage unavailable — nothing to clean
        }

        setPhase("success");
        setTimeout(() => {
          router.replace(result.redirectUrl || "/");
        }, 1800);
      } catch (err: unknown) {
        // 409 already_consumed → the user finished in another tab; send them to login
        const message = err instanceof Error ? err.message : "";
        if (message.toLowerCase().includes("already")) {
          setPhase("consumed");
        } else {
          isCompletingRef.current = false;
          setError(message);
          setPhase("failed");
        }
      }
    },
    [
      signupRepository,
      router,
      queryClient,
      setAuth,
      setTenantCode,
      setSubscriptionInfo,
      setDefaultRedirectPath,
    ]
  );

  // ── Polling loop: 3s → 10s after 60s; degrade copy after 2 min (G7/U13) ──
  const pollOnce = useCallback(async () => {
    const signupRef = refRef.current;
    const sessionId = sessionIdRef.current;
    if (stoppedRef.current) return;

    if (signupRef) {
      try {
        const result = await signupRepository.getStatus(signupRef);

        switch (result.status) {
          case "active":
            await completeSession(signupRef);
            return; // terminal — no more polling
          case "consumed":
            setPhase("consumed");
            return;
          case "failed":
          case "abandoned":
            setPhase("failed");
            return;
          case "unknown":
            setPhase("expired");
            return;
          default:
            // pending / awaiting_payment — keep polling
            break;
        }
      } catch {
        // Transient network error — keep polling at the current cadence
      }
    } else if (sessionId) {
      try {
        const result = await signupRepository.getCheckoutStatus(sessionId);
        setSupportReference(result.supportReference || "");

        switch (result.status) {
          case "completed":
            setPhase("direct_success");
            return; // terminal
          case "failed":
            setPhase("review_required");
            setError(result.message || "");
            return; // terminal
          case "expired":
          case "unknown":
            setPhase("expired");
            return; // terminal
          default:
            // pending / processing — keep polling
            break;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "";
        if (message.toLowerCase().includes("not found")) {
          setPhase("expired");
          return;
        }
      }
    } else {
      setPhase("expired");
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;

    if (elapsed >= ABORT_AFTER_MS) {
      if (sessionId) {
        setSupportReference(`checkout-${sessionId.slice(-12)}`);
        setPhase("review_required");
        return;
      }
      setPhase("timeout");
      return; // terminal — stop polling
    }

    if (elapsed >= DEGRADE_AFTER_MS) {
      setPhase((p) => (p === "processing" || p === "slow" ? "slow" : p));
    }
    const interval = elapsed >= SLOW_AFTER_MS ? SLOW_POLL_MS : FAST_POLL_MS;
    timerRef.current = setTimeout(pollOnce, interval);
  }, [signupRepository, completeSession]);

  useEffect(() => {
    // ref priority: sessionStorage (same-browser Stripe round-trip) → ?ref= (email link)
    let signupRef: string | null = null;
    try {
      signupRef = sessionStorage.getItem(STORAGE_KEYS.SIGNUP_REF);
    } catch {
      // private mode
    }
    if (!signupRef) signupRef = searchParams?.get("ref") ?? null;

    if (signupRef) {
      refRef.current = signupRef;
      sessionIdRef.current = null;
    } else {
      const sessionId = searchParams?.get("session_id") ?? null;
      if (sessionId) {
        refRef.current = null;
        sessionIdRef.current = sessionId;
      } else {
        setPhase("expired");
        return;
      }
    }

    startedAtRef.current = Date.now();
    stoppedRef.current = false;
    void pollOnce();

    return () => {
      stoppedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewSignup = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.SIGNUP_REF);
      sessionStorage.removeItem(STORAGE_KEYS.SIGNUP_WIZARD);
    } catch {
      // nothing to clean
    }
    router.push("/signup");
  }, [router]);

  const goToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  const changePlan = useCallback(() => {
    router.push("/signup?change-plan=1");
  }, [router]);

  return {
    phase,
    error,
    supportReference,
    startNewSignup,
    goToLogin,
    changePlan,
  };
}
