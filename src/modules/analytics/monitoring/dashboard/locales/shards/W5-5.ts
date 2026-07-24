/**
 * Copy added while normalizing the dashboard security/monitoring charts onto
 * the nx token + composition contract: the recent-changes feed's system-user
 * fallback, the event-distribution "N more" overflow line, and the security
 * events list's "Last: <date>" caption — all previously hardcoded English.
 *
 * Keys deepMerge onto `dashboard.recentChanges.*` / `dashboard.eventDistribution.*` /
 * `dashboard.securityEvents.*` from `../dashboard.en` / `../dashboard.ar`;
 * siblings there are untouched.
 */
export const en = {
  dashboard: {
    recentChanges: {
      // Fallback label when a change has no attributed user (an automated
      // or system-originated modification).
      systemUser: "System",
    },
    eventDistribution: {
      moreCount: "+{count} more",
    },
    securityEvents: {
      lastOccurrence: "Last: {date}",
    },
  },
} as const;

export const ar = {
  dashboard: {
    recentChanges: {
      systemUser: "النظام",
    },
    eventDistribution: {
      moreCount: "+{count} أخرى",
    },
    securityEvents: {
      lastOccurrence: "آخر: {date}",
    },
  },
} as const;
