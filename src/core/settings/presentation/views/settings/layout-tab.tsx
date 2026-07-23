"use client";

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
import { NavigationLayoutsTab, NAVIGATION_LAYOUT_VALUES } from "./layout-tab/navigation-layouts";
import { WorkspaceLayoutsTab, WORKSPACE_LAYOUT_VALUES } from "./layout-tab/workspace-layouts";
import { AdvancedLayoutsTab, ADVANCED_LAYOUT_VALUES } from "./layout-tab/advanced-layouts";
import { IndustryLayoutsTab, INDUSTRY_LAYOUT_VALUES } from "./layout-tab/industry-layouts";
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
  { key: "navigation", values: NAVIGATION_LAYOUT_VALUES },
  { key: "workspace", values: WORKSPACE_LAYOUT_VALUES },
  { key: "advanced", values: ADVANCED_LAYOUT_VALUES },
  { key: "industry", values: INDUSTRY_LAYOUT_VALUES },
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
    { key: "navigation", label: t("settings.layoutTemplate.categories.navigation") },
    { key: "workspace", label: t("settings.layoutTemplate.categories.workspace") },
    { key: "advanced", label: t("settings.layoutTemplate.categories.advanced") },
    { key: "industry", label: t("settings.layoutTemplate.categories.industry") },
    // Wave C: header/sidebar style pickers were culled; card style is the
    // surviving content of this sub-tab, so it lends the label.
    { key: "styles", label: t("settings.cardStyle.title") || "Styles" },
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
            <TabsList className="flex h-auto flex-wrap gap-1 rounded-xl bg-muted/50 p-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="relative rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
                >
                  {tab.label}
                  {activeCategory === tab.key && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 border-primary/20 bg-primary/10 px-1 py-0 text-[10px] text-primary"
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
            <TabsContent value="navigation">
              <NavigationLayoutsTab />
            </TabsContent>
            <TabsContent value="workspace">
              <WorkspaceLayoutsTab />
            </TabsContent>
            <TabsContent value="advanced">
              <AdvancedLayoutsTab />
            </TabsContent>
            <TabsContent value="industry">
              <IndustryLayoutsTab />
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
