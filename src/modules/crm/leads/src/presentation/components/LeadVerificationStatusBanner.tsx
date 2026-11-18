"use client";

import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { AlertCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import type { CrmLead } from "../../domain/entities/LeadEntity";

interface LeadVerificationStatusBannerProps {
  lead: CrmLead | null;
  isConvertible: boolean;
  isQualified: boolean;
  hasVerifiedOrAutoParty: boolean;
  t: (key: string) => string;
}

/** Displays lead qualification eligibility and PartyKernel verification status inside ConvertLeadDialog. */
export function LeadVerificationStatusBanner({
  lead,
  isConvertible,
  isQualified,
  hasVerifiedOrAutoParty,
  t,
}: LeadVerificationStatusBannerProps) {
  return (
    <>
      {!isConvertible && (
        <Alert variant="destructive" className="py-2.5 px-3">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-xs font-bold">{t("crmLeads.conversion.notQualifiedTitle")}</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            {t("crmLeads.conversion.notQualifiedDescription")}
          </AlertDescription>
        </Alert>
      )}
      {isConvertible && !isQualified && (
        <div className="rounded-nx-md border border-nx-accent/30 bg-nx-accent-wash px-3 py-2 text-xs text-nx-ink-2">
          {t("crmLeads.conversion.autoQualifyNotice")}
        </div>
      )}

      {lead && (
        <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-ground px-3 py-2 text-xs">
          <span className="text-nx-ink-3 font-medium">{t("crmLeads.conversion.accountVerificationLabel")}</span>
          {lead.verifiedPartyId || lead.organizationPartyId || lead.personPartyId ? (
            <span className="inline-flex items-center gap-1 font-semibold text-success">
              <ShieldCheck className="size-3.5" />
              <span>{t("crmLeads.conversion.verifiedAccountLinked")}</span>
            </span>
          ) : hasVerifiedOrAutoParty ? (
            <span className="inline-flex items-center gap-1 font-medium text-nx-accent">
              <ShieldCheck className="size-3.5" />
              <span>{t("crmLeads.conversion.autoProvisionIntake")}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-nx-warning-strong">
              <ShieldAlert className="size-3.5" />
              <span>{t("crmLeads.conversion.unlinkedDiscoveryOnly")}</span>
            </span>
          )}
        </div>
      )}
    </>
  );
}
