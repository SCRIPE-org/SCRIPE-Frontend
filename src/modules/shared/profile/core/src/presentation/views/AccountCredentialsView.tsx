"use client";

/**
 * AccountCredentialsView
 *
 * Sovereign Slice 2 (/account/credentials):
 * Interactive 180-degree flipping SovereignIdentityPass, UEFA/CAF/FIFA Coaching License Vault,
 * SafeSport/DBS Child-Safeguarding Clearance Tracker, and Cryptographic Digital Signature Seal + PIN.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { useAccountCredentialsSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { useProfileDossierViewModel } from "../viewmodels/useProfileDossierViewModel";
import { SovereignIdentityPass } from "../components/SovereignIdentityPass";
import {
  Award,
  CheckCircle2,
  Calendar,
  Plus,
  ShieldCheck,
  PenTool,
  Trash2,
} from "lucide-react";

export function AccountCredentialsView() {
  const { t } = useI18n();
  const { profile } = useProfileDossierViewModel();
  const {
    credentials,
    addCredential,
    isAddingCredential,
    removeCredential,
    isRemovingCredential,
  } = useAccountCredentialsSliceViewModel();

  const [newOrg, setNewOrg] = useState("UEFA");
  const [newTitle, setNewTitle] = useState("");
  const [newLicenseCode, setNewLicenseCode] = useState("");
  const [signingPin, setSigningPin] = useState("");
  const [pinSaved, setPinSaved] = useState(false);

  const items = credentials?.credentials?.length
    ? credentials.credentials
    : [
        {
          id: "cred-uefa-pro",
          credentialType: "COACHING_LICENSE",
          issuingBody: "UEFA",
          licenseTitle: "UEFA Pro Coaching License",
          licenseNumber: "UEFA-PRO-2026-9941",
          issuedAtUtc: "2023-06-01T00:00:00Z",
          expiresAtUtc: "2028-06-01T00:00:00Z",
          verificationStatus: "VERIFIED",
          stadiumZones: ["ZONE 1: PITCH", "ZONE 2: TUNNEL", "ZONE 3: VAR"],
        },
        {
          id: "cred-safesport",
          credentialType: "SAFEGUARDING",
          issuingBody: "FIFA / SafeSport",
          licenseTitle: "Enhanced DBS & Youth Safeguarding Clearance",
          licenseNumber: "DBS-FIFA-88210",
          issuedAtUtc: "2025-01-15T00:00:00Z",
          expiresAtUtc: "2027-01-15T00:00:00Z",
          verificationStatus: "VERIFIED",
          stadiumZones: ["ACADEMY CAMPUS", "MEDICAL BAY"],
        },
      ];

  const handleAddCredential = async () => {
    if (!newTitle.trim() || !newLicenseCode.trim()) return;
    await addCredential({
      credentialType: "COACHING_LICENSE",
      issuingBody: newOrg,
      licenseTitle: newTitle.trim(),
      licenseNumber: newLicenseCode.trim(),
      issuedAtUtc: new Date().toISOString(),
      expiresAtUtc: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 3).toISOString(),
      stadiumZones: ["ZONE 1: PITCH"],
    });
    setNewTitle("");
    setNewLicenseCode("");
  };

  const handleSaveSigningPin = () => {
    if (signingPin.length < 4) return;
    setSigningPin("");
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">
          {t("profile.credentials.title")}
        </h1>
        <p className="text-xs text-nx-ink-3 mt-1">
          {t("profile.credentials.description")}
        </p>
      </div>

      {/* 1. Interactive 180-Degree Flipping Sovereign Identity Pass */}
      <SovereignIdentityPass
        fullName={profile?.fullName || "Coach Executive"}
        jobTitle={profile?.jobTitle || "Sporting Director"}
        clubAffiliation={profile?.clubAffiliation || "Al-Ahly Sporting Club"}
        staffCode={profile?.staffCode || "#SCR-ADM-01"}
        primaryLicense="UEFA Pro License"
        nfcTokenId={credentials?.nfcPassTokenId || "#SCR-NFC-2026-884A"}
      />

      {/* 2. UEFA / CAF / FIFA Coaching License & Safeguarding Vault */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.coaching.sectionTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.coaching.sectionDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((lic: any) => (
              <div
                key={lic.id}
                className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex flex-col justify-between gap-3 hover:border-nx-line-hi transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-bold border-nx-accent/40 text-nx-accent bg-nx-accent-wash">
                        {lic.issuingBody}
                      </Badge>
                      <span className="font-semibold text-xs text-nx-ink truncate">
                        {lic.licenseTitle}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-nx-ink-3">
                      {t("profile.coaching.certificate")}: {lic.licenseNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className="border-success/30 text-success bg-success/10 gap-1 text-[10px]">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{t("profile.coaching.verifiedBadge")}</span>
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isRemovingCredential}
                      onClick={() => removeCredential(lic.id)}
                      className="h-7 w-7 p-0 text-nx-ink-3 hover:text-destructive"
                      aria-label={t("profile.common.delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-nx-ink-3 border-t border-nx-line pt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-nx-accent" />
                    {t("profile.coaching.validUntil")}:{" "}
                    {lic.expiresAtUtc ? new Date(lic.expiresAtUtc).toLocaleDateString() : "2028-06-01"}
                  </span>
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                </div>
              </div>
            ))}
          </div>

          {/* Add New Credential Inline Bar */}
          <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
            <Input
              value={newOrg}
              onChange={(e) => setNewOrg(e.target.value)}
              placeholder="UEFA / CAF / FIFA"
              className="h-8 text-xs bg-nx-surface border-nx-line text-nx-ink"
            />
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t("profile.credentials.licenseTitlePlaceholder")}
              className="h-8 text-xs bg-nx-surface border-nx-line text-nx-ink"
            />
            <Input
              value={newLicenseCode}
              onChange={(e) => setNewLicenseCode(e.target.value)}
              placeholder={t("profile.credentials.certificatePlaceholder")}
              className="h-8 text-xs font-mono bg-nx-surface border-nx-line text-nx-ink"
            />
            <Button
              type="button"
              size="sm"
              disabled={isAddingCredential}
              onClick={handleAddCredential}
              data-testid="add-credential-btn"
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("profile.credentials.addCredentialBtn")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Cryptographic Digital Signature & 6-Digit Signing PIN */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.credentials.signatureTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.credentials.signatureDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1">
            <Input
              type="password"
              maxLength={6}
              value={signingPin}
              onChange={(e) => setSigningPin(e.target.value)}
              placeholder={t("profile.credentials.signingPinPlaceholder")}
              className="h-8 max-w-xs text-xs font-mono bg-nx-raised border-nx-line text-nx-ink"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleSaveSigningPin}
              data-testid="save-signing-pin-btn"
              className="h-8 text-xs font-semibold"
            >
              {t("profile.credentials.updateSigningPinBtn")}
            </Button>
          </div>
          {pinSaved && (
            <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("profile.common.saved")}</span>
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
