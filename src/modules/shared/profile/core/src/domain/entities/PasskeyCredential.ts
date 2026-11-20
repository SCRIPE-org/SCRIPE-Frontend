/**
 * Passkey Credential Domain Entity
 *
 * Represents an enrolled FIDO2/WebAuthn public key credential for the user.
 */

/** Supported WebAuthn authenticator attachment mode for passkey enrollment. */
export type AuthenticatorMode = "platform" | "hybrid" | "cross-platform" | "security-key";

/** Display badge metadata resolved from a passkey authenticator AAGUID. */
export interface DeviceBadgeInfo {
  name: string;
  icon: "apple" | "windows" | "yubikey" | "google" | "key" | "smartphone";
}

/** Client platform and browser capabilities detected for passkey enrollment UX. */
export interface ClientDeviceDetection {
  os: string;
  browser: string;
  deviceLabel: string;
  isPlatformAvailable: boolean;
}

/** Enrolled FIDO2/WebAuthn passkey credential domain entity. */
export interface PasskeyCredential {
  id: string;
  deviceName: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  transports: string[];
  attachmentMode?: string | null;
  deviceType?: string | null;
  isBackedUp?: boolean;
  isDiscoverable?: boolean;
  aaguid?: string | null;
  modelName?: string | null;
  credentialIdMasked?: string;
  badge?: DeviceBadgeInfo;
}
