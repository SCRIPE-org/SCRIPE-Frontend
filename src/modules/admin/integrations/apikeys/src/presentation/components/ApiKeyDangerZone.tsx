"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@core/ui/alert-dialog";
import { ShieldAlert, Trash2, Ban } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { ApiKeyDetail } from "../../domain/entities/ApiKeyDetail";

interface ApiKeyDangerZoneProps {
  detail: ApiKeyDetail;
  onRevoke: () => void;
  onDeletePermanently: () => void;
  isRevoking: boolean;
}

export function ApiKeyDangerZone({ detail, onRevoke, onDeletePermanently, isRevoking }: ApiKeyDangerZoneProps) {
  const { t } = useI18n();
  const [confirmName, setConfirmName] = useState("");

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          {t("apikeys.dangerZone.title") || "Danger Zone"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Revoke */}
        <div className="flex items-start justify-between gap-4 rounded-lg border border-warning/30 bg-warning/10 p-4">
          <div>
            <p className="text-sm font-medium">{t("apikeys.dangerZone.revokeTitle") || "Revoke this key"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("apikeys.dangerZone.revokeDesc") || "Immediately invalidates this key. All requests using it will return 401. This can be undone by contacting support."}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 border-warning/40 text-warning hover:bg-warning/15" disabled={!detail.isActive || isRevoking}>
                <Ban className="h-3.5 w-3.5 mr-1.5" />
                {t("apikeys.revoke") || "Revoke"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("apikeys.revokeConfirmTitle") || "Revoke API Key?"}</AlertDialogTitle>
                <AlertDialogDescription>{t("apikeys.revokeConfirmDesc") || "Are you sure you want to revoke this API key? This action is immediate."}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
                <AlertDialogAction onClick={onRevoke} className="bg-warning text-warning-foreground hover:bg-warning/90">
                  {t("apikeys.revoke") || "Revoke Key"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Permanent Delete */}
        <div className="flex items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div>
            <p className="text-sm font-medium text-destructive">
              {t("apikeys.dangerZone.deleteTitle") || "Permanently delete this key"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("apikeys.dangerZone.deleteDesc") || "Deletes the key and ALL associated usage logs and stats. This CANNOT be undone."}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="shrink-0">
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {t("apikeys.dangerZone.deleteBtn") || "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  {t("apikeys.dangerZone.deleteConfirmTitle") || "Permanently Delete API Key?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("apikeys.dangerZone.deleteConfirmDesc") || "This will delete the key and all its logs permanently. Type the key name to confirm."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="px-1 space-y-2">
                <Label htmlFor="confirm-delete">{t("apikeys.dangerZone.typeToConfirm") || `Type "${detail.name}" to confirm`}</Label>
                <Input
                  id="confirm-delete"
                  value={confirmName}
                  onChange={e => setConfirmName(e.target.value)}
                  placeholder={detail.name}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmName("")}>
                  {t("common.cancel") || "Cancel"}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => { setConfirmName(""); onDeletePermanently(); }}
                  disabled={confirmName !== detail.name}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  {t("apikeys.dangerZone.deleteBtn") || "Delete Permanently"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
