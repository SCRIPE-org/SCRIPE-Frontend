import { create } from "zustand";

export const SUDO_CANCELLED_ERROR_CODE = "SUDO_CANCELLED" as const;

/**
 * Typed cancellation error rejected into pending sudo elevation waiters when the
 * user cancels the prompt or locks/resets the sudo session mid-challenge.
 */
export class SudoCancelledError extends Error {
  readonly code = SUDO_CANCELLED_ERROR_CODE;

  constructor(message = "Sudo verification was cancelled.") {
    super(message);
    this.name = "SudoCancelledError";
  }
}

const LEGACY_SUDO_CANCELLED_MESSAGES = new Set([
  "Sudo verification was cancelled.",
  "Sudo session locked.",
  "Sudo session reset.",
]);

/**
 * Returns true when `error` represents an intentional user/session cancellation of
 * a step-up sudo challenge so callers suppress spurious error toasts or banners.
 */
export function isSudoCancelledError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof SudoCancelledError) return true;
  if (typeof error === "object") {
    const code = (error as { code?: unknown }).code;
    if (code === SUDO_CANCELLED_ERROR_CODE) return true;
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && LEGACY_SUDO_CANCELLED_MESSAGES.has(msg)) return true;
  }
  return false;
}

export type SudoFactorMethod = "passkey" | "totp" | "password";
export type MandatorySudoPolicy =
  | "PasskeyRequired"
  | "TwoFactorRequired"
  | "StandardPasswordOrMfa";

export interface SudoStatusSnapshot {
  isActive: boolean;
  expiresAtUtc: string | null;
  methodUsed: string | null;
  availableMethods: string[];
  mandatoryFactorPolicy: string;
  allowsPasswordFallback: boolean;
  remainingSeconds: number;
}

export interface SudoVerifiedPayload {
  sudoToken: string;
  expiresAtUtc: string;
  methodUsed: string;
  mandatoryFactorPolicy?: string;
  expiresInSeconds?: number;
}

interface PendingChallengeWaiter {
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}

let pendingWaiters: PendingChallengeWaiter[] = [];

interface SudoState {
  isActive: boolean;
  expiresAtUtc: string | null;
  methodUsed: string | null;
  availableMethods: SudoFactorMethod[];
  mandatoryFactorPolicy: MandatorySudoPolicy;
  allowsPasswordFallback: boolean;
  sudoToken: string | null;
  modalOpen: boolean;
  isOnDemandChallenge: boolean;
  statusLoaded: boolean;
  error: string | null;

  hydrateStatus: (status: SudoStatusSnapshot) => void;
  syncFromAccountContext: (sudoActive: boolean, expiresAtUtc: string | null) => void;
  markVerified: (payload: SudoVerifiedPayload) => void;
  markLocked: () => void;
  openModal: () => void;
  closeModal: () => void;
  setError: (error: string | null) => void;
  /** Requests step-up elevation; pass `forceChallenge: true` after a server 403 SudoRequired rejection to clear stale elevation state and re-prompt. */
  requestElevation: (options?: { forceChallenge?: boolean }) => Promise<string>;
  /** Returns true when sudo elevation is active (in-memory token or cookie-backed) and unexpired. */
  isSessionElevated: () => boolean;
  /** Returns the in-memory X-Sudo-Token header value when present and unexpired (null when cookie-backed after reload). */
  getValidSudoToken: () => string | null;
  reset: () => void;
}

function normalizeMethods(raw: string[] | undefined | null): SudoFactorMethod[] {
  if (!Array.isArray(raw)) return [];
  const valid: SudoFactorMethod[] = [];
  for (const item of raw) {
    const normalized = String(item).trim().toLowerCase();
    if (
      (normalized === "passkey" || normalized === "totp" || normalized === "password") &&
      !valid.includes(normalized)
    ) {
      valid.push(normalized);
    }
  }
  return valid;
}

function normalizePolicy(raw: string | undefined | null): MandatorySudoPolicy {
  if (raw === "PasskeyRequired" || raw === "TwoFactorRequired") {
    return raw;
  }
  return "StandardPasswordOrMfa";
}

function isTokenExpired(expiresAtUtc: string | null): boolean {
  if (!expiresAtUtc) return false;
  const ms = Date.parse(expiresAtUtc);
  if (Number.isNaN(ms)) return false;
  return ms <= Date.now();
}

export const useSudoStore = create<SudoState>((set, get) => ({
  isActive: false,
  expiresAtUtc: null,
  methodUsed: null,
  availableMethods: [],
  mandatoryFactorPolicy: "StandardPasswordOrMfa",
  allowsPasswordFallback: true,
  sudoToken: null,
  modalOpen: false,
  isOnDemandChallenge: false,
  statusLoaded: false,
  error: null,

  hydrateStatus: (status) => {
    const expired = isTokenExpired(status.expiresAtUtc);
    const hasPositiveRemaining =
      status.remainingSeconds === undefined || status.remainingSeconds > 0;
    const active = Boolean(status.isActive && !expired && hasPositiveRemaining);
    set((state) => ({
      isActive: active,
      expiresAtUtc: active ? status.expiresAtUtc : null,
      methodUsed: active ? status.methodUsed : null,
      availableMethods: normalizeMethods(status.availableMethods),
      mandatoryFactorPolicy: normalizePolicy(status.mandatoryFactorPolicy),
      allowsPasswordFallback: Boolean(status.allowsPasswordFallback),
      sudoToken: active ? state.sudoToken : null,
      statusLoaded: true,
    }));
  },

  syncFromAccountContext: (sudoActive, expiresAtUtc) => {
    const expired = isTokenExpired(expiresAtUtc);
    const active = Boolean(sudoActive && !expired);
    set((state) => ({
      isActive: active,
      expiresAtUtc: active ? expiresAtUtc : null,
      methodUsed: active ? state.methodUsed : null,
      sudoToken: active ? state.sudoToken : null,
    }));
  },

  markVerified: (payload) => {
    const waiters = [...pendingWaiters];
    pendingWaiters = [];
    set({
      isActive: true,
      expiresAtUtc: payload.expiresAtUtc,
      methodUsed: payload.methodUsed,
      mandatoryFactorPolicy: normalizePolicy(
        payload.mandatoryFactorPolicy ?? get().mandatoryFactorPolicy
      ),
      sudoToken: payload.sudoToken,
      modalOpen: false,
      isOnDemandChallenge: false,
      error: null,
    });
    for (const waiter of waiters) {
      waiter.resolve(payload.sudoToken);
    }
  },

  markLocked: () => {
    const waiters = [...pendingWaiters];
    pendingWaiters = [];
    set({
      isActive: false,
      expiresAtUtc: null,
      methodUsed: null,
      sudoToken: null,
      modalOpen: false,
      isOnDemandChallenge: false,
      error: null,
    });
    for (const waiter of waiters) {
      waiter.reject(new SudoCancelledError("Sudo session locked."));
    }
  },

  openModal: () =>
    set({
      modalOpen: true,
      error: null,
    }),

  closeModal: () => {
    const waiters = [...pendingWaiters];
    pendingWaiters = [];
    set({
      modalOpen: false,
      isOnDemandChallenge: false,
      error: null,
    });
    for (const waiter of waiters) {
      waiter.reject(new SudoCancelledError("Sudo verification was cancelled."));
    }
  },

  setError: (error) => set({ error }),

  requestElevation: (options) => {
    const current = get();
    if (options?.forceChallenge) {
      set({
        isActive: false,
        expiresAtUtc: null,
        methodUsed: null,
        sudoToken: null,
      });
    } else {
      const existingToken = current.getValidSudoToken();
      if (existingToken) {
        return Promise.resolve(existingToken);
      }
    }

    return new Promise<string>((resolve, reject) => {
      pendingWaiters.push({ resolve, reject });
      set({
        modalOpen: true,
        isOnDemandChallenge: true,
        error: null,
      });
    });
  },

  isSessionElevated: () => {
    const { isActive, expiresAtUtc } = get();
    if (!isActive) return false;
    if (isTokenExpired(expiresAtUtc)) {
      set({ isActive: false, expiresAtUtc: null, methodUsed: null, sudoToken: null });
      return false;
    }
    return true;
  },

  getValidSudoToken: () => {
    const { isActive, expiresAtUtc, sudoToken } = get();
    if (!isActive) return null;
    if (isTokenExpired(expiresAtUtc)) {
      set({ isActive: false, expiresAtUtc: null, methodUsed: null, sudoToken: null });
      return null;
    }
    return sudoToken;
  },

  reset: () => {
    const waiters = [...pendingWaiters];
    pendingWaiters = [];
    set({
      isActive: false,
      expiresAtUtc: null,
      methodUsed: null,
      availableMethods: [],
      mandatoryFactorPolicy: "StandardPasswordOrMfa",
      allowsPasswordFallback: true,
      sudoToken: null,
      modalOpen: false,
      isOnDemandChallenge: false,
      statusLoaded: false,
      error: null,
    });
    for (const waiter of waiters) {
      waiter.reject(new SudoCancelledError("Sudo session reset."));
    }
  },
}));
