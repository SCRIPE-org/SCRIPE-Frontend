/**
 * Authentication Domain Models
 * 
 * Contains all authentication-related domain models including
 * login requests, responses, and related data structures.
 */

import { validateForm, VALIDATION_SETS } from "@/lib/validation";

export interface LoginRequestData {
  username: string;
  password: string;
}

export interface LoginResponseData {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequestData {
  refreshToken: string;
}

export class LoginRequest {
  public readonly username: string;
  public readonly password: string;

  constructor(data: LoginRequestData) {
    this.username = data.username;
    this.password = data.password;
  }

  /**
   * Validate login request data
   */
  get isValid(): boolean {
    const validationResults = validateForm(
      { username: this.username, password: this.password },
      VALIDATION_SETS.LOGIN_FORM
    );
    return Object.values(validationResults).every(result => result.isValid);
  }

}

export class LoginResponse {
  public readonly success: boolean;
  public readonly accessToken: string;
  public readonly refreshToken: string;

  constructor(data: LoginResponseData) {
    this.success = data.success;
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
  }

  /**
   * Check if login was successful
   */
  get isSuccessful(): boolean {
    return this.success && !!(this.accessToken && this.refreshToken);
  }

}

export class RefreshTokenRequest {
  public readonly refreshToken: string;

  constructor(data: RefreshTokenRequestData) {
    this.refreshToken = data.refreshToken;
  }

  /**
   * Validate refresh token request
   */
  get isValid(): boolean {
    return !!(this.refreshToken && this.refreshToken.trim().length > 0);
  }

}
