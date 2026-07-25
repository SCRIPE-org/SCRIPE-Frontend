/**
 * ChangeActionBar — Sticky bottom bar + Save-as-Version + Direct-Apply dialogs.
 *
 * Appears when the edition has unsaved feature/policy changes.
 */
"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
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

/**
 * Presentation UI component rendering the change action bar.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
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
      <div className="fixed inset-x-0 bottom-0 z-sticky">
        <div className="border-t bg-background/95 shadow-nx-bar-top backdrop-blur-md">
          <div className="mx-auto max-w-screen-xl px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              {/* Left: change indicator */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-2 w-2 shrink-0 rounded-full bg-warning" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t("entitlements.editions.pendingChanges")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("entitlements.editions.pendingChangesCount", { count: modifiedCount })}
                  </p>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="ghost" size="sm" onClick={discardChanges} disabled={isBusy}>
                  <Undo2 className="me-1 h-4 w-4" />
                  {t("common.discard")}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDirectApplyDialog(true)}
                  disabled={isBusy}
                  loading={isDirectApplying}
                >
                  {!isDirectApplying && <Bolt className="me-1 h-4 w-4" />}
                  {t("entitlements.editions.directApply")}
                </Button>

                <Button
                  size="sm"
                  onClick={() => setShowVersionDialog(true)}
                  disabled={isBusy}
                  loading={isCreatingVersion}
                >
                  {!isCreatingVersion && <GitBranch className="me-1 h-4 w-4" />}
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
            <DialogDescription>{t("entitlements.editions.saveAsVersionDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("entitlements.editions.versionNotesLabel")}
              </Label>
              <Textarea
                placeholder={t("entitlements.editions.versions.changeNotesPlaceholder")}
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 shrink-0" />
              <span>
                {t("entitlements.editions.pendingChangesCount", { count: modifiedCount })}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowVersionDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreateVersion}
              disabled={isBusy}
              loading={isCreatingVersion}
            >
              {!isCreatingVersion && <GitBranch className="me-1 h-4 w-4" />}
              {t("entitlements.editions.createAndPublish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ DIRECT APPLY CONFIRMATION DIALOG ═══════ */}
      <Dialog open={showDirectApplyDialog} onOpenChange={setShowDirectApplyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <Bolt className="h-5 w-5" />
              {t("entitlements.editions.directApplyConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("entitlements.editions.directApplyConfirmDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border border-warning/20 bg-warning/5 p-2.5 text-xs text-muted-foreground">
            <Bolt className="h-3.5 w-3.5 shrink-0 text-warning" />
            <span>{t("entitlements.editions.pendingChangesCount", { count: modifiedCount })}</span>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDirectApplyDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDirectApply}
              disabled={isBusy}
              loading={isDirectApplying}
            >
              {!isDirectApplying && <Bolt className="me-1 h-4 w-4" />}
              {t("entitlements.editions.applyNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
