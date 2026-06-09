"use client";

import { useCategoriesViewModel } from "../viewmodels/useCategoriesViewModel";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Trash2, Tag, Plus, Pencil } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";

export function CategoriesView() {
  useModuleLocales(() => import("../../../locales"), "marketplace-categories");
  const vm = useCategoriesViewModel();
  const { t, language } = useI18n();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("marketplace.categoriesTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {vm.stats.total} {t("marketplace.categoriesCount")} &middot; {vm.stats.active}{" "}
            {t("marketplace.categoriesActiveCount")}
          </p>
        </div>
        <Button id="categories-new" size="sm" onClick={vm.openCreateForm}>
          <Plus className="me-2 h-4 w-4" />
          {t("marketplace.categoryCreate") || "New Category"}
        </Button>
      </div>

      {/* Grid */}
      {vm.isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : vm.categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Tag className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-lg font-medium">{t("marketplace.categoriesEmpty")}</p>
          <p className="mt-1 text-sm">
            {t("marketplace.categoriesEmptyHint") || "Create your first category to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {vm.categories.map((cat) => {
            const displayName = language === "ar" ? cat.nameAr || cat.name : cat.name;
            return (
              <Card key={cat.id} className="flex flex-col gap-0 transition-shadow hover:shadow-sm">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="rounded-lg bg-muted p-2">
                    <Tag className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.appCount} {t("marketplace.categoriesAppsCount")}
                    </p>
                  </div>
                  <Badge
                    variant={cat.isActive ? "default" : "outline"}
                    className="shrink-0 text-xs"
                  >
                    {cat.isActive
                      ? t("marketplace.categoryActive")
                      : t("marketplace.categoryInactive")}
                  </Badge>
                </CardHeader>
                <CardContent className="flex justify-end gap-1 pt-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => vm.openEditForm(cat)}
                    title={t("common.edit") || "Edit"}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => vm.delete(cat.id)}
                    disabled={vm.isDeleting}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <CategoryFormDialog
        open={vm.isFormOpen}
        onOpenChange={(open) => {
          if (!open) vm.closeForm();
        }}
        onSubmit={vm.handleFormSubmit}
        isSubmitting={vm.isSubmitting}
        editingCategory={vm.editingCategory}
      />
    </div>
  );
}
