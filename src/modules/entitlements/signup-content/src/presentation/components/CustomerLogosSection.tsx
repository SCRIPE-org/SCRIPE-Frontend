"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { Building2, Plus, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { CustomerLogoDialog } from "./CustomerLogoDialog";
import type { useSignupContentViewModel } from "../viewmodels/useSignupContentViewModel";

type SignupContentViewModel = ReturnType<typeof useSignupContentViewModel>;

interface CustomerLogosSectionProps {
  vm: SignupContentViewModel;
}

/**
 * React presentation component representing the customer logos section UI element.
 */
export function CustomerLogosSection({ vm }: CustomerLogosSectionProps) {
  const { t } = useI18n();
  const logos = vm.content?.customerLogos ?? [];
  const isLogoBusy = vm.isSavingLogo || vm.isDeletingLogo || vm.isReorderingLogos;

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
            disabled={isLogoBusy}
            className="h-7 gap-1.5 bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-500"
          >
            <Plus className="h-3 w-3" />
            {t("signupContent.customerLogos.add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logos.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-600">
            {t("signupContent.customerLogos.empty")}
          </p>
        ) : (
          <div className="space-y-2">
            {logos.map((logo, idx) => (
              <div
                key={logo.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 transition-colors hover:border-zinc-700"
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    onClick={() => vm.handleMoveLogo(logo.id, "up")}
                    disabled={idx === 0 || isLogoBusy}
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30"
                    aria-label={t("signupContent.customerLogos.reorder")}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => vm.handleMoveLogo(logo.id, "down")}
                    disabled={idx === logos.length - 1 || isLogoBusy}
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30"
                    aria-label={t("signupContent.customerLogos.reorder")}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
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
                    <Badge
                      variant="outline"
                      className="mt-0.5 border-emerald-700/40 px-1.5 py-0 text-[10px] text-emerald-500"
                    >
                      {t("signupContent.customerLogos.isRealData")}
                    </Badge>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    onClick={() => vm.handleOpenEditLogo(logo)}
                    disabled={isLogoBusy}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                    aria-label={t("signupContent.customerLogos.edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => vm.handleDeleteLogo(logo.id)}
                    disabled={isLogoBusy}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:bg-red-950 hover:text-red-300 disabled:opacity-50"
                    aria-label={t("signupContent.customerLogos.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
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
