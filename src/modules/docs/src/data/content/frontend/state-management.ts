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
 * Constant definition representing admin keys.
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
  staleTime: 5 * 60 * 1000,  // 5 min
});

// Invalidation after mutation
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: adminKeys.all });`,
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
      ["useAuthStore", "User session, tokens, permissions, impersonation", "Yes (localStorage)"],
      ["useUIStore", "Sidebar open/collapsed, theme, mobile state", "Optional"],
      ["useToastStore", "Toast notification queue (auto-dismiss)", "No"],
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Auth Store",
        language: "typescript",
        filename: "useAuthStore.ts — Key Interface",
        code: `interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  originalUser: User | null;
  
  // Actions
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  startImpersonation: (targetUser: User, token: string) => void;
  stopImpersonation: () => void;
}`,
      },
      {
        label: "UI Store",
        language: "typescript",
        filename: "useUIStore.ts — Sidebar & Theme",
        code: `interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  isMobile: boolean;
  
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setIsMobile: (isMobile: boolean) => void;
}`,
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
          "Access Zustand directly where needed (useUIStore())",
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
