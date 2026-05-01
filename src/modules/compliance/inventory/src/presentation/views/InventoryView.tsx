"use client";

import { useRouter } from "next/navigation";
import { Database, ChevronLeft, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useInventoryViewModel } from "../viewmodels/useInventoryViewModel";
import type { InventoryItem } from "../../domain/entities/InventoryItem";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";

function InventoryRow({ item }: { item: InventoryItem }) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{item.moduleName}</p>
        <p className="text-sm text-white font-medium truncate">{item.entityName}</p>
      </div>
      <p className="text-sm text-slate-300 truncate">{item.fieldName}</p>
      <Badge variant="outline" className="text-violet-300 border-violet-500/30 text-xs w-fit">{item.dataCategory}</Badge>
      <div className="flex items-center justify-center" title={t("compliance.isAnonymized") ?? "Anonymized"}>
        {item.isAnonymizedOnErasure ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
      </div>
      <div className="flex items-center justify-center" title={t("compliance.isExported") ?? "Exported"}>
        {item.isIncludedInExport ? <CheckCircle2 className="w-4 h-4 text-sky-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-400"}`}>
        {item.isActive ? t("compliance.active") : t("compliance.inactive")}
      </span>
    </div>
  );
}

export function InventoryView() {
  const { t } = useI18n();
  const router = useRouter();
  const { items, totalCount, isLoading, refetch, search, setSearch } = useInventoryViewModel();

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      <div className="border-b border-white/[0.08] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/compliance")} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors" aria-label="Back">
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 border border-violet-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t("compliance.dataInventory")}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{totalCount} {t("compliance.field")}</p>
            </div>
          </div>
          <Button id="compliance-inventory-refresh" variant="outline" size="sm" onClick={() => refetch()} className="border-white/[0.08] text-slate-400 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      <div className="px-8 py-6 max-w-[1600px] mx-auto space-y-5">
        <div className="relative max-w-sm">
          <Input id="compliance-inventory-search" placeholder={`${t("common.search") ?? "Search"}...`} value={search} onChange={e => setSearch(e.target.value)} className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-500" />
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-white/[0.08] bg-white/[0.02]">
            <span className="text-xs text-slate-500 uppercase tracking-wider">{t("compliance.entity")}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">{t("compliance.field")}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">{t("compliance.dataCategory")}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider text-center">{t("compliance.isAnonymized")}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider text-center">{t("compliance.isExported")}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">{t("compliance.status")}</span>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-48"><div className="text-center"><Database className="w-12 h-12 mx-auto mb-3 text-slate-700" /><p className="text-sm text-slate-400">{t("compliance.noInventory")}</p></div></div>
          ) : (
            items.map(item => <InventoryRow key={item.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
}
