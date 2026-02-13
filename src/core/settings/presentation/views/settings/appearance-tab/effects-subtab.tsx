"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { ShadowIntensity, AnimationLevel } from "@core/providers/settings-provider";

export function EffectsSubtab() {
      const { t } = useI18n();
      const settings = useSettings();

      const shadowOptions: { value: ShadowIntensity; class: string }[] = [
            { value: "none", class: "shadow-none" },
            { value: "subtle", class: "shadow-sm" },
            { value: "moderate", class: "shadow-md" },
            { value: "strong", class: "shadow-xl" },
      ];

      const animationOptions: { value: AnimationLevel; speed: string }[] = [
            { value: "none", speed: "0" },
            { value: "minimal", speed: "0.5" },
            { value: "moderate", speed: "1" },
            { value: "high", speed: "1.5" },
      ];

      return (
            <div className="space-y-6">
                  {/* Shadow Intensity */}
                  <Card>
                        <CardHeader>
                              <CardTitle className="text-base">{t("settings.shadow.title")}</CardTitle>
                              <CardDescription>{t("settings.shadow.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {shadowOptions.map((opt) => (
                                          <button
                                                key={opt.value}
                                                className={cn(
                                                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:scale-[1.03]",
                                                      settings.shadowIntensity === opt.value
                                                            ? "border-primary bg-primary/5 shadow-md"
                                                            : "border-transparent hover:border-muted-foreground/20"
                                                )}
                                                onClick={() => settings.setShadowIntensity(opt.value)}
                                          >
                                                <div
                                                      className={cn(
                                                            "w-12 h-12 rounded-lg bg-card border border-border",
                                                            opt.class
                                                      )}
                                                />
                                                <div className="flex items-center gap-1.5">
                                                      {settings.shadowIntensity === opt.value && (
                                                            <Check className="w-3.5 h-3.5 text-primary" />
                                                      )}
                                                      <span className="text-xs font-medium text-muted-foreground">
                                                            {t(`settings.shadow.${opt.value}`)}
                                                      </span>
                                                </div>
                                          </button>
                                    ))}
                              </div>
                        </CardContent>
                  </Card>

                  {/* Animation Level */}
                  <Card>
                        <CardHeader>
                              <CardTitle className="text-base">{t("settings.animation.title")}</CardTitle>
                              <CardDescription>{t("settings.animation.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {animationOptions.map((opt) => (
                                          <button
                                                key={opt.value}
                                                className={cn(
                                                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:scale-[1.03]",
                                                      settings.animationLevel === opt.value
                                                            ? "border-primary bg-primary/5 shadow-md"
                                                            : "border-transparent hover:border-muted-foreground/20"
                                                )}
                                                onClick={() => settings.setAnimationLevel(opt.value)}
                                          >
                                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                                      <div
                                                            className={cn(
                                                                  "w-4 h-4 rounded-full bg-primary",
                                                                  opt.value !== "none" && "animate-bounce"
                                                            )}
                                                            style={{
                                                                  animationDuration: opt.value === "none" ? "0s" : `${parseFloat(opt.speed)}s`,
                                                            }}
                                                      />
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                      {settings.animationLevel === opt.value && (
                                                            <Check className="w-3.5 h-3.5 text-primary" />
                                                      )}
                                                      <span className="text-xs font-medium text-muted-foreground">
                                                            {t(`settings.animation.${opt.value}`)}
                                                      </span>
                                                </div>
                                          </button>
                                    ))}
                              </div>
                        </CardContent>
                  </Card>
            </div>
      );
}
