import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { CreateEditionRequest } from "../../domain/entities/EditionRequests";

export const DEFAULT_CREATE_FORM: CreateEditionRequest = {
  name: "",
  displayNameEn: "",
  displayNameAr: "",
  description: "",
  tagline: "",
  recommendationLabels: "",
  tierLevel: 1,
  allowMonthly: true,
  allowYearly: true,
  allowLifetime: false,
  allowTrial: true,
  trialDurationDays: 14,
  trialIsFree: true,
  trialDiscountPercent: 100,
  gracePeriodDays: 0,
  maxActiveSubscriptions: -1,
  isSelfServiceEnabled: true,
  isContactSalesOnly: false,
};

export function useEditionCreateViewModel() {
  const router = useRouter();
  const { editionRepository } = entitlementsContainer;
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateEditionRequest>(DEFAULT_CREATE_FORM);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (updates: Partial<CreateEditionRequest>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const onPriceChange = (key: string, value: string) =>
    setPrices((prev) => ({ ...prev, [key]: value }));

  const canProceed = () => {
    if (step === 0) return !!(form.name?.trim() && form.displayNameEn?.trim());
    return true;
  };

  const nextStep = () => {
    if (canProceed()) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (step === 0) router.push("/entitlements/editions");
    else setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const createdId = await editionRepository.create(form);
      // TODO: After create, set prices via SetEditionPrice endpoints
      queryClient.invalidateQueries({ queryKey: ["entitlements", "editions"] });
      router.push(`/entitlements/editions/${createdId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create edition.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    form,
    prices,
    isSubmitting,
    error,
    onChange,
    onPriceChange,
    canProceed,
    nextStep,
    prevStep,
    handleSubmit,
  };
}
