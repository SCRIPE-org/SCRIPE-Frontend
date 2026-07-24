/**
 * Copy added while normalizing the security dashboard charts onto the nx
 * token + composition contract: the failed-logins heatmap's series label
 * (moved off a module-scope constant so it can actually be translated) and
 * the security timeline's success/failure badge accessible names.
 *
 * Keys deepMerge onto `security.failedLogins.*` / `security.timeline.*` from
 * `../security.en` / `../security.ar`; siblings there are untouched.
 */
export const en = {
  security: {
    failedLogins: {
      seriesLabel: "Failed Logins",
    },
    timeline: {
      // Accessible names for the success/failure badge glyph — the visible
      // mark is a unicode check/cross, which is not reliably announced or
      // translated on its own.
      success: "Successful",
      failed: "Failed",
    },
  },
} as const;

export const ar = {
  security: {
    failedLogins: {
      // Matches the established phrase used elsewhere for this exact
      // concept (dashboard.kpi.failedLogins).
      seriesLabel: "تسجيلات الدخول الفاشلة",
    },
    timeline: {
      success: "ناجح",
      failed: "فاشل",
    },
  },
} as const;
