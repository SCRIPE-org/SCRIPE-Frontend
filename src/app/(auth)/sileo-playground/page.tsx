"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/ui/sileo-toast";

export default function SileoPlaygroundPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { direction, setLanguage } = useI18n();
  const isDark = resolvedTheme === "dark";
  const dir = direction || "ltr";
  const theme = isDark ? "dark" : "light";
  const [lastAction, setLastAction] = React.useState<string>("Ready");

  const fill = isDark ? "#151719" : "#ffffff";

  const triggerToast = (type: string) => {
    setLastAction(`Triggered ${type}`);
    const isAr = dir === "rtl";

    switch (type) {
      case "success":
        toast.success({
          title: isAr ? "تم تأكيد حجز الملعب بنجاح" : "Court Booking Confirmed",
          description: isAr
            ? "تم حجز الملعب رقم 3 للفريق الأول للنادي الأهلي يوم الجمعة الساعة 18:00 UTC."
            : "Court 3 reserved for Al-Ahly First Team on Friday at 18:00 UTC. Confirmation dispatched.",
          duration: 10000,
          autopilot: true,
        });
        break;

      case "error":
        toast.error({
          title: isAr ? "فشل تفويض بوابة الدفع" : "Payment Authorization Failed",
          description: isAr
            ? "رفضت عملية Stripe رقم #ch_9847129: رصيد غير كافٍ في بطاقة العميل."
            : "Stripe transaction declined: Insufficient funds on merchant card. Automatic retry in 15m.",
          duration: 10000,
          autopilot: true,
          button: {
            title: isAr ? "إعادة المحاولة" : "Retry Payment",
            onClick: () => setLastAction("Clicked Retry Payment"),
          },
        });
        break;

      case "warning":
        toast.warning({
          title: isAr ? "تحذير تجاوز الحصة التشغيلية (92%)" : "Resource Quota Exceeded (92%)",
          description: isAr
            ? "اقترب استهلاك باقة المؤسسات الرياضية من الحد الأقصى. متبقي 48 لاعباً فقط."
            : "Monthly active athlete limit reached for Sports-Enterprise tier. 48 slots remaining before lock.",
          duration: 10000,
          autopilot: true,
          button: {
            title: isAr ? "ترقية الباقة" : "Upgrade Tier",
            onClick: () => setLastAction("Clicked Upgrade Tier"),
          },
        });
        break;

      case "info":
        toast.info({
          title: isAr ? "إشعار صيانة المنصة المجدولة" : "Platform Maintenance Notice",
          description: isAr
            ? "ترقية قواعد البيانات ومزامنة الخوادم مجدولة الليلة الساعة 02:00 بالتوقيت العالمي."
            : "Database schema migration and cluster sync scheduled for tonight at 02:00 UTC (10m downtime).",
          duration: 10000,
          autopilot: true,
        });
        break;

      case "action":
        toast.action({
          title: isAr ? "تم إنشاء مسودة الفاتورة #INV-2026-089" : "Invoice #INV-2026-089 Drafted",
          description: isAr
            ? "عقد الرعاية الرياضية السنوي ($45,000) جاهز للمراجعة والاعتماد والمطابقة."
            : "Corporate sponsorship package ($45,000) finalized and validated against financial ledger.",
          duration: 10000,
          autopilot: true,
          button: {
            title: isAr ? "مراجعة وإرسال" : "Review & Send",
            onClick: () => setLastAction("Clicked Review & Send"),
          },
        });
        break;

      case "loading":
        toast.loading({
          title: isAr ? "جاري إنشاء الخريطة التكتيكية..." : "Generating Spatial Heatmap...",
          description: isAr
            ? "حساب وتحليل تحركات وتمركز اللاعبين وسرعات الركض عبر 90 دقيقة..."
            : "Computing spatial positioning, acceleration vectors, and ball progression telemetry across 90 minutes.",
          duration: 10000,
          autopilot: true,
        });
        break;

      case "promise": {
        const promiseFn = new Promise((resolve) => setTimeout(resolve, 2500));
        toast.promise(promiseFn, {
          loading: isAr ? "جاري مزامنة بيانات الأكاديمية..." : "Synchronizing Academy Rosters...",
          success: isAr ? "تمت مزامنة 140 سجل بنجاح!" : "140 Youth Rosters Synchronized!",
          error: isAr ? "فشلت المزامنة" : "Roster Sync Failed",
        });
        break;
      }

      default:
        toast.show({
          title: "Sileo Notification",
          description: "General system status message.",
          duration: 6000,
          autopilot: true,
        });
    }
  };

  return (
    <div
      id="sileo-playground"
      dir={dir}
      style={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#0d0f11" : "#f8f9fa",
        color: isDark ? "#f0f2f5" : "#11181c",
        fontFamily: dir === "rtl" ? "'Tajawal', sans-serif" : "'Plus Jakarta Sans', sans-serif",
        padding: "40px",
        transition: "background-color 200ms ease",
      }}
    >
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        {/* Header Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", borderBottom: `1px solid ${isDark ? "#26292e" : "#e6e8eb"}`, paddingBottom: "24px", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "9999px", background: isDark ? "#151719" : "#ffffff", border: `1px solid ${isDark ? "#26292e" : "#e6e8eb"}`, fontSize: "11px", fontWeight: 600, color: isDark ? "#9ba1a6" : "#687076", marginBottom: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#cbfb45" }} />
              SCRIPE Sovereign OS • Native Sileo Physics Playground
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: isDark ? "#f0f2f5" : "#11181c" }}>
              Sileo Spring Dropdown & Hover Morphing
            </h1>
            <p style={{ fontSize: "14px", color: isDark ? "#9ba1a6" : "#687076", marginTop: "4px", margin: 0 }}>
              Verify SVG gooey filters, spring pill-to-dropdown expansion, hover persistence, and Nexus theme colors.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              id="btn-toggle-theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: `1px solid ${isDark ? "#34383e" : "#d7dbdf"}`,
                background: isDark ? "#151719" : "#ffffff",
                color: isDark ? "#f0f2f5" : "#11181c",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Theme: {theme.toUpperCase()}
            </button>

            <button
              id="btn-toggle-lang"
              onClick={() => setLanguage(dir === "rtl" ? "en" : "ar")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: `1px solid ${isDark ? "#34383e" : "#d7dbdf"}`,
                background: isDark ? "#151719" : "#ffffff",
                color: isDark ? "#f0f2f5" : "#11181c",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Dir: {dir.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Action Status Banner */}
        <div style={{ padding: "12px 16px", borderRadius: "10px", border: `1px solid ${isDark ? "#26292e" : "#e6e8eb"}`, background: isDark ? "#151719" : "#ffffff", fontSize: "13px", color: isDark ? "#9ba1a6" : "#687076", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <span>Status: <strong style={{ color: isDark ? "#f0f2f5" : "#11181c" }}>{lastAction}</strong></span>
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: isDark ? "#687076" : "#889096" }}>Engine: sileo native with SVG gooey filter</span>
        </div>

        {/* Trigger Buttons Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <button
            id="trigger-success"
            onClick={() => triggerToast("success")}
            style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(48, 164, 108, 0.4)", background: "rgba(48, 164, 108, 0.12)", color: "#30a46c", textAlign: "left", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <span>▶ Success Toast</span>
            <span style={{ fontSize: "11px", fontWeight: 400, color: isDark ? "#9ba1a6" : "#687076" }}>Pill ➔ Spring Dropdown</span>
          </button>

          <button
            id="trigger-error"
            onClick={() => triggerToast("error")}
            style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(229, 77, 46, 0.4)", background: "rgba(229, 77, 46, 0.12)", color: "#e54d2e", textAlign: "left", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <span>▶ Error Toast</span>
            <span style={{ fontSize: "11px", fontWeight: 400, color: isDark ? "#9ba1a6" : "#687076" }}>Includes Retry action</span>
          </button>

          <button
            id="trigger-warning"
            onClick={() => triggerToast("warning")}
            style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(241, 161, 13, 0.4)", background: "rgba(241, 161, 13, 0.12)", color: "#f1a10d", textAlign: "left", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <span>▶ Warning Toast</span>
            <span style={{ fontSize: "11px", fontWeight: 400, color: isDark ? "#9ba1a6" : "#687076" }}>Quota threshold notice</span>
          </button>

          <button
            id="trigger-info"
            onClick={() => triggerToast("info")}
            style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(0, 144, 255, 0.4)", background: "rgba(0, 144, 255, 0.12)", color: "#0090ff", textAlign: "left", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <span>▶ Info Toast</span>
            <span style={{ fontSize: "11px", fontWeight: 400, color: isDark ? "#9ba1a6" : "#687076" }}>System maintenance</span>
          </button>

          <button
            id="trigger-action"
            onClick={() => triggerToast("action")}
            style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(139, 92, 246, 0.4)", background: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6", textAlign: "left", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <span>▶ Interactive Action</span>
            <span style={{ fontSize: "11px", fontWeight: 400, color: isDark ? "#9ba1a6" : "#687076" }}>Review & Send button</span>
          </button>

          <button
            id="trigger-loading"
            onClick={() => triggerToast("loading")}
            style={{ padding: "14px", borderRadius: "12px", border: `1px solid ${isDark ? "#34383e" : "#d7dbdf"}`, background: isDark ? "#1d2024" : "#f1f3f5", color: isDark ? "#f0f2f5" : "#11181c", textAlign: "left", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <span>▶ Loading Spinner</span>
            <span style={{ fontSize: "11px", fontWeight: 400, color: isDark ? "#9ba1a6" : "#687076" }}>Spatial heatmap calc</span>
          </button>

          <button
            id="trigger-promise"
            onClick={() => triggerToast("promise")}
            style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(6, 182, 212, 0.4)", background: "rgba(6, 182, 212, 0.12)", color: "#06b6d4", textAlign: "left", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <span>▶ Promise Morphing</span>
            <span style={{ fontSize: "11px", fontWeight: 400, color: isDark ? "#9ba1a6" : "#687076" }}>Loading ➔ Success morph</span>
          </button>

          <button
            id="trigger-clear"
            onClick={() => toast.clear()}
            style={{ padding: "14px", borderRadius: "12px", border: `1px solid ${isDark ? "#26292e" : "#e6e8eb"}`, background: isDark ? "#151719" : "#ffffff", color: isDark ? "#687076" : "#889096", textAlign: "left", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <span>✕ Clear All</span>
            <span style={{ fontSize: "11px", fontWeight: 400, color: isDark ? "#687076" : "#889096" }}>Dismiss all active toasts</span>
          </button>
        </div>

        {/* Behavior Specifications Card */}
        <div style={{ padding: "20px", borderRadius: "12px", border: `1px solid ${isDark ? "#26292e" : "#e6e8eb"}`, background: isDark ? "#151719" : "#ffffff", color: isDark ? "#9ba1a6" : "#687076", fontSize: "13px", lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: isDark ? "#f0f2f5" : "#11181c", marginBottom: "8px" }}>
            Sileo Native Behavior Specifications Verified:
          </div>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li><strong>Initial Arrival:</strong> Toast pops in as a compact pill with icon and title using spring physics.</li>
            <li><strong>Autopilot / Hover Dropdown:</strong> At 150ms (or upon mouse hover), the body drops down via SVG gooey filter, morphing into the full card and revealing description and action buttons.</li>
            <li><strong>Hover Persistence:</strong> Hovering cursor over the expanded toast freezes the timer and keeps the dropdown open for interaction.</li>
            <li><strong>Spring Collapse:</strong> Mouse exit triggers smooth spring collapse back to resting pill before exiting.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
