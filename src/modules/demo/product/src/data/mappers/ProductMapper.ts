/**
 * Product Mappers
 * 
 * Handles conversion between product domain models and external data formats.
 * Follows Single Responsibility Principle by separating serialization concerns
 * from domain logic.
 */

import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  type ProductData,
  type CreateProductRequestData,
  type UpdateProductRequestData
} from '../../domain/entities/Product';
import { type PaginationMetadata } from "@core/common/types/pagination";
import type { PaginationInfo } from '@core/common/types/pagination';

export interface ProductsResponse {
  data: Product[];
  pagination: PaginationInfo;
}

export class ProductMapper {
  /**
   * Convert JSON/API response to Product domain model
   */
  static fromJson(json: any): Product {
    return new Product({
      id: json.id || '',
      name: json.name || '',
      category: json.category || '',
      price: Number(json.price) || 0,
      stock: Number(json.stock) || 0,
      status: json.status || 'inactive',
      supplier: json.supplier || '',
      createdAt: json.createdAt || new Date().toISOString(),
      lastUpdated: json.lastUpdated || new Date().toISOString(),
      description: json.description,
      sku: json.sku,
      weight: json.weight ? Number(json.weight) : undefined,
      dimensions: json.dimensions,
      color: json.color,
      material: json.material,
      warranty: json.warranty,
      tags: json.tags || [],
      images: json.images || [],
      isUrgent: json.isUrgent || false,
    });
  }

  /**
   * Convert Product domain model to JSON for API requests
   */
  static toJson(product: Product): any {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      supplier: product.supplier,
      createdAt: product.createdAt,
      lastUpdated: product.lastUpdated,
      description: product.description,
      sku: product.sku,
      weight: product.weight,
      dimensions: product.dimensions,
      color: product.color,
      material: product.material,
      warranty: product.warranty,
      tags: product.tags,
      images: product.images,
      isUrgent: product.isUrgent,
    };
  }

  /**
   * Convert JSON/API response to CreateProductRequest domain model
   */
  static createRequestFromJson(json: any): CreateProductRequest {
    return new CreateProductRequest({
      name: json.name || '',
      category: json.category || '',
      price: Number(json.price) || 0,
      stock: Number(json.stock) || 0,
      status: json.status || 'active',
      supplier: json.supplier || '',
      description: json.description,
      sku: json.sku,
      weight: json.weight ? Number(json.weight) : undefined,
      dimensions: json.dimensions,
      color: json.color,
      material: json.material,
      warranty: json.warranty,
      tags: json.tags || [],
      images: json.images || [],
    });
  }

  /**
   * Convert CreateProductRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateProductRequest): any {
    return {
      name: request.name,
      category: request.category,
      price: request.price,
      stock: request.stock,
      status: request.status,
      supplier: request.supplier,
      description: request.description,
      sku: request.sku,
      weight: request.weight,
      dimensions: request.dimensions,
      color: request.color,
      material: request.material,
      warranty: request.warranty,
      tags: request.tags,
      images: request.images,
    };
  }

  /**
   * Convert JSON/API response to UpdateProductRequest domain model
   */
  static updateRequestFromJson(json: any): UpdateProductRequest {
    return new UpdateProductRequest({
      id: json.id || '',
      name: json.name,
      category: json.category,
      price: json.price ? Number(json.price) : undefined,
      stock: json.stock ? Number(json.stock) : undefined,
      status: json.status,
      supplier: json.supplier,
      description: json.description,
      sku: json.sku,
      weight: json.weight ? Number(json.weight) : undefined,
      dimensions: json.dimensions,
      color: json.color,
      material: json.material,
      warranty: json.warranty,
      tags: json.tags,
      images: json.images,
    });
  }

  /**
   * Convert UpdateProductRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateProductRequest): any {
    const json: any = { id: request.id };

    if (request.name !== undefined) json.name = request.name;
    if (request.category !== undefined) json.category = request.category;
    if (request.price !== undefined) json.price = request.price;
    if (request.stock !== undefined) json.stock = request.stock;
    if (request.status !== undefined) json.status = request.status;
    if (request.supplier !== undefined) json.supplier = request.supplier;
    if (request.description !== undefined) json.description = request.description;
    if (request.sku !== undefined) json.sku = request.sku;
    if (request.weight !== undefined) json.weight = request.weight;
    if (request.dimensions !== undefined) json.dimensions = request.dimensions;
    if (request.color !== undefined) json.color = request.color;
    if (request.material !== undefined) json.material = request.material;
    if (request.warranty !== undefined) json.warranty = request.warranty;
    if (request.tags !== undefined) json.tags = request.tags;
    if (request.images !== undefined) json.images = request.images;

    return json;
  }

  /**
   * Handle different API response formats and convert to ProductsResponse
   */
  static handleApiResponse(response: any): ProductsResponse {
    // Handle direct array response
    if (Array.isArray(response)) {
      return {
        data: response.map((item: any) => this.fromJson(item)),
        pagination: {
          itemsCount: response.length,
          pageSize: response.length,
          page: 1,
          pagesCount: 1,
        }
      };
    }

    // Handle paginated response with data property
    if (response && typeof response === 'object' && 'data' in response) {
      return {
        data: Array.isArray(response.data)
          ? response.data.map((item: any) => this.fromJson(item))
          : [],
        pagination: response.pagination || {
          itemsCount: 0,
          pageSize: 10,
          page: 1,
          pagesCount: 0,
        }
      };
    }

    // Handle single item response
    if (response && typeof response === 'object' && 'id' in response) {
      return {
        data: [this.fromJson(response)],
        pagination: {
          itemsCount: 1,
          pageSize: 1,
          page: 1,
          pagesCount: 1,
        }
      };
    }

    // Fallback for unexpected response format
    return {
      data: [],
      pagination: {
        itemsCount: 0,
        pageSize: 10,
        page: 1,
        pagesCount: 0,
      }
    };
  }
}

