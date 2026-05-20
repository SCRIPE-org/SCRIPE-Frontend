"use client";
import React from "react";
import { Users, Plus, Search, Filter, ArrowUpRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useTheme } from "next-themes";
import { MockComingSoonBanner } from "../mock-shared/MockComingSoonBanner";

const customers = [
  { name: "Acme Corp", email: "contact@acme.com", industry: "Technology", contacts: 12, status: "Active", avatar: "AC" },
  { name: "Tech Innovators", email: "info@techinno.io", industry: "SaaS", contacts: 4, status: "Trial", avatar: "TI" },
  { name: "Global Partners", email: "sales@globalp.com", industry: "Finance", contacts: 28, status: "Active", avatar: "GP" },
  { name: "Startup Hub", email: "hello@shub.dev", industry: "Startup", contacts: 3, status: "Lead", avatar: "SH" },
  { name: "Enterprise Solutions", email: "bd@entsol.com", industry: "Enterprise", contacts: 47, status: "Active", avatar: "ES" },
  { name: "Digital Agency", email: "team@dagency.co", industry: "Agency", contacts: 8, status: "Active", avatar: "DA" },
];

export function CrmCustomersView() {
  const { language } = useI18n();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isAr = language === "ar";
  const accent = "oklch(0.65 0.18 280)";

  return (
    <div style={{ minHeight: "100%", padding: "0 0 32px", direction: isAr ? "rtl" : "ltr" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: isDark ? "#F8FAFC" : "#0F172A", letterSpacing: "-0.6px", margin: 0 }}>
            {isAr ? "العملاء" : "Customers"}
          </h1>
          <p style={{ fontSize: 14, color: isDark ? "rgba(255,255,255,0.45)" : "#64748B", margin: "4px 0 0" }}>
            {isAr ? `${customers.length} عميل في قاعدة البيانات` : `${customers.length} customers in database`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", border: "none", color: isDark ? "#CBD5E1" : "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            <Filter size={14} /> {isAr ? "تصفية" : "Filter"}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: accent, border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 16px ${accent}40`, whiteSpace: "nowrap" }}>
            <Plus size={14} /> {isAr ? "عميل جديد" : "New Customer"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <Search size={15} style={{ position: "absolute", top: "50%", insetInlineStart: 14, transform: "translateY(-50%)", color: isDark ? "rgba(255,255,255,0.3)" : "#94A3B8" }} />
        <input
          placeholder={isAr ? "ابحث عن عميل..." : "Search customers..."}
          style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: 12, background: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"}`, color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 14, outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Table */}
      <div style={{ borderRadius: 14, background: isDark ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)"}`, overflow: "hidden" }}>
        {customers.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < customers.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)"}` : "none", cursor: "pointer", transition: "background 200ms" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: accent, flexShrink: 0 }}>{c.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#F8FAFC" : "#0F172A" }}>{c.name}</div>
              <div style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8" }}>{c.email}</div>
            </div>
            <div style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.4)" : "#64748B", width: 90, flexShrink: 0 }}>{c.industry}</div>
            <div style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.5)" : "#64748B", width: 70, flexShrink: 0 }}>{c.contacts} contacts</div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, flexShrink: 0, color: c.status === "Active" ? "oklch(0.65 0.18 160)" : c.status === "Trial" ? "oklch(0.65 0.18 60)" : "oklch(0.65 0.18 280)", background: c.status === "Active" ? "oklch(0.65 0.18 160 / 0.12)" : c.status === "Trial" ? "oklch(0.65 0.18 60 / 0.12)" : "oklch(0.65 0.18 280 / 0.12)" }}>{c.status}</span>
            <ArrowUpRight size={14} style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1", flexShrink: 0 }} />
          </div>
        ))}
      </div>
      <MockComingSoonBanner isAr={isAr} isDark={isDark} />
    </div>
  );
}
