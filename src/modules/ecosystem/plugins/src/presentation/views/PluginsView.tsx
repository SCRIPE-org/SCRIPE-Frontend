"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePluginsViewModel } from "../viewmodels/usePluginsViewModel";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Skeleton } from "@core/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@core/ui/tooltip";
import {
  Plug,
  Plus,
  Power,
  PowerOff,
  Settings,
  Trash2,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────
// Status helpers
// ──────────────────────────────────────────────────────────────────
type PluginStatus = "Active" | "Disabled" | "Error" | "Installing" | "Uninstalling";

function statusVariant(status: string): "success" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Active": return "success";
    case "Disabled": return "secondary";
    case "Error": return "destructive";
    default: return "outline";
  }
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "Active": return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "Disabled": return <PowerOff className="h-3.5 w-3.5" />;
    case "Error": return <XCircle className="h-3.5 w-3.5" />;
    default: return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  }
}

// ──────────────────────────────────────────────────────────────────
export function PluginsView() {
  useModuleLocales(() => import("../../../locales"), "plugins");
  const { t } = useI18n();
  const vm = usePluginsViewModel();

  // Dialog state
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [uninstallDialogOpen, setUninstallDialogOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [manifestJson, setManifestJson] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Install handler ──────────────────────────────────
  const handleInstall = useCallback(async () => {
    if (!manifestJson.trim()) return;
    setIsSubmitting(true);
    try {
      await vm.install(manifestJson);
      setManifestJson("");
      setInstallDialogOpen(false);
    } catch {
      // Error handled by vm
    } finally {
      setIsSubmitting(false);
    }
  }, [manifestJson, vm]);

  // ── Enable / Disable ────────────────────────────────
  const handleToggle = useCallback(async (plugin: any) => {
    if (plugin.isEnabled) {
      await vm.disable(plugin.id);
    } else {
      await vm.enable(plugin.id);
    }
  }, [vm]);

  // ── Uninstall ────────────────────────────────────────
  const handleUninstall = useCallback(async () => {
    if (!selectedPlugin) return;
    setIsSubmitting(true);
    try {
      await vm.uninstall(selectedPlugin.id);
      setUninstallDialogOpen(false);
      setSelectedPlugin(null);
    } catch {
      // Error handled by vm
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPlugin, vm]);

  // ── Stats ────────────────────────────────────────────
  const stats = {
    total: vm.items.length,
    active: vm.items.filter((p: any) => p.status === "Active").length,
    disabled: vm.items.filter((p: any) => p.status === "Disabled").length,
    errors: vm.items.filter((p: any) => p.status === "Error").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Plug className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("plugins.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("plugins.description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => vm.refetch()}>
            <RefreshCw className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
            {t("common.refresh") || "Refresh"}
          </Button>
          <Button size="sm" onClick={() => setInstallDialogOpen(true)}>
            <Plus className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
            {t("plugins.actions.install")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("plugins.stats.total"), value: stats.total, icon: Plug, color: "text-primary" },
          { label: t("plugins.stats.active"), value: stats.active, icon: CheckCircle2, color: "text-emerald-500" },
          { label: t("plugins.stats.disabled"), value: stats.disabled, icon: PowerOff, color: "text-muted-foreground" },
          { label: t("plugins.stats.errors"), value: stats.errors, icon: AlertCircle, color: "text-destructive" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 py-4">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("common.search") || "Search..."}
          value={vm.search}
          onChange={(e) => vm.handleSearch(e.target.value)}
          className="ps-9"
        />
      </div>

      {/* Content */}
      {vm.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : vm.error ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <AlertCircle className="h-5 w-5 text-destructive ltr:mr-2 rtl:ml-2" />
            <p className="text-destructive">{t("common.error") || "Failed to load data. Please try again."}</p>
          </CardContent>
        </Card>
      ) : vm.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plug className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">{t("plugins.empty.title")}</p>
            <p className="text-sm text-muted-foreground/70 mt-1">{t("plugins.empty.description")}</p>
            <Button className="mt-6" variant="outline" onClick={() => setInstallDialogOpen(true)}>
              <Plus className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
              {t("plugins.actions.install")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vm.items.map((plugin: any) => (
            <Card key={plugin.id} className="group hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-semibold truncate flex-1">
                    {plugin.name || plugin.pluginId || "Untitled"}
                  </CardTitle>
                  <Badge variant={statusVariant(plugin.status)} className="gap-1 text-xs shrink-0 ms-2">
                    <StatusIcon status={plugin.status} />
                    {t(`plugins.status.${(plugin.status || "active").toLowerCase()}`) || plugin.status}
                  </Badge>
                </div>
                {plugin.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{plugin.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{t("plugins.columns.version")}: {plugin.version || "N/A"}</Badge>
                  {plugin.author && <Badge variant="outline" className="text-xs">{plugin.author}</Badge>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggle(plugin)}
                        >
                          {plugin.isEnabled ? (
                            <PowerOff className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Power className="h-4 w-4 text-emerald-500" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {plugin.isEnabled ? t("plugins.actions.disable") : t("plugins.actions.enable")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setSelectedPlugin(plugin); setConfigDialogOpen(true); }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("plugins.actions.configure")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="flex-1" />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => { setSelectedPlugin(plugin); setUninstallDialogOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("plugins.actions.uninstall")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Install Dialog ──────────────────────────────── */}
      <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("plugins.install.title")}</DialogTitle>
            <DialogDescription>{t("plugins.install.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("plugins.install.manifestLabel")}</Label>
              <Textarea
                placeholder={t("plugins.install.manifestPlaceholder")}
                value={manifestJson}
                onChange={(e) => setManifestJson(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInstallDialogOpen(false)}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button onClick={handleInstall} disabled={isSubmitting || !manifestJson.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin ltr:mr-1.5 rtl:ml-1.5" />}
              {t("plugins.install.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Config Dialog ───────────────────────────────── */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("plugins.config.title")}</DialogTitle>
            <DialogDescription>
              {selectedPlugin?.name} — {t("plugins.config.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("plugins.config.noConfig")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              {t("common.close") || "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Uninstall Confirmation ──────────────────────── */}
      <Dialog open={uninstallDialogOpen} onOpenChange={setUninstallDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">{t("plugins.uninstall.title")}</DialogTitle>
            <DialogDescription>
              {t("plugins.uninstall.confirm")?.replace("{name}", selectedPlugin?.name || "")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUninstallDialogOpen(false)}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleUninstall} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin ltr:mr-1.5 rtl:ml-1.5" />}
              {t("plugins.actions.uninstall")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
