/**
 * OAuth Application Model (DTO)
 *
 * Raw API response/request shapes for OAuth applications.
 *
 * @module oauth-apps/data
 */

// ===== JSON Shapes (API contracts) =====

/**
 * Interface structure detailing the properties and attributes of O Auth App Json.
 */
export interface OAuthAppJson {
  id: string;
  displayName: string;
  protocol: string;
  clientId: string;
  hasClientSecret: boolean;
  clientType: string;
  redirectUrisJson: string;
  postLogoutRedirectUrisJson: string;
  allowedScopes: string;
  allowedGrantTypes: string;
  tenantId: string | null;
  requireConsent: boolean;
  requirePkce: boolean;
  logoUri: string | null;
  samlAcsUrl: string | null;
  samlSpEntityId: string | null;
  samlSpCertificate: string | null;
  description: string | null;
  accessTokenLifetimeMinutes: number;
  refreshTokenLifetimeDays: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string | null;
}

/**
 * Interface structure detailing the properties and attributes of O Auth App List Item Json.
 */
export interface OAuthAppListItemJson {
  id: string;
  displayName: string;
  protocol: string;
  clientId: string;
  clientType: string;
  allowedScopes: string;
  allowedGrantTypes: string;
  isActive: boolean;
  requirePkce: boolean;
  logoUri: string | null;
  description: string | null;
  createdAt: string;
}

/**
 * Interface structure detailing the properties and attributes of O Auth App List Response Json.
 */
export interface OAuthAppListResponseJson {
  items: OAuthAppListItemJson[];
  totalCount: number;
}

/**
 * Interface structure detailing the properties and attributes of Regenerate Secret Result Json.
 */
export interface RegenerateSecretResultJson {
  clientId: string;
  newClientSecret: string;
}

/**
 * Interface structure detailing the properties and attributes of Create O Auth App Response Json.
 */
export interface CreateOAuthAppResponseJson {
  id: string;
  clientId: string;
  clientSecret: string | null;
}

/**
 * Interface structure detailing the properties and attributes of Create O Auth App Json.
 */
export interface CreateOAuthAppJson {
  displayName: string;
  clientType: string;
  redirectUrisJson: string;
  protocol?: string;
  postLogoutRedirectUrisJson?: string;
  allowedScopes?: string;
  allowedGrantTypes?: string;
  requireConsent?: boolean;
  requirePkce?: boolean;
  logoUri?: string;
  samlAcsUrl?: string;
  samlSpEntityId?: string;
  samlSpCertificate?: string;
  description?: string;
  accessTokenLifetimeMinutes?: number;
  refreshTokenLifetimeDays?: number;
}

/**
 * Interface structure detailing the properties and attributes of Update O Auth App Json.
 */
export interface UpdateOAuthAppJson {
  displayName?: string;
  protocol?: string;
  redirectUrisJson?: string;
  postLogoutRedirectUrisJson?: string;
  allowedScopes?: string;
  allowedGrantTypes?: string;
  requireConsent?: boolean;
  requirePkce?: boolean;
  logoUri?: string;
  samlAcsUrl?: string;
  samlSpEntityId?: string;
  samlSpCertificate?: string;
  description?: string;
  accessTokenLifetimeMinutes?: number;
  refreshTokenLifetimeDays?: number;
}

// ===== Model Classes =====

/**
 * Domain entity class representing a O Auth App Model.
 */
export class OAuthAppModel {
  constructor(
    public readonly id: string,
    public readonly displayName: string,
    public readonly protocol: string,
    public readonly clientId: string,
    public readonly hasClientSecret: boolean,
    public readonly clientType: string,
    public readonly redirectUrisJson: string,
    public readonly postLogoutRedirectUrisJson: string,
    public readonly allowedScopes: string,
    public readonly allowedGrantTypes: string,
    public readonly tenantId: string | null,
    public readonly requireConsent: boolean,
    public readonly requirePkce: boolean,
    public readonly logoUri: string | null,
    public readonly samlAcsUrl: string | null,
    public readonly samlSpEntityId: string | null,
    public readonly samlSpCertificate: string | null,
    public readonly description: string | null,
    public readonly accessTokenLifetimeMinutes: number,
    public readonly refreshTokenLifetimeDays: number,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly modifiedAt: string | null
  ) {}

  static fromJson(json: OAuthAppJson): OAuthAppModel {
    return new OAuthAppModel(
      json.id,
      json.displayName,
      json.protocol,
      json.clientId,
      json.hasClientSecret,
      json.clientType,
      json.redirectUrisJson,
      json.postLogoutRedirectUrisJson,
      json.allowedScopes,
      json.allowedGrantTypes,
      json.tenantId,
      json.requireConsent,
      json.requirePkce,
      json.logoUri,
      json.samlAcsUrl,
      json.samlSpEntityId,
      json.samlSpCertificate,
      json.description,
      json.accessTokenLifetimeMinutes,
      json.refreshTokenLifetimeDays,
      json.isActive,
      json.createdAt,
      json.modifiedAt
    );
  }
}

/**
 * Domain entity class representing a O Auth App List Item Model.
 */
export class OAuthAppListItemModel {
  constructor(
    public readonly id: string,
    public readonly displayName: string,
    public readonly protocol: string,
    public readonly clientId: string,
    public readonly clientType: string,
    public readonly allowedScopes: string,
    public readonly allowedGrantTypes: string,
    public readonly isActive: boolean,
    public readonly requirePkce: boolean,
    public readonly logoUri: string | null,
    public readonly description: string | null,
    public readonly createdAt: string
  ) {}

  static fromJson(json: OAuthAppListItemJson): OAuthAppListItemModel {
    return new OAuthAppListItemModel(
      json.id,
      json.displayName,
      json.protocol,
      json.clientId,
      json.clientType,
      json.allowedScopes,
      json.allowedGrantTypes,
      json.isActive,
      json.requirePkce,
      json.logoUri,
      json.description,
      json.createdAt
    );
  }
}
