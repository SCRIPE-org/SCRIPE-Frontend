/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Identity Provider Card
 *
 * Card for a configured SSO provider. Includes inline status toggling,
 * details, connection testing, and action menus.
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn, unresolveFileUrl } from "@core/common/utils";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import type { IdentityProviderListItem } from "../../domain/entities/IdentityProvider";
import { Badge } from "@core/ui/badge";
import { BrandIcon } from "@core/ui/brand-icons";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Shield, ShieldCheck, Users, Zap, Pencil, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { IdentityProviderDeleteDialog } from "./IdentityProviderDeleteDialog";
import Image from "next/image";

interface Props {
  item: IdentityProviderListItem;
  onEdit: (item: IdentityProviderListItem) => void;
  onDelete: (item: IdentityProviderListItem) => void;
  onToggleActive: (item: IdentityProviderListItem) => void | Promise<any>;
  onTestConnection: (id: string) => void | Promise<any>;
  isTesting: boolean;
}

const SAFE_HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function sanitizeBrandColor(color: string | null | undefined): string | null {
  if (!color) return null;
  const trimmed = color.trim();
  if (!SAFE_HEX_COLOR.test(trimmed)) return null;
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return trimmed;
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
  // `item.iconUrl` was already run through the old (now-broken) resolveFileUrl
  // by IdentityProviderMapper; unresolve it back to a relative path first so
  // the session hook can tell it apart from a genuinely-public absolute URL.
  const resolvedIconUrl = useResolvedFileUrl(unresolveFileUrl(item.iconUrl));

  // A provider without its own colour renders on the workspace accent instead
  // of a fixed hex — the accent is workspace-owned, never a fallback brand.
  const brandColor = sanitizeBrandColor(item.buttonColor);

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
      <Card
        data-testid={`identity-provider-card-${item.slug || item.id}`}
        className="group relative flex flex-col justify-between rounded-nx-lg border border-nx-line bg-nx-surface p-5 transition-[border-color] duration-nx-micro hover:border-nx-line-hi motion-reduce:transition-none"
      >
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
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
              {item.iconUrl && resolvedIconUrl ? (
                <Image
                  src={resolvedIconUrl}
                  alt={item.name}
                  width={24}
                  height={24}
                  unoptimized
                  className="h-6 w-6 rounded object-contain"
                />
              ) : (
                <BrandIcon
                  slug={item.slug}
                  name={item.name}
                  protocol={item.protocol}
                  className="h-6 w-6 shrink-0"
                />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="line-clamp-1 text-sm font-semibold tracking-tight text-nx-ink">
                {item.name}
              </h4>
              <p className="mt-0.5 truncate font-mono text-[11px] text-nx-ink-3">{item.slug}</p>
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
              className="h-5 gap-1 border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-[10px] font-medium text-nx-accent"
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

          {/* IdP MFA Trust Badge */}
          {item.trustIdpMfa && (
            <Badge
              variant="outline"
              className="h-5 gap-1 border-success/30 bg-success/10 text-[10px] font-medium text-success"
            >
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              {t("identityProviders.badgeTrustMfa")}
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
            data-testid={`test-connection-btn-${item.slug || item.id}`}
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
              data-testid={`toggle-active-switch-${item.slug || item.id}`}
              aria-label={`${t("identityProviders.activeStatus")} ${item.name}`}
              checked={item.isActive}
              onCheckedChange={handleToggle}
              busy={isToggling}
              className="scale-90"
            />
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <IdentityProviderDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => onDelete(item)}
      />
    </>
  );
}
