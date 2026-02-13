/**
 * Active Session Entity
 *
 * Domain entity representing a single active login session.
 */
export interface ActiveSession {
      tokenId: string;
      deviceInfo: string;
      ipAddress: string;
      createdAt: Date;
      expiresAt: Date;
      isCurrent: boolean;
}
