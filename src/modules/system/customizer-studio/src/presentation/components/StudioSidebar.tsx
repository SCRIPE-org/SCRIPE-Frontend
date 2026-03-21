/**
 * StudioSidebar — 8-tab sidebar for the Ultimate Customizer Studio
 * All labels localized via t()
 */
"use client";

import { Layout, Palette, Type, Image, Settings2, Layers, Blocks, Paintbrush } from "lucide-react";
import { cn } from "@/core/common/utils";
import { LayoutPanel } from "./LayoutPanel";
import { BrandingPanel } from "./BrandingPanel";
import { BlockPanel } from "./BlockPanel";
import type { StudioDraft, StudioPanel, DeviceSize } from "../viewmodels/useStudioViewModel";
import type { LoginSlotId, ContentBlock } from "@modules/auth/signin/src/types/login-branding-types";
import { StylePanel } from "./StylePanel";
import { AdvancedPanel } from "./AdvancedPanel";

interface StudioSidebarProps {
  t: (key: string) => string;
  activePanel: StudioPanel;
  setActivePanel: (panel: StudioPanel) => void;
  draft: StudioDraft;
  updateDraft: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
  batchUpdateDraft: (updates: Partial<StudioDraft>) => void;
  addBlock: (slotId: LoginSlotId, block: ContentBlock) => void;
  removeBlock: (slotId: LoginSlotId, index: number) => void;
  moveBlock: (slotId: LoginSlotId, fromIndex: number, direction: "up" | "down") => void;
  updateBlock: (slotId: LoginSlotId, index: number, block: ContentBlock) => void;
}

const TABS: { id: StudioPanel; icon: typeof Layout; labelKey: string }[] = [
  { id: "layout", icon: Layout, labelKey: "studio.tab.layout" },
  { id: "branding", icon: Paintbrush, labelKey: "studio.tab.branding" },
  { id: "colors", icon: Palette, labelKey: "studio.tab.colors" },
  { id: "typography", icon: Type, labelKey: "studio.tab.typography" },
  { id: "background", icon: Image, labelKey: "studio.tab.background" },
  { id: "spacing", icon: Settings2, labelKey: "studio.tab.spacing" },
  { id: "blocks", icon: Blocks, labelKey: "studio.tab.blocks" },
  { id: "advanced", icon: Layers, labelKey: "studio.tab.advanced" },
];

export function StudioSidebar(props: StudioSidebarProps) {
  const { t, activePanel, setActivePanel, draft, updateDraft, batchUpdateDraft, addBlock, removeBlock, moveBlock, updateBlock } = props;

  return (
    <div className="flex h-full border-e border-border bg-background">
      {/* Tab Strip */}
      <div className="flex w-14 flex-col items-center gap-1 border-e border-border bg-muted/30 py-3">
        {TABS.map((tab) => {
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
            <LayoutPanel
              t={t}
              selectedLayout={draft.layout}
              onSelectLayout={(layout) => updateDraft("layout", layout)}
            />
          )}
          {activePanel === "branding" && (
            <BrandingPanel
              t={t}
              draft={draft}
              updateDraft={updateDraft}
            />
          )}
          {(activePanel === "colors" || activePanel === "typography" || activePanel === "background" || activePanel === "spacing") && (
            <StylePanel
              t={t}
              activeSection={activePanel}
              draft={draft}
              updateDraft={updateDraft}
              batchUpdateDraft={batchUpdateDraft}
            />
          )}
          {activePanel === "blocks" && (
            <BlockPanel
              t={t}
              draft={draft}
              addBlock={addBlock}
              removeBlock={removeBlock}
              moveBlock={moveBlock}
              updateBlock={updateBlock}
            />
          )}
          {activePanel === "advanced" && (
            <AdvancedPanel
              t={t}
              draft={draft}
              updateDraft={updateDraft}
            />
          )}
        </div>
      </div>
    </div>
  );
}
