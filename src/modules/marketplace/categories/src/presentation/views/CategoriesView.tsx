"use client";

import { useCategoriesViewModel } from "../viewmodels/useCategoriesViewModel";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Trash2, Tag } from "lucide-react";

export function CategoriesView() {
  const vm = useCategoriesViewModel();
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">App Categories</h2>
          <p className="text-sm text-muted-foreground">{vm.stats.total} categories · {vm.stats.active} active</p>
        </div>
      </div>
      {vm.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {vm.categories.map((cat) => (
            <Card key={cat.id} className="flex flex-col gap-0 hover:shadow-sm transition-shadow">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="p-2 rounded-lg bg-muted"><Tag className="size-4 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.appCount} apps</p>
                </div>
                <Badge variant={cat.isActive ? "default" : "outline"} className="shrink-0 text-xs">
                  {cat.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0 flex justify-end">
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => vm.delete(cat.id)} disabled={vm.isDeleting}>
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
