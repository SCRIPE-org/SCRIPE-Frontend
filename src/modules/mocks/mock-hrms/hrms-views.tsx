"use client";

import React from "react";
import { Briefcase, Users, UserCheck, TrendingUp, Plus, Calendar, Clock } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useTheme } from "next-themes";

const stats = [
  {
    labelEn: "Total Employees",
    labelAr: "إجمالي الموظفين",
    value: "486",
    change: "+4",
    icon: Users,
    color: "oklch(0.65 0.18 160)",
  },
  {
    labelEn: "On Leave Today",
    labelAr: "في إجازة اليوم",
    value: "23",
    change: "-2",
    icon: Calendar,
    color: "oklch(0.65 0.18 60)",
  },
  {
    labelEn: "New Hires (Month)",
    labelAr: "موظفون جدد",
    value: "8",
    change: "+3",
    icon: UserCheck,
    color: "oklch(0.65 0.18 280)",
  },
  {
    labelEn: "Avg. Tenure",
    labelAr: "متوسط الأقدمية",
    value: "3.2y",
    change: "+0.1",
    icon: TrendingUp,
    color: "oklch(0.65 0.18 30)",
  },
];

const departments = [
  {
    name: "Engineering",
    nameAr: "الهندسة",
    headcount: 142,
    manager: "Alex Kim",
    color: "oklch(0.65 0.18 280)",
  },
  {
    name: "Sales & Marketing",
    nameAr: "المبيعات والتسويق",
    headcount: 89,
    manager: "Maria Santos",
    color: "oklch(0.65 0.18 160)",
  },
  {
    name: "Operations",
    nameAr: "العمليات",
    headcount: 134,
    manager: "James Okafor",
    color: "oklch(0.65 0.18 60)",
  },
  {
    name: "Finance",
    nameAr: "المالية",
    headcount: 52,
    manager: "Laila Hassan",
    color: "oklch(0.65 0.18 30)",
  },
  {
    name: "HR & Admin",
    nameAr: "الموارد البشرية",
    headcount: 69,
    manager: "Priya Nair",
    color: "oklch(0.65 0.18 330)",
  },
];

const accent = "oklch(0.65 0.18 160)";

export function HrmsDashboardView() {
  const { language } = useI18n();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isAr = language === "ar";

  return (
    <div style={{ minHeight: "100%", padding: "0 0 32px", direction: isAr ? "rtl" : "ltr" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
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
            <Briefcase size={13} />
            {isAr ? "وحدة الموارد البشرية" : "HRMS Module"}
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
            {isAr ? "الموارد البشرية" : "Human Resources"}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: isDark ? "rgba(255,255,255,0.45)" : "#64748B",
              margin: "4px 0 0",
            }}
          >
            {isAr ? "إدارة القوى العاملة والأقسام" : "Workforce & department management"}
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
          }}
        >
          <Plus size={16} />
          {isAr ? "موظف جديد" : "Add Employee"}
        </button>
      </div>

      {/* Stats */}
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
                transition: "transform 200ms ease",
                cursor: "default",
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
                  display: "flex",
                  alignItems: "center",
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
                  }}
                >
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

      {/* Departments */}
      <div
        style={{
          borderRadius: 16,
          background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)"}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}`,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: isDark ? "#F8FAFC" : "#0F172A",
              margin: 0,
            }}
          >
            {isAr ? "الأقسام" : "Departments"}
          </h2>
        </div>
        {departments.map((dept, i) => {
          const pct = Math.round((dept.headcount / 486) * 100);
          return (
            <div
              key={i}
              style={{
                padding: "16px 24px",
                borderBottom:
                  i < departments.length - 1
                    ? `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)"}`
                    : "none",
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = isDark
                  ? "rgba(255,255,255,0.03)"
                  : "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: dept.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#F8FAFC" : "#0F172A" }}
                  >
                    {isAr ? dept.nameAr : dept.name}
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 700, color: isDark ? "#F8FAFC" : "#0F172A" }}
                  >
                    {dept.headcount}
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
                      width: `${pct}%`,
                      background: dept.color,
                      borderRadius: 99,
                      transition: "width 600ms ease",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8",
                  flexShrink: 0,
                  width: 110,
                  textAlign: "end" as const,
                }}
              >
                {dept.manager}
              </div>
            </div>
          );
        })}
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
          ? "هذه بيانات تجريبية — وحدة الموارد البشرية قيد التطوير"
          : "This is demo data — the HRMS module is under development"}
      </div>
    </div>
  );
}

export function HrmsEmployeesView() {
  const { language } = useI18n();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isAr = language === "ar";

  const employees = [
    {
      name: "Sarah Johnson",
      role: "Senior Engineer",
      dept: "Engineering",
      avatar: "SJ",
      status: "Active",
    },
    { name: "Michael Chen", role: "Sales Lead", dept: "Sales", avatar: "MC", status: "Active" },
    {
      name: "Aisha Al-Rashid",
      role: "Data Scientist",
      dept: "Engineering",
      avatar: "AA",
      status: "On Leave",
    },
    {
      name: "James Okafor",
      role: "Operations Manager",
      dept: "Operations",
      avatar: "JO",
      status: "Active",
    },
    {
      name: "Elena Vasquez",
      role: "Marketing Specialist",
      dept: "Marketing",
      avatar: "EV",
      status: "Active",
    },
    { name: "Priya Nair", role: "HR Director", dept: "HR", avatar: "PN", status: "Active" },
  ];

  return (
    <div style={{ minHeight: "100%", padding: "0 0 32px", direction: isAr ? "rtl" : "ltr" }}>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: isDark ? "#F8FAFC" : "#0F172A",
          letterSpacing: "-0.6px",
          margin: "0 0 24px",
        }}
      >
        {isAr ? "الموظفون" : "Employees"}
      </h1>
      <div
        style={{
          borderRadius: 14,
          background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)"}`,
          overflow: "hidden",
        }}
      >
        {employees.map((emp, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 20px",
              borderBottom:
                i < employees.length - 1
                  ? `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)"}`
                  : "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = isDark
                ? "rgba(255,255,255,0.03)"
                : "#F8FAFC";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "oklch(0.65 0.18 160 / 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "oklch(0.65 0.18 160)",
                flexShrink: 0,
              }}
            >
              {emp.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#F8FAFC" : "#0F172A" }}>
                {emp.name}
              </div>
              <div style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8" }}>
                {emp.role} · {emp.dept}
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 99,
                color: emp.status === "Active" ? "oklch(0.65 0.18 160)" : "oklch(0.65 0.18 60)",
                background:
                  emp.status === "Active"
                    ? "oklch(0.65 0.18 160 / 0.12)"
                    : "oklch(0.65 0.18 60 / 0.12)",
              }}
            >
              {emp.status}
            </span>
          </div>
        ))}
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
        {isAr ? "هذه بيانات تجريبية" : "This is demo data — the HRMS module is under development"}
      </div>
    </div>
  );
}
