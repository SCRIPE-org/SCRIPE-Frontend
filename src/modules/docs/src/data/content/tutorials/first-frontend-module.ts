import { registerPage } from '../../repositories/DocsRepository';
import type { DocPageData } from '../../../domain/entities/DocPage';

const page: DocPageData = {
      slug: 'tutorials/first-frontend-module', titleKey: 'tutorials.firstFrontendModule.title', descriptionKey: 'tutorials.firstFrontendModule.description', category: 'tutorials', order: 2,
      sections: [
            { type: 'info', variant: 'note', contentKey: 'tutorials.firstFrontendModule.description' },
            {
                  type: 'flowchart', title: 'Frontend Module Structure', direction: 'vertical',
                  nodes: [
                        { id: 'domain', label: '1. Domain (Entities + Interfaces)', type: 'primary' },
                        { id: 'data', label: '2. Data (Repository + Mappers)', type: 'info' },
                        { id: 'vm', label: '3. ViewModels (Hooks)', type: 'success' },
                        { id: 'view', label: '4. View (Pure UI)', type: 'warning' },
                        { id: 'route', label: '5. Route Registration', type: 'danger' },
                  ],
                  connections: [
                        { from: 'domain', to: 'data' }, { from: 'data', to: 'vm' }, { from: 'vm', to: 'view' }, { from: 'view', to: 'route' },
                  ],
            },
            {
                  type: 'step-guide', steps: [
                        {
                              titleKey: 'tutorials.firstFrontendModule.title', contentKey: 'tutorials.firstFrontendModule.description',
                              code: `// src/modules/products/src/domain/entities/Product.ts
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;`, codeLanguage: 'typescript', codeFilename: 'domain/entities/Product.ts'
                        },
                        {
                              titleKey: 'tutorials.firstFrontendModule.title', contentKey: 'tutorials.firstFrontendModule.description',
                              code: `// src/modules/products/src/presentation/viewmodels/useProductsViewModel.ts
'use client';

import { useCrudViewModel } from '@core/crud';
import { container } from '../../../di';

export function useProductsViewModel() {
  const crud = useCrudViewModel({
    queryKey: ['products'],
    repository: container.productRepository,
  });

  const columns = [
    column.index('No'),
    column.text('name', 'Name'),
    column.text('price', 'Price'),
    column.status('isActive', 'Status', { true: 'Active', false: 'Inactive' }),
  ];

  return { ...crud, columns };
}`, codeLanguage: 'typescript', codeFilename: 'viewmodels/useProductsViewModel.ts'
                        },
                        {
                              titleKey: 'tutorials.firstFrontendModule.title', contentKey: 'tutorials.firstFrontendModule.description',
                              code: `// src/modules/products/src/presentation/views/ProductsView.tsx
'use client';

import { useProductsViewModel } from '../viewmodels/useProductsViewModel';
import { GenericCrudView } from '@core/crud';

export function ProductsView() {
  const vm = useProductsViewModel();

  return (
    <div>
      <h1>Products</h1>
      <GenericCrudView {...vm} columns={vm.columns} />
    </div>
  );
}`, codeLanguage: 'typescript', codeFilename: 'views/ProductsView.tsx'
                        },
                  ]
            },
      ],
      relatedSlugs: ['architecture/solid-pattern', 'architecture/frontend', 'frontend/crud-engine'],
};
registerPage(page);
