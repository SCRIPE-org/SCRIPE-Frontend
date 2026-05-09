"use client";
import { CrmPlaceholder } from "../components/CrmPlaceholder";

export function CrmDashboardView() {
  return (
    <CrmPlaceholder
      icon="BarChart3"
      titleEn="CRM Dashboard"
      titleAr="لوحة تحكم إدارة العملاء"
      descEn="Get a bird's-eye view of your sales pipeline, key metrics, and team activity. Your unified CRM hub is being built here."
      descAr="احصل على نظرة شاملة لخط مبيعاتك ومقاييسك الرئيسية ونشاط فريقك. يتم بناء مركز إدارة علاقات العملاء الموحد هنا."
      stats={[
        {
          labelEn: "Total Contacts",
          labelAr: "إجمالي جهات الاتصال",
          value: "—",
          color: "oklch(0.55 0.20 200)",
        },
        {
          labelEn: "Open Deals",
          labelAr: "الصفقات المفتوحة",
          value: "—",
          color: "oklch(0.60 0.18 140)",
        },
        { labelEn: "Revenue", labelAr: "الإيرادات", value: "—", color: "oklch(0.58 0.19 60)" },
        { labelEn: "Activities", labelAr: "الأنشطة", value: "—", color: "oklch(0.55 0.20 280)" },
      ]}
    />
  );
}
