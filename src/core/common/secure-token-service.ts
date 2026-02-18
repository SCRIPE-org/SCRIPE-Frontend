/**
 * Secure Token Service
 *
 * Manages access token storage IN-MEMORY ONLY for maximum security.
 * The access token is NEVER persisted to localStorage or sessionStorage.
 *
 * On page reload, the token is gone — the app silently refreshes it
 * via the httpOnly refresh token cookie (handled by CookieAuthMiddleware).
 *
 * Refresh tokens are managed exclusively by httpOnly cookies
 * set by the backend CookieAuthMiddleware — never stored client-side.
 */

import { appLogger } from "./logger";

export interface TokenData {
  accessToken: string;
  expiresAt?: number;
}

export class SecureTokenService {
  // ─── In-Memory Token Storage ─────────────────────────────────────
  // These variables are module-scoped — they persist for the lifetime of the
  // JavaScript session (same as a BroadcastChannel participant lifetime).
  // On page reload, they reset to null and the app must call /auth/refresh.
  private static _accessToken: string | null = null;
  private static _tokenExpiry: number | null = null;

  /**
   * Store access token in memory.
   * NEVER writes to localStorage or sessionStorage.
   */
  static setAccessToken(token: string): boolean {
    try {
      if (!token || typeof token !== "string") {
        appLogger.error("Invalid token provided");
        return false;
      }

      this._accessToken = token;
      appLogger.auth("Access token stored in memory");
      return true;
    } catch (error) {
      appLogger.error("Failed to store access token:", error);
      return false;
    }
  }

  /**
   * Store token expiry timestamp in memory.
   */
  static setTokenExpiry(expiresAt: number): boolean {
    try {
      if (!expiresAt || typeof expiresAt !== "number") {
        appLogger.error("Invalid expiry timestamp provided");
        return false;
      }

      this._tokenExpiry = expiresAt;
      return true;
    } catch (error) {
      appLogger.error("Failed to store token expiry:", error);
      return false;
    }
  }

  /**
   * Store all token data at once (access token + expiry only)
   */
  static setTokens(tokenData: TokenData): boolean {
    try {
      const success = this.setAccessToken(tokenData.accessToken);

      if (tokenData.expiresAt) {
        this.setTokenExpiry(tokenData.expiresAt);
      }

      return success;
    } catch (error) {
      appLogger.error("Failed to store tokens:", error);
      return false;
    }
  }

  /**
   * Get access token from memory.
   * Returns null after page reload (caller must trigger refresh flow).
   */
  static getAccessToken(): string | null {
    try {
      if (!this._accessToken) {
        return null;
      }

      // Check if token is expired
      if (this.isTokenExpired()) {
        this.clearTokens();
        return null;
      }

      return this._accessToken;
    } catch (error) {
      appLogger.error("Failed to retrieve access token:", error);
      return null;
    }
  }

  /**
   * Check if token exists in memory.
   */
  static hasToken(): boolean {
    return !!this._accessToken && !this.isTokenExpired();
  }

  /**
   * Check if token is expired based on in-memory expiry.
   */
  static isTokenExpired(): boolean {
    try {
      if (!this._tokenExpiry) {
        return false; // No expiry set, assume valid
      }

      return Date.now() >= this._tokenExpiry;
    } catch (error) {
      appLogger.error("Failed to check token expiry:", error);
      return true; // Assume expired if we can't check
    }
  }

  /**
   * Clear all in-memory tokens.
   * Also removes any legacy localStorage keys for backward compatibility.
   * Refresh token cookie is cleared by the backend on logout.
   */
  static clearTokens(): boolean {
    try {
      // Clear in-memory state
      this._accessToken = null;
      this._tokenExpiry = null;

      // Remove legacy localStorage keys (from before in-memory migration)
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tokenExpiry");
        localStorage.removeItem("refreshToken");
      }

      return true;
    } catch (error) {
      appLogger.error("Failed to clear tokens:", error);
      return false;
    }
  }

  /**
   * Get token info for debugging (development only)
   */
  static getTokenInfo(): { hasToken: boolean; isExpired: boolean; expiresAt?: number } {
    if (process.env.NODE_ENV !== "development") {
      return { hasToken: false, isExpired: true };
    }

    return {
      hasToken: this.hasToken(),
      isExpired: this.isTokenExpired(),
      expiresAt: this._tokenExpiry ?? undefined,
    };
  }

  /**
   * Validate token format (basic validation)
   */
  static validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== "string") {
      return false;
    }

    // Basic JWT format validation (3 parts separated by dots)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    // Check if each part is base64-like
    return parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part));
  }
}

// Export singleton instance for convenience
export const secureTokenService = SecureTokenService;
