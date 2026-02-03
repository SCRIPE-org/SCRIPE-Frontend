"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type { User } from "@modules/auth/core/domain/entities/User";
import {
      Phone,
      Camera,
      Shield,
      Settings,
      Activity,
      Download,
      Mail,
} from "lucide-react";

interface ProfileHeaderSectionProps {
      profile: User | null;
}

export function ProfileHeaderSection({ profile }: ProfileHeaderSectionProps) {
      const { t } = useI18n();

      return (
            <div className="relative overflow-hidden">
                  {/* Elegant Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary),0.15),transparent_50%)]" />
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(var(--primary),0.05)_60deg,transparent_120deg)]" />

                  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
                        {/* Premium Profile Card */}
                        <div className="bg-card/95 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 shadow-2xl shadow-primary/10">
                              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                                    {/* Enhanced Avatar Section */}
                                    <div className="relative group flex-shrink-0">
                                          <div className="relative">
                                                {/* Premium Avatar with Multiple Borders */}
                                                <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-1.5 shadow-2xl shadow-primary/25">
                                                      <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center relative overflow-hidden">
                                                            <span className="text-primary-foreground font-bold text-5xl z-10">
                                                                  {profile?.firstName?.charAt(0)?.toUpperCase()}
                                                                  {profile?.lastName?.charAt(0)?.toUpperCase()}
                                                            </span>
                                                            {/* Animated Shine Effect */}
                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60" />
                                                            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full blur-sm" />
                                                      </div>
                                                </div>

                                                {/* Professional Status Indicator */}
                                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-background shadow-lg flex items-center justify-center">
                                                      <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                                                </div>

                                                {/* Hover Camera Effect */}
                                                <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer">
                                                      <div className="text-center text-white">
                                                            <Camera className="w-8 h-8 mx-auto mb-2" />
                                                            <span className="text-sm font-medium">
                                                                  {t("profile.changePhoto")}
                                                            </span>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>

                                    {/* Comprehensive User Information */}
                                    <div className="flex-1 space-y-6 text-center lg:text-left">
                                          {/* Name and Status */}
                                          <div className="text-center lg:text-left">
                                                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                                      {profile?.displayName || t("common.user")}
                                                </h1>
                                                <p className="text-xl text-muted-foreground mt-2 flex items-center justify-center lg:justify-start gap-2">
                                                      <Shield className="w-5 h-5" />
                                                      {profile?.adminTypeName || t("profile.admin")}
                                                </p>
                                                <div className="flex items-center justify-center lg:justify-start gap-4 mt-3">
                                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Mail className="w-4 h-4" />
                                                            <span>{profile?.username || "demo-user"}@company.com</span>
                                                      </div>
                                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Phone className="w-4 h-4" />
                                                            <span>{profile?.phoneNumber || "+1234567890"}</span>
                                                      </div>
                                                </div>
                                          </div>

                                          {/* Professional Stats Grid */}
                                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="bg-muted/30 rounded-2xl p-4 text-center hover:bg-muted/50 transition-colors">
                                                      <div className="text-2xl font-bold text-primary">12</div>
                                                      <div className="text-sm text-muted-foreground">
                                                            {t("profile.accountOverview")}
                                                      </div>
                                                </div>
                                                <div className="bg-muted/30 rounded-2xl p-4 text-center hover:bg-muted/50 transition-colors">
                                                      <div className="text-2xl font-bold text-primary">48</div>
                                                      <div className="text-sm text-muted-foreground">
                                                            {t("profile.profileComplete")}
                                                      </div>
                                                </div>
                                                <div className="bg-muted/30 rounded-2xl p-4 text-center hover:bg-muted/50 transition-colors">
                                                      <div className="text-2xl font-bold text-primary">24</div>
                                                      <div className="text-sm text-muted-foreground">
                                                            {t("profile.accountStatus")}
                                                      </div>
                                                </div>
                                                <div className="bg-muted/30 rounded-2xl p-4 text-center hover:bg-muted/50 transition-colors">
                                                      <div className="text-2xl font-bold text-primary">95%</div>
                                                      <div className="text-sm text-muted-foreground">
                                                            {t("profile.securityStatus")}
                                                      </div>
                                                </div>
                                          </div>

                                          {/* Quick Actions */}
                                          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                                <Button variant="outline" size="sm" className="gap-2">
                                                      <Settings className="w-4 h-4" />
                                                      {t("nav.settings")}
                                                </Button>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                      <Activity className="w-4 h-4" />
                                                      {t("profile.activityLog")}
                                                </Button>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                      <Download className="w-4 h-4" />
                                                      {t("profile.exportProfileData")}
                                                </Button>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      );
}
