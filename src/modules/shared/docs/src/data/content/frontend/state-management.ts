// FILE-EXCEPTION: static documentation content
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "frontend.stateManagement.intro" },

  // ─── State Categories ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.stateManagement.categoriesTitle",
    id: "categories",
  },
  {
    type: "flowchart",
    title: "State Management Architecture",
    direction: "vertical",
    nodes: [
      {
        id: "server",
        label: "Server State (TanStack Query v5)",
        type: "primary",
        description: "API data: admins, users, tenants, roles, etc.",
      },
      {
        id: "global",
        label: "Global UI State (Zustand)",
        type: "warning",
        description: "Auth, sidebar, theme, toasts",
      },
      {
        id: "local",
        label: "Local Component State (useState)",
        type: "success",
        description: "Form inputs, modals, toggles",
      },
      {
        id: "lang",
        label: "Language State (LanguageProvider)",
        type: "info",
        description: "Arabic/English, RTL/LTR, translations",
      },
    ],
    connections: [],
  },
  {
    type: "table",
    headers: ["State Type", "Tool", "Location", "Persistence"],
    rows: [
      [
        "Server Data",
        "TanStack Query v5",
        "ViewModels",
        "In-memory cache (configurable staleTime)",
      ],
      ["Auth/Session", "Zustand + persist", "@core/store", "localStorage"],
      ["Theme/Sidebar", "Zustand", "@core/store", "Optional"],
      ["Toasts", "Zustand", "@core/store", "None"],
      ["Language", "LanguageProvider", "@core/providers", "localStorage"],
      ["Form Inputs", "useState / React Hook Form", "Components", "None"],
      ["Modal/Toggle", "useState", "Components", "None"],
    ],
  },

  // ─── TanStack Query ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.stateManagement.tanstackTitle",
    id: "tanstack-query",
  },
  { type: "paragraph", contentKey: "frontend.stateManagement.tanstackIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "Query Key Factory Pattern",
    code: `// Consistent query key structure for cache management
/**
 * Exported constant defining parameters and fields for admin keys configurations.
 */
export const adminKeys = {
  all:     ["admins"] as const,
  lists:   ()           => [...adminKeys.all, "list"] as const,
  list:    (filters: F)  => [...adminKeys.lists(), filters] as const,
  details: ()           => [...adminKeys.all, "detail"] as const,
  detail:  (id: string) => [...adminKeys.details(), id] as const,
};

// Usage in ViewModel
const { data, isLoading } = useQuery({
  queryKey: adminKeys.list({ page, search, sortBy, sortDir }),
  queryFn: () => adminRepo.getAll({ page, search, sortBy, sortDir }),
  staleTime: 2 * 60 * 1000,  // 2 min
});

// Invalidation after mutation
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: adminKeys.all });`,
  },
  {
    type: "code",
    language: "typescript",
    filename: "query-client.ts — Global Query Cache Configuration",
    code: `import { QueryClient } from "@tanstack/react-query";

/**
 * Documentation for QueryClient
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,    // 2 minutes query cache freshness
      refetchOnWindowFocus: false, // Prevents background query spam
      retry: 1,                    // Fail fast on network interruption
    },
  },
});`,
  },

  // ─── Mutations ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.stateManagement.mutationsTitle",
    id: "mutations",
  },
  {
    type: "code",
    language: "typescript",
    filename: "Mutation Pattern with Cache Invalidation",
    code: `export function useCreateAdmin() {
  const queryClient = useQueryClient();
  const repo = container.adminRepository;
  const { t } = Language();

  return useMutation({
    mutationFn: async (data: CreateAdminInput) => {
      const result = await repo.create(data);
      if (result.isErr()) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      // Invalidate all admin queries to refetch
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(t("admins.createSuccess"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}`,
  },

  // ─── Zustand Stores ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.stateManagement.zustandTitle",
    id: "zustand",
  },
  { type: "paragraph", contentKey: "frontend.stateManagement.zustandIntro" },
  {
    type: "table",
    headers: ["Store", "Purpose", "Persisted?"],
    rows: [
      [
        "useAppStore",
        "User session, permissions, roles, sidebar status, density setting, tenant context",
        "Yes (localStorage, partialized)",
      ],
      [
        "useCurrencyPreference",
        "Preferred display currency and converting rules",
        "Yes (only display mode setting)",
      ],
      ["useToastStore", "Toast notification queue (auto-dismiss)", "No"],
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "App Store State & Actions",
        language: "typescript",
        filename: "useAppStore.ts — Core Interface",
        code: `interface AppState {
  // Sidebar State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // UI Density
  density: "compact" | "comfortable" | "spacious";
  setDensity: (density: "compact" | "comfortable" | "spacious") => void;

  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  permissions: PermissionCode[];
  roles: AdminRole[];
  restrictedFields: Record<string, string[]>;
  setAuth: (user: User, permissions: PermissionCode[], roles: AdminRole[], isFreshLogin?: boolean) => void;
  logout: () => void;

  // Tenant & Subscription Info
  tenantCode: string | null;
  setTenantCode: (code: string | null) => void;
  editionName: string | null;
  subscriptionStatus: string | null;

  // Hydration State
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}`,
      },
      {
        label: "Persist & Hydration Config",
        language: "typescript",
        filename: "useAppStore.ts — Persist Middleware",
        code: `persist(
  (set) => ({ ... }),
  {
    name: "app-storage",
    // 1. Partialize: excludes in-memory tokens, keeps user hints and layout config
    partialize: (state) => ({
      sidebarOpen: state.sidebarOpen,
      density: state.density,
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      permissions: state.permissions,
      roles: state.roles,
      tenantCode: state.tenantCode,
      subscriptionStatus: state.subscriptionStatus,
      editionName: state.editionName,
      mustChangePassword: state.mustChangePassword,
      defaultRedirectPath: state.defaultRedirectPath,
    }),
    // 2. Hydration Sync: prevents flashing of server-rendered components
    onRehydrateStorage: () => (state) => {
      state?.setHasHydrated(true);
    },
  }
)`,
      },
    ],
  },

  // ─── LanguageProvider ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.stateManagement.languageTitle",
    id: "language",
  },
  { type: "paragraph", contentKey: "frontend.stateManagement.languageIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "Language() Hook — API",
    code: `const {
  language,      // 'en' | 'ar'
  direction,     // 'ltr' | 'rtl'
  setLanguage,   // (lang: 'en' | 'ar') => void
  t,             // (key: string, vars?: Record<string, string>) => string
} = Language();

// Usage:
t('common.save');                           // "Save"
t('errors.minLength', { min: '8' });        // "Must be at least 8 characters"

// RTL-aware styling:
<div className={direction === 'rtl' ? 'text-right' : 'text-left'}>`,
  },

  // ─── Anti-Patterns ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.stateManagement.antiPatternsTitle",
    id: "anti-patterns",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "frontend.stateManagement.antiPatternsDont",
        variant: "negative",
        items: [
          "Store API data in Zustand (useEffect + fetch → Zustand setState)",
          "Prop-drill sidebar/theme state through 5+ components",
          "Use [locale] file-based routing for i18n",
          "Create new Zustand stores per module",
        ],
      },
      {
        titleKey: "frontend.stateManagement.antiPatternsDo",
        variant: "positive",
        items: [
          "Use TanStack Query for all server-state (useQuery + useQueryClient)",
          "Access Zustand directly where needed (useScripetore())",
          "Use LanguageProvider + t() function with localStorage persistence",
          "Use hooks + TanStack Query per module; Zustand only for global UI",
        ],
      },
    ],
  },
];

registerPage({
  slug: "frontend/state-management",
  titleKey: "frontend.stateManagement.title",
  descriptionKey: "frontend.stateManagement.description",
  category: "frontend",
  order: 3,
  sections,
  relatedSlugs: ["frontend/crud-system", "architecture/frontend", "frontend/localization"],
  lastUpdated: "2026-02-20",
});
