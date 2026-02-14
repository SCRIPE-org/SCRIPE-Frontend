import { registerPage } from '../../repositories/DocsRepository';
registerPage({
      slug: 'architecture/state-management', titleKey: 'architecture.stateManagement.title', descriptionKey: 'architecture.stateManagement.description', category: 'architecture', order: 7,
      sections: [
            { type: 'paragraph', contentKey: 'architecture.stateManagement.description' },
            {
                  type: 'table', headers: ['State Type', 'Tool', 'Use For'],
                  rows: [
                        ['Server Data', 'TanStack Query v5', 'API data, caching, background refetch'],
                        ['Global UI', 'Zustand', 'Auth, sidebar, theme, toasts'],
                        ['Local', 'useState / useReducer', 'Form inputs, modals, toggles'],
                        ['Language', 'LanguageProvider', 'i18n, RTL/LTR, translations'],
                  ],
            },
            { type: 'info', variant: 'warning', contentKey: 'architecture.stateManagement.description' },
            {
                  type: 'code', language: 'typescript', filename: 'TanStack Query Example', code: `const { data, isLoading } = useQuery({
  queryKey: ['employees', page, search],
  queryFn: () => repo.getAll({ page, search }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});` },
      ],
      relatedSlugs: ['architecture/frontend', 'architecture/data-flow'],
});
