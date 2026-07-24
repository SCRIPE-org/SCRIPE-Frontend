"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TooltipProvider } from "@core/ui/tooltip";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useSettings } from "@core/providers/settings-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import {
  Download,
  Upload,
  Save,
  RotateCcw,
  Lock,
  ShieldAlert,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import {
  SETTINGS_GROUPS,
  SETTINGS_ITEMS,
  DEFAULT_SETTINGS_ITEM_ID,
} from "./settings/settings-nav";
import { SettingsRail, itemLabel } from "./settings/settings-rail";
import { PreviewPanel } from "./settings/preview-panel";

export function SettingsView() {
  useModuleLocales(
    () => import("@modules/customization/settings/locales"),
    "customization-settings"
  );
  const { t } = useI18n();
  const settings = useSettings();
  const { toast } = useEnhancedToast();

  const [activeId, setActiveId] = useState(DEFAULT_SETTINGS_ITEM_ID);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeItem = useMemo(
    () => SETTINGS_ITEMS.find((it) => it.id === activeId) ?? SETTINGS_ITEMS[0],
    [activeId]
  );

  // Filter the rail against the query, keeping only groups that still have a
  // matching destination. Matching a group's own label keeps all its children.
  const filtering = query.trim().length > 0;
  const filteredGroups = useMemo(() => {
    if (!filtering) return SETTINGS_GROUPS;
    const needle = query.trim().toLowerCase();
    return SETTINGS_GROUPS.map((group) => {
      const groupHit = t(group.labelKey).toLowerCase().includes(needle);
      const items = groupHit
        ? group.items
        : group.items.filter((it) => itemLabel(it, t).toLowerCase().includes(needle));
      return { ...group, items };
    }).filter((group) => group.items.length > 0);
  }, [filtering, query, t]);

  // Cmd/Ctrl+K focuses the search — the "not a wall of tabs" entry point.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Enter jumps to the first match; Escape clears the filter.
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const first = filteredGroups[0]?.items[0];
      if (first) {
        setActiveId(first.id);
        searchRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  const handleExportSettings = () => {
    const settingsJson = settings.exportSettings();
    const blob = new Blob([settingsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = t("settings.exportFileName");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("settings.exportSuccess"),
      description: t("settings.exportSuccessDesc"),
    });
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settingsJson = e.target?.result as string;
          const success = settings.importSettings(settingsJson);
          if (success) {
            toast({
              title: t("settings.importSuccess"),
              description: t("settings.importSuccessDesc"),
            });
          } else {
            throw new Error(t("settings.invalidFormat"));
          }
        } catch (error) {
          toast({
            title: t("settings.importFailed"),
            description: t("settings.importFailedDesc"),
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetSettings = () => {
    settings.resetSettings();
    toast({
      title: t("settings.resetSuccess"),
      description: t("settings.resetSuccessDesc"),
    });
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, settings.exportSettings());
      toast({
        title: t("settings.saveSuccess"),
        description: t("settings.saveSuccessDesc"),
      });
    } catch (error) {
      toast({
        title: t("settings.saveFailed"),
        description: t("settings.saveFailedDesc"),
        variant: "destructive",
      });
    }
  };

  const ActiveSection = activeItem.Component;
  const showDock = activeItem.preview !== null;

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-[1440px] space-y-6 p-6">
        {/* Slimmed header: only Save stays a primary action; the rest fold into
            the overflow menu so the row reads as one clear next step. */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-nx-ink">{t("settings.pageTitle")}</h1>
            <p className="text-sm text-nx-ink-2">{t("settings.pageSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleSaveSettings} disabled={settings.autoSave}>
              <Save className="mx-2 h-4 w-4" />
              {t("common.save")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label={t("common.more")}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={handleExportSettings}>
                  <Download className="me-2 h-4 w-4" />
                  {t("common.export")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="me-2 h-4 w-4" />
                  {t("common.import")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleResetSettings}
                  className="text-nx-danger focus:text-nx-danger"
                >
                  <RotateCcw className="me-2 h-4 w-4" />
                  {t("settings.resetAll")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              ref={fileInputRef}
              id="import-settings"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportSettings}
            />
          </div>
        </div>

        {/* M11 Phase E: Override Control Banner */}
        {!settings.overrideControl.allowAdminOverride && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <Lock className="h-4 w-4" />
            <AlertTitle>{t("customizer.dashboard.locked.allDisabled")}</AlertTitle>
            <AlertDescription className="text-sm opacity-80">
              {t("customizer.dashboard.overrideInfo")}
            </AlertDescription>
          </Alert>
        )}
        {settings.overrideControl.allowAdminOverride &&
          settings.overrideControl.allowedPaths &&
          settings.overrideControl.allowedPaths.length > 0 && (
            <Alert className="border-warning/40 bg-warning/10">
              <ShieldAlert className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">
                {t("customizer.dashboard.overridePaths")}
              </AlertTitle>
              <AlertDescription className="text-sm text-warning/80">
                {t("customizer.dashboard.overridePathsDesc")}
              </AlertDescription>
            </Alert>
          )}

        {/* Search — filters the rail and jumps to a destination (Cmd/Ctrl+K). */}
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute inset-y-0 my-auto h-4 w-4 text-nx-ink-3 [inset-inline-start:0.75rem]" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("common.search")}
            aria-label={t("common.search")}
            className="ps-9 pe-14"
          />
          <kbd className="pointer-events-none absolute inset-y-0 my-auto hidden h-5 items-center rounded-nx-sm border border-nx-line px-1.5 font-mono text-[10px] text-nx-ink-3 sm:flex [inset-inline-end:0.5rem]">
            ⌘K
          </kbd>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-56 lg:shrink-0 lg:self-start lg:overflow-y-auto">
            <SettingsRail
              groups={filteredGroups}
              activeId={activeId}
              onSelect={setActiveId}
              filtering={filtering}
            />
          </div>

          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-3xl">
              <ActiveSection />
            </div>
          </main>

          {showDock && (
            <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-[360px] lg:shrink-0 lg:self-start lg:overflow-y-auto">
              <PreviewPanel previewKind={activeItem.preview} />
            </aside>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
