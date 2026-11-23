/* eslint-disable react-hooks/exhaustive-deps */
"use client";

/**
 * useAdminSettingsSync — Production-grade server-first admin preferences
 *
 * ARCHITECTURE NOTE: This is a core infrastructure hook, not a module ViewModel.
 * Direct getModuleApiService usage is accepted for cross-cutting core concerns
 * (same pattern as TenantBrandingProvider, NotificationProvider, SignalRProvider).
 * See: frontend-architecture.md — exception for core/providers/ layer.
 *
 * Returns `isSettingsReady` boolean that gates the main UI rendering.
 *
 * FOUC strategy: OPTIMISTIC RENDER + SILENT RECONCILE
 *   - If localStorage has cached settings from a previous session → render immediately
 *   - If localStorage is completely empty (first-ever device) → show shimmer until fetch completes
 *   - In the background, fetch AdminSettingsJson from server → reconcile silently
 *
 * Edge Cases Handled:
 *   1. FOUC Prevention (optimistic render)
 *   2. Tab Close Data Loss (keepalive fetch)
 *   3. 409 Concurrency Conflict (field-level last-write-wins)
 *   4. Payload Size Bomb (8KB client-side guard)
 *   5. JWT Expired Before beforeunload (deferred flush pattern)
 *
 * @module core/providers
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { useAppStore } from "@core/store/useAppStore";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { TENANTS_ENDPOINTS } from "@core/config/api-endpoints";
import { getActiveTenantContextId, getModuleApiService } from "@core/services/api-factory";
import { buildRequestSecurityHeaders } from "@core/services/api.service";
import { secureTokenService } from "@core/common/secure-token-service";
import { appLogger } from "@core/common/logger";

// ── Constants ──
const DEBOUNCE_MS = 2000;
const MAX_PAYLOAD_BYTES = 8000; // 8KB soft limit (column is 10KB)
const SAVE_ENDPOINT = TENANTS_ENDPOINTS.TENANTS.ADMIN_PREFERENCES;

/**
 * Resolve the identity API base URL cleanly for keepalive beforeunload beacons,
 * mirroring api-factory.ts (`NEXT_PUBLIC_IDENTITY_API_URL` -> `NEXT_PUBLIC_API_URL` -> `/api`)
 * and refusing stringified `"undefined"` / `"null"` URLs.
 */
function resolveAdminSettingsSaveUrl(): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_IDENTITY_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    "/api",
  ];
  const rawBase = candidates
    .map((candidate) => candidate?.trim() ?? "")
    .find((candidate) => {
      if (!candidate) return false;
      const normalized = candidate.toLowerCase();
      return normalized !== "undefined" && normalized !== "null";
    });
  if (!rawBase) return null;

  const base = rawBase.replace(/\/+$/, "");
  const endpoint = SAVE_ENDPOINT.startsWith("/") ? SAVE_ENDPOINT : `/${SAVE_ENDPOINT}`;
  const resolved = `${base}${endpoint}`;
  if (
    resolved.includes("/undefined/") ||
    resolved.startsWith("undefined") ||
    resolved.includes("/null/") ||
    resolved.startsWith("null")
  ) {
    return null;
  }
  return resolved;
}

// ── Types ──
interface AdminSettingsPayload {
  adminSettingsJson: string;
}

/**
 * Hook that manages the full admin settings lifecycle with 5 critical edge case protections.
 *
 * Must be mounted in the authenticated layout (above SettingsProvider consumption points).
 */
export function useAdminSettingsSync() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  // MustChangePasswordMiddleware 403s every backend route except a tiny whitelist —
  // syncing preferences while mcp=true is a guaranteed rejection (confirmed live).
  // The admin is about to be logged out and redirected anyway once they change it.
  const mustChangePassword = useAppStore((s) => s.mustChangePassword);
  const requireMfaEnrollment = useAppStore((s) => s.requireMfaEnrollment);

  const [hasToken, setHasToken] = useState(() => secureTokenService.hasToken());

  useEffect(() => {
    const unsubscribe = secureTokenService.subscribe(() => {
      setHasToken(secureTokenService.hasToken());
    });
    return unsubscribe;
  }, []);

  // ── Smart initial state: CACHE-AWARE ──
  // If localStorage has cached settings from a previous session → render immediately
  // with those cached values (optimistic render, zero shimmer for returning users).
  // If localStorage is empty (fresh login, first device, or post-logout) → gate
  // rendering with isSettingsReady=false + isTransitioning=true so DashboardLayout
  // shows a loading shimmer UNTIL the server data (settings + branding + routes) arrives.
  // This eliminates the visible flash: defaults-layout → actual-layout.
  const [hasInitialCache] = useState(() => {
    if (typeof window === "undefined") return true; // SSR: assume ready
    return !!localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
  });
  const [isSettingsReady, setIsSettingsReady] = useState(hasInitialCache);
  // isTransitioning=true blocks DashboardLayout from rendering content.
  // For fresh login: start true so the shimmer shows from the very first frame.
  // For returning users with cache: start false (no shimmer unless server reconciles
  // a different layoutTemplate later).
  const [isTransitioning, setIsTransitioning] = useState(!hasInitialCache);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPendingChanges = useRef(false);
  const latestPayload = useRef<string | null>(null);
  const changedFieldsSinceLastSync = useRef<Set<string>>(new Set());

  // ── Load admin settings from server (with deferred flush check) ──
  const loadAdminSettings = useCallback(async () => {
    if (!isAuthenticated || !hasToken || mustChangePassword || requireMfaEnrollment) return;

    // Pre-flight: if there are NO cached settings (first login or post-logout),
    // show the transition shimmer BEFORE the API call starts. This prevents the
    // visible flash of default layout → actual layout during the ~1-2s fetch.
    const hasCache = !!localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
    if (!hasCache) {
      setIsTransitioning(true);
    }

    try {
      const api = getModuleApiService("IDENTITY");

      // Edge Case 5: Check for deferred flush from a previous session
      const pendingFlush = localStorage.getItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH);
      if (pendingFlush) {
        try {
          await api.put<void>(SAVE_ENDPOINT, {
            adminSettingsJson: pendingFlush,
          });
          appLogger.info("Deferred settings flush successful — cleared PENDING_SETTINGS_FLUSH");
        } catch (flushErr) {
          appLogger.warn("Deferred flush failed, will retry next login", flushErr);
        } finally {
          // Always clear, even on failure — prevents infinite retry loops
          localStorage.removeItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH);
        }
      }

      // Fetch latest settings from server
      const response = await api.get<{ adminSettingsJson: string | null }>(SAVE_ENDPOINT);

      if (response?.adminSettingsJson) {
        const serverSettings = response.adminSettingsJson;

        const cachedSettings = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);

        // Silent reconcile: only update if server differs from cache.
        // Nexus is the sole statically imported shell, so no multi-layout chunk
        // download or blocking transition timer is needed on reconcile.
        if (serverSettings !== cachedSettings) {
          localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, serverSettings);
          // Notify SettingsProvider to re-merge layers
          window.dispatchEvent(new Event("admin-settings-loaded"));
          appLogger.info("Admin settings reconciled from server (silent update)");
        }
      }
    } catch (err) {
      // Non-fatal: cached settings (if any) are already rendered
      appLogger.warn("Failed to fetch admin settings from server", err);
    } finally {
      setIsSettingsReady(true);
      if (!hasCache) {
        if (typeof requestAnimationFrame === "function") {
          requestAnimationFrame(() => setIsTransitioning(false));
        } else {
          setIsTransitioning(false);
        }
      } else {
        setIsTransitioning(false);
      }
    }
  }, [isAuthenticated, mustChangePassword, requireMfaEnrollment]);

  // ── Save settings to server (debounced) ──
  const saveToServer = useCallback(
    async (payload: string) => {
      if (!isAuthenticated || mustChangePassword || requireMfaEnrollment) return;

      // Edge Case 4: Payload size guard
      const payloadSize = new Blob([payload]).size;
      if (payloadSize > MAX_PAYLOAD_BYTES) {
        window.dispatchEvent(
          new CustomEvent("admin-settings-size-error", {
            detail: {
              message: `Settings payload too large (${Math.round(payloadSize / 1024)}KB / ${MAX_PAYLOAD_BYTES / 1000}KB limit). Some settings may not be saved.`,
            },
          })
        );
        appLogger.error(
          `Admin settings payload exceeds ${MAX_PAYLOAD_BYTES}B limit: ${payloadSize}B`
        );
        return;
      }

      try {
        const api = getModuleApiService("IDENTITY");
        await api.put<void>(SAVE_ENDPOINT, {
          adminSettingsJson: payload,
        } satisfies AdminSettingsPayload);

        // Success — clear the changed fields tracker
        changedFieldsSinceLastSync.current.clear();
        hasPendingChanges.current = false;
        appLogger.info("Admin settings synced to server");
      } catch (err: unknown) {
        // Edge Case 3: 409 Concurrency Conflict — field-level last-write-wins merge
        if (
          err &&
          typeof err === "object" &&
          "status" in err &&
          (err as { status: number }).status === 409
        ) {
          try {
            const api = getModuleApiService("IDENTITY");
            const serverResponse = await api.get<{
              adminSettingsJson: string | null;
            }>(SAVE_ENDPOINT);

            if (serverResponse?.adminSettingsJson) {
              const serverData = JSON.parse(serverResponse.adminSettingsJson);
              const localData = JSON.parse(payload);
              const merged = { ...serverData };
              const overriddenFields: string[] = [];

              // Local fields that changed since last sync WIN over server
              for (const field of changedFieldsSinceLastSync.current) {
                if (field in localData) {
                  // If the field is dashboardLayouts, do a deep key-level merge
                  // so layouts for different pages do not clobber one another across tabs
                  if (
                    field === "dashboardLayouts" &&
                    typeof localData[field] === "object" &&
                    localData[field] !== null &&
                    typeof serverData[field] === "object" &&
                    serverData[field] !== null
                  ) {
                    merged[field] = {
                      ...serverData[field],
                      ...localData[field],
                    };
                  } else {
                    merged[field] = localData[field];
                  }

                  if (JSON.stringify(serverData[field]) !== JSON.stringify(merged[field])) {
                    overriddenFields.push(field);
                  }
                }
              }

              // Save the merged result immediately (no debounce)
              const mergedPayload = JSON.stringify(merged);
              localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, mergedPayload);
              window.dispatchEvent(new Event("admin-settings-loaded"));

              await api.put<void>(SAVE_ENDPOINT, {
                adminSettingsJson: mergedPayload,
              });

              changedFieldsSinceLastSync.current.clear();
              hasPendingChanges.current = false;

              // Notify user about the conflict resolution
              if (overriddenFields.length > 0) {
                window.dispatchEvent(
                  new CustomEvent("admin-settings-conflict", {
                    detail: {
                      message: `Updated from another session: ${overriddenFields.join(", ")}`,
                      fields: overriddenFields,
                    },
                  })
                );
              }

              appLogger.info("409 resolved with field-level merge", overriddenFields);
            }
          } catch (mergeErr) {
            appLogger.error("Failed to resolve 409 conflict — local changes may be lost", mergeErr);
          }
        } else {
          appLogger.error("Failed to sync admin settings to server", err);
        }
      }
    },
    [isAuthenticated, mustChangePassword, requireMfaEnrollment]
  );

  // ── Listen for SettingsProvider changes ──
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleSettingsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ changedField: string | null }>;
      const changedField = customEvent.detail?.changedField;

      // Track which field changed (for 409 field-level merge)
      if (changedField) {
        changedFieldsSinceLastSync.current.add(changedField);
      }

      // Read the latest settings from localStorage (written by SettingsProvider)
      const currentSettings = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
      if (!currentSettings) return;

      latestPayload.current = currentSettings;
      hasPendingChanges.current = true;

      // Debounce the server save
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        if (latestPayload.current) {
          saveToServer(latestPayload.current);
        }
      }, DEBOUNCE_MS);
    };

    window.addEventListener("settings-changed", handleSettingsChanged);
    return () => {
      window.removeEventListener("settings-changed", handleSettingsChanged);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [isAuthenticated, saveToServer]);

  // ── Initial load on authentication & token availability ──
  useEffect(() => {
    if (isAuthenticated && hasToken) {
      queueMicrotask(() => {
        loadAdminSettings();
      });
    }
  }, [isAuthenticated, hasToken, loadAdminSettings]);

  // ── Edge Case 2 & 5: beforeunload flush ──
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleBeforeUnload = () => {
      if (!hasPendingChanges.current || !latestPayload.current) return;

      // Cancel the pending debounce timer
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      const payloadBody = JSON.stringify({
        adminSettingsJson: latestPayload.current,
      } satisfies AdminSettingsPayload);
      const url = resolveAdminSettingsSaveUrl();
      if (!url) {
        try {
          localStorage.setItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH, latestPayload.current);
        } catch {
          // Non-fatal: storage quota or private mode
        }
        return;
      }

      // Check if we still have a valid JWT
      const token = secureTokenService.getAccessToken();

      if (token) {
        // JWT exists — use fetch with keepalive + replay-protection/CSRF/tenant headers
        // (keepalive: true allows request to outlive the page AND supports custom headers)
        try {
          fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              ...buildRequestSecurityHeaders({
                tenantContextId: getActiveTenantContextId(),
                isMutating: true,
              }),
            },
            credentials: "include",
            body: payloadBody,
            keepalive: true,
          });
        } catch {
          // fetch with keepalive failed — fall through to deferred flush
          localStorage.setItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH, latestPayload.current);
        }
      } else {
        // JWT is missing/expired — store payload for deferred flush on next login.
        // The loadAdminSettings() effect checks for this key before fetching.
        localStorage.setItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH, latestPayload.current);
        appLogger.warn(
          "beforeunload: JWT expired — payload stored for deferred flush on next login"
        );
      }

      hasPendingChanges.current = false;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAuthenticated]);

  return { isSettingsReady, isTransitioning };
}
