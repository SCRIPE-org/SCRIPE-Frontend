"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card"
import { Button } from "@core/ui/button"
import { Input } from "@core/ui/input"
import { Label } from "@core/ui/label"
import { useAuth } from "@core/providers/auth-provider"
import { useI18n } from "@core/providers/i18n-provider"
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Phone,
  Camera,
  Shield,
  Calendar,
  Save,
  Mail,
  MapPin,
  Clock,
  Settings,
  Award,
  Activity,
  Download
} from "lucide-react"
import { LoadingSpinner } from "@core/ui/loading-spinner"
import { ErrorMessage } from "@core/ui/error-message"
import { useProfileViewModel } from "@core/hooks/use-profile-viewmodel"

export function ProfileView() {
  const { user: authUser } = useAuth()
  const { t, language } = useI18n()
  const isRTL = language === 'ar'
  
  // Use the profile view model
  const vm = useProfileViewModel()

  if (vm.profileLoading) {
    return <LoadingSpinner />
  }

  if (vm.profileError && !vm.profile) {
    return <ErrorMessage message={vm.profileError} onRetry={vm.fetchProfile} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Hero Profile Header */}
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
                        {vm.profile?.firstName?.charAt(0)?.toUpperCase()}
                        {vm.profile?.lastName?.charAt(0)?.toUpperCase()}
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
                      <span className="text-sm font-medium">{t("profile.changePhoto")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive User Information */}
              <div className="flex-1 space-y-6 text-center lg:text-left">
                {/* Name and Status */}
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {vm.profile?.displayName || t("common.user")}
                  </h1>
                  <p className="text-xl text-muted-foreground mt-2 flex items-center justify-center lg:justify-start gap-2">
                    <Shield className="w-5 h-5" />
                    {vm.profile?.adminTypeName || t("profile.admin")}
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{vm.profile?.username || "demo-user"}@company.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{vm.profile?.phoneNumber || "+1234567890"}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-muted/30 rounded-2xl p-4 text-center hover:bg-muted/50 transition-colors">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-sm text-muted-foreground">{t("profile.accountOverview")}</div>
                  </div>
                  <div className="bg-muted/30 rounded-2xl p-4 text-center hover:bg-muted/50 transition-colors">
                    <div className="text-2xl font-bold text-primary">48</div>
                    <div className="text-sm text-muted-foreground">{t("profile.profileComplete")}</div>
                  </div>
                  <div className="bg-muted/30 rounded-2xl p-4 text-center hover:bg-muted/50 transition-colors">
                    <div className="text-2xl font-bold text-primary">24</div>
                    <div className="text-sm text-muted-foreground">{t("profile.accountStatus")}</div>
                  </div>
                  <div className="bg-muted/30 rounded-2xl p-4 text-center hover:bg-muted/50 transition-colors">
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-sm text-muted-foreground">{t("profile.securityStatus")}</div>
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

      {/* Profile Management Forms */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Profile Information Form */}
          <Card className="glass hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t("profile.personalInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); vm.updateProfile(); }} className="space-y-6">
                {/* Success Message */}
                {vm.profileSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t("profile.updateSuccess")}
                  </div>
                )}

                {/* Error Message */}
                {vm.profileUpdateError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {vm.profileUpdateError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                    <Input
                      id="firstName"
                      value={vm.profileFormData.firstName}
                      onChange={(e) => vm.updateProfileField("firstName", e.target.value)}
                      className="h-12"
                      placeholder={t("profile.firstName")}
                      disabled={vm.profileUpdateLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                    <Input
                      id="lastName"
                      value={vm.profileFormData.lastName}
                      onChange={(e) => vm.updateProfileField("lastName", e.target.value)}
                      className="h-12"
                      placeholder={t("profile.lastName")}
                      disabled={vm.profileUpdateLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{t("profile.phoneNumber")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      value={vm.profileFormData.phoneNumber}
                      onChange={(e) => vm.updateProfileField("phoneNumber", e.target.value)}
                      className="h-12 pl-10"
                      placeholder={t("profile.phoneNumber")}
                      disabled={vm.profileUpdateLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 gradient-primary"
                  disabled={vm.profileUpdateLoading || !vm.isProfileFormValid}
                >
                  {vm.profileUpdateLoading ? (
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

          {/* Password Change Form */}
          <Card className="glass hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {t("profile.password.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); vm.changePassword(); }} className="space-y-6">
                {/* Success Message */}
                {vm.passwordSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t("profile.password.success")}
                  </div>
                )}

                {/* Error Message */}
                {vm.passwordError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {vm.passwordError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t("profile.password.current")}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={vm.showPasswords.current ? "text" : "password"}
                      value={vm.passwordFormData.currentPassword}
                      onChange={(e) => vm.updatePasswordField("currentPassword", e.target.value)}
                      className="h-12 pr-12"
                      placeholder={t("profile.password.current")}
                      disabled={vm.passwordUpdateLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => vm.togglePasswordVisibility("current")}
                      disabled={vm.passwordUpdateLoading}
                    >
                      {vm.showPasswords.current ? (
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
                      type={vm.showPasswords.new ? "text" : "password"}
                      value={vm.passwordFormData.newPassword}
                      onChange={(e) => vm.updatePasswordField("newPassword", e.target.value)}
                      className="h-12 pr-12"
                      placeholder={t("profile.password.new")}
                      disabled={vm.passwordUpdateLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => vm.togglePasswordVisibility("new")}
                      disabled={vm.passwordUpdateLoading}
                    >
                      {vm.showPasswords.new ? (
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
                      type={vm.showPasswords.confirm ? "text" : "password"}
                      value={vm.passwordFormData.confirmPassword}
                      onChange={(e) => vm.updatePasswordField("confirmPassword", e.target.value)}
                      className="h-12 pr-12"
                      placeholder={t("profile.password.confirm")}
                      disabled={vm.passwordUpdateLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => vm.togglePasswordVisibility("confirm")}
                      disabled={vm.passwordUpdateLoading}
                    >
                      {vm.showPasswords.confirm ? (
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
                  disabled={vm.passwordUpdateLoading || !vm.isPasswordFormValid}
                >
                  {vm.passwordUpdateLoading ? (
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
        </div>
      </div>
    </div>
  )
}