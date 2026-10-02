/**
 * useTenantDomainsViewModel — Tenant Domain Management ViewModel
 *
 * Manages domain CRUD operations for a tenant via the DI container.
 * Provides loading, error, and action state for the TenantDomainsTab component.
 *
 * @module tenants/presentation
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import type { TenantDomain } from "../../domain/entities/TenantDomain";

/**
 * Parameters for initializing the useTenantDomainsViewModel hook.
 */
export interface UseTenantDomainsViewModelParams {
  /** Encrypted or unique identifier of the target tenant workspace */
  tenantId: string;
  /** Human-readable display name of the tenant workspace */
  tenantName: string;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { message?: string; error?: string } } }).response;
    return res?.data?.message || res?.data?.error || fallback;
  }
  return fallback;
}

/**
 * React ViewModel hook orchestrating state, network effects, and mutations for tenant domain management.
 * 
 * Interacts exclusively with ITenantRepository via Clean Architecture Dependency Injection container.
 * Encapsulates domain CRUD, live DNS verification, and primary host designation.
 *
 * @param params Initialization parameters containing tenantId and tenantName.
 * @returns State, computed domain groups, platform targets, and mutating action functions.
 */
export function useTenantDomainsViewModel({ tenantId }: UseTenantDomainsViewModelParams) {
  const { t } = useI18n();
  const { tenantRepository } = identityContainer;

  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [cnameTarget, setCnameTarget] = useState("");
  const [verifyPrefix, setVerifyPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdatingRedirect, setIsUpdatingRedirect] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

  const domainsRef = useRef<TenantDomain[]>(domains);
  domainsRef.current = domains;

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

  // ── Auto-Verification Polling (Vercel-Grade UX) ───────────
  // When unverified custom domains exist, silently trigger DNS verification in the background
  const hasUnverifiedCustom = domains.some((d) => d.isCustom && !d.isVerified);

  useEffect(() => {
    if (!hasUnverifiedCustom || isLoading) {
      return;
    }

    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 6; // poll up to ~48 seconds

    // Set state asynchronously to prevent React cascading renders
    const startTimer = setTimeout(() => {
      if (isMounted) setIsAutoVerifying(true);
    }, 0);

    const pollInterval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        if (isMounted) setIsAutoVerifying(false);
        return;
      }

      const pending = domainsRef.current.filter((d) => d.isCustom && !d.isVerified);
      if (pending.length === 0) {
        clearInterval(pollInterval);
        if (isMounted) setIsAutoVerifying(false);
        return;
      }

      try {
        let anyVerified = false;
        for (const d of pending) {
          try {
            const result = await tenantRepository.verifyDomain(tenantId, d.id);
            if (result?.isVerified) {
              anyVerified = true;
            }
          } catch {
            // Non-blocking in background poll
          }
        }

        // Only update & notify if at least one domain was actually verified
        if (anyVerified) {
          const updated = await tenantRepository.getDomains(tenantId);
          if (isMounted) {
            setDomains(updated?.domains || []);
            const stillPending = (updated?.domains || []).filter((d) => d.isCustom && !d.isVerified);
            if (stillPending.length === 0) {
              clearInterval(pollInterval);
              setIsAutoVerifying(false);
              toast.success(t("tenant.domainsAutoVerified"));
            }
          }
        }
      } catch {
        // Silent failure in background polling
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearTimeout(startTimer);
      clearInterval(pollInterval);
      setIsAutoVerifying(false);
    };
  }, [hasUnverifiedCustom, isLoading, tenantId, tenantRepository, t]);

  // ── Actions ────────────────────────────────────────────

  const addDomain = async (
    domain: string,
    redirectTo?: string | null,
    redirectStatusCode?: number | null
  ) => {
    if (!domain.trim()) return;
    setIsAdding(true);
    try {
      await tenantRepository.addDomain(tenantId, domain.trim(), redirectTo, redirectStatusCode);
      toast.success(t("tenant.domainsAddedSuccess"));
      await fetchDomains();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("tenant.domainsAddFailed")));
      throw err;
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Adds multiple domains sequentially (e.g. apex + www auto-pairing recommendation).
   */
  const addDomainBatch = async (
    entries: Array<{
      domain: string;
      redirectTo?: string | null;
      redirectStatusCode?: number | null;
    }>
  ) => {
    if (!entries.length) return;
    setIsAdding(true);
    let successCount = 0;
    try {
      for (const entry of entries) {
        await tenantRepository.addDomain(
          tenantId,
          entry.domain.trim(),
          entry.redirectTo,
          entry.redirectStatusCode
        );
        successCount++;
      }
      toast.success(
        successCount > 1
          ? t("tenant.domainsBatchAddedSuccess", { count: successCount })
          : t("tenant.domainsAddedSuccess")
      );
      await fetchDomains();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("tenant.domainsAddFailed")));
      throw err;
    } finally {
      setIsAdding(false);
    }
  };

  const updateDomainRedirect = async (
    domainId: string,
    redirectTo?: string | null,
    redirectStatusCode?: number | null
  ) => {
    setIsUpdatingRedirect(true);
    try {
      await tenantRepository.updateDomain(tenantId, domainId, redirectTo, redirectStatusCode);
      toast.success(t("tenant.domainsUpdateSuccess"));
      await fetchDomains();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("tenant.domainsUpdateFailed")));
      throw err;
    } finally {
      setIsUpdatingRedirect(false);
    }
  };

  const verifyDomain = async (domainId: string) => {
    setVerifyingId(domainId);
    try {
      const updated = await tenantRepository.verifyDomain(tenantId, domainId);
      if (updated?.isVerified) {
        toast.success(t("tenant.domainsVerifiedSuccess"));
      } else {
        toast.info(t("tenant.domainsDnsNotConfiguredYet"));
      }
      await fetchDomains();
    } catch {
      toast.error(t("tenant.domainsVerifyFailed"));
    } finally {
      setVerifyingId(null);
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
    setRemovingId(domainId);
    try {
      await tenantRepository.removeDomain(tenantId, domainId);
      toast.success(t("tenant.domainsRemoved"));
      await fetchDomains();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("tenant.domainsRemoveFailed")));
    } finally {
      setRemovingId(null);
    }
  };

  // ── Computed ────────────────────────────────────────────

  const autoDomains = domains.filter((d) => d.isAuto);
  const customDomains = domains.filter((d) => d.isCustom);

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
    isUpdatingRedirect,
    isAutoVerifying,
    verifyingId,
    removingId,

    // Actions
    addDomain,
    addDomainBatch,
    updateDomainRedirect,
    verifyDomain,
    setDomainPrimary,
    removeDomain,
    refresh: fetchDomains,
  };
}
