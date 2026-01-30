/**
 * Secure Token Service
 * 
 * Provides secure token management with proper error handling,
 * validation, and security measures for localStorage operations.
 */

import { appLogger } from './logger';

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export class SecureTokenService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';

  /**
   * Store access token securely
   */
  static setAccessToken(token: string): boolean {
    try {
      if (!token || typeof token !== 'string') {
        appLogger.error('Invalid token provided');
        return false;
      }
      
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      return true;
    } catch (error) {
      appLogger.error('Failed to store access token:', error);
      return false;
    }
  }

  /**
   * Store refresh token securely
   */
  static setRefreshToken(token: string): boolean {
    try {
      if (!token || typeof token !== 'string') {
        appLogger.error('Invalid refresh token provided');
        return false;
      }
      
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      return true;
    } catch (error) {
      appLogger.error('Failed to store refresh token:', error);
      return false;
    }
  }

  /**
   * Store token expiry timestamp
   */
  static setTokenExpiry(expiresAt: number): boolean {
    try {
      if (!expiresAt || typeof expiresAt !== 'number') {
        appLogger.error('Invalid expiry timestamp provided');
        return false;
      }
      
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiresAt.toString());
      return true;
    } catch (error) {
      appLogger.error('Failed to store token expiry:', error);
      return false;
    }
  }

  /**
   * Store all token data at once
   */
  static setTokens(tokenData: TokenData): boolean {
    try {
      const success = this.setAccessToken(tokenData.accessToken);
      
      if (tokenData.refreshToken) {
        this.setRefreshToken(tokenData.refreshToken);
      }
      
      if (tokenData.expiresAt) {
        this.setTokenExpiry(tokenData.expiresAt);
      }
      
      return success;
    } catch (error) {
      appLogger.error('Failed to store tokens:', error);
      return false;
    }
  }

  /**
   * Get access token securely
   */
  static getAccessToken(): string | null {
    try {
      const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      
      if (!token) {
        return null;
      }
      
      // Check if token is expired
      if (this.isTokenExpired()) {
        this.clearTokens();
        return null;
      }
      
      return token;
    } catch (error) {
      appLogger.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token securely
   */
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      appLogger.error('Failed to retrieve refresh token:', error);
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
    try {
      const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiryStr) {
        return false; // No expiry set, assume valid
      }
      
      const expiry = parseInt(expiryStr, 10);
      const now = Date.now();
      
      return now >= expiry;
    } catch (error) {
      appLogger.error('Failed to check token expiry:', error);
      return true; // Assume expired if we can't check
    }
  }

  /**
   * Clear all tokens securely
   */
  static clearTokens(): boolean {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      return true;
    } catch (error) {
      appLogger.error('Failed to clear tokens:', error);
      return false;
    }
  }

  /**
   * Get token info for debugging (development only)
   */
  static getTokenInfo(): { hasToken: boolean; isExpired: boolean; expiresAt?: number } {
    if (process.env.NODE_ENV !== 'development') {
      return { hasToken: false, isExpired: true };
    }
    
    try {
      const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      const expiresAt = expiryStr ? parseInt(expiryStr, 10) : undefined;
      
      return {
        hasToken: this.hasToken(),
        isExpired: this.isTokenExpired(),
        expiresAt
      };
    } catch (error) {
      appLogger.error('Failed to get token info:', error);
      return { hasToken: false, isExpired: true };
    }
  }

  /**
   * Validate token format (basic validation)
   */
  static validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Basic JWT format validation (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Check if each part is base64-like
    return parts.every(part => /^[A-Za-z0-9_-]+$/.test(part));
  }
}

// Export singleton instance for convenience
export const secureTokenService = SecureTokenService;
