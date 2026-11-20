"use client";

import React, { memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Calendar,
  Eye,
  Phone,
  Mail,
  ArrowRight,
  Edit3,
  Trash2,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import type { usePartyDirectoryViewModel } from "../viewmodels/usePartyDirectoryViewModel";

type PartyDirectoryItem = ReturnType<typeof usePartyDirectoryViewModel>["parties"][number];

export interface PartyGridSectionProps {
  parties: PartyDirectoryItem[];
  formatDate: (isoString?: string) => string;
  onNavigateToProfile: (partyId: string) => void;
  onPreviewParty: (party: PartyDirectoryItem) => void;
  onEditParty: (party: PartyDirectoryItem) => void;
  onDeleteParty: (party: PartyDirectoryItem) => void;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Responsive Card Grid presentation for Party Directory with compact ⋯ actions.
 */
export const PartyGridSection = memo(function PartyGridSection({
  parties,
  formatDate,
  onNavigateToProfile,
  onPreviewParty,
  onEditParty,
  onDeleteParty,
  canEdit,
  canDelete,
}: PartyGridSectionProps) {
  const { t, language } = useI18n();
  const isAr = language === "ar";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {parties.map((party) => {
        const subtitle = party.isPerson
          ? party.fullName && party.fullName !== party.displayName
            ? party.fullName
            : t("party.types.Person")
          : party.legalName && party.legalName !== party.displayName
            ? party.legalName
            : t("party.types.Organization");

        return (
          <Card
            key={party.id}
            className="border-nx-line hover:border-nx-line-hi flex flex-col justify-between transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-nx-accent-wash flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-nx-accent">
                    {party.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onNavigateToProfile(party.id)}
                        className="h-auto max-w-full justify-start p-0 text-start text-base font-semibold text-nx-ink hover:bg-transparent hover:text-nx-accent"
                      >
                        <span className="truncate">{party.displayName}</span>
                      </Button>
                    </CardTitle>
                    <div className="max-w-[180px] truncate text-xs text-nx-ink-3">
                      {subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge variant={party.isPerson ? "info" : "success"}>
                    {party.isPerson ? t("party.types.Person") : t("party.types.Organization")}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised"
                        aria-label={t("party.columns.actions")}
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isAr ? "start" : "end"} className="w-48">
                      <DropdownMenuItem
                        onClick={() => onPreviewParty(party)}
                        className="cursor-pointer gap-2"
                      >
                        <Eye className="h-4 w-4 text-nx-info" aria-hidden="true" />
                        <span>{t("party.directory.quickPreview")}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onNavigateToProfile(party.id)}
                        className="cursor-pointer gap-2"
                      >
                        <ExternalLink className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                        <span>{t("party.directory.viewProfile")}</span>
                      </DropdownMenuItem>

                      {canEdit && (
                        <DropdownMenuItem
                          onClick={() => onEditParty(party)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit3 className="h-4 w-4 text-nx-ink-2" aria-hidden="true" />
                          <span>{t("party.editTitle")}</span>
                        </DropdownMenuItem>
                      )}

                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteParty(party)}
                            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                            <span>{t("party.deleteTitle")}</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 pb-3 pt-0 text-xs text-nx-ink-2">
              {(party.primaryPhone || party.primaryEmail) && (
                <div className="space-y-1 pb-1">
                  {party.primaryPhone && (
                    <div className="flex items-center gap-1.5 text-nx-ink">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
                      <a
                        href={`tel:${party.primaryPhone}`}
                        className="truncate font-mono hover:text-nx-accent"
                      >
                        {party.primaryPhone}
                      </a>
                    </div>
                  )}
                  {party.primaryEmail && (
                    <div className="flex items-center gap-1.5 text-nx-ink-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
                      <a
                        href={`mailto:${party.primaryEmail}`}
                        className="truncate hover:text-nx-accent"
                      >
                        {party.primaryEmail}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {party.roles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {party.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-[10px]">
                      {role}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-nx-ink-3">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {t("party.columns.createdAt")}: {formatDate(party.createdAt)}
                </span>
              </div>
            </CardContent>

            <div className="border-nx-line bg-nx-raised/40 flex items-center justify-between border-t px-6 py-3">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreviewParty(party)}
                  className="gap-1 text-xs text-nx-ink-2 hover:text-nx-accent"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t("party.directory.quickPreview")}</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateToProfile(party.id)}
                  className="gap-1 text-xs text-nx-accent hover:text-nx-accent"
                >
                  <span>{t("party.directory.viewProfile")}</span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                {canEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-nx-ink-3 hover:text-nx-ink"
                    onClick={() => onEditParty(party)}
                    aria-label={`${t("party.editTitle")}: ${party.displayName}`}
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-nx-ink-3 hover:text-destructive"
                    onClick={() => onDeleteParty(party)}
                    aria-label={`${t("party.deleteTitle")}: ${party.displayName}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
});
