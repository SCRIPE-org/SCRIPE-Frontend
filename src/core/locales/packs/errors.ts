/**
 * Errors locale pack — the crash, boundary and plugin-host surfaces.
 *
 * These strings live outside core/en.ts and core/ar.ts because they belong to
 * components, not to a feature module: an error boundary can fire under any
 * route, so its copy cannot sit in the locale bundle of whichever module
 * happened to throw.
 *
 * Registered by name in `packs/index.ts`. Both languages ship in the same
 * edit; an EN-only key is a shipped defect in a bilingual product.
 */

export const en = {
  errors: {
    module: {
      // {module} is resolved through t() by the caller, so a route wrapper
      // passes a dot-key and gets a translated section name here.
      description: "{module} could not be loaded. The rest of the app is unaffected.",
      // Used when a boundary was mounted without naming what it guards.
      unnamed: "This section",
    },
    plugin: {
      frameTitle: "{plugin} plugin",
      missingUrl: "This plugin has no interface",
      missingUrlHint:
        "A workspace administrator has to set the plugin's frontend URL before it can open here.",
      frameFailed: "The plugin's interface failed to load.",
      loadFailed: "The “{plugin}” plugin could not be loaded.",
    },
  },
};

export const ar = {
  errors: {
    module: {
      description: "تعذّر تحميل {module}. لم يتأثر باقي التطبيق.",
      unnamed: "هذا القسم",
    },
    plugin: {
      frameTitle: "إضافة {plugin}",
      missingUrl: "لا توجد واجهة لهذه الإضافة",
      missingUrlHint: "على مسؤول مساحة العمل تحديد رابط واجهة الإضافة قبل أن تُفتح هنا.",
      frameFailed: "تعذّر تحميل واجهة الإضافة.",
      loadFailed: "تعذّر تحميل إضافة “{plugin}”.",
    },
  },
};
