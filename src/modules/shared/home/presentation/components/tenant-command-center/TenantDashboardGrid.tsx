"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus, LayoutGrid } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  TenantOverviewLayout,
  TenantOverviewWidgetItem,
  TenantWidgetColSpan,
} from "./tenantCustomizationTypes";
import type { TenantOverviewData, TenantLoginActivityItem } from "./tenantTypes";
import { TenantWidgetCardWrapper } from "./TenantWidgetCardWrapper";
import { TenantWidgetRenderer } from "./TenantWidgetRenderer";
import { TenantWidgetSettingsDialog } from "./TenantWidgetSettingsDialog";
import { TenantWidgetLibraryDialog } from "./TenantWidgetLibraryDialog";
import { getWidgetDefinition } from "./tenantWidgetRegistry";

interface TenantDashboardGridProps {
  layout: TenantOverviewLayout;
  data: TenantOverviewData;
  loginActivity?: TenantLoginActivityItem[];
  isPresentationMode?: boolean;
  isEditing: boolean;
  onLayoutChange: (newLayout: TenantOverviewLayout) => void;
  isLibraryOpen: boolean;
  setIsLibraryOpen: (open: boolean) => void;
}

export function TenantDashboardGrid({
  layout,
  data,
  loginActivity,
  isPresentationMode,
  isEditing,
  onLayoutChange,
  isLibraryOpen,
  setIsLibraryOpen,
}: TenantDashboardGridProps) {
  const { t } = useI18n();

  // Active dragging widget id
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Widget settings dialog state
  const [configuringWidget, setConfiguringWidget] = useState<TenantOverviewWidgetItem | null>(null);

  // Dnd-kit sensor configured with distance constraint to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const activeDragItem = activeDragId
    ? layout.widgets.find((w) => w.id === activeDragId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      const oldIndex = layout.widgets.findIndex((w) => w.id === active.id);
      const newIndex = layout.widgets.findIndex((w) => w.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedWidgets = arrayMove(layout.widgets, oldIndex, newIndex);
        onLayoutChange({
          ...layout,
          widgets: reorderedWidgets,
        });
      }
    }
  };

  const handleResize = (widgetInstanceId: string, colSpan: TenantWidgetColSpan) => {
    const updated = layout.widgets.map((w) =>
      w.id === widgetInstanceId ? { ...w, colSpan } : w
    );
    onLayoutChange({ ...layout, widgets: updated });
  };

  const handleRemove = (widgetInstanceId: string) => {
    const updated = layout.widgets.filter((w) => w.id !== widgetInstanceId);
    onLayoutChange({ ...layout, widgets: updated });
  };

  const handleSaveSettings = (
    widgetInstanceId: string,
    updates: {
      customTitle?: string;
      colSpan: TenantWidgetColSpan;
      settings?: Record<string, unknown>;
    }
  ) => {
    const updated = layout.widgets.map((w) =>
      w.id === widgetInstanceId ? { ...w, ...updates } : w
    );
    onLayoutChange({ ...layout, widgets: updated });
  };

  const handleAddWidget = (widgetId: Parameters<typeof getWidgetDefinition>[0]) => {
    const definition = getWidgetDefinition(widgetId);
    if (!definition) return;

    const newInstanceId = `widget-${widgetId}-${Date.now()}`;
    const newWidget: TenantOverviewWidgetItem = {
      id: newInstanceId,
      widgetId,
      colSpan: definition.defaultColSpan,
      visible: true,
    };

    onLayoutChange({
      ...layout,
      widgets: [...layout.widgets, newWidget],
    });
    setIsLibraryOpen(false);
  };

  const visibleWidgets = layout.widgets.filter((w) => w.visible);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleWidgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          {visibleWidgets.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/40 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {t("tenantCommandCenter.grid.emptyTitle") || "Your overview layout is empty"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mb-4">
                {t("tenantCommandCenter.grid.emptySubtitle") ||
                  "Add widgets from the widget library to customize your organization control center."}
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsLibraryOpen(true)}
                className="gap-1.5 font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>{t("tenantCommandCenter.library.addWidget") || "Add Widget"}</span>
              </Button>
            </div>
          ) : (
            <div className="tenant-dashboard-grid">
              {visibleWidgets.map((item) => (
                <TenantWidgetCardWrapper
                  key={item.id}
                  item={item}
                  isEditing={isEditing}
                  onRemove={handleRemove}
                  onResize={handleResize}
                  onConfigure={setConfiguringWidget}
                >
                  <TenantWidgetRenderer
                    item={item}
                    data={data}
                    loginActivity={loginActivity}
                    isPresentationMode={isPresentationMode}
                  />
                </TenantWidgetCardWrapper>
              ))}
            </div>
          )}
        </SortableContext>

        {/* Drag Overlay Ghost */}
        <DragOverlay adjustScale={false}>
          {activeDragItem ? (
            <div className="rounded-2xl border-2 border-primary bg-card/95 p-3 shadow-2xl backdrop-blur-md opacity-90 cursor-grabbing">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {activeDragItem.customTitle ||
                    getWidgetDefinition(activeDragItem.widgetId)?.titleKey ||
                    activeDragItem.widgetId}
                </span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  Moving
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Widget Settings Dialog */}
      <TenantWidgetSettingsDialog
        isOpen={configuringWidget !== null}
        onClose={() => setConfiguringWidget(null)}
        widgetItem={configuringWidget}
        onSave={handleSaveSettings}
      />

      {/* Widget Library Dialog */}
      <TenantWidgetLibraryDialog
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        currentWidgets={layout.widgets}
        onAddWidget={handleAddWidget}
      />
    </>
  );
}
