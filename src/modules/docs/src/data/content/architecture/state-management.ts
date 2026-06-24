import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "architecture.stateManagement.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.stateManagement.decisionTitle",
    id: "decision-matrix",
  },
  {
    type: "table",
    headers: ["Question", "Answer: YES → Use", "Example"],
    rows: [
      [
        "Does it come from an API?",
        "TanStack Query v5",
        "Employee list, audit logs, dashboard stats",
      ],
      ["Does the whole app need it?", "Zustand", "Auth state, sidebar, theme, toasts"],
      ["Is it for this component only?", "useState", "Form inputs, modal open/close, toggles"],
      [
        "Does it need persistence?",
        "Zustand with persist middleware",
        "Auth token, language preference",
      ],
      [
        "Does it need caching/refetch?",
        "TanStack Query",
        "Any server data with stale-while-revalidate",
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.stateManagement.tanstackTitle",
    id: "tanstack-query",
  },
  { type: "paragraph", contentKey: "architecture.stateManagement.tanstackIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "TanStack Query — ViewModel Pattern",
    code: `// Key factory for consistent cache keys
/**
 * Constant definition representing employee keys.
 */
export const employeeKeys = {
  all: ["employees"] as const,
  list: (filters: { page: number; search: string }) =>
    [...employeeKeys.all, "list", filters] as const,
  detail: (id: string) =>
    [...employeeKeys.all, "detail", id] as const,
};

// Query hook
/**
 * React hook/ViewModel managing logic, state, and repository queries for employees.
 */
export function useEmployees(filters: { page: number; search: string }) {
  const repo = container.employeeRepository;

  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: async () => {
      const result = await repo.getAll(filters);
      if (result.isErr()) throw result.error;
      return result.value;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation hook (auto-invalidates cache)
/**
 * React hook/ViewModel managing logic, state, and repository queries for create employee.
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmployeeInput) => {
      const result = await container.employeeRepository.create(data);
      if (result.isErr()) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}`,
    highlightLines: [2, 15, 36],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.stateManagement.zustandTitle",
    id: "zustand",
  },
  { type: "paragraph", contentKey: "architecture.stateManagement.zustandIntro" },
  {
    type: "table",
    headers: ["Store", "Purpose", "Persistence", "Location"],
    rows: [
      [
        "useAuthStore",
        "User session, tokens, permissions",
        "localStorage (persist)",
        "@core/store/useAuthStore",
      ],
      ["useUIStore", "Sidebar, theme, mobile menu", "None", "@core/store/useUIStore"],
      ["useToastStore", "Toast notification queue", "None", "@core/store/useToastStore"],
    ],
  },
  {
    type: "code",
    language: "typescript",
    filename: "Auth Store — Zustand with persist",
    code: `export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({
        user, token, isAuthenticated: true,
      }),

      logout: () => set({
        user: null, token: null, isAuthenticated: false,
      }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);`,
    highlightLines: [2, 17, 18, 19, 20],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.stateManagement.antiPatternsTitle",
    id: "anti-patterns",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "architecture.stateManagement.doTitle",
        variant: "positive",
        items: [
          "Use TanStack Query for ALL server data",
          "Access Zustand stores directly where needed",
          "Use useState for component-local state",
          "Let TanStack Query handle caching & refetching",
          "Use key factories for consistent cache keys",
        ],
      },
      {
        titleKey: "architecture.stateManagement.dontTitle",
        variant: "negative",
        items: [
          "DON'T put server data in Zustand",
          "DON'T prop-drill global state through 5+ components",
          "DON'T use useEffect+fetch for API calls",
          "DON'T create manual cache invalidation",
          "DON'T mix concerns in a single hook",
        ],
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.stateManagement.localizationTitle",
    id: "localization",
  },
  { type: "paragraph", contentKey: "architecture.stateManagement.localizationIntro" },
  {
    type: "table",
    headers: ["Feature", "Implementation", "Details"],
    rows: [
      ["Language Switching", "LanguageProvider context", "Cookie/localStorage, NOT URL-based"],
      ["RTL/LTR Support", "Auto-set dir + lang on <html>", "Arabic: RTL, all others: LTR"],
      ["Font Classes", "font-arabic / font-english on <body>", "Auto-applied on switch"],
      ["Dot-Notation Keys", "t('common.save')", "Nested dictionary access"],
      ["Interpolation", "t('errors.minLength', { min: 5 })", "{{min}} placeholder replacement"],
      ["SSR Fallback", "Returns key itself during SSR", "Graceful degradation"],
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "architecture.stateManagement.noLocaleFoldersWarning",
  },
];

registerPage({
  slug: "architecture/state-management",
  titleKey: "architecture.stateManagement.title",
  descriptionKey: "architecture.stateManagement.description",
  category: "architecture",
  order: 7,
  sections,
  relatedSlugs: ["architecture/frontend", "architecture/solid-pattern"],
  lastUpdated: "2026-02-19",
});
