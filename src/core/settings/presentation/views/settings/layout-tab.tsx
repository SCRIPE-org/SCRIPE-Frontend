"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

export function LayoutTab() {
  const { t } = useI18n();
  const settings = useSettings();

  const layoutTemplates = [
    {
      value: "modern",
      name: t("settings.layoutTemplate.options.modern.name"),
      description: t("settings.layoutTemplate.options.modern.description"),
      preview: (
        <div className="w-full h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded flex">
          <div className="w-12 bg-gray-300 rounded-l"></div>
          <div className="flex-1 p-2">
            <div className="h-2 bg-gray-400 rounded mb-1"></div>
            <div className="h-2 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ),
    },
    {
      value: "classic",
      name: t("settings.layoutTemplate.options.classic.name"),
      description: t("settings.layoutTemplate.options.classic.description"),
      preview: (
        <div className="w-full h-16 bg-white border rounded flex">
          <div className="w-12 bg-gray-100 border-r"></div>
          <div className="flex-1 p-2">
            <div className="h-2 bg-gray-600 rounded mb-1"></div>
            <div className="h-2 bg-gray-400 rounded w-2/3"></div>
          </div>
        </div>
      ),
    },
    {
      value: "compact",
      name: t("settings.layoutTemplate.options.compact.name"),
      description: t("settings.layoutTemplate.options.compact.description"),
      preview: (
        <div className="w-full h-16 bg-gray-50 rounded flex">
          <div className="w-8 bg-gray-200"></div>
          <div className="flex-1 p-1">
            <div className="h-1.5 bg-gray-500 rounded mb-1"></div>
            <div className="h-1.5 bg-gray-400 rounded w-3/4 mb-1"></div>
            <div className="h-1.5 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ),
    },
    {
      value: "elegant",
      name: t("settings.layoutTemplate.options.elegant.name"),
      description: t("settings.layoutTemplate.options.elegant.description"),
      preview: (
        <div className="w-full h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded shadow-sm flex">
          <div className="w-12 bg-gradient-to-b from-gray-200 to-gray-300 rounded-l"></div>
          <div className="flex-1 p-2">
            <div className="h-2 bg-gradient-to-r from-gray-500 to-gray-400 rounded mb-1"></div>
            <div className="h-2 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ),
    },
    {
      value: "minimal",
      name: t("settings.layoutTemplate.options.minimal.name"),
      description: t("settings.layoutTemplate.options.minimal.description"),
      preview: (
        <div className="w-full h-16 bg-white rounded border-l-2 border-gray-300 flex">
          <div className="w-10 bg-gray-50"></div>
          <div className="flex-1 p-2">
            <div className="h-2 bg-gray-800 rounded mb-2"></div>
            <div className="h-1 bg-gray-400 rounded w-1/2"></div>
          </div>
        </div>
      ),
    },
    {
      value: "floating",
      name: t("settings.layoutTemplate.options.floating.name"),
      description: t("settings.layoutTemplate.options.floating.description"),
      preview: (
        <div className="w-full h-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded relative">
          <div className="absolute top-1 left-1 w-8 h-6 bg-white rounded shadow"></div>
          <div className="absolute top-2 right-2 w-16 h-4 bg-white rounded shadow"></div>
          <div className="absolute bottom-1 left-2 w-12 h-4 bg-white rounded shadow"></div>
        </div>
      ),
    },
    {
      value: "navigation",
      name: t("settings.layoutTemplate.options.navigation.name"),
      description: t("settings.layoutTemplate.options.navigation.description"),
      preview: (
        <div className="w-full h-16 bg-gray-100 rounded flex">
          <div className="w-6 bg-gray-300"></div>
          <div className="w-8 bg-gray-200"></div>
          <div className="flex-1 p-2">
            <div className="h-2 bg-gray-500 rounded mb-1"></div>
            <div className="h-2 bg-gray-400 rounded w-2/3"></div>
          </div>
        </div>
      ),
    },
  ];
  const cardStyles = [
    { value: "default", name: t("cardStyle.default"), class: "border bg-card" },
    {
      value: "glass",
      name: t("cardStyle.glass"),
      class: "bg-white/10 backdrop-blur border border-white/20",
    },
    { value: "solid", name: t("cardStyle.solid"), class: "bg-gray-100 border-0" },
    { value: "bordered", name: t("cardStyle.bordered"), class: "border-2 bg-card" },
    {
      value: "elevated",
      name: t("settings.cardStyleOptions.elevated"),
      class: "shadow-lg bg-card border-0",
    },
  ];
  const headerStyles = [
    {
      value: "default",
      name: t("settings.headerStyle.options.default.name"),
      description: t("settings.headerStyle.options.default.description"),
    },
    {
      value: "compact",
      name: t("settings.headerStyle.options.compact.name"),
      description: t("settings.headerStyle.options.compact.description"),
    },
    {
      value: "elevated",
      name: t("settings.headerStyle.options.elevated.name"),
      description: t("settings.headerStyle.options.elevated.description"),
    },
    {
      value: "transparent",
      name: t("settings.headerStyle.options.transparent.name"),
      description: t("settings.headerStyle.options.transparent.description"),
    },
  ];
  const sidebarStyles = [
    {
      value: "default",
      name: t("settings.sidebarStyle.options.default.name"),
      description: t("settings.sidebarStyle.options.default.description"),
    },
    {
      value: "compact",
      name: t("settings.sidebarStyle.options.compact.name"),
      description: t("settings.sidebarStyle.options.compact.description"),
    },
    {
      value: "floating",
      name: t("settings.sidebarStyle.options.floating.name"),
      description: t("settings.sidebarStyle.options.floating.description"),
    },
    {
      value: "minimal",
      name: t("settings.sidebarStyle.options.minimal.name"),
      description: t("settings.sidebarStyle.options.minimal.description"),
    },
  ];
  return (
    <>
                {/* Layout Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.layoutTemplate.title")}</CardTitle>
                    <CardDescription>
                      {t("settings.layoutTemplate.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {layoutTemplates.map((template) => (
                        <div
                          key={template.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                            settings.layoutTemplate === template.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() =>
                            settings.setLayoutTemplate(template.value as any)
                          }
                        >
                          <div className="space-y-3">
                            {template.preview}
                            <div>
                              <h4 className="font-semibold">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {template.description}
                              </p>
                            </div>
                          </div>
                          {settings.layoutTemplate === template.value && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Header Styles */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.headerStyle.title")}</CardTitle>
                    <CardDescription>
                      {t("settings.headerStyle.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {headerStyles.map((style) => (
                        <div
                          key={style.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                            settings.headerStyle === style.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() =>
                            settings.setHeaderStyle(style.value as any)
                          }
                        >
                          <div className="space-y-2">
                            <h4 className="font-semibold">{style.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {style.description}
                            </p>
                            <div
                              className={cn(
                                "h-8 bg-muted rounded",
                                style.value === "compact" && "h-6",
                                style.value === "elevated" && "shadow-md",
                                style.value === "transparent" &&
                                "bg-transparent border border-muted"
                              )}
                            ></div>
                          </div>
                          {settings.headerStyle === style.value && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar Styles */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.sidebarStyle.title")}</CardTitle>
                    <CardDescription>
                      {t("settings.sidebarStyle.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {sidebarStyles.map((style) => (
                        <div
                          key={style.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                            settings.sidebarStyle === style.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() =>
                            settings.setSidebarStyle(style.value as any)
                          }
                        >
                          <div className="space-y-2">
                            <h4 className="font-semibold">{style.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {style.description}
                            </p>
                            <div className="flex gap-1">
                              <div
                                className={cn(
                                  "bg-muted rounded h-8",
                                  style.value === "compact" && "w-8",
                                  style.value === "floating" &&
                                  "w-12 shadow-md rounded-lg",
                                  style.value === "minimal" &&
                                  "w-10 bg-transparent border border-muted",
                                  style.value === "default" && "w-12"
                                )}
                              ></div>
                              <div className="flex-1 bg-muted/50 rounded h-8"></div>
                            </div>
                          </div>
                          {settings.sidebarStyle === style.value && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Card Styles */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.cardStyle.title")}</CardTitle>
                    <CardDescription>
                      {t("settings.cardStyle.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {cardStyles.map((style) => (
                        <div
                          key={style.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                            settings.cardStyle === style.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() =>
                            settings.setCardStyle(style.value as any)
                          }
                        >
                          <div className="space-y-3">
                            <div
                              className={cn("h-12 rounded p-2", style.class)}
                            >
                              <div className="h-2 bg-current opacity-20 rounded mb-1"></div>
                              <div className="h-2 bg-current opacity-20 rounded w-2/3"></div>
                            </div>
                            <p className="text-sm font-medium text-center">
                              {style.name}
                            </p>
                          </div>
                          {settings.cardStyle === style.value && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
    </>
  );
}
