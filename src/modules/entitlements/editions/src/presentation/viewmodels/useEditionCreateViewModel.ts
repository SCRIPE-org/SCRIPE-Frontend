import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { CreateEditionRequest } from "../../domain/entities/EditionRequests";

/**
 * Constant definition representing d e f a u l t_ c r e a t e_ f o r m.
 */
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
  overflowPolicy: "Block",
  isSelfServiceEnabled: true,
  isContactSalesOnly: false,
};

/**
 * React hook/ViewModel managing logic, state, and repository queries for edition create view model.
 */
export function useEditionCreateViewModel() {
  const router = useRouter();
  const { editionRepository } = entitlementsContainer;
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateEditionRequest>(DEFAULT_CREATE_FORM);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all editions for the fallback picker
  const { data: editionsPage } = useQuery({
    queryKey: ["entitlements", "editions", "all-for-fallback"],
    queryFn: () => editionRepository.getAll({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
  });
  const availableEditions = (editionsPage?.items ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    displayNameEn: e.displayNameEn,
  }));

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

      // Save pricing after create — wizard collects prices keyed as "CURRENCY_Cycle" (e.g. "USD_Monthly")
      const priceEntries = Object.entries(prices).filter(([, v]) => v !== "" && !isNaN(Number(v)));
      if (priceEntries.length > 0) {
        const priceItems = priceEntries.map(([key, amount]) => {
          const [currency, billingCycle] = key.split("_");
          return { currency, billingCycle, amount: parseFloat(amount) };
        });
        await editionRepository.setEditionPrices(createdId, { prices: priceItems });
      }

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
    availableEditions,
    onChange,
    onPriceChange,
    canProceed,
    nextStep,
    prevStep,
    handleSubmit,
  };
}
