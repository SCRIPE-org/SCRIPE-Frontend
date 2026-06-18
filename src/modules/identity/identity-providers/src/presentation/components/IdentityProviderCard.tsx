/**
 * Identity Provider Card
 *
 * High-fidelity, glassmorphic card for configured SSO providers.
 * Includes inline status toggling, details, connection testing, and action menus.
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import type { IdentityProviderListItem } from "../../domain/entities/IdentityProvider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Switch } from "@core/ui/switch";
import {
  Shield,
  Users,
  Fingerprint,
  Zap,
  Pencil,
  Trash2,
  MoreVertical,
  Loader2,
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

  // Parse color and resolve default if empty
  const brandColor = item.buttonColor || "#4F46E5";

  // Protocol configuration styling
  const protocolStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
    oidc: {
      label: "OIDC",
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/20",
    },
    oauth2: {
      label: "OAuth 2.0",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
    },
    saml: {
      label: "SAML 2.0",
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
    },
  };

  const style = protocolStyles[item.protocol] || {
    label: item.protocol.toUpperCase(),
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  };

  const handleToggle = async (checked: boolean) => {
    try {
      setIsToggling(true);
      await onToggleActive(item);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col justify-between rounded-xl border border-border/80 bg-card/65 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 dark:hover:border-primary/30 group">
        {/* Brand Top Highlight Stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl opacity-80"
          style={{ backgroundColor: brandColor }}
        />

        {/* Top Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Logo container with brand-colored background ring */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-1.5 transition-all duration-300 group-hover:scale-105"
              style={{
                backgroundColor: `${brandColor}12`,
                border: `1px solid ${brandColor}25`,
              }}
            >
              {item.iconUrl ? (
                <img src={item.iconUrl} alt={item.name} className="h-6 w-6 rounded object-contain" />
              ) : (
                <Fingerprint className="h-6 w-6" style={{ color: brandColor }} />
              )}
            </div>
            <div>
              <h4 className="font-semibold tracking-tight text-sm text-foreground line-clamp-1">
                {item.name}
              </h4>
              <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                {item.slug}
              </p>
            </div>
          </div>

          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer gap-2">
                <Pencil className="h-4 w-4" />
                {t("common.edit") || "Edit Config"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onTestConnection(item.id)}
                disabled={isTesting}
                className="cursor-pointer gap-2"
              >
                <Zap className="h-4 w-4" />
                {t("identityProviders.test") || "Test Connection"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer gap-2 text-red-600 hover:text-red-700 dark:text-red-400 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                {t("common.delete") || "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges/Details Row */}
        <div className="my-4 flex flex-wrap gap-1.5 items-center">
          {/* Protocol Badge */}
          <Badge
            variant="outline"
            className={`h-5 text-[10px] uppercase font-semibold border ${style.bg} ${style.text} ${style.border}`}
          >
            {style.label}
          </Badge>

          {/* Admin Scope Badge */}
          {item.enabledForAdmins && (
            <Badge
              variant="outline"
              className="h-5 gap-1 border-violet-200 bg-violet-50 dark:border-violet-800/30 dark:bg-violet-900/10 text-[10px] text-violet-700 dark:text-violet-400 font-medium"
            >
              <Shield className="h-3 w-3" />
              {t("identityProviders.badgeAdmin")}
            </Badge>
          )}

          {/* User Scope Badge */}
          {item.enabledForUsers && (
            <Badge
              variant="outline"
              className="h-5 gap-1 border-sky-200 bg-sky-50 dark:border-sky-800/30 dark:bg-sky-900/10 text-[10px] text-sky-700 dark:text-sky-400 font-medium"
            >
              <Users className="h-3 w-3" />
              {t("identityProviders.badgeUser")}
            </Badge>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border/60 w-full mb-4" />

        {/* Card Footer Controls */}
        <div className="flex items-center justify-between">
          {/* Connection Test Status Quick Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTestConnection(item.id)}
            disabled={isTesting}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-1.5"
          >
            {isTesting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5 text-amber-500 group-hover:animate-pulse" />
            )}
            {t("identityProviders.testConnection") || "Test Connection"}
          </Button>

          {/* Status Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              {item.isActive ? t("common.active") || "Active" : t("common.inactive") || "Inactive"}
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
            <AlertDialogTitle>
              {t("identityProviders.deleteConfirmTitle") || "Delete Identity Provider"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("identityProviders.deleteConfirmDesc") ||
                "This will permanently remove this identity provider. Users linked via this provider will lose SSO access. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(item);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("common.delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
