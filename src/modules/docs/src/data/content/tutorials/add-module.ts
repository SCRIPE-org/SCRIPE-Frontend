import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "tutorials/add-module",
  titleKey: "tutorials.addModule.title",
  category: "tutorials",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addModule.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "tutorials.addModule.section_3_item_0",
      "tutorials.addModule.section_3_item_1",
      "tutorials.addModule.section_3_item_2"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addModule.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addModule.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_6_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addModule.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_8_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addModule.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_10_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addModule.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addModule.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_14_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addModule.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_16_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "tutorials.addModule.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addModule.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_20_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "src/modules/inventory/\n├── di.ts                        # Module DI container (wires sub-modules)\n├── index.ts                     # Public exports (barrel file)\n└── products/                    # Products sub-module folder\n    ├── index.ts                 # Sub-module barrel\n    ├── locales/                 # Translations owned by sub-module\n    │   ├── products.en.ts\n    │   ├── products.ar.ts\n    │   └── index.ts\n    └── src/\n        ├── domain/\n        │   ├── entities/\n        │   │   └── Product.ts   # Rich domain entity class\n        │   └── interfaces/\n        │       ├── IProductService.ts\n        │       └── IProductRepository.ts\n        ├── data/\n        │   ├── models/\n        │   │   └── ProductModel.ts  # API DTO (ProductModel)\n        │   ├── services/\n        │   │   └── ProductService.ts # Service layer\n        │   ├── mappers/\n        │   │   └── ProductMapper.ts # DTO ↔ Domain Entity Mapper\n        │   └── repositories/\n        │       └── ProductRepository.ts # Repository implementation\n        └── presentation/\n            ├── viewmodels/\n            │   └── useProductListViewModel.ts # UI-Logic ViewModel\n            ├── views/\n            │   └── ProductListView.tsx        # Pure presentation view\n            └── components/\n                ├── ProductStats.tsx\n                └── ProductFilters.tsx",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addModule.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_23_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "export interface ProductData {\n  id: string;\n  name: string;\n  sku: string;\n  price: number;\n  quantity: number;\n  category: string;\n  isActive: boolean;\n  tenantId: string;\n  createdAt: string;\n  updatedAt?: string;\n}\n\nexport class Product {\n  constructor(private readonly data: ProductData) {}\n\n  get id() { return this.data.id; }\n  get name() { return this.data.name; }\n  get sku() { return this.data.sku; }\n  get price() { return this.data.price; }\n  get quantity() { return this.data.quantity; }\n  get category() { return this.data.category; }\n  get isActive() { return this.data.isActive; }\n  get tenantId() { return this.data.tenantId; }\n  get createdAt() { return this.data.createdAt; }\n  get updatedAt() { return this.data.updatedAt; }\n\n  // Computed properties\n  get displayName() { return this.data.name || \"Unnamed\"; }\n\n  // Immutable update helper\n  copyWith(updates: Partial<ProductData>): Product {\n    return new Product({ ...this.data, ...updates });\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addModule.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "tutorials.addModule.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_27_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "import { PagedResult, ListParams } from '@core/common/types';\nimport { Product } from '../entities/Product';\n\nexport interface IProductRepository {\n  getAll(params: ListParams): Promise<PagedResult<Product>>;\n  getById(id: string): Promise<Product>;\n  create(data: CreateProductRequest): Promise<Product>;\n  update(id: string, data: Partial<CreateProductRequest>): Promise<Product>;\n  delete(id: string): Promise<void>;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "tutorials.addModule.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_30_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "import type { IApiService } from '@core/interfaces/api.interface';\nimport { API_ENDPOINTS, buildUrl } from '@core/config/api-endpoints';\nimport type { ProductModel } from '../models/ProductModel';\n\nexport class ProductService {\n  constructor(private readonly api: IApiService) {}\n\n  async getAll(params: ListParams): Promise<PagedResult<ProductModel>> {\n    const url = buildUrl(API_ENDPOINTS.INVENTORY.LIST, params);\n    return this.api.get<PagedResult<ProductModel>>(url);\n  }\n\n  async getById(id: string): Promise<ProductModel> {\n    return this.api.get<ProductModel>(`${API_ENDPOINTS.INVENTORY.BASE}/${id}`);\n  }\n\n  async create(data: CreateProductRequest): Promise<ProductModel> {\n    return this.api.post<ProductModel>(API_ENDPOINTS.INVENTORY.BASE, data);\n  }\n\n  async update(id: string, data: Partial<CreateProductRequest>): Promise<ProductModel> {\n    return this.api.put<ProductModel>(`${API_ENDPOINTS.INVENTORY.BASE}/${id}`, data);\n  }\n\n  async delete(id: string): Promise<void> {\n    await this.api.delete<void>(`${API_ENDPOINTS.INVENTORY.BASE}/${id}`);\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "tutorials.addModule.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_33_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "import { Product } from '../../domain/entities/Product';\nimport type { ProductModel } from '../models/ProductModel';\n\nexport class ProductMapper {\n  static toEntity(dto: ProductModel): Product {\n    // ALWAYS null-coalesce DTO fields in mappers to ensure type safety\n    return new Product({\n      id: dto.id ?? '',\n      name: dto.name ?? '',\n      sku: dto.sku ?? '',\n      price: dto.price ?? 0,\n      quantity: dto.quantity ?? 0,\n      category: dto.category ?? '',\n      isActive: dto.isActive ?? false,\n      tenantId: dto.tenantId ?? '',\n      createdAt: dto.createdAt ?? '',\n      updatedAt: dto.updatedAt,\n    });\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "tutorials.addModule.section_35_title",
    "id": "sec_35"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_36_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "import type { IProductRepository } from '../../domain/interfaces/IProductRepository';\nimport type { ProductService } from '../services/ProductService';\nimport { Product } from '../../domain/entities/Product';\nimport { ProductMapper } from '../mappers/ProductMapper';\n\nexport class ProductRepository implements IProductRepository {\n  constructor(private readonly service: ProductService) {}\n\n  async getAll(params: ListParams): Promise<PagedResult<Product>> {\n    const result = await this.service.getAll(params);\n    return {\n      items: result.items.map(ProductMapper.toEntity),\n      totalCount: result.totalCount,\n    };\n  }\n\n  async getById(id: string): Promise<Product> {\n    const model = await this.service.getById(id);\n    return ProductMapper.toEntity(model);\n  }\n\n  async create(data: CreateProductRequest): Promise<Product> {\n    const model = await this.service.create(data);\n    return ProductMapper.toEntity(model);\n  }\n\n  async update(id: string, data: Partial<CreateProductRequest>): Promise<Product> {\n    const model = await this.service.update(id, data);\n    return ProductMapper.toEntity(model);\n  }\n\n  async delete(id: string): Promise<void> {\n    await this.service.delete(id);\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addModule.section_38_title",
    "id": "sec_38"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_39_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "import { getModuleApiService } from '@core/services/api-factory';\nimport { ProductService } from './products/src/data/services/ProductService';\nimport { ProductRepository } from './products/src/data/repositories/ProductRepository';\nimport type { IProductRepository } from './products/src/domain/interfaces/IProductRepository';\n\nexport interface InventoryContainer {\n  productRepository: IProductRepository;\n}\n\nlet _container: InventoryContainer | null = null;\n\nfunction getInventoryContainer(): InventoryContainer {\n  if (!_container) {\n    const apiService = getModuleApiService('INVENTORY');\n    const productService = new ProductService(apiService);\n    _container = {\n      productRepository: new ProductRepository(productService),\n    };\n  }\n  return _container;\n}\n\nexport const inventoryContainer = {\n  get productRepository() {\n    return getInventoryContainer().productRepository;\n  },\n};",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addModule.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_42_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "'use client';\nimport { useCrudViewModel } from '@core/crud';\nimport { inventoryContainer } from '../../../di';\nimport { Product } from '../../domain/entities/Product';\nimport { column } from '@core/crud/helpers/column-helper';\nimport { useI18n } from '@core/providers/LanguageProvider';\n\nexport function useProductListViewModel() {\n  const repo = inventoryContainer.productRepository;\n  const { t } = useI18n();\n\n  const table = useCrudViewModel<Product, CreateProductRequest, Partial<CreateProductRequest>>(['products'], {\n    getAll: async (params) => {\n      const res = await repo.getAll(params);\n      return { items: res.items, pagination: { totalCount: res.totalCount } };\n    },\n    create: async (data) => {\n      await repo.create(data);\n    },\n    update: async (id, data) => {\n      await repo.update(id, data);\n    },\n    delete: async (id) => {\n      await repo.delete(id);\n    },\n  });\n\n  const columns = [\n    column.index('No'),\n    column.text('name', t('products.name')),\n    column.text('sku', t('products.sku')),\n    column.text('price', t('products.price')),\n    column.status('isActive', t('status'), {\n      true: { label: t('active'), variant: 'success' },\n      false: { label: t('inactive'), variant: 'danger' }\n    }),\n  ];\n\n  return { table, columns };\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addModule.section_44_title",
    "id": "sec_44"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_45_content"
  },
  {
    "type": "code",
    "language": "tsx",
    "code": "'use client';\nimport { GenericCrudView } from '@core/crud';\nimport { useProductListViewModel } from '../viewmodels/useProductListViewModel';\nimport { useI18n } from '@core/providers/LanguageProvider';\n\nexport function ProductListView() {\n  const { table, columns } = useProductListViewModel();\n  const { t } = useI18n();\n\n  return (\n    <GenericCrudView\n      crud={table}\n      columns={columns}\n      title={t('products.title')}\n      createButtonLabel={t('products.create')}\n    />\n  );\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addModule.section_47_title",
    "id": "sec_47"
  },
  {
    "type": "paragraph",
    "contentKey": "tutorials.addModule.section_48_content"
  },
  {
    "type": "code",
    "language": "tsx",
    "code": "import { Metadata } from 'next';\nimport { ProductListView } from '@modules/inventory';\n\nexport const metadata: Metadata = {\n  title: 'Inventory | SCRIPE',\n  description: 'Manage products and inventory',\n};\n\nexport default function InventoryPage() {\n  return <ProductListView />;\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "tutorials.addModule.section_50_title",
    "contentKey": "tutorials.addModule.section_50_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "tutorials.addModule.section_51_title",
    "id": "sec_51"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "tutorials.addModule.section_52_item_0",
      "tutorials.addModule.section_52_item_1",
      "tutorials.addModule.section_52_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/frontend",
  "frontend/crud-system",
  "tutorials/add-backend-module"
],
  lastUpdated: "2026-06-09",
});
