/**
 * Role Detail View Header Component
 *
 * Header with back button, role title, and save action.
 */
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import type { Role } from "../../domain/entities/Role";

export interface RoleDetailHeaderProps {
      role: Role | undefined;
      isLoading: boolean;
      isSaving: boolean;
      onBack: () => void;
      onSave: () => void;
      t: (key: string) => string;
}

export function RoleDetailHeader({
      role,
      isLoading,
      isSaving,
      onBack,
      onSave,
      t,
}: RoleDetailHeaderProps) {
      return (
            <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex-1">
                        <h1 className="text-3xl font-bold">
                              {isLoading ? <Skeleton className="h-9 w-48" /> : role?.name}
                        </h1>
                        <p className="text-muted-foreground">
                              {isLoading ? <Skeleton className="h-5 w-32 mt-1" /> : role?.code}
                        </p>
                  </div>
                  <Button onClick={onSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? t("common.saving") : t("common.saveChanges")}
                  </Button>
            </div>
      );
}
