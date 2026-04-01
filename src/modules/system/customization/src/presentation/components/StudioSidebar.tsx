/**
 * StudioSidebar -- 11-tab sidebar for the Ultimate Customizer Studio
 * All labels localized via t()
 */
"use client";
// UI-EXCEPTION: compact studio layout -- native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { useMemo } from "react";
import { Layout, Palette, Type, Settings2, Layers, Blocks, Paintbrush, ScanEye, Store, LayoutGrid, LayoutDashboard } from "lucide-react";
import { cn } from "@/core/common/utils";
import { LayoutPanel } from "./LayoutPanel";
import { BrandingPanel } from "./BrandingPanel";
import { BlockPanel } from "./BlockPanel";
import type { StudioDraftProps as StudioDraft, StudioPanel, AuthPageId, AuthPageOverride } from "../../domain/entities/StudioDraft";
import type { LoginSlotId, ContentBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { StylePanel } from "./StylePanel";
import { AdvancedPanel } from "./AdvancedPanel";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { ThemeMarketplacePanel } from "./ThemeMarketplacePanel";
import { BuilderPanel } from "./builder/BuilderPanel";
import { DashboardPanel } from "./DashboardPanel";
import type { DashboardThemeSettings } from "../../domain/entities/StudioDraft";
import { useI18n } from "@core/providers/i18n-provider";


interface StudioSidebarProps {
  activePanel: StudioPanel;
  setActivePanel: (panel: StudioPanel) => void;
  draft: StudioDraft;
  updateDraft: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
  batchUpdateDraft: (updates: Partial<StudioDraft>) => void;
  addBlock: (slotId: LoginSlotId, block: ContentBlock) => void;
  removeBlock: (slotId: LoginSlotId, index: number) => void;
  moveBlock: (slotId: LoginSlotId, fromIndex: number, direction: "up" | "down") => void;
  updateBlock: (slotId: LoginSlotId, index: number, block: ContentBlock) => void;
  // Theme marketplace callbacks
  onThemeApplied?: () => void;
  onPreviewTheme?: (themeDataJson: string) => void;
  onExitPreview?: () => void;
  // Multi-page branding
  activeAuthPage: AuthPageId;
  getPageOverride: (pageId: AuthPageId) => AuthPageOverride;
  setPageOverride: (pageId: AuthPageId, field: keyof AuthPageOverride, value: string) => void;
  /** When true, builder canvas is rendered externally (full-width) */
  isBuilderMode?: boolean;
}

const TABS: { id: StudioPanel; icon: typeof Layout; labelKey: string; section?: string }[] = [
  // Login customization
  { id: "layout", icon: Layout, labelKey: "studio.tab.layout", section: "login" },
  { id: "builder", icon: LayoutGrid, labelKey: "studio.tab.builder", section: "login" },
  { id: "branding", icon: Paintbrush, labelKey: "studio.tab.branding", section: "login" },
  { id: "appearance", icon: Palette, labelKey: "studio.tab.appearance", section: "login" },
  { id: "typography", icon: Type, labelKey: "studio.tab.typography", section: "login" },
  { id: "spacing", icon: Settings2, labelKey: "studio.tab.spacing", section: "login" },
  { id: "blocks", icon: Blocks, labelKey: "studio.tab.blocks", section: "login" },
  // Dashboard customization
  { id: "dashboard", icon: LayoutDashboard, labelKey: "studio.tab.dashboard", section: "dashboard" },
  // System
  { id: "advanced", icon: Layers, labelKey: "studio.tab.advanced", section: "system" },
  { id: "accessibility", icon: ScanEye, labelKey: "studio.tab.accessibility", section: "system" },
  { id: "themes", icon: Store, labelKey: "studio.tab.themes", section: "system" },
];

export function StudioSidebar(props: StudioSidebarProps) {
  const { t } = useI18n();
  const { activePanel, setActivePanel, draft, updateDraft, batchUpdateDraft,
    addBlock, removeBlock, moveBlock, updateBlock,
    activeAuthPage, getPageOverride, setPageOverride,
  } = props;

  const currentPageOverride = getPageOverride(activeAuthPage);

  // Dashboard settings wired to draft persistence
  const handleDashboardUpdate = (updates: Partial<DashboardThemeSettings>) => {
    updateDraft('dashboardSettings', { ...draft.dashboardSettings, ...updates });
  };

  // Group tabs by section for visual separation
  const tabSections = useMemo(() => {
    const sections: { section: string; tabs: typeof TABS }[] = [];
    let currentSection = "";
    for (const tab of TABS) {
      const section = tab.section || "other";
      if (section !== currentSection) {
        currentSection = section;
        sections.push({ section, tabs: [] });
      }
      sections[sections.length - 1].tabs.push(tab);
    }
    return sections;
  }, []);

  return (
    <div className="flex h-full border-e border-border bg-background">
      {/* Tab Strip */}
      <div className="flex w-14 flex-col items-center gap-0.5 border-e border-border bg-muted/30 py-3 overflow-y-auto scrollbar-thin">
        {tabSections.map((section, si) => (
          <div key={section.section} className="flex flex-col items-center gap-1 w-full">
            {/* Section divider (not for first section) */}
            {si > 0 && (
              <div className="w-6 h-px bg-border/60 my-1" />
            )}
            {section.tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePanel === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={cn(
                    "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={t(tab.labelKey)}
                >
                  <Icon className="h-4 w-4" />
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -end-[5px] top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Panel Content */}
      <div className="w-[340px] overflow-y-auto scrollbar-thin">
        {/* Panel Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            {t(TABS.find(tab => tab.id === activePanel)?.labelKey || "")}
          </h2>
        </div>

        {/* Active Panel */}
        <div className="p-4">
          {activePanel === "layout" && (
            <LayoutPanel selectedLayout={currentPageOverride.layout}
              onSelectLayout={(layout) => setPageOverride(activeAuthPage, "layout", layout)}
              activeAuthPage={activeAuthPage}
              pageOverride={currentPageOverride}
              onUpdatePageField={(field, value) => setPageOverride(activeAuthPage, field, value)}
              canvasMode={draft.canvasMode}
              onCanvasModeChange={(mode) => updateDraft('canvasMode', mode)}
            />
          )}
          {activePanel === "branding" && (
            <BrandingPanel draft={draft}
              updateDraft={updateDraft}
            />
          )}
          {(activePanel === "appearance" || activePanel === "typography" || activePanel === "spacing") && (
            <StylePanel activeSection={activePanel}
              draft={draft}
              updateDraft={updateDraft}
              batchUpdateDraft={batchUpdateDraft}
            />
          )}
          {activePanel === "blocks" && (
            <BlockPanel draft={draft}
              addBlock={addBlock}
              removeBlock={removeBlock}
              moveBlock={moveBlock}
              updateBlock={updateBlock}
            />
          )}
          {activePanel === "advanced" && (
            <AdvancedPanel draft={draft}
              updateDraft={updateDraft}
            />
          )}
          {activePanel === "accessibility" && (
            <AccessibilityPanel draft={draft}
              updateDraft={updateDraft}
              batchUpdateDraft={batchUpdateDraft}
            />
          )}
          {activePanel === "themes" && (
            <ThemeMarketplacePanel onApplySuccess={props.onThemeApplied}
              onPreviewTheme={props.onPreviewTheme}
              onExitPreview={props.onExitPreview}
            />
          )}
          {activePanel === "builder" && (
            <BuilderPanel draft={draft} updateDraft={updateDraft} sidebarOnly={!!props.isBuilderMode} activeAuthPage={activeAuthPage} />
          )}
          {activePanel === "dashboard" && (
            <DashboardPanel
              settings={draft.dashboardSettings}
              onUpdate={handleDashboardUpdate}
            />
          )}

        </div>
      </div>
    </div>
  );
}
