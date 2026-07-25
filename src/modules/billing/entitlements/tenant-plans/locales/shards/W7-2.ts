/**
 * W7-2 — tenant plan detail tabs (General/Features/Pricing/Promotions/Versions).
 *
 * These call sites were reading `entitlements.tenantPlans.*` keys through
 * `t(key) || "<hardcoded English>"`. Most of those keys already carried real
 * copy in both languages and only needed the fallback dropped. A handful of
 * call sites, though, were reusing an EXISTING key whose real translation
 * means something else entirely — e.g. `activeBadge` ("Active") standing in
 * for a version's "Latest" marker, or `subscribers` ("Subscribers") standing
 * in for the full grandfathering warning sentence. Dropping the fallback on
 * those would have silently swapped the intended copy for the wrong word, so
 * this shard adds the missing, correctly-scoped keys instead of reusing a
 * key that means something else.
 */
export const en = {
  entitlements: {
    tenantPlans: {
      latestBadge: "Latest",
      viewSnapshot: "View snapshot",
      currentVersionLabel: "Current version",
      newVersionLabel: "New version",
      featuresSnapshotLabel: "Features snapshot",
      priceCountSnapshotLabel: "Price points snapshot",
      versionNotesPlaceholder:
        "What changed in this version? e.g. added a storage limit, updated pricing",
      selectBillingCycle: "Select billing cycle...",
      // Rendered as `{count} {grandfatheredWarning}` — TFn (shared-helpers.tsx,
      // outside this package's ownership) has no interpolation-params overload,
      // so the count is composed by the caller rather than passed as a t() param.
      grandfatheredWarning: "active subscriber(s) will be grandfathered to the current terms.",
    },
  },
} as const;

export const ar = {
  entitlements: {
    tenantPlans: {
      latestBadge: "الأحدث",
      viewSnapshot: "عرض اللقطة",
      currentVersionLabel: "الإصدار الحالي",
      newVersionLabel: "الإصدار الجديد",
      featuresSnapshotLabel: "لقطة الميزات",
      priceCountSnapshotLabel: "لقطة نقاط الأسعار",
      versionNotesPlaceholder: "ما الذي تغيّر في هذا الإصدار؟ مثال: تمت إضافة حد للتخزين وتحديث الأسعار",
      selectBillingCycle: "اختر دورة الفوترة...",
      grandfatheredWarning: "من المشتركين النشطين سيتم الإبقاء على الشروط الحالية لهم.",
    },
  },
} as const;
