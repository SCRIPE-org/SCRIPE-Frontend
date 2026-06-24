"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
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

export function DangerZoneCard({ isDeleting, onDelete }: DangerZoneCardProps) {
  const { t } = useI18n();

  return (
    <Card className="space-y-3 border border-red-200 bg-red-50/30 p-4 dark:border-red-900/50 dark:bg-red-950/10">
      <div>
        <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
          {t("common.dangerZone") || "Danger Zone"}
        </h3>
        <p className="mt-1 text-xs leading-normal text-red-600/80 dark:text-red-400/70">
          {t("oauthApps.deleteWarning") ||
            "Deleting this application will revoke all tokens and break existing integrations. This cannot be undone."}
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" loading={isDeleting} className="w-full">
            {!isDeleting && <Trash2 className="me-1.5 h-4 w-4" />}
            {t("oauthApps.deleteButton") || "Delete Application"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("oauthApps.deleteConfirmTitle") || "Delete OAuth Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("oauthApps.deleteConfirmDesc") ||
                "This will permanently delete this OAuth application, revoke all active tokens, and break all existing integrations. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 font-semibold text-white hover:bg-red-700"
            >
              {t("common.delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
