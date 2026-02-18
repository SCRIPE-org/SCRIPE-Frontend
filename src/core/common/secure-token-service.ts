/**
 * Secure Token Service
 *
 * Manages access token storage with proper error handling,
 * validation, and security measures for localStorage operations.
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
  private static readonly ACCESS_TOKEN_KEY = "accessToken";
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
   * Store all token data at once (access token + expiry only)
   */
  static setTokens(tokenData: TokenData): boolean {
    if (typeof window === "undefined") return false;
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
   * Clear all client-side tokens.
   * Refresh token cookie is cleared by the backend on logout.
   */
  static clearTokens(): boolean {
    if (typeof window === "undefined") return false;
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      // Clean up any legacy refresh token key that may have been stored previously
      localStorage.removeItem("refreshToken");
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
