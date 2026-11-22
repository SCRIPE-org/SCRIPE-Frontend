/**
 * SecurityRepositoryMapper
 *
 * Pure DTO-to-entity mapping helpers for passkeys, biometric Sudo step-up,
 * workstation session fleet entries, and SOC2 audit logs.
 */
import type { PasskeyCredential } from "../../domain/entities/PasskeyCredential";
import type { WorkstationSession } from "../../domain/entities/WorkstationSession";
import type { SecurityAuditEntry } from "../../domain/entities/SecurityAuditEntry";
import type {
  SudoPasskeyBeginResponse,
  SudoStatus,
  SudoVerifyResponse,
  SudoVerifyResult,
  VerifySudoStepUpRequest,
} from "../../domain/interfaces/ISecurityRepository";

/** Raw API DTO for a registered passkey credential. */
export interface PasskeyListDto {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt?: string | null;
  transports?: string[];
  attachmentMode?: string | null;
  deviceType?: string | null;
  isBackedUp?: boolean;
  isDiscoverable?: boolean;
  aaguid?: string | null;
  modelName?: string | null;
}

/** Raw API DTO for an active workstation session. */
export interface ActiveSessionRawDto {
  id?: string;
  tokenId?: string;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
  isImpersonated?: boolean;
  impersonatorAdminId?: string | null;
  city?: string | null;
  country?: string | null;
}

/** Raw API DTO for a security audit log entry. */
export interface SecurityAuditRawDto {
  id: string;
  eventType: string;
  description?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details?: string | null;
  impersonatedBy?: string | null;
}

/** Maps raw passkey DTO list into `PasskeyCredential[]` domain entities. */
export function mapPasskeyCredentials(dtos?: PasskeyListDto[]): PasskeyCredential[] {
  return (dtos || []).map((d) => ({
    id: d.id,
    deviceName: d.deviceName || "Security Key",
    createdAt: new Date(d.createdAt),
    lastUsedAt: d.lastUsedAt ? new Date(d.lastUsedAt) : null,
    transports: d.transports || [],
    attachmentMode: d.attachmentMode ?? null,
    deviceType: d.deviceType ?? null,
    isBackedUp: d.isBackedUp,
    isDiscoverable: d.isDiscoverable,
    aaguid: d.aaguid,
    modelName: d.modelName,
    credentialIdMasked: `••••••••${d.id.slice(-6)}`,
  }));
}

/** Maps raw Sudo WebAuthn assertion start response into `SudoPasskeyBeginResponse`. */
export function mapSudoPasskeyBegin(raw: Record<string, unknown>): SudoPasskeyBeginResponse {
  return {
    challenge: String(raw?.challenge ?? ""),
    rpId: typeof raw?.rpId === "string" ? raw.rpId : undefined,
    timeout: typeof raw?.timeout === "number" ? raw.timeout : undefined,
    userVerification:
      typeof raw?.userVerification === "string" ? raw.userVerification : undefined,
    challengeToken: String(raw?.challengeToken ?? ""),
    allowCredentials: Array.isArray(raw?.allowCredentials)
      ? (raw.allowCredentials as Array<{ id: string; transports?: string[] }>).map((cred) => ({
          id: String(cred.id),
          type: "public-key" as const,
          transports: Array.isArray(cred.transports) ? cred.transports : undefined,
        }))
      : [],
  };
}

/** Normalizes Sudo status response payload into `SudoStatus`. */
export function mapSudoStatus(raw?: SudoStatus): SudoStatus {
  const mandatoryFactorPolicy = raw?.mandatoryFactorPolicy || "StandardPasswordOrMfa";
  const availableMethods = Array.isArray(raw?.availableMethods) ? raw.availableMethods : [];
  const allowsPasswordFallback =
    typeof raw?.allowsPasswordFallback === "boolean"
      ? raw.allowsPasswordFallback
      : mandatoryFactorPolicy === "StandardPasswordOrMfa" ||
        availableMethods.some((m) => String(m).trim().toLowerCase() === "password");
  return {
    isActive: Boolean(raw?.isActive),
    expiresAtUtc: raw?.expiresAtUtc ?? null,
    methodUsed: raw?.methodUsed ?? null,
    availableMethods,
    mandatoryFactorPolicy,
    allowsPasswordFallback,
    remainingSeconds: Number(raw?.remainingSeconds ?? 0),
  };
}

/** Normalizes Sudo verification response into `SudoVerifyResponse`. */
export function mapSudoVerifyResponse(
  res: SudoVerifyResponse,
  request: VerifySudoStepUpRequest
): SudoVerifyResponse {
  return {
    sudoToken: res.sudoToken,
    expiresAtUtc:
      res.expiresAtUtc ||
      new Date(Date.now() + (res.expiresInSeconds ?? 900) * 1000).toISOString(),
    methodUsed: res.methodUsed || request.method,
    mandatoryFactorPolicy: res.mandatoryFactorPolicy || "StandardPasswordOrMfa",
    expiresInSeconds: res.expiresInSeconds ?? 900,
    verified: res.verified ?? true,
  };
}

/** Normalizes biometric Sudo verification payload into `SudoVerifyResult`. */
export function mapBiometricSudoResult(res: {
  sudoToken: string;
  expiresAt?: string;
  expiresInSeconds?: number;
}): SudoVerifyResult {
  return {
    sudoToken: res.sudoToken,
    expiresInSeconds:
      res.expiresInSeconds ??
      (res.expiresAt
        ? Math.max(1, Math.round((new Date(res.expiresAt).getTime() - Date.now()) / 1000))
        : 300),
  };
}

function detectWorkstationOs(deviceInfo: string): string {
  if (/macintosh|mac os x/i.test(deviceInfo)) return "macOS";
  if (/windows/i.test(deviceInfo)) return "Windows";
  if (/linux/i.test(deviceInfo)) return "Linux";
  return "Desktop";
}

function detectWorkstationBrowser(deviceInfo: string): string {
  if (/chrome/i.test(deviceInfo)) return "Chrome";
  if (/safari/i.test(deviceInfo)) return "Safari";
  if (/firefox/i.test(deviceInfo)) return "Firefox";
  if (/edge/i.test(deviceInfo)) return "Edge";
  return "Browser";
}

/** Maps raw session DTO list into `WorkstationSession[]` domain entities. */
export function mapWorkstationSessions(dtos?: ActiveSessionRawDto[]): WorkstationSession[] {
  return (dtos || []).map((d) => {
    const dev = d.deviceInfo || "Unknown Workstation";
    return {
      id: d.id || d.tokenId || "",
      deviceInfo: dev,
      ipAddress: d.ipAddress || "127.0.0.1",
      createdAt: new Date(d.createdAt),
      expiresAt: new Date(d.expiresAt),
      isCurrent: !!d.isCurrent,
      isImpersonated: !!d.isImpersonated,
      impersonatorAdminId: d.impersonatorAdminId,
      city: d.city,
      country: d.country,
      browser: detectWorkstationBrowser(dev),
      os: detectWorkstationOs(dev),
    };
  });
}

/** Maps raw SOC2 security audit DTOs into `SecurityAuditEntry[]`. */
export function mapSecurityAuditTrail(
  res: SecurityAuditRawDto[] | { items?: SecurityAuditRawDto[] } | undefined
): SecurityAuditEntry[] {
  const dtos = Array.isArray(res) ? res : res?.items || [];
  return dtos.map((d) => ({
    id: d.id,
    eventType: d.eventType || "Security.Event",
    timestamp: new Date(d.timestamp),
    ipAddress: d.ipAddress || "127.0.0.1",
    userAgent: d.userAgent || "Console/1.0",
    isSuccess: !d.eventType.toLowerCase().includes("failed"),
    details: d.details || d.description || null,
    impersonatedBy: d.impersonatedBy,
    rawPayload: d as unknown as Record<string, unknown>,
  }));
}
