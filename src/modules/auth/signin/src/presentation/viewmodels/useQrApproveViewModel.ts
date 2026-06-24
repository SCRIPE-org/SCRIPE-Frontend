"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuthContainer } from "@modules/auth/di";

export function useQrApproveViewModel() {
  const router = useRouter();

  const handleApprove = useCallback(async (sid: string) => {
    await getAuthContainer().authRepository.approveQrSignIn(sid);
  }, []);

  const handleReject = useCallback(async (sid: string) => {
    try {
      await getAuthContainer().authRepository.rejectQrSignIn(sid);
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
