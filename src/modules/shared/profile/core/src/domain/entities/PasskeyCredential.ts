/**
 * Passkey Credential Domain Entity
 *
 * Represents an enrolled FIDO2/WebAuthn public key credential for the user.
 */

export type AuthenticatorMode = "platform" | "hybrid" | "security-key";

export interface DeviceBadgeInfo {
  name: string;
  icon: "apple" | "windows" | "yubikey" | "google" | "key" | "smartphone";
}

export interface PasskeyCredential {
  id: string;
  deviceName: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  transports: string[];
  isDiscoverable?: boolean;
  aaguid?: string | null;
  modelName?: string | null;
  credentialIdMasked?: string;
  badge?: DeviceBadgeInfo;
}
