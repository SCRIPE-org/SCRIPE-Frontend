"use client";

/**
 * Settings.
 *
 * The page is built around one question — "what do I actually want to change,
 * and what will it look like?" — and answers it with three regions that never
 * move:
 *
 *   nav      six groups, flat. No sub-tabs anywhere; a group that needed one
 *            would be a group that was cut wrong.
 *   controls the active group's rows, one row per thing you can change,
 *            separated by hairlines and given room to breathe.
 *   Stage    the persistent live preview. It never scrolls away and it shows
 *            the REAL component the current row governs — and the option you
 *            are merely pointing at, before you commit to it.
 *
 * Search runs over controls, not groups: type "table" and you get the table
 * row, labelled with the group it lives in; choose it and the page switches
 * group, scrolls to that exact row and marks it.
 */

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Lock,
  MoreHorizontal,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { Input } from "@core/ui/input";
import { TooltipProvider } from "@core/ui/tooltip";
import {
  GROUP_PANELS,
  GroupNav,
  groupLabel,
  matchRows,
  rowLabel,
  SETTINGS_GROUPS,
} from "./settings/settings-nav";
import { DEFAULT_GROUP_ID, rowAnchorId, type GroupId } from "./settings/settings-map";
import { Stage } from "./settings/stage";
import { StageHost } from "./settings/stage-context";

export function SettingsView() {
  useModuleLocales(
    () => import("@modules/customization/settings/locales"),
    "customization-settings"
  );
  const { t } = useI18n();
  const settings = useSettings();
  const { toast } = useEnhancedToast();

  const [activeGroup, setActiveGroup] = useState<GroupId>(DEFAULT_GROUP_ID);
  const [query, setQuery] = useState("");
  /** The row a search result asked us to scroll to, once its group is mounted. */
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  /** The row currently wearing the "you asked for this one" marker. */
  const [markedRowId, setMarkedRowId] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const group = useMemo(
    () => SETTINGS_GROUPS.find((entry) => entry.id === activeGroup) ?? SETTINGS_GROUPS[0],
    [activeGroup]
  );
  const GroupPanelComponent = GROUP_PANELS[group.id];

  const searching = query.trim().length > 0;
  const results = useMemo(() => (searching ? matchRows(query, t) : []), [searching, query, t]);

  // ── Search → jump ───────────────────────────────────────────────────────

  const jumpToRow = useCallback((rowId: string, groupId: GroupId) => {
    setActiveGroup(groupId);
    setQuery("");
    setPendingRowId(rowId);
  }, []);

  // The target row only exists once its (code-split) group panel has mounted,
  // so the scroll waits for the chunk rather than racing it.
  useEffect(() => {
    if (!pendingRowId) return;
    let frame = 0;
    let attempts = 0;
    const settle = () => {
      const node = document.getElementById(rowAnchorId(pendingRowId));
      if (node) {
        const reduced =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        node.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
        setMarkedRowId(pendingRowId);
        setPendingRowId(null);
        return;
      }
      if (attempts++ < 60) frame = requestAnimationFrame(settle);
      else setPendingRowId(null);
    };
    frame = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(frame);
  }, [pendingRowId]);

  // "Here it is" is a hint, not state a row should re-render for: the marker
  // is written straight onto the anchor and lifts itself off again.
  useEffect(() => {
    if (!markedRowId) return;
    const node = document.getElementById(rowAnchorId(markedRowId));
    if (!node) return;
    node.setAttribute("data-marked", "true");
    const timer = window.setTimeout(() => {
      node.removeAttribute("data-marked");
      setMarkedRowId(null);
    }, 1600);
    return () => {
      window.clearTimeout(timer);
      node.removeAttribute("data-marked");
    };
  }, [markedRowId]);

  // Cmd/Ctrl+K puts the caret in search — the "I know what I want" entry point.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && results[0]) {
      jumpToRow(results[0].id, results[0].group);
      searchRef.current?.blur();
    } else if (event.key === "Escape") {
      setQuery("");
    }
  };

  // ── Import / export / reset / save ──────────────────────────────────────

  const handleExportSettings = () => {
    const settingsJson = settings.exportSettings();
    const blob = new Blob([settingsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = t("settings.exportFileName");
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast({ title: t("settings.exportSuccess"), description: t("settings.exportSuccessDesc") });
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loaded) => {
      try {
        const settingsJson = loaded.target?.result as string;
        const success = settings.importSettings(settingsJson);
        if (!success) throw new Error(t("settings.invalidFormat"));
        toast({ title: t("settings.importSuccess"), description: t("settings.importSuccessDesc") });
      } catch {
        toast({
          title: t("settings.importFailed"),
          description: t("settings.importFailedDesc"),
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetSettings = () => {
    settings.resetSettings();
    toast({ title: t("settings.resetSuccess"), description: t("settings.resetSuccessDesc") });
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, settings.exportSettings());
      toast({ title: t("settings.saveSuccess"), description: t("settings.saveSuccessDesc") });
    } catch {
      toast({
        title: t("settings.saveFailed"),
        description: t("settings.saveFailedDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-[1600px] px-6 pb-20 pt-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-nx-ink">
              {t("settings.pageTitle")}
            </h1>
            <p className="mt-1 text-sm text-nx-ink-3">{t("settings.pageSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleSaveSettings} disabled={settings.autoSave}>
              <Save aria-hidden className="me-2 h-4 w-4" />
              {t("common.save")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label={t("common.more")}>
                  <MoreHorizontal aria-hidden className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={handleExportSettings}>
                  <Download aria-hidden className="me-2 h-4 w-4" />
                  {t("common.export")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload aria-hidden className="me-2 h-4 w-4" />
                  {t("common.import")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleResetSettings}
                  className="text-nx-danger focus:text-nx-danger"
                >
                  <RotateCcw aria-hidden className="me-2 h-4 w-4" />
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
        </header>

        {/* M11 Phase E: admin override control */}
        {!settings.overrideControl.allowAdminOverride && (
          <Alert variant="destructive" className="mt-6">
            <Lock aria-hidden className="h-4 w-4" />
            <AlertTitle>{t("customizer.dashboard.locked.allDisabled")}</AlertTitle>
            <AlertDescription>{t("customizer.dashboard.overrideInfo")}</AlertDescription>
          </Alert>
        )}
        {settings.overrideControl.allowAdminOverride &&
          settings.overrideControl.allowedPaths &&
          settings.overrideControl.allowedPaths.length > 0 && (
            <Alert className="mt-6 border-nx-line-hi">
              <ShieldAlert aria-hidden className="h-4 w-4 text-nx-warning" />
              <AlertTitle>{t("customizer.dashboard.overridePaths")}</AlertTitle>
              <AlertDescription>{t("customizer.dashboard.overridePathsDesc")}</AlertDescription>
            </Alert>
          )}

        <div className="relative mt-7 max-w-xl">
          <Search
            aria-hidden
            className="pointer-events-none absolute inset-y-0 my-auto h-4 w-4 text-nx-ink-3 [inset-inline-start:0.75rem]"
          />
          <Input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("common.search")}
            aria-label={t("common.search")}
            className="pe-14 ps-9"
          />
          <kbd className="pointer-events-none absolute inset-y-0 my-auto hidden h-5 items-center rounded-nx-sm border border-nx-line px-1.5 font-mono text-[0.625rem] text-nx-ink-3 [inset-inline-end:0.5rem] sm:flex">
            ⌘K
          </kbd>
        </div>

        {/* StageHost is keyed on the group so switching groups resets the aim
            to that group's default subject without an effect. */}
        <StageHost key={group.id} defaultSubject={group.defaultSubject}>
          <div className="mt-7 flex flex-col gap-8 xl:grid xl:grid-cols-[13rem_minmax(0,1fr)_23rem] xl:items-start xl:gap-10">
            <div className="xl:sticky xl:top-6 xl:col-start-1 xl:row-start-1">
              <GroupNav
                activeId={activeGroup}
                onSelect={(id) => {
                  setActiveGroup(id);
                  setQuery("");
                }}
              />
            </div>

            {/* The Stage sits second in the DOM so that on narrow screens it
                lands above the controls and stays in view while you choose;
                on xl it is placed into the trailing column. */}
            <aside className="sticky top-0 z-sticky xl:top-6 xl:z-base xl:col-start-3 xl:row-start-1">
              <Stage />
            </aside>

            <main className="min-w-0 xl:col-start-2 xl:row-start-1">
              {searching ? (
                <SearchResults results={results} query={query} onPick={jumpToRow} t={t} />
              ) : (
                <div
                  className={cn(
                    "[&_[data-marked=true]]:rounded-nx-md",
                    "[&_[data-marked=true]]:shadow-[inset_0_0_0_1px_var(--nx-accent)]",
                    "[&_[data-marked=true]]:transition-shadow [&_[data-marked=true]]:duration-nx-standard",
                    "[&_[data-marked=true]]:ease-nx-enter motion-reduce:[&_[data-marked=true]]:transition-none"
                  )}
                >
                  <GroupPanelComponent />
                </div>
              )}
            </main>
          </div>
        </StageHost>
      </div>
    </TooltipProvider>
  );
}

// ── Search results ────────────────────────────────────────────────────────

function SearchResults({
  results,
  query,
  onPick,
  t,
}: {
  results: ReturnType<typeof matchRows>;
  query: string;
  onPick: (rowId: string, groupId: GroupId) => void;
  t: (key: string) => string;
}) {
  if (results.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-nx-ink-3">
        {t("common.noResults")} — “{query.trim()}”
      </p>
    );
  }

  // No count header: the list is the answer, and a "5 results" line above it
  // is one more thing to read before you can act.
  return (
    <div>
      <ul className="divide-y divide-nx-line">
        {results.map((row) => {
          const group = SETTINGS_GROUPS.find((entry) => entry.id === row.group);
          const Icon = group?.icon;
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onPick(row.id, row.group)}
                className={cn(
                  "flex w-full items-start gap-3 px-2 py-4 text-start outline-none",
                  "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  "hover:bg-nx-hover focus-visible:shadow-nx-focus"
                )}
              >
                {Icon && <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-nx-ink-3" />}
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] font-medium text-nx-ink">
                    {rowLabel(row, t)}
                  </span>
                  <span className="mt-0.5 block text-sm text-nx-ink-3">
                    {group ? groupLabel(group, t) : ""}
                    {row.descKey || row.description
                      ? ` · ${row.descKey ? t(row.descKey) : row.description}`
                      : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
