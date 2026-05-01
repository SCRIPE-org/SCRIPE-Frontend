"use client";

import { useRouter } from "next/navigation";
import { Database, ChevronLeft, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useInventoryViewModel } from "../viewmodels/useInventoryViewModel";
import type { InventoryItem } from "../../domain/entities/InventoryItem";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";

export function InventoryView() {
  useModuleLocales(() => import("../../../locales"), "compliance-inventory");
  const { t } = useI18n();
  const router = useRouter();
  const { items, totalCount, isLoading, refetch, search, setSearch } = useInventoryViewModel();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push("/compliance")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2.5">
            <Database className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("compliance.dataInventory")}</h2>
            <p className="text-sm text-muted-foreground">
              {totalCount} {t("compliance.field")}
            </p>
          </div>
        </div>
        <Button
          id="compliance-inventory-refresh"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
        >
          <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </div>

      <div className="max-w-sm">
        <Input
          id="compliance-inventory-search"
          placeholder={`${t("common.search") ?? "Search"}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("compliance.dataInventory")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Database className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">{t("compliance.noInventory")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("compliance.entity")}</TableHead>
                  <TableHead>{t("compliance.field")}</TableHead>
                  <TableHead>{t("compliance.dataCategory")}</TableHead>
                  <TableHead className="text-center">{t("compliance.isAnonymized")}</TableHead>
                  <TableHead className="text-center">{t("compliance.isExported")}</TableHead>
                  <TableHead>{t("compliance.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: InventoryItem) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{item.entityName}</p>
                        <p className="text-xs text-muted-foreground">{item.moduleName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.fieldName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.dataCategory}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.isAnonymizedOnErasure ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.isIncludedInExport ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-blue-500" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? t("compliance.active") : t("compliance.inactive")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
