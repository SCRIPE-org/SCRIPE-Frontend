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

export function TrustMarksSection({ vm }: TrustMarksSectionProps) {
  const { t } = useI18n();
  const marks = vm.content?.trustMarks ?? [];
  const isTrustMarkBusy =
    vm.isSavingTrustMark || vm.isDeletingTrustMark || vm.isReorderingTrustMarks;

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
            disabled={isTrustMarkBusy}
            className="h-7 gap-1.5 bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-500"
          >
            <Plus className="h-3 w-3" />
            {t("signupContent.trustMarks.add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {marks.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-600">
            {t("signupContent.trustMarks.empty")}
          </p>
        ) : (
          <div className="space-y-2">
            {marks.map((mark, idx) => (
              <div
                key={mark.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 transition-colors hover:border-zinc-700"
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    onClick={() => vm.handleMoveTrustMark(mark.id, "up")}
                    disabled={idx === 0 || isTrustMarkBusy}
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30"
                    aria-label={t("signupContent.trustMarks.reorder")}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => vm.handleMoveTrustMark(mark.id, "down")}
                    disabled={idx === marks.length - 1 || isTrustMarkBusy}
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30"
                    aria-label={t("signupContent.trustMarks.reorder")}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-white">{mark.labelEn}</span>
                    <span className="text-zinc-600">/</span>
                    <span className="truncate text-zinc-400" dir="rtl">
                      {mark.labelAr}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-zinc-700 px-1.5 py-0 text-[10px] text-zinc-500"
                    >
                      {mark.kind}
                    </Badge>
                    {mark.isRealData && (
                      <Badge
                        variant="outline"
                        className="border-emerald-700/40 px-1.5 py-0 text-[10px] text-emerald-500"
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
                    className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                    aria-label={t("signupContent.trustMarks.edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => vm.handleDeleteTrustMark(mark.id)}
                    disabled={isTrustMarkBusy}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:bg-red-950 hover:text-red-300 disabled:opacity-50"
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
