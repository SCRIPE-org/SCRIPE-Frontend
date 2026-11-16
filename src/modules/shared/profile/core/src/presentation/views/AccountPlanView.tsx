"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import {
  useAccountContextSliceViewModel,
  useAccountPlanSliceViewModel,
} from "../viewmodels/useSovereignAccountSlicesViewModel";
import { PlanPageSkeleton } from "../components/AccountSkeletons";
import { PlanEditionBannerSection } from "../sections/plan/PlanEditionBannerSection";
import { PlanQuotasSection } from "../sections/plan/PlanQuotasSection";
import { PlanFeaturesMatrixSection } from "../sections/plan/PlanFeaturesMatrixSection";
import { CheckCircle2 } from "lucide-react";

/**
 * Tenant edition, quota consumption, and feature entitlements view (/account/plan).
 * PlatformAdmin principals are redirected to /account/dossier.
 */
export function AccountPlanView() {
  const { t } = useI18n();
  const router = useRouter();
  const { principalContext, isLoadingContext } = useAccountContextSliceViewModel();
  const { plan, isLoadingPlan, submitPlanRequest, isSubmittingRequest } =
    useAccountPlanSliceViewModel();
  const [requestNotice, setRequestNotice] = useState(false);

  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";

  useEffect(() => {
    if (isPlatformAdmin) {
      router.replace("/account/dossier");
    }
  }, [isPlatformAdmin, router]);

  if (isLoadingContext || isPlatformAdmin || (isLoadingPlan && !plan)) {
    return <PlanPageSkeleton />;
  }

  const handleRequestUpgrade = async (featureCode: string, requestType: string) => {
    await submitPlanRequest({ type: requestType, code: featureCode });
    setRequestNotice(true);
    setTimeout(() => setRequestNotice(false), 2500);
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
