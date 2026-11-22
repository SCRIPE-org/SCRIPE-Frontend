/**
 * Cross-Tab Authentication Broadcast
 *
 * Uses BroadcastChannel API to sync auth events across browser tabs.
 * With in-memory tokens, there's no automatic cross-tab sync via localStorage
 * storage events. This module provides explicit communication for:
 *
 * - Logout: When one tab logs out, all tabs should redirect to login
 * - Token refresh: When one tab refreshes, other tabs can use the new token
 * - Impersonation: When admin starts/stops impersonation
 */

import { secureTokenService } from "./secure-token-service";
import { appLogger } from "./logger";
import { BRAND } from "@core/config/branding";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";

const TENANT_BREADCRUMBS_KEY = "scr_tenant_breadcrumbs";

type AuthBroadcastEvent =
  | { type: "LOGOUT" }
  | { type: "TOKEN_REFRESHED"; accessToken: string; expiresAt?: number }
  | { type: "IMPERSONATION_START" }
  | { type: "IMPERSONATION_STOP" };

class AuthBroadcastService {
  private channel: BroadcastChannel | null = null;

  private onLogoutCallbacks = new Set<() => void>();
  private onTokenRefreshedCallbacks = new Set<(token: string) => void>();
  private onImpersonationCallbacks = new Set<(type: "start" | "stop") => void>();

  constructor() {
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        this.channel = new BroadcastChannel(BRAND.authChannel);
        this.channel.onmessage = (event: MessageEvent<AuthBroadcastEvent>) => {
          this.handleMessage(event.data);
        };
        appLogger.debug("[AuthBroadcast] Channel initialized");
      } catch {
        appLogger.warn("[AuthBroadcast] BroadcastChannel not available");
      }
    }
  }

  private clearSiblingSessionForImpersonation(): void {
    secureTokenService.clearTokens();
    useAppStore.getState().logout();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEYS.APP_STORE);
        sessionStorage.removeItem(STORAGE_KEYS.tenant_context);
        sessionStorage.removeItem(TENANT_BREADCRUMBS_KEY);
      } catch {
        // Ignore storage errors in restricted browsing contexts
      }
    }
  }

  private handleMessage(event: AuthBroadcastEvent): void {
    switch (event.type) {
      case "LOGOUT":
        appLogger.debug("[AuthBroadcast] Received LOGOUT from another tab");
        secureTokenService.clearTokens();
        for (const cb of this.onLogoutCallbacks) {
          cb();
        }
        break;

      case "TOKEN_REFRESHED":
        appLogger.debug("[AuthBroadcast] Received TOKEN_REFRESHED from another tab");
        secureTokenService.setAccessToken(event.accessToken);
        if (event.expiresAt) {
          secureTokenService.setTokenExpiry(event.expiresAt);
        }
        for (const cb of this.onTokenRefreshedCallbacks) {
          cb(event.accessToken);
        }
        break;

      case "IMPERSONATION_START":
        appLogger.debug("[AuthBroadcast] Received IMPERSONATION_START from another tab");
        this.clearSiblingSessionForImpersonation();
        if (typeof window !== "undefined") {
          sessionStorage.setItem(STORAGE_KEYS.IMPERSONATING, "true");
        }
        for (const cb of this.onImpersonationCallbacks) {
          cb("start");
        }
        break;

      case "IMPERSONATION_STOP":
        appLogger.debug("[AuthBroadcast] Received IMPERSONATION_STOP from another tab");
        this.clearSiblingSessionForImpersonation();
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATING);
          sessionStorage.removeItem(STORAGE_KEYS.admin_backup_token);
        }
        for (const cb of this.onImpersonationCallbacks) {
          cb("stop");
        }
        break;
    }
  }

  // ─── Register Callbacks ───────────────────────────────────────

  onLogout(callback: () => void): () => void {
    this.onLogoutCallbacks.add(callback);
    return () => {
      this.onLogoutCallbacks.delete(callback);
    };
  }

  onTokenRefreshed(callback: (token: string) => void): () => void {
    this.onTokenRefreshedCallbacks.add(callback);
    return () => {
      this.onTokenRefreshedCallbacks.delete(callback);
    };
  }

  onImpersonation(callback: (type: "start" | "stop") => void): () => void {
    this.onImpersonationCallbacks.add(callback);
    return () => {
      this.onImpersonationCallbacks.delete(callback);
    };
  }

  // ─── Broadcast Events ────────────────────────────────────────

  broadcastLogout(): void {
    this.post({ type: "LOGOUT" });
  }

  broadcastTokenRefreshed(accessToken: string, expiresAt?: number): void {
    this.post({ type: "TOKEN_REFRESHED", accessToken, expiresAt });
  }

  broadcastImpersonationStart(): void {
    this.post({ type: "IMPERSONATION_START" });
  }

  broadcastImpersonationStop(): void {
    this.post({ type: "IMPERSONATION_STOP" });
  }

  private post(event: AuthBroadcastEvent): void {
    try {
      this.channel?.postMessage(event);
    } catch {
      // Ignore — channel may be closed
    }
  }

  /** Close the channel (e.g. on component unmount) */
  close(): void {
    this.channel?.close();
    this.channel = null;
  }
}

/** Singleton instance — safe to import anywhere */
export const authBroadcast = new AuthBroadcastService();
