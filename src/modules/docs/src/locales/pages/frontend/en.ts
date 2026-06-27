/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  frontend: {
    crudSystem: {
      title: "CRUD System",
      description:
        "useCrudViewModel hook, GenericCrudView, DataTable, column helpers, form system, and dialog management.",
      intro:
        "The CRUD System provides a complete, reusable solution for building list/detail/form pages. At its core is the useCrudViewModel hook that manages pagination, search, sorting, selection, and CRUD mutations. GenericCrudView orchestrates the DataTable, form dialogs, and confirm dialogs.",
      architectureTitle: "Architecture Overview",
      viewModelTitle: "useCrudViewModel Hook",
      viewModelIntro:
        "useCrudViewModel is a generic hook that encapsulates all CRUD-related state and operations. It accepts a configuration object defining data fetching, mutations, and UI options, and returns a comprehensive interface for building CRUD pages.",
      genericCrudViewTitle: "GenericCrudView Component",
      genericCrudViewIntro:
        "GenericCrudView is a pre-built component that orchestrates the DataTable, FormDialog, and ConfirmDialog. It accepts a crud ViewModel instance and column definitions, handling the entire CRUD UI with minimal code.",
      columnsTitle: "Column System",
      dataTableTitle: "DataTable Features",
      searchTitle: "Global Search",
      searchDesc: "Debounced search across all text columns with configurable delay.",
      sortingTitle: "Column Sorting",
      sortingDesc: "Click column headers to sort. Supports multi-directional sorting (asc/desc).",
      paginationTitle: "Pagination",
      paginationDesc: "Server-side pagination with configurable page sizes (10/25/50/100).",
      selectionTitle: "Row Selection",
      selectionDesc: "Checkbox selection with select-all, bulk actions, and exclusion mode.",
      responsiveTitle: "Responsive Layout",
      responsiveDesc: "Responsive design with horizontal scrolling on mobile and priority columns.",
      rtlTitle: "RTL Support",
      rtlDesc: "Full RTL layout support with automatic direction switching based on language.",
      formTitle: "Form System",
      formIntro:
        "The form system integrates GenericForm (Zod schema-driven) with FormDialog for create/edit operations, and ConfirmDialog for destructive actions. Forms support field validation, loading states, and error display.",
      extensionTip:
        "The CRUD system is designed for extension, not modification. Wrap GenericCrudView with custom sections (statistics, filters) instead of modifying its internals.",
      zeroFlickerTitle: "Zero-Flicker Query Cache Preservation",
      zeroFlickerIntro:
        "To prevent loading flashes when page or search parameters change, useGenericQuery leverages TanStack Query's placeholderData: keepPreviousData. This keeps the existing grid visible during transition, ensuring a seamless user experience.",
      optimisticDeletesTitle: "Optimistic Deletes & Rollback Cache",
      optimisticDeletesIntro:
        "When a deletion is triggered, the UI optimistically removes the item from the list cache and cancels active queries. If the backend API call fails, the mutation automatically rolls back the cache to its previous state and displays an error toast.",
    },
    stateManagement: {
      title: "State Management",
      description:
        "TanStack Query for server state, Zustand for global UI state, and local useState  when to use each.",
      intro:
        "SCRIPE uses three state management tools, each for a specific category: TanStack Query v5 for server/API data, Zustand for global UI state (auth, sidebar, theme), and React's useState for local component state.",
      categoriesTitle: "State Categories",
      tanstackTitle: "TanStack Query (Server State)",
      tanstackIntro:
        "TanStack Query handles all API data  fetching, caching, background refetching, mutations, optimistic updates, and pagination. It's used exclusively in ViewModels, never in Views or Components.",
      mutationsTitle: "Mutations & Cache Invalidation",
      zustandTitle: "Zustand (Global UI State)",
      zustandIntro:
        "Zustand stores manage UI state that needs to be shared across components: authentication state (useAuthStore), sidebar/theme (useUIStore), and toast notifications (useToastStore).",
      languageTitle: "Localization State",
      languageIntro:
        "Language preferences are managed through the LanguageProvider context. It persists the selected language in localStorage and provides the t() function for translations throughout the app.",
      antiPatternsTitle: "Anti-Patterns",
    },
    localization: {
      title: "Localization (i18n)",
      description:
        "LanguageProvider, module-scoped locales, useModuleLocales hook, t() function, RTL support, and adding new translation keys.",
      intro:
        "SCRIPE uses a module-scoped localization system. Shared keys (~1,156) live in core/locales/. Each module owns its translations in a co-located locales/ directory, loaded lazily via the useModuleLocales() hook. Supports Arabic (RTL) and English (LTR) with automatic direction switching, font changes, and localStorage persistence.",
      architectureTitle: "Architecture",
      dictionaryTitle: "Dictionary Structure",
      tFunctionTitle: "Using the t() Function",
      rtlTitle: "RTL/LTR Support",
      rtlIntro:
        "When the language switches to Arabic, the system automatically sets dir='rtl' and lang='ar' on the HTML element, adds the font-arabic CSS class to the body, and updates the CSS direction for all layout components.",
      addingKeysTitle: "Adding New Translation Keys",
      step1Title: "1. Create or Update Module Locale",
      step1Desc:
        "Add new keys to your module's locales/{module}.en.ts and {module}.ar.ts files. Only add to core/locales/ if the key is truly shared (validation, navigation, common UI).",
      step2Title: "2. Register with useModuleLocales",
      step2Desc:
        "In your view component, call useModuleLocales(() => import('../../../locales'), 'module-name') before useI18n() to lazy-load the module's translations.",
      step3Title: "3. Use t() with Module Namespace",
      step3Desc:
        "Call t('moduleName.keyPath') using the namespace from your locale file. For interpolation, use {{variable}} syntax and pass variables as the second argument.",
      noLocaleRoutes:
        "SCRIPE does NOT use locale-based routing ([locale]/page.tsx). All localization is handled via the LanguageProvider context and localStorage, not file-based routing.",
      moduleLocaleNote:
        "The scripe CLI automatically scaffolds locales/ when creating new modules via scripe new-module. Each locale file contains both EN and AR translations, bundled in a single chunk for instant language switching.",
    },
    formValidation: {
      title: "Form Validation",
      description:
        "Zod schemas, React Hook Form integration, FluentValidation server-side, and error handling patterns.",
      intro:
        "Form validation in SCRIPE follows a dual-layer approach: client-side validation with Zod schemas and React Hook Form provides instant feedback, while server-side FluentValidation in the SCRIPE mediator pipeline ensures data integrity.",
      architectureTitle: "Validation Architecture",
      zodTitle: "Zod Schemas (Client-Side)",
      rhfTitle: "React Hook Form Integration",
      rulesTitle: "Validation Rules Reference",
      serverErrorTitle: "Server-Side Error Handling",
      serverErrorIntro:
        "When server-side FluentValidation rejects a request, the API returns structured error objects with field-level messages. The frontend maps these errors back to form fields using setError().",
      zodUtilsTitle: "Zod Schema Builders & Safe API Parsing",
      zodUtilsIntro:
        "Zod forms leverage shared builders like emailField, strongPassword, requiredStr, and cronField. During API mapping, safeParseApiResponse parses responses safely to prevent crashes due to backend schema drift, falling back to safe defaults.",
    },
    componentLibrary: {
      title: "Component Library",
      description:
        "shadcn/ui foundation, cn() utility, GenericSelect, theme system, and component placement rules.",
      intro:
        "SCRIPE's UI is built on shadcn/ui  a collection of accessible, customizable components. All shared components live in @core/ui/ and are extended with the cn() utility for conditional class merging.",
      shadcnTitle: "shadcn/ui Foundation",
      shadcnIntro:
        "shadcn/ui provides unstyled, accessible component primitives (Button, Input, Select, Dialog, etc.) that are installed directly into the project. This gives full control over styling and behavior.",
      categoriesTitle: "Component Categories",
      formsTitle: "Form Components",
      feedbackTitle: "Feedback Components",
      layoutTitle: "Layout Components",
      chartsTitle: "Chart Components",
      genericSelectTitle: "GenericSelect Component",
      genericSelectIntro:
        "GenericSelect is a custom tree-select component that supports hierarchical data, search, multi-select, and lazy loading. It's used for role, permission, and tenant selection throughout the admin panel.",
      themeTitle: "Theme System",
      responsiveTitle: "Responsive Design",
      a11yTitle: "Accessibility",
      placementTitle: "Component Placement Rules",
      architectureTitle: "Component Architecture",
      neverInApp:
        "NEVER place business components in src/app/. Only routing connectors (page.tsx, layout.tsx) belong there. All UI components go in @core/ui/ (shared) or @modules/{name}/components/ (module-specific).",
    },
    realtime: {
      title: "Real-Time (SignalR)",
      description:
        "SignalR hubs (AuditHub, NotificationHub), React hooks, connection management, and tenant group scoping.",
      intro:
        "SCRIPE uses SignalR for real-time bi-directional communication between the backend and frontend. Two hubs are available: AuditHub for live audit log streaming and NotificationHub for instant notification delivery.",
      architectureTitle: "Real-Time Architecture",
      hubsTitle: "SignalR Hubs",
      hooksTitle: "React Hooks",
      providerTitle: "SignalR Provider",
      connectionStatesTitle: "Connection States",
      tenantGroupNote:
        "SignalR connections are automatically grouped by tenant ID. When an audit event occurs for TenantA, only clients connected with TenantA's token receive the broadcast. This ensures complete tenant isolation for real-time events.",
    },
  },
};
