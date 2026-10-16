/**
 * useTenantDomainsViewModel — Tenant Domain Management ViewModel
 *
 * Manages domain CRUD operations for a tenant via the DI container.
 * Provides loading, error, and action state for the TenantDomainsTab component.
 *
 * Designed with referential stability to power Vercel-grade in-place updates.
 *
 * @module tenants/presentation
 */
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdatingRedirect, setIsUpdatingRedirect] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const [verifyingIds, setVerifyingIds] = useState<Record<string, boolean>>({});

  const domainsRef = useRef<TenantDomain[]>(domains);
  useEffect(() => {
    domainsRef.current = domains;
  }, [domains]);

  // ── In-place Single Domain Verification ──────────────────
  const verifySingleDomain = useCallback(
    async (domainId: string, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      setVerifyingIds((prev) => ({ ...prev, [domainId]: true }));

      try {
        const updated = await tenantRepository.verifyDomain(tenantId, domainId);
        const existing = domainsRef.current.find((d) => d.id === domainId);
        const wasVerified = existing?.isVerified ?? false;

        if (updated) {
          // In-place atomic update
          setDomains((prev) => prev.map((d) => (d.id === domainId ? updated : d)));
        }

        if (!silent) {
          if (updated?.isVerified) {
            toast.success(t("tenant.domainsVerifiedSuccess"));
          } else if (wasVerified && !updated?.isVerified) {
            toast.warning(
              t("tenant.domainsDnsRevertedInvalid") ||
                "DNS records are no longer detected. Domain status set to invalid configuration."
            );
          } else {
            toast.info(t("tenant.domainsDnsNotConfiguredYet"));
          }
        } else {
          // Background mode: only notify on state transition
          if (wasVerified && !updated?.isVerified) {
            toast.warning(
              t("tenant.domainsDnsRevertedInvalid") ||
                "DNS records are no longer detected. Domain status set to invalid configuration."
            );
          } else if (!wasVerified && updated?.isVerified) {
            toast.success(t("tenant.domainsVerifiedSuccess"));
          }
        }

        return updated;
      } catch {
        if (!silent) {
          toast.error(t("tenant.domainsVerifyFailed"));
        }
        return null;
      } finally {
        setVerifyingIds((prev) => {
          if (!prev[domainId]) return prev;
          const next = { ...prev };
          delete next[domainId];
          return next;
        });
      }
    },
    [tenantId, tenantRepository, t]
  );

  // ── In-place Domain Cache Synchronization ────────────────
  const updateDomainInPlace = useCallback((updated: TenantDomain) => {
    setDomains((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }, []);

  // ── Fetch Domains (silent by default to prevent skeletons after initial mount) ──
  const fetchDomains = useCallback(
    async (_isSilent = true) => {
      try {
        const response = await tenantRepository.getDomains(tenantId);
        setDomains(response?.domains || []);
        if (response?.cnameTarget) setCnameTarget(response.cnameTarget);
        if (response?.verificationPrefix) setVerifyPrefix(response.verificationPrefix);
        setError(null);
      } catch {
        setError(t("tenant.domainsLoadFailed"));
      } finally {
        setIsInitialLoading(false);
      }
    },
    [tenantId, tenantRepository, t]
  );

  // Initial load
  useEffect(() => {
    queueMicrotask(() => {
      void fetchDomains(false);
    });
  }, [fetchDomains]);

  // Initial mount: verify live DNS for all custom domains automatically
  const hasInitialVerifiedRef = useRef(false);
  useEffect(() => {
    if (isInitialLoading) return;
    if (hasInitialVerifiedRef.current) return;
    hasInitialVerifiedRef.current = true;

    const customDomainsList = domainsRef.current.filter((d) => d.isCustom);
    if (customDomainsList.length === 0) return;

    for (const d of customDomainsList) {
      verifySingleDomain(d.id, { silent: true });
    }
  }, [isInitialLoading, verifySingleDomain]);

  // Window Focus Live Revalidation (Vercel standard)
  const lastFocusTimeRef = useRef<number>(0);
  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusTimeRef.current < 8000) return;
      lastFocusTimeRef.current = now;

      // Only re-verify pending domains on window focus to avoid hammering verified domains
      const pendingList = domainsRef.current.filter((d) => d.isCustom && !d.isVerified);
      if (pendingList.length === 0) return;

      for (const d of pendingList) {
        verifySingleDomain(d.id, { silent: true });
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [verifySingleDomain]);

  // ── Auto-Verification Polling for Pending Domains ────────
  // Only trigger when pending status changes, preventing timer resets on every tick
  const hasPendingDomains = useMemo(
    () => domains.some((d) => d.isCustom && !d.isVerified),
    [domains]
  );

  useEffect(() => {
    if (!hasPendingDomains || isInitialLoading) {
      queueMicrotask(() => {
        setIsAutoVerifying(false);
      });
      return;
    }

    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 15;

    queueMicrotask(() => {
      setIsAutoVerifying(true);
    });

    const pollInterval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        if (isMounted) setIsAutoVerifying(false);
        return;
      }

      const currentPending = domainsRef.current.filter((d) => d.isCustom && !d.isVerified);
      if (currentPending.length === 0) {
        clearInterval(pollInterval);
        if (isMounted) setIsAutoVerifying(false);
        return;
      }

      for (const d of currentPending) {
        await verifySingleDomain(d.id, { silent: true });
      }

      const stillPending = domainsRef.current.filter((d) => d.isCustom && !d.isVerified);
      if (stillPending.length === 0) {
        clearInterval(pollInterval);
        if (isMounted) {
          setIsAutoVerifying(false);
          toast.success(t("tenant.domainsAutoVerified"));
        }
      }
    }, 7000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      setIsAutoVerifying(false);
    };
  }, [hasPendingDomains, isInitialLoading, verifySingleDomain, t]);

  // ── Periodic Health Check for Verified Domains (every 45s) ──
  useEffect(() => {
    if (isInitialLoading) return;

    const healthInterval = setInterval(() => {
      const verifiedCustom = domainsRef.current.filter((d) => d.isCustom && d.isVerified);
      if (verifiedCustom.length === 0) return;

      for (const d of verifiedCustom) {
        verifySingleDomain(d.id, { silent: true });
      }
    }, 45000);

    return () => clearInterval(healthInterval);
  }, [isInitialLoading, verifySingleDomain]);

  // ── Actions ────────────────────────────────────────────

  const addDomain = useCallback(
    async (domain: string, redirectTo?: string | null, redirectStatusCode?: number | null) => {
      if (!domain.trim()) return;
      setIsAdding(true);
      try {
        await tenantRepository.addDomain(tenantId, domain.trim(), redirectTo, redirectStatusCode);
        toast.success(t("tenant.domainsAddedSuccess"));
        await fetchDomains(true);
        const added = domainsRef.current.find(
          (d) => d.domain.toLowerCase() === domain.trim().toLowerCase()
        );
        if (added) {
          verifySingleDomain(added.id, { silent: true });
        }
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, t("tenant.domainsAddFailed")));
        throw err;
      } finally {
        setIsAdding(false);
      }
    },
    [tenantId, tenantRepository, fetchDomains, verifySingleDomain, t]
  );

  /**
   * Adds multiple domains sequentially (e.g. apex + www auto-pairing recommendation).
   */
  const addDomainBatch = useCallback(
    async (
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
        await fetchDomains(true);
        const customList = domainsRef.current.filter((d) =>
          entries.some((e) => e.domain.toLowerCase() === d.domain.toLowerCase())
        );
        for (const d of customList) {
          verifySingleDomain(d.id, { silent: true });
        }
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, t("tenant.domainsAddFailed")));
        throw err;
      } finally {
        setIsAdding(false);
      }
    },
    [tenantId, tenantRepository, fetchDomains, verifySingleDomain, t]
  );

  const updateDomainRedirect = useCallback(
    async (domainId: string, redirectTo?: string | null, redirectStatusCode?: number | null) => {
      setIsUpdatingRedirect(true);
      try {
        await tenantRepository.updateDomain(tenantId, domainId, redirectTo, redirectStatusCode);
        toast.success(t("tenant.domainsUpdateSuccess"));
        await fetchDomains(true);
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, t("tenant.domainsUpdateFailed")));
        throw err;
      } finally {
        setIsUpdatingRedirect(false);
      }
    },
    [tenantId, tenantRepository, fetchDomains, t]
  );

  const verifyDomain = useCallback(
    async (domainId: string) => {
      return verifySingleDomain(domainId, { silent: false });
    },
    [verifySingleDomain]
  );

  const setDomainPrimary = useCallback(
    async (domainId: string) => {
      try {
        await tenantRepository.setDomainPrimary(tenantId, domainId);
        toast.success(t("tenant.domainsPrimaryUpdated"));
        await fetchDomains(true);
      } catch {
        toast.error(t("tenant.domainsPrimaryFailed"));
      }
    },
    [tenantId, tenantRepository, fetchDomains, t]
  );

  const removeDomain = useCallback(
    async (domainId: string) => {
      setRemovingId(domainId);
      try {
        setDomains((prev) => prev.filter((d) => d.id !== domainId));
        await tenantRepository.removeDomain(tenantId, domainId);
        toast.success(t("tenant.domainsRemoved"));
        await fetchDomains(true);
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, t("tenant.domainsRemoveFailed")));
        await fetchDomains(true);
      } finally {
        setRemovingId(null);
      }
    },
    [tenantId, tenantRepository, fetchDomains, t]
  );

  const refresh = useCallback(() => fetchDomains(true), [fetchDomains]);

  // ── Computed ────────────────────────────────────────────

  const autoDomains = useMemo(() => domains.filter((d) => d.isAuto), [domains]);
  const customDomains = useMemo(() => domains.filter((d) => d.isCustom), [domains]);
  const isLoading = isInitialLoading && domains.length === 0;

  const isDomainVerifying = useCallback(
    (domainId: string) => Boolean(verifyingIds[domainId]),
    [verifyingIds]
  );
  const verifyingId = useMemo(
    () => Object.keys(verifyingIds).find((k) => verifyingIds[k]) || null,
    [verifyingIds]
  );

  return {
    // State
    domains,
    autoDomains,
    customDomains,
    cnameTarget,
    verifyPrefix,
    isLoading,
    isInitialLoading,
    error,
    isAdding,
    isUpdatingRedirect,
    isAutoVerifying,
    verifyingId,
    verifyingIds,
    removingId,

    // Actions & Helpers
    isDomainVerifying,
    addDomain,
    addDomainBatch,
    updateDomainRedirect,
    verifyDomain,
    updateDomainInPlace,
    setDomainPrimary,
    removeDomain,
    refresh,
  };
}
