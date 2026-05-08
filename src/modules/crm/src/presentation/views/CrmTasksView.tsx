"use client";
import { CrmPlaceholder } from "../components/CrmPlaceholder";

export function CrmTasksView() {
  return (
    <CrmPlaceholder
      icon="CheckSquare"
      titleEn="Tasks"
      titleAr="المهام"
      descEn="Stay on top of your to-do list. Assign tasks to team members, set due dates, and track completion across deals and contacts."
      descAr="ابقَ على اطلاع بقائمة مهامك. قم بتعيين المهام لأعضاء الفريق وتحديد تواريخ الاستحقاق وتتبع الإنجاز عبر الصفقات وجهات الاتصال."
      stats={[
        { labelEn: "Pending", labelAr: "معلقة", value: "—", color: "oklch(0.58 0.19 60)" },
        { labelEn: "Overdue", labelAr: "متأخرة", value: "—", color: "oklch(0.55 0.20 20)" },
        { labelEn: "Done", labelAr: "منجزة", value: "—", color: "oklch(0.60 0.18 140)" },
      ]}
    />
  );
}
