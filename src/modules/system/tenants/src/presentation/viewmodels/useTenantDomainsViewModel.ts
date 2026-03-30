/**
 * useTenantDomainsViewModel — Tenant Domain Management ViewModel
 *
 * Manages domain CRUD operations for a tenant via the DI container.
 * Provides loading, error, and action state for the TenantDomainsTab component.
 *
 * @module tenants/presentation
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { systemContainer } from "@modules/system/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "sonner";
import type { TenantDomainJson } from "../../domain/interfaces/ITenantService";

export interface UseTenantDomainsViewModelParams {
  tenantId: string;
  tenantName: string;
}

export function useTenantDomainsViewModel({ tenantId }: UseTenantDomainsViewModelParams) {
  const { t } = useI18n();
  const { tenantRepository } = systemContainer;

  const [domains, setDomains] = useState<TenantDomainJson[]>([]);
  const [cnameTarget, setCnameTarget] = useState("");
  const [verifyPrefix, setVerifyPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // ── Fetch Domains ──────────────────────────────────────

  const fetchDomains = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantRepository.getDomains(tenantId);
      setDomains(response?.domains || []);
      if (response?.cnameTarget) setCnameTarget(response.cnameTarget);
      if (response?.verificationPrefix) setVerifyPrefix(response.verificationPrefix);
      setError(null);
    } catch {
      setError(t("tenant.domainsLoadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, tenantRepository, t]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // ── Actions ────────────────────────────────────────────

  const addDomain = async (domain: string) => {
    if (!domain.trim()) return;
    setIsAdding(true);
    try {
      await tenantRepository.addDomain(tenantId, domain.trim());
      toast.success(t("tenant.domainsAddedSuccess"));
      await fetchDomains();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || t("tenant.domainsAddFailed"));
      throw err; // Re-throw so component can handle UI state
    } finally {
      setIsAdding(false);
    }
  };

  const verifyDomain = async (domainId: string) => {
    try {
      await tenantRepository.verifyDomain(tenantId, domainId);
      toast.success(t("tenant.domainsVerifiedSuccess"));
      await fetchDomains();
    } catch {
      toast.error(t("tenant.domainsVerifyFailed"));
    }
  };

  const setDomainPrimary = async (domainId: string) => {
    try {
      await tenantRepository.setDomainPrimary(tenantId, domainId);
      toast.success(t("tenant.domainsPrimaryUpdated"));
      await fetchDomains();
    } catch {
      toast.error(t("tenant.domainsPrimaryFailed"));
    }
  };

  const removeDomain = async (domainId: string) => {
    try {
      await tenantRepository.removeDomain(tenantId, domainId);
      toast.success(t("tenant.domainsRemoved"));
      await fetchDomains();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || t("tenant.domainsRemoveFailed"));
    }
  };

  // ── Computed ────────────────────────────────────────────

  const autoDomains = domains.filter((d) => d.type === "auto");
  const customDomains = domains.filter((d) => d.type === "custom");

  return {
    // State
    domains,
    autoDomains,
    customDomains,
    cnameTarget,
    verifyPrefix,
    isLoading,
    error,
    isAdding,

    // Actions
    addDomain,
    verifyDomain,
    setDomainPrimary,
    removeDomain,
    refresh: fetchDomains,
  };
}
