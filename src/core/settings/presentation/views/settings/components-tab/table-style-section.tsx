"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check } from "lucide-react";
import { cn } from "@core/common/utils";

// Table preview component with all style variants
function TablePreview({ style, t }: { style: string; t: (key: string) => string }) {
  const sampleData = [
    { id: "1", name: t("settings.sampleTable.data.john"), role: "admin", status: "active" },
    { id: "2", name: t("settings.sampleTable.data.jane"), role: "user", status: "pending" },
    { id: "3", name: t("settings.sampleTable.data.bob"), role: "editor", status: "inactive" },
  ];

  const getTableClasses = () => {
    const b = "overflow-hidden transition-all duration-300 w-full";
    const map: Record<string, string> = {
      striped: cn(b, "rounded-lg border bg-card"),
      bordered: cn(b, "rounded-lg border-2 border-border bg-card"),
      minimal: cn(b, "rounded-none border-0 bg-transparent"),
      glass: cn(
        b,
        "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl dark:bg-black/20 dark:border-white/10"
      ),
      neon: cn(
        b,
        "rounded-xl border-2 border-primary/30 bg-background shadow-[0_0_30px_hsl(var(--primary)/0.3)] dark:bg-black/95"
      ),
      gradient: cn(
        b,
        "rounded-2xl border-0 bg-gradient-to-br from-primary/20 via-background to-primary/10 shadow-2xl"
      ),
      neumorphism: cn(
        b,
        "rounded-3xl border-0 bg-background shadow-[20px_20px_40px_rgba(0,0,0,0.1),-20px_-20px_40px_rgba(255,255,255,0.1)] dark:shadow-[20px_20px_40px_rgba(0,0,0,0.3),-20px_-20px_40px_rgba(255,255,255,0.05)]"
      ),
      cyberpunk: cn(
        b,
        "rounded-none border-2 border-primary bg-background shadow-[0_0_50px_hsl(var(--primary)/0.4)] dark:bg-black/95"
      ),
      luxury: cn(
        b,
        "rounded-2xl border border-amber-200/30 bg-gradient-to-br from-amber-50/50 to-amber-100/30 shadow-2xl dark:from-amber-900/20 dark:to-amber-800/10 dark:border-amber-400/20"
      ),
      matrix: cn(
        b,
        "rounded-none border-2 border-primary/30 bg-background shadow-[0_0_30px_hsl(var(--primary)/0.4)] dark:bg-black/95"
      ),
      diamond: cn(
        b,
        "rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/15 shadow-[0_0_40px_hsl(var(--primary)/0.3)] backdrop-blur-xl"
      ),
    };
    return map[style] ?? cn(b, "rounded-lg border bg-card shadow-sm");
  };

  const getHeaderClasses = () => {
    const map: Record<string, string> = {
      striped: "bg-muted/50 border-b-2 border-border",
      bordered: "bg-muted/40 border-b-2 border-border",
      minimal: "bg-transparent border-b border-border/50",
      glass: "bg-white/10 border-b border-white/20 backdrop-blur-sm",
      neon: "bg-primary/10 border-b border-primary/30",
      gradient: "bg-gradient-to-r from-primary/10 to-primary/15 border-b border-primary/20",
      neumorphism: "bg-background/80 border-b border-border/40",
      cyberpunk: "bg-primary/10 border-b border-primary/40",
      luxury: "bg-amber-100/40 border-b border-amber-200/30 dark:bg-amber-900/20",
      matrix: "bg-primary/10 border-b border-primary/30",
      diamond: "bg-primary/10 border-b border-primary/30",
    };
    return map[style] ?? "bg-muted/40 border-b border-border";
  };

  const getRowClasses = (index: number) => {
    const map: Record<string, string> = {
      striped: index % 2 === 0 ? "bg-muted/20 hover:bg-muted/30" : "bg-card hover:bg-muted/20",
      bordered: "border-b bg-card hover:bg-muted/20",
      minimal: "border-b border-border/30 bg-transparent hover:bg-muted/10",
      glass: "bg-white/5 border-b border-white/10 backdrop-blur-sm hover:bg-white/10",
      neon: "bg-primary/5 border-b border-primary/20 hover:bg-primary/10",
      gradient:
        "bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 hover:from-primary/10 hover:to-primary/15",
      neumorphism: "bg-background/30 border-b border-border/20 hover:bg-background/50",
      cyberpunk: "bg-primary/5 border-b border-primary/30 hover:bg-primary/10",
      luxury:
        "bg-amber-50/20 border-b border-amber-200/20 dark:bg-amber-900/10 hover:bg-amber-50/30",
      matrix: "bg-primary/5 border-b border-primary/20 hover:bg-primary/10",
      diamond: "bg-primary/5 border-b border-primary/20 hover:bg-primary/10",
    };
    return map[style] ?? "bg-card border-b hover:bg-muted/20";
  };

  return (
    <div className={getTableClasses()}>
      <table className="w-full text-xs">
        <thead>
          <tr className={cn("font-medium text-muted-foreground", getHeaderClasses())}>
            <th className="px-2 py-1.5 text-left font-semibold">
              {t("settings.sampleTable.name")}
            </th>
            <th className="px-2 py-1.5 text-left font-semibold">
              {t("settings.sampleTable.role")}
            </th>
            <th className="px-2 py-1.5 text-left font-semibold">
              {t("settings.sampleTable.status")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sampleData.map((row, index) => (
            <tr key={row.id} className={getRowClasses(index)}>
              <td className="px-2 py-1.5 font-medium">{row.name}</td>
              <td className="px-2 py-1.5 text-muted-foreground">
                {t(`settings.sampleTable.roles.${row.role}`)}
              </td>
              <td className="px-2 py-1.5">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium",
                    row.status === "active" && "bg-success/15 text-success",
                    row.status === "pending" && "bg-warning/15 text-warning",
                    row.status === "inactive" && "bg-destructive/15 text-destructive"
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
}

export function TableStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const tableStyles = [
    {
      value: "default",
      name: t("settings.tableStyle.options.default.title"),
      description: t("settings.tableStyle.options.default.description"),
    },
    {
      value: "striped",
      name: t("settings.tableStyle.options.striped.title"),
      description: t("settings.tableStyle.options.striped.description"),
    },
    {
      value: "bordered",
      name: t("settings.tableStyle.options.bordered.title"),
      description: t("settings.tableStyle.options.bordered.description"),
    },
    {
      value: "minimal",
      name: t("settings.tableStyle.options.minimal.title"),
      description: t("settings.tableStyle.options.minimal.description"),
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
      description: t("settings.tableStyle.options.gradient.description"),
    },
    {
      value: "neumorphism",
      name: t("settings.tableStyle.options.neumorphism.title"),
      description: t("settings.tableStyle.options.neumorphism.description"),
    },
    {
      value: "cyberpunk",
      name: t("settings.tableStyle.options.cyberpunk.title"),
      description: t("settings.tableStyle.options.cyberpunk.description"),
    },
    {
      value: "luxury",
      name: t("settings.tableStyle.options.luxury.title"),
      description: t("settings.tableStyle.options.luxury.description"),
    },
    {
      value: "matrix",
      name: t("settings.tableStyle.options.matrix.title"),
      description: t("settings.tableStyle.options.matrix.description"),
    },
    {
      value: "diamond",
      name: t("settings.tableStyle.options.diamond.title"),
      description: t("settings.tableStyle.options.diamond.description"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <div className="grid h-4 w-4 grid-cols-3 gap-0.5">
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-[1px]",
                    i < 3 ? "bg-primary/60" : i < 6 ? "bg-primary/40" : "bg-primary/30"
                  )}
                />
              ))}
            </div>
          </div>
          {t("settings.tableStyle.title")}
        </CardTitle>
        <CardDescription>{t("settings.tableStyle.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tableStyles.map((style) => (
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
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </div>
                <div className="w-full origin-center scale-90">
                  <TablePreview style={style.value} t={t} />
                </div>
              </div>
              {settings.tableStyle === style.value && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
