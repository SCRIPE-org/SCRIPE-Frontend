/**
 * English locale for the Documentation Portal.
 * Contains all UI strings and content translations.
 */
export const docEn = {
  // ─── Common UI ──────────────────────────────────────────────
  common: {
    search: "Search docs...",
    searchPlaceholder: "Type to search...",
    searchShortcut: "⌘K",
    searchNoResults: "No results found",
    searchResultsTitle: "Search Results",
    copyCode: "Copy",
    codeCopied: "Copied!",
    onThisPage: "On this page",
    relatedDocs: "Related Documents",
    lastUpdated: "Last updated",
    previous: "Previous",
    next: "Next",
    backToTop: "Back to top",
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    menu: "Menu",
    closeMenu: "Close menu",
    tableOfContents: "Table of Contents",
    readingTime: "{{min}} min read",
    home: "Home",
    editPage: "Edit this page",
    version: "Version",
    language: "Language",
  },

  // ─── Info Blocks ────────────────────────────────────────────
  info: {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    danger: "Danger",
  },

  // ─── API Table ──────────────────────────────────────────────
  api: {
    method: "Method",
    endpoint: "Endpoint",
    description: "Description",
    auth: "Auth",
    authRequired: "Required",
    noAuth: "Public",
    permission: "Permission",
  },

  // ─── Navigation Categories ──────────────────────────────────
  nav: {
    getStarted: "Get Started",
    tutorials: "Tutorials",
    architecture: "Architecture",
    features: "Features",
    frontend: "Frontend Modules",
    security: "Security",
    apiReference: "API Reference",
    infrastructure: "Infrastructure",
  },

  // ─── Get Started ────────────────────────────────────────────
  getStarted: {
    overview: {
      title: "Overview",
      description: "Welcome to the Verified ERP Platform documentation.",
      hero: "Build Enterprise Applications Faster",
      heroSub:
        "A production-ready Modular Monolith platform with .NET 10 backend, Next.js frontend, and everything you need to build scalable enterprise applications.",
      whatIs: "What is Verified Platform?",
      whatIsText:
        "Verified is an enterprise-grade ERP platform built with a Modular Monolith architecture. It provides a battle-tested foundation for building complex business applications with authentication, authorization, multi-tenancy, audit logging, and a comprehensive admin panel — all out of the box.",
      keyFeatures: "Key Features",
      keyFeaturesText:
        "The platform includes a comprehensive set of features designed for enterprise applications.",
      feature1Title: "Modular Monolith Architecture",
      feature1Text:
        "Clean separation of concerns with isolated modules that can be independently developed and tested. Backend uses CQRS with MediatR, frontend follows SOLID View/ViewModel pattern.",
      feature2Title: "Enterprise Security",
      feature2Text:
        "Role-Based Access Control (RBAC) with server-side permission caching, field-level security, data scoping, 2FA, session management, and comprehensive audit trails.",
      feature3Title: "Multi-Tenancy",
      feature3Text:
        "Built-in tenant management with hierarchical tenant structures, isolated data, per-tenant settings, and tenant-scoped permissions.",
      feature4Title: "Full-Stack Solution",
      feature4Text:
        ".NET 10 backend with EF Core, Next.js 16 frontend with TanStack Query v5, Zustand state management, and a powerful Generic CRUD engine.",
      techStack: "Technology Stack",
      backendStack: "Backend",
      frontendStack: "Frontend",
      quickLinks: "Quick Links",
      quickLink1: "Quick Start Guide",
      quickLink2: "Architecture Overview",
      quickLink3: "First Tutorial",
    },
    prerequisites: {
      title: "Prerequisites",
      description: "Requirements and tools needed before getting started.",
      intro:
        "Before you begin, make sure you have the following tools installed on your development machine.",
      required: "Required Tools",
      dotnet: ".NET 10 SDK",
      dotnetText:
        "Required for building and running the backend. Download from the official .NET website.",
      nodejs: "Node.js 20+ & npm",
      nodejsText: "Required for the frontend. We recommend using the latest LTS version.",
      database: "SQL Server (or PostgreSQL/Oracle)",
      databaseText: "The backend supports multiple database providers. SQL Server is the default.",
      ide: "IDE / Code Editor",
      ideText:
        "Visual Studio 2022+ or VS Code with C# extension for backend. VS Code recommended for frontend.",
      optional: "Optional Tools",
      git: "Git",
      gitText: "For version control and cloning the repository.",
      docker: "Docker",
      dockerText: "For running the database in a container (optional but recommended).",
      postman: "Postman / Thunder Client",
      postmanText: "For testing API endpoints manually.",
    },
    quickStart: {
      title: "Quick Start",
      description: "Get the platform running in 5 minutes.",
      intro: "Follow these steps to clone, configure, and run the platform on your local machine.",
      step1Title: "Clone the Repository",
      step1Content: "Clone the repository to your local machine using Git.",
      step2Title: "Configure the Database",
      step2Content: "Update the connection string in the backend configuration file.",
      step3Title: "Run Database Migrations",
      step3Content: "Apply the database schema migrations to create all tables.",
      step4Title: "Start the Backend",
      step4Content: "Run the backend API server.",
      step5Title: "Start the Frontend",
      step5Content: "Install dependencies and start the frontend development server.",
      step6Title: "Access the Application",
      step6Content:
        "Open your browser and navigate to the application. Use the default admin credentials to log in.",
      defaultCredentials: "Default Credentials",
      successTip:
        "If everything is set up correctly, you should see the admin dashboard. The default admin has full permissions.",
    },
    projectStructure: {
      title: "Project Structure",
      description: "Understand the directory layout of both backend and frontend projects.",
      intro:
        "The Verified Platform is organized as a monorepo with two main projects. Each follows a modular architecture.",
      backendTitle: "Backend Structure",
      backendText: "The backend follows a Modular Monolith architecture with CQRS pattern.",
      frontendTitle: "Frontend Structure",
      frontendText:
        "The frontend follows a modular architecture with SOLID View/ViewModel pattern.",
      keyDirectories: "Key Directories Explained",
    },
  },

  // ─── Tutorials ──────────────────────────────────────────────
  tutorials: {
    firstBackendModule: {
      title: "Create Your First Module (Backend)",
      description: "Step-by-step guide to creating a new backend module with CQRS.",
    },
    firstFrontendModule: {
      title: "Create Your First Module (Frontend)",
      description: "Build a frontend module following SOLID View/ViewModel pattern.",
    },
    addEntity: {
      title: "Add a Domain Entity",
      description: "Create a new domain entity with validation and audit support.",
    },
    addCommand: {
      title: "Add a Command (CQRS)",
      description: "Create a command with handler, validation, and pipeline behaviors.",
    },
    addQuery: {
      title: "Add a Query (CQRS)",
      description: "Create a query with handler and response mapping.",
    },
    addPermissions: {
      title: "Add Permissions",
      description: "Seed permissions and protect endpoints with RBAC.",
    },
    addApiEndpoint: {
      title: "Add an API Endpoint",
      description: "Create a controller endpoint with Swagger docs and auth.",
    },
    apiIntegration: {
      title: "Frontend API Integration",
      description: "Connect your frontend module to the backend API.",
    },
  },

  // ─── Architecture ───────────────────────────────────────────
  architecture: {
    overview: {
      title: "Architecture Overview",
      description: "High-level view of the platform architecture.",
    },
    backend: {
      title: "Backend Architecture",
      description: ".NET 10 Modular Monolith with CQRS and DDD.",
    },
    frontend: {
      title: "Frontend Architecture",
      description: "Next.js modular monolith with SOLID patterns.",
    },
    cqrs: {
      title: "CQRS Pattern",
      description: "Command Query Responsibility Segregation implementation.",
    },
    modules: {
      title: "Module System",
      description: "How modules are structured and isolated.",
    },
    solidPattern: {
      title: "SOLID View/ViewModel",
      description: "The SOLID pattern for frontend views and view models.",
    },
    stateManagement: {
      title: "State Management",
      description: "TanStack Query for server state, Zustand for UI state.",
    },
    dataFlow: {
      title: "Data Flow",
      description: "How data flows from UI to database and back.",
    },
  },

  // ─── Features ───────────────────────────────────────────────
  features: {
    authentication: {
      title: "Authentication",
      description: "Admin and user login, JWT tokens, refresh flow.",
      overview: "Overview",
      overviewText:
        "The authentication system provides secure login for both admin users and regular users. It uses JWT access tokens with server-side permission caching for authorization.",
      flowTitle: "Authentication Flow",
      loginFlow: "Login Flow",
      loginFlowText:
        "When an admin logs in, the system validates credentials, checks for 2FA, generates JWT tokens, and caches permissions server-side.",
      endpoints: "API Endpoints",
      backendImpl: "Backend Implementation",
      frontendImpl: "Frontend Integration",
      securityFeatures: "Security Features",
      tipSecurity:
        "Permissions are cached server-side (not in JWT). This means permission changes take effect immediately without requiring token refresh.",
      accountLockout: "Account Lockout",
      accountLockoutText:
        "After 5 failed login attempts, the account is locked for 15 minutes. This prevents brute-force attacks.",
    },
    twoFactorAuth: {
      title: "Two-Factor Authentication",
      description: "TOTP-based 2FA setup, verification, and recovery.",
    },
    sessionManagement: {
      title: "Session Management",
      description: "Active session tracking, device info, and session revocation.",
    },
    profileManagement: {
      title: "Profile Management",
      description: "Profile updates, avatar upload, password change.",
    },
    adminManagement: {
      title: "Admin Management",
      description: "Admin CRUD, role assignment, impersonation, and bulk operations.",
    },
    roleManagement: {
      title: "Role Management",
      description: "Role CRUD with permission assignment and cloning.",
    },
    permissionSystem: {
      title: "Permission System",
      description: "RBAC with server-side caching and field-level security.",
    },
    tenantManagement: {
      title: "Tenant Management",
      description: "Multi-tenant CRUD, hierarchy, settings, and logos.",
    },
    menuSystem: {
      title: "Menu System",
      description: "Dynamic menu management with reorder and visibility controls.",
    },
    dashboardAnalytics: {
      title: "Dashboard & Analytics",
      description: "KPIs, charts, security events, and data export.",
    },
    auditLogging: {
      title: "Audit Logging",
      description: "Comprehensive audit trail with 4-source pipeline.",
    },
    recycleBin: {
      title: "Recycle Bin",
      description: "Soft-deleted records viewer with restore capability.",
    },
    fileManagement: {
      title: "File Management",
      description: "Chunked upload, resumable download, ETag validation.",
    },
    userAuthentication: {
      title: "User Authentication",
      description: "User registration, email/phone verification, OAuth.",
    },
  },

  // ─── Frontend Modules ───────────────────────────────────────
  frontend: {
    authModule: {
      title: "Auth Module",
      description: "Login flow, 2FA verification, token management and route guards.",
    },
    profileModule: {
      title: "Profile Module",
      description: "Admin profile, security settings, sessions, and activity.",
    },
    systemModule: {
      title: "System Module",
      description: "All 12 system sub-modules: admin, roles, permissions, tenants, etc.",
    },
    crudEngine: {
      title: "CRUD Engine",
      description: "GenericCrudView, DataTable, forms, and column helpers.",
    },
  },

  // ─── Security ───────────────────────────────────────────────
  security: {
    rbac: {
      title: "RBAC & Permissions",
      description: "Role-Based Access Control with server-side caching.",
    },
    fieldLevel: {
      title: "Field-Level Security",
      description: "Restrict access to specific entity fields per role.",
    },
    idEncryption: {
      title: "ID Encryption",
      description: "AES-256 entity ID obfuscation for public APIs.",
    },
    tokens: {
      title: "Token Security",
      description: "JWT structure, refresh token rotation, and token revocation.",
    },
  },

  // ─── API Reference ──────────────────────────────────────────
  apiReference: {
    adminAuth: {
      title: "Admin Auth API",
      description: "Login, refresh, logout, 2FA, sessions.",
    },
    userAuth: {
      title: "User Auth API",
      description: "Register, verify, login, password reset, OAuth.",
    },
    adminManagement: {
      title: "Admin Management API",
      description: "CRUD, bulk ops, role assignment, impersonation.",
    },
    adminManagementApi: {
      title: "Admin Management API",
      description: "Full CRUD operations for admin user management.",
    },
    roles: {
      title: "Roles API",
      description: "Role CRUD and permission assignment.",
    },
    tenants: {
      title: "Tenants API",
      description: "Tenant CRUD, hierarchy, settings.",
    },
    menus: {
      title: "Menus API",
      description: "Menu CRUD, reorder, visibility.",
    },
    audit: {
      title: "Audit API",
      description: "Audit log listing, detail, and export.",
    },
  },

  // ─── Infrastructure ─────────────────────────────────────────
  infrastructure: {
    database: {
      title: "Database Configuration",
      description: "Configure SQL Server, PostgreSQL, or Oracle.",
    },
    multiDatabase: {
      title: "Multi-Database Support",
      description: "Switching between database providers.",
    },
    migrations: {
      title: "Migrations",
      description: "Running and managing database migrations.",
    },
    caching: {
      title: "Caching Strategy",
      description: "Permission caching, query caching, and cache invalidation.",
    },
  },
};

export type DocTranslations = typeof docEn;
