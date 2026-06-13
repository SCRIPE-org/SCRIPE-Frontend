"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { useI18n } from "@core/providers/i18n-provider";
import type { AssignLeadParams } from "../../domain/interfaces/ILeadsRepository";
import type { PlatformLead } from "../../domain/entities/PlatformLead";
import { Loader2, UserPlus, UserMinus, AlertCircle } from "lucide-react";

// ── Props ─────────────────────────────────────────────────────────────────────

interface AssignLeadDialogProps {
  open: boolean;
  lead: PlatformLead | null;
  isAssigning: boolean;
  onClose: () => void;
  onAssign: (params: AssignLeadParams) => Promise<void>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AssignLeadDialog({
  open,
  lead,
  isAssigning,
  onClose,
  onAssign,
}: AssignLeadDialogProps) {
  const { t } = useI18n();

  const [adminId, setAdminId]   = useState("");
  const [note, setNote]         = useState("");
  const [unassign, setUnassign] = useState(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  const isCurrentlyAssigned = !!lead?.assignedToAdminId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAssign({
      adminId: unassign ? undefined : adminId.trim() || undefined,
      note:    note.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (isAssigning) return;
    setAdminId("");
    setNote("");
    setUnassign(false);
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isAssigning) handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <DialogTitle>{t("leads.assignDialog.title")}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {t("leads.assignDialog.subtitle")}
              </DialogDescription>
            </div>
          </div>

          {/* Lead context pill */}
          {lead && (
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 mt-2">
              <p className="text-sm font-medium">{lead.companyName}</p>
              <p className="text-xs text-muted-foreground">
                {lead.contactName} · {lead.email}
              </p>
              {isCurrentlyAssigned && (
                <p className="text-xs text-amber-500 mt-1">
                  {t("leads.assignDialog.currentlyAssigned")}
                </p>
              )}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">

          {/* Unassign toggle */}
          {isCurrentlyAssigned && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setUnassign((v) => !v)}
              onKeyDown={(e) => e.key === "Enter" && setUnassign((v) => !v)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors
                ${unassign
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"}`}
            >
              <UserMinus className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">
                {t("leads.assignDialog.unassign")}
              </span>
            </div>
          )}

          {/* Admin ID input — hidden when unassigning */}
          {!unassign && (
            <div className="space-y-1.5">
              <Label htmlFor="assign-admin-id">
                {t("leads.assignDialog.adminId")}
              </Label>
              <Input
                id="assign-admin-id"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder={t("leads.assignDialog.adminPlaceholder")}
                disabled={isAssigning}
                autoComplete="off"
                spellCheck={false}
              />
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>{t("leads.assignDialog.adminIdHint")}</p>
              </div>
            </div>
          )}

          {/* Optional note */}
          <div className="space-y-1.5">
            <Label htmlFor="assign-note">
              {t("leads.assignDialog.note")}
            </Label>
            <Textarea
              id="assign-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("leads.assignDialog.notePlaceholder")}
              disabled={isAssigning}
              rows={2}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isAssigning}
            >
              {t("leads.assignDialog.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isAssigning || (!unassign && !adminId.trim())}
              className={`gap-2 ${
                unassign
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("leads.assignDialog.assigning")}
                </>
              ) : unassign ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  {t("leads.assignDialog.unassign")}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {t("leads.assignDialog.assign")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
