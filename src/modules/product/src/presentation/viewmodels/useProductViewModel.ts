/**
 * Product View Model
 * 
 * Handles all state management for the Product view.
 * Extracted from product-view.tsx to separate business logic from UI.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { getProductContainer } from "@/modules/product/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../../domain/entities/Product";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";

// Mock Category interface for demonstration
interface Category {
  id: string;
  name: string;
  description?: string;
}

// Mock Vendor interface for demonstration
interface Vendor {
  id: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
}

export function useProductViewModel() {
  const { productRepository: productService } = getProductContainer();
  const { t } = useI18n();

  // Mock categories - In real app, this would come from a service
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Electronics", description: "Electronic products" },
    { id: "2", name: "Clothing", description: "Apparel and clothing items" },
    { id: "3", name: "Food & Beverages", description: "Food and drink items" },
    { id: "4", name: "Books", description: "Books and magazines" },
    { id: "5", name: "Home & Garden", description: "Home and garden supplies" },
    { id: "6", name: "Sports", description: "Sports and outdoor items" },
    { id: "7", name: "Toys", description: "Toys and games" },
    { id: "8", name: "Health & Beauty", description: "Health and beauty products" },
  ]);

  // Mock vendors - In real app, this would come from a service
  const [vendors, setVendors] = useState<Vendor[]>([
    { id: "v1", name: "TechCorp Inc.", companyName: "TechCorp Inc.", email: "contact@techcorp.com", phone: "+1-555-0101" },
    { id: "v2", name: "Global Supplies Co.", companyName: "Global Supplies Co.", email: "info@globalsupplies.com", phone: "+1-555-0102" },
    { id: "v3", name: "Premium Distributors", companyName: "Premium Distributors LLC", email: "sales@premiumdist.com", phone: "+1-555-0103" },
    { id: "v4", name: "Best Wholesale Ltd.", companyName: "Best Wholesale Ltd.", email: "orders@bestwholesale.com", phone: "+1-555-0104" },
    { id: "v5", name: "Elite Trading", companyName: "Elite Trading Corp", email: "hello@elitetrading.com", phone: "+1-555-0105" },
    { id: "v6", name: "Mega Supplier", companyName: "Mega Supplier Inc.", email: "support@megasupplier.com", phone: "+1-555-0106" },
    { id: "v7", name: "Direct Imports", companyName: "Direct Imports Group", email: "info@directimports.com", phone: "+1-555-0107" },
    { id: "v8", name: "Quality Products Co.", companyName: "Quality Products Co.", email: "contact@qualityproducts.com", phone: "+1-555-0108" },
  ]);

  // Server search function for categories
  // In production, this would call your actual category API service
  // Example: const response = await categoryService.searchCategories(query);
  const searchCategories = useCallback(async (query: string): Promise<{ value: string; label: string }[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // In production, replace this with actual API call:
    // const response = await categoryService.searchCategories({ 
    //   search: query, 
    //   page: 1, 
    //   pageSize: 50 
    // });
    // return response.data.map(cat => ({ value: cat.id, label: cat.name }));

    // Filter categories based on query
    const filtered = categories.filter(cat =>
      cat.name.toLowerCase().includes(query.toLowerCase()) ||
      cat.description?.toLowerCase().includes(query.toLowerCase())
    );

    // Map to form options format
    // IMPORTANT: value = ID (stored in DB), label = Display Name (shown to user)
    return filtered.map(cat => ({
      value: cat.id,  // ID as the value (saved to database)
      label: cat.name  // Name as the label (displayed to user)
    }));
  }, [categories]);

  // Server search function for vendors
  // In production, this would call your actual vendor API service
  // Example: const response = await vendorService.searchVendors(query);
  const searchVendors = useCallback(async (query: string): Promise<{ value: string; label: string }[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // In production, replace this with actual API call:
    // const response = await vendorService.searchVendors({ 
    //   search: query, 
    //   page: 1, 
    //   pageSize: 50 
    // });
    // return response.data.map(vendor => ({ value: vendor.id, label: vendor.name }));

    // Filter vendors based on query (search by name, company, email)
    const filtered = vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(query.toLowerCase()) ||
      vendor.companyName?.toLowerCase().includes(query.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(query.toLowerCase())
    );

    // Map to form options format
    // IMPORTANT: value = ID (stored in DB), label = Display Name (shown to user)
    return filtered.map(vendor => ({
      value: vendor.id,  // ID as the value (saved to database)
      label: vendor.name  // Name as the label (displayed to user)
    }));
  }, [vendors]);

  // Use generic CRUD view model (React Query Engine)
  const vm = useCrudViewModel<
    Product,
    CreateProductRequest,
    UpdateProductRequest
  >(
    ["products"], // Query Key for caching
    {
      getAll: async (params) => {
        const res = await productService.getProducts(params);
        return { items: res.data || [], pagination: res.pagination };
      },
      create: productService.createProduct.bind(productService),
      update: productService.updateProduct.bind(productService),
      delete: productService.deleteProduct.bind(productService),
    }
  );

  // Handler for delete action
  const handleDelete = useCallback(async (product: Product) => {
    await productService.deleteProduct(product.id);
    await vm.refreshItems();
  }, [productService, vm]);

  // Get config base data (UI components will be added in view)
  const getConfigBase = useCallback(() => ({
    createFields: [
      {
        name: "name",
        label: t("product.name"),
        type: "text" as const,
        placeholder: t("product.namePlaceholder"),
        required: true,
      },
      {
        name: "category",
        label: t("product.category"),
        type: "searchable-select" as const,
        placeholder: t("product.categoryPlaceholder"),
        searchPlaceholder: "Search categories...",
        searchType: "server" as const,
        onServerSearch: searchCategories,
        required: true,
        // Optional: Static options as fallback
        options: categories.map(cat => ({
          value: cat.id,
          label: cat.name
        })),
      },
      {
        name: "price",
        label: t("product.price"),
        type: "number" as const,
        placeholder: t("product.pricePlaceholder"),
        required: true,
        min: 0,
        step: 0.01,
      },
      {
        name: "stock",
        label: t("product.stock"),
        type: "number" as const,
        placeholder: t("product.stockPlaceholder"),
        required: true,
        min: 0,
      },
      {
        name: "vendor",
        label: "Vendor",
        type: "searchable-select" as const,
        placeholder: "Select vendor...",
        searchPlaceholder: "Search vendors...",
        searchType: "server" as const,
        onServerSearch: searchVendors,
        required: true,
        // Optional: Static options as fallback
        options: vendors.map(v => ({
          value: v.id,
          label: v.name
        })),
      },
      {
        name: "supplier",
        label: t("product.supplier"),
        type: "text" as const,
        placeholder: t("product.supplierPlaceholder"),
      },
      {
        name: "status",
        label: t("product.status"),
        type: "select" as const,
        options: [
          { value: "active", label: t("product.active") },
          { value: "inactive", label: t("product.inactive") },
          { value: "discontinued", label: t("product.discontinued") },
        ],
        required: true,
      },
      {
        name: "description",
        label: t("product.description"),
        type: "textarea" as const,
        placeholder: t("product.descriptionPlaceholder"),
      },
      {
        name: "sku",
        label: t("product.sku"),
        type: "text" as const,
        placeholder: t("product.skuPlaceholder"),
      },
      {
        name: "weight",
        label: t("product.weight"),
        type: "number" as const,
        placeholder: t("product.weightPlaceholder"),
        min: 0,
        step: 0.1,
      },
      {
        name: "dimensions",
        label: t("product.dimensions"),
        type: "text" as const,
        placeholder: t("product.dimensionsPlaceholder"),
      },
      {
        name: "color",
        label: t("product.color"),
        type: "text" as const,
        placeholder: t("product.colorPlaceholder"),
      },
      {
        name: "material",
        label: t("product.material"),
        type: "text" as const,
        placeholder: t("product.materialPlaceholder"),
      },
      {
        name: "warranty",
        label: t("product.warranty"),
        type: "text" as const,
        placeholder: t("product.warrantyPlaceholder"),
      },
    ],
    editFields: [
      {
        name: "name",
        label: t("product.name"),
        type: "text" as const,
        placeholder: t("product.namePlaceholder"),
        required: true,
      },
      {
        name: "category",
        label: t("product.category"),
        type: "searchable-select" as const,
        placeholder: t("product.categoryPlaceholder"),
        searchPlaceholder: "Search categories...",
        searchType: "server" as const,
        onServerSearch: searchCategories,
        required: true,
        // Optional: Static options as fallback
        options: categories.map(cat => ({
          value: cat.id,
          label: cat.name
        })),
      },
      {
        name: "price",
        label: t("product.price"),
        type: "number" as const,
        placeholder: t("product.pricePlaceholder"),
        required: true,
        min: 0,
        step: 0.01,
      },
      {
        name: "stock",
        label: t("product.stock"),
        type: "number" as const,
        placeholder: t("product.stockPlaceholder"),
        required: true,
        min: 0,
      },
      {
        name: "vendor",
        label: "Vendor",
        type: "searchable-select" as const,
        placeholder: "Select vendor...",
        searchPlaceholder: "Search vendors...",
        searchType: "server" as const,
        onServerSearch: searchVendors,
        required: true,
        // Optional: Static options as fallback
        options: vendors.map(v => ({
          value: v.id,
          label: v.name
        })),
      },
      {
        name: "supplier",
        label: t("product.supplier"),
        type: "text" as const,
        placeholder: t("product.supplierPlaceholder"),
      },
      {
        name: "status",
        label: t("product.status"),
        type: "select" as const,
        options: [
          { value: "active", label: t("product.active") },
          { value: "inactive", label: t("product.inactive") },
          { value: "discontinued", label: t("product.discontinued") },
        ],
        required: true,
      },
      {
        name: "description",
        label: t("product.description"),
        type: "textarea" as const,
        placeholder: t("product.descriptionPlaceholder"),
      },
      {
        name: "sku",
        label: t("product.sku"),
        type: "text" as const,
        placeholder: t("product.skuPlaceholder"),
      },
      {
        name: "weight",
        label: t("product.weight"),
        type: "number" as const,
        placeholder: t("product.weightPlaceholder"),
        min: 0,
        step: 0.1,
      },
      {
        name: "dimensions",
        label: t("product.dimensions"),
        type: "text" as const,
        placeholder: t("product.dimensionsPlaceholder"),
      },
      {
        name: "color",
        label: t("product.color"),
        type: "text" as const,
        placeholder: t("product.colorPlaceholder"),
      },
      {
        name: "material",
        label: t("product.material"),
        type: "text" as const,
        placeholder: t("product.materialPlaceholder"),
      },
      {
        name: "warranty",
        label: t("product.warranty"),
        type: "text" as const,
        placeholder: t("product.warrantyPlaceholder"),
      },
      { name: "id", type: "hidden" as const, required: true },
    ],
    createInitialValues: {
      status: "active",
      stock: 0,
      price: 0,
    },
    editInitialValues: (product: Product) => {
      // Find the vendor by ID to get proper label if needed
      // Note: If your Product model doesn't have vendor, you can add it or handle it differently
      const vendorId = (product as any).vendor; // Type assertion if vendor field exists
      const vendor = vendors.find(v => v.id === vendorId);
      const categoryData = categories.find(c => c.id === product.category);

      return {
        name: product.name,
        category: categoryData ? categoryData.id : product.category, // Use ID for category
        price: product.price,
        stock: product.stock,
        vendor: vendor ? vendor.id : vendorId, // Use ID for vendor
        supplier: product.supplier,
        status: product.status,
        description: product.description || "",
        sku: product.sku || "",
        weight: product.weight || 0,
        dimensions: product.dimensions || "",
        color: product.color || "",
        material: product.material || "",
        warranty: product.warranty || "",
        id: product.id,
      };
    },
    getActions: (vm: any, t: any, handleDelete: (item: Product) => void) => [
      {
        label: t("common.view"),
        onClick: (item: Product) => vm.openViewModal(item),
        variant: "ghost" as const,
      },
      {
        label: t("common.edit"),
        onClick: (item: Product) => vm.openEditModal(item),
        variant: "ghost" as const,
      },
      {
        label: t("common.delete"),
        onClick: (item: Product) => handleDelete?.(item),
        variant: "ghost" as const,
        className: "text-red-600 hover:text-red-700",
      },
    ],
    getItemDisplayName: (product: Product) => product.displayName,
    enableBulkActions: false,
    customTableProps: {
      // Let the settings page control the table style
    },
  }), [t, handleDelete, searchCategories, categories, searchVendors, vendors]);

  return {
    vm,
    getConfigBase,
    handleDelete,
    categories,
    vendors,
    searchCategories,
    searchVendors,
    t,
  };
}

