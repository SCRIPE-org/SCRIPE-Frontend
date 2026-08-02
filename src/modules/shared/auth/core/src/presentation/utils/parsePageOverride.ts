/**
 * parsePageOverride — extracts per-page layout/headline/subtitle
 * from LoginBrandingJson.pages[pageKey].
 *
 * Used by ForgotPasswordView and ResetPasswordView to apply
 * page-specific overrides from the studio branding configuration.
 */

export interface PageOverride {
  layout?: string;
  headline?: string;
  subtitle?: string;
}

/**
 * Exported function defining parameters and fields for parse page override configurations.
 */
export function parsePageOverride(
  loginBrandingJson: string | null | undefined,
  pageKey: string
): PageOverride | null {
  if (!loginBrandingJson) return null;
  try {
    const parsed = JSON.parse(loginBrandingJson);
    return parsed.pages?.[pageKey] ?? null;
  } catch {
    return null;
  }
}
