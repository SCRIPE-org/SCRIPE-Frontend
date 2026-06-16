"use client";

import React from "react";
import { Package, Box, TrendingDown, AlertTriangle, Plus, Search, Clock } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useTheme } from "next-themes";

const accent = "oklch(0.65 0.18 30)";

const stats = [
  {
    labelEn: "Total SKUs",
    labelAr: "إجمالي المنتجات",
    value: "1,284",
    icon: Package,
    color: "oklch(0.65 0.18 30)",
  },
  {
    labelEn: "In Stock",
    labelAr: "متاح في المخزن",
    value: "947",
    icon: Box,
    color: "oklch(0.65 0.18 160)",
  },
  {
    labelEn: "Low Stock",
    labelAr: "مخزون منخفض",
    value: "38",
    icon: TrendingDown,
    color: "oklch(0.65 0.18 60)",
  },
  {
    labelEn: "Out of Stock",
    labelAr: "نفد المخزون",
    value: "12",
    icon: AlertTriangle,
    color: "oklch(0.65 0.18 15)",
  },
];

const products = [
  {
    name: "Enterprise Server Rack",
    sku: "ESR-2048",
    stock: 24,
    location: "Warehouse A",
    status: "In Stock",
  },
  {
    name: "Network Switch 48P",
    sku: "NSW-48P",
    stock: 5,
    location: "Warehouse B",
    status: "Low Stock",
  },
  {
    name: "UPS Battery Unit",
    sku: "UPS-3KVA",
    stock: 0,
    location: "Warehouse A",
    status: "Out of Stock",
  },
  {
    name: "Fiber Optic Cable (100m)",
    sku: "FOC-100M",
    stock: 180,
    location: "Warehouse C",
    status: "In Stock",
  },
  {
    name: "Security Camera Module",
    sku: "SCM-HD4K",
    stock: 3,
    location: "Warehouse A",
    status: "Low Stock",
  },
  {
    name: "Industrial Router",
    sku: "IRT-GIGA",
    stock: 67,
    location: "Warehouse B",
    status: "In Stock",
  },
];

const statusColors: Record<string, string> = {
  "In Stock": "oklch(0.65 0.18 160)",
  "Low Stock": "oklch(0.65 0.18 60)",
  "Out of Stock": "oklch(0.65 0.18 15)",
};

export function InventoryDashboardView() {
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
            <Package size={13} />
            {isAr ? "وحدة المخزون" : "Inventory Module"}
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
            {isAr ? "إدارة المخزون" : "Inventory Management"}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: isDark ? "rgba(255,255,255,0.45)" : "#64748B",
              margin: "4px 0 0",
            }}
          >
            {isAr ? "تتبع المنتجات والمخزون في الوقت الفعلي" : "Real-time product & stock tracking"}
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
          <Plus size={16} /> {isAr ? "منتج جديد" : "Add Product"}
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
                transition: "transform 200ms",
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
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${stat.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: isDark ? "#F8FAFC" : "#0F172A" }}>
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

      {/* Products */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            top: "50%",
            insetInlineStart: 14,
            transform: "translateY(-50%)",
            color: isDark ? "rgba(255,255,255,0.3)" : "#94A3B8",
          }}
        />
        <input
          placeholder={isAr ? "ابحث عن منتج..." : "Search products..."}
          style={{
            width: "100%",
            padding: "10px 14px 10px 40px",
            borderRadius: 12,
            background: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"}`,
            color: isDark ? "#F8FAFC" : "#0F172A",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box" as const,
          }}
        />
      </div>

      <div
        style={{
          borderRadius: 14,
          background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)"}`,
          overflow: "hidden",
        }}
      >
        {products.map((prod, i) => {
          const sc = statusColors[prod.status] ?? "oklch(0.55 0.08 0)";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 20px",
                borderBottom:
                  i < products.length - 1
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
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${accent}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Package size={18} style={{ color: accent }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#F8FAFC" : "#0F172A" }}
                >
                  {prod.name}
                </div>
                <div style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8" }}>
                  {prod.sku} · {prod.location}
                </div>
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: prod.stock === 0 ? sc : isDark ? "#F8FAFC" : "#0F172A",
                  flexShrink: 0,
                  width: 60,
                  textAlign: "center" as const,
                }}
              >
                {prod.stock}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: sc,
                  background: `${sc}18`,
                  padding: "3px 10px",
                  borderRadius: 99,
                  flexShrink: 0,
                }}
              >
                {prod.status}
              </span>
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
          ? "هذه بيانات تجريبية — وحدة المخزون قيد التطوير"
          : "This is demo data — the Inventory module is under development"}
      </div>
    </div>
  );
}

export function InventoryProductsView() {
  return <InventoryDashboardView />;
}
