/**
 * Identity Provider Model (DTO)
 *
 * Represents the raw API response/request shapes.
 * Service returns these; Mapper converts them to domain Entities.
 *
 * @module identity-providers/data
 */

// ===== JSON Shapes (API contracts) =====

export interface IdentityProviderJson {
  id: string;
  name: string;
  slug: string;
  protocol: string;
  tenantId: string | null;
  authority: string | null;
  authorizationEndpoint: string | null;
  tokenEndpoint: string | null;
  userInformationEndpoint: string | null;
  clientId: string | null;
  hasClientSecret: boolean;
  scopes: string | null;
  redirectUri: string | null;
  samlIdpEntityId: string | null;
  samlSsoUrl: string | null;
  samlCertificate: string | null;
  claimMappingJson: string | null;
  enabledForAdmins: boolean;
  enabledForUsers: boolean;
  iconUrl: string | null;
  buttonColor: string | null;
  buttonLabel: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string | null;
}

export interface IdentityProviderListItemJson {
  id: string;
  name: string;
  slug: string;
  protocol: string;
  enabledForAdmins: boolean;
  enabledForUsers: boolean;
  isActive: boolean;
  displayOrder: number;
  iconUrl: string | null;
  buttonColor: string | null;
  createdAt: string;
}

export interface IdentityProviderListResponseJson {
  items: IdentityProviderListItemJson[];
  totalCount: number;
}

export interface TestConnectionResultJson {
  isSuccess: boolean;
  message: string;
  discoveredIssuer: string | null;
  discoveredEndpoints: string[] | null;
}

export interface CreateIdentityProviderJson {
  name: string;
  slug: string;
  protocol: string;
  authority?: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userInformationEndpoint?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string;
  redirectUri?: string;
  samlIdpEntityId?: string;
  samlSsoUrl?: string;
  samlCertificate?: string;
  claimMappingJson?: string;
  enabledForAdmins: boolean;
  enabledForUsers: boolean;
  iconUrl?: string;
  buttonColor?: string;
  buttonLabel?: string;
  displayOrder?: number;
}

export interface UpdateIdentityProviderJson {
  name?: string;
  slug?: string;
  protocol?: string;
  authority?: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userInformationEndpoint?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string;
  redirectUri?: string;
  samlIdpEntityId?: string;
  samlSsoUrl?: string;
  samlCertificate?: string;
  claimMappingJson?: string;
  enabledForAdmins?: boolean;
  enabledForUsers?: boolean;
  iconUrl?: string;
  buttonColor?: string;
  buttonLabel?: string;
  displayOrder?: number;
}

// ===== Model Classes =====

export class IdentityProviderModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly protocol: string,
    public readonly tenantId: string | null,
    public readonly authority: string | null,
    public readonly authorizationEndpoint: string | null,
    public readonly tokenEndpoint: string | null,
    public readonly userInformationEndpoint: string | null,
    public readonly clientId: string | null,
    public readonly hasClientSecret: boolean,
    public readonly scopes: string | null,
    public readonly redirectUri: string | null,
    public readonly samlIdpEntityId: string | null,
    public readonly samlSsoUrl: string | null,
    public readonly samlCertificate: string | null,
    public readonly claimMappingJson: string | null,
    public readonly enabledForAdmins: boolean,
    public readonly enabledForUsers: boolean,
    public readonly iconUrl: string | null,
    public readonly buttonColor: string | null,
    public readonly buttonLabel: string | null,
    public readonly displayOrder: number,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly modifiedAt: string | null
  ) {}

  static fromJson(json: IdentityProviderJson): IdentityProviderModel {
    return new IdentityProviderModel(
      json.id,
      json.name,
      json.slug,
      json.protocol,
      json.tenantId,
      json.authority,
      json.authorizationEndpoint,
      json.tokenEndpoint,
      json.userInformationEndpoint,
      json.clientId,
      json.hasClientSecret,
      json.scopes,
      json.redirectUri,
      json.samlIdpEntityId,
      json.samlSsoUrl,
      json.samlCertificate,
      json.claimMappingJson,
      json.enabledForAdmins,
      json.enabledForUsers,
      json.iconUrl,
      json.buttonColor,
      json.buttonLabel,
      json.displayOrder,
      json.isActive,
      json.createdAt,
      json.modifiedAt
    );
  }
}

export class IdentityProviderListItemModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly protocol: string,
    public readonly enabledForAdmins: boolean,
    public readonly enabledForUsers: boolean,
    public readonly isActive: boolean,
    public readonly displayOrder: number,
    public readonly iconUrl: string | null,
    public readonly buttonColor: string | null,
    public readonly createdAt: string
  ) {}

  static fromJson(json: IdentityProviderListItemJson): IdentityProviderListItemModel {
    return new IdentityProviderListItemModel(
      json.id,
      json.name,
      json.slug,
      json.protocol,
      json.enabledForAdmins,
      json.enabledForUsers,
      json.isActive,
      json.displayOrder,
      json.iconUrl,
      json.buttonColor,
      json.createdAt
    );
  }
}
