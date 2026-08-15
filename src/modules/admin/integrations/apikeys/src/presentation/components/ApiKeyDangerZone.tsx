"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
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
import { ShieldAlert, Trash2, Ban } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { ApiKeyDetail } from "../../domain/entities/ApiKeyDetail";

interface ApiKeyDangerZoneProps {
  detail: ApiKeyDetail;
  onRevoke: () => void;
  onDeletePermanently: () => void;
  isRevoking: boolean;
  /** Gates the Revoke section — mirrors the backend's apikeys.delete requirement (Revoke is a DELETE-verb endpoint). */
  canRevoke: boolean;
  /** Gates the Permanent Delete section — mirrors the backend's apikeys.delete requirement. */
  canDeletePermanently: boolean;
}

export function ApiKeyDangerZone({
  detail,
  onRevoke,
  onDeletePermanently,
  isRevoking,
  canRevoke,
  canDeletePermanently,
}: ApiKeyDangerZoneProps) {
  const { t } = useI18n();
  const [confirmName, setConfirmName] = useState("");

  if (!canRevoke && !canDeletePermanently) return null;

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
          <ShieldAlert className="h-4 w-4" />
          {t("apikeys.dangerZone.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Revoke */}
        {canRevoke && (
          <div className="flex items-start justify-between gap-4 rounded-nx-md border border-warning/30 bg-warning/10 p-4">
            <div>
              <p className="text-sm font-medium">{t("apikeys.dangerZone.revokeTitle")}</p>
              <p className="mt-0.5 text-xs text-nx-ink-2">{t("apikeys.dangerZone.revokeDesc")}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-warning/40 text-warning hover:bg-warning/15"
                  disabled={!detail.isActive || isRevoking}
                >
                  <Ban className="me-1.5 h-3.5 w-3.5" />
                  {t("apikeys.revoke")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("apikeys.revokeConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("apikeys.revokeConfirmDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRevoke}
                    className="bg-warning text-warning-foreground hover:bg-warning/90"
                  >
                    {t("apikeys.revoke")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Permanent Delete */}
        {canDeletePermanently && (
          <div className="flex items-start justify-between gap-4 rounded-nx-md border border-destructive/30 bg-destructive/10 p-4">
            <div>
              <p className="text-sm font-medium text-destructive">
                {t("apikeys.dangerZone.deleteTitle")}
              </p>
              <p className="mt-0.5 text-xs text-nx-ink-2">{t("apikeys.dangerZone.deleteDesc")}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="shrink-0">
                  <Trash2 className="me-1.5 h-3.5 w-3.5" />
                  {t("apikeys.dangerZone.deleteBtn")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">
                    {t("apikeys.dangerZone.deleteConfirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("apikeys.dangerZone.deleteConfirmDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 px-1">
                  <Label htmlFor="confirm-delete">{t("apikeys.dangerZone.typeToConfirm")}</Label>
                  <Input
                    id="confirm-delete"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder={detail.name}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmName("")}>
                    {t("common.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setConfirmName("");
                      onDeletePermanently();
                    }}
                    disabled={confirmName !== detail.name}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    <Trash2 className="me-1.5 h-3.5 w-3.5" />
                    {t("apikeys.dangerZone.deleteBtn")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
