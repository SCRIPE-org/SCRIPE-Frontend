// Locale pack — cross-cutting app chrome.
// Owns the strings that ride above every route regardless of shell: banners,
// switchers, toasts and the global error surface.
//
// These widgets used to reach into whichever module pack happened to hold a
// close-enough key (`admin.impersonating`, `tenant.context`) and guard the call
// with `|| "English fallback"`. That pattern hides two defects at once: the
// Arabic build silently renders the English fallback when the borrowed module's
// pack is not in the merged dictionary, and the fallback itself never reaches a
// translator. Core chrome owns its own copy here, and no call site carries a
// `||` fallback — a missing key must be visible, not papered over.

export const en = {
  chrome: {
    theme: {
      /** Accessible name of the toggle, phrased as the action it performs. */
      toLight: "Switch to light mode",
      toDark: "Switch to dark mode",
    },
    language: {
      change: "Change language",
      /**
       * The switcher's own pill label. It names the language currently in use,
       * and `t()` already resolves in that language — so this key needs no
       * lookup by code, it is simply the active pack's answer.
       */
      short: "EN",
      // Endonyms. A language picker names each language IN that language, so a
      // reader who cannot read the current UI language can still find their
      // own — which is why these two are identical in both packs rather than
      // translated. Same principle as a brand wordmark: it is a name, not copy.
      arabicNative: "العربية (مصر)",
      englishNative: "English (US)",
    },
    search: {
      /** The field's accessible name. The placeholder is a hint, not a name. */
      label: "Search",
    },
    section: {
      locked: "Locked",
      itemCount: "{count} items",
    },
    tenantBanner: {
      impersonating: "Impersonating user",
      /** Fuller accessible name; contains the visible "Stop" label verbatim. */
      stopImpersonation: "Stop impersonating",
      tenantContext: "Tenant context",
      /** Fuller accessible name; contains the visible "Exit" label verbatim. */
      exitTenantContext: "Exit tenant context",
    },
  },
} as const;

export const ar = {
  chrome: {
    theme: {
      toLight: "التبديل إلى الوضع الفاتح",
      toDark: "التبديل إلى الوضع الداكن",
    },
    language: {
      change: "تغيير اللغة",
      short: "عربي",
      arabicNative: "العربية (مصر)",
      englishNative: "English (US)",
    },
    search: {
      label: "بحث",
    },
    section: {
      locked: "مقفل",
      itemCount: "{count} عنصر",
    },
    tenantBanner: {
      impersonating: "انتحال شخصية مستخدم",
      // Must contain the visible button label ("ايقاف") verbatim, matching the
      // existing spelling of common.stop.
      stopImpersonation: "ايقاف انتحال الشخصية",
      tenantContext: "سياق المستأجر",
      // Must contain the visible button label ("خروج") verbatim.
      exitTenantContext: "خروج من سياق المستأجر",
    },
  },
} as const;
