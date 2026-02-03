"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import type { PasswordFormData } from "../viewmodels/useUserViewModel";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface PasswordSectionProps {
      formData: PasswordFormData;
      isLoading: boolean;
      isSuccess: boolean;
      error: string;
      isFormValid: boolean;
      showPasswords: { current: boolean; new: boolean; confirm: boolean };
      onFieldChange: (field: keyof PasswordFormData, value: string) => void;
      onToggleVisibility: (field: "current" | "new" | "confirm") => void;
      onSubmit: () => void;
}

export function PasswordSection({
      formData,
      isLoading,
      isSuccess,
      error,
      isFormValid,
      showPasswords,
      onFieldChange,
      onToggleVisibility,
      onSubmit,
}: PasswordSectionProps) {
      const { t } = useI18n();

      const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSubmit();
      };

      return (
            <Card className="glass hover-lift">
                  <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                              <Lock className="w-5 h-5" />
                              {t("profile.password.title")}
                        </CardTitle>
                  </CardHeader>
                  <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                              {/* Success Message */}
                              {isSuccess && (
                                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4" />
                                          {t("profile.password.success")}
                                    </div>
                              )}

                              {/* Error Message */}
                              {error && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                                          <AlertCircle className="w-4 h-4" />
                                          {error}
                                    </div>
                              )}

                              <div className="space-y-2">
                                    <Label htmlFor="currentPassword">{t("profile.password.current")}</Label>
                                    <div className="relative">
                                          <Input
                                                id="currentPassword"
                                                type={showPasswords.current ? "text" : "password"}
                                                value={formData.currentPassword}
                                                onChange={(e) => onFieldChange("currentPassword", e.target.value)}
                                                className="h-12 pr-12"
                                                placeholder={t("profile.password.current")}
                                                disabled={isLoading}
                                          />
                                          <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                onClick={() => onToggleVisibility("current")}
                                                disabled={isLoading}
                                          >
                                                {showPasswords.current ? (
                                                      <EyeOff className="h-4 w-4" />
                                                ) : (
                                                      <Eye className="h-4 w-4" />
                                                )}
                                          </Button>
                                    </div>
                              </div>

                              <div className="space-y-2">
                                    <Label htmlFor="newPassword">{t("profile.password.new")}</Label>
                                    <div className="relative">
                                          <Input
                                                id="newPassword"
                                                type={showPasswords.new ? "text" : "password"}
                                                value={formData.newPassword}
                                                onChange={(e) => onFieldChange("newPassword", e.target.value)}
                                                className="h-12 pr-12"
                                                placeholder={t("profile.password.new")}
                                                disabled={isLoading}
                                          />
                                          <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                onClick={() => onToggleVisibility("new")}
                                                disabled={isLoading}
                                          >
                                                {showPasswords.new ? (
                                                      <EyeOff className="h-4 w-4" />
                                                ) : (
                                                      <Eye className="h-4 w-4" />
                                                )}
                                          </Button>
                                    </div>
                              </div>

                              <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">{t("profile.password.confirm")}</Label>
                                    <div className="relative">
                                          <Input
                                                id="confirmPassword"
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => onFieldChange("confirmPassword", e.target.value)}
                                                className="h-12 pr-12"
                                                placeholder={t("profile.password.confirm")}
                                                disabled={isLoading}
                                          />
                                          <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                onClick={() => onToggleVisibility("confirm")}
                                                disabled={isLoading}
                                          >
                                                {showPasswords.confirm ? (
                                                      <EyeOff className="h-4 w-4" />
                                                ) : (
                                                      <Eye className="h-4 w-4" />
                                                )}
                                          </Button>
                                    </div>
                              </div>

                              <Button
                                    type="submit"
                                    className="w-full h-12 gradient-primary"
                                    disabled={isLoading || !isFormValid}
                              >
                                    {isLoading ? (
                                          <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>{t("profile.password.updating")}</span>
                                          </div>
                                    ) : (
                                          <div className="flex items-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                <span>{t("profile.password.update")}</span>
                                          </div>
                                    )}
                              </Button>
                        </form>
                  </CardContent>
            </Card>
      );
}
