// UI-EXCEPTION: compact studio layout
import { useState } from "react";
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
import {
  PermissionScopes,
  type PermissionAssignmentJson,
} from "../../domain/types/PermissionTypes";

/**
 * Interface defining property specifications, keys types, and structural contract rules for permission config dialog props.
 */
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

/**
 * Presentation UI component rendering the permission config dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PermissionConfigDialog({
  open,
  onOpenChange,
  permission,
  currentAssignment,
  onSave,
}: PermissionConfigDialogProps) {
  const { t } = useI18n(); // Removed unused language

  const [scope, setScope] = useState<string>(PermissionScopes.Default);
  const [restrictedFields, setRestrictedFields] = useState<string[]>([]);
  const [newField, setNewField] = useState("");

  // Initialize state from current assignment
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCurrentAssignment, setPrevCurrentAssignment] = useState(currentAssignment);
  if (open !== prevOpen || currentAssignment !== prevCurrentAssignment) {
    setPrevOpen(open);
    setPrevCurrentAssignment(currentAssignment);
    if (open) {
      setScope(currentAssignment?.scopeOverride || PermissionScopes.Default);
      setRestrictedFields(currentAssignment?.restrictedFields || []);
      setNewField("");
    }
  }

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
      scopeOverride: scope === PermissionScopes.Default ? undefined : scope,
      restrictedFields: restrictedFields.length > 0 ? restrictedFields : undefined,
    };
    onSave(assignment);
    onOpenChange(false);
  };

  // Scope Options - matching backend DataScope constants
  const scopeOptions = [
    { value: PermissionScopes.Default, label: t("role.scopeDefault") },
    { value: PermissionScopes.Own, label: t("role.scopeOwn") },
    { value: PermissionScopes.OwnTenant, label: t("role.scopeOwnTenant") },
    { value: PermissionScopes.Hierarchy, label: t("role.scopeHierarchy") },
    { value: PermissionScopes.AllTenants, label: t("role.scopeAllTenants") },
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
              {t("role.scopeOverride")}
              <Info className="h-3 w-3 text-nx-ink-3" />
            </Label>

            <GenericSelect
              type="single"
              options={scopeOptions}
              value={scope}
              onValueChange={(val: string | string[]) => setScope(val as string)}
              placeholder={t("role.selectScope")}
              className="w-full"
            />

            <p className="text-xs text-nx-ink-3">{t("role.scopeHint")}</p>
          </div>

          {/* Restricted Fields (Custom Tag Input) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">{t("role.restrictedFields")}</Label>
            <div className="flex gap-2">
              <Input
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                placeholder={t("role.enterField")}
                className="flex-1"
              />
              <Button type="button" size="icon" variant="secondary" onClick={handleAddField}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Tags List */}
            <div className="flex min-h-[2.5rem] flex-wrap gap-2 rounded-nx-md border border-nx-line bg-nx-hover p-2">
              {restrictedFields.length === 0 && (
                <span className="text-sm italic text-nx-ink-3">{t("role.noRestrictions")}</span>
              )}
              {restrictedFields.map((field) => (
                <Badge key={field} variant="secondary" className="gap-1 pe-1">
                  {field}
                  <button
                    onClick={() => handleRemoveField(field)}
                    className="rounded-full p-0.5 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-raised motion-reduce:transition-none"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-nx-ink-3">{t("role.restrictionHint")}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
