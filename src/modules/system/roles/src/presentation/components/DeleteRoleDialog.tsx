/**
 * Delete Role Confirm Dialog Component
 *
 * Confirmation dialog for deleting a role.
 */
import { Button } from "@core/ui/button";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
} from "@core/ui/dialog";
import { Loader2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { Role } from "../../domain/entities/Role";

export interface DeleteRoleDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      role: Role | null;
      onConfirm: () => void;
      isDeleting: boolean;
}

export function DeleteRoleDialog({
      open,
      onOpenChange,
      role,
      onConfirm,
      isDeleting,
}: DeleteRoleDialogProps) {
      const { t } = useI18n();

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-md">
                        <DialogHeader>
                              <DialogTitle>{t("common.confirmDelete")}</DialogTitle>
                              <DialogDescription>
                                    {t("roles.deleteConfirmation")} <strong>{role?.name}</strong>?
                              </DialogDescription>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">{t("common.deleteWarning")}</p>
                        <DialogFooter>
                              <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("common.delete")}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
