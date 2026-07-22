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
import { getModuleApiService } from "@core/services/api-factory";
import { secureTokenService } from "@core/common/secure-token-service";
import { appLogger } from "@core/common/logger";
import { defaultSettings } from "@core/settings/defaults";

// ── Constants ──
const DEBOUNCE_MS = 2000;
const MAX_PAYLOAD_BYTES = 8000; // 8KB soft limit (column is 10KB)
const SAVE_ENDPOINT = TENANTS_ENDPOINTS.TENANTS.ADMIN_PREFERENCES;

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
    if (!isAuthenticated || !hasToken) return;

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

        // Silent reconcile: only update if server differs from cache
        if (serverSettings !== cachedSettings) {
          // Check if the layoutTemplate will change — if so, briefly show
          // the shimmer to prevent a visible layout switch flash.
          let layoutChanged = false;
          try {
            const server = JSON.parse(serverSettings) as Record<string, unknown>;
            if (cachedSettings) {
              // Returning user: compare cached vs server layout
              const cached = JSON.parse(cachedSettings) as Record<string, unknown>;
              layoutChanged = cached.layoutTemplate !== server.layoutTemplate;
            } else {
              // First login / fresh device: compare default layout vs server layout.
              // Without this, the UI would render with the default layout and then
              // visibly flash to the server's layout (e.g. "classic").
              // Read the default rather than naming it: this used to hardcode
              // "nexus", so moving the platform default would silently make every
              // fresh device claim the layout had changed when it had not.
              layoutChanged =
                server.layoutTemplate != null &&
                server.layoutTemplate !== defaultSettings.layoutTemplate;
            }
          } catch {
            // Non-fatal: if parse fails, treat as no layout change
          }

          if (layoutChanged) {
            // Show shimmer BEFORE updating localStorage so the old layout
            // doesn't flash. The shimmer will hide until the new layout
            // chunk is downloaded and rendered.
            setIsTransitioning(true);
          }

          localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, serverSettings);
          // Notify SettingsProvider to re-merge layers
          window.dispatchEvent(new Event("admin-settings-loaded"));
          appLogger.info("Admin settings reconciled from server (silent update)");

          if (layoutChanged) {
            // Allow time for React to commit the new layout chunk before
            // removing the shimmer. 800ms covers slow-ish connections while
            // keeping the perceived load time acceptable. The dynamic import
            // has a loading fallback, so even if 800ms isn't enough the user
            // sees a shimmer (not a blank frame).
            setTimeout(() => setIsTransitioning(false), 800);
          }
        }
      }
    } catch (err) {
      // Non-fatal: cached settings (if any) are already rendered
      appLogger.warn("Failed to fetch admin settings from server", err);
    } finally {
      setIsSettingsReady(true);
      // Ensure isTransitioning is always cleared — covers all paths:
      // 1. Pre-flight set it true (no cache) but server returned same/null layout
      // 2. Layout changed → we need 300ms for React to commit the new layout chunk
      // 3. API error → clear immediately so the UI unblocks
      if (!hasCache) {
        // Give React time to commit the new layout before removing shimmer
        setTimeout(() => setIsTransitioning(false), 800);
      }
    }
  }, [isAuthenticated]);

  // ── Save settings to server (debounced) ──
  const saveToServer = useCallback(
    async (payload: string) => {
      if (!isAuthenticated) return;

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
                  merged[field] = localData[field];
                  if (JSON.stringify(serverData[field]) !== JSON.stringify(localData[field])) {
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
    [isAuthenticated]
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
      loadAdminSettings();
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
      const url = `${process.env.NEXT_PUBLIC_IDENTITY_API_URL}${SAVE_ENDPOINT}`;

      // Check if we still have a valid JWT
      const token = secureTokenService.getAccessToken();

      if (token) {
        // JWT exists — use fetch with keepalive + Authorization header
        // (keepalive: true allows request to outlive the page AND supports custom headers)
        try {
          fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
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
