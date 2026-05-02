"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Database,
  CheckSquare,
  Download,
  FileSearch,
} from "lucide-react";
import { useInventoryViewModel } from "../viewmodels/useInventoryViewModel";
import type { InventoryItem } from "../../domain/entities/InventoryItem";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Input } from "@core/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";

// ── Category Badge ─────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  ContactData: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  IdentityData: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  FinancialData: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  TechnicalData: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  OrganisationData: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  ContentData: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
};

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {category}
    </span>
  );
}

function BoolChip({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded ${
        value ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted/60 text-muted-foreground"
      }`}
    >
      {value ? <CheckSquare className="h-3 w-3" /> : <span className="h-0.5 w-3 rounded-full bg-current opacity-40" />}
    </span>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function InventoryView() {
  useModuleLocales(() => import("../../../locales"), "compliance-inventory");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  const [search, setSearchLocal] = useState("");
  const [page, setPageLocal] = useState(1);
  const pageSize = 20;

  const { items, totalCount, isLoading, isError, refetch, setSearch, setPage } = useInventoryViewModel();

  const handleSearch = (value: string) => {
    setSearchLocal(value);
    setSearch(value);
    setPageLocal(1);
    setPage(1);
  };

  const handlePage = (p: number) => {
    setPageLocal(p);
    setPage(p);
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const anonymizedCount = items.filter((i) => i.isAnonymizedOnErasure).length;
  const exportedCount = items.filter((i) => i.isIncludedInExport).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push("/compliance")}>
            <BackIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-500/20 bg-gradient-to-br from-slate-500/15 to-slate-600/10 p-2.5 shadow-sm">
              <Database className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("compliance.dataInventory")}</h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{totalCount}</span> {t("compliance.total")}
              </p>
            </div>
          </div>
        </div>
        <Button id="compliance-inventory-refresh" variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Stats + Search row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="compliance-inventory-search"
            placeholder={t("common.search") ?? "Search fields, entities, modules…"}
            className="ps-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {!isLoading && !isError && items.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
              {anonymizedCount} {t("compliance.isAnonymized")}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5 text-blue-500" />
              {exportedCount} {t("compliance.isExported")}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-4">
          <CardTitle className="text-base font-semibold">{t("compliance.dataInventory")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0 divide-y divide-border/40">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <div className="ms-auto flex gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
              <p className="font-semibold">{t("common.error")}</p>
              <Button className="mt-4" variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="me-2 h-4 w-4" />
                {t("common.refresh")}
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-xl border border-slate-500/20 bg-slate-500/10 p-4">
                <FileSearch className="h-8 w-8 text-slate-500" />
              </div>
              <p className="font-semibold">{t("compliance.noInventory")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("compliance.noInventoryDesc") ?? "No matching fields found."}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="ps-6">{t("compliance.module")}</TableHead>
                  <TableHead>{t("compliance.entity")}</TableHead>
                  <TableHead>{t("compliance.field")}</TableHead>
                  <TableHead>{t("compliance.dataCategory")}</TableHead>
                  <TableHead>{t("compliance.legalBasis")}</TableHead>
                  <TableHead className="text-center">{t("compliance.isAnonymized")}</TableHead>
                  <TableHead className="text-center pe-6">{t("compliance.isExported")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: InventoryItem) => (
                  <TableRow key={item.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell className="ps-6">
                      <Badge variant="outline" className="font-mono text-[11px]">{item.moduleName}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{item.entityName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">{item.fieldName}</span>
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={item.dataCategory} />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{item.legalBasis}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <BoolChip value={item.isAnonymizedOnErasure} />
                    </TableCell>
                    <TableCell className="text-center pe-6">
                      <BoolChip value={item.isIncludedInExport} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} {t("common.of") ?? "of"} {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => handlePage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 font-medium">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => handlePage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
