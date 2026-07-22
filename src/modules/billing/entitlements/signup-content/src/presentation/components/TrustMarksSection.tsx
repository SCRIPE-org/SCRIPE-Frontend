"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
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
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Star className="h-4 w-4 text-info" />
            {t("signupContent.trustMarks.title")}
          </CardTitle>
          <Button
            size="sm"
            onClick={vm.handleOpenAddTrustMark}
            disabled={isTrustMarkBusy}
            className="h-7 gap-1.5 bg-info px-3 text-xs text-info-foreground hover:bg-info/90"
          >
            <Plus className="h-3 w-3" />
            {t("signupContent.trustMarks.add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {marks.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t("signupContent.trustMarks.empty")}
          </p>
        ) : (
          <div className="space-y-2">
            {marks.map((mark, idx) => (
              <div
                key={mark.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 transition-colors hover:border-border/90"
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    onClick={() => vm.handleMoveTrustMark(mark.id, "up")}
                    disabled={idx === 0 || isTrustMarkBusy}
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    aria-label={t("signupContent.trustMarks.reorder")}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => vm.handleMoveTrustMark(mark.id, "down")}
                    disabled={idx === marks.length - 1 || isTrustMarkBusy}
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    aria-label={t("signupContent.trustMarks.reorder")}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground">{mark.labelEn}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="truncate text-muted-foreground" dir="rtl">
                      {mark.labelAr}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-border px-1.5 py-0 text-[10px] text-muted-foreground"
                    >
                      {mark.kind}
                    </Badge>
                    {mark.isRealData && (
                      <Badge
                        variant="outline"
                        className="border-success/40 px-1.5 py-0 text-[10px] text-success"
                      >
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
                    className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={t("signupContent.trustMarks.edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => vm.handleDeleteTrustMark(mark.id)}
                    disabled={isTrustMarkBusy}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-destructive disabled:opacity-50"
                    aria-label={t("signupContent.trustMarks.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
