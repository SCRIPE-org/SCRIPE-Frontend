/**
 * Product Service
 *
 * Handles Product CRUD operations with dummy data for demo purposes.
 * Uses domain models and follows clean architecture principles.
 */

import type { INotificationService } from "@core/services/notification.service";
import type { PaginationInfo } from "@core/common/pagination";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../../domain/entities/Product";
import { ProductMapper, type ProductsResponse } from "../mappers/ProductMapper";

export interface IProductRepository {
  getProducts(params?: {
    page?: number;
    pageSize?: number;
    PageSearch?: string;
  }): Promise<ProductsResponse>;
  getProductById(id: string): Promise<Product>;
  createProduct(data: CreateProductRequest): Promise<Product>;
  updateProduct(id: string, data: UpdateProductRequest): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
}

export class ProductRepository implements IProductRepository {
  private products: Product[] = [];
  private nextId = 1;

  constructor(private notificationService: INotificationService) {
    this.initializeDummyData();
  }

  private initializeDummyData() {
    const dummyData = [
      {
        id: "1",
        name: "MacBook Pro 16-inch",
        category: "ElectroncBook Pro",
        price: 2499.99,
        stock: 15,
        status: "active" as const,
        supplier: "Apple Inc.",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        description: "Powerful laptop for professionals",
        sku: "MBP16-001",
        weight: 2.0,
        dimensions: "35.57 x 24.81 x 1.68 cm",
        color: "Space Gray",
        material: "Aluminum",
        warranty: "1 year",
        tags: ["laptop", "apple", "professional"],
        images: ["/placeholder.jpg"],
        isUrgent: false,
      },
      {
        id: "2",
        name: "iPhone 15 Pro",
        category: "Electronics",
        price: 999.99,
        stock: 3,
        status: "active" as const,
        supplier: "Apple Inc.",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        description: "Latest iPhone with advanced features",
        sku: "IPH15P-001",
        weight: 0.187,
        dimensions: "14.67 x 7.15 x 0.83 cm",
        color: "Natural Titanium",
        material: "Titanium",
        warranty: "1 year",
        tags: ["phone", "apple", "smartphone"],
        images: ["/placeholder.jpg"],
        isUrgent: true,
      },
      {
        id: "3",
        name: "Samsung Galaxy S24 Ultra",
        category: "Electronics",
        price: 1199.99,
        stock: 8,
        status: "active" as const,
        supplier: "Samsung Electronics",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        description: "Premium Android smartphone",
        sku: "SGS24U-001",
        weight: 0.232,
        dimensions: "16.24 x 7.9 x 0.88 cm",
        color: "Titanium Black",
        material: "Titanium",
        warranty: "1 year",
        tags: ["phone", "samsung", "android"],
        images: ["/placeholder.jpg"],
        isUrgent: false,
      },
      {
        id: "4",
        name: "Dell XPS 13",
        category: "Electronics",
        price: 1299.99,
        stock: 0,
        status: "inactive" as const,
        supplier: "Dell Technologies",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        description: "Compact ultrabook for productivity",
        sku: "DXPS13-001",
        weight: 1.27,
        dimensions: "29.57 x 19.88 x 1.45 cm",
        color: "Platinum Silver",
        material: "Aluminum",
        warranty: "1 year",
        tags: ["laptop", "dell", "ultrabook"],
        images: ["/placeholder.jpg"],
        isUrgent: false,
      },
      {
        id: "5",
        name: "Sony WH-1000XM5",
        category: "Audio",
        price: 399.99,
        stock: 25,
        status: "active" as const,
        supplier: "Sony Corporation",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        description: "Premium noise-canceling headphones",
        sku: "SWH1000XM5-001",
        weight: 0.25,
        dimensions: "20.5 x 18.5 x 8.5 cm",
        color: "Black",
        material: "Plastic",
        warranty: "2 years",
        tags: ["headphones", "sony", "noise-canceling"],
        images: ["/placeholder.jpg"],
        isUrgent: false,
      },
    ];

    this.products = dummyData.map((data) => ProductMapper.fromJson(data));
    this.nextId = this.products.length + 1;
  }

  async getProducts(params?: {
    page?: number;
    pageSize?: number;
    PageSearch?: string;
  }): Promise<ProductsResponse> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      let filteredProducts = [...this.products];

      // Apply search filter
      if (params?.PageSearch) {
        const searchTerm = params.PageSearch.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.supplier.toLowerCase().includes(searchTerm) ||
            product.sku?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply pagination
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      const pagination: PaginationInfo = {
        itemsCount: filteredProducts.length,
        pageSize,
        page,
        pagesCount: Math.ceil(filteredProducts.length / pageSize),
      };

      return {
        data: paginatedProducts,
        pagination,
      };
    } catch (e) {
      this.notificationService.error("Failed to fetch products");
      throw e;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      const product = this.products.find((p) => p.id === id);
      if (!product) {
        throw new Error(`Product with id ${id} not found`);
      }
      return product;
    } catch (e) {
      this.notificationService.error("Failed to fetch product");
      throw e;
    }
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newProduct = new Product({
        id: String(this.nextId++),
        name: data.name,
        category: data.category,
        price: data.price,
        stock: data.stock,
        status: data.status,
        supplier: data.supplier,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        description: data.description,
        sku: data.sku,
        weight: data.weight,
        dimensions: data.dimensions,
        color: data.color,
        material: data.material,
        warranty: data.warranty,
        tags: data.tags,
        images: data.images,
      });

      this.products.push(newProduct);
      this.notificationService.success("Product created successfully");
      return newProduct;
    } catch (e) {
      this.notificationService.error("Failed to create product");
      throw e;
    }
  }

  async updateProduct(
    id: string,
    data: UpdateProductRequest
  ): Promise<Product> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const productIndex = this.products.findIndex((p) => p.id === id);
      if (productIndex === -1) {
        throw new Error(`Product with id ${id} not found`);
      }

      const existingProduct = this.products[productIndex];
      const updatedProduct = existingProduct.update({
        name: data.name ?? existingProduct.name,
        category: data.category ?? existingProduct.category,
        price: data.price ?? existingProduct.price,
        stock: data.stock ?? existingProduct.stock,
        status: data.status ?? existingProduct.status,
        supplier: data.supplier ?? existingProduct.supplier,
        lastUpdated: new Date().toISOString(),
        description: data.description ?? existingProduct.description,
        sku: data.sku ?? existingProduct.sku,
        weight: data.weight ?? existingProduct.weight,
        dimensions: data.dimensions ?? existingProduct.dimensions,
        color: data.color ?? existingProduct.color,
        material: data.material ?? existingProduct.material,
        warranty: data.warranty ?? existingProduct.warranty,
        tags: data.tags ?? existingProduct.tags,
        images: data.images ?? existingProduct.images,
      });

      this.products[productIndex] = updatedProduct;
      this.notificationService.success("Product updated successfully");
      return updatedProduct;
    } catch (e) {
      this.notificationService.error("Failed to update product");
      throw e;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const productIndex = this.products.findIndex((p) => p.id === id);
      if (productIndex === -1) {
        throw new Error(`Product with id ${id} not found`);
      }

      this.products.splice(productIndex, 1);
      this.notificationService.success("Product deleted successfully");
    } catch (e) {
      this.notificationService.error("Failed to delete product");
      throw e;
    }
  }
}
