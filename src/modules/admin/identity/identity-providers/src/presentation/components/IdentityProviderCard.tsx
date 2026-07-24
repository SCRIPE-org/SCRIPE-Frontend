/**
 * Identity Provider Card
 *
 * Card for a configured SSO provider. Includes inline status toggling,
 * details, connection testing, and action menus.
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { IdentityProviderListItem } from "../../domain/entities/IdentityProvider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Switch } from "@core/ui/switch";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Shield,
  Users,
  Fingerprint,
  Zap,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/ui/alert-dialog";

interface Props {
  item: IdentityProviderListItem;
  onEdit: (item: IdentityProviderListItem) => void;
  onDelete: (item: IdentityProviderListItem) => void;
  onToggleActive: (item: IdentityProviderListItem) => void | Promise<any>;
  onTestConnection: (id: string) => void | Promise<any>;
  isTesting: boolean;
}

/**
 * Presentation UI component rendering the identity provider card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function IdentityProviderCard({
  item,
  onEdit,
  onDelete,
  onToggleActive,
  onTestConnection,
  isTesting,
}: Props) {
  const { t } = useI18n();
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // A provider without its own colour renders on the workspace accent instead
  // of a fixed hex — the accent is workspace-owned, never a fallback brand.
  const brandColor = item.buttonColor || null;

  // Protocol configuration styling
  const protocolStyles: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    oidc: {
      label: "OIDC",
      bg: "bg-info/10",
      text: "text-info",
      border: "border-info/20",
    },
    oauth2: {
      label: "OAuth 2.0",
      bg: "bg-success/10",
      text: "text-success",
      border: "border-success/20",
    },
    saml: {
      label: "SAML 2.0",
      bg: "bg-warning/10",
      text: "text-warning",
      border: "border-warning/20",
    },
  };

  const style = protocolStyles[item.protocol] || {
    label: item.protocol.toUpperCase(),
    bg: "bg-nx-raised",
    text: "text-nx-ink-2",
    border: "border-nx-line",
  };

  const handleToggle = async (_checked: boolean) => {
    try {
      setIsToggling(true);
      await onToggleActive(item);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-nx-lg border border-nx-line bg-nx-surface p-5 transition-[border-color] duration-nx-micro motion-reduce:transition-none hover:border-nx-line-hi">
        {/* Top Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Logo container with brand-colored background ring */}
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-md p-1.5",
                !brandColor &&
                  "border border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash"
              )}
              style={
                brandColor
                  ? {
                      backgroundColor: `${brandColor}12`,
                      border: `1px solid ${brandColor}25`,
                    }
                  : undefined
              }
            >
              {item.iconUrl ? (
                <img
                  src={item.iconUrl}
                  alt={item.name}
                  className="h-6 w-6 rounded object-contain"
                />
              ) : (
                <Fingerprint
                  className={cn("h-6 w-6", !brandColor && "text-nx-accent")}
                  style={brandColor ? { color: brandColor } : undefined}
                  aria-hidden="true"
                />
              )}
            </div>
            <div>
              <h4 className="line-clamp-1 text-sm font-semibold tracking-tight text-nx-ink">
                {item.name}
              </h4>
              <p className="mt-0.5 font-mono text-[11px] text-nx-ink-3">{item.slug}</p>
            </div>
          </div>

          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-nx-ink-3"
                aria-label={t("common.actions")}
              >
                <MoreVertical className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer gap-2">
                <Pencil className="h-4 w-4" aria-hidden="true" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onTestConnection(item.id)}
                disabled={isTesting}
                className="cursor-pointer gap-2"
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
                {t("identityProviders.test")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer gap-2 text-destructive hover:text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges/Details Row */}
        <div className="my-4 flex flex-wrap items-center gap-1.5">
          {/* Protocol Badge */}
          <Badge
            variant="outline"
            className={`h-5 border text-[10px] font-semibold uppercase ${style.bg} ${style.text} ${style.border}`}
          >
            {style.label}
          </Badge>

          {/* Admin Scope Badge */}
          {item.enabledForAdmins && (
            <Badge
              variant="outline"
              className="h-5 gap-1 border-nx-accent/30 bg-nx-accent-wash text-[10px] font-medium text-nx-accent"
            >
              <Shield className="h-3 w-3" aria-hidden="true" />
              {t("identityProviders.badgeAdmin")}
            </Badge>
          )}

          {/* User Scope Badge */}
          {item.enabledForUsers && (
            <Badge
              variant="outline"
              className="h-5 gap-1 border-info/30 bg-info/10 text-[10px] font-medium text-info"
            >
              <Users className="h-3 w-3" aria-hidden="true" />
              {t("identityProviders.badgeUser")}
            </Badge>
          )}
        </div>

        {/* Divider */}
        <div className="mb-4 h-px w-full bg-nx-line" />

        {/* Card Footer Controls */}
        <div className="flex items-center justify-between">
          {/* Connection Test Status Quick Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTestConnection(item.id)}
            disabled={isTesting}
            className="h-8 gap-1.5 px-2.5 text-xs text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"
          >
            {isTesting ? (
              <LoadingSpinner size="inline" showText={false} />
            ) : (
              <Zap className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
            )}
            {t("identityProviders.testConnection")}
          </Button>

          {/* Status Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-nx-ink-3">
              {item.isActive ? t("common.active") : t("common.inactive")}
            </span>
            <Switch
              checked={item.isActive}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              className="scale-90"
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("identityProviders.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("identityProviders.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(item);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
