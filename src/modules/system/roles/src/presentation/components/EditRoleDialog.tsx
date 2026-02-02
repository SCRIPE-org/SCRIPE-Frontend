/**
 * Edit Role Dialog Component
 *
 * Dialog for editing an existing role.
 */
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
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

export interface EditRoleFormState {
      name: string;
      description: string;
      priority: number;
}

export interface EditRoleDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      role: Role | null;
      form: EditRoleFormState;
      onFormChange: (form: EditRoleFormState) => void;
      onSubmit: () => void;
      isSubmitting: boolean;
}

export function EditRoleDialog({
      open,
      onOpenChange,
      role,
      form,
      onFormChange,
      onSubmit,
      isSubmitting,
}: EditRoleDialogProps) {
      const { t } = useI18n();
      const isValid = form.name.trim() !== "";

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-md">
                        <DialogHeader>
                              <DialogTitle>{t("roles.editRole")}</DialogTitle>
                              <DialogDescription>
                                    {t("roles.editRoleDescription")} <strong>{role?.code}</strong>
                              </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                    <Label htmlFor="edit-name">{t("roles.name")} *</Label>
                                    <Input
                                          id="edit-name"
                                          value={form.name}
                                          onChange={(e) =>
                                                onFormChange({ ...form, name: e.target.value })
                                          }
                                    />
                              </div>
                              <div className="space-y-2">
                                    <Label htmlFor="edit-description">{t("roles.descriptionField")}</Label>
                                    <Textarea
                                          id="edit-description"
                                          value={form.description}
                                          onChange={(e) =>
                                                onFormChange({ ...form, description: e.target.value })
                                          }
                                    />
                              </div>
                              <div className="space-y-2">
                                    <Label htmlFor="edit-priority">{t("roles.priority")}</Label>
                                    <Input
                                          id="edit-priority"
                                          type="number"
                                          value={form.priority}
                                          onChange={(e) =>
                                                onFormChange({
                                                      ...form,
                                                      priority: parseInt(e.target.value) || 100,
                                                })
                                          }
                                    />
                              </div>
                        </div>
                        <DialogFooter>
                              <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button onClick={onSubmit} disabled={!isValid || isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("common.update")}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
