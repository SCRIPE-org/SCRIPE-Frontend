export interface ExternalLogin {
      id: string;
      providerName: string;
      providerKey: string;
      email: string | null;
      displayName: string | null;
      linkedAt: Date;
      lastUsedAt: Date | null;
}
