/**
 * Secure Token Service
 *
 * Provides secure token management with proper error handling,
 * validation, and security measures for localStorage operations.
 *
 * P5.2: Refresh tokens are NO LONGER stored in localStorage.
 * They are managed exclusively by httpOnly cookies set by the
 * backend CookieAuthMiddleware. Only access tokens and expiry
 * timestamps are stored client-side.
 */

import { appLogger } from "./logger";

export interface TokenData {
  accessToken: string;
  /** @deprecated P5.2: Refresh tokens are now in httpOnly cookies */
  refreshToken?: string;
  expiresAt?: number;
}

export class SecureTokenService {
  private static readonly ACCESS_TOKEN_KEY = "accessToken";
  /** @deprecated P5.2: Refresh tokens are now in httpOnly cookies — this key is kept only for migration cleanup */
  private static readonly REFRESH_TOKEN_KEY = "refreshToken";
  private static readonly TOKEN_EXPIRY_KEY = "tokenExpiry";

  // P3.7: Cached access token — avoids localStorage reads on every API request
  private static _cachedAccessToken: string | null = null;
  private static _cacheInitialized = false;

  /**
   * Store access token securely
   */
  static setAccessToken(token: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      if (!token || typeof token !== "string") {
        appLogger.error("Invalid token provided");
        return false;
      }

      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      this._cachedAccessToken = token; // P3.7: Update cache
      return true;
    } catch (error) {
      appLogger.error("Failed to store access token:", error);
      return false;
    }
  }

  /**
   * @deprecated P5.2: Refresh tokens are now in httpOnly cookies.
   * This method is a no-op kept for backward compatibility during migration.
   */
  static setRefreshToken(_token: string): boolean {
    // P5.2: No-op — refresh tokens are managed by httpOnly cookies
    return true;
  }

  /**
   * Store token expiry timestamp
   */
  static setTokenExpiry(expiresAt: number): boolean {
    if (typeof window === "undefined") return false;
    try {
      if (!expiresAt || typeof expiresAt !== "number") {
        appLogger.error("Invalid expiry timestamp provided");
        return false;
      }

      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiresAt.toString());
      return true;
    } catch (error) {
      appLogger.error("Failed to store token expiry:", error);
      return false;
    }
  }

  /**
   * Store all token data at once
   * P5.2: Only stores accessToken and expiry — refreshToken is in httpOnly cookie
   */
  static setTokens(tokenData: TokenData): boolean {
    if (typeof window === "undefined") return false;
    try {
      const success = this.setAccessToken(tokenData.accessToken);

      // P5.2: refreshToken is now in httpOnly cookie — do NOT store in localStorage

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
   * Get access token securely
   * P3.7: Uses module-level cache to avoid localStorage reads on every API request
   */
  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      // P3.7: Return cached token if available
      if (this._cacheInitialized && this._cachedAccessToken) {
        // Still check expiry periodically
        if (this.isTokenExpired()) {
          this.clearTokens();
          return null;
        }
        return this._cachedAccessToken;
      }

      // Cold start: read from localStorage and cache
      const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      this._cacheInitialized = true;

      if (!token) {
        this._cachedAccessToken = null;
        return null;
      }

      // Check if token is expired
      if (this.isTokenExpired()) {
        this.clearTokens();
        return null;
      }

      this._cachedAccessToken = token;
      return token;
    } catch (error) {
      appLogger.error("Failed to retrieve access token:", error);
      return null;
    }
  }

  /**
   * @deprecated P5.2: Refresh tokens are now in httpOnly cookies.
   * Returns null — the backend reads it from the cookie automatically.
   */
  static getRefreshToken(): string | null {
    // P5.2: Refresh token is in httpOnly cookie — not accessible from JS
    return null;
  }

  /**
   * Check if token exists
   */
  static hasToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiryStr) {
        return false; // No expiry set, assume valid
      }

      const expiry = parseInt(expiryStr, 10);
      const now = Date.now();

      return now >= expiry;
    } catch (error) {
      appLogger.error("Failed to check token expiry:", error);
      return true; // Assume expired if we can't check
    }
  }

  /**
   * Clear all tokens securely
   */
  /**
   * Clear all client-side tokens.
   * P5.2: Only clears access token and expiry from localStorage.
   * Refresh token cookie is cleared by the backend on logout.
   * Also cleans up any legacy refresh token key from pre-P5.2.
   */
  static clearTokens(): boolean {
    if (typeof window === "undefined") return false;
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY); // P5.2: Clean up legacy key
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      // P3.7: Invalidate cached token
      this._cachedAccessToken = null;
      this._cacheInitialized = false;
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

    try {
      const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      const expiresAt = expiryStr ? parseInt(expiryStr, 10) : undefined;

      return {
        hasToken: this.hasToken(),
        isExpired: this.isTokenExpired(),
        expiresAt,
      };
    } catch (error) {
      appLogger.error("Failed to get token info:", error);
      return { hasToken: false, isExpired: true };
    }
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
