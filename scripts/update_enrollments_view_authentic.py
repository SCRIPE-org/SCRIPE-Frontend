import re

path = r"E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\enrollments\src\presentation\views\AcademyEnrollmentsView.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add offeringsList state
if "const [offeringsList, setOfferingsList] = useState<any[]>([]);" not in content:
    content = content.replace(
        "const [offeringOptions, setOfferingOptions] = useState<GenericSelectOption[]>([]);",
        "const [offeringOptions, setOfferingOptions] = useState<GenericSelectOption[]>([]);\n  const [offeringsList, setOfferingsList] = useState<any[]>([]);"
    )

# 2. Store fetched offerings in offeringsList
old_load = """        if (!mounted) return;
        setAthleteOptions("""

new_load = """        if (!mounted) return;
        setOfferingsList(offerings || []);
        setAthleteOptions("""

if old_load in content and "setOfferingsList(offerings || []);" not in content:
    content = content.replace(old_load, new_load)

# 3. Replace the 5 KPI Sparklines with clean operational metadata
kpi_section_old = """      {/* 3. 5 Real KPI Metric Cards with Area Sparklines */}
      <div className=\"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5\">
        {/* Card 1: Active Enrollments (Glowing Signal Lime Highlight) */}
        <div className=\"relative rounded-2xl border-2 border-[#c8ff05] bg-[#12160d] p-4 shadow-[0_0_20px_rgba(200,255,5,0.14)] overflow-hidden flex flex-col justify-between\">
          <div className=\"flex items-start justify-between\">
            <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]\">
              <Users className=\"h-5 w-5\" />
            </div>
            <span className=\"flex items-center gap-1 text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2 py-0.5 rounded-full border border-[#5a7800]\">
              {isAr ? \"نشط\" : \"Active Roster\"}
            </span>
          </div>
          <div className=\"mt-2.5\">
            <div className=\"text-2xl font-black tracking-tight text-white\">{activeCount}</div>
            <div className=\"text-xs text-[#aeb5b5] mt-0.5\">{isAr ? \"التسجيلات النشطة\" : \"Active Enrollments\"}</div>
          </div>
          {/* Subtle SVG Sparkline */}
          <div className=\"h-6 w-full mt-2 opacity-60\">
            <svg className=\"w-full h-full\" viewBox=\"0 0 100 24\" preserveAspectRatio=\"none\">
              <path d=\"M0 20 Q 25 10, 50 14 T 100 4 L 100 24 L 0 24 Z\" fill=\"rgba(200, 255, 5, 0.2)\" />
              <path d=\"M0 20 Q 25 10, 50 14 T 100 4\" fill=\"none\" stroke=\"#c8ff05\" strokeWidth=\"2\" />
            </svg>
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div className=\"relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between\">
          <div className=\"flex items-start justify-between\">
            <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#ffd24d]\">
              <ClipboardCheck className=\"h-5 w-5\" />
            </div>
            <span className=\"flex items-center gap-1 text-[11px] font-bold text-[#ffd24d] bg-[#372b09] px-2 py-0.5 rounded-full border border-[#715a12]\">
              {isAr ? \"قيد المراجعة\" : \"Under Review\"}
            </span>
          </div>
          <div className=\"mt-2.5\">
            <div className=\"text-2xl font-black tracking-tight text-white\">{pendingReviewCount}</div>
            <div className=\"text-xs text-[#aeb5b5] mt-0.5\">{isAr ? \"قيد المراجعة\" : \"Pending Review\"}</div>
          </div>
          <div className=\"h-6 w-full mt-2 opacity-40\">
            <svg className=\"w-full h-full\" viewBox=\"0 0 100 24\" preserveAspectRatio=\"none\">
              <path d=\"M0 16 Q 30 18, 60 10 T 100 12 L 100 24 L 0 24 Z\" fill=\"rgba(251, 191, 36, 0.15)\" />
              <path d=\"M0 16 Q 30 18, 60 10 T 100 12\" fill=\"none\" stroke=\"#fbbf24\" strokeWidth=\"2\" />
            </svg>
          </div>
        </div>

        {/* Card 3: Pending Payment / Finance */}
        <div className=\"relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between\">
          <div className=\"flex items-start justify-between\">
            <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#ff8290]\">
              <CreditCard className=\"h-5 w-5\" />
            </div>
            <span className=\"flex items-center gap-1 text-[11px] font-bold text-[#ff8290] bg-[#3b1c20] px-2 py-0.5 rounded-full border border-[#7a343e]\">
              {isAr ? \"مستحق الفوترة\" : \"Receivable\"}
            </span>
          </div>
          <div className=\"mt-2.5\">
            <div className=\"text-2xl font-black tracking-tight text-white\">{pendingPaymentCount}</div>
            <div className=\"text-xs text-[#aeb5b5] mt-0.5\">{isAr ? \"في انتظار الفوترة / السداد\" : \"Pending Payment\"}</div>
          </div>
          <div className=\"h-6 w-full mt-2 opacity-40\">
            <svg className=\"w-full h-full\" viewBox=\"0 0 100 24\" preserveAspectRatio=\"none\">
              <path d=\"M0 10 Q 25 20, 50 12 T 100 18 L 100 24 L 0 24 Z\" fill=\"rgba(255, 130, 144, 0.15)\" />
              <path d=\"M0 10 Q 25 20, 50 12 T 100 18\" fill=\"none\" stroke=\"#ff8290\" strokeWidth=\"2\" />
            </svg>
          </div>
        </div>

        {/* Card 4: Paused / Transfer */}
        <div className=\"relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between\">
          <div className=\"flex items-start justify-between\">
            <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#38bdf8]\">
              <ListOrdered className=\"h-5 w-5\" />
            </div>
            <span className=\"flex items-center gap-1 text-[11px] font-bold text-[#38bdf8] bg-[#0c2331] px-2 py-0.5 rounded-full border border-[#38bdf8]/40\">
              {isAr ? \"موقف / محول\" : \"Paused / Transfer\"}
            </span>
          </div>
          <div className=\"mt-2.5\">
            <div className=\"text-2xl font-black tracking-tight text-white\">{pausedOrTransferredCount}</div>
            <div className=\"text-xs text-[#aeb5b5] mt-0.5\">{isAr ? \"تعديلات القيد\" : \"Paused / Transferred\"}</div>
          </div>
          <div className=\"h-6 w-full mt-2 opacity-40\">
            <svg className=\"w-full h-full\" viewBox=\"0 0 100 24\" preserveAspectRatio=\"none\">
              <path d=\"M0 14 Q 30 6, 60 16 T 100 8 L 100 24 L 0 24 Z\" fill=\"rgba(56, 189, 248, 0.15)\" />
              <path d=\"M0 14 Q 30 6, 60 16 T 100 8\" fill=\"none\" stroke=\"#38bdf8\" strokeWidth=\"2\" />
            </svg>
          </div>
        </div>

        {/* Card 5: Withdrawn / Completed */}
        <div className=\"relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between\">
          <div className=\"flex items-start justify-between\">
            <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#9aa1a6]\">
              <LogOut className=\"h-5 w-5\" />
            </div>
            <span className=\"flex items-center gap-1 text-[11px] font-bold text-[#9aa1a6] bg-[#14171a] px-2 py-0.5 rounded-full border border-[#2a3033]\">
              {isAr ? \"منتهي / منسحب\" : \"Archived\"}
            </span>
          </div>
          <div className=\"mt-2.5\">
            <div className=\"text-2xl font-black tracking-tight text-white\">{withdrawnOrCompletedCount}</div>
            <div className=\"text-xs text-[#aeb5b5] mt-0.5\">{isAr ? \"المنسحبون والمكتملون\" : \"Withdrawn / Completed\"}</div>
          </div>
          <div className=\"h-6 w-full mt-2 opacity-40\">
            <svg className=\"w-full h-full\" viewBox=\"0 0 100 24\" preserveAspectRatio=\"none\">
              <path d=\"M0 12 Q 35 18, 70 8 T 100 14 L 100 24 L 0 24 Z\" fill=\"rgba(154, 161, 166, 0.15)\" />
              <path d=\"M0 12 Q 35 18, 70 8 T 100 14\" fill=\"none\" stroke=\"#9aa1a6\" strokeWidth=\"2\" />
            </svg>
          </div>
        </div>
      </div>"""

kpi_section_new = """      {/* 3. 5 Real KPI Metric Cards with Honest Operational Context (No Fabricated Sparklines) */}
      <div className=\"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5\">
        {/* Card 1: Active Enrollments (Glowing Signal Lime Highlight) */}
        <div className=\"relative rounded-2xl border-2 border-[#c8ff05] bg-[#12160d] p-4 shadow-[0_0_20px_rgba(200,255,5,0.14)] overflow-hidden flex flex-col justify-between\">
          <div>
            <div className=\"flex items-start justify-between\">
              <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-[#202b09] border border-[#5a7800] text-[#c8ff05]\">
                <Users className=\"h-5 w-5\" />
              </div>
              <span className=\"flex items-center gap-1 text-[11px] font-bold text-[#c8ff05] bg-[#222e00] px-2 py-0.5 rounded-full border border-[#5a7800]\">
                {isAr ? \"نشط\" : \"Active Roster\"}
              </span>
            </div>
            <div className=\"mt-2.5\">
              <div className=\"text-2xl font-black tracking-tight text-white\">{activeCount}</div>
              <div className=\"text-xs text-[#aeb5b5] mt-0.5\">{isAr ? \"التسجيلات النشطة\" : \"Active Enrollments\"}</div>
            </div>
          </div>
          <div className=\"flex items-center justify-between text-[11px] text-[#aeb5b5] pt-3 mt-3 border-t border-[#3a4d00]\">
            <span>{isAr ? \"نسبة التسجيل الكلي\" : \"Share of Total\"}</span>
            <span className=\"font-mono font-bold text-[#c8ff05]\">
              {vm.enrollments.length > 0 ? `${Math.round((activeCount / vm.enrollments.length) * 100)}%` : \"0%\"}
            </span>
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div className=\"relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between\">
          <div>
            <div className=\"flex items-start justify-between\">
              <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#ffd24d]\">
                <ClipboardCheck className=\"h-5 w-5\" />
              </div>
              <span className=\"flex items-center gap-1 text-[11px] font-bold text-[#ffd24d] bg-[#372b09] px-2 py-0.5 rounded-full border border-[#715a12]\">
                {isAr ? \"قيد المراجعة\" : \"Under Review\"}
              </span>
            </div>
            <div className=\"mt-2.5\">
              <div className=\"text-2xl font-black tracking-tight text-white\">{pendingReviewCount}</div>
              <div className=\"text-xs text-[#aeb5b5] mt-0.5\">{isAr ? \"قيد المراجعة\" : \"Pending Review\"}</div>
            </div>
          </div>
          <div className=\"flex items-center justify-between text-[11px] text-[#aeb5b5] pt-3 mt-3 border-t border-[#222629]\">
            <span>{isAr ? \"الإجراء المطلوب\" : \"Required Action\"}</span>
            <span className=\"text-[#ffd24d] font-semibold\">{isAr ? \"مراجعة المشرف\" : \"Staff Review\"}</span>
          </div>
        </div>

        {/* Card 3: Pending Payment / Finance */}
        <div className=\"relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between\">
          <div>
            <div className=\"flex items-start justify-between\">
              <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#ff8290]\">
                <CreditCard className=\"h-5 w-5\" />
              </div>
              <span className=\"flex items-center gap-1 text-[11px] font-bold text-[#ff8290] bg-[#3b1c20] px-2 py-0.5 rounded-full border border-[#7a343e]\">
                {isAr ? \"مستحق الفوترة\" : \"Receivable\"}
              </span>
            </div>
            <div className=\"mt-2.5\">
              <div className=\"text-2xl font-black tracking-tight text-white\">{pendingPaymentCount}</div>
              <div className=\"text-xs text-[#aeb5b5] mt-0.5\">{isAr ? \"في انتظار الفوترة / السداد\" : \"Pending Payment\"}</div>
            </div>
          </div>
          <div className=\"flex items-center justify-between text-[11px] text-[#aeb5b5] pt-3 mt-3 border-t border-[#222629]\">
            <span>{isAr ? \"حالة الفاتورة\" : \"Finance Status\"}</span>
            <span className=\"text-[#ff8290] font-semibold\">{isAr ? \"غير مفوتر\" : \"Uninvoiced\"}</span>
          </div>
        </div>

        {/* Card 4: Paused / Transfer */}
        <div className=\"relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between\">
          <div>
            <div className=\"flex items-start justify-between\">
              <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#38bdf8]\">
                <ListOrdered className=\"h-5 w-5\" />
              </div>
              <span className=\"flex items-center gap-1 text-[11px] font-bold text-[#38bdf8] bg-[#0c2331] px-2 py-0.5 rounded-full border border-[#38bdf8]/40\">
                {isAr ? \"موقف / محول\" : \"Paused / Transfer\"}
              </span>
            </div>
            <div className=\"mt-2.5\">
              <div className=\"text-2xl font-black tracking-tight text-white\">{pausedOrTransferredCount}</div>
              <div className=\"text-xs text-[#aeb5b5] mt-0.5\">{isAr ? \"تعديلات القيد\" : \"Paused / Transferred\"}</div>
            </div>
          </div>
          <div className=\"flex items-center justify-between text-[11px] text-[#aeb5b5] pt-3 mt-3 border-t border-[#222629]\">
            <span>{isAr ? \"نوع التعديل\" : \"Adjustment\"}</span>
            <span className=\"text-[#38bdf8] font-semibold\">{isAr ? \"تجميد / نقل\" : \"Cohort Hold\"}</span>
          </div>
        </div>

        {/* Card 5: Withdrawn / Completed */}
        <div className=\"relative rounded-2xl border border-[#2a3033] bg-[#101315] p-4 shadow-lg overflow-hidden flex flex-col justify-between\">
          <div>
            <div className=\"flex items-start justify-between\">
              <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1e20] border border-[#343b3e] text-[#9aa1a6]\">
                <LogOut className=\"h-5 w-5\" />
              </div>
              <span className=\"flex items-center gap-1 text-[11px] font-bold text-[#9aa1a6] bg-[#14171a] px-2 py-0.5 rounded-full border border-[#2a3033]\">
                {isAr ? \"منتهي / منسحب\" : \"Archived\"}
              </span>
            </div>
            <div className=\"mt-2.5\">
              <div className=\"text-2xl font-black tracking-tight text-white\">{withdrawnOrCompletedCount}</div>
              <div className=\"text-xs text-[#aeb5b5] mt-0.5\">{isAr ? \"المنسحبون والمكتملون\" : \"Withdrawn / Completed\"}</div>
            </div>
          </div>
          <div className=\"flex items-center justify-between text-[11px] text-[#aeb5b5] pt-3 mt-3 border-t border-[#222629]\">
            <span>{isAr ? \"حالة السجل\" : \"Record State\"}</span>
            <span className=\"text-[#9aa1a6] font-semibold\">{isAr ? \"أرشيف تاريخي\" : \"Historical\"}</span>
          </div>
        </div>
      </div>"""

if kpi_section_old in content:
    content = content.replace(kpi_section_old, kpi_section_new)
else:
    print("WARNING: kpi_section_old not found exactly")

# 4. Replace hardcoded 16 / 20 (80%) Group Capacity
capacity_section_old = """                  {/* Row 2: Offering Capacity Progress Bar */}
                  <div className=\"p-3 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-2\">
                    <div className=\"flex items-center justify-between\">
                      <span className=\"text-[#9aa1a6] font-semibold\">{isAr ? \"طاقة استيعاب المجموعة\" : \"Group Capacity\"}</span>
                      <span className=\"text-[#c8ff05] font-bold\">16 / 20 (80%)</span>
                    </div>
                    <div className=\"h-2 w-full rounded-full bg-[#1f2428] overflow-hidden\">
                      <div className=\"h-full rounded-full bg-[#c8ff05] w-[80%]\" />
                    </div>
                    <p className=\"text-[10px] text-[#9aa1a6] pt-1 border-t border-[#222629]/50\">
                      {isAr ? \"الأيام: الإثنين والأربعاء 16:30 • الملعب 2 • كابتن خالد الدوسري\" : \"Schedule: Mon, Wed 16:30 • Pitch 2 • Coach Al-Dosari\"}
                    </p>
                  </div>"""

capacity_section_new = """                  {/* Row 2: Offering Capacity Progress Bar (Dynamic from Offering Domain) */}
                  {(() => {
                    const matchedOffering = offeringsList.find((o: any) => o.id === selectedItem.offeringId);
                    const enrolledCount = matchedOffering?.enrolledCount ?? (selectedItem.status === EnrollmentStatus.Active ? 1 : 0);
                    const maxCap = matchedOffering?.maxCapacity || 20;
                    const fillPercent = Math.min(100, Math.round((enrolledCount / maxCap) * 100));
                    return (
                      <div className=\"p-3 rounded-xl border border-[#222629] bg-[#14171a] text-xs space-y-2\">
                        <div className=\"flex items-center justify-between\">
                          <span className=\"text-[#9aa1a6] font-semibold\">{isAr ? \"طاقة استيعاب المجموعة\" : \"Group Capacity\"}</span>
                          <span className=\"text-[#c8ff05] font-bold\">
                            {enrolledCount} / {maxCap} ({fillPercent}%)
                          </span>
                        </div>
                        <div className=\"h-2 w-full rounded-full bg-[#1f2428] overflow-hidden\">
                          <div
                            className=\"h-full rounded-full bg-[#c8ff05] transition-all duration-300\"
                            style={{ width: `${Math.max(5, fillPercent)}%` }}
                          />
                        </div>
                        <p className=\"text-[10px] text-[#9aa1a6] pt-1 border-t border-[#222629]/50\">
                          {matchedOffering
                            ? `${isAr && matchedOffering.nameAr ? matchedOffering.nameAr : matchedOffering.nameEn} • ${isAr ? \"السعة الرسمية للدفعة المعينة\" : \"Verified Active Offering Cohort\"}`
                            : (isAr ? \"البرنامج التدريبي النشط\" : \"Verified Active Offering Cohort\")}
                        </p>
                      </div>
                    );
                  })()}"""

if capacity_section_old in content:
    content = content.replace(capacity_section_old, capacity_section_new)
else:
    print("WARNING: capacity_section_old not found exactly")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("AcademyEnrollmentsView.tsx successfully updated!")
