/**
 * Permission Category Row Component
 *
 * Displays a single category of permissions with expand/collapse and selection.
 * Uses permission CODES for selection matching (not IDs) since backend returns
 * different encrypted IDs for different endpoints.
 */
import { useState } from "react";
import { ChevronRight, ChevronDown, Settings, CheckCircle2 } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Checkbox } from "@core/ui/checkbox";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type { Permission } from "@modules/system/permissions/src/domain/entities/Permission";
import { PermissionConfigDialog } from "./PermissionConfigDialog";
import type { PermissionAssignmentJson } from "../../data/models/RoleModel";


export interface PermissionCategoryRowProps {
      category: string;
      permissions: Permission[];
      isExpanded: boolean;
      selectedPermissionCodes: Set<string>;
      assignments?: Map<string, PermissionAssignmentJson>;
      categoryIcon?: React.ReactNode;
      onToggleCategory: () => void;
      onToggleAllInCategory: () => void;
      onTogglePermission: (code: string) => void;
      onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

export function PermissionCategoryRow({
      category,
      permissions,
      isExpanded,
      selectedPermissionCodes,
      assignments,
      categoryIcon,
      onToggleCategory,
      onToggleAllInCategory,
      onTogglePermission,
      onUpdateConfig,
}: PermissionCategoryRowProps) {
      // Used only for re-rendering on language change if needed, but PermissionRow handles it
      useI18n();

      // Match by CODE instead of ID
      const selectedCount = permissions.filter((p) => selectedPermissionCodes.has(p.code)).length;
      const allSelected = selectedCount === permissions.length;
      const someSelected = selectedCount > 0 && selectedCount < permissions.length;

      return (
            <div className="border rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <div
                        className="flex items-center gap-3 px-4 py-3 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={onToggleCategory}
                  >
                        <Checkbox
                              checked={allSelected}
                              onCheckedChange={onToggleAllInCategory}
                              onClick={(e) => e.stopPropagation()}
                              className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                        />
                        {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                        ) : (
                              <ChevronRight className="h-4 w-4" />
                        )}
                        {categoryIcon || <Settings className="h-4 w-4" />}
                        <span className="font-medium flex-1">{category}</span>
                        <Badge variant={allSelected ? "default" : "secondary"}>
                              {selectedCount}/{permissions.length}
                        </Badge>
                  </div>

                  {/* Permissions List */}
                  {isExpanded && (
                        <div className="divide-y">
                              {permissions.map((permission) => (
                                    <PermissionRow
                                          key={permission.id}
                                          permission={permission}
                                          isSelected={selectedPermissionCodes.has(permission.code)}
                                          assignment={assignments?.get(permission.code)}
                                          onToggle={() => onTogglePermission(permission.code)}
                                          onUpdateConfig={onUpdateConfig}
                                    />
                              ))}
                        </div>
                  )}
            </div>
      );
}


interface PermissionRowProps {
      permission: Permission;
      isSelected: boolean;
      assignment?: PermissionAssignmentJson;
      onToggle: () => void;
      onUpdateConfig?: (code: string, assignment: PermissionAssignmentJson) => void;
}

function PermissionRow({
      permission,
      isSelected,
      onToggle,
      assignment,
      onUpdateConfig
}: PermissionRowProps) {
      const { language } = useI18n();
      const [showConfig, setShowConfig] = useState(false);

      const hasCustomConfig = !!assignment?.scopeOverride || (assignment?.restrictedFields?.length ?? 0) > 0;

      return (
            <div className="flex items-center gap-2 group hover:bg-muted/30 transition-colors pr-2">
                  <label className="flex-1 flex items-center gap-3 px-4 py-2 pl-14 cursor-pointer">
                        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
                        <div className="flex-1">
                              <p className="font-medium text-sm flex items-center gap-2">
                                    {permission.getLocalizedName(language)}
                                    {isSelected && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                    {hasCustomConfig && (
                                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-200">
                                                Custom
                                          </span>
                                    )}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">{permission.code}</p>
                        </div>
                  </label>

                  {/* Config Button - Only visible when checked */}
                  {isSelected && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 ${hasCustomConfig ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}`}
                                    onClick={() => setShowConfig(true)}
                              >
                                    <Settings className="h-4 w-4" />
                              </Button>
                        </div>
                  )}

                  {showConfig && (
                        <PermissionConfigDialog
                              open={showConfig}
                              onOpenChange={setShowConfig}
                              permission={{
                                    id: permission.id,
                                    code: permission.code,
                                    displayName: permission.getLocalizedName(language),
                              }}
                              currentAssignment={assignment}
                              onSave={(newAssignment) => onUpdateConfig?.(permission.code, newAssignment)}
                        />
                  )}
            </div>
      );
}
