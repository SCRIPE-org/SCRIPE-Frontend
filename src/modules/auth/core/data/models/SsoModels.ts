import type { SsoCallbackResult } from "../../domain/entities/SsoProvider";

export interface SsoProviderDto {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  protocol?: string | null;
  iconUrl?: string | null;
  buttonColor?: string | null;
  buttonLabel?: string | null;
  displayOrder?: number | null;
}

export interface SsoChallengeDto {
  authorizationUrl: string;
  codeVerifier: string;
  state: string;
}

export type SsoCallbackResultDto = SsoCallbackResult;
