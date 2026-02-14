import { registerPage } from '../../repositories/DocsRepository';
registerPage({
      slug: 'architecture/solid-pattern', titleKey: 'architecture.solidPattern.title', descriptionKey: 'architecture.solidPattern.description', category: 'architecture', order: 6,
      sections: [
            { type: 'paragraph', contentKey: 'architecture.solidPattern.description' },
            {
                  type: 'table', headers: ['Principle', 'Application'],
                  rows: [
                        ['S — Single Responsibility', 'Each ViewModel handles ONE concern'],
                        ['O — Open/Closed', 'Base hooks extended, not modified'],
                        ['L — Liskov Substitution', 'All ViewModels return consistent interfaces'],
                        ['I — Interface Segregation', 'Components receive only needed props'],
                        ['D — Dependency Inversion', 'Views depend on ViewModel interfaces'],
                  ],
            },
            {
                  type: 'tabs', tabs: [
                        {
                              label: 'View (~60 lines)', language: 'typescript', filename: 'PageView.tsx', code: `'use client';

export function PageView() {
  const vm = usePageViewModel();
  
  return (
    <div>
      <FilterSection {...vm.filters} />
      <StatisticsSection {...vm.statistics} />
      <GenericCrudView crud={vm.table} columns={vm.columns} />
    </div>
  );
}` },
                        {
                              label: 'ViewModel', language: 'typescript', filename: 'usePageViewModel.ts', code: `export function usePageViewModel() {
  const statistics = useStatisticsViewModel();
  const filters = useFilterViewModel();
  const table = useCrudViewModel(config);
  const columns = [...]; // Defined here
  
  return { statistics, filters, table, columns };
}` },
                  ]
            },
            { type: 'info', variant: 'tip', contentKey: 'architecture.solidPattern.description' },
      ],
      relatedSlugs: ['architecture/frontend', 'architecture/modules'],
});
