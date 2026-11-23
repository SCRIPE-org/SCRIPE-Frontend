"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import { toast } from "@core/ui/sileo-toast";
import {
  useAccountContextSliceViewModel,
  useAccountPlanSliceViewModel,
} from "../viewmodels/useSovereignAccountSlicesViewModel";
import { PlanPageSkeleton } from "../components/AccountSkeletons";
import { AccountSliceErrorState } from "../components/AccountSliceErrorState";
import { PlanEditionBannerSection } from "../sections/plan/PlanEditionBannerSection";
import { PlanQuotasSection } from "../sections/plan/PlanQuotasSection";
import { PlanFeaturesMatrixSection } from "../sections/plan/PlanFeaturesMatrixSection";
import { isSudoCancelledError } from "../utils/sudoElevation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Tenant edition, quota consumption, and feature entitlements view (/account/plan).
 * PlatformAdmin principals are redirected to /account/dossier.
 */
export function AccountPlanView() {
  const { t } = useI18n();
  const router = useRouter();
  const requireMfaEnrollment = useAppStore((s) => s.requireMfaEnrollment);
  const { principalContext, isLoadingContext } = useAccountContextSliceViewModel();
  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";
  const canQueryPlan = !requireMfaEnrollment && Boolean(principalContext) && !isPlatformAdmin;
  const {
    plan,
    isLoadingPlan,
    isPlanError,
    planError,
    refetchPlan,
    submitPlanRequest,
    isSubmittingRequest,
  } = useAccountPlanSliceViewModel({ enabled: canQueryPlan });
  const [requestNotice, setRequestNotice] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    if (requireMfaEnrollment) {
      startRoutingProgress();
      router.replace("/account/security?mfa_enroll=1");
      return;
    }
    if (isPlatformAdmin) {
      startRoutingProgress();
      router.replace("/account/dossier");
    }
  }, [requireMfaEnrollment, isPlatformAdmin, router]);

  if (
    requireMfaEnrollment ||
    isLoadingContext ||
    isPlatformAdmin ||
    (isLoadingPlan && !plan && !isPlanError)
  ) {
    return <PlanPageSkeleton />;
  }

  if (isPlanError && !plan) {
    return (
      <AccountSliceErrorState
        title={t("profile.plan.title")}
        description={t("profile.plan.description")}
        message={planError}
        onRetry={() => void refetchPlan?.()}
      />
    );
  }

  const handleRequestUpgrade = async (featureCode: string, requestType: string) => {
    setRequestError(null);
    setRequestNotice(false);
    try {
      await submitPlanRequest({ type: requestType, code: featureCode });
      setRequestNotice(true);
      setTimeout(() => setRequestNotice(false), 2500);
    } catch (err: unknown) {
      if (isSudoCancelledError(err)) return;
      const msg = err instanceof Error && err.message ? err.message : t("profile.common.error");
      setRequestError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">{t("profile.plan.title")}</h1>
          <p className="text-xs text-nx-ink-3 mt-1">{t("profile.plan.description")}</p>
        </div>
        {requestNotice && (
          <Badge
            variant="outline"
            className="border-success/30 text-success bg-success/10 text-xs gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{t("profile.plan.requestSubmittedNotice")}</span>
          </Badge>
        )}
      </div>

      {requestError && (
        <Alert variant="destructive" data-testid="plan-request-error-alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription className="text-xs">{requestError}</AlertDescription>
        </Alert>
      )}

      <PlanEditionBannerSection t={t} plan={plan} />
      <PlanQuotasSection t={t} quotas={plan?.quotas ?? []} />
      <PlanFeaturesMatrixSection
        t={t}
        features={plan?.features ?? []}
        isSubmittingRequest={isSubmittingRequest}
        onRequestUpgrade={(code, reqType) => void handleRequestUpgrade(code, reqType)}
      />
    </div>
  );
}
