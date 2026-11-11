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

export interface ClientDeviceDetection {
  os: string;
  browser: string;
  deviceLabel: string;
  isPlatformAvailable: boolean;
}

/**
 * Auto-detect the current operating system, browser, and platform authenticator.
 */
export async function detectClientDevice(): Promise<ClientDeviceDetection> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      os: "Station Terminal",
      browser: "Browser",
      deviceLabel: "Command Station",
      isPlatformAvailable: false,
    };
  }

  const ua = navigator.userAgent;
  let os = "Desktop";
  let browser = "Browser";

  // Operating System detection
  if (/Windows NT 10.0/i.test(ua)) {
    os = "Windows 11";
  } else if (/Windows NT/i.test(ua)) {
    os = "Windows";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = "macOS";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = "iOS";
  } else if (/Android/i.test(ua)) {
    os = "Android";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  // Browser detection
  if (/Edg\//i.test(ua)) {
    browser = "Edge";
  } else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
    browser = "Chrome";
  } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    browser = "Safari";
  } else if (/Firefox\//i.test(ua)) {
    browser = "Firefox";
  } else if (/OPR\//i.test(ua)) {
    browser = "Opera";
  }

  const isPlatformAvailable = await isPlatformAuthenticatorAvailable();
  const platformFeature =
    os === "Windows 11" || os === "Windows"
      ? "Windows Hello"
      : os === "macOS" || os === "iOS"
      ? "Touch ID / Face ID"
      : "Screen Lock";

  const deviceLabel = isPlatformAvailable
    ? `${platformFeature} • ${os}`
    : `${os} (${browser})`;

  return {
    os,
    browser,
    deviceLabel,
    isPlatformAvailable,
  };
}

/**
 * Translates WebAuthn browser DOMExceptions into clear, actionable, user-friendly messages.
 */
export function translateError(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
        return "The passkey prompt timed out or was dismissed. Please click retry when ready.";
      case "InvalidStateError":
        return "This authenticator or passkey is already enrolled for this account.";
      case "NotSupportedError":
        return "Passkeys or platform biometrics are not supported on this device/browser configuration.";
      case "SecurityError":
        return "Origin security verification failed. Domain does not match relying party.";
      case "AbortError":
        return "The passkey operation was cancelled.";
      case "ConstraintError":
        return "The requested authenticator constraint could not be satisfied.";
      default:
        return err.message || "Passkey operation failed.";
    }
  }
  if (err instanceof Error) {
    if (
      err.message.includes("timed out") ||
      err.message.includes("not allowed") ||
      err.message.includes("dismissed")
    ) {
      return "The passkey prompt timed out or was dismissed. Please click retry when ready.";
    }
    return err.message;
  }
  return "An unknown error occurred during passkey ceremony.";
}

/**
 * Registration options supporting both W3C L3 nested objects and flat DTO properties.
 */
export interface WebAuthnRegisterOptionsPayload {
  challenge: string;
  rp?: { id?: string; name?: string };
  rpId?: string;
  rpName?: string;
  user?: { id?: string; name?: string; displayName?: string };
  userId?: string;
  userName?: string;
  userDisplayName?: string;
  pubKeyCredParams?: Array<{ type: "public-key"; alg: number }>;
  timeout?: number;
  excludeCredentials?: Array<{ id: string; type: "public-key"; transports?: string[] }>;
  authenticatorSelection?: {
    authenticatorAttachment?: AuthenticatorAttachment;
    residentKey?: ResidentKeyRequirement;
    requireResidentKey?: boolean;
    userVerification?: UserVerificationRequirement;
  };
  attestation?: AttestationConveyancePreference;
  hints?: ("client-device" | "hybrid" | "security-key")[];
}

/**
 * Executes passkey registration ceremony (navigator.credentials.create).
 */
export async function registerPasskey(
  rawOptions: WebAuthnRegisterOptionsPayload,
  mode: AuthenticatorMode = "platform"
): Promise<PasskeyAttestationResult> {
  if (!(await isWebAuthnAvailable())) {
    throw new Error("WebAuthn is not supported in this browser environment.");
  }

  // Parse challenge
  const challengeBuffer = base64UrlToBuffer(rawOptions.challenge);

  // Safe RP resolution
  const resolvedRpId =
    rawOptions.rp?.id ||
    rawOptions.rpId ||
    (typeof window !== "undefined" ? window.location.hostname : "localhost");
  const resolvedRpName =
    rawOptions.rp?.name ||
    rawOptions.rpName ||
    "SCRIPE Enterprise OS";

  // Safe User resolution
  const rawUserId =
    rawOptions.user?.id ||
    rawOptions.userId ||
    "scripe-user";
  const resolvedUserName =
    rawOptions.user?.name ||
    rawOptions.userName ||
    "admin@scripe.org";
  const resolvedUserDisplayName =
    rawOptions.user?.displayName ||
    rawOptions.userDisplayName ||
    resolvedUserName;

  let userIdBuffer: ArrayBuffer;
  try {
    userIdBuffer = base64UrlToBuffer(rawUserId);
  } catch {
    userIdBuffer = new TextEncoder().encode(rawUserId).buffer;
  }

  // Convert excludeCredentials
  const excludeCredentials: PublicKeyCredentialDescriptor[] | undefined =
    rawOptions.excludeCredentials?.map((cred) => ({
      id: base64UrlToBuffer(cred.id),
      type: cred.type,
      transports: cred.transports as AuthenticatorTransport[] | undefined,
    }));

  // Resolve authenticator selection and hints per requested mode
  let authenticatorAttachment: AuthenticatorAttachment | undefined =
    rawOptions.authenticatorSelection?.authenticatorAttachment;
  let modeHints: ("client-device" | "hybrid" | "security-key")[] | undefined =
    rawOptions.hints;

  if (mode === "platform") {
    // Current workstation passkey (Windows Hello, Touch ID, or browser vault)
    // Leaving attachment unconstrained with ["client-device"] allows both Windows Hello
    // and browser credential vaults without forcing a USB prompt.
    authenticatorAttachment = undefined;
    modeHints = ["client-device"];
  } else if (mode === "hybrid") {
    // Phone / Tablet QR Code (FIDO Hybrid / CaBLE)
    authenticatorAttachment = undefined;
    modeHints = ["hybrid"];
  } else if (mode === "security-key") {
    // Explicit physical USB / NFC hardware security key
    authenticatorAttachment = "cross-platform";
    modeHints = ["security-key"];
  }

  const creationOptions: PublicKeyCredentialCreationOptions = {
    challenge: challengeBuffer,
    rp: {
      id: resolvedRpId,
      name: resolvedRpName,
    },
    user: {
      id: userIdBuffer,
      name: resolvedUserName,
      displayName: resolvedUserDisplayName,
    },
    pubKeyCredParams: rawOptions.pubKeyCredParams && rawOptions.pubKeyCredParams.length > 0
      ? rawOptions.pubKeyCredParams
      : [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
          { type: "public-key", alg: -37 }, // PS256
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

  if (modeHints && modeHints.length > 0) {
    (creationOptions as unknown as { hints?: string[] }).hints = modeHints;
  }

  try {
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
  } catch (err: unknown) {
    const translated = translateError(err);
    throw new Error(translated);
  }
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
    rpId:
      rawOptions.rpId ||
      (typeof window !== "undefined" ? window.location.hostname : "localhost"),
    timeout: rawOptions.timeout || 60000,
    allowCredentials,
    userVerification: rawOptions.userVerification || "preferred",
  };

  try {
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
  } catch (err: unknown) {
    const translated = translateError(err);
    throw new Error(translated);
  }
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
