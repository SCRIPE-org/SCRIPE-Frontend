"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card"
import { Button } from "@core/ui/button"
import { Input } from "@core/ui/input"
import { Label } from "@core/ui/label"
import { useAppStore } from "@core/store/useAppStore"
import { useI18n } from "@core/providers/i18n-provider"
import { validateForm, VALIDATION_SETS, passwordConfirmation, isFormValid } from "@core/common/validation"
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

interface UserProfile {
  id: string
  username: string
  firstName: string
  lastName: string
  phoneNumber: string
  adminTypeName: string
}

interface ProfileFormData {
  firstName: string
  lastName: string
  phoneNumber: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function ProfileDemoView() {
  const authUser = useAppStore((state) => state.user)
  const { t, language } = useI18n()
  const isRTL = language === 'ar'

  // DEMO: Mock profile data instead of backend calls
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState("")

  // Profile form state
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  })
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileUpdateError, setProfileUpdateError] = useState("")

  // Password form state
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // DEMO: Mock fetch profile data
  const fetchProfile = async () => {
    try {
      setProfileLoading(true)
      setProfileError("")

      // DEMO: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // DEMO: Use mock data from auth user or create demo data
      const mockProfile: UserProfile = {
        id: authUser?.id || "demo-user-id",
        username: authUser?.username || "demo-user",
        firstName: authUser?.firstName || "Demo",
        lastName: authUser?.lastName || "User",
        phoneNumber: authUser?.phoneNumber || "+1234567890",
        adminTypeName: authUser?.adminTypeName || "Administrator"
      }

      setProfile(mockProfile)
      setProfileFormData({
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        phoneNumber: mockProfile.phoneNumber,
      })
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : t("profile.errors.unexpected"))
    } finally {
      setProfileLoading(false)
    }
  }

  // DEMO: Mock update profile
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileUpdateLoading(true)
    setProfileUpdateError("")
    setProfileSuccess(false)

    try {
      // DEMO: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // DEMO: Update mock profile data
      const updatedProfile = {
        ...profile!,
        firstName: profileFormData.firstName,
        lastName: profileFormData.lastName,
        phoneNumber: profileFormData.phoneNumber,
      }

      setProfile(updatedProfile)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileUpdateError(err instanceof Error ? err.message : t("profile.errors.unexpected"))
    } finally {
      setProfileUpdateLoading(false)
    }
  }

  // DEMO: Mock update password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordUpdateLoading(true)
    setPasswordError("")
    setPasswordSuccess(false)

    // Validate password form with confirmation
    const passwordValidationSet = {
      currentPassword: [...VALIDATION_SETS.PASSWORD_CHANGE_FORM.currentPassword],
      newPassword: [...VALIDATION_SETS.PASSWORD_CHANGE_FORM.newPassword],
      confirmPassword: [
        ...VALIDATION_SETS.PASSWORD_CHANGE_FORM.confirmPassword,
        passwordConfirmation(passwordFormData.newPassword, t("profile.errors.passwordMismatch"))
      ]
    };

    const validationResults = validateForm(passwordFormData, passwordValidationSet);

    if (!isFormValid(validationResults)) {
      const firstError = Object.values(validationResults).find(result => !result.isValid);
      setPasswordError(firstError?.message || t("profile.errors.unexpected"));
      setPasswordUpdateLoading(false);
      return;
    }

    try {
      // DEMO: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // DEMO: Reset form on success
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : t("profile.errors.unexpected"))
    } finally {
      setPasswordUpdateLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  if (profileLoading) {
    return <LoadingSpinner />
  }

  if (profileError && !profile) {
    return <ErrorMessage message={profileError} onRetry={fetchProfile} />
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
                      <span className="text-sm font-medium">Change Photo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive User Information */}
              <div className="flex-1 space-y-6 text-center lg:text-left">
                {/* Name and Status */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {profile?.firstName} {profile?.lastName}
                    </h1>
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      {t('profile.online')}
                    </div>
                  </div>
                  <p className={`text-muted-foreground mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? `${profile?.username}@` : `@${profile?.username}`}
                  </p>

                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 transition-all duration-300"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {t('profile.changePhoto')}
                    </Button>
                  </div>
                </div>

                {/* Professional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-4 border border-blue-500/20 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('profile.username')}</p>
                        <p className="font-semibold text-foreground">{profile?.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-4 border border-green-500/20 hover:border-green-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-xl">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('profile.phone')}</p>
                        <p className="font-semibold text-foreground">{profile?.phoneNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl p-4 border border-purple-500/20 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-xl">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('profile.role')}</p>
                        <p className="font-semibold text-foreground">{profile?.adminTypeName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl p-4 border border-orange-500/20 hover:border-orange-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-xl">
                        <Activity className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('profile.status')}</p>
                        <p className="font-semibold text-green-600">{t('profile.active')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    {t('profile.accountOverview')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">100%</p>
                      <p className="text-sm text-muted-foreground">{t('profile.profileComplete')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{t('profile.active')}</p>
                      <p className="text-sm text-muted-foreground">{t('profile.accountStatus')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{t('profile.admin')}</p>
                      <p className="text-sm text-muted-foreground">{t('profile.accessLevel')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{t('profile.secure')}</p>
                      <p className="text-sm text-muted-foreground">{t('profile.securityStatus')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Left Column - Profile Information */}
          <div className="xl:col-span-2 space-y-8">

            {/* Personal Information Card */}
            <Card className="bg-card/95 backdrop-blur-2xl border-border/50 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  {t('profile.personalInformation')}
                </CardTitle>
                <p className="text-muted-foreground mt-2">{t('profile.personalInfoDescription')}</p>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {t('profile.firstName')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="firstName"
                          type="text"
                          value={profileFormData.firstName}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="h-14 rounded-2xl border-2 border-border/50 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm pl-4 text-base font-medium"
                          placeholder={t('profile.firstName')}
                          required
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {t('profile.lastName')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="lastName"
                          type="text"
                          value={profileFormData.lastName}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="h-14 rounded-2xl border-2 border-border/50 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm pl-4 text-base font-medium"
                          placeholder={t('profile.lastName')}
                          required
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-3">
                    <Label htmlFor="phoneNumber" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {t('profile.phoneNumber')}
                    </Label>
                    <div className="relative">
                      <Phone className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={profileFormData.phoneNumber}
                        onChange={(e) => setProfileFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className={`h-14 rounded-2xl border-2 border-border/50 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} text-base font-medium`}
                        placeholder={t('profile.phoneNumber')}
                        required
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>

                  {/* Status Messages */}
                  {profileUpdateError && (
                    <div className="flex items-center gap-3 text-red-600 text-sm p-4 bg-red-500/10 rounded-2xl border border-red-500/20 backdrop-blur-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{profileUpdateError}</span>
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="flex items-center gap-3 text-green-600 text-sm p-4 bg-green-500/10 rounded-2xl border border-green-500/20 backdrop-blur-sm">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{t('profile.updateSuccess')}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={profileUpdateLoading}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-300 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                    >
                      {profileUpdateLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          <span>{t('common.updating')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Save className="w-5 h-5" />
                          <span>{t('profile.updateProfile')}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Password Change Card */}
            <Card className="bg-card/95 backdrop-blur-2xl border-border/50 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent p-6 border-b border-border/50">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <Lock className="w-6 h-6 text-orange-500" />
                  </div>
                  {t('profile.password.title')}
                </CardTitle>
                <p className="text-muted-foreground mt-2">{t('profile.passwordDescription')}</p>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Current Password */}
                    <div className="space-y-3">
                      <Label htmlFor="currentPassword" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        {t('profile.password.current')}
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordFormData.currentPassword}
                          onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                          required
                          className={`h-14 rounded-2xl border-2 border-border/50 focus:border-orange-500/50 transition-all duration-300 bg-background/50 backdrop-blur-sm ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} text-base font-medium`}
                          placeholder={t('profile.password.current')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted/50 rounded-xl`}
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        >
                          {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-3">
                      <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        {t('profile.password.new')}
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordFormData.newPassword}
                          onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                          required
                          className={`h-14 rounded-2xl border-2 border-border/50 focus:border-orange-500/50 transition-all duration-300 bg-background/50 backdrop-blur-sm ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} text-base font-medium`}
                          placeholder={t('profile.password.new')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted/50 rounded-xl`}
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        >
                          {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        {t('profile.password.confirm')}
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordFormData.confirmPassword}
                          onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                          required
                          className={`h-14 rounded-2xl border-2 border-border/50 focus:border-orange-500/50 transition-all duration-300 bg-background/50 backdrop-blur-sm ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} text-base font-medium`}
                          placeholder={t('profile.password.confirm')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted/50 rounded-xl`}
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-orange-500/5 rounded-2xl p-6 border border-orange-500/20">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">{t('profile.password.requirements')}:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          • {t('profile.password.requirementLength')}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          • {t('profile.password.requirementCase')}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          • {t('profile.password.requirementNumbers')}
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {passwordError && (
                    <div className="flex items-center gap-3 text-red-600 text-sm p-4 bg-red-500/10 rounded-2xl border border-red-500/20 backdrop-blur-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="flex items-center gap-3 text-green-600 text-sm p-4 bg-green-500/10 rounded-2xl border border-green-500/20 backdrop-blur-sm">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{t('profile.password.success')}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={passwordUpdateLoading}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {passwordUpdateLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t('profile.password.updating')}
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          {t('profile.password.update')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Additional Features */}
          <div className="space-y-8">

            {/* Account Security Card */}
            <Card className="bg-card/95 backdrop-blur-2xl border-border/50 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent p-6 border-b border-border/50">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-xl">
                    <Shield className="w-5 h-5 text-green-500" />
                  </div>
                  {t('profile.accountSecurity')}
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-2xl border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-semibold text-sm">{t('profile.twoFactorAuth')}</p>
                        <p className="text-xs text-muted-foreground">{t('profile.enabled')}</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-sm">{t('profile.lastLogin')}</p>
                        <p className="text-xs text-muted-foreground">{t('profile.hoursAgo').replace('{hours}', '2')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-500/5 rounded-2xl border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-semibold text-sm">{t('profile.loginLocation')}</p>
                        <p className="text-xs text-muted-foreground">Cairo, Egypt</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="bg-card/95 backdrop-blur-2xl border-border/50 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent p-6 border-b border-border/50">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Settings className="w-5 h-5 text-blue-500" />
                  </div>
                  {t('profile.quickActions')}
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <div className={`space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <Button variant="outline" className={`w-full h-12 rounded-2xl border-2 hover:border-primary/50 transition-all duration-300 ${isRTL ? 'flex items-center justify-end flex-row-reverse' : 'flex items-center justify-start'}`}>
                    {isRTL ? (
                      <>
                        <span className="mr-3">{t('profile.exportProfileData')}</span>
                        <Download className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="ml-3">{t('profile.exportProfileData')}</span>
                      </>
                    )}
                  </Button>

                  <Button variant="outline" className={`w-full h-12 rounded-2xl border-2 hover:border-primary/50 transition-all duration-300 ${isRTL ? 'flex items-center justify-end flex-row-reverse' : 'flex items-center justify-start'}`}>
                    {isRTL ? (
                      <>
                        <span className="mr-3">{t('profile.privacySettings')}</span>
                        <Settings className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4" />
                        <span className="ml-3">{t('profile.privacySettings')}</span>
                      </>
                    )}
                  </Button>

                  <Button variant="outline" className={`w-full h-12 rounded-2xl border-2 hover:border-primary/50 transition-all duration-300 ${isRTL ? 'flex items-center justify-end flex-row-reverse' : 'flex items-center justify-start'}`}>
                    {isRTL ? (
                      <>
                        <span className="mr-3">{t('profile.activityLog')}</span>
                        <Activity className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4" />
                        <span className="ml-3">{t('profile.activityLog')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Info Card */}
            <Card className="bg-card/95 backdrop-blur-2xl border-border/50 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent p-6 border-b border-border/50">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-xl">
                    <Activity className="w-5 h-5 text-purple-500" />
                  </div>
                  {t('profile.systemInfo')}
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4 text-sm">

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('profile.accountType')}</span>
                    <span className="font-semibold text-primary">{profile?.adminTypeName || t('profile.admin')}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('profile.memberSince')}</span>
                    <span className="font-semibold">January 2024</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Demo Mode</span>
                    <span className="font-semibold text-green-600">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
