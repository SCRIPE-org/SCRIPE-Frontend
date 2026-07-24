// Locale pack — the nexus shell.
// Owns the topbar, the workspace rail, the app launcher and the shell's own
// dialogs. Anything the user reads before a route renders belongs here.
//
// These surfaces used to carry their copy as inline `language === "ar" ? … : …`
// ternaries, which put two languages inside a JSX expression and made a
// half-translated string invisible at review time. The workspace loader had
// already lost that argument: its "Launching" label shipped English-only into
// the Arabic build, on the one screen a user stares at with nothing else on it.

export const en = {
  shell: {
    launcher: {
      title: "App Launcher",
      description: "Switch between workspaces and modules",
      searchPlaceholder: "Search workspaces...",
      clearSearch: "Clear search",
      sections: {
        administration: "Administration",
        modules: "Modules",
      },
      empty: {
        title: "No workspaces found",
        description: "Try a different search term.",
      },
      legend: {
        active: "Active",
        pinned: "Pinned",
        locked: "Locked",
        comingSoon: "Coming Soon",
      },
      pin: "Pin workspace",
      unpin: "Unpin workspace",
      upgrade: {
        title: "Upgrade Required",
        description:
          "“{name}” is not included in your current plan. Upgrade your plan to unlock this module.",
        cta: "Upgrade Plan",
      },
      selectTenant: {
        title: "Select a Tenant",
        description:
          "“{name}” requires a tenant context. Go to the Tenants list and open a tenant first.",
        cta: "Go to Tenants",
      },
    },
    workspaceLoader: {
      /** Meta label above the workspace name — a state, not a sentence. */
      launching: "Launching",
      /** The announced name of the whole overlay. */
      launchingNamed: "Launching {name}",
    },
  },
} as const;

export const ar = {
  shell: {
    launcher: {
      title: "مشغّل التطبيقات",
      description: "تنقل بين مساحات العمل والوحدات",
      searchPlaceholder: "ابحث عن مساحة عمل...",
      clearSearch: "مسح البحث",
      sections: {
        administration: "الإدارة",
        modules: "الوحدات",
      },
      empty: {
        title: "لا توجد مساحات عمل",
        description: "جرّب مصطلح بحث آخر.",
      },
      legend: {
        active: "نشط",
        pinned: "مثبّت",
        locked: "مقفل",
        comingSoon: "قريباً",
      },
      pin: "تثبيت مساحة العمل",
      unpin: "إلغاء تثبيت مساحة العمل",
      upgrade: {
        title: "ترقية مطلوبة",
        description: "«{name}» غير مضمّنة في خطتك الحالية. قم بالترقية لفتح هذه الوحدة.",
        cta: "ترقية الآن",
      },
      selectTenant: {
        title: "اختر مستأجراً",
        description: "«{name}» تتطلب سياق مستأجر. انتقل إلى قائمة المستأجرين وافتح مستأجراً أولاً.",
        cta: "انتقل إلى المستأجرين",
      },
    },
    workspaceLoader: {
      launching: "جارٍ الفتح",
      launchingNamed: "جارٍ فتح {name}",
    },
  },
} as const;
