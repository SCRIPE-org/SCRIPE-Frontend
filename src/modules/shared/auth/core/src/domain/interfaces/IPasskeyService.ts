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
 * Interface defining property specifications, keys types, and structural contract rules for passkey response dto.
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
 * Interface defining property specifications, keys types, and structural contract rules for passkey list response dto.
 */
export interface PasskeyListResponseDto {
  items: PasskeyResponseDto[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for passkey registration options response dto.
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
 * Interface defining property specifications, keys types, and structural contract rules for passkey complete registration request dto.
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
 * Interface defining property specifications, keys types, and structural contract rules for passkey rename request dto.
 */
export interface PasskeyRenameRequestDto {
  name: string;
}
