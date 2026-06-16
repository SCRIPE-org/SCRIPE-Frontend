"use client";

import React from "react";
import { Calculator, Lock, ArrowUpRight, FileText, TrendingUp, Clock } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useTheme } from "next-themes";

const accent = "oklch(0.65 0.18 210)";

/**
 * Accounting Dashboard — shows an upgrade wall since this module
 * requires the "Modules.Accounting" feature flag / entitlement.
 * This simulates a locked module workspace for testing.
 */
export function AccountingDashboardView() {
  const { language } = useI18n();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isAr = language === "ar";

  return (
    <div style={{ minHeight: "100%", padding: "0 0 32px", direction: isAr ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            borderRadius: 99,
            background: `${accent}18`,
            border: `1px solid ${accent}40`,
            fontSize: 12,
            fontWeight: 600,
            color: accent,
            textTransform: "uppercase" as const,
            letterSpacing: "0.5px",
            marginBottom: 10,
          }}
        >
          <Calculator size={13} />
          {isAr ? "وحدة المحاسبة" : "Accounting Module"}
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: isDark ? "#F8FAFC" : "#0F172A",
            letterSpacing: "-0.7px",
            margin: 0,
          }}
        >
          {isAr ? "المحاسبة المالية" : "Financial Accounting"}
        </h1>
      </div>

      {/* Upgrade Wall */}
      <div
        style={{
          padding: "48px 32px",
          borderRadius: 24,
          background: isDark
            ? `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, ${accent}08 100%)`
            : `linear-gradient(135deg, #F8FAFC 0%, ${accent}08 100%)`,
          border: `1px solid ${isDark ? `${accent}30` : `${accent}25`}`,
          textAlign: "center" as const,
          position: "relative" as const,
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Lock icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: `${accent}18`,
            border: `2px solid ${accent}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            position: "relative" as const,
            boxShadow: `0 0 40px ${accent}25`,
          }}
        >
          <Lock size={30} style={{ color: accent }} />
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: isDark ? "#F8FAFC" : "#0F172A",
            margin: "0 0 12px",
            letterSpacing: "-0.4px",
          }}
        >
          {isAr ? "هذه الوحدة تتطلب ترقية الاشتراك" : "Upgrade Required to Access Accounting"}
        </h2>
        <p
          style={{
            fontSize: 15,
            color: isDark ? "rgba(255,255,255,0.5)" : "#64748B",
            margin: "0 auto 32px",
            maxWidth: 480,
            lineHeight: 1.6,
          }}
        >
          {isAr
            ? "وحدة المحاسبة متاحة في خطة Enterprise فأعلى. يرجى ترقية اشتراكك للوصول إلى التقارير المالية والفواتير وإدارة الحسابات."
            : "The Accounting module is available on the Enterprise plan and above. Upgrade your subscription to access financial reports, invoices, and account management."}
        </p>

        {/* Features Preview */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginBottom: 32,
            flexWrap: "wrap" as const,
          }}
        >
          {[
            { icon: FileText, labelEn: "Invoicing", labelAr: "الفواتير" },
            { icon: TrendingUp, labelEn: "P&L Reports", labelAr: "الأرباح والخسائر" },
            { icon: Calculator, labelEn: "Tax Management", labelAr: "إدارة الضرائب" },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                style={{
                  padding: "12px 20px",
                  borderRadius: 12,
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: 0.6,
                }}
              >
                <Icon size={16} style={{ color: accent }} />
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#CBD5E1" : "#475569" }}
                >
                  {isAr ? feat.labelAr : feat.labelEn}
                </span>
                <Lock size={11} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#CBD5E1" }} />
              </div>
            );
          })}
        </div>

        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "13px 28px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${accent}, oklch(0.65 0.22 230))`,
            border: "none",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: `0 6px 30px ${accent}50`,
            transition: "all 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 10px 40px ${accent}65`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = `0 6px 30px ${accent}50`;
          }}
        >
          {isAr ? "ترقية الاشتراك" : "Upgrade Subscription"}
          <ArrowUpRight size={18} />
        </button>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "14px 20px",
          borderRadius: 12,
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
          border: `1px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)"}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: isDark ? "rgba(255,255,255,0.3)" : "#94A3B8",
          fontSize: 13,
        }}
      >
        <Clock size={14} style={{ flexShrink: 0 }} />
        {isAr
          ? "محاكاة: هذه الوحدة مقيّدة بمستوى الاشتراك (feature flag: Modules.Accounting)"
          : "Simulation: This module is gated by subscription (feature flag: Modules.Accounting)"}
      </div>
    </div>
  );
}

export function AccountingInvoicesView() {
  return <AccountingDashboardView />;
}
