"use client";
import { CrmPlaceholder } from "../components/CrmPlaceholder";

export function CrmContactsView() {
  return (
    <CrmPlaceholder
      icon="Contact"
      titleEn="Contacts"
      titleAr="جهات الاتصال"
      descEn="Manage all your leads, prospects, and customers in one place. Full contact profiles, interaction history, and segmentation coming soon."
      descAr="إدارة جميع عملاء المحتملين والعملاء في مكان واحد. ملفات تعريف جهات الاتصال الكاملة وسجل التفاعل والتجزئة قادمة قريباً."
      stats={[
        { labelEn: "Leads", labelAr: "العملاء المحتملون", value: "—", color: "oklch(0.55 0.20 200)" },
        { labelEn: "Customers", labelAr: "العملاء", value: "—", color: "oklch(0.60 0.18 140)" },
        { labelEn: "Segments", labelAr: "الشرائح", value: "—", color: "oklch(0.55 0.20 280)" },
      ]}
    />
  );
}
