"use client";

import { useSignupContentViewModel } from "../viewmodels/useSignupContentViewModel";
import { WelcomeContentForm } from "../components/WelcomeContentForm";
import { TrustMarkDialog } from "../components/TrustMarkDialog";
import { CustomerLogoDialog } from "../components/CustomerLogoDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Shield,
  Star,
  Building2,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

// ── Mode section ──────────────────────────────────────────────────────────────

function ContentModeSection() {
  const vm = useSignupContentViewModel();
  const { t } = useI18n();
  const mode = vm.content?.contentMode ?? "Seeded";
  const isLive = mode === "Live";

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <Shield className="h-4 w-4 text-indigo-400" />
          {t("signupContent.mode.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  isLive
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                }
              >
                {isLive ? t("signupContent.mode.live") : t("signupContent.mode.seeded")}
              </Badge>
            </div>
            <p className="text-sm text-zinc-400">
              {isLive ? t("signupContent.mode.liveDesc") : t("signupContent.mode.seededDesc")}
            </p>
            {isLive && (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <p className="text-xs text-amber-300">{t("signupContent.mode.liveWarning")}</p>
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">{t("signupContent.mode.seeded")}</span>
              <Switch
                checked={isLive}
                disabled={vm.isSettingMode}
                onCheckedChange={(checked) => vm.handleSetMode(checked ? "Live" : "Seeded")}
              />
              <span className="text-xs text-zinc-500">{t("signupContent.mode.live")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Trust marks section ───────────────────────────────────────────────────────

function TrustMarksSection() {
  const vm = useSignupContentViewModel();
  const { t } = useI18n();
  const marks = vm.content?.trustMarks ?? [];

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Star className="h-4 w-4 text-indigo-400" />
            {t("signupContent.trustMarks.title")}
          </CardTitle>
          <Button
            size="sm"
            onClick={vm.handleOpenAddTrustMark}
            className="h-7 gap-1.5 bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-500"
          >
            <Plus className="h-3 w-3" />
            {t("signupContent.trustMarks.add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {marks.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-600">{t("signupContent.trustMarks.empty")}</p>
        ) : (
          <div className="space-y-2">
            {marks.map((mark, idx) => (
              <div
                key={mark.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 transition-colors hover:border-zinc-700"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => vm.handleMoveTrustMark(mark.id, "up")}
                    disabled={idx === 0}
                    className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-300 disabled:opacity-30"
                    aria-label={t("signupContent.trustMarks.reorder")}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => vm.handleMoveTrustMark(mark.id, "down")}
                    disabled={idx === marks.length - 1}
                    className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-300 disabled:opacity-30"
                    aria-label={t("signupContent.trustMarks.reorder")}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-white">{mark.labelEn}</span>
                    <span className="text-zinc-600">/</span>
                    <span className="truncate text-zinc-400" dir="rtl">{mark.labelAr}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge variant="outline" className="border-zinc-700 px-1.5 py-0 text-[10px] text-zinc-500">
                      {mark.kind}
                    </Badge>
                    {mark.isRealData && (
                      <Badge variant="outline" className="border-emerald-700/40 px-1.5 py-0 text-[10px] text-emerald-500">
                        {t("signupContent.trustMarks.isRealData")}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => vm.handleOpenEditTrustMark(mark)}
                    className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                    aria-label={t("signupContent.trustMarks.edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => vm.handleDeleteTrustMark(mark.id)}
                    disabled={vm.isDeletingTrustMark}
                    className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-red-950 hover:text-red-300 disabled:opacity-50"
                    aria-label={t("signupContent.trustMarks.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <TrustMarkDialog
        open={vm.trustMarkDialogOpen}
        onClose={vm.handleCloseTrustMarkDialog}
        onSave={vm.handleSaveTrustMark}
        isSaving={vm.isSavingTrustMark}
        editing={vm.editingTrustMark}
      />
    </Card>
  );
}

// ── Customer logos section ────────────────────────────────────────────────────

function CustomerLogosSection() {
  const vm = useSignupContentViewModel();
  const { t } = useI18n();
  const logos = vm.content?.customerLogos ?? [];

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Building2 className="h-4 w-4 text-indigo-400" />
            {t("signupContent.customerLogos.title")}
          </CardTitle>
          <Button
            size="sm"
            onClick={vm.handleOpenAddLogo}
            className="h-7 gap-1.5 bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-500"
          >
            <Plus className="h-3 w-3" />
            {t("signupContent.customerLogos.add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logos.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-600">{t("signupContent.customerLogos.empty")}</p>
        ) : (
          <div className="space-y-2">
            {logos.map((logo, idx) => (
              <div
                key={logo.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 transition-colors hover:border-zinc-700"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => vm.handleMoveLogo(logo.id, "up")}
                    disabled={idx === 0}
                    className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-300 disabled:opacity-30"
                    aria-label={t("signupContent.customerLogos.reorder")}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => vm.handleMoveLogo(logo.id, "down")}
                    disabled={idx === logos.length - 1}
                    className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-300 disabled:opacity-30"
                    aria-label={t("signupContent.customerLogos.reorder")}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                {logo.assetUrl && (
                  <div className="h-8 w-12 shrink-0 overflow-hidden rounded border border-zinc-800 bg-zinc-950">
                    <img
                      src={logo.assetUrl}
                      alt={logo.name}
                      className="h-full w-full object-contain p-0.5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{logo.name}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{logo.assetUrl}</p>
                  {logo.isRealData && (
                    <Badge variant="outline" className="mt-0.5 border-emerald-700/40 px-1.5 py-0 text-[10px] text-emerald-500">
                      {t("signupContent.customerLogos.isRealData")}
                    </Badge>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => vm.handleOpenEditLogo(logo)}
                    className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                    aria-label={t("signupContent.customerLogos.edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => vm.handleDeleteLogo(logo.id)}
                    disabled={vm.isDeletingLogo}
                    className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-red-950 hover:text-red-300 disabled:opacity-50"
                    aria-label={t("signupContent.customerLogos.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CustomerLogoDialog
        open={vm.logoDialogOpen}
        onClose={vm.handleCloseLogoDialog}
        onSave={vm.handleSaveLogo}
        isSaving={vm.isSavingLogo}
        editing={vm.editingLogo}
      />
    </Card>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function SignupContentView() {
  const vm = useSignupContentViewModel();
  const { t } = useI18n();

  if (vm.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-zinc-500">{t("signupContent.loading")}</p>
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-400">{t("signupContent.error.load")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">{t("signupContent.title")}</h1>
        <p className="mt-1 text-sm text-zinc-400">{t("signupContent.subtitle")}</p>
      </div>

      {/* Section A: Content Mode */}
      <ContentModeSection />

      {/* Section B: Welcome Content */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Star className="h-4 w-4 text-indigo-400" />
            {t("signupContent.welcome.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WelcomeContentForm
            welcome={vm.content?.welcomeContent ?? null}
            onSave={vm.handleUpdateWelcome}
            isSaving={vm.isUpdatingWelcome}
          />
        </CardContent>
      </Card>

      {/* Section C: Trust Marks */}
      <TrustMarksSection />

      {/* Section D: Customer Logos */}
      <CustomerLogosSection />
    </div>
  );
}
