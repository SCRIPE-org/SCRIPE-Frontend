import { registerPage } from '../../repositories/DocsRepository';
registerPage({
      slug: 'architecture/data-flow', titleKey: 'architecture.dataFlow.title', descriptionKey: 'architecture.dataFlow.description', category: 'architecture', order: 8,
      sections: [
            { type: 'paragraph', contentKey: 'architecture.dataFlow.description' },
            { type: 'heading', level: 2, titleKey: 'architecture.dataFlow.title', id: 'query-flow' },
            {
                  type: 'flowchart', title: 'Query Data Flow', direction: 'horizontal',
                  nodes: [
                        { id: 'v', label: 'View', type: 'primary' },
                        { id: 'vm', label: 'ViewModel', type: 'info' },
                        { id: 'tq', label: 'TanStack Query', type: 'warning' },
                        { id: 'r', label: 'Repository', type: 'success' },
                        { id: 'api', label: 'API Service', type: 'default' },
                        { id: 'be', label: 'Backend', type: 'danger' },
                  ],
                  connections: [
                        { from: 'v', to: 'vm' }, { from: 'vm', to: 'tq' }, { from: 'tq', to: 'r' }, { from: 'r', to: 'api' }, { from: 'api', to: 'be' },
                  ],
            },
            { type: 'heading', level: 2, titleKey: 'architecture.dataFlow.title', id: 'mutation-flow' },
            {
                  type: 'flowchart', title: 'Mutation Data Flow', direction: 'horizontal',
                  nodes: [
                        { id: 'v2', label: 'View', type: 'primary' },
                        { id: 'vm2', label: 'useMutation', type: 'info' },
                        { id: 'repo2', label: 'Repository', type: 'success' },
                        { id: 'api2', label: 'POST/PUT', type: 'warning' },
                        { id: 'be2', label: 'Backend', type: 'danger' },
                  ],
                  connections: [
                        { from: 'v2', to: 'vm2' }, { from: 'vm2', to: 'repo2' }, { from: 'repo2', to: 'api2' }, { from: 'api2', to: 'be2' },
                  ],
            },
      ],
      relatedSlugs: ['architecture/state-management', 'architecture/frontend'],
});
