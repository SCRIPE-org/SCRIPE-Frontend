/**
 * Cross-Tab Authentication Broadcast
 *
 * Uses BroadcastChannel API to sync auth events across same-origin browser tabs
 * with origin/tenant/principal scoping so foreign origins, tenants, or differing
 * principals in another tab never silently corrupt the active tab's state.
 */

import { secureTokenService } from "./secure-token-service";
import {
  runSessionCleanupCallbacks,
  sweepScopedSessionStorageOnLogout,
} from "./session-cleanup-registry";
import { appLogger } from "./logger";
import { BRAND } from "@core/config/branding";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import { formatActivePrincipalKey, getActivePrincipalKey } from "./active-principal";

const TENANT_BREADCRUMBS_KEY = "scr_tenant_breadcrumbs";

export interface AuthBroadcastScope {
  origin?: string;
  tenantId?: string | null;
  tenantCode?: string | null;
  principalId?: string | null;
  principalType?: "admin" | "user" | string | null;
  logoutScope?: "app" | "central";
}

export type AuthBroadcastEvent =
  | { type: "LOGOUT"; scope?: AuthBroadcastScope }
  | { type: "LOGIN_SUCCESS"; scope?: AuthBroadcastScope }
  | { type: "TOKEN_REFRESHED"; accessToken: string; expiresAt?: number; scope?: AuthBroadcastScope }
  | { type: "IMPERSONATION_START"; scope?: AuthBroadcastScope }
  | { type: "IMPERSONATION_STOP"; scope?: AuthBroadcastScope };

class AuthBroadcastService {
  private channel: BroadcastChannel | null = null;

  private onLogoutCallbacks = new Set<() => void>();
  private onLoginSuccessCallbacks = new Set<(scope?: AuthBroadcastScope) => void>();
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
    runSessionCleanupCallbacks();
    if (typeof window !== "undefined") {
      try {
        sweepScopedSessionStorageOnLogout();
        localStorage.removeItem(STORAGE_KEYS.APP_STORE);
        sessionStorage.removeItem(STORAGE_KEYS.tenant_context);
        sessionStorage.removeItem(TENANT_BREADCRUMBS_KEY);
      } catch {
        // Ignore storage errors in restricted browsing contexts
      }
    }
  }

  private isMatchingOrigin(scope?: AuthBroadcastScope): boolean {
    if (!scope?.origin || typeof window === "undefined") return true;
    return scope.origin === window.location.origin;
  }

  private isCompatibleTenantAndPrincipal(
    scope: AuthBroadcastScope | undefined,
    allowCentralOverride = false
  ): boolean {
    if (!this.isMatchingOrigin(scope)) return false;
    if (allowCentralOverride && scope?.logoutScope === "central") return true;
    if (!scope) return true;

    const appState = useAppStore.getState();
    const tabKey = getActivePrincipalKey();
    const storePrincipalKey = appState.user?.id
      ? formatActivePrincipalKey({
          principalType: "admin",
          tenantId: appState.user.tenantId ?? null,
          principalId: String(appState.user.id),
        })
      : null;

    const effectiveKey = tabKey ?? storePrincipalKey;
    const [, currentTenantIdRaw, currentPrincipalId] = effectiveKey
      ? effectiveKey.split(":")
      : [null, null, null];
    const currentTenantId = currentTenantIdRaw === "platform" ? null : currentTenantIdRaw;
    const currentTenantCode = appState.tenantCode?.toUpperCase() ?? null;

    if (
      scope.tenantId &&
      currentTenantId &&
      scope.tenantId !== currentTenantId
    ) {
      return false;
    }

    if (
      scope.tenantCode &&
      currentTenantCode &&
      scope.tenantCode.toUpperCase() !== currentTenantCode
    ) {
      return false;
    }

    if (
      scope.principalId &&
      currentPrincipalId &&
      scope.principalId !== currentPrincipalId
    ) {
      return false;
    }

    return true;
  }

  private resolveOutgoingScope(scope?: AuthBroadcastScope): AuthBroadcastScope | undefined {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
    if (!scope && !currentOrigin) return undefined;
    return {
      origin: currentOrigin,
      ...scope,
    };
  }

  private handleMessage(event: AuthBroadcastEvent): void {
    if (!event || typeof event !== "object") return;

    switch (event.type) {
      case "LOGOUT":
        if (!this.isCompatibleTenantAndPrincipal(event.scope, true)) {
          appLogger.debug("[AuthBroadcast] Ignored foreign-origin/foreign-tenant LOGOUT");
          return;
        }
        appLogger.debug("[AuthBroadcast] Received LOGOUT from another tab");
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
        for (const cb of this.onLogoutCallbacks) {
          cb();
        }
        break;

      case "LOGIN_SUCCESS":
        if (!this.isMatchingOrigin(event.scope)) {
          appLogger.debug("[AuthBroadcast] Ignored foreign-origin LOGIN_SUCCESS");
          return;
        }
        appLogger.debug("[AuthBroadcast] Received LOGIN_SUCCESS from another tab");
        for (const cb of this.onLoginSuccessCallbacks) {
          cb(event.scope);
        }
        break;

      case "TOKEN_REFRESHED":
        if (!this.isCompatibleTenantAndPrincipal(event.scope, false)) {
          appLogger.debug("[AuthBroadcast] Ignored foreign-origin/foreign-tenant TOKEN_REFRESHED");
          return;
        }
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
        if (!this.isMatchingOrigin(event.scope)) return;
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
        if (!this.isMatchingOrigin(event.scope)) return;
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

  onLoginSuccess(callback: (scope?: AuthBroadcastScope) => void): () => void {
    this.onLoginSuccessCallbacks.add(callback);
    return () => {
      this.onLoginSuccessCallbacks.delete(callback);
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

  broadcastLogout(scope?: AuthBroadcastScope): void {
    this.post({ type: "LOGOUT", scope: this.resolveOutgoingScope(scope) });
  }

  broadcastLoginSuccess(scope?: AuthBroadcastScope): void {
    this.post({ type: "LOGIN_SUCCESS", scope: this.resolveOutgoingScope(scope) });
  }

  broadcastTokenRefreshed(
    accessToken: string,
    expiresAt?: number,
    scope?: AuthBroadcastScope
  ): void {
    this.post({
      type: "TOKEN_REFRESHED",
      accessToken,
      expiresAt,
      scope: this.resolveOutgoingScope(scope),
    });
  }

  broadcastImpersonationStart(): void {
    this.post({ type: "IMPERSONATION_START", scope: this.resolveOutgoingScope() });
  }

  broadcastImpersonationStop(): void {
    this.post({ type: "IMPERSONATION_STOP", scope: this.resolveOutgoingScope() });
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
