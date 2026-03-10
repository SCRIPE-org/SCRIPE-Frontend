/**
 * OIDC (OpenID Connect) Configuration Keys
 *
 * Centralized list of standard and custom OIDC parameters used during
 * the authorization and consent flows.
 */

export const OIDC_KEYS = {
      // Standard OAuth2 / OIDC Parameters
      CLIENT_ID: "client_id",
      REDIRECT_URI: "redirect_uri",
      RESPONSE_TYPE: "response_type",
      SCOPE: "scope",
      STATE: "state",
      NONCE: "nonce",
      RESPONSE_MODE: "response_mode",
      PROMPT: "prompt",
      LOGIN_HINT: "login_hint",
      ACR_VALUES: "acr_values",

      // PKCE (Proof Key for Code Exchange) Parameters
      CODE_CHALLENGE: "code_challenge",
      CODE_CHALLENGE_METHOD: "code_challenge_method",

      // Custom NEXORA Parameters
      CONSENT_TICKET: "consent_ticket",
} as const;

/**
 * Array of allowed OIDC parameters that can be securely forwarded
 * from the SPA's consent screen back to the purely backend `/connect/authorize` endpoint.
 */
export const ALLOWED_OIDC_PARAMS = Object.values(OIDC_KEYS);
