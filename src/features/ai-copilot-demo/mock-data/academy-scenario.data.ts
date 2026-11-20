import type {
  CoachOption,
  GuardianNotificationSample,
  ProposedActionItem,
  SessionReassignmentRow,
} from "../types";

export const ACADEMY_COACH_OPTIONS: CoachOption[] = [
  {
    id: "coach-omar",
    nameEn: "Coach Omar",
    nameAr: "كابتن عمر",
    certification: "CAF C License",
    isAvailable: true,
  },
  {
    id: "coach-karim",
    nameEn: "Coach Karim",
    nameAr: "كابتن كريم",
    certification: "CAF B License",
    isAvailable: true,
  },
  {
    id: "coach-tarek",
    nameEn: "Coach Tarek",
    nameAr: "كابتن طارق",
    certification: "CAF A License",
    isAvailable: false,
  },
  {
    id: "coach-youssef",
    nameEn: "Coach Youssef",
    nameAr: "كابتن يوسف",
    certification: "CAF B License",
    isAvailable: false,
  },
  {
    id: "needs-review",
    nameEn: "Needs Review",
    nameAr: "تحتاج مراجعة",
    certification: "Technical Director Escalation",
    isAvailable: false,
  },
];

export const INITIAL_ACADEMY_SESSIONS: SessionReassignmentRow[] = [
  {
    id: "sess-u12",
    sessionTitleKey: "academy.sessionU12",
    ageGroup: "U12",
    timeRange: "16:00 – 17:30",
    pitchEn: "Pitch B",
    pitchAr: "ملعب B",
    athletesCount: 12,
    guardiansCount: 12,
    currentCoachEn: "Ahmed Hassan",
    currentCoachAr: "أحمد حسن",
    selectedReplacementId: "coach-omar",
    defaultReplacementId: "coach-omar",
    status: "available",
  },
  {
    id: "sess-u14",
    sessionTitleKey: "academy.sessionU14",
    ageGroup: "U14",
    timeRange: "17:45 – 19:15",
    pitchEn: "Pitch A",
    pitchAr: "ملعب A",
    athletesCount: 12,
    guardiansCount: 12,
    currentCoachEn: "Ahmed Hassan",
    currentCoachAr: "أحمد حسن",
    selectedReplacementId: "coach-karim",
    defaultReplacementId: "coach-karim",
    status: "available",
  },
  {
    id: "sess-u16",
    sessionTitleKey: "academy.sessionU16",
    ageGroup: "U16",
    timeRange: "19:30 – 21:00",
    pitchEn: "Main Turf",
    pitchAr: "الملعب الرئيسي",
    athletesCount: 14,
    guardiansCount: 14,
    currentCoachEn: "Ahmed Hassan",
    currentCoachAr: "أحمد حسن",
    selectedReplacementId: "needs-review",
    defaultReplacementId: "needs-review",
    status: "conflict",
    conflictReasonKey: "academy.conflictReasonU16",
  },
];

export const INITIAL_PROPOSED_ACTIONS: ProposedActionItem[] = [
  {
    id: "reassign_sessions",
    labelKey: "academy.actionReassignTitle",
    descriptionKey: "academy.actionReassignDesc",
    enabled: true,
    requiresHumanApproval: true,
  },
  {
    id: "prepare_notifications",
    labelKey: "academy.actionNotifyTitle",
    descriptionKey: "academy.actionNotifyDesc",
    enabled: true,
    requiresHumanApproval: true,
  },
  {
    id: "escalate_conflict",
    labelKey: "academy.actionEscalateTitle",
    descriptionKey: "academy.actionEscalateDesc",
    enabled: true,
    requiresHumanApproval: true,
  },
];

export const GUARDIAN_NOTIFICATION_SAMPLES: GuardianNotificationSample[] = [
  {
    id: "notif-u12",
    group: "U12 Football",
    recipientCount: 12,
    channel: "SMS & Push",
    sampleGuardianEn: "12 U12 Guardians (e.g., Guardian of Yassin M.)",
    sampleGuardianAr: "12 ولي أمر لفريق تحت 12 سنة (مثال: ولي أمر ياسين م.)",
    messageEn:
      "[Al Mokawloon Academy] Tomorrow's U12 Football session (16:00, Pitch B) will be led by Coach Omar instead of Coach Ahmed Hassan. Schedule unchanged.",
    messageAr:
      "[أكاديمية المقاولون العرب] حصة كرة القدم تحت 12 سنة غداً (16:00، ملعب B) سيقودها كابتن عمر بدلاً من كابتن أحمد حسن دون تغيير في الموعد.",
  },
  {
    id: "notif-u14",
    group: "U14 Football",
    recipientCount: 12,
    channel: "SMS & Push",
    sampleGuardianEn: "12 U14 Guardians (e.g., Guardian of Seif K.)",
    sampleGuardianAr: "12 ولي أمر لفريق تحت 14 سنة (مثال: ولي أمر سيف ك.)",
    messageEn:
      "[Al Mokawloon Academy] Tomorrow's U14 Football session (17:45, Pitch A) will be led by Coach Karim instead of Coach Ahmed Hassan. Schedule unchanged.",
    messageAr:
      "[أكاديمية المقاولون العرب] حصة كرة القدم تحت 14 سنة غداً (17:45، ملعب A) سيقودها كابتن كريم بدلاً من كابتن أحمد حسن دون تغيير في الموعد.",
  },
];
