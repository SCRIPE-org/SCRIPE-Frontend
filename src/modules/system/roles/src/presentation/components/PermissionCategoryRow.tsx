/**
 * Permission Category Row Component
 *
 * Displays a single category of permissions with expand/collapse and selection.
 */
import { ChevronRight, ChevronDown, Settings, CheckCircle2 } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Checkbox } from "@core/ui/checkbox";
import type { Permission } from "@modules/system/permissions/src/domain/entities/Permission";

export interface PermissionCategoryRowProps {
      category: string;
      permissions: Permission[];
      isExpanded: boolean;
      selectedPermissions: Set<string>;
      categoryIcon?: React.ReactNode;
      language: string;
      onToggleCategory: () => void;
      onToggleAllInCategory: () => void;
      onTogglePermission: (id: string) => void;
}

export function PermissionCategoryRow({
      category,
      permissions,
      isExpanded,
      selectedPermissions,
      categoryIcon,
      language,
      onToggleCategory,
      onToggleAllInCategory,
      onTogglePermission,
}: PermissionCategoryRowProps) {
      const selectedCount = permissions.filter((p) => selectedPermissions.has(p.id)).length;
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
                                          isSelected={selectedPermissions.has(permission.id)}
                                          language={language}
                                          onToggle={() => onTogglePermission(permission.id)}
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
      language: string;
      onToggle: () => void;
}

function PermissionRow({ permission, isSelected, language, onToggle }: PermissionRowProps) {
      return (
            <label className="flex items-center gap-3 px-4 py-2 pl-14 hover:bg-muted/30 cursor-pointer transition-colors">
                  <Checkbox checked={isSelected} onCheckedChange={onToggle} />
                  <div className="flex-1">
                        <p className="font-medium text-sm flex items-center gap-2">
                              {permission.getLocalizedName(language)}
                              {isSelected && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{permission.code}</p>
                  </div>
            </label>
      );
}
