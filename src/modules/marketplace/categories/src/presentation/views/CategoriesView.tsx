"use client";

import { useCategoriesViewModel } from "../viewmodels/useCategoriesViewModel";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Trash2, Tag } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

export function CategoriesView() {
  const vm = useCategoriesViewModel();
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("marketplace.categoriesTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {vm.stats.total} {t("marketplace.categoriesCount")} &middot;{" "}
            {vm.stats.active} {t("marketplace.categoriesActiveCount")}
          </p>
        </div>
      </div>

      {vm.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : vm.categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <p className="text-lg font-medium">{t("marketplace.categoriesEmpty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {vm.categories.map((cat) => (
            <Card key={cat.id} className="flex flex-col gap-0 hover:shadow-sm transition-shadow">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="p-2 rounded-lg bg-muted">
                  <Tag className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{cat.name}</p>
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
              <CardContent className="pt-0 flex justify-end">
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
          ))}
        </div>
      )}
    </div>
  );
}
