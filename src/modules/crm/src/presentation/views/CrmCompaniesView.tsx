"use client";
import { CrmPlaceholder } from "../components/CrmPlaceholder";

export function CrmCompaniesView() {
  return (
    <CrmPlaceholder
      icon="Building2"
      titleEn="Companies"
      titleAr="الشركات"
      descEn="Track every organization in your ecosystem — parent companies, subsidiaries, and associated contacts all linked together."
      descAr="تتبع كل مؤسسة في نظامك البيئي — الشركات الأم والشركات التابعة وجهات الاتصال المرتبطة كلها متصلة ببعضها."
      stats={[
        { labelEn: "Companies", labelAr: "الشركات", value: "—", color: "oklch(0.55 0.20 200)" },
        { labelEn: "Industries", labelAr: "الصناعات", value: "—", color: "oklch(0.58 0.19 60)" },
      ]}
    />
  );
}
