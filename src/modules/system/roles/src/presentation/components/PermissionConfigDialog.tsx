import { useState, useEffect } from "react";
import { X, Plus, Info } from "lucide-react";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select"; // Updated import
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { PermissionAssignmentJson } from "../../data/models/RoleModel";

export interface PermissionConfigDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      permission: {
            id: string;
            code: string;
            displayName: string;
      };
      currentAssignment?: PermissionAssignmentJson;
      onSave: (assignment: PermissionAssignmentJson) => void;
}

export function PermissionConfigDialog({
      open,
      onOpenChange,
      permission,
      currentAssignment,
      onSave,
}: PermissionConfigDialogProps) {
      const { t } = useI18n(); // Removed unused language

      const [scope, setScope] = useState<string>("default");
      const [restrictedFields, setRestrictedFields] = useState<string[]>([]);
      const [newField, setNewField] = useState("");

      // Initialize state from current assignment
      useEffect(() => {
            if (open) {
                  setScope(currentAssignment?.scopeOverride || "default");
                  setRestrictedFields(currentAssignment?.restrictedFields || []);
                  setNewField("");
            }
      }, [open, currentAssignment]);

      const handleAddField = () => {
            const trimmed = newField.trim();
            if (trimmed && !restrictedFields.includes(trimmed)) {
                  setRestrictedFields([...restrictedFields, trimmed]);
                  setNewField("");
            }
      };

      const handleRemoveField = (field: string) => {
            setRestrictedFields(restrictedFields.filter((f) => f !== field));
      };

      const handleSave = () => {
            const assignment: PermissionAssignmentJson = {
                  permissionId: permission.id,
                  scopeOverride: scope === "default" ? undefined : scope,
                  restrictedFields: restrictedFields.length > 0 ? restrictedFields : undefined,
            };
            onSave(assignment);
            onOpenChange(false);
      };

      // Scope Options
      const scopeOptions = [
            { value: "default", label: t("role.scopeDefault") || "Default (None)" },
            { value: "Self", label: t("role.scopeSelf") || "Self Only" },
            { value: "Tenant", label: t("role.scopeTenant") || "Tenant Level" },
            { value: "Global", label: t("role.scopeGlobal") || "Global (All Tenants)" },
      ];

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                              <DialogTitle>{t("permission.configure")}</DialogTitle>
                              <DialogDescription>
                                    {permission.displayName} ({permission.code})
                              </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                              {/* Scope Override using GenericSelect */}
                              <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                          {t("role.scopeOverride") || "Scope Override"}
                                          <Info className="h-3 w-3 text-muted-foreground" />
                                    </Label>

                                    <GenericSelect
                                          type="single"
                                          options={scopeOptions}
                                          value={scope}
                                          onValueChange={(val: string | string[]) => setScope(val as string)}
                                          placeholder={t("role.selectScope") || "Select Scope"}
                                          className="w-full"
                                    />

                                    <p className="text-xs text-muted-foreground">
                                          {t("role.scopeHint") || "Overrides the default data access scope for this permission."}
                                    </p>
                              </div>

                              {/* Restricted Fields (Custom Tag Input) */}
                              <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                          {t("role.restrictedFields") || "Restricted Fields"}
                                    </Label>
                                    <div className="flex gap-2">
                                          <Input
                                                value={newField}
                                                onChange={(e) => setNewField(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                                                placeholder={t("role.enterField") || "e.g. Salary, SSN"}
                                                className="flex-1"
                                          />
                                          <Button type="button" size="icon" variant="secondary" onClick={handleAddField}>
                                                <Plus className="h-4 w-4" />
                                          </Button>
                                    </div>

                                    {/* Tags List */}
                                    <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md bg-muted/20">
                                          {restrictedFields.length === 0 && (
                                                <span className="text-sm text-muted-foreground italic">
                                                      {t("role.noRestrictions") || "No field restrictions"}
                                                </span>
                                          )}
                                          {restrictedFields.map((field) => (
                                                <Badge key={field} variant="secondary" className="gap-1 pr-1">
                                                      {field}
                                                      <button
                                                            onClick={() => handleRemoveField(field)}
                                                            className="hover:bg-muted rounded-full p-0.5"
                                                            type="button"
                                                      >
                                                            <X className="h-3 w-3" />
                                                      </button>
                                                </Badge>
                                          ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                          {t("role.restrictionHint") || "Specific API fields to hide from the user."}
                                    </p>
                              </div>
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button onClick={handleSave}>
                                    {t("common.save") || "Save Configuration"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
