/**
 * Create Role Dialog Component
 *
 * Dialog for creating a new role.
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

export interface CreateRoleFormState {
      name: string;
      code: string;
      description: string;
      priority: number;
}

export interface CreateRoleDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      form: CreateRoleFormState;
      onFormChange: (form: CreateRoleFormState) => void;
      onSubmit: () => void;
      isSubmitting: boolean;
}

export function CreateRoleDialog({
      open,
      onOpenChange,
      form,
      onFormChange,
      onSubmit,
      isSubmitting,
}: CreateRoleDialogProps) {
      const { t } = useI18n();
      const isValid = form.name.trim() !== "" && form.code.trim() !== "";

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-md">
                        <DialogHeader>
                              <DialogTitle>{t("roles.createRole")}</DialogTitle>
                              <DialogDescription>{t("roles.createRoleDescription")}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                    <Label htmlFor="create-name">{t("roles.name")} *</Label>
                                    <Input
                                          id="create-name"
                                          placeholder={t("roles.namePlaceholder")}
                                          value={form.name}
                                          onChange={(e) =>
                                                onFormChange({ ...form, name: e.target.value })
                                          }
                                    />
                              </div>
                              <div className="space-y-2">
                                    <Label htmlFor="create-code">{t("roles.code")} *</Label>
                                    <Input
                                          id="create-code"
                                          placeholder={t("roles.codePlaceholder")}
                                          value={form.code}
                                          onChange={(e) =>
                                                onFormChange({
                                                      ...form,
                                                      code: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                                                })
                                          }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                          {t("roles.codeHint")}
                                    </p>
                              </div>
                              <div className="space-y-2">
                                    <Label htmlFor="create-description">{t("roles.descriptionField")}</Label>
                                    <Textarea
                                          id="create-description"
                                          placeholder={t("roles.descriptionPlaceholder")}
                                          value={form.description}
                                          onChange={(e) =>
                                                onFormChange({ ...form, description: e.target.value })
                                          }
                                    />
                              </div>
                              <div className="space-y-2">
                                    <Label htmlFor="create-priority">{t("roles.priority")}</Label>
                                    <Input
                                          id="create-priority"
                                          type="number"
                                          value={form.priority}
                                          onChange={(e) =>
                                                onFormChange({
                                                      ...form,
                                                      priority: parseInt(e.target.value) || 100,
                                                })
                                          }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                          {t("roles.priorityHint")}
                                    </p>
                              </div>
                        </div>
                        <DialogFooter>
                              <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button onClick={onSubmit} disabled={!isValid || isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("common.create")}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
