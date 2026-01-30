"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge, badgeVariants } from "@core/ui/badge";
import GenericSelect from "@core/ui/generic-select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@core/ui/tooltip";
import { GenericModal } from "@core/ui/generic-modal";
import {
  Check,
  Home,
  Users,
  Settings,
  User,
  Info,
  CalendarDays,
  ChevronRight,
  MoveUp,
  ZoomIn,
  Sparkles,
  RotateCw,
  Move,
  Zap,
} from "lucide-react";
import { GenericTable } from "@core/ui/generic-table";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn, getHoverEffectClasses } from "@core/common/utils";

// Custom Badge component for style previews that overrides badgeStyle
function StylePreviewBadge({ variant, badgeStyle, children, className }: {
  variant: string;
  badgeStyle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(badgeVariants({
        variant: variant as any,
        badgeStyle: badgeStyle as any,
        className
      }))}
    >
      {children}
    </div>
  );
}

export function ComponentsTab() {
  const { t, language } = useI18n();
  const settings = useSettings();
  const [multiSelectDemo, setMultiSelectDemo] = useState<string[]>([]);
  const [styleSelections, setStyleSelections] = useState<
    Record<string, string | string[]>
  >({});
  const [testModalOpen, setTestModalOpen] = useState<string | null>(null);
  const hasHoverEffect = settings.hoverEffectType !== "none" && settings.hoverEffectIntensity !== "none";

  const { setModalStyle } = settings;

  const weekDays = [
    t("daysShort.sun"),
    t("daysShort.mon"),
    t("daysShort.tue"),
    t("daysShort.wed"),
    t("daysShort.thu"),
    t("daysShort.fri"),
    t("daysShort.sat"),
  ];
  const sampleMonthLabel = t("settings.calendar.sampleLabel", {
    month: t("months.jan"),
    year: new Intl.NumberFormat(language).format(2024),
  });

  // Sample data for table preview
  const sampleTableData = [
    {
      id: "1",
      name: t("settings.sampleTable.data.john"),
      role: "admin",
      status: "active",
    },
    {
      id: "2",
      name: t("settings.sampleTable.data.jane"),
      role: "user",
      status: "pending",
    },
    {
      id: "3",
      name: t("settings.sampleTable.data.bob"),
      role: "editor",
      status: "inactive",
    },
  ];

  const sampleTableColumns = [
    {
      key: "name" as const,
      label: t("settings.sampleTable.name"),
      sortable: true,
    },
    {
      key: "role" as const,
      label: t("settings.sampleTable.role"),
      sortable: true,
      render: (value: string) => t(`settings.sampleTable.roles.${value}`),
    },
    {
      key: "status" as const,
      label: t("settings.sampleTable.status"),
      render: (value: string) => (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            value === "active" &&
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            value === "pending" &&
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            value === "inactive" &&
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          )}
        >
          {t(`settings.sampleTable.${value}`)}
        </span>
      ),
    },
  ];

  // Simple table preview component for settings
  const TablePreview = ({ style }: { style: string }) => {
    const getTableClasses = () => {
      const baseClasses = "overflow-hidden transition-all duration-300 w-full";

      switch (style) {
        case "striped":
          return cn(baseClasses, "rounded-lg border bg-card");
        case "bordered":
          return cn(baseClasses, "rounded-lg border-2 border-border bg-card");
        case "minimal":
          return cn(baseClasses, "rounded-none border-0 bg-transparent");
        case "glass":
          return cn(
            baseClasses,
            "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl",
            "dark:bg-black/20 dark:border-white/10"
          );
        case "neon":
          return cn(
            baseClasses,
            "rounded-xl border-2 border-primary/30 bg-background shadow-[0_0_30px_rgba(var(--primary),0.3)]",
            "dark:bg-black/95"
          );
        case "gradient":
          return cn(
            baseClasses,
            "rounded-2xl border-0 bg-gradient-to-br from-primary/20 via-background to-primary/10 shadow-2xl"
          );
        case "neumorphism":
          return cn(
            baseClasses,
            "rounded-3xl border-0 bg-background",
            "shadow-[20px_20px_40px_rgba(0,0,0,0.1),-20px_-20px_40px_rgba(255,255,255,0.1)]",
            "dark:shadow-[20px_20px_40px_rgba(0,0,0,0.3),-20px_-20px_40px_rgba(255,255,255,0.05)]"
          );
        case "cyberpunk":
          return cn(
            baseClasses,
            "rounded-none border-2 border-primary bg-background shadow-[0_0_50px_rgba(var(--primary),0.4)]",
            "dark:bg-black/95"
          );
        case "luxury":
          return cn(
            baseClasses,
            "rounded-2xl border border-amber-200/30 bg-gradient-to-br from-amber-50/50 to-amber-100/30 shadow-2xl",
            "dark:from-amber-900/20 dark:to-amber-800/10 dark:border-amber-400/20"
          );
        case "matrix":
          return cn(
            baseClasses,
            "rounded-none border-2 border-primary/30 bg-background shadow-[0_0_30px_hsl(var(--primary)/0.4)]",
            "dark:bg-black/95"
          );
        case "diamond":
          return cn(
            baseClasses,
            "rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/15",
            "shadow-[0_0_40px_hsl(var(--primary)/0.3)] backdrop-blur-xl"
          );
        default:
          return cn(baseClasses, "rounded-lg border bg-card shadow-sm");
      }
    };

    const getHeaderClasses = () => {
      switch (style) {
        case "striped":
          return "bg-muted/50 border-b-2 border-border";
        case "bordered":
          return "bg-muted/40 border-b-2 border-border";
        case "minimal":
          return "bg-transparent border-b border-border/50";
        case "glass":
          return "bg-white/10 border-b border-white/20 backdrop-blur-sm";
        case "neon":
          return "bg-primary/10 border-b border-primary/30";
        case "gradient":
          return "bg-gradient-to-r from-primary/10 to-primary/15 border-b border-primary/20";
        case "neumorphism":
          return "bg-background/80 border-b border-border/40";
        case "cyberpunk":
          return "bg-primary/10 border-b border-primary/40";
        case "luxury":
          return "bg-amber-100/40 border-b border-amber-200/30 dark:bg-amber-900/20";
        case "matrix":
          return "bg-primary/10 border-b border-primary/30";
        case "diamond":
          return "bg-primary/10 border-b border-primary/30";
        default:
          return "bg-muted/40 border-b border-border";
      }
    };

    const getRowClasses = (index: number) => {
      switch (style) {
        case "striped":
          return index % 2 === 0
            ? "bg-muted/20 hover:bg-muted/30"
            : "bg-card hover:bg-muted/20";
        case "bordered":
          return "border-b bg-card hover:bg-muted/20";
        case "minimal":
          return "border-b border-border/30 bg-transparent hover:bg-muted/10";
        case "glass":
          return "bg-white/5 border-b border-white/10 backdrop-blur-sm hover:bg-white/10";
        case "neon":
          return "bg-primary/5 border-b border-primary/20 hover:bg-primary/10";
        case "gradient":
          return "bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 hover:from-primary/10 hover:to-primary/15";
        case "neumorphism":
          return "bg-background/30 border-b border-border/20 hover:bg-background/50";
        case "cyberpunk":
          return "bg-primary/5 border-b border-primary/30 hover:bg-primary/10";
        case "luxury":
          return "bg-amber-50/20 border-b border-amber-200/20 dark:bg-amber-900/10 hover:bg-amber-50/30";
        case "matrix":
          return "bg-primary/5 border-b border-primary/20 hover:bg-primary/10";
        case "diamond":
          return "bg-primary/5 border-b border-primary/20 hover:bg-primary/10";
        default:
          return "bg-card border-b hover:bg-muted/20";
      }
    };

    return (
      <div className={getTableClasses()}>
        <table className="w-full text-xs">
          <thead>
            <tr
              className={cn(
                "font-medium text-muted-foreground",
                getHeaderClasses()
              )}
            >
              <th className="text-left py-1.5 px-2 font-semibold">
                {t("settings.sampleTable.name")}
              </th>
              <th className="text-left py-1.5 px-2 font-semibold">
                {t("settings.sampleTable.role")}
              </th>
              <th className="text-left py-1.5 px-2 font-semibold">
                {t("settings.sampleTable.status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleTableData.map((row, index) => (
              <tr key={row.id} className={getRowClasses(index)}>
                <td className="py-1.5 px-2 font-medium">{row.name}</td>
                <td className="py-1.5 px-2 text-muted-foreground">
                  {t(`settings.sampleTable.roles.${row.role}`)}
                </td>
                <td className="py-1.5 px-2">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      row.status === "active" &&
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                      row.status === "pending" &&
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                      row.status === "inactive" &&
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    )}
                  >
                    {t(`settings.sampleTable.${row.status}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const buttonStyles = [
    {
      value: "default",
      name: t("settings.buttonStyle.options.default.name"),
      class: "rounded-md",
      description: t("settings.buttonStyle.options.default.description"),
    },
    {
      value: "small-round",
      name: t("settings.buttonStyle.options.smallRound.name"),
      class: "rounded",
      description: t("settings.buttonStyle.options.smallRound.description"),
    },
    {
      value: "medium-round",
      name: t("settings.buttonStyle.options.mediumRound.name"),
      class: "rounded-lg",
      description: t("settings.buttonStyle.options.mediumRound.description"),
    },
    {
      value: "large-round",
      name: t("settings.buttonStyle.options.largeRound.name"),
      class: "rounded-xl",
      description: t("settings.buttonStyle.options.largeRound.description"),
    },
    {
      value: "extra-round",
      name: t("settings.buttonStyle.options.extraRound.name"),
      class: "rounded-2xl",
      description: t("settings.buttonStyle.options.extraRound.description"),
    },
    {
      value: "super-round",
      name: t("settings.buttonStyle.options.superRound.name"),
      class: "rounded-3xl",
      description: t("settings.buttonStyle.options.superRound.description"),
    },
    {
      value: "rounded",
      name: t("settings.buttonStyle.options.rounded.name"),
      class: "rounded-full",
      description: t("settings.buttonStyle.options.rounded.description"),
    },
    {
      value: "sharp",
      name: t("settings.buttonStyle.options.sharp.name"),
      class: "rounded-none",
      description: t("settings.buttonStyle.options.sharp.description"),
    },
  ];
  const navigationStyles = [
    {
      value: "default",
      name: t("settings.navigationStyle.options.default.name"),
      description: t("settings.navigationStyle.options.default.description"),
    },
    {
      value: "pills",
      name: t("settings.navigationStyle.options.pills.name"),
      description: t("settings.navigationStyle.options.pills.description"),
    },
    {
      value: "underline",
      name: t("settings.navigationStyle.options.underline.name"),
      description: t("settings.navigationStyle.options.underline.description"),
    },
    {
      value: "sidebar",
      name: t("settings.navigationStyle.options.sidebar.name"),
      description: t("settings.navigationStyle.options.sidebar.description"),
    },
  ];
  const treeStyles = [
    {
      value: "lines",
      name: t("settings.treeStyle.options.lines.name"),
      description: t("settings.treeStyle.options.lines.description"),
      preview: (
        <div className="p-3">
          <div className="h-2 w-24 bg-muted rounded mb-2" />
          <div className="border-l border-muted-foreground/30 ml-4 pl-3 space-y-2">
            <div className="h-2 w-20 bg-muted rounded" />
            <div className="h-2 w-16 bg-muted rounded" />
          </div>
        </div>
      ),
    },
    {
      value: "cards",
      name: t("settings.treeStyle.options.cards.name"),
      description: t("settings.treeStyle.options.cards.description"),
      preview: (
        <div className="p-3 space-y-2">
          <div className="h-6 w-28 bg-card border rounded shadow-sm" />
          <div className="pl-6 space-y-2">
            <div className="h-6 w-24 bg-card border rounded shadow-sm" />
            <div className="h-6 w-20 bg-card border rounded shadow-sm" />
          </div>
        </div>
      ),
    },
    {
      value: "minimal",
      name: t("settings.treeStyle.options.minimal.name"),
      description: t("settings.treeStyle.options.minimal.description"),
      preview: (
        <div className="p-3">
          <div className="h-2 w-24 bg-muted rounded mb-2" />
          <div className="border-l border-dashed border-muted-foreground/30 ml-4 pl-3 space-y-2">
            <div className="h-2 w-20 bg-muted rounded" />
            <div className="h-2 w-16 bg-muted rounded" />
          </div>
        </div>
      ),
    },
    {
      value: "bubble",
      name: t("settings.treeStyle.options.bubble.name"),
      description: t("settings.treeStyle.options.bubble.description"),
      preview: (
        <div className="p-3">
          <div className="inline-flex gap-2 flex-wrap">
            <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px]">
              {t("settings.treeStyle.sample.parent")}
            </div>
            <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px]">
              {t("settings.treeStyle.sample.child1")}
            </div>
            <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px]">
              {t("settings.treeStyle.sample.child2")}
            </div>
          </div>
        </div>
      ),
    },
    {
      value: "modern",
      name: t("settings.treeStyle.options.modern.name"),
      description: t("settings.treeStyle.options.modern.description"),
      preview: (
        <div className="p-3 space-y-1">
          <div className="h-6 w-28 bg-gradient-to-r from-background via-background/95 to-background/90 border border-border/50 rounded shadow-sm" />
          <div className="pl-8 space-y-1">
            <div className="h-6 w-24 bg-gradient-to-r from-background via-background/95 to-background/90 border border-border/50 rounded shadow-sm" />
            <div className="h-6 w-20 bg-gradient-to-r from-background via-background/95 to-background/90 border border-border/50 rounded shadow-sm" />
          </div>
        </div>
      ),
    },
    {
      value: "glass",
      name: t("settings.treeStyle.options.glass.name"),
      description: t("settings.treeStyle.options.glass.description"),
      preview: (
        <div className="p-3 space-y-3">
          <div className="h-6 w-28 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg" />
          <div className="pl-6 space-y-3">
            <div className="h-6 w-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg" />
            <div className="h-6 w-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg" />
          </div>
        </div>
      ),
    },
    {
      value: "elegant",
      name: t("settings.treeStyle.options.elegant.name"),
      description: t("settings.treeStyle.options.elegant.description"),
      preview: (
        <div className="p-3 space-y-1">
          <div className="h-6 w-28 bg-gradient-to-br from-background via-background/98 to-muted/30 border-l-4 border-l-primary/60 border-y border-r border-border/30 rounded-r-lg shadow-sm" />
          <div className="pl-6 space-y-1">
            <div className="h-6 w-24 bg-gradient-to-br from-background via-background/98 to-muted/30 border-l-4 border-l-primary/60 border-y border-r border-border/30 rounded-r-lg shadow-sm" />
            <div className="h-6 w-20 bg-gradient-to-br from-background via-background/98 to-muted/30 border-l-4 border-l-primary/60 border-y border-r border-border/30 rounded-r-lg shadow-sm" />
          </div>
        </div>
      ),
    },
    {
      value: "professional",
      name: t("settings.treeStyle.options.professional.name"),
      description: t("settings.treeStyle.options.professional.description"),
      preview: (
        <div className="p-3 space-y-1">
          <div className="h-6 w-28 bg-card border border-border border-l-4 border-l-primary/60 rounded-md shadow-sm relative overflow-hidden" />
          <div className="pl-8 space-y-1">
            <div className="h-6 w-24 bg-card border border-border rounded-md shadow-sm" />
            <div className="h-6 w-20 bg-card border border-border rounded-md shadow-sm" />
          </div>
        </div>
      ),
    },
    {
      value: "gradient",
      name: t("settings.treeStyle.options.gradient.name"),
      description: t("settings.treeStyle.options.gradient.description"),
      preview: (
        <div className="p-3 space-y-2">
          <div className="h-6 w-28 bg-gradient-to-r from-primary/20 via-background to-secondary/20 border border-transparent rounded shadow-md" />
          <div className="pl-8 space-y-2">
            <div className="h-6 w-24 bg-gradient-to-r from-primary/10 via-background to-secondary/10 border border-transparent rounded shadow-md" />
            <div className="h-6 w-20 bg-gradient-to-r from-primary/10 via-background to-secondary/10 border border-transparent rounded shadow-md" />
          </div>
        </div>
      ),
    },
    {
      value: "neon",
      name: t("settings.treeStyle.options.neon.name"),
      description: t("settings.treeStyle.options.neon.description"),
      preview: (
        <div className="p-3 space-y-2">
          <div className="h-6 w-28 bg-background/90 border border-primary/50 rounded-lg shadow-lg shadow-primary/20 text-primary font-bold" />
          <div className="pl-8 space-y-2">
            <div className="h-6 w-24 bg-background/90 border border-primary/30 rounded-lg shadow-md shadow-primary/10" />
            <div className="h-6 w-20 bg-background/90 border border-primary/30 rounded-lg shadow-md shadow-primary/10" />
          </div>
        </div>
      ),
    },
    {
      value: "organic",
      name: t("settings.treeStyle.options.organic.name"),
      description: t("settings.treeStyle.options.organic.description"),
      preview: (
        <div className="p-3 space-y-3">
          <div className="h-6 w-28 bg-gradient-to-br from-green-50/50 via-background to-blue-50/50 border border-green-200/30 rounded-2xl shadow-sm transform rotate-1" />
          <div className="pl-10 space-y-3">
            <div className="h-6 w-24 bg-gradient-to-br from-green-50/50 via-background to-blue-50/50 border border-green-200/30 rounded-2xl shadow-sm" />
            <div className="h-6 w-20 bg-gradient-to-br from-green-50/50 via-background to-blue-50/50 border border-green-200/30 rounded-2xl shadow-sm" />
          </div>
        </div>
      ),
    },
    {
      value: "corporate",
      name: t("settings.treeStyle.options.corporate.name"),
      description: t("settings.treeStyle.options.corporate.description"),
      preview: (
        <div className="p-3 space-y-1">
          <div className="h-6 w-28 bg-slate-50/50 border-l-8 border-l-blue-600 border-y border-r border-slate-200 rounded-r-md font-bold text-slate-900" />
          <div className="pl-6 space-y-1">
            <div className="h-6 w-24 bg-slate-50/50 border-l-4 border-l-blue-600 border-y border-r border-slate-200 rounded-r-md text-slate-700" />
            <div className="h-6 w-20 bg-slate-50/50 border-l-4 border-l-blue-600 border-y border-r border-slate-200 rounded-r-md text-slate-700" />
          </div>
        </div>
      ),
    },
  ] as const;
  // Icon style options
  const iconStyles = [
    {
      value: "outline",
      name: t("settings.iconStyle.options.outline.name"),
      description: t("settings.iconStyle.options.outline.description"),
    },
    {
      value: "filled",
      name: t("settings.iconStyle.options.filled.name"),
      description: t("settings.iconStyle.options.filled.description"),
    },
    {
      value: "duotone",
      name: t("settings.iconStyle.options.duotone.name"),
      description: t("settings.iconStyle.options.duotone.description"),
    },
    {
      value: "minimal",
      name: t("settings.iconStyle.options.minimal.name"),
      description: t("settings.iconStyle.options.minimal.description"),
    },
  ];
  const inputStyles = [
    {
      value: "default",
      name: t("settings.inputStyle.options.default"),
      class: "rounded-md border",
    },
    {
      value: "rounded",
      name: t("settings.inputStyle.options.rounded"),
      class: "rounded-full border px-4",
    },
    {
      value: "underlined",
      name: t("settings.inputStyle.options.underlined"),
      class: "rounded-none border-0 border-b-2 px-0",
    },
    {
      value: "filled",
      name: t("settings.inputStyle.options.filled"),
      class: "rounded-lg bg-muted border-0",
    },
  ];
  const datePickerStyles = [
    {
      value: "default",
      name: t("settings.datePickerStyle.options.default.name"),
      description: t("settings.datePickerStyle.options.default.description"),
      preview: "bg-background border border-border rounded-md",
    },
    {
      value: "modern",
      name: t("settings.datePickerStyle.options.modern.name"),
      description: t("settings.datePickerStyle.options.modern.description"),
      preview:
        "bg-gradient-to-r from-background to-muted/20 border border-border/50 rounded-md shadow-sm",
    },
    {
      value: "glass",
      name: t("settings.datePickerStyle.options.glass.name"),
      description: t("settings.datePickerStyle.options.glass.description"),
      preview:
        "bg-background/60 backdrop-blur-sm border border-white/20 rounded-md shadow-lg",
    },
    {
      value: "outlined",
      name: t("settings.datePickerStyle.options.outlined.name"),
      description: t("settings.datePickerStyle.options.outlined.description"),
      preview: "bg-transparent border-2 border-border rounded-md",
    },
    {
      value: "filled",
      name: t("settings.datePickerStyle.options.filled.name"),
      description: t("settings.datePickerStyle.options.filled.description"),
      preview: "bg-muted/50 border border-transparent rounded-md",
    },
    {
      value: "minimal",
      name: t("settings.datePickerStyle.options.minimal.name"),
      description: t("settings.datePickerStyle.options.minimal.description"),
      preview: "bg-transparent border-b-2 border-border rounded-none",
    },
    {
      value: "elegant",
      name: t("settings.datePickerStyle.options.elegant.name"),
      description: t("settings.datePickerStyle.options.elegant.description"),
      preview:
        "bg-gradient-to-br from-background via-background to-muted/10 border border-border/30 rounded-md shadow-sm",
    },
  ];
  const calendarStyles = [
    {
      value: "default",
      name: t("settings.calendarStyle.options.default.name"),
      description: t("settings.calendarStyle.options.default.description"),
    },
    {
      value: "modern",
      name: t("settings.calendarStyle.options.modern.name"),
      description: t("settings.calendarStyle.options.modern.description"),
    },
    {
      value: "glass",
      name: t("settings.calendarStyle.options.glass.name"),
      description: t("settings.calendarStyle.options.glass.description"),
    },
    {
      value: "elegant",
      name: t("settings.calendarStyle.options.elegant.name"),
      description: t("settings.calendarStyle.options.elegant.description"),
    },
    {
      value: "minimal",
      name: t("settings.calendarStyle.options.minimal.name"),
      description: t("settings.calendarStyle.options.minimal.description"),
    },
    {
      value: "dark",
      name: t("settings.calendarStyle.options.dark.name"),
      description: t("settings.calendarStyle.options.dark.description"),
    },
  ];
  // Badge style options
  const badgeStyles = [
    {
      value: "default",
      name: t("settings.badgeStyle.options.default.name"),
      description: t("settings.badgeStyle.options.default.description"),
      class:
        "rounded-full border border-border bg-background/80 text-foreground",
    },
    {
      value: "modern",
      name: t("settings.badgeStyle.options.modern.name"),
      description: t("settings.badgeStyle.options.modern.description"),
      class:
        "rounded-lg border border-border/50 bg-muted/50 backdrop-blur-sm text-foreground",
    },
    {
      value: "glass",
      name: t("settings.badgeStyle.options.glass.name"),
      description: t("settings.badgeStyle.options.glass.description"),
      class:
        "rounded-xl border border-border/30 bg-background/20 backdrop-blur-md text-foreground",
    },
    {
      value: "neon",
      name: t("settings.badgeStyle.options.neon.name"),
      description: t("settings.badgeStyle.options.neon.description"),
      class:
        "rounded-md border border-primary/40 bg-primary/5 text-primary shadow-lg shadow-primary/20",
    },
    {
      value: "gradient",
      name: t("settings.badgeStyle.options.gradient.name"),
      description: t("settings.badgeStyle.options.gradient.description"),
      class:
        "rounded-full border-0 bg-gradient-to-r from-primary/70 to-primary/90 text-primary-foreground",
    },
    {
      value: "outlined",
      name: t("settings.badgeStyle.options.outlined.name"),
      description: t("settings.badgeStyle.options.outlined.description"),
      class:
        "rounded-lg border-2 border-primary/50 bg-transparent text-primary",
    },
    {
      value: "filled",
      name: t("settings.badgeStyle.options.filled.name"),
      description: t("settings.badgeStyle.options.filled.description"),
      class: "rounded-md border-0 bg-primary text-primary-foreground",
    },
    {
      value: "minimal",
      name: t("settings.badgeStyle.options.minimal.name"),
      description: t("settings.badgeStyle.options.minimal.description"),
      class:
        "rounded-none border-0 bg-transparent text-muted-foreground underline decoration-muted-foreground/50",
    },
    {
      value: "pill",
      name: t("settings.badgeStyle.options.pill.name"),
      description: t("settings.badgeStyle.options.pill.description"),
      class:
        "rounded-full border border-border bg-muted/30 text-foreground px-3",
    },
    {
      value: "square",
      name: t("settings.badgeStyle.options.square.name"),
      description: t("settings.badgeStyle.options.square.description"),
      class: "rounded-sm border border-border bg-muted/20 text-foreground",
    },
  ];
  const avatarStyles = [
    {
      value: "default",
      name: t("settings.avatarStyle.options.default"),
      class: "rounded-full",
    },
    {
      value: "rounded",
      name: t("settings.avatarStyle.options.rounded"),
      class: "rounded-lg",
    },
    {
      value: "square",
      name: t("settings.avatarStyle.options.square"),
      class: "rounded-none",
    },
    {
      value: "hexagon",
      name: t("settings.avatarStyle.options.hexagon"),
      class: "rounded-full",
    },
  ];
  const formStyles = [
    {
      value: "default",
      name: t("settings.formStyle.options.default.name"),
      description: t("settings.formStyle.options.default.description"),
    },
    {
      value: "compact",
      name: t("settings.formStyle.options.compact.name"),
      description: t("settings.formStyle.options.compact.description"),
    },
    {
      value: "spacious",
      name: t("settings.formStyle.options.spacious.name"),
      description: t("settings.formStyle.options.spacious.description"),
    },
    {
      value: "inline",
      name: t("settings.formStyle.options.inline.name"),
      description: t("settings.formStyle.options.inline.description"),
    },
    {
      value: "modern",
      name: t("settings.formStyle.options.modern.name"),
      description: t("settings.formStyle.options.modern.description"),
    },
    {
      value: "glass",
      name: t("settings.formStyle.options.glass.name"),
      description: t("settings.formStyle.options.glass.description"),
    },
    {
      value: "minimal",
      name: t("settings.formStyle.options.minimal.name"),
      description: t("settings.formStyle.options.minimal.description"),
    },
    {
      value: "card",
      name: t("settings.formStyle.options.card.name"),
      description: t("settings.formStyle.options.card.description"),
    },
    {
      value: "neon",
      name: t("settings.formStyle.options.neon.name"),
      description: t("settings.formStyle.options.neon.description"),
    },
    {
      value: "elegant",
      name: t("settings.formStyle.options.elegant.name"),
      description: t("settings.formStyle.options.elegant.description"),
    },
    {
      value: "organic",
      name: t("settings.formStyle.options.organic.name"),
      description: t("settings.formStyle.options.organic.description"),
    },
    {
      value: "retro",
      name: t("settings.formStyle.options.retro.name"),
      description: t("settings.formStyle.options.retro.description"),
    },
  ];

  // Form preview component
  const FormPreview = ({
    style,
    isSelected,
  }: {
    style: string;
    isSelected?: boolean;
  }) => {
    const getContainerClasses = () => {
      const baseClasses = "p-3 space-y-3";

      switch (style) {
        case "compact":
          return cn(baseClasses, "space-y-1.5");
        case "spacious":
          return cn(baseClasses, "space-y-4 p-4");
        case "inline":
          return cn(baseClasses, "space-y-2");
        case "modern":
          return cn(
            baseClasses,
            "bg-gradient-to-br from-background to-muted/20 rounded-xl border shadow-sm"
          );
        case "glass":
          return cn(
            baseClasses,
            "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl dark:bg-black/20"
          );
        case "minimal":
          return cn(baseClasses, "bg-transparent border-0");
        case "card":
          return cn(baseClasses, "bg-card border rounded-lg shadow-md p-4");
        case "neon":
          return cn(
            baseClasses,
            "bg-black/90 border-2 border-cyan-400/50 rounded-xl shadow-lg shadow-cyan-400/20"
          );
        case "elegant":
          return cn(
            baseClasses,
            "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl"
          );
        case "organic":
          return cn(
            baseClasses,
            "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-3xl shadow-lg"
          );
        case "retro":
          return cn(
            baseClasses,
            "bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-300 dark:border-orange-600 rounded-lg shadow-lg"
          );
        default:
          return baseClasses;
      }
    };

    const getLabelClasses = () => {
      switch (style) {
        case "compact":
          return "text-xs font-medium text-muted-foreground mb-1";
        case "spacious":
          return "text-sm font-semibold text-foreground mb-2";
        case "modern":
          return "text-sm font-medium text-foreground mb-1.5";
        case "glass":
          return "text-sm font-medium text-foreground/90 mb-1.5";
        case "minimal":
          return "text-xs font-normal text-muted-foreground mb-1";
        case "card":
          return "text-sm font-semibold text-foreground mb-2";
        case "neon":
          return "text-xs font-bold text-cyan-400 mb-1 uppercase tracking-wider";
        case "elegant":
          return "text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";
        case "organic":
          return "text-sm font-medium text-green-700 dark:text-green-300 mb-1.5";
        case "retro":
          return "text-sm font-bold text-orange-700 dark:text-orange-300 mb-1.5";
        default:
          return "text-sm font-medium text-muted-foreground mb-1.5";
      }
    };

    const getInputClasses = () => {
      const baseClasses = "w-full text-xs transition-all duration-200";

      switch (style) {
        case "compact":
          return cn(baseClasses, "h-6 px-2 border rounded bg-background");
        case "spacious":
          return cn(
            baseClasses,
            "h-9 px-3 border rounded-lg bg-background shadow-sm"
          );
        case "inline":
          return cn(baseClasses, "h-7 px-2 border rounded bg-background");
        case "modern":
          return cn(
            baseClasses,
            "h-8 px-3 border-2 border-border/50 rounded-xl bg-background/50 shadow-sm hover:border-primary/50 focus:border-primary"
          );
        case "glass":
          return cn(
            baseClasses,
            "h-8 px-3 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm placeholder:text-white/60 dark:bg-black/20"
          );
        case "minimal":
          return cn(
            baseClasses,
            "h-7 px-2 border-0 border-b-2 border-border/30 rounded-none bg-transparent focus:border-primary"
          );
        case "card":
          return cn(
            baseClasses,
            "h-8 px-3 border border-border rounded-lg bg-muted/30 shadow-inner"
          );
        case "neon":
          return cn(
            baseClasses,
            "h-8 px-3 border-2 border-cyan-400/50 rounded-xl bg-black/50 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20"
          );
        case "elegant":
          return cn(
            baseClasses,
            "h-8 px-4 border border-slate-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-800 shadow-inner focus:ring-2 focus:ring-slate-400/20"
          );
        case "organic":
          return cn(
            baseClasses,
            "h-8 px-3 border-2 border-green-300 dark:border-green-600 rounded-full bg-green-50 dark:bg-green-900/20 focus:border-green-500 focus:bg-green-100 dark:focus:bg-green-900/30"
          );
        case "retro":
          return cn(
            baseClasses,
            "h-8 px-3 border-2 border-orange-400 dark:border-orange-500 rounded bg-orange-50 dark:bg-orange-900/20 focus:border-orange-600 shadow-sm"
          );
        default:
          return cn(baseClasses, "h-7 px-2 border rounded bg-background");
      }
    };

    const getFieldClasses = () => {
      switch (style) {
        case "inline":
          return "flex items-center gap-2";
        default:
          return "space-y-1";
      }
    };

    return (
      <div
        className={cn(
          getContainerClasses(),
          isSelected && "ring-2 ring-primary/20 bg-primary/5"
        )}
      >
        <div className={getFieldClasses()}>
          <label className={getLabelClasses()}>Name</label>
          <input
            className={getInputClasses()}
            placeholder="John Doe"
            readOnly
          />
        </div>
        <div className={getFieldClasses()}>
          <label className={getLabelClasses()}>Email</label>
          <input
            className={getInputClasses()}
            placeholder="john@example.com"
            readOnly
          />
        </div>
        {style !== "inline" && (
          <div className="pt-1">
            <button
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                style === "modern" &&
                  "bg-primary text-primary-foreground rounded-xl shadow-md hover:shadow-lg",
                style === "glass" &&
                  "bg-white/20 text-foreground border border-white/30 rounded-xl backdrop-blur-sm",
                style === "minimal" &&
                  "bg-transparent text-primary border-b-2 border-primary rounded-none",
                style === "card" &&
                  "bg-primary text-primary-foreground rounded-lg shadow-sm",
                style === "compact" &&
                  "bg-primary text-primary-foreground rounded",
                style === "spacious" &&
                  "bg-primary text-primary-foreground rounded-lg px-4 py-2",
                ![
                  "modern",
                  "glass",
                  "minimal",
                  "card",
                  "compact",
                  "spacious",
                ].includes(style) &&
                  "bg-primary text-primary-foreground rounded"
              )}
            >
              Submit
            </button>
          </div>
        )}
        {isSelected && (
          <div className="absolute top-1 right-1 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
            Current
          </div>
        )}
      </div>
    );
  };
  const loadingStyles = [
    {
      value: "spinner",
      name: t("settings.loadingStyle.options.spinner.name"),
      description: t("settings.loadingStyle.options.spinner.description"),
      component: (
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      ),
    },
    {
      value: "dots",
      name: t("settings.loadingStyle.options.dots.name"),
      description: t("settings.loadingStyle.options.dots.description"),
      component: (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
        </div>
      ),
    },
    {
      value: "bars",
      name: t("settings.loadingStyle.options.bars.name"),
      description: t("settings.loadingStyle.options.bars.description"),
      component: (
        <div className="flex space-x-1">
          <div className="w-1 h-6 bg-primary animate-pulse"></div>
          <div className="w-1 h-6 bg-primary animate-pulse delay-100"></div>
          <div className="w-1 h-6 bg-primary animate-pulse delay-200"></div>
        </div>
      ),
    },
    {
      value: "pulse",
      name: t("settings.loadingStyle.options.pulse.name"),
      description: t("settings.loadingStyle.options.pulse.description"),
      component: (
        <div className="w-6 h-6 bg-primary rounded animate-pulse"></div>
      ),
    },
    {
      value: "wave",
      name: t("settings.loadingStyle.options.wave.name"),
      description: t("settings.loadingStyle.options.wave.description"),
      component: (
        <div className="flex space-x-1 items-end">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse"></div>
          <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75"></div>
          <div className="w-1 h-6 bg-primary rounded-full animate-pulse delay-150"></div>
          <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-225"></div>
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse delay-300"></div>
        </div>
      ),
    },
    {
      value: "orbit",
      name: t("settings.loadingStyle.options.orbit.name"),
      description: t("settings.loadingStyle.options.orbit.description"),
      component: (
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 border border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 -ml-0.75 -mt-0.75 bg-primary rounded-full animate-spin origin-[0_12px]"></div>
        </div>
      ),
    },
    {
      value: "ripple",
      name: t("settings.loadingStyle.options.ripple.name"),
      description: t("settings.loadingStyle.options.ripple.description"),
      component: (
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 border border-primary rounded-full animate-ping"></div>
          <div className="absolute inset-0 border border-primary rounded-full animate-ping delay-150"></div>
        </div>
      ),
    },
    {
      value: "gradient",
      name: t("settings.loadingStyle.options.gradient.name"),
      description: t("settings.loadingStyle.options.gradient.description"),
      component: (
        <div className="w-6 h-6 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full animate-spin"></div>
      ),
    },
    {
      value: "matrix",
      name: t("settings.loadingStyle.options.matrix.name"),
      description: t("settings.loadingStyle.options.matrix.description"),
      component: (
        <div className="grid grid-cols-4 gap-0.5">
          <div className="w-1 h-4 bg-primary animate-pulse opacity-100"></div>
          <div className="w-1 h-5 bg-primary animate-pulse delay-100 opacity-75"></div>
          <div className="w-1 h-3 bg-primary animate-pulse delay-200 opacity-50"></div>
          <div className="w-1 h-4 bg-primary animate-pulse delay-300 opacity-75"></div>
          <div className="w-1 h-3 bg-primary animate-pulse delay-75 opacity-60"></div>
          <div className="w-1 h-5 bg-primary animate-pulse delay-175 opacity-90"></div>
          <div className="w-1 h-4 bg-primary animate-pulse delay-250 opacity-70"></div>
          <div className="w-1 h-3 bg-primary animate-pulse delay-325 opacity-80"></div>
        </div>
      ),
    },
    {
      value: "helix",
      name: t("settings.loadingStyle.options.helix.name"),
      description: t("settings.loadingStyle.options.helix.description"),
      component: (
        <div className="relative w-6 h-6">
          <div
            className="absolute w-2 h-2 bg-primary rounded-full animate-spin"
            style={{
              animation:
                "spin 1.5s linear infinite, helixMove 3s ease-in-out infinite",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></div>
          <div
            className="absolute w-1.5 h-1.5 bg-primary/70 rounded-full animate-spin"
            style={{
              animation:
                "spin 1.5s linear infinite reverse, helixMove 3s ease-in-out infinite reverse",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></div>
        </div>
      ),
    },
    {
      value: "quantum",
      name: t("settings.loadingStyle.options.quantum.name"),
      description: t("settings.loadingStyle.options.quantum.description"),
      component: (
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 border border-primary/20 rounded-full animate-pulse"></div>
          <div className="absolute inset-1 border border-primary/40 rounded-full animate-pulse delay-200"></div>
          <div className="absolute inset-2 border border-primary/60 rounded-full animate-pulse delay-400"></div>
          <div className="absolute inset-3 bg-primary rounded-full animate-pulse delay-600"></div>
          <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-primary rounded-full animate-ping transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      ),
    },
    {
      value: "morphing",
      name: t("settings.loadingStyle.options.morphing.name"),
      description: t("settings.loadingStyle.options.morphing.description"),
      component: (
        <div className="relative w-6 h-6">
          <div
            className="absolute inset-0 bg-primary animate-pulse"
            style={{
              animation: "morphShape 3s ease-in-out infinite",
              borderRadius: "50%",
            }}
          ></div>
          <div
            className="absolute inset-1 bg-primary/70 animate-pulse"
            style={{
              animation: "morphShape 3s ease-in-out infinite reverse",
              borderRadius: "20%",
            }}
          ></div>
        </div>
      ),
    },
  ];
  // Tooltip style options - UPDATED WITH ACTUAL TOOLTIPS
  const tooltipStyles = [
    {
      value: "default",
      name: t("settings.tooltipStyle.options.default.name"),
      description: t("settings.tooltipStyle.options.default.description"),
    },
    {
      value: "rounded",
      name: t("settings.tooltipStyle.options.rounded.name"),
      description: t("settings.tooltipStyle.options.rounded.description"),
    },
    {
      value: "sharp",
      name: t("settings.tooltipStyle.options.sharp.name"),
      description: t("settings.tooltipStyle.options.sharp.description"),
    },
    {
      value: "bubble",
      name: t("settings.tooltipStyle.options.bubble.name"),
      description: t("settings.tooltipStyle.options.bubble.description"),
    },
    {
      value: "glass",
      name: t("settings.tooltipStyle.options.glass.name"),
      description: t("settings.tooltipStyle.options.glass.description"),
    },
    {
      value: "neon",
      name: t("settings.tooltipStyle.options.neon.name"),
      description: t("settings.tooltipStyle.options.neon.description"),
    },
    {
      value: "minimal",
      name: t("settings.tooltipStyle.options.minimal.name"),
      description: t("settings.tooltipStyle.options.minimal.description"),
    },
    {
      value: "elegant",
      name: t("settings.tooltipStyle.options.elegant.name"),
      description: t("settings.tooltipStyle.options.elegant.description"),
    },
  ];
  const modalStyles = [
    {
      value: "default",
      name: t("settings.modalStyle.options.default.name"),
      description: t("settings.modalStyle.options.default.description"),
    },
    {
      value: "centered",
      name: t("settings.modalStyle.options.centered.name"),
      description: t("settings.modalStyle.options.centered.description"),
    },
    {
      value: "fullscreen",
      name: t("settings.modalStyle.options.fullscreen.name"),
      description: t("settings.modalStyle.options.fullscreen.description"),
    },
    {
      value: "drawer",
      name: t("settings.modalStyle.options.drawer.name"),
      description: t("settings.modalStyle.options.drawer.description"),
    },
    {
      value: "glass",
      name: t("settings.modalStyle.options.glass.name"),
      description: t("settings.modalStyle.options.glass.description"),
    },
    {
      value: "floating",
      name: t("settings.modalStyle.options.floating.name"),
      description: t("settings.modalStyle.options.floating.description"),
    },
    {
      value: "card",
      name: t("settings.modalStyle.options.card.name"),
      description: t("settings.modalStyle.options.card.description"),
    },
    {
      value: "overlay",
      name: t("settings.modalStyle.options.overlay.name"),
      description: t("settings.modalStyle.options.overlay.description"),
    },
  ];
  const previewStyleName = modalStyles.find(
    (s) => s.value === testModalOpen
  )?.name;
  return (
    <>
      {/* Button Styles - UPDATED WITH MORE OPTIONS */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.buttonStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.buttonStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {buttonStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer border-2 p-4 transition-all hover:scale-105",
                  style.class,
                  settings.buttonStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setButtonStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <div
                    className={cn(
                      "h-8 bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium",
                      style.class
                    )}
                  >
                    {style.name}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{style.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {style.description}
                    </p>
                  </div>
                </div>
                {settings.buttonStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.treeStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.treeStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {treeStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.treeStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setTreeStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                  <div className="bg-muted/30 rounded">{style.preview}</div>
                </div>
                {settings.treeStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.navigationStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.navigationStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {navigationStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.navigationStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setNavigationStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                  <div className="flex gap-1">
                    {style.value === "pills" && (
                      <>
                        <div className="h-6 w-12 bg-primary rounded-full"></div>
                        <div className="h-6 w-12 bg-muted rounded-full"></div>
                      </>
                    )}
                    {style.value === "underline" && (
                      <>
                        <div className="h-6 w-12 bg-muted border-b-2 border-primary"></div>
                        <div className="h-6 w-12 bg-muted"></div>
                      </>
                    )}
                    {style.value === "sidebar" && (
                      <>
                        <div className="h-6 w-2 bg-primary rounded"></div>
                        <div className="h-6 w-16 bg-muted rounded"></div>
                      </>
                    )}
                    {style.value === "default" && (
                      <>
                        <div className="h-6 w-12 bg-primary rounded"></div>
                        <div className="h-6 w-12 bg-muted rounded"></div>
                      </>
                    )}
                  </div>
                </div>
                {settings.navigationStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DatePicker Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.datePickerStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.datePickerStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datePickerStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.datePickerStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setDatePickerStyle(style.value as any)}
              >
                <div className="space-y-3">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {style.description}
                  </p>
                  {/* DatePicker Preview */}
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "h-10 w-full px-3 flex items-center justify-between text-xs text-muted-foreground",
                        style.preview
                      )}
                    >
                      <span>{t("settings.datePickerStyle.previewDate")}</span>
                      <CalendarDays className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                {settings.datePickerStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.calendarStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.calendarStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calendarStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.calendarStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setCalendarStyle(style.value as any)}
              >
                <div className="space-y-3">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {style.description}
                  </p>
                  {/* Calendar Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <CalendarDays className="h-3 w-3" />
                      <span>{sampleMonthLabel}</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-xs">
                      {weekDays.map((day, i) => (
                        <div
                          key={i}
                          className="h-4 w-4 flex items-center justify-center text-muted-foreground"
                        >
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 7 }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-4 w-4 flex items-center justify-center rounded-sm text-xs",
                            i === 3
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {settings.calendarStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Icon Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.iconStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.iconStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {iconStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.iconStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setIconStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Home className="h-6 w-6" />
                    <Users className="h-6 w-6" />
                    <Settings className="h-6 w-6" />
                  </div>
                </div>
                {settings.iconStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.inputStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.inputStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {inputStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.inputStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setInputStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{style.name}</h4>
                  <div
                    className={cn(
                      "h-8 bg-background text-sm flex items-center px-3",
                      style.class
                    )}
                  >
                    Sample input
                  </div>
                </div>
                {settings.inputStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Styles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-0.5 h-4 w-4">
                <div className="bg-primary/60 rounded-[1px]"></div>
                <div className="bg-primary/60 rounded-[1px]"></div>
                <div className="bg-primary/60 rounded-[1px]"></div>
                <div className="bg-primary/40 rounded-[1px]"></div>
                <div className="bg-primary/40 rounded-[1px]"></div>
                <div className="bg-primary/40 rounded-[1px]"></div>
                <div className="bg-primary/30 rounded-[1px]"></div>
                <div className="bg-primary/30 rounded-[1px]"></div>
                <div className="bg-primary/30 rounded-[1px]"></div>
              </div>
            </div>
            {t("settings.tableStyle.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.tableStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                value: "default",
                name: t("settings.tableStyle.options.default.title"),
                description: t(
                  "settings.tableStyle.options.default.description"
                ),
              },
              {
                value: "striped",
                name: t("settings.tableStyle.options.striped.title"),
                description: t(
                  "settings.tableStyle.options.striped.description"
                ),
              },
              {
                value: "bordered",
                name: t("settings.tableStyle.options.bordered.title"),
                description: t(
                  "settings.tableStyle.options.bordered.description"
                ),
              },
              {
                value: "minimal",
                name: t("settings.tableStyle.options.minimal.title"),
                description: t(
                  "settings.tableStyle.options.minimal.description"
                ),
              },
              {
                value: "glass",
                name: t("settings.tableStyle.options.glass.title"),
                description: t("settings.tableStyle.options.glass.description"),
              },
              {
                value: "neon",
                name: t("settings.tableStyle.options.neon.title"),
                description: t("settings.tableStyle.options.neon.description"),
              },
              {
                value: "gradient",
                name: t("settings.tableStyle.options.gradient.title"),
                description: t(
                  "settings.tableStyle.options.gradient.description"
                ),
              },
              {
                value: "neumorphism",
                name: t("settings.tableStyle.options.neumorphism.title"),
                description: t(
                  "settings.tableStyle.options.neumorphism.description"
                ),
              },
              {
                value: "cyberpunk",
                name: t("settings.tableStyle.options.cyberpunk.title"),
                description: t(
                  "settings.tableStyle.options.cyberpunk.description"
                ),
              },
              {
                value: "luxury",
                name: t("settings.tableStyle.options.luxury.title"),
                description: t(
                  "settings.tableStyle.options.luxury.description"
                ),
              },
              {
                value: "matrix",
                name: t("settings.tableStyle.options.matrix.title"),
                description: t(
                  "settings.tableStyle.options.matrix.description"
                ),
              },
              {
                value: "diamond",
                name: t("settings.tableStyle.options.diamond.title"),
                description: t(
                  "settings.tableStyle.options.diamond.description"
                ),
              },
            ].map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.tableStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setTableStyle(style.value as any)}
              >
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold">{style.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {style.description}
                    </p>
                  </div>

                  {/* Table Preview */}
                  <div className="w-full scale-90 origin-center">
                    <TablePreview style={style.value} />
                  </div>
                </div>
                {settings.tableStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hover Effect Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MoveUp className="h-5 w-5 text-primary" />
            </div>
            Hover Effects
          </CardTitle>
          <CardDescription>
            Customize hover effects for cards and tables. Choose from 6 effect types and 4 intensity levels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hover Effect Type */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Hover Effect Type</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Select the type of hover effect to apply
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {[
                {
                  value: "none",
                  name: "None",
                  description: "No hover effect",
                  icon: Move,
                },
                {
                  value: "elevate",
                  name: "Elevate",
                  description: "Lift and shadow",
                  icon: MoveUp,
                },
                {
                  value: "scale",
                  name: "Scale",
                  description: "Grow on hover",
                  icon: ZoomIn,
                },
                {
                  value: "glow",
                  name: "Glow",
                  description: "Glowing border",
                  icon: Sparkles,
                },
                {
                  value: "shimmer",
                  name: "Shimmer",
                  description: "Shimmer animation",
                  icon: Zap,
                },
                {
                  value: "rotate",
                  name: "Rotate",
                  description: "Slight rotation",
                  icon: RotateCw,
                },
                {
                  value: "slide",
                  name: "Slide",
                  description: "Slide movement",
                  icon: Move,
                },
              ].map((effect) => (
                <div
                  key={effect.value}
                  className={cn(
                    "relative cursor-pointer rounded-lg border-2 p-4 transition-all",
                    settings.hoverEffectType === effect.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                  onClick={() => settings.setHoverEffectType(effect.value as any)}
                >
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <effect.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-sm">{effect.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {effect.description}
                      </p>
                    </div>
                  </div>
                  {settings.hoverEffectType === effect.value && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hover Effect Intensity */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Hover Effect Intensity</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Control the strength of the hover effect
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  value: "none",
                  name: "None",
                  description: "No effect",
                  intensity: 0,
                },
                {
                  value: "small",
                  name: "Small",
                  description: "Subtle effect",
                  intensity: 1,
                },
                {
                  value: "medium",
                  name: "Medium",
                  description: "Balanced effect",
                  intensity: 2,
                },
                {
                  value: "strong",
                  name: "Strong",
                  description: "Bold effect",
                  intensity: 3,
                },
              ].map((intensity) => (
                <div
                  key={intensity.value}
                  className={cn(
                    "relative cursor-pointer rounded-lg border-2 p-4 transition-all",
                    settings.hoverEffectIntensity === intensity.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                  onClick={() => settings.setHoverEffectIntensity(intensity.value as any)}
                >
                  <div className="space-y-3">
                    <div className="flex justify-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-8 rounded transition-all",
                            i < intensity.intensity
                              ? "bg-primary w-3"
                              : "bg-muted w-3"
                          )}
                        />
                      ))}
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-sm">{intensity.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {intensity.description}
                      </p>
                    </div>
                  </div>
                  {settings.hoverEffectIntensity === intensity.value && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Preview</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Hover over the cards below to see the effect
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Card Preview</CardTitle>
                  <CardDescription>
                    This card demonstrates the hover effect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Hover over this card to see the {settings.hoverEffectType !== "none" ? settings.hoverEffectType : "no"} effect
                  </p>
                </CardContent>
              </Card>
              <div className={cn(
                "border rounded-lg p-4 cursor-pointer bg-card",
                !hasHoverEffect && "transition-none",
                getHoverEffectClasses(settings.hoverEffectType, settings.hoverEffectIntensity)
              )}>
                <div className="text-sm font-semibold mb-2">Table Row Preview</div>
                <div className="text-xs text-muted-foreground">
                  Hover over this element to see the table row hover effect
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.badgeStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.badgeStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badgeStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.badgeStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setBadgeStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{style.name}</h4>
                  <div className="flex justify-center gap-1">
                    <StylePreviewBadge 
                      variant="active" 
                      badgeStyle={style.value}
                    >
                      Active
                    </StylePreviewBadge>
                    <StylePreviewBadge 
                      variant="inactive" 
                      badgeStyle={style.value}
                    >
                      Inactive
                    </StylePreviewBadge>
                  </div>
                </div>
                {settings.badgeStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Avatar Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.avatarStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.avatarStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {avatarStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.avatarStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setAvatarStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{style.name}</h4>
                  <div className="flex justify-center">
                    <div
                      className={cn(
                        "w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium",
                        style.class
                      )}
                    >
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                {settings.avatarStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.formStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.formStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {formStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 transition-all hover:scale-105",
                  settings.formStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setFormStyle(style.value as any)}
              >
                <div className="space-y-3 p-3">
                  <div className="text-center">
                    <h4 className="font-semibold text-sm">{style.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {style.description}
                    </p>
                  </div>

                  {/* Form Preview */}
                  <div className="scale-90 origin-center">
                    <FormPreview
                      style={style.value}
                      isSelected={settings.formStyle === style.value}
                    />
                  </div>
                </div>
                {settings.formStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.loadingStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.loadingStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {loadingStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.loadingStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setLoadingStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                  <div className="flex justify-center">{style.component}</div>
                </div>
                {settings.loadingStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tooltip Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.tooltipStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.tooltipStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {tooltipStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.tooltipStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setTooltipStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                  <div className="flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Sample tooltip with {""}
                          {style.name.toLowerCase()} style
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                {settings.tooltipStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Styles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.modalStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.modalStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {modalStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                  settings.modalStyle === style.value
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/50"
                )}
                onClick={() => settings.setModalStyle(style.value as any)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold">{style.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                  <div className="relative h-12 bg-gray-100 rounded">
                    {style.value === "default" && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-6 bg-white border rounded shadow"></div>
                    )}
                    {style.value === "centered" && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-6 bg-white border rounded shadow"></div>
                    )}
                    {style.value === "fullscreen" && (
                      <div className="absolute inset-1 bg-white border rounded shadow"></div>
                    )}
                    {style.value === "drawer" && (
                      <div className="absolute right-1 top-1 bottom-1 w-6 bg-white border rounded shadow"></div>
                    )}
                  </div>
                </div>
                {settings.modalStyle === style.value && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Multi-Select Component Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>{t("components.multiSelect.title")}</CardTitle>
          <CardDescription>
            {t("components.multiSelect.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Style Demo */}
            <div className="space-y-3">
              <h4 className="font-medium">
                {t("components.multiSelect.currentStyle")}:{" "}
                {settings.selectStyle}
              </h4>
              <div className="max-w-md">
                <GenericSelect
                  type="multi"
                  options={[
                    {
                      value: "react",
                      label: t(
                        "components.multiSelect.categories.webTech.react"
                      ),
                    },
                    {
                      value: "vue",
                      label: t("components.multiSelect.categories.webTech.vue"),
                    },
                    {
                      value: "angular",
                      label: t(
                        "components.multiSelect.categories.webTech.angular"
                      ),
                    },
                    {
                      value: "svelte",
                      label: t(
                        "components.multiSelect.categories.webTech.svelte"
                      ),
                    },
                    {
                      value: "nextjs",
                      label: t(
                        "components.multiSelect.categories.webTech.nextjs"
                      ),
                    },
                    {
                      value: "typescript",
                      label: t(
                        "components.multiSelect.categories.webTech.typescript"
                      ),
                    },
                  ]}
                  value={multiSelectDemo}
                  onValueChange={(value: string | string[]) =>
                    setMultiSelectDemo(Array.isArray(value) ? value : [value])
                  }
                  // All text will be localized automatically by the component
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Selected:{" "}
                {multiSelectDemo.length > 0
                  ? multiSelectDemo.join(", ")
                  : "None"}
              </p>
            </div>

            {/* Style Variations Grid */}
            <div className="space-y-3">
              <h4 className="font-medium">
                {t("components.multiSelect.availableStyles")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    style: "default",
                    label: t("settings.selectStyle.options.default"),
                    options: [
                      {
                        value: "html",
                        label: t(
                          "components.multiSelect.categories.webTech.html"
                        ),
                      },
                      {
                        value: "css",
                        label: t(
                          "components.multiSelect.categories.webTech.css"
                        ),
                      },
                      {
                        value: "javascript",
                        label: t(
                          "components.multiSelect.categories.webTech.javascript"
                        ),
                      },
                    ],
                  },
                  {
                    style: "modern",
                    label: t("settings.selectStyle.options.modern"),
                    options: [
                      {
                        value: "react",
                        label: t(
                          "components.multiSelect.categories.webTech.react"
                        ),
                      },
                      {
                        value: "vue",
                        label: t(
                          "components.multiSelect.categories.webTech.vue"
                        ),
                      },
                      {
                        value: "angular",
                        label: t(
                          "components.multiSelect.categories.webTech.angular"
                        ),
                      },
                    ],
                  },
                  {
                    style: "glass",
                    label: t("settings.selectStyle.options.glass"),
                    options: [
                      {
                        value: "figma",
                        label: t(
                          "components.multiSelect.categories.design.figma"
                        ),
                      },
                      {
                        value: "sketch",
                        label: t(
                          "components.multiSelect.categories.design.sketch"
                        ),
                      },
                      {
                        value: "adobe",
                        label: t(
                          "components.multiSelect.categories.design.adobe"
                        ),
                      },
                    ],
                  },
                  {
                    style: "outlined",
                    label: t("settings.selectStyle.options.outlined"),
                    options: [
                      {
                        value: "nodejs",
                        label: t(
                          "components.multiSelect.categories.backend.nodejs"
                        ),
                      },
                      {
                        value: "python",
                        label: t(
                          "components.multiSelect.categories.backend.python"
                        ),
                      },
                      {
                        value: "java",
                        label: t(
                          "components.multiSelect.categories.backend.java"
                        ),
                      },
                    ],
                  },
                  {
                    style: "filled",
                    label: t("settings.selectStyle.options.filled"),
                    options: [
                      {
                        value: "mysql",
                        label: t(
                          "components.multiSelect.categories.database.mysql"
                        ),
                      },
                      {
                        value: "postgres",
                        label: t(
                          "components.multiSelect.categories.database.postgres"
                        ),
                      },
                      {
                        value: "mongodb",
                        label: t(
                          "components.multiSelect.categories.database.mongodb"
                        ),
                      },
                    ],
                  },
                  {
                    style: "minimal",
                    label: t("settings.selectStyle.options.minimal"),
                    options: [
                      {
                        value: "git",
                        label: t(
                          "components.multiSelect.categories.devops.git"
                        ),
                      },
                      {
                        value: "github",
                        label: t(
                          "components.multiSelect.categories.devops.github"
                        ),
                      },
                      {
                        value: "gitlab",
                        label: t(
                          "components.multiSelect.categories.devops.gitlab"
                        ),
                      },
                    ],
                  },
                  {
                    style: "elegant",
                    label: t("settings.selectStyle.options.elegant"),
                    options: [
                      {
                        value: "aws",
                        label: t("components.multiSelect.categories.cloud.aws"),
                      },
                      {
                        value: "azure",
                        label: t(
                          "components.multiSelect.categories.cloud.azure"
                        ),
                      },
                      {
                        value: "gcp",
                        label: t("components.multiSelect.categories.cloud.gcp"),
                      },
                    ],
                  },
                  {
                    style: "professional",
                    label: t("settings.selectStyle.options.professional"),
                    options: [
                      {
                        value: "docker",
                        label: t(
                          "components.multiSelect.categories.devops.docker"
                        ),
                      },
                      {
                        value: "kubernetes",
                        label: t(
                          "components.multiSelect.categories.devops.kubernetes"
                        ),
                      },
                      {
                        value: "jenkins",
                        label: t(
                          "components.multiSelect.categories.devops.jenkins"
                        ),
                      },
                    ],
                  },
                  {
                    style: "neon",
                    label: t("settings.selectStyle.options.neon"),
                    options: [
                      {
                        value: "cybersecurity",
                        label: t(
                          "components.multiSelect.categories.security.cybersecurity"
                        ),
                      },
                      {
                        value: "ethicalHacking",
                        label: t(
                          "components.multiSelect.categories.security.ethicalHacking"
                        ),
                      },
                      {
                        value: "penetrationTesting",
                        label: t(
                          "components.multiSelect.categories.security.penetrationTesting"
                        ),
                      },
                    ],
                  },
                  {
                    style: "gradient",
                    label: t("settings.selectStyle.options.gradient"),
                    options: [
                      {
                        value: "uiDesign",
                        label: t(
                          "components.multiSelect.categories.ux.uiDesign"
                        ),
                      },
                      {
                        value: "uxResearch",
                        label: t(
                          "components.multiSelect.categories.ux.uxResearch"
                        ),
                      },
                      {
                        value: "userTesting",
                        label: t(
                          "components.multiSelect.categories.ux.userTesting"
                        ),
                      },
                    ],
                  },
                  {
                    style: "neumorphism",
                    label: t("settings.selectStyle.options.neumorphism"),
                    options: [
                      {
                        value: "ios",
                        label: t(
                          "components.multiSelect.categories.mobile.ios"
                        ),
                      },
                      {
                        value: "android",
                        label: t(
                          "components.multiSelect.categories.mobile.android"
                        ),
                      },
                      {
                        value: "reactNative",
                        label: t(
                          "components.multiSelect.categories.mobile.reactNative"
                        ),
                      },
                    ],
                  },
                  {
                    style: "cyberpunk",
                    label: t("settings.selectStyle.options.cyberpunk"),
                    options: [
                      {
                        value: "blockchain",
                        label: t(
                          "components.multiSelect.categories.security.blockchain"
                        ),
                      },
                      {
                        value: "crypto",
                        label: t(
                          "components.multiSelect.categories.security.crypto"
                        ),
                      },
                      {
                        value: "machineLearning",
                        label: t(
                          "components.multiSelect.categories.ai.machineLearning"
                        ),
                      },
                    ],
                  },
                  {
                    style: "luxury",
                    label: t("settings.selectStyle.options.luxury"),
                    options: [
                      {
                        value: "premium",
                        label: t(
                          "components.multiSelect.categories.business.premium"
                        ),
                      },
                      {
                        value: "enterprise",
                        label: t(
                          "components.multiSelect.categories.business.enterprise"
                        ),
                      },
                      {
                        value: "consulting",
                        label: t(
                          "components.multiSelect.categories.business.consulting"
                        ),
                      },
                    ],
                  },
                  {
                    style: "quantum",
                    label: t("settings.selectStyle.options.quantum"),
                    options: [
                      {
                        value: "quantumComputing",
                        label: t(
                          "components.multiSelect.categories.ai.quantumComputing"
                        ),
                      },
                      {
                        value: "neuralNetworks",
                        label: t(
                          "components.multiSelect.categories.ai.neuralNetworks"
                        ),
                      },
                      {
                        value: "deepLearning",
                        label: t(
                          "components.multiSelect.categories.ai.deepLearning"
                        ),
                      },
                    ],
                  },
                  {
                    style: "nebula",
                    label: t("settings.selectStyle.options.nebula"),
                    options: [
                      {
                        value: "spaceExploration",
                        label: t(
                          "components.multiSelect.categories.science.spaceExploration"
                        ),
                      },
                      {
                        value: "astronomy",
                        label: t(
                          "components.multiSelect.categories.science.astronomy"
                        ),
                      },
                      {
                        value: "astrophysics",
                        label: t(
                          "components.multiSelect.categories.science.astrophysics"
                        ),
                      },
                    ],
                  },
                  {
                    style: "prism",
                    label: t("settings.selectStyle.options.prism"),
                    options: [
                      {
                        value: "optics",
                        label: t(
                          "components.multiSelect.categories.science.optics"
                        ),
                      },
                      {
                        value: "photography",
                        label: t(
                          "components.multiSelect.categories.creative.photography"
                        ),
                      },
                      {
                        value: "visualEffects",
                        label: t(
                          "components.multiSelect.categories.creative.visualEffects"
                        ),
                      },
                    ],
                  },
                  {
                    style: "stellar",
                    label: t("settings.selectStyle.options.stellar"),
                    options: [
                      {
                        value: "solarEnergy",
                        label: t(
                          "components.multiSelect.categories.energy.solarEnergy"
                        ),
                      },
                      {
                        value: "renewableEnergy",
                        label: t(
                          "components.multiSelect.categories.energy.renewableEnergy"
                        ),
                      },
                      {
                        value: "sustainability",
                        label: t(
                          "components.multiSelect.categories.energy.sustainability"
                        ),
                      },
                    ],
                  },
                  {
                    style: "vortex",
                    label: t("settings.selectStyle.options.vortex"),
                    options: [
                      {
                        value: "fluidDynamics",
                        label: t(
                          "components.multiSelect.categories.physics.fluidDynamics"
                        ),
                      },
                      {
                        value: "aerodynamics",
                        label: t(
                          "components.multiSelect.categories.physics.aerodynamics"
                        ),
                      },
                      {
                        value: "turbulence",
                        label: t(
                          "components.multiSelect.categories.physics.turbulence"
                        ),
                      },
                    ],
                  },
                  {
                    style: "phoenix",
                    label: t("settings.selectStyle.options.phoenix"),
                    options: [
                      {
                        value: "gameDesign",
                        label: t(
                          "components.multiSelect.categories.gaming.gameDesign"
                        ),
                      },
                      {
                        value: "animation",
                        label: t(
                          "components.multiSelect.categories.creative.animation"
                        ),
                      },
                      {
                        value: "digitalArt",
                        label: t(
                          "components.multiSelect.categories.creative.digitalArt"
                        ),
                      },
                    ],
                  },
                ].map(({ style, label, options }) => (
                  <div key={style} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">{label}</h5>
                      <button
                        onClick={() => settings.setSelectStyle(style as any)}
                        className={cn(
                          "px-2 py-1 text-xs rounded transition-colors",
                          settings.selectStyle === style
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted-foreground/20"
                        )}
                      >
                        {settings.selectStyle === style
                          ? t("components.multiSelect.buttons.active")
                          : t("components.multiSelect.buttons.apply")}
                      </button>
                    </div>
                    {/* Unified Select Preview - All Three Types */}
                    <div className="space-y-3">
                      {/* Single Select */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("components.unifiedSelect.types.single")}
                        </label>
                        <GenericSelect
                          type="single"
                          design={style as any}
                          options={options.slice(0, 3)}
                          value={
                            styleSelections[`${style}-single`] ||
                            options[0]?.value ||
                            ""
                          }
                          onValueChange={(newValue: string | string[]) =>
                            setStyleSelections((prev) => ({
                              ...prev,
                              [`${style}-single`]:
                                typeof newValue === "string"
                                  ? newValue
                                  : newValue[0],
                            }))
                          }
                          placeholder={`${style} Single Select`}
                        />
                      </div>

                      {/* Searchable Select */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("components.unifiedSelect.types.searchable")}
                        </label>
                        <GenericSelect
                          type="searchable"
                          design={style as any}
                          options={options}
                          value={styleSelections[`${style}-search`] || ""}
                          onValueChange={(newValue: string | string[]) =>
                            setStyleSelections((prev) => ({
                              ...prev,
                              [`${style}-search`]:
                                typeof newValue === "string"
                                  ? newValue
                                  : newValue[0],
                            }))
                          }
                          placeholder={`Search ${style} options...`}
                          searchPlaceholder="Type to search..."
                        />
                      </div>

                      {/* Multi Select */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("components.unifiedSelect.types.multi")}
                        </label>
                        <GenericSelect
                          type="multi"
                          design={style as any}
                          options={options}
                          value={
                            styleSelections[`${style}-multi`] ||
                            [options[0]?.value].filter(Boolean)
                          }
                          onValueChange={(newValue: string | string[]) =>
                            setStyleSelections((prev) => ({
                              ...prev,
                              [`${style}-multi`]: Array.isArray(newValue)
                                ? newValue
                                : [newValue],
                            }))
                          }
                          placeholder={`Multi-select ${style} items...`}
                          searchPlaceholder="Search and select multiple..."
                          maxSelectedDisplay={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Server-Side Search Demo */}
            <div className="space-y-3">
              <h4 className="font-medium">
                {t("components.multiSelect.serverSearchDemo")}
              </h4>
              <div className="max-w-md">
                <GenericSelect
                  type="multi"
                  searchType="server"
                  options={[]}
                  value={[]}
                  onValueChange={(value: string | string[]) => {}}
                  onServerSearch={async (query: string) => {
                    // Simulate server search
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    const mockResults = [
                      {
                        value: `${query}-1`,
                        label: `${query} ${t(
                          "components.multiSelect.serverSearchResult"
                        )} 1`,
                      },
                      {
                        value: `${query}-2`,
                        label: `${query} ${t(
                          "components.multiSelect.serverSearchResult"
                        )} 2`,
                      },
                      {
                        value: `${query}-3`,
                        label: `${query} ${t(
                          "components.multiSelect.serverSearchResult"
                        )} 3`,
                      },
                      {
                        value: `${query}-api`,
                        label: `${query} ${t(
                          "components.multiSelect.serverSearchApi"
                        )}`,
                      },
                      {
                        value: `${query}-sdk`,
                        label: `${query} ${t(
                          "components.multiSelect.serverSearchSdk"
                        )}`,
                      },
                    ];
                    return mockResults.slice(
                      0,
                      Math.floor(Math.random() * 5) + 1
                    );
                  }}
                  placeholder={t(
                    "components.multiSelect.serverSearchPlaceholder"
                  )}
                  searchPlaceholder={t(
                    "components.multiSelect.serverSearchSearchPlaceholder"
                  )}
                  searchingText={t(
                    "components.multiSelect.serverSearchSearchingText"
                  )}
                  noResultsText={t(
                    "components.multiSelect.serverSearchNoResultsText"
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("components.multiSelect.serverSearchDescription")}
              </p>
            </div>

            {/* Tree Select Demo */}
            <div className="space-y-3">
              <h4 className="font-medium">
                {t("components.treeSelect.title")}
              </h4>
              <div className="max-w-md">
                <GenericSelect
                  type="tree"
                  treeData={[
                    {
                      value: "warehouse-1",
                      label: "Main Warehouse",
                      children: [
                        {
                          value: "section-a",
                          label: "Section A",
                          children: [
                            { value: "shelf-1", label: "Shelf 1" },
                            { value: "shelf-2", label: "Shelf 2" },
                          ],
                        },
                        {
                          value: "section-b",
                          label: "Section B",
                          children: [
                            { value: "shelf-3", label: "Shelf 3" },
                            { value: "shelf-4", label: "Shelf 4" },
                          ],
                        },
                      ],
                    },
                    {
                      value: "warehouse-2",
                      label: "Secondary Warehouse",
                      children: [
                        { value: "area-1", label: "Storage Area 1" },
                        { value: "area-2", label: "Storage Area 2" },
                      ],
                    },
                  ]}
                  placeholder={t("components.treeSelect.placeholder")}
                  searchPlaceholder={t(
                    "components.treeSelect.searchPlaceholder"
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("components.treeSelect.description")}
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>{t("components.multiSelect.features")}:</strong>{" "}
                {t("components.multiSelect.featuresDescription")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Style Testing */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.modalStyle.title")}</CardTitle>
          <CardDescription>
            {t("settings.modalStyle.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {modalStyles.map((style) => (
              <div key={style.value} className="space-y-2">
                <Button
                  variant={
                    settings.modalStyle === style.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setModalStyle(style.value as any)}
                  className="w-full"
                >
                  {style.name}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTestModalOpen(style.value)}
                  className="w-full text-xs"
                >
                  {t("settings.modalStyle.testButton", { style: style.name })}
                </Button>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("settings.modalStyle.testInstructions")}
          </div>
        </CardContent>
      </Card>

      {/* Test Modal for Preview */}
      <GenericModal
        open={testModalOpen !== null}
        onOpenChange={(open) => !open && setTestModalOpen(null)}
        title={t("settings.modalStyle.previewTitle", {
          style: previewStyleName || "",
        })}
      >
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {t("settings.modalStyle.previewDescription", {
              style: previewStyleName || "",
            })}
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">
                {t("settings.modalStyle.sampleContentTitle")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("settings.modalStyle.sampleContentDescription", {
                  style: previewStyleName || "",
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setTestModalOpen(null)}>
                {t("settings.modalStyle.closePreview")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (testModalOpen) {
                    setModalStyle(testModalOpen as any);
                    setTestModalOpen(null);
                  }
                }}
              >
                {t("settings.modalStyle.applyStyle")}
              </Button>
            </div>
          </div>
        </div>
      </GenericModal>
    </>
  );
}
