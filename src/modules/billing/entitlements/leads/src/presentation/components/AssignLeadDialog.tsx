"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { AssignableAdmin, AssignLeadParams } from "../../domain/interfaces/ILeadsRepository";
import type { PlatformLead } from "../../domain/entities/PlatformLead";
import { AlertCircle, UserMinus, UserPlus } from "lucide-react";

interface AssignLeadDialogProps {
  open: boolean;
  lead: PlatformLead | null;
  isAssigning: boolean;
  onClose: () => void;
  onAssign: (params: AssignLeadParams) => Promise<void>;
  onSearchAdmins: (query: string) => Promise<AssignableAdmin[]>;
}

/**
 * Presentation UI component rendering the assign lead dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AssignLeadDialog({
  open,
  lead,
  isAssigning,
  onClose,
  onAssign,
  onSearchAdmins,
}: AssignLeadDialogProps) {
  const { t } = useI18n();

  const [adminId, setAdminId] = useState("");
  const [note, setNote] = useState("");
  const [unassign, setUnassign] = useState(false);

  const isCurrentlyAssigned = !!lead?.assignedToAdminId;

  const toAdminOption = (admin: AssignableAdmin): GenericSelectOption => ({
    value: admin.id,
    label: admin.username,
    description: [
      admin.displayName,
      admin.email,
      admin.tenantName || (admin.isPlatformAdmin ? t("leads.assignDialog.platformScope") : ""),
    ]
      .filter(Boolean)
      .join(" - "),
  });

  const handleAdminSearch = async (query: string): Promise<GenericSelectOption[]> => {
    const admins = await onSearchAdmins(query);
    return admins.map(toAdminOption);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onAssign({
      adminId: unassign ? undefined : adminId.trim() || undefined,
      note: note.trim() || undefined,
    });
    reset();
  };

  const reset = () => {
    setAdminId("");
    setNote("");
    setUnassign(false);
  };

  const handleClose = () => {
    if (isAssigning) return;
    reset();
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isAssigning) handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10">
              <UserPlus className="h-5 w-5 text-info" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle>{t("leads.assignDialog.title")}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {t("leads.assignDialog.subtitle")}
              </DialogDescription>
            </div>
          </div>

          {lead && (
            <div className="mt-2 rounded-nx-md border border-nx-line bg-nx-raised px-4 py-3">
              <p className="text-sm font-medium text-nx-ink">{lead.companyName}</p>
              <p className="text-xs text-nx-ink-2">
                {lead.contactName} - {lead.email}
              </p>
              {isCurrentlyAssigned && (
                <p className="mt-1 text-xs text-warning">
                  {t("leads.assignDialog.currentlyAssigned")}
                </p>
              )}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {isCurrentlyAssigned && (
            <button
              type="button"
              onClick={() => setUnassign((value) => !value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-nx-md border px-4 py-3 text-start",
                "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:shadow-nx-focus",
                unassign
                  ? "border-warning/60 bg-warning/10 text-warning"
                  : "border-nx-line bg-nx-raised text-nx-ink-2 hover:bg-nx-hover"
              )}
            >
              <UserMinus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">{t("leads.assignDialog.unassign")}</span>
            </button>
          )}

          {!unassign && (
            <div className="space-y-1.5">
              <Label htmlFor="assign-admin-id">{t("leads.assignDialog.adminId")}</Label>
              <GenericSelect
                id="assign-admin-id"
                type="searchable"
                searchType="server"
                options={[]}
                value={adminId}
                onValueChange={(value: string | string[]) =>
                  setAdminId(Array.isArray(value) ? value[0] || "" : value)
                }
                placeholder={t("leads.assignDialog.adminPlaceholder")}
                searchPlaceholder={t("leads.assignDialog.adminSearchPlaceholder")}
                noResultsText={t("leads.assignDialog.noAdminsFound")}
                searchingText={t("leads.assignDialog.searchingAdmins")}
                onServerSearch={handleAdminSearch}
                disabled={isAssigning}
                allowClear
              />
              <div className="flex items-start gap-1.5 text-xs leading-relaxed text-nx-ink-3">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <p>{t("leads.assignDialog.adminIdHint")}</p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="assign-note">{t("leads.assignDialog.note")}</Label>
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
            <Button type="button" variant="outline" onClick={handleClose} disabled={isAssigning}>
              {t("leads.assignDialog.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isAssigning || (!unassign && !adminId.trim())}
              loading={isAssigning}
              className={cn(
                "gap-2",
                unassign
                  ? "bg-warning text-warning-foreground hover:bg-warning/90"
                  : "bg-info text-info-foreground hover:bg-info/90"
              )}
            >
              {isAssigning ? (
                t("leads.assignDialog.assigning")
              ) : unassign ? (
                <>
                  <UserMinus className="h-4 w-4" aria-hidden="true" />
                  {t("leads.assignDialog.unassign")}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
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
