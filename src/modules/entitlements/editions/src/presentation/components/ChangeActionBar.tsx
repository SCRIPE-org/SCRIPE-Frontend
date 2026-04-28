/**
 * ChangeActionBar — Sticky bottom bar + Save-as-Version + Direct-Apply dialogs.
 *
 * Appears when the edition has unsaved feature/policy changes.
 */
"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Textarea } from "@core/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Undo2, Bolt, GitBranch, Zap } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

interface ChangeActionBarProps {
  modifiedCount: number;
  isCreatingVersion: boolean;
  isDirectApplying: boolean;
  createVersionWithChanges: (notes?: string) => void;
  directApplyChanges: () => void;
  discardChanges: () => void;
}

export function ChangeActionBar({
  modifiedCount,
  isCreatingVersion,
  isDirectApplying,
  createVersionWithChanges,
  directApplyChanges,
  discardChanges,
}: ChangeActionBarProps) {
  const { t } = useI18n();
  const isBusy = isCreatingVersion || isDirectApplying;

  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [versionNotes, setVersionNotes] = useState("");
  const [showDirectApplyDialog, setShowDirectApplyDialog] = useState(false);

  const handleCreateVersion = () => {
    createVersionWithChanges(versionNotes || undefined);
    setShowVersionDialog(false);
    setVersionNotes("");
  };

  const handleDirectApply = () => {
    directApplyChanges();
    setShowDirectApplyDialog(false);
  };

  return (
    <>
      {/* ═══════ STICKY BOTTOM ACTION BAR ═══════ */}
      <div className="fixed bottom-0 inset-x-0 z-50">
        <div className="border-t bg-background/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: change indicator */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {t("entitlements.editions.pendingChanges")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("entitlements.editions.pendingChangesCount", { count: modifiedCount })}
                  </p>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={discardChanges} disabled={isBusy}>
                  <Undo2 className="h-4 w-4 me-1" />
                  {t("common.discard")}
                </Button>

                <Button variant="outline" size="sm" onClick={() => setShowDirectApplyDialog(true)} disabled={isBusy} loading={isDirectApplying}>
                  {!isDirectApplying && <Bolt className="h-4 w-4 me-1" />}
                  {t("entitlements.editions.directApply")}
                </Button>

                <Button size="sm" onClick={() => setShowVersionDialog(true)} disabled={isBusy} loading={isCreatingVersion} className="gradient-primary">
                  {!isCreatingVersion && <GitBranch className="h-4 w-4 me-1" />}
                  {t("entitlements.editions.saveAsVersion")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ SAVE AS VERSION DIALOG ═══════ */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              {t("entitlements.editions.saveAsVersion")}
            </DialogTitle>
            <DialogDescription>
              {t("entitlements.editions.saveAsVersionDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t("entitlements.editions.versionNotesLabel")}
              </label>
              <Textarea
                placeholder={t("entitlements.editions.versions.changeNotesPlaceholder")}
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
              <Zap className="h-3.5 w-3.5 shrink-0" />
              <span>{t("entitlements.editions.pendingChangesCount", { count: modifiedCount })}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowVersionDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreateVersion} disabled={isBusy} loading={isCreatingVersion} className="gradient-primary">
              {!isCreatingVersion && <GitBranch className="h-4 w-4 me-1" />}
              {t("entitlements.editions.createAndPublish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ DIRECT APPLY CONFIRMATION DIALOG ═══════ */}
      <Dialog open={showDirectApplyDialog} onOpenChange={setShowDirectApplyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Bolt className="h-5 w-5" />
              {t("entitlements.editions.directApplyConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("entitlements.editions.directApplyConfirmDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-md p-2.5">
            <Bolt className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>{t("entitlements.editions.pendingChangesCount", { count: modifiedCount })}</span>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDirectApplyDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDirectApply} disabled={isBusy} loading={isDirectApplying}>
              {!isDirectApplying && <Bolt className="h-4 w-4 me-1" />}
              {t("entitlements.editions.applyNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
