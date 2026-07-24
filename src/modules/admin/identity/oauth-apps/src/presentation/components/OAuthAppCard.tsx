"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button, buttonVariants } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import {
  KeyRound,
  Check,
  Copy,
  AppWindow,
  Trash2,
  Pencil,
  Clock,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { formatDateUtc } from "@core/common/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@core/ui/alert-dialog";

/**
 * Interface defining property specifications, keys types, and structural contract rules for o auth app item.
 */
export interface OAuthAppItem {
  id: string;
  displayName: string;
  description?: string;
  clientType: string;
  isActive: boolean;
  clientId: string;
  createdAt?: string;
  requirePkce: boolean;
  logoUri?: string;
}

interface OAuthAppCardProps {
  item: OAuthAppItem;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
  onEdit: (id: string) => void;
  onRegenerateSecret: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Presentation UI component rendering the o auth app card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function OAuthAppCard({
  item,
  copiedField,
  copyToClipboard,
  onEdit,
  onRegenerateSecret,
  onDelete,
}: OAuthAppCardProps) {
  const { t } = useI18n();

  return (
    <Card className="group relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          {/* Left Side: Brand Logo, Name & Description */}
          <div className="flex flex-1 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-nx-md border border-nx-line bg-nx-raised p-2 transition-[border-color,background-color] duration-nx-micro ease-nx-enter group-hover:border-nx-line-hi group-hover:bg-nx-accent-wash motion-reduce:transition-none">
              {item.logoUri ? (
                <Image
                  src={item.logoUri}
                  alt={item.displayName}
                  width={48}
                  height={48}
                  className="h-full w-full rounded object-contain"
                  unoptimized // Bypasses Next.js domain restrictions for arbitrary external URLs
                />
              ) : (
                <AppWindow
                  className="h-6 w-6 text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter group-hover:text-nx-accent motion-reduce:transition-none"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight text-nx-ink">
                  {item.displayName}
                </h3>
                <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
                  {item.clientType === "confidential"
                    ? t("oauthApps.clientTypeConfidential")
                    : t("oauthApps.clientTypePublic")}
                </Badge>
                {!item.isActive && (
                  <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                    {t("common.inactive")}
                  </Badge>
                )}
              </div>
              {item.description ? (
                <p className="line-clamp-1 max-w-md text-xs text-nx-ink-2">{item.description}</p>
              ) : (
                <p className="text-xs italic text-nx-ink-3">{t("oauthApps.noDescription")}</p>
              )}
            </div>
          </div>

          {/* Middle: Client ID & PKCE Info */}
          <div className="flex shrink-0 flex-col gap-2 border-t border-nx-line pt-4 md:border-t-0 md:pt-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
                {t("oauthApps.clientIdLabel")}:
              </span>
              <code className="max-w-[150px] truncate rounded-nx-sm bg-nx-raised px-2 py-0.5 font-mono text-xs text-nx-ink-2">
                {item.clientId}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label={`${t("oauthApps.copyClientId")} — ${item.displayName}`}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.clientId, `clientId-${item.id}`);
                }}
              >
                {copiedField === `clientId-${item.id}` ? (
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-3 text-xs text-nx-ink-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {item.createdAt ? formatDateUtc(item.createdAt) : "—"}
              </span>
              <Badge variant={item.requirePkce ? "success" : "secondary"} className="px-1.5 py-0 text-[10px]">
                {t("oauthApps.pkceLabel")}:{" "}
                {item.requirePkce ? t("common.required") : t("oauthApps.pkceOptional")}
              </Badge>
            </div>
          </div>

          {/* Right Side: Quick Action Panel */}
          <div className="flex shrink-0 items-center gap-1.5 self-end md:self-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(item.id)}
              aria-label={`${t("common.edit")} — ${item.displayName}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>

            {item.clientType === "confidential" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`${t("oauthApps.regenerateSecret")} — ${item.displayName}`}
                  >
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("oauthApps.regenerateConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("oauthApps.regenerateConfirmDesc")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRegenerateSecret(item.id)}>
                      {t("oauthApps.regenerate")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`${t("common.delete")} — ${item.displayName}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("oauthApps.deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("oauthApps.deleteConfirmDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: "destructive" })}
                    onClick={() => onDelete(item.id)}
                  >
                    {t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-nx-accent"
              onClick={() => onEdit(item.id)}
              aria-label={`${t("oauthApps.viewDetails")} — ${item.displayName}`}
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
