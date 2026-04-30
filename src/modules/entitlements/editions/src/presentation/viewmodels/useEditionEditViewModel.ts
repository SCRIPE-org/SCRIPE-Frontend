import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { UpdateEditionRequest } from "../../domain/entities/EditionRequests";

export function useEditionEditViewModel(editionId: string) {
  const router = useRouter();
  const { editionRepository } = entitlementsContainer;
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<UpdateEditionRequest>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing edition data
  const { data: edition, isLoading } = useQuery({
    queryKey: ["entitlements", "editions", "detail", editionId],
    queryFn: () => editionRepository.getById(editionId),
    staleTime: 5 * 60 * 1000,
  });

  // Pre-populate form when edition loads
  useEffect(() => {
    if (!edition) return;
    setForm({
      name: edition.name,
      displayNameEn: edition.displayNameEn,
      displayNameAr: edition.displayNameAr,
      description: edition.description ?? "",
      tagline: edition.tagline ?? "",
      recommendationLabels: edition.recommendationLabels.join(", "),
      overflowPolicy: edition.overflowPolicy,
      tierLevel: edition.tierLevel,
      allowMonthly: edition.allowMonthly,
      allowYearly: edition.allowYearly,
      allowLifetime: edition.allowLifetime,
      allowTrial: edition.allowTrial,
      trialDurationDays: edition.trialDurationDays,
      trialIsFree: edition.trialIsFree,
      trialDiscountPercent: edition.trialDiscountPercent,
      gracePeriodDays: edition.gracePeriodDays,
      maxActiveSubscriptions: edition.maxActiveSubscriptions,
      isSelfServiceEnabled: edition.isSelfServiceEnabled,
      isContactSalesOnly: edition.isContactSalesOnly,
    });
  }, [edition]);

  const onChange = (updates: Partial<UpdateEditionRequest>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const nextStep = () => setStep((s) => s + 1);

  const prevStep = () => {
    if (step === 0) router.push(`/entitlements/editions/${editionId}`);
    else setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await editionRepository.update(editionId, form);
      queryClient.invalidateQueries({ queryKey: ["entitlements", "editions"] });
      router.push(`/entitlements/editions/${editionId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update edition.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    form,
    edition,
    isLoading,
    isSubmitting,
    error,
    onChange,
    nextStep,
    prevStep,
    handleSubmit,
  };
}
