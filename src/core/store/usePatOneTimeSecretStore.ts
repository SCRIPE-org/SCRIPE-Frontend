import { create } from "zustand";

/**
 * Volatile in-memory one-time Personal Access Token secret receipt.
 * Deliberately excludes `persist` middleware so plaintext credentials never touch local/session storage.
 */
export interface PatOneTimeSecretReceipt {
  tokenId: string;
  tokenName: string;
  plainTextSecret: string;
  fingerprintOrPrefix: string;
  isRotated: boolean;
  /** Bound owner user ID so a receipt can never render for another user after account switch. */
  ownerUserId?: string | null;
}

interface PatOneTimeSecretState {
  pendingReceipt: PatOneTimeSecretReceipt | null;
  setPendingReceipt: (receipt: PatOneTimeSecretReceipt) => void;
  clearPendingReceipt: () => void;
}

/**
 * Ephemeral in-memory Zustand hook holding a newly minted or rotated PAT secret
 * across route transitions so the GitHub-style one-time banner can render cleanly without storage persistence.
 */
export const usePatOneTimeSecretStore = create<PatOneTimeSecretState>((set) => ({
  pendingReceipt: null,
  setPendingReceipt: (pendingReceipt) => set({ pendingReceipt }),
  clearPendingReceipt: () => set({ pendingReceipt: null }),
}));
