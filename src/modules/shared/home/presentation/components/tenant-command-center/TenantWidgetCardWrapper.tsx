"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Settings, Trash2 } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantOverviewWidgetItem, TenantWidgetColSpan } from "./tenantCustomizationTypes";
import {
  COL_SPAN_CLASSES,
  getWidgetDefinition,
  clampColSpan,
  getEstimatedRowSpan,
} from "./tenantWidgetRegistry";

interface TenantWidgetCardWrapperProps {
  item: TenantOverviewWidgetItem;
  isEditing: boolean;
  onRemove?: (widgetInstanceId: string) => void;
  onResize?: (widgetInstanceId: string, colSpan: TenantWidgetColSpan) => void;
  onConfigure?: (item: TenantOverviewWidgetItem) => void;
  children: React.ReactNode;
}

const WIDTH_PILLS: { span: TenantWidgetColSpan; label: string }[] = [
  { span: 3, label: "1/4" },
  { span: 4, label: "1/3" },
  { span: 6, label: "1/2" },
  { span: 8, label: "2/3" },
  { span: 12, label: "Full" },
];

export function TenantWidgetCardWrapper({
  item,
  isEditing,
  onRemove,
  onResize,
  onConfigure,
  children,
}: TenantWidgetCardWrapperProps) {
  const { t } = useI18n();
  const definition = getWidgetDefinition(item.widgetId);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const [rowSpan, setRowSpan] = React.useState<number>(() =>
    getEstimatedRowSpan(item.widgetId, item.colSpan, isEditing)
  );

  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const calculateSpan = () => {
      const height = el.getBoundingClientRect().height;
      if (height > 0) {
        // Grid auto-row is 10px, gap is 14px => each track adds (10 + 14) = 24px
        const span = Math.max(4, Math.ceil((height + 14) / 24));
        setRowSpan((prev) => (prev !== span ? span : prev));
      }
    };

    calculateSpan();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        calculateSpan();
      });
      observer.observe(el);

      return () => {
        observer.disconnect();
      };
    }
  }, [item.colSpan, item.widgetId, isEditing]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !isEditing,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    gridRowEnd: `span ${rowSpan}`,
  };

  const colSpanClass = COL_SPAN_CLASSES[item.colSpan] || "col-span-12";
  const displayTitle = item.customTitle || (definition ? t(definition.titleKey) : item.widgetId);

  if (!isEditing) {
    return (
      <div
        style={{ gridRowEnd: `span ${rowSpan}` }}
        className={`widget-container min-w-0 ${colSpanClass}`}
      >
        <div ref={contentRef} className="h-fit">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`widget-container min-w-0 ${colSpanClass} group relative transition-all ${
        isDragging ? "z-50 opacity-40" : "z-0"
      }`}
    >
      <div
        ref={contentRef}
        className="border-nx-accent/40 bg-nx-surface/90 relative h-fit rounded-nx-lg border-2 border-dashed p-2.5 transition-all hover:border-nx-accent hover:bg-nx-surface"
      >
        {/* Responsive Customization Controls Toolbar */}
        <div className="widget-toolbar-container mb-2.5 rounded-nx-md border border-nx-line bg-nx-raised px-2.5 py-1.5">
          {/* Header Row: Drag Handle, Title & Category */}
          <div className="widget-toolbar-header-row flex min-w-0 items-center gap-1.5">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-nx-sm border border-nx-line bg-nx-surface text-nx-ink-3 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus active:cursor-grabbing"
              title={t("tenantCommandCenter.customization.dragToReorder") || "Drag to reorder"}
              aria-label={t("tenantCommandCenter.customization.dragToReorder") || "Drag to reorder"}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <span className="truncate text-xs font-semibold text-nx-ink" title={displayTitle}>
              {displayTitle}
            </span>

            {definition && (
              <Badge
                variant="outline"
                className="hidden shrink-0 border-nx-line px-1.5 py-0 text-[9px] capitalize text-nx-ink-3 sm:inline-flex"
              >
                {definition.category}
              </Badge>
            )}
          </div>

          {/* Actions Row: Quick Width Selector, Settings & Remove */}
          <div className="widget-toolbar-actions-row flex shrink-0 items-center gap-1">
            {/* Width Selector Pills */}
            <div className="flex items-center rounded-nx-sm border border-nx-line bg-nx-surface p-0.5">
              {WIDTH_PILLS.map(({ span, label }) => {
                const isAllowed =
                  definition && span >= definition.minColSpan && span <= definition.maxColSpan;
                const isCurrent = item.colSpan === span;

                if (!isAllowed) return null;

                return (
                  <button
                    key={span}
                    type="button"
                    onClick={() => {
                      if (onResize && definition) {
                        onResize(item.id, clampColSpan(item.widgetId, span));
                      }
                    }}
                    className={`rounded-nx-xs px-1.5 py-0.5 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:shadow-nx-focus ${
                      isCurrent
                        ? "bg-nx-accent font-bold text-nx-on-fill"
                        : "text-nx-ink-3 hover:bg-nx-raised hover:text-nx-ink"
                    }`}
                    title={`Set width to ${label}`}
                    aria-label={`Set width to ${label}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Configure Settings Button */}
            {onConfigure && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onConfigure(item)}
                className="h-7 w-7 p-0 text-nx-ink-3 hover:bg-nx-raised hover:text-nx-ink"
                title={t("tenantCommandCenter.customization.widgetSettings") || "Widget settings"}
                aria-label={
                  t("tenantCommandCenter.customization.widgetSettings") || "Widget settings"
                }
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Remove Widget Button */}
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="h-7 w-7 p-0 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                title={t("tenantCommandCenter.customization.removeWidget") || "Remove widget"}
                aria-label={t("tenantCommandCenter.customization.removeWidget") || "Remove widget"}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Live Widget Content */}
        <div className="pointer-events-none select-none opacity-95">{children}</div>
      </div>
    </div>
  );
}
