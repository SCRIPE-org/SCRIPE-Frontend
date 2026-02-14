import { registerPage } from '../../repositories/DocsRepository';
registerPage({
      slug: 'architecture/cqrs', titleKey: 'architecture.cqrs.title', descriptionKey: 'architecture.cqrs.description', category: 'architecture', order: 4,
      sections: [
            { type: 'paragraph', contentKey: 'architecture.cqrs.description' },
            {
                  type: 'flowchart', title: 'CQRS Pattern', direction: 'horizontal',
                  nodes: [
                        { id: 'cmd', label: 'Commands (Write)', type: 'danger' },
                        { id: 'bus', label: 'MediatR Bus', type: 'primary' },
                        { id: 'qry', label: 'Queries (Read)', type: 'success' },
                  ],
                  connections: [{ from: 'cmd', to: 'bus', label: 'IRequest<Result<T>>' }, { from: 'bus', to: 'qry' }],
            },
            {
                  type: 'tabs', tabs: [
                        {
                              label: 'Command', language: 'csharp', code: `// Commands CHANGE state
public record CreateAdminCommand(
    string FullName,
    string Email,
    string Password
) : IRequest<Result<Guid>>;` },
                        {
                              label: 'Query', language: 'csharp', code: `// Queries READ state
public record GetAdminsQuery(
    int Page = 1,
    int PageSize = 10
) : IRequest<Result<PaginatedList<AdminDto>>>;` },
                  ]
            },
            { type: 'info', variant: 'note', contentKey: 'architecture.cqrs.description' },
      ],
      relatedSlugs: ['architecture/backend', 'tutorials/add-command'],
});
