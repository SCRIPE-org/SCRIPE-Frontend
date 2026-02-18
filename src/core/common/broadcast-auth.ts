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
 *
 * @usage
 * // In a provider/layout component:
 * import { authBroadcast } from "@core/common/broadcast-auth";
 *
 * // Listen for events from other tabs
 * authBroadcast.onLogout(() => {
 *   useAppStore.getState().logout();
 * });
 *
 * // Broadcast events to other tabs
 * authBroadcast.broadcastLogout();
 */

import { secureTokenService } from "./secure-token-service";
import { appLogger } from "./logger";

type AuthBroadcastEvent =
      | { type: "LOGOUT" }
      | { type: "TOKEN_REFRESHED"; accessToken: string; expiresAt?: number }
      | { type: "IMPERSONATION_START" }
      | { type: "IMPERSONATION_STOP" };

class AuthBroadcastService {
      private channel: BroadcastChannel | null = null;

      // Callbacks
      private onLogoutCallback: (() => void) | null = null;
      private onTokenRefreshedCallback: ((token: string) => void) | null = null;
      private onImpersonationCallback: ((type: "start" | "stop") => void) | null = null;

      constructor() {
            if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
                  try {
                        this.channel = new BroadcastChannel("nexora_auth");
                        this.channel.onmessage = (event: MessageEvent<AuthBroadcastEvent>) => {
                              this.handleMessage(event.data);
                        };
                        appLogger.debug("[AuthBroadcast] Channel initialized");
                  } catch {
                        appLogger.warn("[AuthBroadcast] BroadcastChannel not available");
                  }
            }
      }

      private handleMessage(event: AuthBroadcastEvent): void {
            switch (event.type) {
                  case "LOGOUT":
                        appLogger.debug("[AuthBroadcast] Received LOGOUT from another tab");
                        secureTokenService.clearTokens();
                        this.onLogoutCallback?.();
                        break;

                  case "TOKEN_REFRESHED":
                        appLogger.debug("[AuthBroadcast] Received TOKEN_REFRESHED from another tab");
                        secureTokenService.setAccessToken(event.accessToken);
                        if (event.expiresAt) {
                              secureTokenService.setTokenExpiry(event.expiresAt);
                        }
                        this.onTokenRefreshedCallback?.(event.accessToken);
                        break;

                  case "IMPERSONATION_START":
                        appLogger.debug("[AuthBroadcast] Received IMPERSONATION_START from another tab");
                        this.onImpersonationCallback?.("start");
                        break;

                  case "IMPERSONATION_STOP":
                        appLogger.debug("[AuthBroadcast] Received IMPERSONATION_STOP from another tab");
                        this.onImpersonationCallback?.("stop");
                        break;
            }
      }

      // ─── Register Callbacks ───────────────────────────────────────

      onLogout(callback: () => void): void {
            this.onLogoutCallback = callback;
      }

      onTokenRefreshed(callback: (token: string) => void): void {
            this.onTokenRefreshedCallback = callback;
      }

      onImpersonation(callback: (type: "start" | "stop") => void): void {
            this.onImpersonationCallback = callback;
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
