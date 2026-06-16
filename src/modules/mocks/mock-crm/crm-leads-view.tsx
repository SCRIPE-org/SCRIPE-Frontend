"use client";
import React from "react";
import { Plus } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useTheme } from "next-themes";
import { MockComingSoonBanner } from "../mock-shared/MockComingSoonBanner";

const leads = [
  {
    name: "NextGen Inc",
    contact: "Sarah Johnson",
    stage: "Discovery",
    value: "$24,000",
    probability: 30,
    avatar: "NI",
  },
  {
    name: "Cloud Systems",
    contact: "Michael Chen",
    stage: "Proposal",
    value: "$68,000",
    probability: 60,
    avatar: "CS",
  },
  {
    name: "Data Dynamics",
    contact: "Aisha Al-Rashid",
    stage: "Negotiation",
    value: "$120,000",
    probability: 80,
    avatar: "DD",
  },
  {
    name: "Smart Factory",
    contact: "James Okafor",
    stage: "Qualified",
    value: "$34,500",
    probability: 45,
    avatar: "SF",
  },
  {
    name: "Cyber Defense",
    contact: "Elena Vasquez",
    stage: "Proposal",
    value: "$89,000",
    probability: 55,
    avatar: "CD",
  },
];

const stageColors: Record<string, string> = {
  Discovery: "oklch(0.65 0.18 280)",
  Qualified: "oklch(0.65 0.18 210)",
  Proposal: "oklch(0.65 0.18 60)",
  Negotiation: "oklch(0.65 0.18 30)",
  "Closed Won": "oklch(0.65 0.18 160)",
};

export function CrmLeadsView() {
  const { language } = useI18n();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isAr = language === "ar";
  const accent = "oklch(0.65 0.18 280)";

  return (
    <div style={{ minHeight: "100%", padding: "0 0 32px", direction: isAr ? "rtl" : "ltr" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: isDark ? "#F8FAFC" : "#0F172A",
              letterSpacing: "-0.6px",
              margin: 0,
            }}
          >
            {isAr ? "العملاء المحتملون" : "Leads Pipeline"}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: isDark ? "rgba(255,255,255,0.45)" : "#64748B",
              margin: "4px 0 0",
            }}
          >
            {isAr ? "تتبع العملاء المحتملين وإدارتهم" : "Track and manage your sales pipeline"}
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 18px",
            borderRadius: 10,
            background: accent,
            border: "none",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: `0 4px 16px ${accent}40`,
          }}
        >
          <Plus size={14} /> {isAr ? "عميل محتمل" : "New Lead"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {leads.map((lead, i) => {
          const stageColor = stageColors[lead.stage] ?? "oklch(0.55 0.08 0)";
          return (
            <div
              key={i}
              style={{
                padding: "16px 20px",
                borderRadius: 14,
                background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)"}`,
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateX(3px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "none";
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${accent}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: accent,
                  flexShrink: 0,
                }}
              >
                {lead.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#F8FAFC" : "#0F172A" }}
                >
                  {lead.name}
                </div>
                <div style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8" }}>
                  {lead.contact}
                </div>
              </div>
              <div style={{ width: 120, flexShrink: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8" }}
                  >
                    {lead.probability}%
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 99,
                    background: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${lead.probability}%`,
                      background: `linear-gradient(90deg, ${stageColor}80, ${stageColor})`,
                      borderRadius: 99,
                      transition: "width 600ms ease",
                    }}
                  />
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: stageColor,
                  background: `${stageColor}18`,
                  padding: "4px 12px",
                  borderRadius: 99,
                  flexShrink: 0,
                }}
              >
                {lead.stage}
              </span>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  flexShrink: 0,
                  width: 80,
                  textAlign: "end",
                }}
              >
                {lead.value}
              </div>
            </div>
          );
        })}
      </div>
      <MockComingSoonBanner isAr={isAr} isDark={isDark} />
    </div>
  );
}
