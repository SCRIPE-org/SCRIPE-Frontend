import type { PasskeyEntity } from "../entities/PasskeyEntity";

/**
 * IPasskeyRepository — Contract for passkey CRUD operations.
 *
 * Consumed by viewmodels via the DI container.
 */
export interface IPasskeyRepository {
  /** List all passkeys for the current admin. */
  getAll(): Promise<PasskeyEntity[]>;

  /** Begin passkey registration — returns WebAuthn options to pass to navigator.credentials.create(). */
  beginRegistration(): Promise<PublicKeyCredentialCreationOptions>;

  /** Complete passkey registration — send the attestation result to the backend. */
  completeRegistration(
    deviceName: string,
    attestationResponse: {
      id: string;
      rawId: string;
      type: string;
      response: {
        attestationObject: string;
        clientDataJSON: string;
      };
    }
  ): Promise<PasskeyEntity>;

  /** Rename a passkey. */
  rename(id: string, newName: string): Promise<void>;

  /** Delete a passkey. */
  delete(id: string): Promise<void>;
}
