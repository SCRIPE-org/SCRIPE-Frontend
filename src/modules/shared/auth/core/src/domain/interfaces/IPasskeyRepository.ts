import type { PasskeyEntity } from "../entities/PasskeyEntity";

/** WebAuthn creation options extended with backend challenge tracking metadata. */
export type PasskeyBeginRegistrationOptions = PublicKeyCredentialCreationOptions & {
  challengeToken?: string;
  mode?: string;
};

/** Optional attestation transport and challenge metadata sent when completing passkey registration. */
export interface PasskeyRegistrationCompletionMetadata {
  challengeToken?: string;
  attestationMode?: string;
  credentialIdBase64?: string;
  transports?: string[] | null;
  clientExtensionResults?: Record<string, unknown>;
}

/**
 * IPasskeyRepository — Contract for passkey CRUD operations.
 *
 * Consumed by viewmodels via the DI container.
 */
export interface IPasskeyRepository {
  /** List all passkeys for the current admin. */
  getAll(): Promise<PasskeyEntity[]>;

  /** Begin passkey registration — returns WebAuthn options + challengeToken from backend. */
  beginRegistration(
    deviceName?: string,
    mode?: string
  ): Promise<PasskeyBeginRegistrationOptions>;

  /** Complete passkey registration — send the attestation result and challengeToken to the backend. */
  completeRegistration(
    deviceName: string,
    attestationResponse: {
      id: string;
      rawId: string;
      type: string;
      response: {
        attestationObject: string;
        clientDataJSON: string;
        transports?: string[] | null;
      };
      clientExtensionResults?: Record<string, unknown>;
    },
    metadata?: PasskeyRegistrationCompletionMetadata
  ): Promise<PasskeyEntity>;

  /** Rename a passkey. */
  rename(id: string, newName: string): Promise<void>;

  /** Delete a passkey. */
  delete(id: string): Promise<void>;
}
