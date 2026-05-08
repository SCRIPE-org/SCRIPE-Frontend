"use client";
import { CrmPlaceholder } from "../components/CrmPlaceholder";

export function CrmDealsView() {
  return (
    <CrmPlaceholder
      icon="Handshake"
      titleEn="Deals"
      titleAr="الصفقات"
      descEn="Manage your entire sales pipeline. Track deal values, stages, owners, and expected close dates with intelligent forecasting."
      descAr="إدارة خط مبيعاتك بالكامل. تتبع قيم الصفقات والمراحل والمالكين وتواريخ الإغلاق المتوقعة مع التنبؤ الذكي."
      stats={[
        { labelEn: "Open", labelAr: "مفتوحة", value: "—", color: "oklch(0.55 0.20 200)" },
        { labelEn: "Won", labelAr: "مكسوبة", value: "—", color: "oklch(0.60 0.18 140)" },
        { labelEn: "Lost", labelAr: "خاسرة", value: "—", color: "oklch(0.55 0.20 20)" },
        { labelEn: "Value", labelAr: "القيمة", value: "—", color: "oklch(0.58 0.19 60)" },
      ]}
    />
  );
}
