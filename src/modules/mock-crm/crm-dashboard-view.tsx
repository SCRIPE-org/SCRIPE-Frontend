"use client";

/**
 * CRM Dashboard — Mock Module View
 * Shows a premium "coming soon / demo" state for the CRM module workspace.
 */

import React from "react";
import {
  Users,
  TrendingUp,
  Target,
  MessageSquare,
  Plus,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useTheme } from "next-themes";

const stats = [
  {
    labelEn: "Total Customers",
    labelAr: "إجمالي العملاء",
    value: "2,847",
    change: "+12%",
    icon: Users,
    color: "oklch(0.65 0.18 280)",
  },
  {
    labelEn: "Active Leads",
    labelAr: "العملاء المحتملون",
    value: "143",
    change: "+8%",
    icon: Target,
    color: "oklch(0.65 0.18 160)",
  },
  {
    labelEn: "Conversion Rate",
    labelAr: "معدل التحويل",
    value: "24.6%",
    change: "+3.2%",
    icon: TrendingUp,
    color: "oklch(0.65 0.18 40)",
  },
  {
    labelEn: "Open Tickets",
    labelAr: "التذاكر المفتوحة",
    value: "38",
    change: "-5",
    icon: MessageSquare,
    color: "oklch(0.65 0.18 330)",
  },
];

const recentCustomers = [
  {
    name: "Acme Corp",
    email: "contact@acme.com",
    status: "Active",
    value: "$48,200",
    avatar: "AC",
  },
  {
    name: "Tech Innovators",
    email: "info@techinno.io",
    status: "Trial",
    value: "$12,400",
    avatar: "TI",
  },
  {
    name: "Global Partners",
    email: "sales@globalp.com",
    status: "Active",
    value: "$92,000",
    avatar: "GP",
  },
  { name: "Startup Hub", email: "hello@shub.dev", status: "Lead", value: "$3,200", avatar: "SH" },
  {
    name: "Enterprise Solutions",
    email: "bd@entsol.com",
    status: "Active",
    value: "$156,800",
    avatar: "ES",
  },
];

export function CrmDashboardView() {
  const { language } = useI18n();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isAr = language === "ar";

  const accent = "oklch(0.65 0.18 280)";
  const accentDim = "oklch(0.65 0.18 280 / 0.15)";

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "0 0 32px",
        direction: isAr ? "rtl" : "ltr",
        fontFamily: "inherit",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
          padding: "8px 0",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 12px",
              borderRadius: 99,
              background: accentDim,
              border: `1px solid ${accent}40`,
              fontSize: 12,
              fontWeight: 600,
              color: accent,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <Users size={13} />
            {isAr ? "وحدة إدارة العملاء" : "CRM Module"}
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
            {isAr ? "إدارة علاقات العملاء" : "Customer Relationships"}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: isDark ? "rgba(255,255,255,0.45)" : "#64748B",
              margin: "4px 0 0",
            }}
          >
            {isAr ? "نظرة عامة على عملاء اليوم" : "Today's customer overview"}
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 12,
            background: accent,
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: `0 4px 20px ${accent}50`,
            transition: "all 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = `0 8px 28px ${accent}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = `0 4px 20px ${accent}50`;
          }}
        >
          <Plus size={16} />
          {isAr ? "عميل جديد" : "Add Customer"}
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              style={{
                padding: "20px 22px",
                borderRadius: 16,
                background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)"}`,
                boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
                transition: "all 200ms ease",
                cursor: "default",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "none";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  insetInlineEnd: 0,
                  width: 80,
                  height: 80,
                  background: `radial-gradient(circle, ${stat.color}15 0%, transparent 70%)`,
                  borderRadius: "0 16px 0 0",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${stat.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "oklch(0.65 0.18 160)",
                    background: "oklch(0.65 0.18 160 / 0.12)",
                    padding: "3px 8px",
                    borderRadius: 99,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <TrendingUp size={10} />
                  {stat.change}
                </span>
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  letterSpacing: "-0.5px",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: isDark ? "rgba(255,255,255,0.45)" : "#64748B",
                  marginTop: 2,
                }}
              >
                {isAr ? stat.labelAr : stat.labelEn}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recent Customers ── */}
      <div
        style={{
          borderRadius: 16,
          background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)"}`,
          boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}`,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: isDark ? "#F8FAFC" : "#0F172A",
                margin: 0,
              }}
            >
              {isAr ? "العملاء الأخيرون" : "Recent Customers"}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8",
                margin: "2px 0 0",
              }}
            >
              {isAr ? "آخر تفاعلات العملاء" : "Latest customer activity"}
            </p>
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: accent,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {isAr ? "عرض الكل" : "View all"} <ArrowUpRight size={14} />
          </button>
        </div>
        <div>
          {recentCustomers.map((customer, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 24px",
                borderBottom:
                  i < recentCustomers.length - 1
                    ? `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)"}`
                    : "none",
                transition: "background 200ms ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(15,23,42,0.02)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${accent}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: accent,
                  flexShrink: 0,
                }}
              >
                {customer.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isDark ? "#F8FAFC" : "#0F172A",
                    marginBottom: 2,
                  }}
                >
                  {customer.name}
                </div>
                <div style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8" }}>
                  {customer.email}
                </div>
              </div>
              <StatusBadge status={customer.status} />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  flexShrink: 0,
                }}
              >
                {customer.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mock Coming Soon note ── */}
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
        <Clock size={14} />
        {isAr
          ? "هذه بيانات تجريبية — الوحدة الحقيقية قيد التطوير"
          : "This is demo data — the real CRM module is under development"}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: "oklch(0.65 0.18 160)",
    Trial: "oklch(0.65 0.18 60)",
    Lead: "oklch(0.65 0.18 280)",
    Inactive: "oklch(0.55 0.08 0)",
  };
  const c = colors[status] ?? "oklch(0.65 0.08 0)";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: c,
        background: `${c}18`,
        padding: "3px 10px",
        borderRadius: 99,
        flexShrink: 0,
      }}
    >
      {status}
    </span>
  );
}
