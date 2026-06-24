/**
 * Domain model representing a External Login structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ExternalLogin {
  id: string;
  providerName: string;
  providerKey: string;
  email: string | null;
  displayName: string | null;
  linkedAt: Date;
  lastUsedAt: Date | null;
}
