// Locale pack — navigation.
// Owns the sidebar/rail item labels, the section groupings and the landmark
// names announced to screen readers. Filled as the navigation config is
// drained out of the historical inline block in core/locales/{en,ar}.ts.
//
// The pack merges OVER that block, and deepMerge is recursive, so extending
// `navigation` here keeps the searchPlaceholder/togglePanel keys still living
// in en.ts intact rather than clobbering the namespace.

export const en = {
  navigation: {
    topbar: {
      // Both of these label an icon-only chevron whose menu already renders the
      // same word as its heading — one string, two duties, so it lives once.
      workspacesMenu: "Workspaces",
      sectionsMenu: "Sections",
    },
  },
} as const;

export const ar = {
  navigation: {
    topbar: {
      workspacesMenu: "مساحات العمل",
      sectionsMenu: "الأقسام",
    },
  },
} as const;
