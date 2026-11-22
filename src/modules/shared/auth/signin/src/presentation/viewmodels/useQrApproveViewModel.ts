"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuthContainer } from "@modules/auth/di";

/**
 * React hook/ViewModel orchestrating state and data flows for qr approve view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useQrApproveViewModel() {
  const router = useRouter();

  const handleApprove = useCallback(async (sessionToken: string, deviceInfo?: string) => {
    await getAuthContainer().authRepository.approveQrSignIn(sessionToken, deviceInfo);
  }, []);

  const handleReject = useCallback(async (sessionToken: string) => {
    try {
      await getAuthContainer().authRepository.rejectQrSignIn(sessionToken);
    } catch {
      // Rejection is best-effort
    }
  }, []);

  const handleComplete = useCallback(() => {
    router.replace("/login");
  }, [router]);

  return {
    handleApprove,
    handleReject,
    handleComplete,
  };
}
