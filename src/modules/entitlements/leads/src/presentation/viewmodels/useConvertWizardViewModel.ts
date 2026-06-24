"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type {
  ConvertLeadParams,
  EditionForConversion,
  EditionFeatureGroup,
  FeatureOverride,
} from "../../domain/interfaces/ILeadsRepository";
import type { PlatformLead } from "../../domain/entities/PlatformLead";

// ── Types ─────────────────────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4;

export interface Step2State {
  tenantCode: string;
  adminEmail: string;
  subscriptionType: string;
  currency: string;
  useCustomPrice: boolean;
  negotiatedAmount: string;
  negotiatedCurrency: string;
  conversionNote: string;
}

const STEP2_DEFAULTS: Step2State = {
  tenantCode: "",
  adminEmail: "",
  subscriptionType: "",
  currency: "USD",
  useCustomPrice: false,
  negotiatedAmount: "",
  negotiatedCurrency: "USD",
  conversionNote: "",
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useConvertWizardViewModel(
  open: boolean,
  lead: PlatformLead | null,
  onConvert: (params: ConvertLeadParams) => Promise<void>,
  onClose: () => void,
  isConverting: boolean
) {
  const { leadsRepository } = entitlementsContainer;

  // ── Step navigation ────────────────────────────────────────────────────────
  const [step, setStep] = useState<WizardStep>(1);

  // ── Step 1 state ───────────────────────────────────────────────────────────
  const [selectedEditionOverride, setSelectedEditionOverride] =
    useState<EditionForConversion | null>(null);

  // ── Step 2 state ───────────────────────────────────────────────────────────
  const [s2, setS2] = useState<Step2State>(STEP2_DEFAULTS);
  const [amountError, setAmountError] = useState("");

  // ── Step 3 state ───────────────────────────────────────────────────────────
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // ── Queries ────────────────────────────────────────────────────────────────
  const editionsQuery = useQuery({
    queryKey: ["conversion-editions"],
    queryFn: () => leadsRepository.getEditionsForConversion(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // Auto-select requested edition from lead
  const selectedEdition = useMemo(() => {
    if (selectedEditionOverride) return selectedEditionOverride;
    if (lead && editionsQuery.data) {
      return (
        editionsQuery.data.find((e) => e.name.toLowerCase() === lead.editionKey?.toLowerCase()) ??
        null
      );
    }
    return null;
  }, [selectedEditionOverride, lead, editionsQuery.data]);

  const featuresQuery = useQuery({
    queryKey: ["conversion-edition-features", selectedEdition?.id],
    queryFn: () => leadsRepository.getEditionFeaturesForConversion(selectedEdition!.id),
    enabled: !!selectedEdition && step >= 3,
    staleTime: 5 * 60 * 1000,
  });

  const featureGroups: EditionFeatureGroup[] = featuresQuery.data ?? [];

  // ── Override count ─────────────────────────────────────────────────────────
  const overrideCount = useMemo(() => {
    if (!featureGroups.length) return 0;
    return Object.keys(overrides).filter((fid) => {
      const feature = featureGroups.flatMap((g) => g.features).find((f) => f.featureId === fid);
      return feature && overrides[fid] !== feature.editionValue;
    }).length;
  }, [overrides, featureGroups]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const validateAmount = useCallback((val: string): boolean => {
    if (!val.trim()) {
      setAmountError("Amount is required.");
      return false;
    }
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) {
      setAmountError("Enter a valid positive amount.");
      return false;
    }
    setAmountError("");
    return true;
  }, []);

  const initOverrides = useCallback((groups: EditionFeatureGroup[]) => {
    const initial: Record<string, string> = {};
    groups.forEach((g) =>
      g.features.forEach((f) => {
        initial[f.featureId] = f.editionValue;
      })
    );
    setOverrides(initial);
    setExpandedCategories(new Set(groups.map((g) => g.category)));
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }, []);

  const resetWizard = useCallback(() => {
    setStep(1);
    setSelectedEditionOverride(null);
    setS2(STEP2_DEFAULTS);
    setAmountError("");
    setOverrides({});
    setExpandedCategories(new Set());
  }, []);

  const handleClose = useCallback(() => {
    if (isConverting) return;
    resetWizard();
    onClose();
  }, [isConverting, resetWizard, onClose]);

  const handleNext = useCallback(async () => {
    if (step === 1) {
      if (!selectedEdition) return;
      setStep(2);
      if (selectedEdition.isContactSalesOnly) {
        setS2((prev) => ({ ...prev, useCustomPrice: true }));
      }
    } else if (step === 2) {
      if (s2.useCustomPrice && !validateAmount(s2.negotiatedAmount)) return;
      setStep(3);
      if (featuresQuery.data) initOverrides(featuresQuery.data);
    } else if (step === 3) {
      setStep(4);
    }
  }, [step, selectedEdition, s2, validateAmount, featuresQuery.data, initOverrides]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((prev) => (prev - 1) as WizardStep);
  }, [step]);

  const handleSubmit = useCallback(async () => {
    const featureOverrides: FeatureOverride[] = Object.entries(overrides)
      .filter(([fid, val]) => {
        const feature = featureGroups.flatMap((g) => g.features).find((f) => f.featureId === fid);
        return feature && val !== feature.editionValue;
      })
      .map(([featureId, value]) => ({ featureId, value }));

    const negotiatedAmount =
      s2.useCustomPrice && s2.negotiatedAmount.trim() ? parseFloat(s2.negotiatedAmount) : undefined;

    await onConvert({
      editionId: selectedEdition?.id,
      tenantCode: s2.tenantCode.trim() || undefined,
      adminEmail: s2.adminEmail.trim() || undefined,
      subscriptionType: s2.subscriptionType || undefined,
      currency: s2.currency || undefined,
      conversionNote: s2.conversionNote.trim() || undefined,
      negotiatedAmount,
      negotiatedCurrency: s2.useCustomPrice ? s2.negotiatedCurrency : undefined,
      featureOverrides: featureOverrides.length > 0 ? featureOverrides : undefined,
    });
  }, [overrides, featureGroups, s2, selectedEdition, onConvert]);

  const handleOverrideChange = useCallback((featureId: string, value: string) => {
    setOverrides((p) => ({ ...p, [featureId]: value }));
  }, []);

  const handleAmountChange = useCallback(
    (val: string) => {
      setS2((p) => ({ ...p, negotiatedAmount: val }));
      if (amountError) validateAmount(val);
    },
    [amountError, validateAmount]
  );

  return {
    step,
    selectedEdition,
    setSelectedEdition: setSelectedEditionOverride,
    s2,
    setS2,
    amountError,
    overrides,
    expandedCategories,
    featureGroups,
    overrideCount,
    isLoadingEditions: editionsQuery.isLoading,
    editions: editionsQuery.data,
    isLoadingFeatures: featuresQuery.isLoading,
    handleClose,
    handleNext,
    handleBack,
    handleSubmit,
    toggleCategory,
    handleOverrideChange,
    handleAmountChange,
  };
}
