"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
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
import { format } from "date-fns";
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
    <Card className="group relative overflow-hidden border border-border/80 bg-card/45 backdrop-blur-md transition-all duration-300 hover:scale-[1.005] hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(168,85,247,0.03)]">
      <CardContent className="p-5">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          {/* Left Side: Brand Logo, Name & Description */}
          <div className="flex flex-1 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 p-2 transition-all group-hover:border-primary/20 group-hover:bg-primary/5">
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
                <AppWindow className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {item.displayName}
                </h3>
                <Badge
                  variant="outline"
                  className="border-border/80 px-1.5 py-0 font-mono text-[10px]"
                >
                  {item.clientType === "confidential" ? "Confidential" : "Public"}
                </Badge>
                {!item.isActive && (
                  <Badge
                    variant="secondary"
                    className="bg-destructive/10 px-1.5 py-0 text-[10px] text-destructive"
                  >
                    Inactive
                  </Badge>
                )}
              </div>
              {item.description ? (
                <p className="line-clamp-1 max-w-md text-xs text-muted-foreground">
                  {item.description}
                </p>
              ) : (
                <p className="text-xs italic text-muted-foreground/60">No description provided.</p>
              )}
            </div>
          </div>

          {/* Middle: Client ID & PKCE Info */}
          <div className="flex shrink-0 flex-col gap-2 border-t pt-4 md:border-t-0 md:pt-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Client ID:
              </span>
              <code className="max-w-[150px] truncate rounded bg-muted/70 px-2 py-0.5 font-mono text-xs text-foreground/80">
                {item.clientId}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.clientId, `clientId-${item.id}`);
                }}
              >
                {copiedField === `clientId-${item.id}` ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {item.createdAt ? formatDateUtc(item.createdAt) : "—"}
              </span>
              <Badge
                variant="outline"
                className={`px-1.5 py-0 text-[10px] ${
                  item.requirePkce
                    ? "border-success/20 bg-success/5 text-success"
                    : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                PKCE: {item.requirePkce ? "Required" : "Optional"}
              </Badge>
            </div>
          </div>

          {/* Right Side: Quick Action Panel */}
          <div className="flex shrink-0 items-center gap-1.5 self-end md:self-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => onEdit(item.id)}
              title="Edit application"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {item.clientType === "confidential" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Regenerate secret"
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("oauthApps.regenerateConfirmTitle") || "Regenerate Client Secret?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("oauthApps.regenerateConfirmDesc") ||
                        "The current secret will be invalidated. All applications using the old secret will stop working."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRegenerateSecret(item.id)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {t("oauthApps.regenerate") || "Regenerate"}
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
                  title="Delete application"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("oauthApps.deleteConfirmTitle") || "Delete OAuth Application?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("oauthApps.deleteConfirmDesc") ||
                      "This will permanently remove this application. All authenticated sessions will be invalidated."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(item.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("common.delete") || "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-primary/5 hover:text-primary"
              onClick={() => onEdit(item.id)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
