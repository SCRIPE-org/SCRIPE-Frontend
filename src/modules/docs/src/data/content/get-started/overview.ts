import { registerPage } from '../../repositories/DocsRepository';
import type { DocPageData } from '../../../domain/entities/DocPage';

const page: DocPageData = {
      slug: 'get-started/overview',
      titleKey: 'getStarted.overview.title',
      descriptionKey: 'getStarted.overview.description',
      category: 'get-started',
      order: 1,
      sections: [
            { type: 'heading', level: 2, titleKey: 'getStarted.overview.whatIs', id: 'what-is' },
            { type: 'paragraph', contentKey: 'getStarted.overview.whatIsText' },
            { type: 'info', variant: 'tip', contentKey: 'getStarted.overview.heroSub' },
            { type: 'heading', level: 2, titleKey: 'getStarted.overview.keyFeatures', id: 'key-features' },
            { type: 'paragraph', contentKey: 'getStarted.overview.keyFeaturesText' },
            {
                  type: 'table',
                  headers: ['Feature', 'Description'],
                  rows: [
                        ['Modular Monolith', 'Isolated modules with clean boundaries — backend CQRS + frontend SOLID View/ViewModel'],
                        ['Enterprise Security', 'RBAC with server-side caching, 2FA, field-level security, audit trails'],
                        ['Multi-Tenancy', 'Hierarchical tenants, isolated data, per-tenant settings'],
                        ['Full-Stack', '.NET 10 + EF Core backend, Next.js 16 + TanStack Query frontend'],
                        ['CRUD Engine', 'GenericCrudView with DataTable, forms, and column helpers'],
                        ['Dashboard', 'KPIs, charts, security events, data export'],
                        ['Audit System', '4-source pipeline: API requests, entity changes, security events, audit behaviors'],
                        ['File Management', 'Chunked upload, resumable download, ETag validation'],
                  ],
            },
            { type: 'heading', level: 2, titleKey: 'getStarted.overview.techStack', id: 'tech-stack' },
            { type: 'heading', level: 3, titleKey: 'getStarted.overview.backendStack', id: 'backend-stack' },
            {
                  type: 'table',
                  headers: ['Technology', 'Purpose'],
                  rows: [
                        ['.NET 10', 'Core framework'],
                        ['Entity Framework Core', 'ORM & database access'],
                        ['MediatR', 'CQRS command/query bus'],
                        ['FluentValidation', 'Request validation'],
                        ['SignalR', 'Real-time (audit hub)'],
                        ['Swagger / Swashbuckle', 'API documentation'],
                        ['BCrypt', 'Password hashing'],
                        ['AES-256-CBC', 'ID encryption'],
                  ],
            },
            { type: 'heading', level: 3, titleKey: 'getStarted.overview.frontendStack', id: 'frontend-stack' },
            {
                  type: 'table',
                  headers: ['Technology', 'Purpose'],
                  rows: [
                        ['Next.js 16', 'React framework with App Router'],
                        ['TanStack Query v5', 'Server state management'],
                        ['Zustand', 'Client state (auth, UI)'],
                        ['React Hook Form + Zod', 'Form handling & validation'],
                        ['Recharts', 'Dashboard charts'],
                        ['Shadcn/ui', 'Base UI components'],
                        ['next-themes', 'Dark/light mode'],
                  ],
            },
            { type: 'heading', level: 2, titleKey: 'getStarted.overview.quickLinks', id: 'quick-links' },
            {
                  type: 'list',
                  variant: 'unordered',
                  items: [
                        '→ Quick Start Guide — Get running in 5 minutes',
                        '→ Architecture Overview — Understand the platform design',
                        '→ First Tutorial — Create your first module',
                  ],
            },
            {
                  type: 'flowchart',
                  title: 'Platform Architecture Overview',
                  direction: 'vertical',
                  nodes: [
                        { id: 'client', label: 'Next.js Frontend', type: 'primary' },
                        { id: 'api', label: 'ASP.NET API', type: 'info' },
                        { id: 'pipeline', label: 'MediatR Pipeline', type: 'warning' },
                        { id: 'handler', label: 'Command/Query Handler', type: 'success' },
                        { id: 'db', label: 'Database (EF Core)', type: 'default' },
                  ],
                  connections: [
                        { from: 'client', to: 'api', label: 'HTTP/REST' },
                        { from: 'api', to: 'pipeline', label: 'MediatR.Send()' },
                        { from: 'pipeline', to: 'handler', label: 'Validate → Auth → Audit' },
                        { from: 'handler', to: 'db', label: 'Repository' },
                  ],
            },
      ],
      relatedSlugs: ['get-started/quick-start', 'architecture/overview'],
};

registerPage(page);
