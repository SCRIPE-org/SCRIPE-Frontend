"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Switch } from "@core/ui/switch";
import { Skeleton } from "@core/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Link2, CheckCircle2, XCircle, Settings, Play, RefreshCw, Plug, Loader2 } from "lucide-react";
import { useIntegrationsViewModel } from "../viewmodels/useIntegrationsViewModel";

export function IntegrationsView() {
  useModuleLocales(() => import("../../../locales"), "integrations");
  const { t } = useI18n();
  const vm = useIntegrationsViewModel();

  const connectedCount = vm.items.filter((c: any) => c.status === "Connected").length;
  const totalCount = vm.items.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
          <Link2 className="h-5 w-5 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("integrations.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("integrations.description")}</p>
        </div>
      </div>

      {/* Stats — computed from server data */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{vm.isLoading ? "—" : connectedCount}</p><p className="text-xs text-muted-foreground">{t("integrations.connected")}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{vm.isLoading ? "—" : totalCount - connectedCount}</p><p className="text-xs text-muted-foreground">{t("integrations.available")}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{vm.isLoading ? "—" : totalCount}</p><p className="text-xs text-muted-foreground">{t("integrations.total")}</p></CardContent></Card>
      </div>

      {/* Loading State */}
      {vm.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : vm.error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive mb-3">{t("common.errorLoading")}</p>
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />{t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : vm.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <Plug className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t("integrations.empty")}</h3>
            <p className="text-sm text-muted-foreground">{t("integrations.emptyDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vm.items.map((c: any) => (
            <Card key={c.type ?? c.id} className={`relative overflow-hidden ${c.status === "Connected" ? "border-emerald-500/20" : "border-dashed"}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Link2 className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{c.type ?? c.name}</CardTitle>
                      <CardDescription className="text-xs">{c.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={c.status === "Connected" ? "success" : "secondary"} className="gap-1">
                    {c.status === "Connected" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {c.status}
                  </Badge>
                  <Switch
                    checked={c.status === "Connected"}
                    disabled={vm.isToggling}
                    onCheckedChange={(checked) => vm.handleToggle(c.type ?? c.id, checked)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => vm.handleConfigure(c.type ?? c.id)}
                  >
                    <Settings className="h-3.5 w-3.5" />{t("integrations.configure")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={vm.isTesting && vm.testingType === (c.type ?? c.id)}
                    onClick={() => vm.handleTest(c.type ?? c.id)}
                  >
                    {vm.isTesting && vm.testingType === (c.type ?? c.id) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {t("integrations.test")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Configure Dialog */}
      <Dialog open={vm.configDialogOpen} onOpenChange={vm.setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("integrations.configureTitle") || "Configure Integration"}</DialogTitle>
            <DialogDescription>
              {t("integrations.configureDesc") || "Update settings for this integration connector."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground text-center">
            {t("integrations.configureComingSoon") || "Configuration panel coming soon."}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
