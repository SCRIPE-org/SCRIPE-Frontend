// FILE-EXCEPTION: file length
/**
 * @file add-module.ts
 * @description Tutorial document page guiding developers on how to add frontend/backend modules
 * and wire them into the monorepo ecosystem. Contains directories, configurations, and code snippets.
 */

import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "tutorials.addModule.intro" },

  // ─── Prerequisites ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addModule.prerequisitesTitle",
    id: "prerequisites",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "Node.js 18+ and pnpm installed",
      "Backend API running (see Quick Start guide)",
      "Understanding of SOLID View/ViewModel pattern",
    ],
  },

  // ─── Step-by-Step Guide ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addModule.stepsTitle",
    id: "steps",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "tutorials.addModule.step1Title",
        contentKey: "tutorials.addModule.step1Desc",
      },
      {
        titleKey: "tutorials.addModule.step2Title",
        contentKey: "tutorials.addModule.step2Desc",
      },
      {
        titleKey: "tutorials.addModule.step3Title",
        contentKey: "tutorials.addModule.step3Desc",
      },
      {
        titleKey: "tutorials.addModule.step4Title",
        contentKey: "tutorials.addModule.step4Desc",
      },
      {
        titleKey: "tutorials.addModule.step5Title",
        contentKey: "tutorials.addModule.step5Desc",
      },
      {
        titleKey: "tutorials.addModule.step6Title",
        contentKey: "tutorials.addModule.step6Desc",
      },
      {
        titleKey: "tutorials.addModule.step7Title",
        contentKey: "tutorials.addModule.step7Desc",
      },
    ],
  },

  // ─── Step 1: Module Structure ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addModule.structureTitle",
    id: "structure",
  },
  {
    type: "code",
    language: "text",
    filename: "Module Directory Structure",
    code: `src/modules/inventory/
├── di.ts                        # Module DI container
├── index.ts                     # Public exports
└── src/
    ├── domain/
    │   ├── entities/
    │   │   └── Product.ts       # Zod schema
    │   └── interfaces/
    │       └── IProductRepository.ts
    │
    ├── data/
    │   ├── models/
    │   │   └── ProductModel.ts  # API DTO
    │   ├── mappers/
    │   │   └── ProductMapper.ts # DTO ↔ Entity
    │   └── repositories/
    │       └── ProductRepository.ts
    │
    └── presentation/
        ├── viewmodels/
        │   ├── useProductListViewModel.ts    # Orchestrator
        │   ├── useProductStatsViewModel.ts   # Stats section
        │   └── useProductFilterViewModel.ts  # Filter section
        ├── views/
        │   └── ProductListView.tsx           # Pure UI
        └── components/
            ├── ProductStats.tsx
            └── ProductFilters.tsx`,
  },

  // ─── Step 2: Domain Entity ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addModule.entityTitle",
    id: "entity",
  },
  {
    type: "code",
    language: "typescript",
    filename: "domain/entities/Product.ts",
    code: `import { z } from 'zod';

/**
 * Exported constant defining parameters and fields for product schema configurations.
 */
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  sku: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  category: z.string(),
  isActive: z.boolean(),
  tenantId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * Exported type defining parameters and fields for product configurations.
 */
export type Product = z.infer<typeof ProductSchema>;

/**
 * Exported constant defining parameters and fields for create product schema configurations.
 */
export const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(0),
  category: z.string(),
});

/**
 * Exported type defining parameters and fields for create product input configurations.
 */
export type CreateProductInput = z.infer<typeof CreateProductSchema>;`,
  },

  // ─── Step 3: Repository ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addModule.repoTitle",
    id: "repository",
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Interface",
        language: "typescript",
        filename: "domain/interfaces/IProductRepository.ts",
        code: `import { Result } from '@core/common/Result';

/**
 * Repository layer implementing client request queries for i product.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IProductRepository {
  getAll(params: PaginationParams): Promise<Result<PaginatedResult<Product>>>;
  getById(id: string): Promise<Result<Product>>;
  create(data: CreateProductInput): Promise<Result<Product>>;
  update(id: string, data: UpdateProductInput): Promise<Result<Product>>;
  delete(id: string): Promise<Result<void>>;
}`,
      },
      {
        label: "Implementation",
        language: "typescript",
        filename: "data/repositories/ProductRepository.ts",
        code: `import { IApiService } from '@core/network';
import { ProductMapper } from '../mappers/ProductMapper';

/**
 * Repository layer implementing client request queries for product.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class ProductRepository implements IProductRepository {
  constructor(private api: IApiService) {}

  async getAll(params: PaginationParams) {
    const response = await this.api.get<PaginatedDto<ProductModel>>(
      '/api/v1/products', { params }
    );
    return Result.ok({
      items: response.data.items.map(ProductMapper.toDomain),
      totalCount: response.data.totalCount,
      page: response.data.page,
      pageSize: response.data.pageSize,
    });
  }

  async create(data: CreateProductInput) {
    const response = await this.api.post<ProductModel>(
      '/api/v1/products', data
    );
    return Result.ok(ProductMapper.toDomain(response.data));
  }
}`,
      },
    ],
  },

  // ─── Step 4: DI Container ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addModule.diTitle",
    id: "di",
  },
  {
    type: "code",
    language: "typescript",
    filename: "di.ts — Module DI Container",
    code: `import { coreContainer } from '@core/di';
import { ProductRepository } from './src/data/repositories/ProductRepository';

/**
 * Exported constant defining parameters and fields for container configurations.
 */
export const container = {
  productRepository: new ProductRepository(coreContainer.apiService),
};`,
  },

  // ─── Step 5: ViewModel ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addModule.viewModelTitle",
    id: "viewmodel",
  },
  {
    type: "code",
    language: "typescript",
    filename: "useProductListViewModel.ts — Orchestrator",
    code: `'use client';
import { useCrudViewModel } from '@core/crud';
import { container } from '../../../di';

/**
 * React hook/ViewModel orchestrating state and data flows for product list view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useProductListViewModel() {
  const repo = container.productRepository;

  const table = useCrudViewModel({
    queryKey: 'products',
    fetchFn: (params) => repo.getAll(params),
    createFn: (data) => repo.create(data),
    updateFn: (id, data) => repo.update(id, data),
    deleteFn: (id) => repo.delete(id),
    enableSelection: true,
  });

  const columns = [
    column.index('No'),
    column.text('name', t('products.name')),
    column.text('sku', t('products.sku')),
    column.text('price', t('products.price')),
    column.status('isActive', t('status'), statusMap),
  ];

  return { table, columns };
}`,
  },

  // ─── Step 6: View ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addModule.viewTitle",
    id: "view",
  },
  {
    type: "code",
    language: "tsx",
    filename: "views/ProductListView.tsx — Pure UI (~20 lines)",
    code: `'use client';
import { GenericCrudView } from '@core/crud';
import { useProductListViewModel } from '../viewmodels/useProductListViewModel';

/**
 * Presentation UI component rendering the product list view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ProductListView() {
  const { table, columns } = useProductListViewModel();

  return (
    <GenericCrudView
      crud={table}
      columns={columns}
      title={t('products.title')}
      createButtonLabel={t('products.create')}
    />
  );
}`,
  },

  // ─── Step 7: Route ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.addModule.routeTitle",
    id: "route",
  },
  {
    type: "code",
    language: "tsx",
    filename: "src/app/(modules)/inventory/page.tsx — Server Connector",
    code:
      `import { Metadata } from 'next';\n` +
      `import { ProductListView } from '` +
      `@modules/inventory';\n\n` +
      `export const metadata: Metadata = {\n` +
      `  title: 'Inventory | SCRIPE',\n` +
      `  description: 'Manage products and inventory',\n` +
      `};\n\n` +
      `export default function InventoryPage() {\n` +
      `  return <ProductListView />;\n` +
      `}`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "tutorials.addModule.checklist",
  },
];

registerPage({
  slug: "tutorials/add-module",
  titleKey: "tutorials.addModule.title",
  descriptionKey: "tutorials.addModule.description",
  category: "tutorials",
  order: 1,
  sections,
  relatedSlugs: ["architecture/frontend", "frontend/crud-system", "tutorials/add-backend-module"],
  lastUpdated: "2026-02-20",
});
