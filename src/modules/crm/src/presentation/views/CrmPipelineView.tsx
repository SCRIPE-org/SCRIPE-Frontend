"use client";
import { CrmPlaceholder } from "../components/CrmPlaceholder";

export function CrmPipelineView() {
  return (
    <CrmPlaceholder
      icon="GitBranch"
      titleEn="Pipeline"
      titleAr="خط المبيعات"
      descEn="Visualise your entire sales process on a Kanban board. Drag deals between stages and get instant pipeline health insights."
      descAr="تصور عملية المبيعات بالكامل على لوحة كانبان. اسحب الصفقات بين المراحل واحصل على رؤى فورية حول حالة خط المبيعات."
      stats={[
        { labelEn: "Stages", labelAr: "المراحل", value: "—", color: "oklch(0.55 0.20 200)" },
        { labelEn: "Avg. Days", labelAr: "متوسط الأيام", value: "—", color: "oklch(0.58 0.19 60)" },
      ]}
    />
  );
}
