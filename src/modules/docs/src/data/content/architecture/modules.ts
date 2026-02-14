import { registerPage } from '../../repositories/DocsRepository';
registerPage({
      slug: 'architecture/modules', titleKey: 'architecture.modules.title', descriptionKey: 'architecture.modules.description', category: 'architecture', order: 5,
      sections: [
            { type: 'paragraph', contentKey: 'architecture.modules.description' },
            {
                  type: 'code', language: 'text', filename: 'Standard Module Structure', code: `module/
├── di.ts                     # Module DI Container
├── index.ts                  # Public API
└── src/
    ├── domain/               # Business Logic (Pure TS)
    │   ├── entities/         # Zod Schemas
    │   └── interfaces/       # Repository Contracts
    ├── data/                 # Data Access
    │   ├── models/           # API DTOs
    │   ├── mappers/          # DTO ↔ Entity
    │   └── repositories/     # Implementations
    └── presentation/         # UI (SOLID Pattern)
        ├── viewmodels/       # Section ViewModels
        ├── views/            # Pure UI Pages
        └── components/       # Section Components` },
            { type: 'info', variant: 'warning', titleKey: 'architecture.modules.title', contentKey: 'architecture.modules.description' },
            {
                  type: 'table', headers: ['Rule', 'Description'],
                  rows: [
                        ['✅ @core/*', 'Shared infrastructure — allowed'],
                        ['✅ @modules/{self}/*', 'Own module files — allowed'],
                        ['✅ External packages', 'npm dependencies — allowed'],
                        ['❌ @modules/other/*', 'NEVER import from other modules'],
                        ['❌ ../../../modules/', 'No relative paths to other modules'],
                  ],
            },
      ],
      relatedSlugs: ['architecture/frontend', 'architecture/solid-pattern'],
});
