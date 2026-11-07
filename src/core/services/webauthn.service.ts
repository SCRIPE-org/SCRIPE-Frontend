/**
 * W3C WebAuthn Level 3 Client Service Engine
 *
 * Implements client-side WebAuthn ceremonies with robust Base64URL encoding/decoding,
 * 3-tier authenticator selection (platform, hybrid, hardware key), tolerant extension handling,
 * and device badge detection.
 *
 * @module core/services/webauthn.service
 */

export type AuthenticatorMode = "platform" | "hybrid" | "security-key";

export interface PasskeyAttestationResult {
  id: string;
  rawId: string;
  type: string;
  attestationObjectBase64: string;
  clientDataJsonBase64: string;
  transports?: string[];
  clientExtensionResults?: Record<string, unknown>;
}

export interface PasskeyAssertionResult {
  credentialIdBase64: string;
  authenticatorDataBase64: string;
  clientDataJsonBase64: string;
  signatureBase64: string;
  userHandleBase64: string | null;
  clientExtensionResults?: Record<string, unknown>;
}

export interface DeviceBadgeInfo {
  name: string;
  icon: "apple" | "windows" | "yubikey" | "google" | "key" | "smartphone";
}

/**
 * Encodes an ArrayBuffer or Uint8Array into an unpadded URL-safe Base64 string.
 */
export function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decodes a Base64 or Base64URL string into an ArrayBuffer.
 */
export function base64UrlToBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Checks if the browser runtime supports WebAuthn PublicKeyCredentials.
 */
export async function isWebAuthnAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }
  return true;
}

/**
 * Checks if the platform authenticator (Touch ID, Windows Hello) is available.
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!(await isWebAuthnAvailable())) return false;
  if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== "function") {
    return false;
  }
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Checks if conditional UI (autofill) is supported by the client.
 */
export async function isConditionalMediationAvailable(): Promise<boolean> {
  if (!(await isWebAuthnAvailable())) return false;
  if (typeof PublicKeyCredential.isConditionalMediationAvailable !== "function") {
    return false;
  }
  try {
    return await PublicKeyCredential.isConditionalMediationAvailable();
  } catch {
    return false;
  }
}

/**
 * Executes passkey registration ceremony (navigator.credentials.create).
 */
export async function registerPasskey(
  rawOptions: {
    challenge: string;
    rp: { id?: string; name: string };
    user: { id: string; name: string; displayName: string };
    pubKeyCredParams: Array<{ type: "public-key"; alg: number }>;
    timeout?: number;
    excludeCredentials?: Array<{ id: string; type: "public-key"; transports?: string[] }>;
    authenticatorSelection?: {
      authenticatorAttachment?: AuthenticatorAttachment;
      residentKey?: ResidentKeyRequirement;
      requireResidentKey?: boolean;
      userVerification?: UserVerificationRequirement;
    };
    attestation?: AttestationConveyancePreference;
  },
  mode: AuthenticatorMode = "platform"
): Promise<PasskeyAttestationResult> {
  if (!(await isWebAuthnAvailable())) {
    throw new Error("WebAuthn is not supported in this browser environment.");
  }

  // Parse challenge
  const challengeBuffer = base64UrlToBuffer(rawOptions.challenge);

  // Parse user.id
  let userIdBuffer: ArrayBuffer;
  try {
    userIdBuffer = base64UrlToBuffer(rawOptions.user.id);
  } catch {
    userIdBuffer = new TextEncoder().encode(rawOptions.user.id).buffer;
  }

  // Convert excludeCredentials
  const excludeCredentials: PublicKeyCredentialDescriptor[] | undefined =
    rawOptions.excludeCredentials?.map((cred) => ({
      id: base64UrlToBuffer(cred.id),
      type: cred.type,
      transports: cred.transports as AuthenticatorTransport[] | undefined,
    }));

  // Resolve authenticator selection per requested mode
  let authenticatorAttachment: AuthenticatorAttachment | undefined =
    rawOptions.authenticatorSelection?.authenticatorAttachment;

  if (mode === "platform") {
    authenticatorAttachment = "platform";
  } else if (mode === "security-key" || mode === "hybrid") {
    authenticatorAttachment = "cross-platform";
  }

  const creationOptions: PublicKeyCredentialCreationOptions = {
    challenge: challengeBuffer,
    rp: {
      id: rawOptions.rp.id || window.location.hostname,
      name: rawOptions.rp.name || "SCRIPE Sports OS",
    },
    user: {
      id: userIdBuffer,
      name: rawOptions.user.name,
      displayName: rawOptions.user.displayName || rawOptions.user.name,
    },
    pubKeyCredParams: rawOptions.pubKeyCredParams || [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
      { type: "public-key", alg: -8 }, // Ed25519
    ],
    timeout: rawOptions.timeout || 60000,
    excludeCredentials,
    authenticatorSelection: {
      authenticatorAttachment,
      residentKey: rawOptions.authenticatorSelection?.residentKey || "preferred",
      requireResidentKey: rawOptions.authenticatorSelection?.requireResidentKey ?? false,
      userVerification: rawOptions.authenticatorSelection?.userVerification || "preferred",
    },
    attestation: rawOptions.attestation || "none",
  };

  const credential = (await navigator.credentials.create({
    publicKey: creationOptions,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Passkey registration ceremony was cancelled or produced no credential.");
  }

  const response = credential.response as AuthenticatorAttestationResponse;

  let transports: string[] | undefined;
  if (typeof response.getTransports === "function") {
    transports = response.getTransports();
  }

  const clientExtensionResults = credential.getClientExtensionResults
    ? (credential.getClientExtensionResults() as Record<string, unknown>)
    : undefined;

  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    attestationObjectBase64: bufferToBase64Url(response.attestationObject),
    clientDataJsonBase64: bufferToBase64Url(response.clientDataJSON),
    transports,
    clientExtensionResults,
  };
}

/**
 * Executes passkey authentication ceremony (navigator.credentials.get).
 */
export async function assertPasskey(
  rawOptions: {
    challenge: string;
    rpId?: string;
    timeout?: number;
    allowCredentials?: Array<{ id: string; type: "public-key"; transports?: string[] }>;
    userVerification?: UserVerificationRequirement;
  },
  useMediation = false
): Promise<PasskeyAssertionResult> {
  if (!(await isWebAuthnAvailable())) {
    throw new Error("WebAuthn is not supported in this browser environment.");
  }

  const challengeBuffer = base64UrlToBuffer(rawOptions.challenge);

  const allowCredentials: PublicKeyCredentialDescriptor[] | undefined =
    rawOptions.allowCredentials?.map((cred) => ({
      id: base64UrlToBuffer(cred.id),
      type: cred.type,
      transports: cred.transports as AuthenticatorTransport[] | undefined,
    }));

  const requestOptions: PublicKeyCredentialRequestOptions = {
    challenge: challengeBuffer,
    rpId: rawOptions.rpId || window.location.hostname,
    timeout: rawOptions.timeout || 60000,
    allowCredentials,
    userVerification: rawOptions.userVerification || "preferred",
  };

  const credential = (await navigator.credentials.get({
    publicKey: requestOptions,
    mediation: useMediation ? "conditional" : undefined,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Passkey assertion ceremony was cancelled or produced no credential.");
  }

  const response = credential.response as AuthenticatorAssertionResponse;

  const clientExtensionResults = credential.getClientExtensionResults
    ? (credential.getClientExtensionResults() as Record<string, unknown>)
    : undefined;

  return {
    credentialIdBase64: bufferToBase64Url(credential.rawId),
    authenticatorDataBase64: bufferToBase64Url(response.authenticatorData),
    clientDataJsonBase64: bufferToBase64Url(response.clientDataJSON),
    signatureBase64: bufferToBase64Url(response.signature),
    userHandleBase64: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
    clientExtensionResults,
  };
}

/**
 * Detects device hardware or vendor badge information based on AAGUID and User Agent.
 */
export function detectDeviceBadge(aaguid?: string, userAgent?: string): DeviceBadgeInfo {
  const lowerAaguid = aaguid?.toLowerCase() || "";
  const ua = (userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "")).toLowerCase();

  // Known AAGUID definitions
  if (lowerAaguid.startsWith("08987058") || lowerAaguid.includes("cadc-4b81")) {
    return { name: "Windows Hello", icon: "windows" };
  }
  if (lowerAaguid.startsWith("fdfc9cd6") || lowerAaguid.startsWith("b539762b")) {
    return { name: "Apple iCloud Keychain", icon: "apple" };
  }
  if (lowerAaguid.startsWith("ee882879") || lowerAaguid.startsWith("c1319660") || lowerAaguid.startsWith("fa2b99dc")) {
    return { name: "YubiKey 5 / FIDO2", icon: "yubikey" };
  }
  if (lowerAaguid.startsWith("ea9b8d66")) {
    return { name: "Google Password Manager", icon: "google" };
  }

  // Fallback to User-Agent heuristics
  if (ua.includes("macintosh") || ua.includes("iphone") || ua.includes("ipad")) {
    return { name: "Apple Touch ID / Face ID", icon: "apple" };
  }
  if (ua.includes("windows")) {
    return { name: "Windows Hello", icon: "windows" };
  }
  if (ua.includes("android")) {
    return { name: "Android Screen Lock", icon: "smartphone" };
  }

  return { name: "Hardware Security Key", icon: "key" };
}
