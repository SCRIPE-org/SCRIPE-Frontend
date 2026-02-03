"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import type { ProfileFormData } from "../viewmodels/useUserViewModel";
import {
      User,
      Phone,
      AlertCircle,
      CheckCircle,
      Loader2,
      Save,
} from "lucide-react";

interface ProfileInfoSectionProps {
      formData: ProfileFormData;
      isLoading: boolean;
      isSuccess: boolean;
      error: string;
      isFormValid: boolean;
      onFieldChange: (field: keyof ProfileFormData, value: string) => void;
      onSubmit: () => void;
}

export function ProfileInfoSection({
      formData,
      isLoading,
      isSuccess,
      error,
      isFormValid,
      onFieldChange,
      onSubmit,
}: ProfileInfoSectionProps) {
      const { t } = useI18n();

      const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSubmit();
      };

      return (
            <Card className="glass hover-lift">
                  <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                              <User className="w-5 h-5" />
                              {t("profile.personalInformation")}
                        </CardTitle>
                  </CardHeader>
                  <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                              {/* Success Message */}
                              {isSuccess && (
                                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4" />
                                          {t("profile.updateSuccess")}
                                    </div>
                              )}

                              {/* Error Message */}
                              {error && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                                          <AlertCircle className="w-4 h-4" />
                                          {error}
                                    </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                                          <Input
                                                id="firstName"
                                                value={formData.firstName}
                                                onChange={(e) => onFieldChange("firstName", e.target.value)}
                                                className="h-12"
                                                placeholder={t("profile.firstName")}
                                                disabled={isLoading}
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                                          <Input
                                                id="lastName"
                                                value={formData.lastName}
                                                onChange={(e) => onFieldChange("lastName", e.target.value)}
                                                className="h-12"
                                                placeholder={t("profile.lastName")}
                                                disabled={isLoading}
                                          />
                                    </div>
                              </div>

                              <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">{t("profile.phoneNumber")}</Label>
                                    <div className="relative">
                                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                          <Input
                                                id="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={(e) => onFieldChange("phoneNumber", e.target.value)}
                                                className="h-12 pl-10"
                                                placeholder={t("profile.phoneNumber")}
                                                disabled={isLoading}
                                          />
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
                                                <span>{t("common.loading")}</span>
                                          </div>
                                    ) : (
                                          <div className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                <span>{t("profile.updateProfile")}</span>
                                          </div>
                                    )}
                              </Button>
                        </form>
                  </CardContent>
            </Card>
      );
}
