"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@core/ui/sheet";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";
import type { Party } from "../../domain/entities/Party";
import type { PartyProfile } from "../../domain/entities/PartyProfile";
import {
  User,
  Building,
  Calendar,
  Lock,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  Briefcase,
} from "lucide-react";

interface PartyQuickPreviewSheetProps {
  party: Party | null;
  profile?: PartyProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToProfile: (partyId: string) => void;
  onEditParty?: (party: Party) => void;
}

/**
 * Slide-over sheet for inspecting quick summary details of a party.
 */
export function PartyQuickPreviewSheet({
  party,
  profile,
  open,
  onOpenChange,
  onNavigateToProfile,
  onEditParty,
}: PartyQuickPreviewSheetProps) {
  const { t, language } = useI18n();
  const intlLocale = resolveIntlLocale(language);
  const [copiedId, setCopiedId] = useState(false);

  if (!party) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(party.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      return new Intl.DateTimeFormat(intlLocale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const primaryPhone = profile?.primaryPhone || party.primaryPhone || null;
  const primaryEmail = profile?.primaryEmail || party.primaryEmail || null;
  const activeRoles =
    profile?.roles && profile.roles.length > 0 ? profile.roles.map((r) => r.roleType) : party.roles;
  const secondarySubtitle = party.isPerson
    ? profile?.fullName || party.fullName
    : profile?.legalName || party.legalName;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="end"
        className="flex w-full flex-col justify-between overflow-y-auto sm:max-w-md"
      >
        <div className="space-y-6">
          <SheetHeader className="border-nx-border border-b pb-4">
            <div className="flex items-center gap-2">
              <Badge variant={party.isPerson ? "info" : "success"}>
                {party.isPerson ? t("party.types.Person") : t("party.types.Organization")}
              </Badge>
              <span className="font-mono text-xs text-nx-ink-3">
                {party.isPerson ? "INDIVIDUAL" : "CORPORATE"}
              </span>
            </div>
            <div className="flex items-start gap-3 pt-2">
              <div className="bg-nx-accent/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold text-nx-accent">
                {party.initials}
              </div>
              <div className="min-w-0">
                <SheetTitle className="truncate text-xl font-bold">{party.displayName}</SheetTitle>
                <SheetDescription className="truncate text-xs text-nx-ink-2">
                  {secondarySubtitle && secondarySubtitle !== party.displayName
                    ? secondarySubtitle
                    : party.isPerson
                      ? t("party.profile.personDetails")
                      : t("party.profile.orgDetails")}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Canonical ID & Type Protection Banner */}
          <div className="space-y-3">
            <div className="bg-nx-surface-2 border-nx-border space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-nx-ink-3">
                  {t("party.quickPreview.canonicalId")}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyId}
                  className="flex h-6 items-center gap-1 px-1.5 py-0 font-mono text-[11px] text-nx-ink transition-colors hover:text-nx-accent"
                  title="Copy ID"
                >
                  {copiedId ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="border-nx-border select-all truncate rounded border bg-nx-surface px-2 py-1 font-mono text-xs text-nx-ink">
                {party.id}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <Lock className="h-3.5 w-3.5" />
                <span>{t("party.profile.immutableType")}</span>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-[10px] text-emerald-600"
              >
                ADR-002
              </Badge>
            </div>
          </div>

          {/* Contact Channels */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("party.quickPreview.contacts")}
            </h4>
            <div className="border-nx-border space-y-2 rounded-xl border bg-nx-surface p-3.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-nx-ink-2">
                  <Phone className="h-3.5 w-3.5 text-nx-accent" />
                  <span>{t("party.profile.primaryTelephone") || "Phone"}</span>
                </span>
                {primaryPhone ? (
                  <a
                    href={`tel:${primaryPhone}`}
                    className="truncate font-mono font-medium text-nx-ink hover:text-nx-accent"
                  >
                    {primaryPhone}
                  </a>
                ) : (
                  <span className="text-nx-ink-3">{t("party.directory.noContactRegistered")}</span>
                )}
              </div>
              <div className="border-nx-border/60 flex items-center justify-between gap-2 border-t pt-1.5">
                <span className="flex items-center gap-1.5 text-nx-ink-2">
                  <Mail className="h-3.5 w-3.5 text-nx-accent" />
                  <span>{t("party.profile.primaryEmail") || "Email"}</span>
                </span>
                {primaryEmail ? (
                  <a
                    href={`mailto:${primaryEmail}`}
                    className="max-w-[200px] truncate font-medium text-nx-ink hover:text-nx-accent"
                  >
                    {primaryEmail}
                  </a>
                ) : (
                  <span className="text-nx-ink-3">{t("party.directory.noContactRegistered")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Active Roles */}
          {activeRoles.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{t("party.profile.activeRoles")}</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeRoles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Summary Details */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
              {t("party.quickPreview.completeness")}
            </h4>

            <div className="border-nx-border space-y-2 rounded-xl border bg-nx-surface p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-nx-ink-2">{t("party.columns.type")}</span>
                <div className="flex items-center gap-1 font-medium text-nx-ink">
                  {party.isPerson ? (
                    <User className="h-3.5 w-3.5 text-blue-500" />
                  ) : (
                    <Building className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  <span>{party.type}</span>
                </div>
              </div>

              {party.isPerson && profile?.person?.dateOfBirth && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-nx-ink-2">{t("party.profile.dob")}</span>
                  <span className="text-xs font-medium text-nx-ink">
                    {formatDate(profile.person.dateOfBirth)}
                  </span>
                </div>
              )}

              {party.isOrganization && (profile?.taxId || profile?.organization?.taxId) && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-nx-ink-2">{t("party.profile.taxId")}</span>
                  <span className="font-mono text-xs text-nx-ink">
                    {profile.taxId || profile.organization?.taxId}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-nx-ink-2">{t("party.quickPreview.created")}</span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-nx-ink-2">
                  <Calendar className="h-3.5 w-3.5 text-nx-ink-3" />
                  <span>{formatDate(party.createdAt || profile?.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-nx-ink-2">{t("party.profile.recordStatus")}</span>
                <Badge variant="success" className="gap-1 text-[11px]">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{t("party.quickPreview.active")}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-nx-border flex-col gap-2 border-t pt-6 sm:flex-col">
          <Button
            onClick={() => {
              onOpenChange(false);
              onNavigateToProfile(party.id);
            }}
            className="w-full gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{t("party.quickPreview.viewProfile")}</span>
          </Button>

          {onEditParty && (
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onEditParty(party);
              }}
              className="w-full gap-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>{t("party.quickPreview.edit")}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs text-nx-ink-3 hover:text-nx-ink"
          >
            {t("party.quickPreview.close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
