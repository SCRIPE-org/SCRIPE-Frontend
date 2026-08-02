"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { useI18n } from "@core/providers/i18n-provider";
import { Star, Plus, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { TrustMarkDialog } from "./TrustMarkDialog";
import type { useSignupContentViewModel } from "../viewmodels/useSignupContentViewModel";

type SignupContentViewModel = ReturnType<typeof useSignupContentViewModel>;

interface TrustMarksSectionProps {
  vm: SignupContentViewModel;
}

/**
 * Presentation UI component rendering the trust marks section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TrustMarksSection({ vm }: TrustMarksSectionProps) {
  const { t } = useI18n();
  const marks = vm.content?.trustMarks ?? [];
  const isTrustMarkBusy =
    vm.isSavingTrustMark || vm.isDeletingTrustMark || vm.isReorderingTrustMarks;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-info" aria-hidden="true" />
            {t("signupContent.trustMarks.title")}
          </CardTitle>
          <Button
            size="sm"
            onClick={vm.handleOpenAddTrustMark}
            disabled={isTrustMarkBusy}
            className="h-7 gap-1.5 px-3 text-xs"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            {t("signupContent.trustMarks.add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {marks.length === 0 ? (
          <EmptyState
            bare
            size="sm"
            icon={Star}
            title={t("signupContent.trustMarks.empty")}
            action={
              <Button size="sm" variant="outline" onClick={vm.handleOpenAddTrustMark}>
                <Plus className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {t("signupContent.trustMarks.add")}
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {marks.map((mark, idx) => (
              <div
                key={mark.id}
                className="flex items-center gap-3 rounded-nx-md border border-nx-line bg-nx-raised px-4 py-2.5 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi motion-reduce:transition-none"
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    onClick={() => vm.handleMoveTrustMark(mark.id, "up")}
                    disabled={idx === 0 || isTrustMarkBusy}
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    aria-label={t("signupContent.trustMarks.reorder")}
                  >
                    <ChevronUp className="h-3 w-3" aria-hidden="true" />
                  </Button>
                  <Button
                    onClick={() => vm.handleMoveTrustMark(mark.id, "down")}
                    disabled={idx === marks.length - 1 || isTrustMarkBusy}
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    aria-label={t("signupContent.trustMarks.reorder")}
                  >
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-nx-ink">{mark.labelEn}</span>
                    <span className="text-nx-ink-3">/</span>
                    <span className="truncate text-nx-ink-2" dir="rtl">
                      {mark.labelAr}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                      {mark.kind}
                    </Badge>
                    {mark.isRealData && (
                      <Badge variant="success" className="px-1.5 py-0 text-[10px]">
                        {t("signupContent.trustMarks.isRealData")}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    onClick={() => vm.handleOpenEditTrustMark(mark)}
                    disabled={isTrustMarkBusy}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("signupContent.trustMarks.edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    onClick={() => vm.handleDeleteTrustMark(mark.id)}
                    disabled={isTrustMarkBusy}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    aria-label={t("signupContent.trustMarks.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
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
