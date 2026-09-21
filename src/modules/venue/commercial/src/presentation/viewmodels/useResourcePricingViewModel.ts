"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { SchedulableResource } from "@modules/venue/schedulable-resource/src/domain/entities/SchedulableResource";
import type { ResourceRentalPriceConfiguration, TaxCategory } from "../../domain/entities/CommercialPricing";

function asUtc(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(`${value.replace(/Z$/, "")}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function asOptionalPositiveInteger(value: string): number | null | "invalid" {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : "invalid";
}

function isNotFound(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (error as Error & { details?: { statusCode?: number } }).details?.statusCode === 404;
}

export interface ResourcePricingViewModelMessages {
  fallbackError: string;
  validation: string;
}

export function useResourcePricingViewModel({ messages }: { messages: ResourcePricingViewModelMessages }) {
  const { schedulableResourceRepository, commercialPricingRepository } = getVenueContainer();
  const [resources, setResources] = useState<SchedulableResource[]>([]);
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [configuration, setConfiguration] = useState<ResourceRentalPriceConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [configurationLoading, setConfigurationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [effectiveFromUtc, setEffectiveFromUtc] = useState(() => new Date().toISOString().slice(0, 16));
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [increment, setIncrement] = useState("");
  const [taxCategoryId, setTaxCategoryId] = useState("");
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxCode, setNewTaxCode] = useState("");
  const [newTaxRate, setNewTaxRate] = useState("");
  const [newTaxInclusive, setNewTaxInclusive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingTax, setCreatingTax] = useState(false);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [page, taxes] = await Promise.all([
        schedulableResourceRepository.getAll({ page: 1, pageSize: 100 }),
        commercialPricingRepository.getTaxCategories(),
      ]);
      const eligible = page.items.filter((resource) => resource.isPublished && !resource.isComposite);
      setResources(eligible);
      setTaxCategories(taxes);
      setSelectedResourceId((current) => current || eligible[0]?.id || "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messages.fallbackError);
    } finally {
      setLoading(false);
    }
  }, [commercialPricingRepository, messages.fallbackError, schedulableResourceRepository]);

  const loadConfiguration = useCallback(async (resourceId: string) => {
    if (!resourceId) return;
    setConfigurationLoading(true);
    setConfiguration(null);
    setError(null);
    setSuccess(false);
    try {
      const value = await commercialPricingRepository.getResourceConfiguration(resourceId);
      setConfiguration(value);
      setDisplayName(value.displayName);
      setCurrencyCode(value.currencyCode);
      setUnitPrice(String(value.unitPrice));
      setEffectiveFromUtc(value.effectiveFromUtc.slice(0, 16));
      setMinDuration(value.minDurationMinutes?.toString() ?? "");
      setMaxDuration(value.maxDurationMinutes?.toString() ?? "");
      setIncrement(value.incrementMinutes?.toString() ?? "");
      setTaxCategoryId(value.taxCategoryId ?? "");
    } catch (caught) {
      if (!isNotFound(caught)) setError(caught instanceof Error ? caught.message : messages.fallbackError);
    } finally {
      setConfigurationLoading(false);
    }
  }, [commercialPricingRepository, messages.fallbackError]);

  useEffect(() => { void loadResources(); }, [loadResources]);
  useEffect(() => { void loadConfiguration(selectedResourceId); }, [loadConfiguration, selectedResourceId]);

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === selectedResourceId),
    [resources, selectedResourceId]
  );
  const resourceOptions = useMemo(
    () => resources.map((resource) => ({ value: resource.id, label: resource.name })),
    [resources]
  );
  const taxCategoryOptions = useMemo(
    () => [{ value: "", label: "—" }, ...taxCategories.map((tax) => ({
      value: tax.id,
      label: `${tax.name} (${tax.ratePercentage * 100}%)`,
    }))],
    [taxCategories]
  );

  const save = useCallback(async () => {
    const price = Number(unitPrice);
    const effective = asUtc(effectiveFromUtc);
    const min = asOptionalPositiveInteger(minDuration);
    const max = asOptionalPositiveInteger(maxDuration);
    const step = asOptionalPositiveInteger(increment);
    if (!selectedResourceId || !displayName.trim() || !/^[A-Z]{3}$/.test(currencyCode)
      || !Number.isFinite(price) || price < 0 || !effective || min === "invalid" || max === "invalid" || step === "invalid"
      || (typeof min === "number" && typeof max === "number" && min > max)) {
      setError(messages.validation);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const value = await commercialPricingRepository.configureResourcePrice({
        schedulableResourceId: selectedResourceId,
        displayName: displayName.trim(),
        currencyCode,
        unitPrice: price,
        effectiveFromUtc: effective,
        minDurationMinutes: min,
        maxDurationMinutes: max,
        incrementMinutes: step,
        taxCategoryId: taxCategoryId || null,
        idempotencyKey: crypto.randomUUID(),
      });
      setConfiguration(value);
      setSuccess(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messages.fallbackError);
    } finally {
      setSaving(false);
    }
  }, [commercialPricingRepository, currencyCode, displayName, effectiveFromUtc, increment, maxDuration, messages, minDuration, selectedResourceId, taxCategoryId, unitPrice]);

  const createTax = useCallback(async () => {
    const rate = Number(newTaxRate);
    const code = newTaxCode.trim().toUpperCase();
    if (!newTaxName.trim() || !code || code.length > 50 || !Number.isFinite(rate) || rate < 0 || rate > 100) {
      setError(messages.validation);
      return false;
    }
    setCreatingTax(true);
    setError(null);
    try {
      const created = await commercialPricingRepository.createTaxCategory({
        name: newTaxName.trim(), code, ratePercentage: rate / 100, isInclusive: newTaxInclusive,
      });
      setTaxCategories((current) => [...current, created].sort((left, right) => left.name.localeCompare(right.name)));
      setTaxCategoryId(created.id);
      setNewTaxName(""); setNewTaxCode(""); setNewTaxRate(""); setNewTaxInclusive(false);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messages.fallbackError);
      return false;
    } finally {
      setCreatingTax(false);
    }
  }, [commercialPricingRepository, messages, newTaxCode, newTaxInclusive, newTaxName, newTaxRate]);

  return {
    resources, resourceOptions, taxCategories, taxCategoryOptions, selectedResource, selectedResourceId, setSelectedResourceId,
    configuration, loading, configurationLoading, error, success,
    displayName, setDisplayName, currencyCode, setCurrencyCode, unitPrice, setUnitPrice,
    effectiveFromUtc, setEffectiveFromUtc, minDuration, setMinDuration, maxDuration, setMaxDuration,
    increment, setIncrement, saving, loadResources, save,
    taxCategoryId, setTaxCategoryId, newTaxName, setNewTaxName, newTaxCode, setNewTaxCode,
    newTaxRate, setNewTaxRate, newTaxInclusive, setNewTaxInclusive, creatingTax, createTax,
  };
}
