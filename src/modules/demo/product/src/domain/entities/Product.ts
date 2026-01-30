/**
 * Product Domain Model
 * 
 * Represents the core product entity in the domain layer.
 * This model is independent of external concerns and focuses
 * purely on product data and business logic.
 */

export interface ProductData {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "inactive" | "discontinued";
  supplier: string;
  createdAt: string;
  lastUpdated: string;
  description?: string;
  sku?: string;
  weight?: number;
  dimensions?: string;
  color?: string;
  material?: string;
  warranty?: string;
  tags?: string[];
  images?: string[];
  isUrgent?: boolean;
}

export class Product {
  public readonly id: string;
  public readonly name: string;
  public readonly category: string;
  public readonly price: number;
  public readonly stock: number;
  public readonly status: "active" | "inactive" | "discontinued";
  public readonly supplier: string;
  public readonly createdAt: string;
  public readonly lastUpdated: string;
  public readonly description?: string;
  public readonly sku?: string;
  public readonly weight?: number;
  public readonly dimensions?: string;
  public readonly color?: string;
  public readonly material?: string;
  public readonly warranty?: string;
  public readonly tags?: string[];
  public readonly images?: string[];
  public readonly isUrgent?: boolean;

  constructor(data: ProductData) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.price = data.price;
    this.stock = data.stock;
    this.status = data.status;
    this.supplier = data.supplier;
    this.createdAt = data.createdAt;
    this.lastUpdated = data.lastUpdated;
    this.description = data.description;
    this.sku = data.sku;
    this.weight = data.weight;
    this.dimensions = data.dimensions;
    this.color = data.color;
    this.material = data.material;
    this.warranty = data.warranty;
    this.tags = data.tags;
    this.images = data.images;
    this.isUrgent = data.isUrgent;
  }

  /**
   * Get product's display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Check if product is in stock
   */
  get isInStock(): boolean {
    return this.stock > 0;
  }

  /**
   * Check if product is low stock (less than 10 items)
   */
  get isLowStock(): boolean {
    return this.stock > 0 && this.stock < 10;
  }

  /**
   * Check if product is out of stock
   */
  get isOutOfStock(): boolean {
    return this.stock === 0;
  }

  /**
   * Get formatted price
   */
  get formattedPrice(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.price);
  }

  /**
   * Check if product is active
   */
  get isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Get stock status text
   */
  get stockStatus(): string {
    if (this.isOutOfStock) return 'Out of Stock';
    if (this.isLowStock) return 'Low Stock';
    return 'In Stock';
  }

  /**
   * Create a copy of the product with updated data
   */
  update(updates: Partial<ProductData>): Product {
    return new Product({
      id: this.id,
      name: this.name,
      category: this.category,
      price: this.price,
      stock: this.stock,
      status: this.status,
      supplier: this.supplier,
      createdAt: this.createdAt,
      lastUpdated: this.lastUpdated,
      description: this.description,
      sku: this.sku,
      weight: this.weight,
      dimensions: this.dimensions,
      color: this.color,
      material: this.material,
      warranty: this.warranty,
      tags: this.tags,
      images: this.images,
      isUrgent: this.isUrgent,
      ...updates,
    });
  }
}

/**
 * Create Product Request Model
 */
export interface CreateProductRequestData {
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "inactive" | "discontinued";
  supplier: string;
  description?: string;
  sku?: string;
  weight?: number;
  dimensions?: string;
  color?: string;
  material?: string;
  warranty?: string;
  tags?: string[];
  images?: string[];
}

export class CreateProductRequest {
  public readonly name: string;
  public readonly category: string;
  public readonly price: number;
  public readonly stock: number;
  public readonly status: "active" | "inactive" | "discontinued";
  public readonly supplier: string;
  public readonly description?: string;
  public readonly sku?: string;
  public readonly weight?: number;
  public readonly dimensions?: string;
  public readonly color?: string;
  public readonly material?: string;
  public readonly warranty?: string;
  public readonly tags?: string[];
  public readonly images?: string[];

  constructor(data: CreateProductRequestData) {
    this.name = data.name;
    this.category = data.category;
    this.price = data.price;
    this.stock = data.stock;
    this.status = data.status;
    this.supplier = data.supplier;
    this.description = data.description;
    this.sku = data.sku;
    this.weight = data.weight;
    this.dimensions = data.dimensions;
    this.color = data.color;
    this.material = data.material;
    this.warranty = data.warranty;
    this.tags = data.tags;
    this.images = data.images;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(
      this.name &&
      this.category &&
      this.price >= 0 &&
      this.stock >= 0 &&
      this.supplier
    );
  }
}

/**
 * Update Product Request Model
 */
export interface UpdateProductRequestData {
  id: string;
  name?: string;
  category?: string;
  price?: number;
  stock?: number;
  status?: "active" | "inactive" | "discontinued";
  supplier?: string;
  description?: string;
  sku?: string;
  weight?: number;
  dimensions?: string;
  color?: string;
  material?: string;
  warranty?: string;
  tags?: string[];
  images?: string[];
}

export class UpdateProductRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly category?: string;
  public readonly price?: number;
  public readonly stock?: number;
  public readonly status?: "active" | "inactive" | "discontinued";
  public readonly supplier?: string;
  public readonly description?: string;
  public readonly sku?: string;
  public readonly weight?: number;
  public readonly dimensions?: string;
  public readonly color?: string;
  public readonly material?: string;
  public readonly warranty?: string;
  public readonly tags?: string[];
  public readonly images?: string[];

  constructor(data: UpdateProductRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.price = data.price;
    this.stock = data.stock;
    this.status = data.status;
    this.supplier = data.supplier;
    this.description = data.description;
    this.sku = data.sku;
    this.weight = data.weight;
    this.dimensions = data.dimensions;
    this.color = data.color;
    this.material = data.material;
    this.warranty = data.warranty;
    this.tags = data.tags;
    this.images = data.images;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(
      this.id &&
      (this.price === undefined || this.price >= 0) &&
      (this.stock === undefined || this.stock >= 0)
    );
  }
}

