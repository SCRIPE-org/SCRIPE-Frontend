/**
 * IPasskeyService — HTTP service interface for passkey API calls.
 *
 * Consumed by PasskeyRepository only — never in presentation layer.
 */
export interface IPasskeyService {
  /** Fetch all passkeys for the current admin. */
  getAll(): Promise<PasskeyListResponseDto>;

  /** Begin passkey registration — get WebAuthn challenge from backend. */
  beginRegistration(): Promise<PasskeyRegistrationOptionsResponseDto>;

  /** Complete passkey registration — send attestation to backend. */
  completeRegistration(request: PasskeyCompleteRegistrationRequestDto): Promise<PasskeyResponseDto>;

  /** Rename a passkey. */
  rename(id: string, request: PasskeyRenameRequestDto): Promise<void>;

  /** Delete a passkey. */
  delete(id: string): Promise<void>;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

/**
 * Interface structure detailing the properties and attributes of Passkey Response Dto.
 */
export interface PasskeyResponseDto {
  id: string;
  deviceName: string;
  credentialIdMasked: string;
  createdAt: string;
  lastUsedAt: string | null;
  isDiscoverable: boolean;
  signCount: number;
}

/**
 * Interface structure detailing the properties and attributes of Passkey List Response Dto.
 */
export interface PasskeyListResponseDto {
  items: PasskeyResponseDto[];
}

/**
 * Interface structure detailing the properties and attributes of Passkey Registration Options Response Dto.
 */
export interface PasskeyRegistrationOptionsResponseDto {
  challenge: string;
  rp: { id: string; name: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: Array<{ type: string; alg: number }>;
  timeout: number;
  attestation: string;
  authenticatorSelection: {
    authenticatorAttachment?: string;
    residentKey?: string;
    requireResidentKey?: boolean;
    userVerification?: string;
  };
  excludeCredentials?: Array<{ type: string; id: string; transports?: string[] }>;
}

/**
 * Interface structure detailing the properties and attributes of Passkey Complete Registration Request Dto.
 */
export interface PasskeyCompleteRegistrationRequestDto {
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

/**
 * Interface structure detailing the properties and attributes of Passkey Rename Request Dto.
 */
export interface PasskeyRenameRequestDto {
  name: string;
}
