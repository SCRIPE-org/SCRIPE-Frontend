"use client";

import type React from "react";
import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { TooltipProvider } from "@core/ui/tooltip";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useSettings } from "@core/providers/settings-provider";
import { useToast } from "@core/hooks/use-toast";
import { Download, Upload, Save, RotateCcw, Lock, ShieldAlert } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
const CheckboxRadioTab = dynamic(
  () => import("./settings/checkbox-radio-tab").then((mod) => ({ default: mod.CheckboxRadioTab })),
  {
    loading: () => <LoadingSpinner size="sm" />,
  }
);

// Dynamic imports for heavy components
const AppearanceTab = dynamic(
  () => import("./settings").then((mod) => ({ default: mod.AppearanceTab })),
  {
    loading: () => <LoadingSpinner size="sm" />,
  }
);
const LayoutTab = dynamic(() => import("./settings").then((mod) => ({ default: mod.LayoutTab })), {
  loading: () => <LoadingSpinner size="sm" />,
});
const ComponentsTab = dynamic(
  () => import("./settings").then((mod) => ({ default: mod.ComponentsTab })),
  {
    loading: () => <LoadingSpinner size="sm" />,
  }
);
const TypographyTab = dynamic(
  () => import("./settings").then((mod) => ({ default: mod.TypographyTab })),
  {
    loading: () => <LoadingSpinner size="sm" />,
  }
);
const BehaviorTab = dynamic(
  () => import("./settings").then((mod) => ({ default: mod.BehaviorTab })),
  {
    loading: () => <LoadingSpinner size="sm" />,
  }
);
const PreviewPanel = dynamic(
  () => import("./settings").then((mod) => ({ default: mod.PreviewPanel })),
  {
    loading: () => <LoadingSpinner size="sm" />,
  }
);
const ProfessionalChartsTab = dynamic(
  () => import("./settings/charts-tab").then((mod) => ({ default: mod.ProfessionalChartsTab })),
  {
    loading: () => <LoadingSpinner size="sm" />,
  }
);

export function SettingsView() {
  useModuleLocales(() => import("@/modules/identity/customization-settings/locales"), "customization-settings");
  const { t } = useI18n();
  const settings = useSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("appearance");

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

  return (
    <TooltipProvider>
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("settings.pageTitle")}</h1>
            <p className="text-muted-foreground">{t("settings.pageSubtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSettings}>
              <Download className="mx-2 h-4 w-4" />
              {t("common.export")}
            </Button>
            <Button variant="outline" asChild>
              <label htmlFor="import-settings" className="cursor-pointer">
                <Upload className="mx-2 h-4 w-4" />
                {t("common.import")}
              </label>
            </Button>
            <input
              id="import-settings"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportSettings}
            />
            <Button variant="secondary" onClick={handleSaveSettings} disabled={settings.autoSave}>
              <Save className="mx-2 h-4 w-4" />
              {t("common.save")}
            </Button>
            <Button variant="destructive" onClick={handleResetSettings}>
              <RotateCcw className="mx-2 h-4 w-4" />
              {t("settings.resetAll")}
            </Button>
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
            <Alert className="border-amber-300/40 bg-amber-50/50 dark:border-amber-600/30 dark:bg-amber-950/20">
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-700 dark:text-amber-300">
                {t("customizer.dashboard.overridePaths")}
              </AlertTitle>
              <AlertDescription className="text-sm text-amber-600/80 dark:text-amber-400/80">
                {t("customizer.dashboard.overridePathsDesc")}
              </AlertDescription>
            </Alert>
          )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="appearance">{t("settings.tabs.appearance")}</TabsTrigger>
                <TabsTrigger value="layout">{t("settings.tabs.layout")}</TabsTrigger>
                <TabsTrigger value="components">{t("settings.tabs.components")}</TabsTrigger>
                <TabsTrigger value="charts">{t("settings.tabs.charts")}</TabsTrigger>
                <TabsTrigger value="checkboxRadio">{t("settings.tabs.checkboxRadio")}</TabsTrigger>
                <TabsTrigger value="typography">{t("settings.tabs.typography")}</TabsTrigger>
                <TabsTrigger value="behavior">{t("settings.tabs.behavior")}</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance">
                <Suspense fallback={<LoadingSpinner size="sm" />}>
                  <AppearanceTab />
                </Suspense>
              </TabsContent>
              <TabsContent value="layout">
                <Suspense fallback={<LoadingSpinner size="sm" />}>
                  <LayoutTab />
                </Suspense>
              </TabsContent>
              <TabsContent value="components">
                <Suspense fallback={<LoadingSpinner size="sm" />}>
                  <ComponentsTab />
                </Suspense>
              </TabsContent>
              <TabsContent value="charts">
                <Suspense fallback={<LoadingSpinner size="sm" />}>
                  <ProfessionalChartsTab />
                </Suspense>
              </TabsContent>
              <TabsContent value="checkboxRadio">
                <Suspense fallback={<LoadingSpinner size="sm" />}>
                  <CheckboxRadioTab />
                </Suspense>
              </TabsContent>
              <TabsContent value="typography">
                <Suspense fallback={<LoadingSpinner size="sm" />}>
                  <TypographyTab />
                </Suspense>
              </TabsContent>
              <TabsContent value="behavior">
                <Suspense fallback={<LoadingSpinner size="sm" />}>
                  <BehaviorTab />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>

          <Suspense fallback={<LoadingSpinner size="sm" />}>
            <PreviewPanel />
          </Suspense>
        </div>
      </div>
    </TooltipProvider>
  );
}
