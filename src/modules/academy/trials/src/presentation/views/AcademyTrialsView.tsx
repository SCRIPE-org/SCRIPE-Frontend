"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyTrialsViewModel } from "../viewmodels/useAcademyTrialsViewModel";
import type { AcademyTrial, TrialStatus } from "../../domain/entities/AcademyTrial";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Badge } from "@core/ui/badge";
import {
  CalendarCheck2,
  CalendarClock,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Award,
  UserCheck,
  ShieldAlert,
  X
} from "lucide-react";

export function AcademyTrialsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";

  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_TRIALS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_TRIALS_CREATE);
  const canReview = usePermission(ACADEMY_PERMISSIONS.ACADEMY_TRIALS_REVIEW);
  const canUpdate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_TRIALS_UPDATE);

  const locator = useAcademyServiceLocator();
  const vm = useAcademyTrialsViewModel(locator.trialsRepository);

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showDecideModal, setShowDecideModal] = useState(false);
  const [activeTrial, setActiveTrial] = useState<AcademyTrial | null>(null);

  // Schedule Form
  const [athleteId, setAthleteId] = useState("");
  const [offeringId, setOfferingId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("2026-11-01");
  const [scheduledTime, setScheduledTime] = useState("16:00");

  // Eval Form
  const [techRec, setTechRec] = useState("");
  const [recLevel, setRecLevel] = useState("Beginner");
  const [techScore, setTechScore] = useState<number>(8);
  const [techNotes, setTechNotes] = useState("");

  // Decision Form
  const [decisionType, setDecisionType] = useState<"Approved" | "Waitlisted" | "Rejected">("Approved");
  const [adminNotes, setAdminNotes] = useState("");

  const handleScheduleSubmit = async () => {
    if (!athleteId || !offeringId || !scheduledDate) return;
    try {
      await vm.requestTrial({
        athleteId,
        offeringId,
        scheduledDate,
        scheduledTime
      });
      setShowScheduleModal(false);
      setAthleteId("");
      setOfferingId("");
    } catch {
      // Handled in viewmodel
    }
  };

  const handleEvalSubmit = async () => {
    if (!activeTrial || !techRec) return;
    try {
      await vm.submitEvaluation(activeTrial.id, {
        technicalRecommendation: techRec,
        recommendedLevel: recLevel,
        technicalScore: techScore,
        technicalNotes: techNotes
      });
      setShowEvalModal(false);
      setActiveTrial(null);
      setTechRec("");
      setTechNotes("");
    } catch {
      // Handled in viewmodel
    }
  };

  const handleDecideSubmit = async () => {
    if (!activeTrial) return;
    try {
      await vm.decideTrial(activeTrial.id, {
        approved: decisionType === "Approved",
        waitlisted: decisionType === "Waitlisted",
        adminDecisionNotes: adminNotes
      });
      setShowDecideModal(false);
      setActiveTrial(null);
      setAdminNotes("");
    } catch {
      // Handled in viewmodel
    }
  };

  if (!canView) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{isAr ? "غير مصرح" : "Unauthorized"}</AlertTitle>
          <AlertDescription>
            {isAr
              ? "ليس لديك صلاحية لعرض اختبارات الأداء والتجارب الفنية."
              : "You do not have permission to view Academy trials and evaluations."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusBadge = (status: TrialStatus) => {
    switch (status) {
      case "Scheduled":
        return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50/50">{isAr ? "مجدول" : "Scheduled"}</Badge>;
      case "Evaluated":
        return <Badge variant="secondary" className="text-purple-600 border-purple-300 bg-purple-50/50">{isAr ? "تم التقييم" : "Evaluated"}</Badge>;
      case "Accepted":
        return <Badge className="bg-green-600 text-white">{isAr ? "مقبول" : "Accepted"}</Badge>;
      case "Waitlisted":
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50">{isAr ? "قائمة الانتظار" : "Waitlisted"}</Badge>;
      case "Rejected":
        return <Badge variant="destructive">{isAr ? "مرفوض" : "Rejected"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/academy" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              {isAr ? "لوحة الأكاديمية" : "Academy Overview"}
            </Link>
            <span>/</span>
            <span>{isAr ? "التجارب والتقييم الفني" : "Trials & Evaluations"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAr ? "اختبارات القبول والتقييم الفني" : "Athlete Trials & Technical Reviews"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? "فصل التقييم الفني للمدرب عن القرار الإداري، وجدولة المواعيد الدقيقة لاختبارات المهارات."
              : "Two-key governed trial lifecycle: technical coach recommendation separated from administrative acceptance."}
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setShowScheduleModal(true)} className="gap-2">
            <CalendarClock className="h-4 w-4" />
            {isAr ? "جدولة تجربة جديدة" : "Schedule Trial"}
          </Button>
        )}
      </div>

      {/* Messages */}
      {vm.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isAr ? "خطأ" : "Error"}</AlertTitle>
          <AlertDescription>{vm.error}</AlertDescription>
        </Alert>
      )}

      {vm.successMessage && (
        <Alert className="border-green-500/50 text-green-700 bg-green-50/50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>{isAr ? "نجاح" : "Success"}</AlertTitle>
          <AlertDescription>{vm.successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">{isAr ? "تصفية بالحالة:" : "Filter Status:"}</span>
              <select
                value={vm.statusFilter}
                onChange={(e) => vm.setStatusFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm"
              >
                <option value="">{isAr ? "جميع الحالات" : "All Statuses"}</option>
                <option value="Scheduled">{isAr ? "مجدول" : "Scheduled"}</option>
                <option value="Evaluated">{isAr ? "تم التقييم" : "Evaluated"}</option>
                <option value="Accepted">{isAr ? "مقبول" : "Accepted"}</option>
                <option value="Waitlisted">{isAr ? "قائمة الانتظار" : "Waitlisted"}</option>
                <option value="Rejected">{isAr ? "مرفوض" : "Rejected"}</option>
              </select>
            </div>
            <div className="text-xs text-muted-foreground">
              {isAr ? `إجمالي التجارب: ${vm.trials.length}` : `Total trials: ${vm.trials.length}`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trials List */}
      {vm.loading && vm.trials.length === 0 ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : vm.trials.length === 0 ? (
        <Card className="text-center p-12">
          <CalendarCheck2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">{isAr ? "لا توجد تجارب مسجلة" : "No trials scheduled"}</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {isAr ? "ابدأ بجدولة مواعيد اختبارات القبول الفنية للرياضيين." : "Schedule trial sessions to begin evaluating prospective athletes."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vm.trials.map((trial) => (
            <Card key={trial.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold">
                      {isAr ? (trial.athleteNameAr || trial.athleteNameEn) : (trial.athleteNameEn || trial.athleteNameAr || "Athlete")}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      {isAr ? (trial.offeringNameAr || trial.offeringNameEn) : (trial.offeringNameEn || trial.offeringNameAr || "Program Offering")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(trial.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm pb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{trial.scheduledDate} {trial.scheduledTime ? `@ ${trial.scheduledTime}` : ""}</span>
                </div>

                {/* Technical Evaluation summary */}
                {trial.technicalRecommendation && (
                  <div className="bg-purple-50/50 dark:bg-purple-950/20 p-2.5 rounded-md text-xs border border-purple-200/50 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-purple-900 dark:text-purple-300">
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-purple-600" />
                        {isAr ? "تقييم المدرب:" : "Coach Review:"}
                      </span>
                      {trial.technicalScore && (
                        <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-800">
                          {isAr ? `الدرجة: ${trial.technicalScore}/10` : `Score: ${trial.technicalScore}/10`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{trial.technicalRecommendation}</p>
                    {trial.technicalNotes && (
                      <p className="text-[11px] italic text-muted-foreground mt-1">"{trial.technicalNotes}"</p>
                    )}
                  </div>
                )}

                {/* Admin decision notes */}
                {trial.adminDecisionNotes && (
                  <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded">
                    <span className="font-semibold block">{isAr ? "قرار الإدارة:" : "Admin Decision:"}</span>
                    <span>{trial.adminDecisionNotes}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  {canReview && (trial.status === "Scheduled" || trial.status === "Requested") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 gap-1"
                      onClick={() => {
                        setActiveTrial(trial);
                        setShowEvalModal(true);
                      }}
                    >
                      <ClipboardCheck className="h-3.5 w-3.5 text-purple-600" />
                      {isAr ? "تقييم فني" : "Technical Eval"}
                    </Button>
                  )}

                  {canUpdate && trial.status === "Evaluated" && (
                    <Button
                      size="sm"
                      className="text-xs h-8 gap-1"
                      onClick={() => {
                        setActiveTrial(trial);
                        setShowDecideModal(true);
                      }}
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      {isAr ? "القرار الإداري" : "Admin Decision"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Trial Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base">{isAr ? "جدولة موعد تجربة فنية" : "Schedule Athlete Trial"}</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowScheduleModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">{isAr ? "معرف الرياضي (Athlete ID):" : "Athlete ID (GUID):"}</label>
                <input
                  type="text"
                  value={athleteId}
                  onChange={(e) => setAthleteId(e.target.value)}
                  placeholder="Paste Athlete GUID..."
                  className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">{isAr ? "معرف البرنامج / العرض (Offering ID):" : "Offering ID (GUID):"}</label>
                <input
                  type="text"
                  value={offeringId}
                  onChange={(e) => setOfferingId(e.target.value)}
                  placeholder="Paste Offering GUID..."
                  className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">{isAr ? "تاريخ الموعد:" : "Appointment Date:"}</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">{isAr ? "وقت الموعد:" : "Appointment Time:"}</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between">
              <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
              <Button onClick={handleScheduleSubmit} disabled={!athleteId || !offeringId}>{isAr ? "جدولة" : "Confirm Schedule"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Technical Evaluation Modal (Coach Realm) */}
      {showEvalModal && activeTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-base">{isAr ? "التقييم الفني للمدرب" : "Coach Technical Evaluation"}</h3>
                <p className="text-xs text-muted-foreground">{activeTrial.athleteNameEn} • {activeTrial.offeringNameEn}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowEvalModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">{isAr ? "التوصية الفنية:" : "Technical Recommendation:"}</label>
                <input
                  type="text"
                  value={techRec}
                  onChange={(e) => setTechRec(e.target.value)}
                  placeholder="e.g. Recommended for U-12 Development Squad"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">{isAr ? "المستوى المقترح:" : "Recommended Level:"}</label>
                  <select
                    value={recLevel}
                    onChange={(e) => setRecLevel(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">{isAr ? "الدرجة الفنية (1-10):" : "Technical Score (1-10):"}</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={techScore}
                    onChange={(e) => setTechScore(Number(e.target.value))}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">{isAr ? "ملاحظات تقييم الأداء:" : "Detailed Drill & Skill Notes:"}</label>
                <textarea
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  rows={3}
                  placeholder="Tactical, physical, and technical observations..."
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between">
              <Button variant="ghost" onClick={() => setShowEvalModal(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
              <Button onClick={handleEvalSubmit} disabled={!techRec}>{isAr ? "اعتماد التقييم" : "Submit Review"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Decision Modal (Director/Admin Realm) */}
      {showDecideModal && activeTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-base">{isAr ? "قرار القبول الإداري" : "Administrative Admission Decision"}</h3>
                <p className="text-xs text-muted-foreground">{activeTrial.athleteNameEn} • Score: {activeTrial.technicalScore}/10</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowDecideModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-semibold block">{isAr ? "القرار النهائي:" : "Final Verdict:"}</span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={decisionType === "Approved" ? "default" : "outline"}
                  onClick={() => setDecisionType("Approved")}
                  className="text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  {isAr ? "قبول" : "Accept"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={decisionType === "Waitlisted" ? "default" : "outline"}
                  onClick={() => setDecisionType("Waitlisted")}
                  className="text-xs"
                >
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {isAr ? "انتظار" : "Waitlist"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={decisionType === "Rejected" ? "destructive" : "outline"}
                  onClick={() => setDecisionType("Rejected")}
                  className="text-xs"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  {isAr ? "رفض" : "Reject"}
                </Button>
              </div>

              <div>
                <label className="font-semibold block mb-1">{isAr ? "ملاحظات القرار الإداري:" : "Administrative Notes:"}</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Admission rationale, branch constraints, or enrollment instructions..."
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between">
              <Button variant="ghost" onClick={() => setShowDecideModal(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
              <Button onClick={handleDecideSubmit}>{isAr ? "حفظ القرار" : "Confirm Verdict"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
