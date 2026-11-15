"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS, checkGroupAgeEligibility } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useTrainingGroupDetailViewModel } from "../viewmodels/useTrainingGroupDetailViewModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Badge } from "@core/ui/badge";
import {
  Users,
  UserPlus,
  ArrowLeftRight,
  UserMinus,
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Phone,
  ShieldCheck,
  Award,
  Pencil
} from "lucide-react";
import { EditTrainingGroupModal } from "../components/EditTrainingGroupModal";
import type { GroupRosterItem, GroupCoachRole, AvailableCoach, TrainingGroup } from "../../domain/entities/TrainingGroup";
import type { AcademyEnrollment } from "@modules/academy/enrollments/src/domain/entities/AcademyEnrollment";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";

interface TrainingGroupDetailViewProps {
  groupId: string;
  onBack?: () => void;
}

export function TrainingGroupDetailView({ groupId, onBack }: TrainingGroupDetailViewProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.push("/academy/groups"));
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";

  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_GROUPS_VIEW);
  const canManage = usePermission(ACADEMY_PERMISSIONS.ACADEMY_GROUPS_UPDATE);
  const canOverrideAge = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_OVERRIDE);

  const locator = useAcademyServiceLocator();
  const {
    group,
    roster,
    coaches,
    loading,
    error,
    successMessage,
    loadGroupDetails,
    assignAthlete,
    removeAthlete,
    transferAthlete,
    assignCoach,
    removeCoach
  } = useTrainingGroupDetailViewModel(locator.groupsRepository);

  const [activeTab, setActiveTab] = useState<"roster" | "coaches">("roster");
  const [showEditModal, setShowEditModal] = useState(false);

  // Modals
  const [showAssignAthleteModal, setShowAssignAthleteModal] = useState(false);
  const [enrollmentIdInput, setEnrollmentIdInput] = useState("");
  const [assignStartDate, setAssignStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignAgeOverrideJustification, setAssignAgeOverrideJustification] = useState("");

  const [transferTargetItem, setTransferTargetItem] = useState<GroupRosterItem | null>(null);
  const [targetGroupIdInput, setTargetGroupIdInput] = useState("");
  const [transferReasonInput, setTransferReasonInput] = useState("");
  const [transferEffectiveDate, setTransferEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [transferAgeOverrideJustification, setTransferAgeOverrideJustification] = useState("");

  const [removeTargetItem, setRemoveTargetItem] = useState<GroupRosterItem | null>(null);
  const [removeReasonInput, setRemoveReasonInput] = useState("");

  const [showAssignCoachModal, setShowAssignCoachModal] = useState(false);
  const [staffMemberIdInput, setStaffMemberIdInput] = useState("");
  const [coachRoleInput, setCoachRoleInput] = useState<GroupCoachRole>("HeadCoach");
  const [coachAssignedDate, setCoachAssignedDate] = useState(new Date().toISOString().split("T")[0]);

  // Searchable Select States & Queries
  const [availableEnrollments, setAvailableEnrollments] = useState<AcademyEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const [otherGroups, setOtherGroups] = useState<TrainingGroup[]>([]);
  const [loadingOtherGroups, setLoadingOtherGroups] = useState(false);

  const [availableCoaches, setAvailableCoaches] = useState<AvailableCoach[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);

  useEffect(() => {
    if (showAssignAthleteModal && group?.offeringId) {
      setLoadingEnrollments(true);
      locator.enrollmentsRepository.getEnrollments(group.offeringId)
        .then(data => {
          const activeRosterEnrollmentIds = new Set(roster.filter(r => r.status === "Active").map(r => r.enrollmentId));
          setAvailableEnrollments(data.filter(e => !activeRosterEnrollmentIds.has(e.id)));
        })
        .catch(() => {})
        .finally(() => setLoadingEnrollments(false));
    }
  }, [showAssignAthleteModal, group?.offeringId, roster, locator.enrollmentsRepository]);

  useEffect(() => {
    if (transferTargetItem && group?.offeringId) {
      setLoadingOtherGroups(true);
      locator.groupsRepository.getGroups(group.offeringId)
        .then(data => {
          setOtherGroups(data.filter(g => g.id !== group.id && g.status === "Active"));
        })
        .catch(() => {})
        .finally(() => setLoadingOtherGroups(false));
    }
  }, [transferTargetItem, group?.offeringId, group?.id, locator.groupsRepository]);

  useEffect(() => {
    if (showAssignCoachModal) {
      setLoadingCoaches(true);
      locator.groupsRepository.getAvailableCoaches()
        .then(data => {
          const assignedStaffIds = new Set((coaches || []).filter(c => c.isActive).map(c => c.staffMemberId));
          setAvailableCoaches(data.filter(c => !assignedStaffIds.has(c.staffMemberId)));
        })
        .catch(() => {})
        .finally(() => setLoadingCoaches(false));
    }
  }, [showAssignCoachModal, coaches, locator.groupsRepository]);

  const selectedAssignEnrollment = availableEnrollments.find(e => e.id === enrollmentIdInput);
  const assignAgeCheck = checkGroupAgeEligibility(
    selectedAssignEnrollment?.athleteDateOfBirth,
    group?.minAge,
    group?.maxAge,
    group?.seasonReferenceYear
  );

  const selectedTargetGroup = otherGroups.find(g => g.id === targetGroupIdInput);
  const transferAgeCheck = checkGroupAgeEligibility(
    transferTargetItem?.dateOfBirth,
    selectedTargetGroup?.minAge,
    selectedTargetGroup?.maxAge,
    selectedTargetGroup?.seasonReferenceYear
  );

  const enrollmentOptions: GenericSelectOption[] = availableEnrollments.map(e => {
    const ageCheck = checkGroupAgeEligibility(
      e.athleteDateOfBirth,
      group?.minAge,
      group?.maxAge,
      group?.seasonReferenceYear
    );
    const disabled = ageCheck.isOverAge || (ageCheck.isUnderAge && !canOverrideAge);
    const ageTag = ageCheck.isOverAge
      ? ` | ⛔ ${language === "ar" ? "أكبر سنًا (ممنوع)" : "Over-age (Prohibited)"}`
      : ageCheck.isUnderAge
      ? ` | ⚠️ ${language === "ar" ? "أصغر سنًا (يتطلب استثناء)" : "Under-age (Override Required)"}`
      : "";

    return {
      value: e.id,
      label: (language === "ar" && e.athleteNameAr) ? e.athleteNameAr : (e.athleteNameEn || e.athleteId),
      disabled,
      description: `${language === "ar" ? "الحالة:" : "Status:"} ${e.status} | ${language === "ar" ? "الفوترة:" : "Billing:"} ${e.billingStatus}${ageTag}${ageCheck.reasonEn ? ` — ${language === "ar" ? ageCheck.reasonAr : ageCheck.reasonEn}` : ""}`
    };
  });

  const groupOptions: GenericSelectOption[] = otherGroups.map(g => {
    const ageCheck = checkGroupAgeEligibility(
      transferTargetItem?.dateOfBirth,
      g.minAge,
      g.maxAge,
      g.seasonReferenceYear
    );
    const disabled = ageCheck.isOverAge || (ageCheck.isUnderAge && !canOverrideAge);
    const ageTag = ageCheck.isOverAge
      ? ` | ⛔ ${language === "ar" ? "أكبر سنًا (ممنوع)" : "Over-age (Prohibited)"}`
      : ageCheck.isUnderAge
      ? ` | ⚠️ ${language === "ar" ? "أصغر سنًا (يتطلب استثناء)" : "Under-age (Override Required)"}`
      : "";

    return {
      value: g.id,
      label: (language === "ar" && g.nameAr) ? g.nameAr : g.nameEn,
      disabled,
      description: `${language === "ar" ? "السعة:" : "Capacity:"} ${g.activeMemberCount}/${g.maxCapacity}${g.code ? ` (${g.code})` : ""}${ageTag}${ageCheck.reasonEn ? ` — ${language === "ar" ? ageCheck.reasonAr : ageCheck.reasonEn}` : ""}`
    };
  });

  const coachOptions: GenericSelectOption[] = availableCoaches.map(c => ({
    value: c.staffMemberId,
    label: c.fullName,
    description: `${c.sportNameEn} • ${c.qualificationLevel}${c.licenseExpiryDate ? ` (Exp: ${c.licenseExpiryDate})` : ""}`
  }));

  useEffect(() => {
    loadGroupDetails(groupId);
  }, [loadGroupDetails, groupId]);

  const handleAssignAthleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentIdInput) return;
    if (assignAgeCheck.isOverAge) return;
    if (assignAgeCheck.isUnderAge && (!canOverrideAge || !assignAgeOverrideJustification.trim())) return;

    try {
      await assignAthlete(groupId, {
        enrollmentId: enrollmentIdInput.trim(),
        startDate: assignStartDate,
        ageOverrideJustification: assignAgeCheck.isUnderAge ? assignAgeOverrideJustification.trim() : null
      });
      setShowAssignAthleteModal(false);
      setEnrollmentIdInput("");
      setAssignAgeOverrideJustification("");
    } catch {
      // viewmodel handles error
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetItem || !targetGroupIdInput || !transferReasonInput) return;
    if (transferAgeCheck.isOverAge) return;
    if (transferAgeCheck.isUnderAge && (!canOverrideAge || !transferAgeOverrideJustification.trim())) return;

    try {
      await transferAthlete(groupId, transferTargetItem.membershipId, {
        targetGroupId: targetGroupIdInput.trim(),
        reason: transferReasonInput.trim(),
        effectiveDate: transferEffectiveDate,
        ageOverrideJustification: transferAgeCheck.isUnderAge ? transferAgeOverrideJustification.trim() : null
      });
      setTransferTargetItem(null);
      setTargetGroupIdInput("");
      setTransferReasonInput("");
      setTransferAgeOverrideJustification("");
    } catch {
      // viewmodel handles error
    }
  };

  const handleRemoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeTargetItem) return;
    try {
      await removeAthlete(groupId, removeTargetItem.membershipId, removeReasonInput.trim() || undefined);
      setRemoveTargetItem(null);
      setRemoveReasonInput("");
    } catch {
      // viewmodel handles error
    }
  };

  const handleAssignCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffMemberIdInput) return;
    try {
      await assignCoach(groupId, {
        staffMemberId: staffMemberIdInput.trim(),
        role: coachRoleInput,
        assignedDate: coachAssignedDate
      });
      setShowAssignCoachModal(false);
      setStaffMemberIdInput("");
    } catch {
      // viewmodel handles error
    }
  };

  if (!canView) {
    return (
      <div className="mx-auto my-12 max-w-xl p-6" dir={dir}>
        <Alert variant="destructive">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold text-nx-ink">Access Restricted</AlertTitle>
          <AlertDescription className="mt-2 text-xs text-nx-ink-2">
            You do not have permission to view Training Group details.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading && !group) {
    return (
      <div className="flex justify-center p-24">
        <LoadingSpinner className="size-8 text-nx-accent" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center space-y-4" dir={dir}>
        <p className="text-nx-ink-2">{language === "ar" ? "المجموعة التدريبية غير موجودة." : "Training group not found."}</p>
        <Button onClick={handleBack} variant="outline" className="border-nx-line text-nx-ink">
          <ArrowLeft className="mr-2 size-4" />
          {language === "ar" ? "العودة للقائمة" : "Back to Groups"}
        </Button>
      </div>
    );
  }

  const isFull = group.activeMemberCount >= group.maxCapacity;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6" dir={dir}>
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex size-8 p-0 items-center justify-center rounded-md border border-nx-line text-nx-ink-2 hover:bg-nx-raised transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-nx-ink">
                  {language === "ar" ? group.nameAr : group.nameEn}
                </h1>
                {group.code && (
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-nx-raised text-nx-ink-2 border border-nx-line">
                    {group.code}
                  </span>
                )}
                <Badge
                  variant={group.status === "Active" ? "outline" : "secondary"}
                  className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                >
                  {group.status}
                </Badge>
              </div>
              <p className="text-xs text-nx-ink-2 mt-0.5">
                {language === "ar" ? group.offeringNameAr : group.offeringNameEn}
              </p>
              {(group.scheduleDescriptionEn || group.scheduleDescriptionAr) && (
                <div className="flex items-center gap-1.5 text-xs text-nx-ink-2 mt-1">
                  <Calendar className="size-3.5 text-nx-accent" />
                  <span>
                    {language === "ar"
                      ? group.scheduleDescriptionAr || group.scheduleDescriptionEn
                      : group.scheduleDescriptionEn || group.scheduleDescriptionAr}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Capacity Indicator Pill */}
        <div className="flex items-center gap-3">
          {canManage && group.status !== "Archived" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="border-nx-line text-xs text-nx-ink flex items-center gap-1.5"
            >
              <Pencil className="size-3.5" />
              {language === "ar" ? "تعديل المجموعة" : "Edit Group"}
            </Button>
          )}
          {/* Age Bracket Indicator Pill */}
          {((group.minAge !== undefined && group.minAge !== null) || (group.maxAge !== undefined && group.maxAge !== null)) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-nx-line bg-nx-surface">
              <Award className="size-4 text-nx-accent" />
              <span className="text-xs text-nx-ink-2">{language === "ar" ? "الفئة العمرية:" : "Age Bracket:"}</span>
              <span className="text-xs font-bold text-nx-ink">
                U{group.maxAge ?? 18} ({group.minAge ?? 0}–{group.maxAge ?? "∞"} {language === "ar" ? "سنة" : "yrs"})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-nx-line bg-nx-surface">
            <Users className="size-4 text-nx-accent" />
            <span className="text-xs text-nx-ink-2">{language === "ar" ? "السعة:" : "Capacity:"}</span>
            <span className={`text-xs font-bold ${isFull ? "text-amber-500" : "text-nx-ink"}`}>
              {group.activeMemberCount} / {group.maxCapacity}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{language === "ar" ? "خطأ" : "Error"}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-nx-line bg-nx-raised text-nx-ink">
          <AlertTitle>{language === "ar" ? "نجاح" : "Success"}</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex border-b border-nx-line gap-2">
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "roster"
              ? "border-nx-accent text-nx-accent"
              : "border-transparent text-nx-ink-2 hover:text-nx-ink"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            <span>{language === "ar" ? "قائمة الفريق" : "Squad Roster"}</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-nx-raised border border-nx-line">
              {roster.length}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("coaches")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "coaches"
              ? "border-nx-accent text-nx-accent"
              : "border-transparent text-nx-ink-2 hover:text-nx-ink"
          }`}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="size-4" />
            <span>{language === "ar" ? "المدربون" : "Coaches"}</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-nx-raised border border-nx-line">
              {coaches.length}
            </span>
          </div>
        </button>
      </div>

      {/* Tab 1: Squad Roster */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-nx-ink-2">
              {language === "ar"
                ? "قائمة الرياضيين المقيدين حالياً في هذه المجموعة التدريبية."
                : "Active athletes assigned to this training cohort under governed enrollment."}
            </p>

            {canManage && (
              <Button
                size="sm"
                disabled={isFull}
                onClick={() => setShowAssignAthleteModal(true)}
                className="bg-nx-accent hover:bg-nx-accent/90 text-nx-surface disabled:opacity-50"
              >
                <UserPlus className="mr-2 size-4" />
                {language === "ar" ? "إلحاق رياضي" : "Assign Athlete"}
              </Button>
            )}
          </div>

          {roster.length === 0 ? (
            <Card className="border-dashed border-2 border-nx-line bg-nx-surface p-12 text-center">
              <CardContent className="space-y-3">
                <Users className="mx-auto size-10 text-nx-ink-2/40" />
                <p className="text-sm text-nx-ink-2">
                  {language === "ar"
                    ? "لا يوجد رياضيون ملحقون بهذه المجموعة بعد."
                    : "No athletes currently placed in this squad."}
                </p>
                {canManage && !isFull && (
                  <Button
                    size="sm"
                    onClick={() => setShowAssignAthleteModal(true)}
                    className="bg-nx-accent text-nx-surface"
                  >
                    <UserPlus className="mr-2 size-4" />
                    {language === "ar" ? "إلحاق أول رياضي" : "Assign First Athlete"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border border-nx-line bg-nx-surface overflow-hidden">
              <table className="w-full text-left text-sm" dir={dir}>
                <thead className="border-b border-nx-line bg-nx-canvas text-xs uppercase text-nx-ink-2">
                  <tr>
                    <th className="p-3.5 font-semibold">{language === "ar" ? "اسم الرياضي" : "Athlete"}</th>
                    <th className="p-3.5 font-semibold">{language === "ar" ? "تاريخ الميلاد / الجنس" : "DOB / Gender"}</th>
                    <th className="p-3.5 font-semibold">{language === "ar" ? "حالة التسجيل" : "Enrollment"}</th>
                    <th className="p-3.5 font-semibold">{language === "ar" ? "تاريخ الانضمام" : "Joined"}</th>
                    <th className="p-3.5 font-semibold">{language === "ar" ? "ولي الأمر / طوارئ" : "Guardian / Emergency"}</th>
                    {canManage && <th className="p-3.5 font-semibold text-right">{language === "ar" ? "الإجراءات" : "Actions"}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-nx-line text-nx-ink">
                  {roster.map(item => (
                    <tr key={item.membershipId} className="hover:bg-nx-canvas/50 transition-colors">
                      <td className="p-3.5 font-medium">
                        <div>
                          <span>{language === "ar" ? item.athleteNameAr || item.athleteNameEn : item.athleteNameEn}</span>
                          <span className="block text-[11px] text-nx-ink-2 font-mono">ID: {item.athleteId.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-xs text-nx-ink-2">
                        {item.dateOfBirth || "N/A"} • {item.gender || "Mixed"}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="text-xs border-nx-line text-nx-ink-2">
                          {item.enrollmentStatus}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-xs text-nx-ink-2">
                        {item.startDate}
                      </td>
                      <td className="p-3.5 text-xs">
                        {item.guardianNameEn && (
                          <div className="text-nx-ink font-medium">{item.guardianNameEn}</div>
                        )}
                        {item.emergencyPhone && (
                          <div className="flex items-center gap-1 text-nx-ink-2 text-[11px]">
                            <Phone className="size-3" />
                            <span>{item.emergencyPhone}</span>
                          </div>
                        )}
                      </td>
                      {canManage && (
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTransferTargetItem(item)}
                              className="border-nx-line text-xs hover:border-nx-accent hover:text-nx-accent"
                            >
                              <ArrowLeftRight className="mr-1 size-3.5" />
                              {language === "ar" ? "نقل" : "Transfer"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRemoveTargetItem(item)}
                              className="text-xs text-red-500 hover:bg-red-500/10"
                            >
                              <UserMinus className="mr-1 size-3.5" />
                              {language === "ar" ? "استبعاد" : "Remove"}
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Assigned Coaches */}
      {activeTab === "coaches" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-nx-ink-2">
              {language === "ar"
                ? "المدربون المؤهلون والمعينون لقيادة هذه المجموعة وفق معايير SportsCore وHRMS."
                : "Staff members assigned to this group, verified against HRMS and SportsCore qualifications."}
            </p>

            {canManage && (
              <Button
                size="sm"
                onClick={() => setShowAssignCoachModal(true)}
                className="bg-nx-accent hover:bg-nx-accent/90 text-nx-surface"
              >
                <UserCheck className="mr-2 size-4" />
                {language === "ar" ? "تعيين مدرب" : "Assign Coach"}
              </Button>
            )}
          </div>

          {coaches.length === 0 ? (
            <Card className="border-dashed border-2 border-nx-line bg-nx-surface p-12 text-center">
              <CardContent className="space-y-3">
                <Award className="mx-auto size-10 text-nx-ink-2/40" />
                <p className="text-sm text-nx-ink-2">
                  {language === "ar"
                    ? "لم يتم تعيين أي مدرب لهذه المجموعة حتى الآن."
                    : "No coaches currently assigned to this training squad."}
                </p>
                {canManage && (
                  <Button
                    size="sm"
                    onClick={() => setShowAssignCoachModal(true)}
                    className="bg-nx-accent text-nx-surface"
                  >
                    <UserCheck className="mr-2 size-4" />
                    {language === "ar" ? "تعيين المدرب الرئيسي" : "Assign Head Coach"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coaches.map(coach => (
                <Card key={coach.id} className="border-nx-line bg-nx-surface p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-nx-ink">{coach.staffFullName}</span>
                      <Badge
                        variant="outline"
                        className={
                          coach.role === "HeadCoach"
                            ? "border-blue-500/30 text-blue-500 bg-blue-500/10 text-[10px]"
                            : "border-nx-line text-nx-ink-2 text-[10px]"
                        }
                      >
                        {coach.role}
                      </Badge>
                    </div>
                    {coach.staffEmail && <p className="text-xs text-nx-ink-2">{coach.staffEmail}</p>}
                    <p className="text-[11px] text-nx-ink-2 flex items-center gap-1 pt-1">
                      <Calendar className="size-3" />
                      <span>{language === "ar" ? "تاريخ التعيين:" : "Assigned:"} {coach.assignedDate}</span>
                    </p>
                  </div>

                  {canManage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCoach(groupId, coach.id)}
                      className="text-xs text-red-500 hover:bg-red-500/10"
                    >
                      {language === "ar" ? "إلغاء التعيين" : "Unassign"}
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Assign Athlete */}
      {showAssignAthleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-4" dir={dir}>
            <h2 className="text-lg font-bold text-nx-ink">
              {language === "ar" ? "إلحاق رياضي بالمجموعة" : "Assign Athlete to Squad"}
            </h2>
            <form onSubmit={handleAssignAthleteSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "الرياضي / التسجيل النشط *" : "Athlete / Active Enrollment *"}
                </label>
                <GenericSelect
                  searchable
                  options={enrollmentOptions}
                  value={enrollmentIdInput}
                  onValueChange={(val: string | string[]) => setEnrollmentIdInput(val as string)}
                  placeholder={language === "ar" ? "اختر الرياضي من التسجيلات المتاحة..." : "Select Athlete from available enrollments..."}
                  loading={loadingEnrollments}
                />
                <span className="text-[11px] text-nx-ink-2 mt-1 block">
                  {language === "ar"
                    ? "يتم عرض التسجيلات التابعة لنفس العرض والتي لم تلحق بهذه المجموعة بعد."
                    : "Showing unassigned enrollments belonging to this offering."}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "تاريخ البدء" : "Effective Start Date"}
                </label>
                <input
                  type="date"
                  value={assignStartDate}
                  onChange={e => setAssignStartDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
                />
              </div>

              {/* Age Eligibility Feedback */}
              {enrollmentIdInput && (
                <>
                  {assignAgeCheck.isOverAge && (
                    <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-xs text-red-500 font-medium">
                      {language === "ar" ? assignAgeCheck.reasonAr : assignAgeCheck.reasonEn}
                    </div>
                  )}

                  {assignAgeCheck.isUnderAge && canOverrideAge && (
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs text-amber-500 font-medium">
                        {language === "ar" ? assignAgeCheck.reasonAr : assignAgeCheck.reasonEn}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                          {language === "ar" ? "مبرر استثناء تصعيد الفئة (إلزامي للرقابة) *" : "Playing-Up Override Justification (Mandatory) *"}
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={assignAgeOverrideJustification}
                          onChange={e => setAssignAgeOverrideJustification(e.target.value)}
                          placeholder={language === "ar" ? "أدخل المبرر الفني للتصعيد..." : "Enter technical justification for playing up..."}
                          className="w-full p-2.5 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {assignAgeCheck.isUnderAge && !canOverrideAge && (
                    <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-xs text-red-500 font-medium">
                      {language === "ar"
                        ? "اللاعب أصغر سنًا من الفئة المحددة للمجموعة ويتطلب صلاحية استثناء تصعيد الفئة."
                        : "Athlete is under-age and requires playing-up override permission."}
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAssignAthleteModal(false)}
                  className="border-nx-line text-nx-ink"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !enrollmentIdInput ||
                    assignAgeCheck.isOverAge ||
                    (assignAgeCheck.isUnderAge && (!canOverrideAge || !assignAgeOverrideJustification.trim()))
                  }
                  className="bg-nx-accent text-nx-surface disabled:opacity-50"
                >
                  {loading && <LoadingSpinner className="mr-2 size-4" />}
                  {language === "ar" ? "تأكيد الإلحاق" : "Assign Athlete"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Governed Transfer (S4-04) */}
      {transferTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-4" dir={dir}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-nx-accent" />
              <h2 className="text-lg font-bold text-nx-ink">
                {language === "ar" ? "نقل رياضي بين المجموعات (Governed Transfer)" : "Governed Group Transfer"}
              </h2>
            </div>

            <div className="rounded-lg border border-nx-line bg-nx-canvas p-3 text-xs space-y-1">
              <div>
                <span className="text-nx-ink-2">{language === "ar" ? "الرياضي:" : "Athlete:"} </span>
                <span className="font-semibold text-nx-ink">{transferTargetItem.athleteNameEn}</span>
              </div>
              <div>
                <span className="text-nx-ink-2">{language === "ar" ? "المجموعة الحالية:" : "Current Squad:"} </span>
                <span className="font-semibold text-nx-ink">{group.nameEn}</span>
              </div>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "المجموعة البديلة (Target Squad) *" : "Target Training Group *"}
                </label>
                <GenericSelect
                  searchable
                  options={groupOptions}
                  value={targetGroupIdInput}
                  onValueChange={(val: string | string[]) => setTargetGroupIdInput(val as string)}
                  placeholder={language === "ar" ? "اختر المجموعة البديلة لنفس العرض..." : "Select Target Training Group..."}
                  loading={loadingOtherGroups}
                />
                <span className="text-[11px] text-nx-ink-2 mt-1 block">
                  {language === "ar"
                    ? "يجب أن تنتمي المجموعة المستهدفة لنفس العرض وأن تتسع لعضو جديد."
                    : "Target group must belong to the same program offering with available capacity."}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "سبب النقل (إلزامي للرقابة) *" : "Reason for Transfer (Mandatory) *"}
                </label>
                <textarea
                  required
                  rows={3}
                  value={transferReasonInput}
                  onChange={e => setTransferReasonInput(e.target.value)}
                  placeholder="e.g. Promoted to advanced squad based on midterm technical evaluation..."
                  className="w-full p-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "تاريخ سريان النقل" : "Effective Transfer Date"}
                </label>
                <input
                  type="date"
                  value={transferEffectiveDate}
                  onChange={e => setTransferEffectiveDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
                />
              </div>

              {/* Target Group Age Eligibility Feedback */}
              {targetGroupIdInput && (
                <>
                  {transferAgeCheck.isOverAge && (
                    <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-xs text-red-500 font-medium">
                      {language === "ar" ? transferAgeCheck.reasonAr : transferAgeCheck.reasonEn}
                    </div>
                  )}

                  {transferAgeCheck.isUnderAge && canOverrideAge && (
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs text-amber-500 font-medium">
                        {language === "ar" ? transferAgeCheck.reasonAr : transferAgeCheck.reasonEn}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                          {language === "ar" ? "مبرر استثناء تصعيد الفئة (إلزامي للرقابة) *" : "Playing-Up Override Justification (Mandatory) *"}
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={transferAgeOverrideJustification}
                          onChange={e => setTransferAgeOverrideJustification(e.target.value)}
                          placeholder={language === "ar" ? "أدخل المبرر الفني للتصعيد..." : "Enter technical justification for playing up..."}
                          className="w-full p-2.5 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {transferAgeCheck.isUnderAge && !canOverrideAge && (
                    <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-xs text-red-500 font-medium">
                      {language === "ar"
                        ? "اللاعب أصغر سنًا من الفئة المحددة للمجموعة المستهدفة ويتطلب صلاحية استثناء تصعيد الفئة."
                        : "Athlete is under-age for target group and requires playing-up override permission."}
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTransferTargetItem(null)}
                  className="border-nx-line text-nx-ink"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !targetGroupIdInput ||
                    !transferReasonInput.trim() ||
                    transferAgeCheck.isOverAge ||
                    (transferAgeCheck.isUnderAge && (!canOverrideAge || !transferAgeOverrideJustification.trim()))
                  }
                  className="bg-nx-accent text-nx-surface disabled:opacity-50"
                >
                  {loading && <LoadingSpinner className="mr-2 size-4" />}
                  {language === "ar" ? "تنفيذ النقل الحاكم" : "Execute Governed Transfer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Remove Athlete */}
      {removeTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-4" dir={dir}>
            <h2 className="text-lg font-bold text-nx-ink">
              {language === "ar" ? "استبعاد رياضي من المجموعة" : "Remove Athlete from Squad"}
            </h2>
            <p className="text-xs text-nx-ink-2">
              {language === "ar"
                ? `هل أنت متأكد من رغبتك في إخراج الرياضي (${removeTargetItem.athleteNameEn}) من هذه المجموعة؟ سيتم إنهاء عضويته وحفظ السجل التاريخي.`
                : `Are you sure you want to end membership for ${removeTargetItem.athleteNameEn}? Historical trajectory will be preserved.`}
            </p>
            <form onSubmit={handleRemoveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "سبب الاستبعاد" : "Removal Reason"}
                </label>
                <input
                  type="text"
                  value={removeReasonInput}
                  onChange={e => setRemoveReasonInput(e.target.value)}
                  placeholder="e.g. Schedule incompatibility"
                  className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRemoveTargetItem(null)}
                  className="border-nx-line text-nx-ink"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                  {loading && <LoadingSpinner className="mr-2 size-4" />}
                  {language === "ar" ? "تأكيد الاستبعاد" : "Confirm Removal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Coach */}
      {showAssignCoachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-4" dir={dir}>
            <h2 className="text-lg font-bold text-nx-ink">
              {language === "ar" ? "تعيين مدرب للمجموعة" : "Assign Coach to Squad"}
            </h2>
            <form onSubmit={handleAssignCoachSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "المدرب المعتمد (Qualified Coach) *" : "Qualified Coach *"}
                </label>
                <GenericSelect
                  searchable
                  options={coachOptions}
                  value={staffMemberIdInput}
                  onValueChange={(val: string | string[]) => setStaffMemberIdInput(val as string)}
                  placeholder={language === "ar" ? "اختر مدرباً معتمداً..." : "Select Qualified Coach..."}
                  loading={loadingCoaches}
                />
                <span className="text-[11px] text-nx-ink-2 mt-1 block">
                  {language === "ar"
                    ? "يتم التحقق من هوية المدرب عبر HRMS وصلاحية الترخيص عبر SportsCore."
                    : "Coach identity verified via HRMS and qualification/license verified via SportsCore."}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "الدور التدريبي" : "Coach Role"}
                </label>
                <select
                  value={coachRoleInput}
                  onChange={e => setCoachRoleInput(e.target.value as GroupCoachRole)}
                  className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
                >
                  <option value="HeadCoach">{language === "ar" ? "المدرب الرئيسي (Head Coach)" : "Head Coach"}</option>
                  <option value="AssistantCoach">{language === "ar" ? "مدرب مساعد (Assistant Coach)" : "Assistant Coach"}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "تاريخ التعيين" : "Assigned Date"}
                </label>
                <input
                  type="date"
                  value={coachAssignedDate}
                  onChange={e => setCoachAssignedDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAssignCoachModal(false)}
                  className="border-nx-line text-nx-ink"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={loading} className="bg-nx-accent text-nx-surface">
                  {loading && <LoadingSpinner className="mr-2 size-4" />}
                  {language === "ar" ? "تعيين المدرب" : "Assign Coach"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditModal && group && (
        <EditTrainingGroupModal
          group={group}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            loadGroupDetails(groupId);
          }}
          language={language}
        />
      )}
    </div>
  );
}
