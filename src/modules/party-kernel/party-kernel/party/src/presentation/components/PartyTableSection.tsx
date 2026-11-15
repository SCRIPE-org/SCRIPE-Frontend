"use client";

import React, { memo } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@core/ui/table";
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
  MoreHorizontal,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  Phone,
  Mail,
} from "lucide-react";
import type { usePartyDirectoryViewModel } from "../viewmodels/usePartyDirectoryViewModel";

type PartyDirectoryItem = ReturnType<typeof usePartyDirectoryViewModel>["parties"][number];

export interface PartyTableSectionProps {
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
 * Table presentation for Party Directory with compact ⋯ actions matching /admins.
 */
export const PartyTableSection = memo(function PartyTableSection({
  parties,
  formatDate,
  onNavigateToProfile,
  onPreviewParty,
  onEditParty,
  onDeleteParty,
  canEdit,
  canDelete,
}: PartyTableSectionProps) {
  const { t, language } = useI18n();
  const isAr = language === "ar";

  return (
    <div className="border-nx-line overflow-hidden rounded-xl border bg-nx-surface">
      <Table>
        <TableHeader className="bg-nx-raised">
          <TableRow className="border-nx-line hover:bg-transparent">
            <TableHead className="w-[34%]">{t("party.columns.displayName")}</TableHead>
            <TableHead className="w-[16%]">{t("party.columns.type")}</TableHead>
            <TableHead className="w-[22%]">{t("party.directory.quickContact")}</TableHead>
            <TableHead className="w-[14%]">{t("party.columns.createdAt")}</TableHead>
            <TableHead className="w-[14%] text-end">{t("party.columns.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parties.map((party) => {
            const subtitle = party.isPerson
              ? party.fullName && party.fullName !== party.displayName
                ? party.fullName
                : t("party.types.Person")
              : party.legalName && party.legalName !== party.displayName
                ? party.legalName
                : t("party.types.Organization");

            return (
              <TableRow
                key={party.id}
                className="border-nx-line hover:bg-nx-raised/50 group cursor-pointer transition-colors"
                onClick={() => onNavigateToProfile(party.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-nx-accent-wash flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-nx-accent">
                      {party.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-nx-ink transition-colors group-hover:text-nx-accent">
                        {party.displayName}
                      </div>
                      <div className="max-w-[240px] truncate text-xs text-nx-ink-3">
                        {subtitle}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge variant={party.isPerson ? "info" : "success"}>
                      {party.isPerson ? t("party.types.Person") : t("party.types.Organization")}
                    </Badge>
                    {party.roles.slice(0, 2).map((role) => (
                      <Badge key={role} variant="secondary" className="text-[10px]">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell
                  className="text-xs text-nx-ink-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {party.primaryPhone || party.primaryEmail ? (
                    <div className="flex min-w-0 flex-col gap-0.5">
                      {party.primaryPhone && (
                        <a
                          href={`tel:${party.primaryPhone}`}
                          className="inline-flex items-center gap-1 truncate font-mono text-nx-ink hover:text-nx-accent"
                        >
                          <Phone className="h-3 w-3 shrink-0 text-nx-ink-3" />
                          <span className="truncate">{party.primaryPhone}</span>
                        </a>
                      )}
                      {party.primaryEmail && (
                        <a
                          href={`mailto:${party.primaryEmail}`}
                          className="inline-flex max-w-[200px] items-center gap-1 truncate text-nx-ink-2 hover:text-nx-accent"
                        >
                          <Mail className="h-3 w-3 shrink-0 text-nx-ink-3" />
                          <span className="truncate">{party.primaryEmail}</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-nx-ink-3">
                      {t("party.directory.noContactRegistered")}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-nx-ink-2">
                  {formatDate(party.createdAt)}
                </TableCell>
                <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});
