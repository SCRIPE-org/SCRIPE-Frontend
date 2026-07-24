"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button, buttonVariants } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@core/ui/alert-dialog";

interface DangerZoneCardProps {
  isDeleting: boolean;
  onDelete: () => void;
}

/**
 * Presentation UI component rendering the danger zone card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DangerZoneCard({ isDeleting, onDelete }: DangerZoneCardProps) {
  const { t } = useI18n();

  return (
    <Card className="space-y-3 border-destructive/30 bg-destructive/5 p-4">
      <div>
        <h3 className="text-sm font-semibold text-destructive">{t("common.dangerZone")}</h3>
        <p className="mt-1 text-xs leading-normal text-nx-ink-2">{t("oauthApps.deleteWarning")}</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" loading={isDeleting} className="w-full">
            {!isDeleting && <Trash2 className="me-1.5 h-4 w-4" aria-hidden="true" />}
            {t("oauthApps.deleteButton")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("oauthApps.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("oauthApps.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={onDelete}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
