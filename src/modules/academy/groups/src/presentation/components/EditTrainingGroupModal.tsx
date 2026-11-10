"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { useAcademyServiceLocator } from "@modules/academy/di";
import type { TrainingGroup, TrainingGroupStatus, UpdateTrainingGroupPayload } from "../../domain/entities/TrainingGroup";
import { WeeklyScheduleControl, type WeeklyScheduleValue } from "./WeeklyScheduleControl";

export interface EditTrainingGroupModalProps {
  group: TrainingGroup;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: TrainingGroup) => void;
  language?: string;
}

export function EditTrainingGroupModal({
  group,
  isOpen,
  onClose,
  onSuccess,
  language = "en"
}: EditTrainingGroupModalProps) {
  const isAr = language === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const locator = useAcademyServiceLocator();

  const [nameEn, setNameEn] = useState(group.nameEn);
  const [nameAr, setNameAr] = useState(group.nameAr);
  const [code, setCode] = useState(group.code || "");
  const [minCapacity, setMinCapacity] = useState(group.minCapacity);
  const [maxCapacity, setMaxCapacity] = useState(group.maxCapacity);
  const [status, setStatus] = useState<TrainingGroupStatus>(
    (group.status as TrainingGroupStatus) || "Active"
  );

  const [scheduleVal, setScheduleVal] = useState<WeeklyScheduleValue>({
    daysOfWeek: group.scheduleDaysOfWeek ? [...group.scheduleDaysOfWeek] : [],
    startTime: group.scheduleStartTime || "",
    endTime: group.scheduleEndTime || "",
    timeZoneId: group.scheduleTimeZoneId || "Asia/Riyadh",
    descriptionEn: group.scheduleDescriptionEn || "",
    descriptionAr: group.scheduleDescriptionAr || "",
    isValid: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleVal.isValid) {
      setError(
        isAr
          ? "يرجى التحقق من أوقات الجدول الزمني (وقت الانتهاء بعد وقت البدء)"
          : "Please check schedule times (end time must be after start time)"
      );
      return;
    }

    if (maxCapacity < group.activeMemberCount) {
      setError(
        isAr
          ? `لا يمكن تقليل السعة القصوى عن عدد الأعضاء الحاليين (${group.activeMemberCount})`
          : `Cannot reduce max capacity below current active members (${group.activeMemberCount})`
      );
      return;
    }

    setLoading(true);
    setError(null);

    const payload: UpdateTrainingGroupPayload = {
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      code: code.trim() || null,
      minCapacity,
      maxCapacity,
      status,
      scheduleDescriptionEn: scheduleVal.descriptionEn || null,
      scheduleDescriptionAr: scheduleVal.descriptionAr || null,
      scheduleDaysOfWeek: scheduleVal.daysOfWeek.length > 0 ? scheduleVal.daysOfWeek : null,
      scheduleStartTime: scheduleVal.startTime || null,
      scheduleEndTime: scheduleVal.endTime || null,
      scheduleTimeZoneId: scheduleVal.timeZoneId || null
    };

    try {
      const updated = await locator.groupsRepository.updateGroup(group.id, payload);
      onSuccess?.(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update training group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-4"
        dir={dir}
      >
        <h2 className="text-lg font-bold text-nx-ink">
          {isAr ? "تعديل المجموعة التدريبية" : "Edit Training Group"}
        </h2>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{isAr ? "خطأ" : "Error"}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                {isAr ? "اسم المجموعة (EN) *" : "Group Name (EN) *"}
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                {isAr ? "اسم المجموعة (AR) *" : "Group Name (AR) *"}
              </label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                {isAr ? "رمز الفريق" : "Squad Code"}
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                {isAr ? "الحالة" : "Status"}
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TrainingGroupStatus)}
                className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink"
              >
                <option value="Active">{isAr ? "نشط" : "Active"}</option>
                <option value="Draft">{isAr ? "مسودة" : "Draft"}</option>
                <option value="Archived">{isAr ? "مؤرشف" : "Archived"}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-nx-ink-2 block mb-1">
                {isAr ? "الحد الأدنى للسعة" : "Min Capacity"}
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
                {isAr ? "الحد الأقصى للسعة *" : "Max Capacity *"}
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

          {/* Structured Weekly Schedule Control */}
          <div>
            <WeeklyScheduleControl
              initialDaysOfWeek={group.scheduleDaysOfWeek}
              initialStartTime={group.scheduleStartTime}
              initialEndTime={group.scheduleEndTime}
              initialTimeZoneId={group.scheduleTimeZoneId}
              initialDescriptionEn={group.scheduleDescriptionEn}
              initialDescriptionAr={group.scheduleDescriptionAr}
              language={language}
              onChange={setScheduleVal}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-nx-line">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-nx-line text-nx-ink"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={loading || !scheduleVal.isValid}
              className="bg-nx-accent text-nx-surface"
            >
              {loading && <LoadingSpinner className="mr-2 size-4" />}
              {isAr ? "حفظ التغييرات" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
