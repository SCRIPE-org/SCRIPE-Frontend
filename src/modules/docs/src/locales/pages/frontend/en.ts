export const en = {
  frontend: {
    componentLibrary: {
      a11yTitle: "Accessibility",
      architectureTitle: "Component Architecture",
      categoriesTitle: "Component Categories",
      chartsTitle: "Chart Components",
      description:
        "shadcn/ui foundation, cn() utility, GenericSelect, theme system, and component placement rules.",
      feedbackTitle: "Feedback Components",
      formsTitle: "Form Components",
      genericSelectIntro:
        "GenericSelect is a custom tree-select component that supports hierarchical data, search, multi-select, and lazy loading. It's used for role, permission, and tenant selection throughout the admin panel.",
      genericSelectTitle: "GenericSelect Component",
      intro:
        "SCRIPE's UI is built on shadcn/ui  a collection of accessible, customizable components. All shared components live in @core/ui/ and are extended with the cn() utility for conditional class merging.",
      layoutTitle: "Layout Components",
      neverInApp:
        "NEVER place business components in src/app/. Only routing connectors (page.tsx, layout.tsx) belong there. All UI components go in @core/ui/ (shared) or @modules/{name}/components/ (module-specific).",
      placementTitle: "Component Placement Rules",
      responsiveTitle: "Responsive Design",
      shadcnIntro:
        "shadcn/ui provides unstyled, accessible component primitives (Button, Input, Select, Dialog, etc.) that are installed directly into the project. This gives full control over styling and behavior.",
      shadcnTitle: "shadcn/ui Foundation",
      themeTitle: "Theme System",
      title: "Component Library",
    },
    crudSystem: {
      architectureTitle: "Architecture Overview",
      columnsTitle: "Column System",
      dataTableTitle: "DataTable Features",
      description:
        "useCrudViewModel hook, GenericCrudView, DataTable, column helpers, form system, and dialog management.",
      extensionTip:
        "The CRUD system is designed for extension, not modification. Wrap GenericCrudView with custom sections (statistics, filters) instead of modifying its internals.",
      formIntro:
        "The form system integrates GenericForm (Zod schema-driven) with FormDialog for create/edit operations, and ConfirmDialog for destructive actions. Forms support field validation, loading states, and error display.",
      formTitle: "Form System",
      genericCrudViewIntro:
        "GenericCrudView is a pre-built component that orchestrates the DataTable, FormDialog, and ConfirmDialog. It accepts a crud ViewModel instance and column definitions, handling the entire CRUD UI with minimal code.",
      genericCrudViewTitle: "GenericCrudView Component",
      intro:
        "The CRUD System provides a complete, reusable solution for building list/detail/form pages. At its core is the useCrudViewModel hook that manages pagination, search, sorting, selection, and CRUD mutations. GenericCrudView orchestrates the DataTable, form dialogs, and confirm dialogs.",
      paginationDesc: "Server-side pagination with configurable page sizes (10/25/50/100).",
      paginationTitle: "Pagination",
      responsiveDesc: "Responsive design with horizontal scrolling on mobile and priority columns.",
      responsiveTitle: "Responsive Layout",
      rtlDesc: "Full RTL layout support with automatic direction switching based on language.",
      rtlTitle: "RTL Support",
      searchDesc: "Debounced search across all text columns with configurable delay.",
      searchTitle: "Global Search",
      selectionDesc: "Checkbox selection with select-all, bulk actions, and exclusion mode.",
      selectionTitle: "Row Selection",
      sortingDesc: "Click column headers to sort. Supports multi-directional sorting (asc/desc).",
      sortingTitle: "Column Sorting",
      title: "CRUD System",
      viewModelIntro:
        "useCrudViewModel is a generic hook that encapsulates all CRUD-related state and operations. It accepts a configuration object defining data fetching, mutations, and UI options, and returns a comprehensive interface for building CRUD pages.",
      viewModelTitle: "useCrudViewModel Hook",
    },
    formValidation: {
      architectureTitle: "Validation Architecture",
      description:
        "Zod schemas, React Hook Form integration, FluentValidation server-side, and error handling patterns.",
      intro:
        "Form validation in SCRIPE follows a dual-layer approach: client-side validation with Zod schemas and React Hook Form provides instant feedback, while server-side FluentValidation in the AstraFlow mediator pipeline ensures data integrity.",
      rhfTitle: "React Hook Form Integration",
      rulesTitle: "Validation Rules Reference",
      serverErrorIntro:
        "When server-side FluentValidation rejects a request, the API returns structured error objects with field-level messages. The frontend maps these errors back to form fields using setError().",
      serverErrorTitle: "Server-Side Error Handling",
      title: "Form Validation",
      zodTitle: "Zod Schemas (Client-Side)",
    },
    localization: {
      addingKeysTitle: "Adding New Translation Keys",
      architectureTitle: "Architecture",
      description:
        "LanguageProvider, module-scoped locales, useModuleLocales hook, t() function, RTL support, and adding new translation keys.",
      dictionaryTitle: "Dictionary Structure",
      intro:
        "SCRIPE uses a module-scoped localization system. Shared keys (~1,156) live in core/locales/. Each module owns its translations in a co-located locales/ directory, eagerly imported at build time via the module-registry.ts for zero-flash page loads. Supports Arabic (RTL) and English (LTR) with automatic direction switching, font changes, and localStorage persistence.",
      moduleLocaleNote:
        "The scripe CLI automatically scaffolds locales/ when creating new modules via scripe new-module. Each locale file contains both EN and AR translations, bundled in a single chunk for instant language switching.",
      noLocaleRoutes:
        "SCRIPE does NOT use locale-based routing ([locale]/page.tsx). All localization is handled via the LanguageProvider context and localStorage, not file-based routing.",
      rtlIntro:
        "When the language switches to Arabic, the system automatically sets dir='rtl' and lang='ar' on the HTML element, adds the font-arabic CSS class to the body, and updates the CSS direction for all layout components.",
      rtlTitle: "RTL/LTR Support",
      step1Desc:
        "Add new keys to your module's locales/{module}.en.ts and {module}.ar.ts files. Only add to core/locales/ if the key is truly shared (validation, navigation, common UI).",
      step1Title: "1. Create or Update Module Locale",
      step2Desc:
        "Register your module locales in core/locales/module-registry.ts. New modules created via scripe new-module are automatically registered by the CLI.",
      step2Title: "2. Register in Module Registry",
      step3Desc:
        "Call t('moduleName.keyPath') using the namespace from your locale file. For interpolation, use {{variable}} syntax and pass variables as the second argument.",
      step3Title: "3. Use t() with Module Namespace",
      tFunctionTitle: "Using the t() Function",
      title: "Localization (i18n)",
    },
    realtime: {
      architectureTitle: "Real-Time Architecture",
      connectionStatesTitle: "Connection States",
      description:
        "SignalR hubs (AuditHub, NotificationHub), React hooks, connection management, and tenant group scoping.",
      hooksTitle: "React Hooks",
      hubsTitle: "SignalR Hubs",
      intro:
        "SCRIPE uses SignalR for real-time bi-directional communication between the backend and frontend. Two hubs are available: AuditHub for live audit log streaming and NotificationHub for instant notification delivery.",
      providerTitle: "SignalR Provider",
      tenantGroupNote:
        "SignalR connections are automatically grouped by tenant ID. When an audit event occurs for TenantA, only clients connected with TenantA's token receive the broadcast. This ensures complete tenant isolation for real-time events.",
      title: "Real-Time (SignalR)",
    },
    stateManagement: {
      antiPatternsTitle: "Anti-Patterns",
      categoriesTitle: "State Categories",
      description:
        "TanStack Query for server state, Zustand for global UI state, and local useState  when to use each.",
      intro:
        "SCRIPE uses three state management tools, each for a specific category: TanStack Query v5 for server/API data, Zustand for global UI state (auth, sidebar, theme), and React's useState for local component state.",
      languageIntro:
        "Language preferences are managed through the LanguageProvider context. It persists the selected language in localStorage and provides the t() function for translations throughout the app.",
      languageTitle: "Localization State",
      mutationsTitle: "Mutations & Cache Invalidation",
      tanstackIntro:
        "TanStack Query handles all API data  fetching, caching, background refetching, mutations, optimistic updates, and pagination. It's used exclusively in ViewModels, never in Views or Components.",
      tanstackTitle: "TanStack Query (Server State)",
      title: "State Management",
      zustandIntro:
        "Zustand stores manage UI state that needs to be shared across components: authentication state (useAuthStore), sidebar/theme (useUIStore), and toast notifications (useToastStore).",
      zustandTitle: "Zustand (Global UI State)",
    },
  },
};
