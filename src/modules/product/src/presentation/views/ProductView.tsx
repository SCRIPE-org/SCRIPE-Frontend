"use client";

import { GenericCrudView } from "@core/ui/generic-crud-view";
import { Product } from "../../domain/entities/Product";
import type { CrudConfig } from "@core/ui/generic-crud-view";
import { Badge } from "@core/ui/badge";
import {
  Package,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { useMemo } from "react";
import { useProductViewModel } from "../viewmodels/useProductViewModel";
import { useI18n } from "@core/providers/i18n-provider";

export function ProductView() {
  const { t } = useI18n();
  const { vm, getConfigBase, handleDelete, categories, vendors, searchCategories, searchVendors } = useProductViewModel();
  const configBase = getConfigBase();

  // Configuration for the generic view (UI components stay in view)
  const config: CrudConfig<Product> = useMemo(
    () => ({
      titleKey: "product.title",
      subtitleKey: "product.description",
      columns: [
        {
          key: "product",
          label: t("product.product"),
          render: (_val: unknown, product: Product) => (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {product.displayName}
                </div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                  {product.category}
                </div>
              </div>
            </div>
          ),
        },
        {
          key: "price",
          label: t("product.price"),
          render: (_val: unknown, product: Product) => (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/70" />
              <span className="text-sm text-foreground font-medium">
                {product.formattedPrice}
              </span>
            </div>
          ),
        },
        {
          key: "stock",
          label: t("product.stock"),
          render: (_val: unknown, product: Product) => (
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground font-medium">
                {product.stock}
              </span>
              {product.isUrgent && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
            </div>
          ),
        },
        {
          key: "supplier",
          label: t("product.supplier"),
          render: (_val: unknown, product: Product) => (
            <span className="text-sm text-foreground">{product.supplier}</span>
          ),
        },
        {
          key: "status",
          label: t("product.status"),
          render: (_val: unknown, product: Product) => (
            <div>
              <Badge
                className="mx-2"
                variant={product.isActive ? "active" : "inactive"}
              >
                {product.isActive ? t("product.active") : t("product.inactive")}
              </Badge>
              <Badge
                variant={product.isInStock ? "default" : "destructive"}
                className="text-xs"
              >
                {product.stockStatus}
              </Badge>
            </div>
          ),
        },
      ],
      ...configBase,
      getActions: (vm: any, t: any, handleDelete) => [
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
    }),
    [t, vm, handleDelete, configBase]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
