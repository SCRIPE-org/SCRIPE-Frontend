"use client";

import { useState, useMemo } from "react";
import { useEditionDetailViewModel } from "../viewmodels/useEditionDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import type { Feature } from "@modules/entitlements/features/src/domain/entities/Feature";
import Link from "next/link";

interface EditionDetailViewProps {
      editionId: string;
}

export function EditionDetailView({ editionId }: EditionDetailViewProps) {
      const { t, language } = useI18n();
      const vm = useEditionDetailViewModel(editionId);

      const [localValues, setLocalValues] = useState<Record<string, string>>({});

      // Group features by module
      const featuresByModule = useMemo(() => {
            if (!vm.features) return {};
            return vm.features.reduce((acc, feature) => {
                  if (!acc[feature.module]) {
                        acc[feature.module] = [];
                  }
                  acc[feature.module].push(feature);
                  return acc;
            }, {} as Record<string, Feature[]>);
      }, [vm.features]);

      const actualUpdates = useMemo(() => {
            const updates: Record<string, string> = {};
            if (!vm.edition || !vm.features) return updates;

            for (const [featureId, value] of Object.entries(localValues)) {
                  const featureRef = vm.features.find(f => f.id === featureId);
                  if (!featureRef) continue;

                  const editionFeature = vm.edition.features?.find((f) => f.featureName === featureRef.name);
                  const defaultValue = featureRef.defaultValue ?? "";
                  const originalValue = editionFeature ? editionFeature.value : defaultValue;

                  if (value !== originalValue) {
                        updates[featureId] = value;
                  }
            }
            return updates;
      }, [localValues, vm.edition, vm.features]);

      const hasUnsavedChanges = Object.keys(actualUpdates).length > 0;

      if (vm.isLoading) {
            return <div className="p-8 text-center">{t("common.loading") || "Loading..."}</div>;
      }

      if (vm.error || !vm.edition) {
            return (
                  <div className="p-8 text-center text-red-500">
                        {t("common.error") || "An error occurred while loading data."}
                  </div>
            );
      }

      const { edition } = vm;

      const handleValueChange = (featureId: string, value: string) => {
            setLocalValues((prev) => ({ ...prev, [featureId]: value }));
      };

      const handleSaveAll = () => {
            if (hasUnsavedChanges) {
                  vm.saveAllFeatures(actualUpdates);
            }
      };

      const getValue = (featureId: string, featureName: string, defaultValue: string) => {
            if (localValues[featureId] !== undefined) {
                  return localValues[featureId];
            }
            const editionFeature = edition.features?.find((f) => f.featureName === featureName);
            return editionFeature ? editionFeature.value : defaultValue;
      };

      const isOverridden = (featureName: string) => {
            return edition.features?.some((f) => f.featureName === featureName) ?? false;
      };

      return (
            <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                              <Link href="/entitlements/editions">
                                    <Button variant="ghost" size="icon">
                                          <ArrowLeft className="h-5 w-5" />
                                    </Button>
                              </Link>
                              <div>
                                    <h1 className="text-3xl font-bold tracking-tight">{edition.getDisplayName(language)}</h1>
                                    <p className="text-muted-foreground">
                                          {edition.description || t("entitlements.editions.manageFeaturesDescription")}
                                    </p>
                              </div>
                        </div>
                        <div className="flex items-center gap-2">
                              {hasUnsavedChanges && (
                                    <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                                          {t("common.unsavedChanges") || "Unsaved changes"}
                                    </Badge>
                              )}
                              {hasUnsavedChanges && (
                                    <Button
                                          onClick={handleSaveAll}
                                          disabled={vm.isSaving}
                                          className="sm:w-auto w-full gap-1 gradient-primary"
                                    >
                                          {vm.isSaving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                                <Save className="h-4 w-4" />
                                          )}
                                          {t("common.saveChanges") || "Save Changes"}
                                    </Button>
                              )}
                        </div>
                  </div>

                  {Object.entries(featuresByModule).map(([moduleName, features]) => (
                        <Card key={moduleName} className="overflow-hidden">
                              <CardHeader className="bg-muted/50 pb-4 border-b">
                                    <CardTitle>
                                          {t(`modules.${moduleName.toLowerCase()}`) || moduleName}
                                    </CardTitle>
                                    <CardDescription>
                                          {t("entitlements.features.moduleFeaturesLabel", { module: moduleName }) ||
                                                `Manage features for the ${moduleName} module.`}
                                    </CardDescription>
                              </CardHeader>
                              <CardContent className="p-0">
                                    <div className="divide-y">
                                          {features.map((feature) => {
                                                const currentValue = getValue(feature.id, feature.name, feature.defaultValue);
                                                const hasOverride = isOverridden(feature.name);
                                                const isUnsaved =
                                                      localValues[feature.id] !== undefined &&
                                                      localValues[feature.id] !== (edition.features?.find((f) => f.featureName === feature.name)?.value ?? feature.defaultValue);

                                                return (
                                                      <div
                                                            key={feature.id}
                                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4"
                                                      >
                                                            <div className="space-y-1 max-w-[60%]">
                                                                  <div className="flex items-center gap-2">
                                                                        <span className="font-medium">{feature.getDisplayName(language)}</span>
                                                                        {hasOverride ? (
                                                                              <Badge variant="default" className="text-[10px] h-5">Custom</Badge>
                                                                        ) : (
                                                                              <Badge variant="outline" className="text-[10px] h-5">Default</Badge>
                                                                        )}
                                                                        {isUnsaved && (
                                                                              <Badge variant="outline" className="text-[10px] h-5 text-amber-600 border-amber-500/30">Modified</Badge>
                                                                        )}
                                                                  </div>
                                                                  <p className="text-xs text-muted-foreground font-mono">{feature.name}</p>
                                                                  {feature.description && (
                                                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                                                  )}
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                  {feature.valueType === "Boolean" && (
                                                                        <Switch
                                                                              checked={currentValue === "true"}
                                                                              onCheckedChange={(checked) =>
                                                                                    handleValueChange(feature.id, checked ? "true" : "false")
                                                                              }
                                                                        />
                                                                  )}
                                                                  {feature.valueType === "Numeric" && (
                                                                        <Input
                                                                              type="number"
                                                                              value={currentValue}
                                                                              onChange={(e) => handleValueChange(feature.id, e.target.value)}
                                                                              className="w-24"
                                                                        />
                                                                  )}
                                                                  {feature.valueType === "String" && (
                                                                        <Input
                                                                              type="text"
                                                                              value={currentValue}
                                                                              onChange={(e) => handleValueChange(feature.id, e.target.value)}
                                                                              className="w-48"
                                                                        />
                                                                  )}

                                                            </div>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              </CardContent>
                        </Card>
                  ))}
            </div>
      );
}
