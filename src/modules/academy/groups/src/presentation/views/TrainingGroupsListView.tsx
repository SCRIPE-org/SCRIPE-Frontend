"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useTrainingGroupsViewModel } from "../viewmodels/useTrainingGroupsViewModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Badge } from "@core/ui/badge";
import {
  Users,
  Plus,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  UserCheck,
  Archive,
  ChevronRight,
  User,
  Pencil
} from "lucide-react";
import { WeeklyScheduleControl, type WeeklyScheduleValue } from "../components/WeeklyScheduleControl";
import { EditTrainingGroupModal } from "../components/EditTrainingGroupModal";
import type { TrainingGroup } from "../../domain/entities/TrainingGroup";
import type { ProgramOffering } from "@modules/academy/offerings/src/domain/entities/ProgramOffering";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";

interface TrainingGroupsListViewProps {
  onSelectGroup?: (group: TrainingGroup) => void;
  offeringId?: string;
}

export function TrainingGroupsListView({ onSelectGroup, offeringId }: TrainingGroupsListViewProps) {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_GROUPS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_GROUPS_CREATE);
  const canManage = usePermission(ACADEMY_PERMISSIONS.ACADEMY_GROUPS_UPDATE);
  const canDelete = usePermission(ACADEMY_PERMISSIONS.ACADEMY_GROUPS_DELETE);

  const locator = useAcademyServiceLocator();
  const {
    groups,
    selectedOfferingId,
    setSelectedOfferingId,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    successMessage,
    clearMessages,
    fetchGroups,
    createGroup,
    archiveGroup
  } = useTrainingGroupsViewModel(locator.groupsRepository);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetOfferingId, setTargetOfferingId] = useState(offeringId || "");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [code, setCode] = useState("");
  const [minCapacity, setMinCapacity] = useState(5);
  const [maxCapacity, setMaxCapacity] = useState(15);
  const [createScheduleVal, setCreateScheduleVal] = useState<WeeklyScheduleValue>({
    daysOfWeek: [],
    startTime: "",
    endTime: "",
    timeZoneId: "Asia/Riyadh",
    descriptionEn: "",
    descriptionAr: "",
    isValid: true
  });
  const [editingGroup, setEditingGroup] = useState<TrainingGroup | null>(null);

  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);

  const [offerings, setOfferings] = useState<ProgramOffering[]>([]);
  const [loadingOfferings, setLoadingOfferings] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingOfferings(true);
    locator.offeringsRepository.fetchOfferings()
      .then(data => {
        if (isMounted) setOfferings(data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingOfferings(false);
      });
    return () => { isMounted = false; };
  }, [locator.offeringsRepository]);

  const offeringOptions: GenericSelectOption[] = offerings.map(o => ({
    value: o.id,
    label: (language === "ar" && o.nameAr) ? o.nameAr : o.nameEn,
    description: `${o.nameEn} (${o.enrolledCount}/${o.maxCapacity})`
  }));

  useEffect(() => {
    fetchGroups(offeringId || selectedOfferingId || undefined, undefined, statusFilter || undefined);
  }, [fetchGroups, offeringId, selectedOfferingId, statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOfferingId || !nameEn || !nameAr) return;

    try {
      if (!createScheduleVal.isValid) return;

      await createGroup({
        offeringId: targetOfferingId,
        nameEn,
        nameAr,
        code: code || null,
        minCapacity: Number(minCapacity),
        maxCapacity: Number(maxCapacity),
        scheduleDescriptionEn: createScheduleVal.descriptionEn || null,
        scheduleDescriptionAr: createScheduleVal.descriptionAr || null,
        scheduleDaysOfWeek: createScheduleVal.daysOfWeek.length > 0 ? createScheduleVal.daysOfWeek : null,
        scheduleStartTime: createScheduleVal.startTime || null,
        scheduleEndTime: createScheduleVal.endTime || null,
        scheduleTimeZoneId: createScheduleVal.timeZoneId || null
      });
      setShowCreateModal(false);
      setNameEn("");
      setNameAr("");
      setCode("");
    } catch {
      // Handled in viewmodel
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTargetId) return;
    try {
      await archiveGroup(archiveTargetId);
      setArchiveTargetId(null);
    } catch {
      // Handled in viewmodel
    }
  };

  if (!canView) {
    return (
      <div className="mx-auto my-12 max-w-xl p-6" dir={dir}>
        <Alert variant="destructive">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle className="font-semibold text-nx-ink">Access Restricted</AlertTitle>
          <AlertDescription className="mt-2 text-xs text-nx-ink-2">
            You do not have permission to view Training Groups.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/academy"
              className="flex size-8 items-center justify-center rounded-md border border-nx-line text-nx-ink-2 hover:bg-nx-raised transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-nx-ink">
              {language === "ar" ? "المجموعات التدريبية" : "Training Groups"}
            </h1>
          </div>
          <p className="text-sm text-nx-ink-2">
            {language === "ar"
              ? "إدارة المجموعات والفرق التدريبية وتعيينات المدربين وقوائم الرياضيين."
              : "Manage operational training squads, coach assignments, and athlete rosters."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchGroups(offeringId || selectedOfferingId || undefined, undefined, statusFilter || undefined)}
            disabled={loading}
            className="border-nx-line text-nx-ink hover:bg-nx-raised"
          >
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            {language === "ar" ? "تحديث" : "Refresh"}
          </Button>

          {canCreate && (
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="bg-nx-accent hover:bg-nx-accent/90 text-nx-surface"
            >
              <Plus className="mr-2 size-4" />
              {language === "ar" ? "مجموعة جديدة" : "New Training Group"}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
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

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-nx-surface border border-nx-line rounded-lg p-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-nx-ink-2 uppercase tracking-wider">
            {language === "ar" ? "الحالة:" : "Status:"}
          </label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink focus:outline-none focus:ring-1 focus:ring-nx-accent"
          >
            <option value="">{language === "ar" ? "جميع الحالات" : "All Statuses"}</option>
            <option value="Active">{language === "ar" ? "نشط" : "Active"}</option>
            <option value="Draft">{language === "ar" ? "مسودة" : "Draft"}</option>
            <option value="Archived">{language === "ar" ? "مؤرشف" : "Archived"}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading && groups.length === 0 ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner className="size-8 text-nx-accent" />
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-dashed border-2 border-nx-line bg-nx-surface p-12 text-center">
          <CardContent className="space-y-4">
            <Users className="mx-auto size-12 text-nx-ink-2/40" />
            <CardTitle className="text-lg font-semibold text-nx-ink">
              {language === "ar" ? "لا توجد مجموعات تدريبية" : "No Training Groups Found"}
            </CardTitle>
            <CardDescription className="text-sm text-nx-ink-2 max-w-md mx-auto">
              {language === "ar"
                ? "قم بإنشاء مجموعة تدريبية جديدة لتوزيع الرياضيين المقبولين وتعيين المدربين."
                : "Create a training group to organize enrolled athletes into squads and assign qualified coaches."}
            </CardDescription>
            {canCreate && (
              <Button onClick={() => setShowCreateModal(true)} className="bg-nx-accent text-nx-surface">
                <Plus className="mr-2 size-4" />
                {language === "ar" ? "إنشاء أول مجموعة" : "Create First Group"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => {
            const isFull = group.activeMemberCount >= group.maxCapacity;
            const fillPercent = Math.min(100, Math.round((group.activeMemberCount / group.maxCapacity) * 100));

            return (
              <Card
                key={group.id}
                className="border-nx-line bg-nx-surface hover:border-nx-accent/50 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {group.code && (
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-nx-raised text-nx-ink-2 border border-nx-line">
                          {group.code}
                        </span>
                      )}
                      <CardTitle className="text-lg font-bold text-nx-ink mt-1">
                        {language === "ar" ? group.nameAr : group.nameEn}
                      </CardTitle>
                      <p className="text-xs text-nx-ink-2 mt-0.5">
                        {language === "ar" ? group.offeringNameAr : group.offeringNameEn}
                      </p>
                    </div>
                    <Badge
                      variant={group.status === "Active" ? "outline" : "secondary"}
                      className={
                        group.status === "Active"
                          ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                          : "border-nx-line text-nx-ink-2"
                      }
                    >
                      {group.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-4">
                  {/* Capacity Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-nx-ink-2">{language === "ar" ? "السعة والأعضاء" : "Squad Capacity"}</span>
                      <span className={`font-semibold ${isFull ? "text-amber-500" : "text-nx-ink"}`}>
                        {group.activeMemberCount} / {group.maxCapacity} {language === "ar" ? "رياضي" : "Athletes"}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-nx-canvas overflow-hidden border border-nx-line">
                      <div
                        className={`h-full transition-all ${
                          isFull ? "bg-amber-500" : fillPercent > 80 ? "bg-blue-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Schedule */}
                  {(group.scheduleDescriptionEn || group.scheduleDescriptionAr) && (
                    <div className="flex items-center gap-2 text-xs text-nx-ink-2">
                      <Calendar className="size-3.5 shrink-0 text-nx-accent" />
                      <span className="truncate">
                        {language === "ar"
                          ? group.scheduleDescriptionAr || group.scheduleDescriptionEn
                          : group.scheduleDescriptionEn || group.scheduleDescriptionAr}
                      </span>
                    </div>
                  )}

                  {/* Coaches */}
                  {group.coaches && group.coaches.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-nx-ink-2 flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-nx-ink-2" />
                        <span>{language === "ar" ? "المدربون المعينون:" : "Assigned Coaches:"}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {group.coaches.map(c => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-nx-line bg-nx-canvas text-nx-ink"
                          >
                            <span className="font-medium">{c.staffFullName}</span>
                            <span className="text-[10px] text-nx-ink-2">({c.role})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <div className="border-t border-nx-line p-3 bg-nx-raised/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {canManage && group.status !== "Archived" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGroup(group)}
                        className="text-xs text-nx-ink-2 hover:text-nx-ink"
                      >
                        <Pencil className="mr-1 size-3.5" />
                        {language === "ar" ? "تعديل" : "Edit"}
                      </Button>
                    )}
                    {canDelete && group.status !== "Archived" && group.activeMemberCount === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setArchiveTargetId(group.id)}
                        className="text-xs text-red-500 hover:bg-red-500/10"
                      >
                        <Archive className="mr-1 size-3.5" />
                        {language === "ar" ? "أرشفة" : "Archive"}
                      </Button>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectGroup?.(group)}
                    className="border-nx-line text-xs text-nx-ink hover:bg-nx-surface"
                  >
                    <span>{language === "ar" ? "إدارة الفريق والرياضيين" : "Manage Squad & Roster"}</span>
                    <ChevronRight className="ml-1 size-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-4"
            dir={dir}
          >
            <h2 className="text-lg font-bold text-nx-ink">
              {language === "ar" ? "إنشاء مجموعة تدريبية جديدة" : "Create New Training Group"}
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "العرض التدريبي *" : "Program Offering *"}
                </label>
                <GenericSelect
                  searchable
                  options={offeringOptions}
                  value={targetOfferingId}
                  onValueChange={(val: string | string[]) => setTargetOfferingId(val as string)}
                  placeholder={language === "ar" ? "اختر العرض التدريبي..." : "Select Program Offering..."}
                  loading={loadingOfferings}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                    {language === "ar" ? "اسم المجموعة (EN) *" : "Group Name (EN) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={e => setNameEn(e.target.value)}
                    placeholder="e.g. Lions U10 Squad A"
                    className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                    {language === "ar" ? "اسم المجموعة (AR) *" : "Group Name (AR) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                    placeholder="e.g. فريق الأسود أ"
                    className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                  {language === "ar" ? "رمز الفريق" : "Squad Code"}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. LIONS-A"
                  className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                    {language === "ar" ? "الحد الأدنى للسعة" : "Min Capacity"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minCapacity}
                    onChange={e => setMinCapacity(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                    {language === "ar" ? "الحد الأقصى للسعة *" : "Max Capacity *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxCapacity}
                    onChange={e => setMaxCapacity(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
                  />
                </div>
              </div>

              <div>
                <WeeklyScheduleControl
                  language={language}
                  onChange={setCreateScheduleVal}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="border-nx-line text-nx-ink"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={loading || !createScheduleVal.isValid} className="bg-nx-accent text-nx-surface">
                  {loading && <LoadingSpinner className="mr-2 size-4" />}
                  {language === "ar" ? "إنشاء المجموعة" : "Create Group"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editingGroup && (
        <EditTrainingGroupModal
          group={editingGroup}
          isOpen={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          onSuccess={() => {
            fetchGroups(offeringId || selectedOfferingId || undefined, undefined, statusFilter || undefined);
          }}
          language={language}
        />
      )}

      {/* Archive Confirmation Modal */}
      {archiveTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-4" dir={dir}>
            <h2 className="text-lg font-bold text-nx-ink">
              {language === "ar" ? "تأكيد الأرشفة" : "Confirm Archive"}
            </h2>
            <p className="text-sm text-nx-ink-2">
              {language === "ar"
                ? "هل أنت متأكد من رغبتك في أرشفة هذه المجموعة التدريبية؟ لن تتمكن من إضافة رياضيين جدد إليها."
                : "Are you sure you want to archive this training group? No new athletes can be assigned."}
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
              <Button
                variant="outline"
                onClick={() => setArchiveTargetId(null)}
                className="border-nx-line text-nx-ink"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleArchiveConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                {loading && <LoadingSpinner className="mr-2 size-4" />}
                {language === "ar" ? "تأكيد الأرشفة" : "Confirm Archive"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
