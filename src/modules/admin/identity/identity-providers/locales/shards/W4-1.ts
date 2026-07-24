/**
 * Copy for the design-bar remediation pass over the identity-providers
 * presentation layer (SSO button preview, provider card/gallery/stats,
 * callback URL card).
 *
 * `copiedTitle` fills a toast title that previously fell back to the
 * non-existent core key `common.copied` via `t(...) || "English"` — the
 * fallback always rendered because the key was missing, so every "copied"
 * toast in this module shipped hardcoded English even in the Arabic build.
 */
export const en = {
  identityProviders: {
    copiedTitle: "Copied to Clipboard",
  },
} as const;

export const ar = {
  identityProviders: {
    copiedTitle: "تم النسخ إلى الحافظة",
  },
} as const;
