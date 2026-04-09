"use client";

import { useReportsViewModel } from "../viewmodels/useReportsViewModel";
import { Input } from "@core/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { PieChart } from "lucide-react";

export function ReportsView() {
  const vm = useReportsViewModel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <PieChart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">Generate, validate, and export data reports</p>
          </div>
        </div>
        <Badge variant="secondary">{vm.totalCount} total</Badge>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search..."
          value={vm.search}
          onChange={(e) => vm.handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Content */}
      {vm.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : vm.error ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">Failed to load data. Please try again.</p>
          </CardContent>
        </Card>
      ) : vm.items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <PieChart className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No reports found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Get started by creating your first item.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vm.items.map((item, index) => (
            <Card key={item.id || index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium truncate">
                  {item.name || item.id || "Untitled"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{item.status || "N/A"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {vm.totalCount > vm.pageSize && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
            disabled={vm.page <= 1}
            onClick={() => vm.setPage(vm.page - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {vm.page} of {Math.ceil(vm.totalCount / vm.pageSize)}
          </span>
          <button
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
            disabled={vm.page >= Math.ceil(vm.totalCount / vm.pageSize)}
            onClick={() => vm.setPage(vm.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
