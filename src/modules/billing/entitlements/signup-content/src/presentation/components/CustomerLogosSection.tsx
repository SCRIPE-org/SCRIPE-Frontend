"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { useI18n } from "@core/providers/i18n-provider";
import { Building2, Plus, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { CustomerLogoDialog } from "./CustomerLogoDialog";
import type { useSignupContentViewModel } from "../viewmodels/useSignupContentViewModel";
import Image from "next/image";

type SignupContentViewModel = ReturnType<typeof useSignupContentViewModel>;

interface CustomerLogosSectionProps {
  vm: SignupContentViewModel;
}

/**
 * Presentation UI component rendering the customer logos section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function CustomerLogosSection({ vm }: CustomerLogosSectionProps) {
  const { t } = useI18n();
  const logos = vm.content?.customerLogos ?? [];
  const isLogoBusy = vm.isSavingLogo || vm.isDeletingLogo || vm.isReorderingLogos;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-info" aria-hidden="true" />
            {t("signupContent.customerLogos.title")}
          </CardTitle>
          <Button
            size="sm"
            onClick={vm.handleOpenAddLogo}
            disabled={isLogoBusy}
            className="h-7 gap-1.5 px-3 text-xs"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            {t("signupContent.customerLogos.add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logos.length === 0 ? (
          <EmptyState
            bare
            size="sm"
            icon={Building2}
            title={t("signupContent.customerLogos.empty")}
            action={
              <Button size="sm" variant="outline" onClick={vm.handleOpenAddLogo}>
                <Plus className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {t("signupContent.customerLogos.add")}
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {logos.map((logo, idx) => (
              <div
                key={logo.id}
                className="flex items-center gap-3 rounded-nx-md border border-nx-line bg-nx-raised px-4 py-2.5 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi motion-reduce:transition-none"
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    onClick={() => vm.handleMoveLogo(logo.id, "up")}
                    disabled={idx === 0 || vm.isLogoRowBusy(logo.id)}
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    aria-label={t("signupContent.customerLogos.reorder")}
                  >
                    <ChevronUp className="h-3 w-3" aria-hidden="true" />
                  </Button>
                  <Button
                    onClick={() => vm.handleMoveLogo(logo.id, "down")}
                    disabled={idx === logos.length - 1 || vm.isLogoRowBusy(logo.id)}
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    aria-label={t("signupContent.customerLogos.reorder")}
                  >
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
                {logo.assetUrl && (
                  <div className="h-8 w-12 shrink-0 overflow-hidden rounded-nx-sm border border-nx-line bg-nx-ground">
                    <Image
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
                  <p className="truncate font-medium text-nx-ink">{logo.name}</p>
                  <p className="mt-0.5 truncate text-xs text-nx-ink-3">{logo.assetUrl}</p>
                  {logo.isRealData && (
                    <Badge variant="success" className="mt-0.5 px-1.5 py-0 text-[10px]">
                      {t("signupContent.customerLogos.isRealData")}
                    </Badge>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    onClick={() => vm.handleOpenEditLogo(logo)}
                    disabled={vm.isLogoRowBusy(logo.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("signupContent.customerLogos.edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    onClick={() => vm.handleDeleteLogo(logo.id)}
                    disabled={vm.isLogoRowBusy(logo.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    aria-label={t("signupContent.customerLogos.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
