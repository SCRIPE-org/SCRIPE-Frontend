"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyAthletesViewModel } from "../viewmodels/useAcademyAthletesViewModel";
import type { AcademyAthlete } from "../../domain/entities/AcademyAthlete";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Badge } from "@core/ui/badge";
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  HeartHandshake,
  Activity,
  Plus,
  FileCheck,
  X
} from "lucide-react";

export function AcademyAthletesView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";

  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ATHLETES_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ATHLETES_CREATE);
  const canUpdate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ATHLETES_UPDATE);
  const canViewSafeguarding = usePermission(ACADEMY_PERMISSIONS.ACADEMY_SAFEGUARDING_VIEW);

  const locator = useAcademyServiceLocator();
  const vm = useAcademyAthletesViewModel(locator.athletesRepository);

  // Modal controls
  const [showIntakeWizard, setShowIntakeWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isAdult, setIsAdult] = useState<boolean>(false);
  const [selectedGuardianPartyId, setSelectedGuardianPartyId] = useState<string | null>(null);

  // Form Fields
  const [firstNameEn, setFirstNameEn] = useState("");
  const [lastNameEn, setLastNameEn] = useState("");
  const [firstNameAr, setFirstNameAr] = useState("");
  const [lastNameAr, setLastNameAr] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("2015-06-15");
  const [gender, setGender] = useState("Male");
  const [nationalId, setNationalId] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("Father");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [medicalClearanceSigned, setMedicalClearanceSigned] = useState(false);
  const [medicalNotes, setMedicalNotes] = useState("");
  const [guardianConsentSigned, setGuardianConsentSigned] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");

  // Guardian Pre-search
  const [guardianSearchQuery, setGuardianSearchQuery] = useState("");

  // Add Sport modal
  const [showAddSportModal, setShowAddSportModal] = useState(false);
  const [addSportTargetAthlete, setAddSportTargetAthlete] = useState<AcademyAthlete | null>(null);
  const [newSportId, setNewSportId] = useState("");
  const [newSportLevel, setNewSportLevel] = useState("Beginner");

  const resetForm = () => {
    setWizardStep(1);
    setIsAdult(false);
    setSelectedGuardianPartyId(null);
    setFirstNameEn("");
    setLastNameEn("");
    setFirstNameAr("");
    setLastNameAr("");
    setDateOfBirth("2015-06-15");
    setGender("Male");
    setNationalId("");
    setGuardianName("");
    setGuardianPhone("");
    setGuardianRelationship("Father");
    setEmergencyContactName("");
    setEmergencyContactPhone("");
    setMedicalClearanceSigned(false);
    setMedicalNotes("");
    setGuardianConsentSigned(false);
    setSelectedSportId("");
    setSkillLevel("Beginner");
    setGuardianSearchQuery("");
  };

  const handleIntakeSubmit = async () => {
    try {
      if (isAdult) {
        await vm.registerAdult({
          firstNameEn,
          lastNameEn,
          firstNameAr,
          lastNameAr,
          dateOfBirth,
          gender,
          nationalId: nationalId || null,
          emergencyContactName: emergencyContactName || null,
          emergencyContactPhone: emergencyContactPhone || null,
          medicalClearanceSigned,
          medicalNotes: medicalNotes || null,
          initialSportId: selectedSportId || null,
          initialSkillLevel: skillLevel
        });
      } else if (selectedGuardianPartyId) {
        // Link sibling
        await vm.linkSibling({
          guardianPartyId: selectedGuardianPartyId,
          firstNameEn,
          lastNameEn,
          firstNameAr,
          lastNameAr,
          dateOfBirth,
          gender,
          nationalId: nationalId || null,
          guardianName,
          guardianPhone,
          guardianRelationship,
          emergencyContactName: emergencyContactName || null,
          emergencyContactPhone: emergencyContactPhone || null,
          medicalClearanceSigned,
          medicalNotes: medicalNotes || null,
          guardianConsentSigned,
          initialSportId: selectedSportId || null,
          initialSkillLevel: skillLevel
        });
      } else {
        // Register new child
        await vm.registerChild({
          firstNameEn,
          lastNameEn,
          firstNameAr,
          lastNameAr,
          dateOfBirth,
          gender,
          nationalId: nationalId || null,
          guardianName,
          guardianPhone,
          guardianRelationship,
          emergencyContactName: emergencyContactName || null,
          emergencyContactPhone: emergencyContactPhone || null,
          medicalClearanceSigned,
          medicalNotes: medicalNotes || null,
          guardianConsentSigned,
          initialSportId: selectedSportId || null,
          initialSkillLevel: skillLevel
        });
      }
      setShowIntakeWizard(false);
      resetForm();
    } catch {
      // Handled in viewmodel
    }
  };

  const handleAddSportSubmit = async () => {
    if (!addSportTargetAthlete || !newSportId) return;
    try {
      await vm.addSportParticipation(addSportTargetAthlete.id, {
        sportId: newSportId,
        skillLevel: newSportLevel
      });
      setShowAddSportModal(false);
      setAddSportTargetAthlete(null);
      setNewSportId("");
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
              ? "ليس لديك صلاحية لعرض سجلات الرياضيين والعائلات."
              : "You do not have permission to view Academy athletes and family records."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir={dir}>
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/academy" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              {isAr ? "لوحة الأكاديمية" : "Academy Overview"}
            </Link>
            <span>/</span>
            <span>{isAr ? "الرياضيون والعائلات" : "Athletes & Families"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAr ? "سجل الرياضيين والعائلات متعددة الرياضات" : "Athletes & Multi-Sport Families"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? "إدارة قبول الرياضيين الأطفال والبالغين، وربط الأخوة، وتتبع الرياضات المتعددة، وتطبيق حماية القُصّر الصارمة."
              : "Governed child & adult athlete intake, sibling linking, multi-sport tracking, and youth safeguarding protection."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <Button
              onClick={() => {
                resetForm();
                setShowIntakeWizard(true);
              }}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {isAr ? "تسجيل رياضي جديد" : "New Athlete Intake"}
            </Button>
          )}
        </div>
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

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isAr ? "البحث بالاسم أو رقم هاتف الولي..." : "Search by name or guardian phone..."}
                  value={vm.searchQuery}
                  onChange={(e) => vm.setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <select
                value={vm.selectedSportId}
                onChange={(e) => vm.setSelectedSportId(e.target.value)}
                aria-label="Filter by sport"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">{isAr ? "جميع الرياضات" : "All Sports"}</option>
                {vm.sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAr ? s.nameAr : s.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-muted-foreground">
              {isAr ? `إجمالي الرياضيين: ${vm.athletes.length}` : `Total athletes: ${vm.athletes.length}`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Athletes List */}
      {vm.loading && vm.athletes.length === 0 ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : vm.athletes.length === 0 ? (
        <Card className="text-center p-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">{isAr ? "لا يوجد رياضيون مسجلون" : "No athletes enrolled"}</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {isAr
              ? "ابدأ بتسجيل الرياضيين الجدد وربط العائلات بالأكاديمية."
              : "Get started by onboarding child or adult athletes through the intake wizard."}
          </p>
          {canCreate && (
            <Button
              onClick={() => {
                resetForm();
                setShowIntakeWizard(true);
              }}
              variant="outline"
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {isAr ? "تسجيل رياضي الآن" : "Start Intake Wizard"}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vm.athletes.map((athlete) => (
            <Card key={athlete.id} className="relative flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold">
                      {isAr ? `${athlete.firstNameAr} ${athlete.lastNameAr}` : `${athlete.firstNameEn} ${athlete.lastNameEn}`}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      {isAr ? `${athlete.firstNameEn} ${athlete.lastNameEn}` : `${athlete.firstNameAr} ${athlete.lastNameAr}`}
                    </CardDescription>
                  </div>
                  <Badge variant={athlete.isMinor ? "secondary" : "outline"} className="shrink-0 text-xs">
                    {athlete.isMinor ? (isAr ? "قاصر / طفل" : "Minor Child") : (isAr ? "بالغ" : "Adult")}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm pb-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">{isAr ? "تاريخ الميلاد:" : "Date of Birth:"}</span>
                    <span className="font-medium">{athlete.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{isAr ? "الجنس:" : "Gender:"}</span>
                    <span className="font-medium">{athlete.gender}</span>
                  </div>
                </div>

                {athlete.isMinor && (
                  <div className="bg-muted/40 p-2.5 rounded-md text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                      <HeartHandshake className="h-3.5 w-3.5 text-blue-500" />
                      <span>{isAr ? "ولي الأمر:" : "Guardian:"}</span>
                      <span className="text-foreground">{athlete.guardianName || (isAr ? "محجوب" : "[Protected]")}</span>
                    </div>
                    {athlete.guardianRelationship && (
                      <div className="text-muted-foreground pl-5">
                        {isAr ? `العلاقة: ${athlete.guardianRelationship}` : `Relationship: ${athlete.guardianRelationship}`}
                      </div>
                    )}
                  </div>
                )}

                {/* Sports Pills */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    {isAr ? "المشاركات الرياضية:" : "Sport Participations:"}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {athlete.participations && athlete.participations.length > 0 ? (
                      athlete.participations.map((p) => (
                        <Badge key={p.id} variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                          <Activity className="h-2.5 w-2.5 mr-1" />
                          {isAr ? p.sportNameAr : p.sportNameEn} ({p.skillLevel})
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        {isAr ? "لا توجد مشاركات مسجلة" : "No active sports linked"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Safeguarding badges */}
                <div className="flex items-center gap-2 pt-1 border-t text-[11px] text-muted-foreground">
                  {athlete.medicalNotes ? (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      {isAr ? "تنبيه صحي" : "Medical Alert"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Shield className="h-3.5 w-3.5" />
                      {isAr ? "سليم صحياً" : "Cleared"}
                    </span>
                  )}
                  {athlete.guardianConsentSigned && (
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 ml-auto">
                      <FileCheck className="h-3.5 w-3.5" />
                      {isAr ? "موافقة معتمدة" : "Consent Signed"}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  {canUpdate && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAddSportTargetAthlete(athlete);
                        setShowAddSportModal(true);
                      }}
                      className="text-xs h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {isAr ? "إضافة رياضة" : "Add Sport"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => vm.selectAthlete(athlete.id)}
                    className="text-xs h-8"
                  >
                    {isAr ? "تفاصيل الرياضي" : "View Details"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 5-Step Intake Wizard Modal */}
      {showIntakeWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-lg bg-background p-6 shadow-xl border max-h-[90vh] overflow-y-auto">
            {/* Wizard Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h2 className="text-lg font-bold">
                  {isAr ? "معالج تسجيل الرياضي الجديد (5 خطوات)" : "New Athlete Intake Wizard (5 Steps)"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr ? `الخطوة ${wizardStep} من 5` : `Step ${wizardStep} of 5`}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowIntakeWizard(false)} aria-label="Close dialog">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Step 1: Pre-search Family / Guardian */}
            {wizardStep === 1 && (
              <div className="space-y-4 py-4">
                <div className="rounded-md bg-blue-50/50 p-3 text-xs text-blue-900 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-300">
                  <p className="font-semibold mb-1">
                    {isAr ? "التحقق المسبق من العائلة والأخوة" : "Search-Before-Create Family Verification"}
                  </p>
                  <p>
                    {isAr
                      ? "ابحث برقم هاتف أو اسم ولي الأمر للتأكد من عدم تسجيل الأخوة مسبقاً، وإعادة استخدام ملف العائلة الموحد."
                      : "Search by phone or guardian name to detect existing siblings and reuse sovereign guardian Party identity."}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold">{isAr ? "البحث عن ولي أمر موجود:" : "Search Existing Guardian:"}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isAr ? "أدخل رقم الهاتف أو اسم ولي الأمر..." : "Enter phone or guardian name..."}
                      value={guardianSearchQuery}
                      onChange={(e) => setGuardianSearchQuery(e.target.value)}
                      className="flex-1 rounded-md border px-3 py-2 text-sm"
                    />
                    <Button size="sm" onClick={() => vm.searchGuardians(guardianSearchQuery)}>
                      {isAr ? "بحث" : "Search"}
                    </Button>
                  </div>
                </div>

                {vm.guardians.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {isAr ? "العائلات المطابقة في النظام:" : "Matching Families Found:"}
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {vm.guardians.map((g) => (
                        <div
                          key={g.guardianPartyId}
                          onClick={() => {
                            setSelectedGuardianPartyId(g.guardianPartyId);
                            setGuardianName(g.guardianName);
                            setGuardianPhone(g.guardianPhone);
                            setGuardianRelationship(g.guardianRelationship);
                            setIsAdult(false);
                            setWizardStep(3); // Jump to athlete details with guardian prefilled
                          }}
                          className={`p-3 rounded-md border text-xs cursor-pointer transition-colors ${
                            selectedGuardianPartyId === g.guardianPartyId ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{g.guardianName}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {isAr ? `${g.enrolledAthletesCount} أبناء مسجلين` : `${g.enrolledAthletesCount} Children Enrolled`}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {g.guardianPhone} • {g.guardianRelationship}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-between border-t">
                  <Button variant="ghost" onClick={() => setShowIntakeWizard(false)}>
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedGuardianPartyId(null);
                      setWizardStep(2);
                    }}
                  >
                    {isAr ? "عائلة جديدة / متابعة" : "New Family / Continue"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Intake Type (Child vs Adult) */}
            {wizardStep === 2 && (
              <div className="space-y-4 py-4">
                <span className="text-sm font-semibold">{isAr ? "اختر فئة الرياضي:" : "Select Athlete Category:"}</span>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setIsAdult(false)}
                    className={`p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                      !isAdult ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <Users className="mx-auto h-8 w-8 text-primary mb-2" />
                    <h4 className="font-bold text-sm">{isAr ? "طفل قاصر (تحت 18)" : "Minor Child (<18)"}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isAr ? "يتطلب ولي أمر، حماية بيانات القُصّر، وموافقة معتمدة." : "Requires guardian, safeguarding protection, and signed consent."}
                    </p>
                  </div>

                  <div
                    onClick={() => setIsAdult(true)}
                    className={`p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                      isAdult ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <UserCheck className="mx-auto h-8 w-8 text-primary mb-2" />
                    <h4 className="font-bold text-sm">{isAr ? "رياضي بالغ (مستقل)" : "Adult Athlete"}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isAr ? "سداد ذاتي، لا يتطلب ولي أمر قانوني." : "Self-paying individual, sovereign profile, no guardian required."}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-between border-t">
                  <Button variant="outline" onClick={() => setWizardStep(1)}>
                    {isAr ? "رجوع" : "Back"}
                  </Button>
                  <Button onClick={() => setWizardStep(3)}>
                    {isAr ? "التالي: البيانات الشخصية" : "Next: Demographics"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Demographics & Contact */}
            {wizardStep === 3 && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold">{isAr ? "الاسم الأول (إنجليزي):" : "First Name (En):"}</label>
                    <input
                      type="text"
                      value={firstNameEn}
                      onChange={(e) => setFirstNameEn(e.target.value)}
                      placeholder="e.g. Leo"
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">{isAr ? "اسم العائلة (إنجليزي):" : "Last Name (En):"}</label>
                    <input
                      type="text"
                      value={lastNameEn}
                      onChange={(e) => setLastNameEn(e.target.value)}
                      placeholder="e.g. Messi"
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">{isAr ? "الاسم الأول (عربي):" : "First Name (Ar):"}</label>
                    <input
                      type="text"
                      value={firstNameAr}
                      onChange={(e) => setFirstNameAr(e.target.value)}
                      placeholder="مثال: ليو"
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">{isAr ? "اسم العائلة (عربي):" : "Last Name (Ar):"}</label>
                    <input
                      type="text"
                      value={lastNameAr}
                      onChange={(e) => setLastNameAr(e.target.value)}
                      placeholder="مثال: ميسي"
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">{isAr ? "تاريخ الميلاد:" : "Date of Birth:"}</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">{isAr ? "الجنس:" : "Gender:"}</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                    >
                      <option value="Male">{isAr ? "ذكر" : "Male"}</option>
                      <option value="Female">{isAr ? "أنثى" : "Female"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold">{isAr ? "رقم الهوية الوطنية / الإقامة (اختياري، محمي):" : "National ID (Optional, Protected PII):"}</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="Protected under Safeguarding FLS"
                    className="w-full rounded-md border px-3 py-1.5 text-sm"
                  />
                </div>

                {!isAdult && (
                  <div className="pt-2 border-t space-y-3">
                    <span className="text-xs font-bold text-primary block">
                      {isAr ? "بيانات ولي الأمر القانوني:" : "Legal Guardian Information:"}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold">{isAr ? "اسم ولي الأمر:" : "Guardian Name:"}</label>
                        <input
                          type="text"
                          value={guardianName}
                          onChange={(e) => setGuardianName(e.target.value)}
                          placeholder="e.g. Jorge Messi"
                          className="w-full rounded-md border px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold">{isAr ? "رقم هاتف ولي الأمر:" : "Guardian Phone:"}</label>
                        <input
                          type="text"
                          value={guardianPhone}
                          onChange={(e) => setGuardianPhone(e.target.value)}
                          placeholder="+966500000000"
                          className="w-full rounded-md border px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold">{isAr ? "صلة القرابة:" : "Relationship:"}</label>
                        <select
                          value={guardianRelationship}
                          onChange={(e) => setGuardianRelationship(e.target.value)}
                          className="w-full rounded-md border px-3 py-1.5 text-sm"
                        >
                          <option value="Father">{isAr ? "أب" : "Father"}</option>
                          <option value="Mother">{isAr ? "أم" : "Mother"}</option>
                          <option value="LegalGuardian">{isAr ? "وصي قانوني" : "Legal Guardian"}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t space-y-3">
                  <span className="text-xs font-bold text-muted-foreground block">
                    {isAr ? "جهة الاتصال في حالات الطوارئ:" : "Emergency Contact:"}
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold">{isAr ? "اسم جهة الطوارئ:" : "Contact Name:"}</label>
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="e.g. Celia"
                        className="w-full rounded-md border px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold">{isAr ? "هاتف الطوارئ:" : "Emergency Phone:"}</label>
                      <input
                        type="text"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="+966500000000"
                        className="w-full rounded-md border px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between border-t">
                  <Button variant="outline" onClick={() => setWizardStep(2)}>
                    {isAr ? "رجوع" : "Back"}
                  </Button>
                  <Button
                    onClick={() => setWizardStep(4)}
                    disabled={!firstNameEn || !lastNameEn || (!isAdult && (!guardianName || !guardianPhone))}
                  >
                    {isAr ? "التالي: اختيار الرياضة" : "Next: Sports Selection"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Multi-Sport & Discipline Selection */}
            {wizardStep === 4 && (
              <div className="space-y-4 py-4">
                <div className="rounded-md bg-purple-50/50 p-3 text-xs text-purple-900 border border-purple-200 dark:bg-purple-950/20 dark:text-purple-300">
                  <p className="font-semibold mb-1">
                    {isAr ? "تصنيف الرياضة الأساسية من SportsCore" : "SportsCore Sovereign Taxonomy Integration"}
                  </p>
                  <p>
                    {isAr
                      ? "سيتم إنشاء ملف رياضي سيادي في SportsCore وربط الرياضة المبدئية ومستوى المهارة."
                      : "A sovereign SportsCore AthleteProfile will be linked with initial sport participation."}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold">{isAr ? "الرياضة الأولية:" : "Initial Sport:"}</label>
                    <select
                      value={selectedSportId}
                      onChange={(e) => setSelectedSportId(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="">{isAr ? "-- اختر الرياضة --" : "-- Select Sport --"}</option>
                      {vm.sports.map((s) => (
                        <option key={s.id} value={s.id}>
                          {isAr ? s.nameAr : s.nameEn} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold">{isAr ? "مستوى المهارة:" : "Initial Skill Level:"}</label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="Beginner">{isAr ? "مبتدئ (Beginner)" : "Beginner"}</option>
                      <option value="Intermediate">{isAr ? "متوسط (Intermediate)" : "Intermediate"}</option>
                      <option value="Advanced">{isAr ? "متقدم (Advanced)" : "Advanced"}</option>
                      <option value="Elite">{isAr ? "نخبة (Elite)" : "Elite"}</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-between border-t">
                  <Button variant="outline" onClick={() => setWizardStep(3)}>
                    {isAr ? "رجوع" : "Back"}
                  </Button>
                  <Button onClick={() => setWizardStep(5)}>
                    {isAr ? "التالي: الحماية والموافقات" : "Next: Safeguarding & Consents"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Safeguarding & Consents */}
            {wizardStep === 5 && (
              <div className="space-y-4 py-4">
                <div className="rounded-md bg-amber-50/50 p-3 text-xs text-amber-900 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300">
                  <p className="font-semibold mb-1">
                    {isAr ? "حماية القُصّر والسرية الطبية" : "Youth Safeguarding & Medical Privacy Mandate"}
                  </p>
                  <p>
                    {isAr
                      ? "تخضع الملاحظات الطبية لسياسة الحماية الميدانية FLS، ولا يمكن للمدربين الاطلاع عليها إلا أثناء الحصص النشطة."
                      : "Medical notes are governed under purpose-bound FLS and restricted from unauthorized inspection."}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold">
                      {isAr ? "ملاحظات طبية أو حساسيات (اختياري، محمي):" : "Medical Notes / Allergies (Optional, Protected):"}
                    </label>
                    <textarea
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      rows={2}
                      placeholder={isAr ? "مثال: حساسية من الفول السوداني، ربو خفيف..." : "e.g. Mild asthma, peanut allergy..."}
                      className="w-full rounded-md border px-3 py-1.5 text-sm"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={medicalClearanceSigned}
                        onChange={(e) => setMedicalClearanceSigned(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="font-medium">
                        {isAr ? "تم استلام الفحص الطبي / الإقرار باللياقة البدنية" : "Medical clearance / fitness certificate verified"}
                      </span>
                    </label>

                    {!isAdult && (
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={guardianConsentSigned}
                          onChange={(e) => setGuardianConsentSigned(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="font-bold text-primary">
                          {isAr ? "تم توقيع إقرار وموافقة ولي الأمر الرسمية (إلزامي للقُصّر)*" : "Guardian formal consent signed (Mandatory for minors)*"}
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-between border-t">
                  <Button variant="outline" onClick={() => setWizardStep(4)}>
                    {isAr ? "رجوع" : "Back"}
                  </Button>
                  <Button
                    onClick={handleIntakeSubmit}
                    disabled={!isAdult && !guardianConsentSigned}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isAr ? "إتمام التسجيل" : "Complete Registration"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Athlete Detail Modal */}
      {vm.selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-xl border max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">
                  {isAr
                    ? `${vm.selectedAthlete.firstNameAr} ${vm.selectedAthlete.lastNameAr}`
                    : `${vm.selectedAthlete.firstNameEn} ${vm.selectedAthlete.lastNameEn}`}
                </h3>
              </div>
              <Button size="icon" variant="ghost" onClick={vm.clearSelectedAthlete} aria-label="Close dialog">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-md">
              <div>
                <span className="text-muted-foreground block">{isAr ? "الاسم العربي:" : "Arabic Name:"}</span>
                <span className="font-medium">{vm.selectedAthlete.firstNameAr} {vm.selectedAthlete.lastNameAr}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{isAr ? "الاسم الإنجليزي:" : "English Name:"}</span>
                <span className="font-medium">{vm.selectedAthlete.firstNameEn} {vm.selectedAthlete.lastNameEn}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{isAr ? "تاريخ الميلاد:" : "Date of Birth:"}</span>
                <span className="font-medium">{vm.selectedAthlete.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{isAr ? "الهوية الوطنية (FLS):" : "National ID (FLS):"}</span>
                <span className="font-mono text-xs">
                  {vm.selectedAthlete.nationalId || (isAr ? "[محجوب بموجب الصلاحيات]" : "[REDACTED - Safeguarding FLS]")}
                </span>
              </div>
            </div>

            {/* Guardian & Emergency Info */}
            <div className="space-y-2 border-t pt-3">
              <h4 className="text-xs font-bold text-muted-foreground">{isAr ? "بيانات ولي الأمر والاتصال:" : "Guardian & Emergency Contacts:"}</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "اسم ولي الأمر:" : "Guardian Name:"}</span>
                  <span className="font-medium">{vm.selectedAthlete.guardianName || (isAr ? "غير متاح" : "N/A")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "هاتف ولي الأمر (FLS):" : "Guardian Phone (FLS):"}</span>
                  <span className="font-mono">{vm.selectedAthlete.guardianPhone || (isAr ? "[محجوب]" : "[REDACTED]")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isAr ? "جهة الطوارئ:" : "Emergency Contact:"}</span>
                  <span className="font-medium">
                    {vm.selectedAthlete.emergencyContactName ? `${vm.selectedAthlete.emergencyContactName} (${vm.selectedAthlete.emergencyContactPhone})` : (isAr ? "غير مسجل" : "None")}
                  </span>
                </div>
              </div>
            </div>

            {/* Medical & Safeguarding */}
            <div className="space-y-2 border-t pt-3">
              <h4 className="text-xs font-bold text-muted-foreground">{isAr ? "الحماية والبيانات الطبية:" : "Safeguarding & Medical:"}</h4>
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded border border-amber-200 text-xs">
                <span className="font-semibold block mb-1 text-amber-800 dark:text-amber-300">
                  {isAr ? "الملاحظات الطبية المصونة:" : "Protected Medical Alerts:"}
                </span>
                <p className="text-muted-foreground">
                  {vm.selectedAthlete.medicalNotes || (isAr ? "لا توجد ملاحظات أو محجوبة بالصلاحيات" : "No notes recorded or masked by FLS.")}
                </p>
              </div>
            </div>

            {/* Sport Participations */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground">{isAr ? "المشاركات الرياضية السيادية:" : "Sovereign Sport Participations:"}</h4>
                {canUpdate && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      setAddSportTargetAthlete(vm.selectedAthlete);
                      setShowAddSportModal(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {isAr ? "إضافة رياضة" : "Add Sport"}
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                {vm.selectedAthlete.participations && vm.selectedAthlete.participations.length > 0 ? (
                  vm.selectedAthlete.participations.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded bg-muted/40 text-xs">
                      <span className="font-medium">{isAr ? p.sportNameAr : p.sportNameEn}</span>
                      <Badge variant="secondary" className="text-[10px]">{p.skillLevel}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">{isAr ? "لا توجد رياضات مضافة" : "No sports linked yet."}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <Button onClick={vm.clearSelectedAthlete}>{isAr ? "إغلاق" : "Close"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sport Modal */}
      {showAddSportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-xl border space-y-4">
            <h3 className="font-bold text-base">{isAr ? "إضافة مشاركة رياضية" : "Add Sport Participation"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold">{isAr ? "الرياضة:" : "Sport:"}</label>
                <select
                  value={newSportId}
                  onChange={(e) => setNewSportId(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">{isAr ? "-- اختر الرياضة --" : "-- Select Sport --"}</option>
                  {vm.sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isAr ? s.nameAr : s.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold">{isAr ? "مستوى المهارة:" : "Skill Level:"}</label>
                <select
                  value={newSportLevel}
                  onChange={(e) => setNewSportLevel(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between">
              <Button variant="ghost" onClick={() => setShowAddSportModal(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
              <Button onClick={handleAddSportSubmit} disabled={!newSportId}>{isAr ? "إضافة" : "Add"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
