"use client";
import { CrmPlaceholder } from "../components/CrmPlaceholder";

export function CrmActivitiesView() {
  return (
    <CrmPlaceholder
      icon="CalendarDays"
      titleEn="Activities"
      titleAr="الأنشطة"
      descEn="Log calls, meetings, and emails. See your team's activity stream in real-time and never miss a follow-up."
      descAr="سجّل المكالمات والاجتماعات والبريد الإلكتروني. اطلع على تدفق نشاط فريقك في الوقت الفعلي ولا تفوتك أي متابعة."
      stats={[
        { labelEn: "Calls", labelAr: "المكالمات", value: "—", color: "oklch(0.55 0.20 200)" },
        { labelEn: "Meetings", labelAr: "الاجتماعات", value: "—", color: "oklch(0.60 0.18 140)" },
        { labelEn: "Emails", labelAr: "البريد", value: "—", color: "oklch(0.55 0.20 280)" },
      ]}
    />
  );
}
