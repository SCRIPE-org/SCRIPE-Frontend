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
├── di.ts                        # Module DI container (wires sub-modules)
├── index.ts                     # Public exports (barrel file)
└── products/                    # Products sub-module folder
    ├── index.ts                 # Sub-module barrel
    ├── locales/                 # Translations owned by sub-module
    │   ├── products.en.ts
    │   ├── products.ar.ts
    │   └── index.ts
    └── src/
        ├── domain/
        │   ├── entities/
        │   │   └── Product.ts   # Rich domain entity class
        │   └── interfaces/
        │       ├── IProductService.ts
        │       └── IProductRepository.ts
        ├── data/
        │   ├── models/
        │   │   └── ProductModel.ts  # API DTO (ProductModel)
        │   ├── services/
        │   │   └── ProductService.ts # Service layer
        │   ├── mappers/
        │   │   └── ProductMapper.ts # DTO ↔ Domain Entity Mapper
        │   └── repositories/
        │       └── ProductRepository.ts # Repository implementation
        └── presentation/
            ├── viewmodels/
            │   └── useProductListViewModel.ts # UI-Logic ViewModel
            ├── views/
            │   └── ProductListView.tsx        # Pure presentation view
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
    filename: "products/src/domain/entities/Product.ts",
    code: `export interface ProductData {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  category: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt?: string;
}

export class Product {
  constructor(private readonly data: ProductData) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get sku() { return this.data.sku; }
  get price() { return this.data.price; }
  get quantity() { return this.data.quantity; }
  get category() { return this.data.category; }
  get isActive() { return this.data.isActive; }
  get tenantId() { return this.data.tenantId; }
  get createdAt() { return this.data.createdAt; }
  get updatedAt() { return this.data.updatedAt; }

  // Computed properties
  get displayName() { return this.data.name || "Unnamed"; }

  // Immutable update helper
  copyWith(updates: Partial<ProductData>): Product {
    return new Product({ ...this.data, ...updates });
  }
}`,
  },

  // ─── Step 3: Service, Mapper, and Repository ──────────────
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
        label: "Domain Repository Interface",
        language: "typescript",
        filename: "products/src/domain/interfaces/IProductRepository.ts",
        code: `import { PagedResult, ListParams } from '@core/common/types';
import { Product } from '../entities/Product';

export interface IProductRepository {
  getAll(params: ListParams): Promise<PagedResult<Product>>;
  getById(id: string): Promise<Product>;
  create(data: CreateProductRequest): Promise<Product>;
  update(id: string, data: Partial<CreateProductRequest>): Promise<Product>;
  delete(id: string): Promise<void>;
}`,
      },
      {
        label: "Data Service",
        language: "typescript",
        filename: "products/src/data/services/ProductService.ts",
        code: `import type { IApiService } from '@core/interfaces/api.interface';
import { API_ENDPOINTS, buildUrl } from '@core/config/api-endpoints';
import type { ProductModel } from '../models/ProductModel';

export class ProductService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: ListParams): Promise<PagedResult<ProductModel>> {
    const url = buildUrl(API_ENDPOINTS.INVENTORY.LIST, params);
    return this.api.get<PagedResult<ProductModel>>(url);
  }

  async getById(id: string): Promise<ProductModel> {
    return this.api.get<ProductModel>(\`\${API_ENDPOINTS.INVENTORY.BASE}/\${id}\`);
  }

  async create(data: CreateProductRequest): Promise<ProductModel> {
    return this.api.post<ProductModel>(API_ENDPOINTS.INVENTORY.BASE, data);
  }

  async update(id: string, data: Partial<CreateProductRequest>): Promise<ProductModel> {
    return this.api.put<ProductModel>(\`\${API_ENDPOINTS.INVENTORY.BASE}/\${id}\`, data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete<void>(\`\${API_ENDPOINTS.INVENTORY.BASE}/\${id}\`);
  }
}`,
      },
      {
        label: "Data Mapper",
        language: "typescript",
        filename: "products/src/data/mappers/ProductMapper.ts",
        code: `import { Product } from '../../domain/entities/Product';
import type { ProductModel } from '../models/ProductModel';

export class ProductMapper {
  static toEntity(dto: ProductModel): Product {
    // ALWAYS null-coalesce DTO fields in mappers to ensure type safety
    return new Product({
      id: dto.id ?? '',
      name: dto.name ?? '',
      sku: dto.sku ?? '',
      price: dto.price ?? 0,
      quantity: dto.quantity ?? 0,
      category: dto.category ?? '',
      isActive: dto.isActive ?? false,
      tenantId: dto.tenantId ?? '',
      createdAt: dto.createdAt ?? '',
      updatedAt: dto.updatedAt,
    });
  }
}`,
      },
      {
        label: "Data Repository",
        language: "typescript",
        filename: "products/src/data/repositories/ProductRepository.ts",
        code: `import type { IProductRepository } from '../../domain/interfaces/IProductRepository';
import type { ProductService } from '../services/ProductService';
import { Product } from '../../domain/entities/Product';
import { ProductMapper } from '../mappers/ProductMapper';

export class ProductRepository implements IProductRepository {
  constructor(private readonly service: ProductService) {}

  async getAll(params: ListParams): Promise<PagedResult<Product>> {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map(ProductMapper.toEntity),
      totalCount: result.totalCount,
    };
  }

  async getById(id: string): Promise<Product> {
    const model = await this.service.getById(id);
    return ProductMapper.toEntity(model);
  }

  async create(data: CreateProductRequest): Promise<Product> {
    const model = await this.service.create(data);
    return ProductMapper.toEntity(model);
  }

  async update(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    const model = await this.service.update(id, data);
    return ProductMapper.toEntity(model);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
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
    code: `import { getModuleApiService } from '@core/services/api-factory';
import { ProductService } from './products/src/data/services/ProductService';
import { ProductRepository } from './products/src/data/repositories/ProductRepository';
import type { IProductRepository } from './products/src/domain/interfaces/IProductRepository';

export interface InventoryContainer {
  productRepository: IProductRepository;
}

let _container: InventoryContainer | null = null;

function getInventoryContainer(): InventoryContainer {
  if (!_container) {
    const apiService = getModuleApiService('INVENTORY');
    const productService = new ProductService(apiService);
    _container = {
      productRepository: new ProductRepository(productService),
    };
  }
  return _container;
}

export const inventoryContainer = {
  get productRepository() {
    return getInventoryContainer().productRepository;
  },
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
import { inventoryContainer } from '../../../di';
import { Product } from '../../domain/entities/Product';
import { column } from '@core/crud/helpers/column-helper';
import { useI18n } from '@core/providers/LanguageProvider';

export function useProductListViewModel() {
  const repo = inventoryContainer.productRepository;
  const { t } = useI18n();

  const table = useCrudViewModel<Product, CreateProductRequest, Partial<CreateProductRequest>>(['products'], {
    getAll: async (params) => {
      const res = await repo.getAll(params);
      return { items: res.items, pagination: { totalCount: res.totalCount } };
    },
    create: async (data) => {
      await repo.create(data);
    },
    update: async (id, data) => {
      await repo.update(id, data);
    },
    delete: async (id) => {
      await repo.delete(id);
    },
  });

  const columns = [
    column.index('No'),
    column.text('name', t('products.name')),
    column.text('sku', t('products.sku')),
    column.text('price', t('products.price')),
    column.status('isActive', t('status'), {
      true: { label: t('active'), variant: 'success' },
      false: { label: t('inactive'), variant: 'danger' }
    }),
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
    filename: "views/ProductListView.tsx — Pure UI (~60 lines max)",
    code: `'use client';
import { GenericCrudView } from '@core/crud';
import { useProductListViewModel } from '../viewmodels/useProductListViewModel';
import { useI18n } from '@core/providers/LanguageProvider';

export function ProductListView() {
  const { table, columns } = useProductListViewModel();
  const { t } = useI18n();

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
    code: `import { Metadata } from 'next';
import { ProductListView } from '@modules/inventory';

export const metadata: Metadata = {
  title: 'Inventory | SCRIPE',
  description: 'Manage products and inventory',
};

export default function InventoryPage() {
  return <ProductListView />;
}`,
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
