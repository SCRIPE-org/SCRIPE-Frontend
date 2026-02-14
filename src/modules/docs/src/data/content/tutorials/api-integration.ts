import { registerPage } from '../../repositories/DocsRepository';
registerPage({
      slug: 'tutorials/api-integration', titleKey: 'tutorials.apiIntegration.title', descriptionKey: 'tutorials.apiIntegration.description', category: 'tutorials', order: 8,
      sections: [
            { type: 'info', variant: 'tip', contentKey: 'tutorials.apiIntegration.description' },
            {
                  type: 'flowchart', title: 'Frontend Data Flow', direction: 'horizontal',
                  nodes: [
                        { id: 'view', label: 'View', type: 'primary' },
                        { id: 'vm', label: 'ViewModel', type: 'info' },
                        { id: 'repo', label: 'Repository', type: 'success' },
                        { id: 'api', label: 'API Service', type: 'warning' },
                        { id: 'backend', label: 'Backend', type: 'danger' },
                  ],
                  connections: [
                        { from: 'view', to: 'vm' }, { from: 'vm', to: 'repo' }, { from: 'repo', to: 'api' }, { from: 'api', to: 'backend' },
                  ],
            },
            {
                  type: 'tabs', tabs: [
                        {
                              label: 'Repository', language: 'typescript', filename: 'InvoiceRepository.ts', code: `import { apiService } from '@core/network';

export class InvoiceRepository {
  async getAll(params: { page: number; search?: string }) {
    return apiService.get<PaginatedList<Invoice>>('/api/invoice', { params });
  }
  
  async create(data: CreateInvoiceInput) {
    return apiService.post<Guid>('/api/invoice', data);
  }
  
  async update(id: string, data: UpdateInvoiceInput) {
    return apiService.put(\`/api/invoice/\${id}\`, data);
  }
  
  async delete(id: string) {
    return apiService.delete(\`/api/invoice/\${id}\`);
  }
}` },
                        {
                              label: 'ViewModel', language: 'typescript', filename: 'useInvoicesViewModel.ts', code: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../../di';

export function useInvoicesViewModel() {
  const repo = container.invoiceRepository;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => repo.getAll({ page: 1 }),
  });

  const createMutation = useMutation({
    mutationFn: repo.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  return { invoices: data, isLoading, create: createMutation.mutate };
}` },
                  ]
            },
      ],
      relatedSlugs: ['architecture/data-flow', 'architecture/state-management'],
});
