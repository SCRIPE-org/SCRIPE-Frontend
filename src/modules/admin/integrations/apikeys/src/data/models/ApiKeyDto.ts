/**
 * Documentation for module export
 */
export interface ApiKeyDto {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  expiresAt: string | null;
  revokedAt: string | null;
  isActive: boolean;
  createdAt: string;
}
