"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Skeleton } from "@core/ui/skeleton";
import { Store, Search, Star, Download, ShoppingCart, TrendingUp, Award, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { useMarketplaceViewModel } from "../viewmodels/useMarketplaceViewModel";

export function MarketplaceView() {
  useModuleLocales(() => import("../../../locales"), "marketplace");
  const { t } = useI18n();
  const vm = useMarketplaceViewModel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
            <Store className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("marketplace.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("marketplace.description")}</p>
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <Card className="bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-pink-600/10 border-violet-500/20">
        <CardContent className="flex items-center gap-6 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20">
            <TrendingUp className="h-7 w-7 text-violet-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{t("marketplace.featured")}</h3>
            <p className="text-sm text-muted-foreground">{t("marketplace.featuredDesc")}</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1"><Award className="h-3 w-3" />Staff Pick</Badge>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1"><TrendingUp className="h-3 w-3" />Trending</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("marketplace.searchPlaceholder")} value={vm.search} onChange={(e) => vm.handleSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Loading State */}
      {vm.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : vm.error ? (
        /* Error State */
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive mb-3">{t("common.errorLoading")}</p>
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />{t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : vm.items.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <Store className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t("marketplace.empty")}</h3>
            <p className="text-sm text-muted-foreground">{t("marketplace.emptyDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        /* Catalog Grid — from server data */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vm.items.map((plugin: any) => (
            <Card key={plugin.id} className="group hover:border-violet-500/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 text-lg font-bold text-violet-500">
                      {(plugin.name ?? "M").charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-1.5">
                        {plugin.name}
                        {plugin.verified && <Badge variant="secondary" className="text-[10px] gap-0.5 px-1"><Sparkles className="h-2.5 w-2.5" />Verified</Badge>}
                      </CardTitle>
                      <CardDescription className="text-xs">{plugin.author} · v{plugin.version}</CardDescription>
                    </div>
                  </div>
                  {(plugin.price ?? 0) > 0 && <Badge variant="outline" className="font-mono">${plugin.price}</Badge>}
                  {(plugin.price ?? 0) === 0 && <Badge variant="success" className="text-xs">Free</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{plugin.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{plugin.rating}</span>
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" />{(plugin.downloads ?? 0).toLocaleString()}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{plugin.category}</Badge>
                </div>
                <Button
                  className="w-full gap-2 group-hover:bg-violet-600 group-hover:text-white transition-colors"
                  variant="outline"
                  size="sm"
                  disabled={vm.isInstalling && vm.installingId === plugin.id}
                  onClick={() => vm.handleInstall(plugin.id)}
                >
                  {vm.isInstalling && vm.installingId === plugin.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-3.5 w-3.5" />
                  )}
                  {(plugin.price ?? 0) > 0 ? t("marketplace.purchase") : t("marketplace.install")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
