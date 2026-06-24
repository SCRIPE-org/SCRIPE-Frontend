import { Eye, LogIn, Pencil, Building2, ArrowUpCircle, Trash2 } from "lucide-react";
import { Button } from "@core/ui/button";
import type { TenantTreeNode } from "../../../domain/entities/Tenant";
import type { TenantStatus } from "./TenantNodeCardHeader";

interface TenantNodeCardActionsProps {
  node: TenantTreeNode;
  status: TenantStatus;
  compact: boolean;
  canViewDetails: boolean;
  canEnterTenantWorld: boolean;
  canDrillDown: boolean;
  canEdit_: boolean;
  canCreate: boolean;
  canDeleteTenant: boolean;
  onEdit?: (node: TenantTreeNode) => void;
  onDelete?: (node: TenantTreeNode) => void;
  onCreateChild?: (parentNode: TenantTreeNode) => void;
  onViewDetails: () => void;
  onEnterWorld: () => void;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the tenant node card actions.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantNodeCardActions({
  node,
  status,
  compact,
  canViewDetails,
  canEnterTenantWorld,
  canDrillDown,
  canEdit_,
  canCreate,
  canDeleteTenant,
  onEdit,
  onDelete,
  onCreateChild,
  onViewDetails,
  onEnterWorld,
  t,
}: TenantNodeCardActionsProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {/* View Details */}
      {canViewDetails && !compact && (
        <Button size="sm" onClick={onViewDetails}>
          <Eye className="me-1.5 h-4 w-4" />
          {t("common.view") || "View Details"}
        </Button>
      )}

      {/* Enter Tenant World */}
      {canEnterTenantWorld && canDrillDown && !compact && status !== "canceled" && (
        <Button
          size="sm"
          variant="outline"
          onClick={onEnterWorld}
          disabled={status === "suspended"}
        >
          <LogIn className="me-1.5 h-4 w-4" />
          {t("tenant.enterTenantWorld")}
        </Button>
      )}

      {/* Edit */}
      {canEdit_ && onEdit && (
        <Button size="sm" variant="ghost" onClick={() => onEdit(node)}>
          <Pencil className="me-1.5 h-4 w-4" />
          {t("tenant.edit")}
        </Button>
      )}

      {/* Add Child */}
      {canCreate && onCreateChild && (
        <Button size="sm" variant="ghost" onClick={() => onCreateChild(node)}>
          <Building2 className="me-1.5 h-4 w-4" />
          {t("tenant.addChild")}
        </Button>
      )}

      {/* Reassign Plan - for canceled/expired */}
      {(status === "canceled" || status === "expired") && canViewDetails && !compact && (
        <Button
          size="sm"
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
          onClick={onViewDetails}
        >
          <ArrowUpCircle className="me-1.5 h-4 w-4" />
          {t("tenant.reassignPlan")}
        </Button>
      )}

      {/* Delete */}
      {canDeleteTenant && onDelete && (
        <Button
          size="sm"
          variant="ghost"
          className="ms-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(node)}
        >
          <Trash2 className="me-1.5 h-4 w-4" />
          {t("common.delete") || "Delete"}
        </Button>
      )}
    </div>
  );
}
