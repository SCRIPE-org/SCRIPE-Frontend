"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Badge } from "@core/ui/badge";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";

import { SidebarLayoutsTab, SIDEBAR_LAYOUT_VALUES } from "./layout-tab/sidebar-layouts";
import { AlternativeLayoutsTab, ALTERNATIVE_LAYOUT_VALUES } from "./layout-tab/alternative-layouts";
import { StructuralLayoutsTab, STRUCTURAL_LAYOUT_VALUES } from "./layout-tab/structural-layouts";
import { VisualLayoutsTab, VISUAL_LAYOUT_VALUES } from "./layout-tab/visual-layouts";
import { SpecializedLayoutsTab, SPECIALIZED_LAYOUT_VALUES } from "./layout-tab/specialized-layouts";
import { StylesTab } from "./layout-tab/styles-tab";

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
const categoryMap = [
  { key: "sidebar", values: SIDEBAR_LAYOUT_VALUES },
  { key: "alternative", values: ALTERNATIVE_LAYOUT_VALUES },
  { key: "structural", values: STRUCTURAL_LAYOUT_VALUES },
  { key: "visual", values: VISUAL_LAYOUT_VALUES },
  { key: "specialized", values: SPECIALIZED_LAYOUT_VALUES },
] as const;

function getActiveCategory(layout: string): string | null {
  for (const cat of categoryMap) {
    if (cat.values.includes(layout)) return cat.key;
  }
  return null;
}

// ────────────────────────────────────────────
// Main Export
// ────────────────────────────────────────────
export function LayoutTab() {
  const { t } = useI18n();
  const settings = useSettings();
  const activeCategory = getActiveCategory(settings.layoutTemplate);

  // Sub-tab definitions
  const tabs = [
    { key: "sidebar", label: t("settings.layoutTemplate.categories.sidebar") },
    { key: "alternative", label: t("settings.layoutTemplate.categories.alternative") },
    { key: "structural", label: t("settings.layoutTemplate.categories.structural") },
    { key: "visual", label: t("settings.layoutTemplate.categories.visual") },
    { key: "specialized", label: t("settings.layoutTemplate.categories.specialized") },
    { key: "styles", label: t("settings.headerStyle.title") || "Styles" },
  ];

  return (
    <>
      {/* ── Layout Templates ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.layoutTemplate.title")}</CardTitle>
          <CardDescription>{t("settings.layoutTemplate.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeCategory || "sidebar"} className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="relative rounded-lg text-xs sm:text-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {tab.label}
                  {activeCategory === tab.key && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 text-[10px] px-1 py-0 bg-primary/10 text-primary border-primary/20"
                    >
                      {t("common.active")}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="sidebar">
              <SidebarLayoutsTab />
            </TabsContent>
            <TabsContent value="alternative">
              <AlternativeLayoutsTab />
            </TabsContent>
            <TabsContent value="structural">
              <StructuralLayoutsTab />
            </TabsContent>
            <TabsContent value="visual">
              <VisualLayoutsTab />
            </TabsContent>
            <TabsContent value="specialized">
              <SpecializedLayoutsTab />
            </TabsContent>
            <TabsContent value="styles">
              <StylesTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
