"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { secureTokenService } from "@core/common/secure-token-service";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";

export function useActivateWorkspaceViewModel() {
  const router = useRouter();
  const { t, language } = useI18n();
  const { tokens } = useSignupTheme();
  const { toast } = useEnhancedToast();
  
  const user = useAppStore((state) => state.user);
  const logoutStore = useAppStore((state) => state.logout);
  const tenantId = user?.tenantId;
  const isRtl = language === "ar";

  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedCycle, setSelectedCycle] = useState<"Monthly" | "Yearly">("Monthly");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [isConfirmingFree, setIsConfirmingFree] = useState(false);

  // Fetch current subscription
  const { data: subscription, isLoading: isLoadingSub } = useQuery({
    queryKey: ["activate-workspace-subscription", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      return entitlementsContainer.subscriptionRepository.getMyTenantSubscription();
    },
    enabled: !!tenantId,
  });

  // Fetch all editions
  const { data: editionsResult, isLoading: isLoadingEditions } = useQuery({
    queryKey: ["activate-workspace-editions"],
    queryFn: () => entitlementsContainer.editionRepository.getAll({ page: 1, pageSize: 50 }),
  });

  const editions = editionsResult?.items ?? [];

  // Action: Sign Out
  const handleSignOut = () => {
    secureTokenService.clearTokens();
    useNavigationStore.getState().reset();
    logoutStore();
    router.push("/login");
  };

  // Action: Retry checkout
  const handleRetryPayment = async () => {
    if (!tenantId || !subscription) return;
    setIsRetrying(true);
    try {
      const response = await entitlementsContainer.billingRepository.createCheckoutSession(tenantId, {
        editionId: subscription.editionId,
        subscriptionType: subscription.type || "Monthly",
        currency: subscription.currency || "USD",
        successUrl: `${window.location.origin}/dashboard`,
        cancelUrl: `${window.location.origin}/activate-workspace`,
      });

      if (response && response.url) {
        window.location.href = response.url;
      } else {
        toast({
          variant: "destructive",
          title: t("entitlements.activateWorkspace.createFailed") || (isRtl ? "فشل إنشاء جلسة الدفع" : "Payment Session Failed"),
          description: isRtl ? "تعذر إنشاء جلسة الدفع، يرجى المحاولة لاحقاً." : "Could not create checkout session. Please try again later.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: isRtl ? "خطأ في الاتصال" : "Connection Error",
        description: err?.message || (isRtl ? "حدث خطأ غير متوقع." : "An unexpected error occurred."),
      });
    } finally {
      setIsRetrying(false);
    }
  };

  // Action: Change Plan (either Free downgrade or change to another paid plan)
  const handleChangePlanSubmit = async () => {
    if (!tenantId || !selectedPlanId) return;
    
    const targetEdition = editions.find(e => e.id === selectedPlanId);
    if (!targetEdition) return;

    setIsChangingPlan(true);
    try {
      if (targetEdition.isFree) {
        // Free plan - downgrade instantly
        await entitlementsContainer.subscriptionRepository.change(tenantId, {
          editionId: selectedPlanId,
          type: "Lifetime",
        });

        toast({
          variant: "success",
          title: isRtl ? "تم تفعيل مساحة العمل" : "Workspace Activated",
          description: isRtl ? "تم تحويل مساحة عملك للخطة المجانية وتفعيلها بنجاح." : "Your workspace was successfully switched to the Free plan and activated.",
        });

        // Trigger session update and page reload
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Paid plan - create new checkout session
        const response = await entitlementsContainer.billingRepository.createCheckoutSession(tenantId, {
          editionId: selectedPlanId,
          subscriptionType: selectedCycle,
          currency: subscription?.currency || "USD",
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/activate-workspace`,
        });

        if (response && response.url) {
          window.location.href = response.url;
        } else {
          toast({
            variant: "destructive",
            title: isRtl ? "فشل إنشاء جلسة الدفع" : "Payment Session Failed",
            description: isRtl ? "تعذر إنشاء جلسة الدفع، يرجى المحاولة لاحقاً." : "Could not create checkout session. Please try again later.",
          });
        }
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: isRtl ? "خطأ في تحويل الخطة" : "Plan Switch Failed",
        description: err?.message || (isRtl ? "حدث خطأ غير متوقع." : "An unexpected error occurred."),
      });
    } finally {
      setIsChangingPlan(false);
      setIsConfirmingFree(false);
    }
  };

  return {
    subscription,
    isLoadingSub,
    editions,
    isLoadingEditions,
    isRetrying,
    selectedPlanId,
    setSelectedPlanId,
    selectedCycle,
    setSelectedCycle,
    isChangingPlan,
    isConfirmingFree,
    setIsConfirmingFree,
    handleSignOut,
    handleRetryPayment,
    handleChangePlanSubmit,
    tokens,
    t,
    language,
    isRtl,
    tenantId,
  };
}
