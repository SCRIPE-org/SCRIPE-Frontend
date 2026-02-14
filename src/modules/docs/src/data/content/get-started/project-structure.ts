import { registerPage } from '../../repositories/DocsRepository';
import type { DocPageData } from '../../../domain/entities/DocPage';

const page: DocPageData = {
      slug: 'get-started/project-structure',
      titleKey: 'getStarted.projectStructure.title',
      descriptionKey: 'getStarted.projectStructure.description',
      category: 'get-started',
      order: 4,
      sections: [
            { type: 'paragraph', contentKey: 'getStarted.projectStructure.intro' },
            { type: 'heading', level: 2, titleKey: 'getStarted.projectStructure.backendTitle', id: 'backend' },
            { type: 'paragraph', contentKey: 'getStarted.projectStructure.backendText' },
            {
                  type: 'code',
                  language: 'text',
                  filename: 'Backend Directory Structure',
                  code: `ASP.Net-Login-Project-CQRS/
├── Controllers/              # API endpoints
├── CQRS/
│   ├── Commands/             # Write operations
│   │   ├── AdminAuth/        # Login, Logout, Refresh
│   │   ├── AdminManagement/  # CRUD admins
│   │   ├── Roles/            # CRUD roles + permissions
│   │   ├── Tenants/          # CRUD tenants
│   │   ├── Menus/            # CRUD menus
│   │   └── ...
│   ├── Queries/              # Read operations
│   └── DTOs/                 # Data transfer objects
├── Entities/                 # Domain models
├── Modules/                  # Feature modules
├── Repository/               # Data access
├── Services/                 # Business services
├── Pipeline/                 # MediatR behaviors
│   ├── ValidationBehavior    # FluentValidation
│   ├── AuthorizationBehavior # Permission check
│   └── AuditBehavior         # Audit logging
├── Interceptors/             # EF Core interceptors
├── Middleware/                # Request pipeline
└── docs/                     # Documentation`,
            },
            { type: 'heading', level: 2, titleKey: 'getStarted.projectStructure.frontendTitle', id: 'frontend' },
            { type: 'paragraph', contentKey: 'getStarted.projectStructure.frontendText' },
            {
                  type: 'code',
                  language: 'text',
                  filename: 'Frontend Directory Structure',
                  code: `next-frontend-template-modular-clean/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (modules)/        # Authenticated routes
│   │   │   ├── layout.tsx    # Dashboard layout
│   │   │   ├── admin/        # Admin pages
│   │   │   └── ...
│   │   ├── (docs)/           # Documentation portal
│   │   └── layout.tsx        # Root layout
│   ├── core/                 # Shared kernel
│   │   ├── ui/               # Shadcn UI components
│   │   ├── providers/        # Context providers
│   │   ├── store/            # Zustand stores
│   │   ├── network/          # API client
│   │   └── locales/          # i18n dictionaries
│   └── modules/              # Feature modules
│       ├── auth/             # Authentication
│       ├── admin/            # Admin panel
│       │   ├── dashboard/
│       │   ├── user-management/
│       │   ├── role-management/
│       │   └── ...
│       └── docs/             # Documentation portal
└── public/                   # Static assets`,
            },
            { type: 'heading', level: 2, titleKey: 'getStarted.projectStructure.keyDirectories', id: 'key-dirs' },
            {
                  type: 'table',
                  headers: ['Directory', 'Purpose', 'Layer'],
                  rows: [
                        ['Controllers/', 'API endpoints, route definitions', 'Presentation'],
                        ['CQRS/Commands/', 'Write operations (Create, Update, Delete)', 'Application'],
                        ['CQRS/Queries/', 'Read operations (Get, List, Search)', 'Application'],
                        ['Entities/', 'Domain models, business rules', 'Domain'],
                        ['Repository/', 'Database access implementation', 'Infrastructure'],
                        ['Pipeline/', 'Cross-cutting concerns (validation, auth, audit)', 'Application'],
                        ['src/modules/', 'Isolated feature modules (frontend)', 'All layers'],
                        ['src/core/', 'Shared infrastructure (frontend)', 'Infrastructure'],
                  ],
            },
            {
                  type: 'flowchart',
                  title: 'Module Architecture Pattern',
                  direction: 'vertical',
                  nodes: [
                        { id: 'presentation', label: 'Presentation (Views + ViewModels)', type: 'primary' },
                        { id: 'application', label: 'Application (Commands + Queries)', type: 'info' },
                        { id: 'domain', label: 'Domain (Entities + Interfaces)', type: 'success' },
                        { id: 'infrastructure', label: 'Infrastructure (Repositories + API)', type: 'warning' },
                  ],
                  connections: [
                        { from: 'presentation', to: 'application', label: 'Calls' },
                        { from: 'application', to: 'domain', label: 'Uses' },
                        { from: 'infrastructure', to: 'domain', label: 'Implements' },
                  ],
            },
      ],
      relatedSlugs: ['architecture/overview', 'architecture/modules'],
};

registerPage(page);
