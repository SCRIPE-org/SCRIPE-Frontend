/**
 * Passkey API DTOs — Data models matching the backend API responses.
 * These are NEVER used in the presentation layer — mappers convert to entities.
 */

/** DTO for a passkey in list responses. */
export interface PasskeyDto {
  id: string;
  deviceName: string;
  credentialIdMasked: string;
  createdAt: string;
  lastUsedAt: string | null;
  isDiscoverable: boolean;
  signCount: number;
}

/** DTO for begin registration response. */
export interface PasskeyRegistrationOptionsDto {
  challenge: string;
  rp: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  timeout: number;
  attestation: string;
  authenticatorSelection: {
    authenticatorAttachment?: string;
    residentKey?: string;
    requireResidentKey?: boolean;
    userVerification?: string;
  };
  excludeCredentials?: Array<{
    type: string;
    id: string;
    transports?: string[];
  }>;
}

/** Request DTO for complete registration. */
export interface PasskeyCompleteRegistrationRequest {
  deviceName: string;
  attestationResponse: {
    id: string;
    rawId: string;
    type: string;
    response: {
      attestationObject: string;
      clientDataJSON: string;
    };
  };
}

/** Request DTO for rename. */
export interface PasskeyRenameRequest {
  name: string;
}
