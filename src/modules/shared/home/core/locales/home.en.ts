export const en = {
  workspaceHub: {
    title: "Overview",
    // Stable label for the standalone Hub route's ModuleErrorBoundary —
    // resolved via t(), distinct from `title` above (the in-app Overview
    // heading), so the workspace-picker crash screen names itself correctly.
    hubTitle: "Workspace Hub",
    greeting: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    subtitle: "Your apps & workspaces — pick up where you left off.",
    search: {
      placeholder: "Search apps, modules, settings, people…",
      focusHint: "to focus",
    },
    jumpTo: "Jump to anything",
    topbar: {
      appSwitcher: "App switcher",
      notifications: "Notifications",
      ownerOf: "Owner · {{tenant}}",
    },
    pin: {
      pin: "Pin",
      unpin: "Unpin",
    },
    sections: {
      pinned: "Pinned",
      modules: "Your modules",
      administration: "Administration",
      upgrade: "Available to Upgrade",
    },
    pinned: {
      manage: "Manage",
      apps_one: "1 app",
      apps_other: "{{count}} apps",
    },
    modules: {
      licensed: "{{count}} of {{total}} licensed",
      sortLabel: "Sorted by usage",
    },
    admin: {
      subtitle: "Owner-only workspaces",
    },
    upgradeBadge: "Upgrade",
    upgradeRequired: "Upgrade Required",
    needsTenant: "Select a Tenant",
    status: {
      operational: "All systems operational",
    },
    today: {
      title: "Today",
      actions: "actions across",
      modules_one: "1 module",
      modules_other: "{{count}} modules",
      vsYesterday: "vs. yesterday",
    },
    recent: {
      title: "Recent",
      empty: "No recent activity",
      hoursAgo: "{{count}} hours ago",
      yesterday: "Yesterday",
      daysAgo: "{{count}} days ago",
    },
    footer: {
      whatsNew: "What's new",
      docs: "Docs",
      status: "Status",
      brandLine: "{{brand}} · {{version}} · Tenant: {{tenant}}",
    },
    items: {
      one: "1 item",
      two: "{{count}} items",
      few: "{{count}} items",
      many: "{{count}} items",
      other: "{{count}} items",
    },
    noResults: "No apps match your search",
    emptyState: "No modules available. Contact your administrator.",
  },
};
