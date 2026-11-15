"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  QrCode,
  Printer,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Activity,
  UserCheck
} from "lucide-react";
import type { AcademyAthlete, AthleteCard as AthleteCardModel, AthleteQr } from "../../domain/entities/AcademyAthlete";
import { useAcademyServiceLocator } from "@modules/academy/di";

interface AthleteCardProps {
  athlete?: AcademyAthlete | null;
  cardData?: AthleteCardModel | null;
  qrData?: AthleteQr | null;
  showActions?: boolean;
  className?: string;
}

export function AthleteCard({
  athlete,
  cardData,
  qrData: initialQr,
  showActions = true,
  className = ""
}: AthleteCardProps) {
  const locator = useAcademyServiceLocator();
  const [qrInfo, setQrInfo] = useState<AthleteQr | null>(initialQr || null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Fetch QR info if athlete is provided and qrInfo is missing
  useEffect(() => {
    let isMounted = true;
    if (!initialQr && athlete?.id) {
      locator.athletesRepository
        .getAthleteQr(athlete.id)
        .then((data) => {
          if (isMounted) setQrInfo(data);
        })
        .catch((err) => {
          console.error("Failed to load athlete QR token:", err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [athlete?.id, initialQr, locator.athletesRepository]);

  // Derive consolidated fields
  const membershipNumber =
    cardData?.membershipNumber || athlete?.membershipNumber || qrInfo?.membershipNumber || "ATH-PENDING";
  const firstNameEn = cardData?.firstNameEn || athlete?.firstNameEn || "";
  const lastNameEn = cardData?.lastNameEn || athlete?.lastNameEn || "";
  const firstNameAr = cardData?.firstNameAr || athlete?.firstNameAr || "";
  const lastNameAr = cardData?.lastNameAr || athlete?.lastNameAr || "";
  const fullNameEn = `${firstNameEn} ${lastNameEn}`.trim();
  const fullNameAr = `${firstNameAr} ${lastNameAr}`.trim();
  const academyName = cardData?.academyName || "SCRIPE Academy";
  const branchName = cardData?.primaryBranchName || athlete?.primaryBranchId || "Main Campus";
  const status = cardData?.status || athlete?.status || "Active";
  const intakeDate = cardData?.intakeDate || athlete?.intakeDate || new Date().toISOString().split("T")[0];
  const cardToken = cardData?.cardToken || qrInfo?.cardToken || athlete?.qrCodeToken || "";
  const qrCodeDataUri = qrInfo?.qrCodeDataUri || "";

  // Derive sports list (deduplicated by sport DEF-002)
  const sports = cardData?.sports
    ? Array.from(new Set(cardData.sports))
    : athlete?.participations
    ? Array.from(new Map(athlete.participations.map((p) => [p.sportId, p.sportNameEn])).values())
    : [];

  const isMinor = athlete?.isMinor ?? true;

  // Phone for WhatsApp sharing:
  // Guardian phone for minors, athlete's own contact phone for adults.
  // Never emergency phone!
  const sharePhoneRaw = isMinor ? athlete?.guardianPhone : athlete?.phoneNumber;
  const cleanPhone = sharePhoneRaw ? sharePhoneRaw.replace(/[^0-9]/g, "") : "";

  const publicCardUrl = cardToken ? `${origin}/academy/card/${cardToken}` : "";

  const handleCopyLink = () => {
    if (!publicCardUrl) return;
    navigator.clipboard.writeText(publicCardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!cleanPhone) return;
    const message =
      `Welcome to ${academyName}! / مرحباً بكم في ${academyName}!\n\n` +
      `Athlete / الرياضي: ${fullNameEn} (${fullNameAr})\n` +
      `Membership ID / رقم العضوية: ${membershipNumber}\n` +
      `Digital Pass / البطاقة الرقمية: ${publicCardUrl}\n\n` +
      `This digital card confirms verified academy membership. Non-PII protected.`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Printable Card Area */}
      <div
        id="scripe-athlete-card-print"
        className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-md transition-all print:border-black print:shadow-none print:m-0 print:p-4 text-card-foreground"
      >
        {/* Subtle Watermark Badge */}
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-primary/5 pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                SCRIPE Digital Athlete Pass
              </span>
              <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>
            <h3 className="mt-1 text-lg font-black tracking-tight">{academyName}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Building2 className="h-3 w-3" />
              {branchName}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
              Membership ID
            </span>
            <span className="font-mono text-base font-black text-primary tracking-wide">
              {membershipNumber}
            </span>
          </div>
        </div>

        {/* Body Grid: Athlete Info & QR Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-center">
          {/* Athlete Info */}
          <div className="md:col-span-2 space-y-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                Athlete Name / اسم الرياضي
              </span>
              <div className="text-base font-bold">{fullNameEn || "—"}</div>
              <div className="text-sm font-semibold text-muted-foreground" dir="rtl">
                {fullNameAr || "—"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-muted-foreground block text-[11px] flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-primary" />
                  Status / الحالة
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {status}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-primary" />
                  Intake / تاريخ التسجيل
                </span>
                <span className="font-medium">{intakeDate}</span>
              </div>
            </div>

            {/* Sports list */}
            <div>
              <span className="text-muted-foreground block text-[11px] mb-1 flex items-center gap-1">
                <Activity className="h-3 w-3 text-primary" />
                Enrolled Sports / الرياضات المعتمدة
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sports.length > 0 ? (
                  sports.map((sp, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs font-semibold bg-background/80 border-primary/30 text-primary"
                    >
                      {sp}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">Pending sport allocation</span>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-background/50 shadow-inner">
            {qrCodeDataUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeDataUri}
                alt={`QR Pass for ${membershipNumber}`}
                className="h-32 w-32 rounded object-contain"
              />
            ) : (
              <div className="h-32 w-32 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded">
                <QrCode className="h-10 w-10 text-muted-foreground/40 mb-1" />
                <span className="text-[10px] text-center">Loading QR...</span>
              </div>
            )}
            <span className="mt-2 text-[10px] font-mono font-medium text-muted-foreground text-center">
              Scan for Public Verification
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Non-PII Verified Credential • Powered by SCRIPE Platform</span>
          <span className="font-mono">{cardToken ? `ID: ${cardToken.substring(0, 12)}...` : ""}</span>
        </div>
      </div>

      {/* Action Buttons (Non-Printable) */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 print:hidden">
          <div className="flex items-center gap-2">
            {/* WhatsApp Click-to-Chat Button */}
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={!cleanPhone}
              onClick={handleWhatsAppShare}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              title={
                !cleanPhone
                  ? isMinor
                    ? "Guardian phone number is required to share via WhatsApp"
                    : "Athlete contact phone number is required to share via WhatsApp"
                  : `Send to ${sharePhoneRaw}`
              }
            >
              <Share2 className="h-4 w-4" />
              <span>
                {cleanPhone
                  ? `Share to WhatsApp (${sharePhoneRaw})`
                  : "Share to WhatsApp (No phone)"}
              </span>
            </Button>

            {/* Print / Download Button */}
            <Button type="button" variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              <span>Print / Download Card</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Public Link */}
            {publicCardUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={handleCopyLink} className="gap-1.5 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Link Copied" : "Copy Card URL"}</span>
              </Button>
            )}

            {/* Open Public Card */}
            {publicCardUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(publicCardUrl, "_blank")}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open View</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
