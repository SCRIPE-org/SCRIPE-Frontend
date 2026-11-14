with open(r'E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\scripts\modals_part.txt', 'r', encoding='utf-8') as f:
    modals = f.read()

view_code = '''"use client";

import { useState, useMemo } from "react";
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
  User,
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
  FileText,
  X,
  Calendar,
  Layers,
  Heart,
  Zap,
  ChevronDown,
  Mars,
  Venus,
  Download,
  Award
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
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [nationalId, setNationalId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registeredAthletePass, setRegisteredAthletePass] = useState<AcademyAthlete | null>(null);
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

  // Status Filter and Selection for Athlete Directory
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const getAthleteInitials = (firstNameEn?: string, lastNameEn?: string, firstNameAr?: string) => {
    if (firstNameEn && lastNameEn) {
      return `${firstNameEn.charAt(0)}${lastNameEn.charAt(0)}`.toUpperCase();
    }
    if (firstNameEn) return firstNameEn.substring(0, 2).toUpperCase();
    if (firstNameAr) return firstNameAr.substring(0, 2);
    return "AT";
  };

  const filteredAthletes = useMemo(() => {
    if (selectedStatus === "all") return vm.athletes;
    return vm.athletes.filter((athlete) => {
      if (selectedStatus === "cleared") {
        return athlete.medicalClearanceSigned && !athlete.medicalNotes;
      }
      if (selectedStatus === "alert") {
        return !!athlete.medicalNotes;
      }
      if (selectedStatus === "pending") {
        return !athlete.medicalClearanceSigned;
      }
      return true;
    });
  }, [vm.athletes, selectedStatus]);

  // Server-aligned age calculation from Date of Birth
  const calculatedAge = useMemo(() => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }, [dateOfBirth]);

  const isAgeConsistent = useMemo(() => {
    if (calculatedAge === null) return true;
    if (isAdult && calculatedAge < 18) return false;
    if (!isAdult && calculatedAge >= 18) return false;
    return true;
  }, [calculatedAge, isAdult]);

  // Missing fields tracking for Step 3
  const missingStep3Fields = useMemo(() => {
    const missing: string[] = [];
    if (!firstNameEn.trim()) missing.push(isAr ? "الاسم الأول (En)" : "First Name (En)");
    if (!lastNameEn.trim()) missing.push(isAr ? "اسم العائلة (En)" : "Last Name (En)");
    if (!firstNameAr.trim()) missing.push(isAr ? "الاسم الأول (Ar)" : "First Name (Ar)");
    if (!lastNameAr.trim()) missing.push(isAr ? "اسم العائلة (Ar)" : "Last Name (Ar)");
    if (isAdult) {
      if (!phoneNumber.trim() || phoneNumber.trim().length < 7) {
        missing.push(isAr ? "رقم الهاتف الشخصي (مطلوب للبالغين)" : "Contact Phone (Required for adults)");
      }
    } else {
      if (!guardianName.trim()) missing.push(isAr ? "اسم ولي الأمر" : "Guardian Name");
      if (!guardianPhone.trim()) missing.push(isAr ? "هاتف ولي الأمر" : "Guardian Phone");
    }
    return missing;
  }, [firstNameEn, lastNameEn, firstNameAr, lastNameAr, isAdult, guardianName, guardianPhone, isAr]);

  const resetForm = () => {
    setWizardStep(1);
    setIsAdult(false);
    setSelectedGuardianPartyId(null);
    setFirstNameEn("");
    setLastNameEn("");
    setFirstNameAr("");
    setLastNameAr("");
    setDateOfBirth("");
    setGender("Male");
    setNationalId("");
    setPhoneNumber("");
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
      let created: AcademyAthlete | null = null;
      if (isAdult) {
        created = await vm.registerAdult({
          firstNameEn,
          lastNameEn,
          firstNameAr,
          lastNameAr,
          dateOfBirth,
          gender,
          nationalId: nationalId || null,
          phoneNumber: phoneNumber.trim(),
          emergencyContactName: emergencyContactName || null,
          emergencyContactPhone: emergencyContactPhone || null,
          medicalClearanceSigned,
          medicalNotes: medicalNotes || null,
          initialSportId: selectedSportId || null,
          initialSkillLevel: skillLevel
        });
      } else if (selectedGuardianPartyId) {
        created = await vm.linkSibling({
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
        created = await vm.registerChild({
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
      if (created) {
        setRegisteredAthletePass(created);
      }
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
    <div className="relative w-full space-y-6 p-6 text-white dark:text-white" dir={dir}>
      {/* Ambient background mesh glow at top right */}
      <div className="absolute top-0 right-0 w-[700px] h-[260px] pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_85%_0%,rgba(200,255,5,0.08),transparent_70%)]" />
      </div>

      {/* Top Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#9aa1a6]">
        <Link href="/academy" className="hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          <span>{isAr ? "لوحة الأكاديمية" : "Academy Overview"}</span>
        </Link>
        <span>/</span>
        <span className="text-[#9aa1a6]">{isAr ? "الرياضيون والعائلات" : "Athletes & Families"}</span>
      </div>

      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c8ff05]/40 bg-[#14171a] text-[#c8ff05] shadow-[0_0_16px_rgba(200,255,5,0.15)] shrink-0">
            <Users className="h-7 w-7 text-[#c8ff05]" />
          </div>
          <div className="hidden sm:block h-10 w-[1px] bg-[#2a3033] mx-1 shrink-0" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              {isAr ? "سجل الرياضيين والعائلات متعددة الرياضات" : "Athletes & Multi-Sport Families"}
            </h1>
            <p className="text-sm text-[#9aa1a6] mt-1">
              {isAr
                ? "إدارة قبول الرياضيين الأطفال والبالغين، وربط الأخوة، وتتبع الرياضات المتعددة، وتطبيق حماية القُصّر الصارمة."
                : "Governed child & adult athlete intake, sibling linking, multi-sport tracking, and youth safeguarding protection."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canCreate && (
            <Button
              onClick={() => {
                resetForm();
                setShowIntakeWizard(true);
              }}
              className="h-11 px-6 rounded-xl bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#c8ff05]/20 cursor-pointer border-none"
            >
              <UserPlus className="h-4 w-4 text-black stroke-[2.5]" />
              <span>{isAr ? "تسجيل رياضي جديد" : "New Athlete Intake"}</span>
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
        <Alert className="border-green-500/50 text-green-400 bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertTitle>{isAr ? "نجاح" : "Success"}</AlertTitle>
          <AlertDescription>{vm.successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Filters Bar (Pill controls on canvas matching 02_Athlete_Directory.png) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9aa1a6] pointer-events-none rtl:left-auto rtl:right-3.5" />
            <input
              type="text"
              placeholder={isAr ? "البحث بالاسم أو رقم هاتف الولي..." : "Search by name or guardian phone..."}
              value={vm.searchQuery}
              onChange={(e) => vm.setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[#2a3033] bg-[#101214] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#9aa1a6] focus:border-[#c8ff05] focus:ring-1 focus:ring-[#c8ff05] focus:outline-none transition-all rtl:pl-4 rtl:pr-10"
            />
          </div>

          {/* Sport Filter */}
          <div className="relative min-w-[170px]">
            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9aa1a6] pointer-events-none rtl:left-auto rtl:right-3.5" />
            <select
              value={vm.selectedSportId}
              onChange={(e) => vm.setSelectedSportId(e.target.value)}
              aria-label="Filter by sport"
              className="w-full appearance-none rounded-full border border-[#2a3033] bg-[#101214] pl-10 pr-9 py-2.5 text-sm text-white focus:border-[#c8ff05] focus:ring-1 focus:ring-[#c8ff05] focus:outline-none transition-all cursor-pointer rtl:pl-9 rtl:pr-10"
            >
              <option value="">{isAr ? "جميع الرياضات" : "All Sports"}</option>
              {vm.sports.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#101214] text-white">
                  {isAr ? s.nameAr : s.nameEn}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9aa1a6] pointer-events-none rtl:right-auto rtl:left-3.5" />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[170px]">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9aa1a6] pointer-events-none rtl:left-auto rtl:right-3.5" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by safeguarding status"
              className="w-full appearance-none rounded-full border border-[#2a3033] bg-[#101214] pl-10 pr-9 py-2.5 text-sm text-white focus:border-[#c8ff05] focus:ring-1 focus:ring-[#c8ff05] focus:outline-none transition-all cursor-pointer rtl:pl-9 rtl:pr-10"
            >
              <option value="all" className="bg-[#101214] text-white">{isAr ? "جميع الحالات" : "All Statuses"}</option>
              <option value="cleared" className="bg-[#101214] text-white">{isAr ? "معتمد صحياً" : "Cleared"}</option>
              <option value="alert" className="bg-[#101214] text-white">{isAr ? "تنبيه صحي" : "Medical Alert"}</option>
              <option value="pending" className="bg-[#101214] text-white">{isAr ? "بانتظار الفحص" : "Pending Clearance"}</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9aa1a6] pointer-events-none rtl:right-auto rtl:left-3.5" />
          </div>
        </div>

        {/* Total Count */}
        <div className="text-sm text-[#9aa1a6] font-medium shrink-0">
          {isAr ? "إجمالي الرياضيين: " : "Total athletes: "}
          <span className="font-bold text-white text-base ml-1 rtl:ml-0 rtl:mr-1">{filteredAthletes.length}</span>
        </div>
      </div>

      {/* Main Athletes Grid */}
      {vm.loading ? (
        <div className="flex h-64 items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAthletes.length === 0 ? (
        <div className="rounded-2xl border border-[#222629] bg-[#101214] p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-[#9aa1a6] mb-3" />
          <h3 className="text-lg font-bold text-white">
            {isAr ? "لم يتم العثور على رياضيين" : "No Athletes Found"}
          </h3>
          <p className="text-xs text-[#9aa1a6] max-w-sm mx-auto mt-1 mb-4">
            {isAr
              ? "جرّب تغيير فلاتر البحث أو ابدأ بتسجيل رياضي جديد."
              : "Try adjusting your search filters or start a new athlete intake."}
          </p>
          {canCreate && (
            <Button
              onClick={() => {
                resetForm();
                setShowIntakeWizard(true);
              }}
              className="bg-[#c8ff05] hover:bg-[#b2e600] text-black font-bold text-xs h-9 px-4 rounded-lg"
            >
              <UserPlus className="h-4 w-4 mr-1.5 text-black" />
              {isAr ? "تسجيل رياضي الآن" : "Start Intake Wizard"}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredAthletes.map((athlete, idx) => {
            const isSelected = selectedCardId === athlete.id || (selectedCardId === null && idx === 0);
            const isFemale = athlete.gender?.toLowerCase() === "female";

            return (
              <div
                key={athlete.id}
                data-testid="athlete-card"
                onClick={() => setSelectedCardId(athlete.id)}
                className={`relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-200 cursor-pointer bg-[#101214] ${
                  isSelected
                    ? "border-2 border-[#c8ff05] shadow-[0_0_24px_rgba(200,255,5,0.18)]"
                    : "border border-[#222629] hover:border-[#353b40]"
                }`}
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar Initials Box */}
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 tracking-wider transition-colors ${
                        isSelected
                          ? "bg-[#14171a] border border-[#c8ff05] text-[#c8ff05]"
                          : "bg-[#14171a] border border-[#2a3033] text-white"
                      }`}>
                        {getAthleteInitials(athlete.firstNameEn, athlete.lastNameEn, athlete.firstNameAr)}
                      </div>

                      {/* Vertical line divider */}
                      <div className="h-9 w-[1px] bg-[#2a3033] shrink-0" />

                      {/* Name column */}
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-white leading-tight truncate">
                          {isAr ? `${athlete.firstNameAr} ${athlete.lastNameAr}` : `${athlete.firstNameEn} ${athlete.lastNameEn}`}
                        </h3>
                        <p className="text-xs text-[#9aa1a6] mt-0.5 truncate">
                          {isAr ? `${athlete.firstNameEn} ${athlete.lastNameEn}` : `${athlete.firstNameAr} ${athlete.lastNameAr}`}
                        </p>
                      </div>
                    </div>

                    {/* Role / Age Pill */}
                    <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-[#2a3033] bg-[#14171a] px-3 py-1 text-xs text-[#9aa1a6]">
                      {athlete.isMinor ? (
                        <>
                          <Users className="h-3.5 w-3.5 text-[#9aa1a6]" />
                          <span>{isAr ? "قاصر / طفل" : "Minor Child"}</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5 text-[#9aa1a6]" />
                          <span>{isAr ? "بالغ" : "Adult"}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Demographics: 2 Equal Columns (DOB + Gender) */}
                  <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#9aa1a6]">
                        <Calendar className="h-3.5 w-3.5 text-[#9aa1a6]" />
                        <span>{isAr ? "تاريخ الميلاد" : "Date of Birth"}</span>
                      </div>
                      <p className="font-bold text-white text-sm mt-1">{athlete.dateOfBirth}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[#9aa1a6]">
                        <span className="text-sm font-bold text-[#9aa1a6] leading-none">
                          {isFemale ? "♀" : "♂"}
                        </span>
                        <span>{isAr ? "الجنس" : "Gender"}</span>
                      </div>
                      <p className="font-bold text-white text-sm mt-1">
                        {athlete.gender?.toLowerCase() === "male"
                          ? (isAr ? "ذكر" : "Male")
                          : athlete.gender?.toLowerCase() === "female"
                          ? (isAr ? "أنثى" : "Female")
                          : (isAr ? "مختلط" : (athlete.gender || "Mixed"))}
                      </p>
                    </div>
                  </div>

                  {/* Guardian Panel (For Minors) */}
                  {athlete.isMinor && (
                    <div className="rounded-xl border border-[#222629] bg-[#14171a] p-3 text-xs space-y-1 my-3.5">
                      <div className="flex items-center gap-2">
                        <Heart className="h-3.5 w-3.5 text-[#e5be42] shrink-0" />
                        <span className="text-[#9aa1a6]">{isAr ? "ولي الأمر:" : "Guardian:"}</span>
                        <span className="font-bold text-white truncate">
                          {canViewSafeguarding
                            ? (athlete.guardianName || (isAr ? "محجوب" : "[Protected]"))
                            : (isAr ? "محجوب بموجب الصلاحيات" : "[Protected - Restricted]")}
                        </span>
                      </div>
                      {athlete.guardianRelationship && (
                        <div className="text-[11px] text-[#9aa1a6] pl-5 rtl:pl-0 rtl:pr-5">
                          {canViewSafeguarding
                            ? (isAr ? `العلاقة: ${athlete.guardianRelationship}` : `Relationship: ${athlete.guardianRelationship}`)
                            : (isAr ? "محجوب" : "[Restricted]")}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sport Participations */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#9aa1a6]">
                      <Layers className="h-3.5 w-3.5 text-[#9aa1a6]" />
                      <span>{isAr ? `المشاركات الرياضية (${athlete.participations?.length ?? 0})` : `Sport Participations (${athlete.participations?.length ?? 0})`}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {athlete.participations && athlete.participations.length > 0 ? (
                        athlete.participations.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#c8ff05]/40 bg-[#1e2800] px-3 py-1 text-xs font-semibold text-[#c8ff05]"
                          >
                            <Zap className="h-3.5 w-3.5 text-[#c8ff05]" />
                            <span>{isAr ? p.sportNameAr : p.sportNameEn} ({p.skillLevel})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#9aa1a6] italic">
                          {isAr ? "لا توجد مشاركات مسجلة" : "No active sports linked"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Safeguarding & Consent Row */}
                  <div className="flex items-center justify-between border-t border-[#222629] pt-3 text-xs">
                    {athlete.medicalNotes ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-[#e5be42]">
                        <ShieldAlert className="h-4 w-4 text-[#e5be42]" />
                        <span>{isAr ? "تنبيه صحي" : "Medical Alert"}</span>
                      </span>
                    ) : athlete.medicalClearanceSigned ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-[#c8ff05]">
                        <CheckCircle2 className="h-4 w-4 text-[#c8ff05]" />
                        <span>{isAr ? "معتمد صحياً" : "Cleared"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold text-[#e5be42]">
                        <ShieldAlert className="h-4 w-4 text-[#e5be42]" />
                        <span>{isAr ? "بانتظار الفحص الطبي" : "Pending Clearance"}</span>
                      </span>
                    )}

                    {athlete.guardianConsentSigned && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#73adff]">
                        <FileText className="h-4 w-4 text-[#73adff]" />
                        <span>{isAr ? "موافقة معتمدة" : "Consent Signed"}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between border-t border-[#222629] pt-3 mt-4">
                  {canUpdate ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddSportTargetAthlete(athlete);
                        setShowAddSportModal(true);
                      }}
                      className="text-xs font-semibold text-[#9aa1a6] hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      {isAr ? "+ إضافة رياضة" : "+ Add Sport"}
                    </button>
                  ) : <div />}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      vm.selectAthlete(athlete.id);
                    }}
                    className="h-9 px-4 rounded-lg border border-[#2a3033] bg-[#14171a] hover:bg-[#1e2327] hover:border-[#353b40] text-white font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Layers className="size-3.5 text-white" />
                    <span>{isAr ? "تفاصيل الرياضي" : "View Details"}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

''' + modals

with open(r'E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\athletes\src\presentation\views\AcademyAthletesView.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(view_code)
print('Successfully wrote new AcademyAthletesView.tsx!')
