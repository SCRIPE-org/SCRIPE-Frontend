"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyAthletesViewModel } from "../viewmodels/useAcademyAthletesViewModel";
import type { AcademyAthlete } from "../../domain/entities/AcademyAthlete";
import { AthleteCard } from "../components/AthleteCard";
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "intake" || params.get("intake") === "true") {
        setShowIntakeWizard(true);
        const step = parseInt(params.get("step") || "2", 10);
        if (step >= 1 && step <= 4) setWizardStep(step);
      }
      if (params.get("view") === "profile" && vm.athletes.length > 0) {
        const id = params.get("id");
        const found = id ? vm.athletes.find((a) => a.id === id) : vm.athletes[0];
        if (found) vm.selectAthlete(found.id);
      }
    }
  }, [vm.athletes]);

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
          {filteredAthletes.map((athlete) => {
            const isSelected = selectedCardId === athlete.id;
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

      {/* Screen 17: New Athlete Intake Wizard High-Fidelity Modal Workspace */}
      {showIntakeWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-6xl rounded-2xl bg-[#080a0b] border border-[#2a3033] shadow-2xl p-6 text-nx-ink space-y-5 my-8">
            {/* 1. Headline Banner matching 17_Athlete_Intake_Wizard.png */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2a3033]">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#454d41] bg-gradient-to-br from-[#222923] to-[#0d1110] text-[#c8ff05] shadow-[0_7px_20px_rgba(0,0,0,0.4)] text-2xl">
                  ♙
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    {isAr ? "تسجيل رياضي جديد" : "New Athlete Intake"}
                  </h1>
                  <p className="text-xs text-[#afb4b7] mt-0.5">
                    {isAr
                      ? "البحث عن الأشخاص الحاليين أولاً، ثم إنشاء السجل التشغيلي بأمان."
                      : "Search existing people first, then safely create the operational athlete record."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowIntakeWizard(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#41474a] bg-[#111416] hover:bg-[#1a1e21] text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  {isAr ? "حفظ كمسودة" : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowIntakeWizard(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#41474a] bg-[#111416] hover:bg-[#1a1e21] text-xs font-semibold text-[#9aa1a6] hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? "إغلاق ✕" : "Close ✕"}
                </button>
              </div>
            </div>

            {/* 2. Flow Progress Steps */}
            <div className="p-4 rounded-xl border border-[#343b3e] bg-[#101214] flex items-center justify-between gap-3 overflow-x-auto text-xs">
              {/* Step 1 */}
              <div className={`flex items-center gap-2 ${wizardStep > 1 ? "text-white font-medium" : wizardStep === 1 ? "text-[#c8ff05] font-bold" : "text-[#9fa8a8]"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${wizardStep > 1 ? "bg-[#c8ff05] text-[#0b1000]" : wizardStep === 1 ? "bg-[#c8ff05] text-[#0b1000]" : "bg-[#31383b] text-[#c9d1d0]"}`}>
                  {wizardStep > 1 ? "✓" : "1"}
                </span>
                <span>{isAr ? "البحث / إعادة استخدام هوية الطرف" : "Find / Reuse Party"}</span>
              </div>
              <div className="h-px flex-1 max-w-[60px] bg-[#606963]" />

              {/* Step 2 */}
              <div className={`flex items-center gap-2 ${wizardStep > 2 ? "text-white font-medium" : wizardStep === 2 ? "text-[#c8ff05] font-bold" : "text-[#9fa8a8]"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${wizardStep > 2 ? "bg-[#c8ff05] text-[#0b1000]" : wizardStep === 2 ? "bg-[#c8ff05] text-[#0b1000]" : "bg-[#31383b] text-[#c9d1d0]"}`}>
                  {wizardStep > 2 ? "✓" : "2"}
                </span>
                <span>{isAr ? "الملف التعريفي للرياضي" : "Athlete Profile"}</span>
              </div>
              <div className="h-px flex-1 max-w-[60px] bg-[#606963]" />

              {/* Step 3 */}
              <div className={`flex items-center gap-2 ${wizardStep > 3 ? "text-white font-medium" : wizardStep === 3 ? "text-[#c8ff05] font-bold" : "text-[#9fa8a8]"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${wizardStep > 3 ? "bg-[#c8ff05] text-[#0b1000]" : wizardStep === 3 ? "bg-[#c8ff05] text-[#0b1000]" : "bg-[#31383b] text-[#c9d1d0]"}`}>
                  {wizardStep > 3 ? "✓" : "3"}
                </span>
                <span>{isAr ? "العائلة والمسؤول المالي" : "Family & Payer"}</span>
              </div>
              <div className="h-px flex-1 max-w-[60px] bg-[#606963]" />

              {/* Step 4 */}
              <div className={`flex items-center gap-2 ${wizardStep === 4 ? "text-[#c8ff05] font-bold" : "text-[#9fa8a8]"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${wizardStep === 4 ? "bg-[#c8ff05] text-[#0b1000]" : "bg-[#31383b] text-[#c9d1d0]"}`}>
                  4
                </span>
                <span>{isAr ? "المشاركة الرياضية والموافقات" : "Sport Participation"}</span>
              </div>
            </div>

            {/* 3. 2-Column Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Form Panel (8 cols) */}
              <div className="lg:col-span-8 rounded-xl border border-[#343b3e] bg-gradient-to-br from-[#15191b] to-[#0e1112] p-5 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#31373a]">
                    <h3 className="font-bold text-white text-base">
                      {isAr ? "تسجيل رياضي جديد" : "New Athlete Intake"}
                    </h3>
                    <span className="text-xs font-bold text-[#c8ff05]">
                      {isAr ? `الخطوة ${wizardStep} من 4` : `Step ${wizardStep} / 4`}
                    </span>
                  </div>

                  {/* Step 1: Find / Reuse Party */}
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <div className="text-xs uppercase font-bold text-[#8f9c9f] tracking-wider">
                        {isAr ? "الخطوة 1 من 4 · فحص الهوية الموحدة" : "Step 1 of 4 · Search Before Create"}
                      </div>
                      <h4 className="text-xl font-bold text-white">
                        {isAr ? "ابحث عن هوية الطرف الموحدة (Party)" : "Search or identify existing person"}
                      </h4>
                      <p className="text-xs text-[#9aa1a6]">
                        {isAr
                          ? "ابحث بالاسم أو رقم الهاتف أو تاريخ الميلاد للتأكد من عدم تكرار سجلات الأشخاص."
                          : "Search by phone or guardian name to detect existing siblings and reuse sovereign guardian Party identity."}
                      </p>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#aab5b5] block">
                          {isAr ? "رقم الهاتف أو الاسم للبحث:" : "Phone number or name to search:"}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={isAr ? "أدخل رقم الهاتف أو اسم الشخص..." : "Enter phone or person name..."}
                            value={guardianSearchQuery}
                            onChange={(e) => setGuardianSearchQuery(e.target.value)}
                            className="flex-1 h-10 px-3 rounded-lg bg-[#0c1217] border border-[#374146] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                          />
                          <button
                            type="button"
                            onClick={() => vm.searchGuardians(guardianSearchQuery)}
                            className="px-4 h-10 rounded-lg bg-[#14171a] border border-[#41474a] text-white font-bold text-xs hover:bg-[#1f2428] cursor-pointer"
                          >
                            {isAr ? "بحث" : "Search"}
                          </button>
                        </div>
                      </div>

                      {/* Category Selection */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div
                          onClick={() => setIsAdult(false)}
                          className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                            !isAdult ? "border-[#c8ff05] bg-[#1a2307]/50 shadow-sm" : "border-[#343b3e] hover:border-[#454d41]"
                          }`}
                        >
                          <Users className="mx-auto h-6 w-6 text-[#c8ff05] mb-1.5" />
                          <h5 className="font-bold text-xs text-white">{isAr ? "طفل قاصر (تحت 18)" : "Minor Child (<18)"}</h5>
                          <p className="text-[10px] text-[#9aa1a6] mt-0.5">
                            {isAr ? "يتطلب ولي أمر، حماية بيانات القُصّر، وموافقة معتمدة." : "Requires legal guardian, safeguarding protection, and signed consent."}
                          </p>
                        </div>

                        <div
                          onClick={() => setIsAdult(true)}
                          className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                            isAdult ? "border-[#c8ff05] bg-[#1a2307]/50 shadow-sm" : "border-[#343b3e] hover:border-[#454d41]"
                          }`}
                        >
                          <UserCheck className="mx-auto h-6 w-6 text-[#c8ff05] mb-1.5" />
                          <h5 className="font-bold text-xs text-white">{isAr ? "رياضي بالغ (18+)" : "Adult Athlete (18+)"}</h5>
                          <p className="text-[10px] text-[#9aa1a6] mt-0.5">
                            {isAr ? "سداد ذاتي، مستقل، لا يتطلب ولي أمر قانوني." : "Independent individual, direct billing, no guardian required."}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[#687e00] bg-gradient-to-r from-[#26360c] to-[#172009] text-xs text-[#cfd8d8]">
                        ✓ {isAr
                          ? "تمت مراجعة تطابق الطرف. تعيد هذه العملية استخدام سجل الشخص المعتمد ولا تنشئ مستخدم تسجيل دخول."
                          : "Existing Party match has been reviewed. This flow reuses the canonical person record and does not create a login user."}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Athlete Profile (Exact Screen 17 match) */}
                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <div className="text-xs uppercase font-bold text-[#8f9c9f] tracking-wider">
                        {isAr ? "الخطوة 2 من 4 · تفاصيل الرياضي" : "Step 2 of 4 · Athlete details"}
                      </div>
                      <h4 className="text-xl font-bold text-white">
                        {isAr ? "تسجيل الملف التعريفي للرياضي" : "Register athlete profile"}
                      </h4>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs text-[#aab5b5] mb-1.5 block">{isAr ? "الاسم الكامل (En)*" : "Full name"}</label>
                          <input
                            type="text"
                            value={firstNameEn ? `${firstNameEn} ${lastNameEn}` : "Ahmed Essam"}
                            onChange={(e) => {
                              const parts = e.target.value.split(" ");
                              setFirstNameEn(parts[0] || "");
                              setLastNameEn(parts.slice(1).join(" ") || "");
                            }}
                            className="w-full h-10 px-3 rounded-lg bg-[#0b1012] border border-[#3a4446] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                            placeholder="Ahmed Essam"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#aab5b5] mb-1.5 block">{isAr ? "تاريخ الميلاد*" : "Date of birth"}</label>
                          <input
                            type="date"
                            value={dateOfBirth || "2018-02-10"}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[#0b1012] border border-[#3a4446] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs text-[#aab5b5] mb-1.5 block">{isAr ? "اللغة المفضلة" : "Preferred language"}</label>
                          <select
                            defaultValue="Arabic"
                            className="w-full h-10 px-3 rounded-lg bg-[#0b1012] border border-[#3a4446] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                          >
                            <option value="Arabic">{isAr ? "العربية ▾" : "Arabic ▾"}</option>
                            <option value="English">{isAr ? "الإنجليزية" : "English"}</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[#aab5b5] mb-1.5 block">{isAr ? "جهة الاتصال / المعرّف" : "Contact / Identifier"}</label>
                          <div className="w-full h-10 px-3 rounded-lg bg-[#0b1012] border border-[#3a4446] text-[#9aa1a6] text-xs flex items-center">
                            Managed by PartyKernel
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[#687e00] bg-gradient-to-r from-[#26360c] to-[#172009] text-xs text-[#cfd8d8]">
                        ✓ {isAr
                          ? "تمت مراجعة تطابق الطرف. تعيد هذه العملية استخدام سجل الشخص المعتمد ولا تنشئ مستخدم تسجيل دخول."
                          : "Existing Party match has been reviewed. This flow reuses the canonical person record and does not create a login user."}
                      </div>

                      <div className="h-px bg-[#303739] my-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#aab5b5]">{isAr ? "سياسة حماية القُصّر:" : "Minor-aware policy"}</span>
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#372b09] text-[#ffd24d] border border-[#715a12]">
                          {isAr ? "مطلوب ولي أمر" : "Guardian required"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#929da2]">
                        {isAr
                          ? "يتم تحديد علاقات ولي الأمر والمسؤول المالي في الخطوة التالية، مع صلاحيات ومسؤوليات محددة."
                          : "Guardian and payer relationships are configured on the next step, with separate explicit responsibilities."}
                      </p>
                    </div>
                  )}

                  {/* Step 3: Family & Payer */}
                  {wizardStep === 3 && (
                    <div className="space-y-4">
                      <div className="text-xs uppercase font-bold text-[#8f9c9f] tracking-wider">
                        {isAr ? "الخطوة 3 من 4 · العائلة والمسؤول المالي" : "Step 3 of 4 · Family & Payer"}
                      </div>
                      <h4 className="text-xl font-bold text-white">
                        {isAr ? "بيانات ولي الأمر والمسؤول المالي" : "Guardian & Payer Configuration"}
                      </h4>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs text-[#aab5b5] mb-1.5 block">{isAr ? "اسم ولي الأمر*:" : "Guardian Name*:"}</label>
                          <input
                            type="text"
                            value={guardianName || "Khaled Mostafa"}
                            onChange={(e) => setGuardianName(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[#0b1012] border border-[#3a4446] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                            placeholder="e.g. Khaled Mostafa"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#aab5b5] mb-1.5 block">{isAr ? "هاتف ولي الأمر*:" : "Guardian Phone*:"}</label>
                          <input
                            type="tel"
                            value={guardianPhone || "+966501234567"}
                            onChange={(e) => setGuardianPhone(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[#0b1012] border border-[#3a4446] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                            placeholder="+966500000000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs text-[#aab5b5] mb-1.5 block">{isAr ? "صلة القرابة:" : "Relationship:"}</label>
                          <select
                            value={guardianRelationship}
                            onChange={(e) => setGuardianRelationship(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[#0b1012] border border-[#3a4446] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                          >
                            <option value="Father">{isAr ? "أب" : "Father"}</option>
                            <option value="Mother">{isAr ? "أم" : "Mother"}</option>
                            <option value="LegalGuardian">{isAr ? "وصي قانوني" : "Legal Guardian"}</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[#aab5b5] mb-1.5 block">{isAr ? "المسؤول عن الفوترة:" : "Billing Responsibility:"}</label>
                          <div className="w-full h-10 px-3 rounded-lg bg-[#0b1012] border border-[#3a4446] text-[#c8ff05] text-xs flex items-center font-bold">
                            {guardianName || "Khaled Mostafa"} (Direct Payer)
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[#343b3e] bg-[#101519] text-xs text-[#9aa1a6]">
                        {isAr
                          ? "تتم مشاركة هوية الطرف مع نظام المحاسبة (Finance) لأغراض الفوترة والتحصيل دون المساس بخصوصية الرياضي القاصر."
                          : "Party identity is safely shared with Finance for invoice generation and payment receipts under Safeguarding policies."}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Sport Participation & Consents */}
                  {wizardStep === 4 && (
                    <div className="space-y-4">
                      <div className="text-xs uppercase font-bold text-[#8f9c9f] tracking-wider">
                        {isAr ? "الخطوة 4 من 4 · المشاركة الرياضية والموافقات" : "Step 4 of 4 · Sport Participation"}
                      </div>
                      <h4 className="text-xl font-bold text-white">
                        {isAr ? "اختيار الرياضة والموافقات الرسمية" : "Sport Selection & Consents"}
                      </h4>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs text-[#aab5b5] mb-1.5 block">{isAr ? "الرياضة الأولية:" : "Initial Sport:"}</label>
                          <select
                            value={selectedSportId}
                            onChange={(e) => setSelectedSportId(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[#0b1012] border border-[#3a4446] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
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
                          <label className="text-xs text-[#aab5b5] mb-1.5 block">{isAr ? "مستوى المهارة:" : "Initial Skill Level:"}</label>
                          <select
                            value={skillLevel}
                            onChange={(e) => setSkillLevel(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[#0b1012] border border-[#3a4446] text-white text-xs focus:outline-none focus:border-[#c8ff05]"
                          >
                            <option value="Beginner">{isAr ? "مبتدئ (Beginner)" : "Beginner"}</option>
                            <option value="Intermediate">{isAr ? "متوسط (Intermediate)" : "Intermediate"}</option>
                            <option value="Advanced">{isAr ? "متقدم (Advanced)" : "Advanced"}</option>
                            <option value="Elite">{isAr ? "نخبة (Elite)" : "Elite"}</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={medicalClearanceSigned}
                            onChange={(e) => setMedicalClearanceSigned(e.target.checked)}
                            className="rounded border-[#343b3e] text-[#c8ff05]"
                          />
                          <span>{isAr ? "تم استلام الفحص الطبي / الإقرار باللياقة البدنية" : "Medical clearance / fitness certificate verified"}</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-[#c8ff05] font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={guardianConsentSigned}
                            onChange={(e) => setGuardianConsentSigned(e.target.checked)}
                            className="rounded border-[#343b3e] text-[#c8ff05]"
                          />
                          <span>{isAr ? "تم توقيع إقرار وموافقة ولي الأمر الرسمية (إلزامي للقُصّر)*" : "Guardian formal consent signed (Mandatory for minors)*"}</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Navigation Buttons matching Screen 17 */}
                <div className="pt-4 border-t border-[#31373a] flex items-center justify-between mt-4">
                  <button
                    type="button"
                    disabled={wizardStep === 1}
                    onClick={() => setWizardStep((prev) => Math.max(1, prev - 1))}
                    className="px-4 py-2 rounded-lg border border-[#41474a] bg-[#111416] text-white font-semibold text-xs hover:bg-[#1a1e21] disabled:opacity-40 cursor-pointer"
                  >
                    {isAr ? "← السابق" : "← Previous"}
                  </button>

                  {wizardStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep((prev) => Math.min(4, prev + 1))}
                      className="px-5 py-2 rounded-lg bg-[#c8ff05] text-[#131600] font-bold text-xs shadow-[0_0_24px_rgba(199,255,0,0.2)] hover:bg-[#b2e600] cursor-pointer"
                    >
                      {isAr ? "حفظ ومتابعة →" : "Save & Continue →"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleIntakeSubmit}
                      className="px-6 py-2 rounded-lg bg-[#c8ff05] text-[#131600] font-bold text-xs shadow-[0_0_24px_rgba(199,255,0,0.25)] hover:bg-[#b2e600] cursor-pointer"
                    >
                      {isAr ? "إتمام التسجيل الأكاديمي ✓" : "Complete Registration ✓"}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Intake Integrity Panel (4 cols) matching Screen 17 */}
              <div className="lg:col-span-4 rounded-xl border border-[#343b3e] bg-gradient-to-br from-[#15191b] to-[#0e1112] p-5 flex flex-col justify-between min-h-[520px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#31373a]">
                    <h3 className="font-bold text-white text-base">
                      {isAr ? "سلامة التسجيل" : "Intake Integrity"}
                    </h3>
                    <span className="text-xs font-bold text-[#c8ff05]">
                      {isAr ? "ضمن الصلاحيات" : "Permission-scoped"}
                    </span>
                  </div>

                  <div className="text-xs uppercase font-bold text-[#8f9c9f] tracking-wider">
                    {isAr ? "تطابق الطرف الحالي" : "Existing Party Match"}
                  </div>

                  {/* Existing Party Match Item */}
                  <div className="p-3.5 rounded-xl border border-[#91b900] bg-gradient-to-r from-[#253309] to-[#141a13] flex items-center gap-3">
                    <span className="text-2xl text-[#c8ff05]">♙</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-xs truncate">
                        {firstNameEn ? `${firstNameEn} ${lastNameEn}` : "Ahmed Essam"}
                      </div>
                      <div className="text-[11px] text-[#a0a8a7] truncate">
                        Party Person · DOB {dateOfBirth || "10 Feb 2018"}
                      </div>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1e2b09] text-[#b9fb30] border border-[#627b00]">
                      {isAr ? "معاد استخدامه" : "Reused"}
                    </span>
                  </div>

                  <div className="h-px bg-[#303739]" />

                  <div className="text-xs uppercase font-bold text-[#8f9c9f] tracking-wider">
                    {isAr ? "الفحوصات المطلوبة" : "Required checks"}
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-[#2a3031]">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[#9aa1a6]">{isAr ? "فحص التكرار:" : "Duplicate search"}</span>
                      <b className="text-white">{isAr ? "مكتمل" : "Completed"}</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[#9aa1a6]">{isAr ? "نطاق المستأجر:" : "Tenant scope"}</span>
                      <b className="text-white">{isAr ? "معتمد" : "Verified"}</b>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[#9aa1a6]">{isAr ? "تصنيف القُصّر:" : "Minor classification"}</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#372b09] text-[#ffd24d] border border-[#715a12]">
                        {isAdult ? (isAr ? "بالغ" : "Adult") : (isAr ? "قاصر" : "Minor")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[#9aa1a6]">{isAr ? "حساب الدخول:" : "Identity login"}</span>
                      <b className="text-white">{isAr ? "غير مطلوب" : "Not required"}</b>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl border border-[#345327] bg-[#0c1510] text-xs text-[#c9dfb4]">
                  {isAr
                    ? "يجب أن تكون عملية التسجيل متكررة دون تكرار البيانات (Idempotent). في حال فشلت خطوة لاحقة، يتم استئناف التسجيل مع هوية الطرف والملف الرياضي بدلاً من إنشاء نسخ مكررة."
                    : "Intake must be idempotent. If a later step fails, resume with the existing Party and AthleteProfile instead of duplicating them."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 14: Athlete Profile High-Fidelity Modal Workspace */}
      {vm.selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-6xl rounded-2xl bg-[#080a0b] border border-[#2a3033] shadow-2xl p-6 text-nx-ink space-y-5 my-8">
            {/* Headline */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2a3033]">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#222923] to-[#0d1110] border border-[#454d41] text-[#c8ff05] flex items-center justify-center text-2xl font-bold">
                  ♙
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">
                    {isAr ? "الملف التعريفي للرياضي" : "Athlete Profile"}
                  </h1>
                  <p className="text-xs text-nx-ink-3">
                    {isAr
                      ? "رياضي سيادي موحد عبر مختلف الرياضات، مع ربط السجلات التشغيلية الحساسة حسب الصلاحيات."
                      : "One canonical athlete across sports, with permission-aware linked operational records."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={vm.clearSelectedAthlete}
                  className="rounded-lg border border-[#41474a] bg-[#111416] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1a1f21] transition-colors"
                >
                  {isAr ? "← دليل الرياضيين" : "← Athlete Directory"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddSportTargetAthlete(vm.selectedAthlete);
                    setShowAddSportModal(true);
                  }}
                  className="rounded-lg bg-[#c8ff05] border border-[#c8ff05] px-4 py-2 text-xs font-bold text-[#131600] shadow-[0_0_24px_rgba(199,255,0,0.18)] hover:brightness-105 transition-all"
                >
                  {isAr ? "+ إضافة مشاركة رياضية" : "+ Add Sport Participation"}
                </button>
              </div>
            </div>

            {/* Hero Card */}
            <div className="rounded-2xl border border-[#30383a] bg-[#101214] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-[#222e00] border-2 border-[#5a7800] text-[#c8ff05] flex items-center justify-center text-2xl font-black font-mono">
                  {vm.selectedAthlete.firstNameEn?.[0] || "A"}{vm.selectedAthlete.lastNameEn?.[0] || "E"}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white">
                      {isAr
                        ? `${vm.selectedAthlete.firstNameAr} ${vm.selectedAthlete.lastNameAr}`
                        : `${vm.selectedAthlete.firstNameEn} ${vm.selectedAthlete.lastNameEn}`}
                    </h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1c2707] text-[#c8ff05] border border-[#5a7800]">
                      {isAr ? "رياضي نشط" : "Active Athlete"}
                    </span>
                  </div>
                  <div className="text-xs text-nx-ink-3 mt-1">
                    ATH-{vm.selectedAthlete.id.slice(0, 6).toUpperCase()} · 8 years · Primary language: {isAr ? "العربية" : "Arabic"}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#1f2224] text-nx-ink-2 border border-[#30383a]">
                      Football · U10
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#1f2224] text-nx-ink-2 border border-[#30383a]">
                      Swimming · Beginner
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-[#353d3c] bg-[#111416] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1a1f21] transition-colors"
                >
                  {isAr ? "سجل التدقيق" : "View Audit"}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-[#c8ff05] border border-[#c8ff05] px-4 py-2 text-xs font-bold text-[#131600] hover:brightness-105"
                >
                  {isAr ? "تعديل الملف" : "Edit Profile"}
                </button>
              </div>
            </div>

            {/* Two-Column Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Panel: Athlete 360° Overview (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-[#30383a] bg-[#101214] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2a3033] pb-3">
                  <span className="font-bold text-sm text-white">
                    {isAr ? "نظرة شاملة 360° على الرياضي" : "Athlete 360° Overview"}
                  </span>
                  <span className="text-xs text-[#c8ff05] hover:underline cursor-pointer">
                    {isAr ? "عرض العلاقات السيادية" : "View Relationships"}
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-5 border-b border-[#2a3033] pb-2 text-xs font-bold text-nx-ink-3 overflow-x-auto">
                  <span className="text-[#c8ff05] border-b-2 border-[#c8ff05] pb-2 cursor-pointer">Overview</span>
                  <span className="hover:text-white cursor-pointer pb-2">Family</span>
                  <span className="hover:text-white cursor-pointer pb-2">Sports</span>
                  <span className="hover:text-white cursor-pointer pb-2">Enrollments</span>
                  <span className="hover:text-white cursor-pointer pb-2">Attendance</span>
                  <span className="hover:text-white cursor-pointer pb-2">Development</span>
                  <span className="hover:text-white cursor-pointer pb-2">Documents</span>
                </div>

                {/* 2 Minicards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#151a1c] border border-[#2a3033] space-y-2 text-xs">
                    <div className="text-[10px] font-bold text-nx-ink-3 uppercase">Person & athlete identity</div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-nx-ink-3 text-[11px]">Date of birth</span>
                      <span className="font-bold text-white">{vm.selectedAthlete.dateOfBirth || "10 Feb 2018"}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-nx-ink-3 text-[11px]">Gender (if authorized)</span>
                      <span className="font-bold text-white">Male</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-nx-ink-3 text-[11px]">Status</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1c2707] text-[#c8ff05] border border-[#5a7800]">Active</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-nx-ink-3 text-[11px]">Identity record</span>
                      <span className="font-bold text-white">Party reference</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#151a1c] border border-[#2a3033] space-y-2 text-xs">
                    <div className="text-[10px] font-bold text-nx-ink-3 uppercase">Family & responsible persons</div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-nx-ink-3 text-[11px]">Guardian</span>
                      <span className="font-bold text-white">{vm.selectedAthlete.guardianName || "Essam Mohamed"}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-nx-ink-3 text-[11px]">Relationship</span>
                      <span className="font-bold text-white">Father</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-nx-ink-3 text-[11px]">Payer</span>
                      <span className="font-bold text-white">{vm.selectedAthlete.guardianName || "Essam Mohamed"}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-nx-ink-3 text-[11px]">Emergency contact</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1f2224] text-nx-ink-3 border border-[#343b3e]">Restricted</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#2a3033]" />

                {/* Current Enrollments */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-nx-ink-3 uppercase">Current Enrollments</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#151a1c] border border-[#2a3033]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl text-[#c8ff05]">⚽</span>
                        <div>
                          <div className="text-xs font-bold text-white">Football Development · U10</div>
                          <div className="text-[10px] text-nx-ink-3">Group A · 18 / 20 athletes</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1c2707] text-[#c8ff05] border border-[#5a7800]">Active</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#151a1c] border border-[#2a3033]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl text-[#c8ff05]">≋</span>
                        <div>
                          <div className="text-xs font-bold text-white">Swimming — Beginners</div>
                          <div className="text-[10px] text-nx-ink-3">Group B · 14 / 16 athletes</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1c2707] text-[#c8ff05] border border-[#5a7800]">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Operational Snapshot (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-[#30383a] bg-[#101214] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2a3033] pb-3">
                  <span className="font-bold text-sm text-white">
                    {isAr ? "الملخص التشغيلي المباشر" : "Operational Snapshot"}
                  </span>
                  <span className="text-xs text-[#c8ff05] hover:underline cursor-pointer">
                    {isAr ? "الحصص المفتوحة" : "Open Sessions"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-nx-ink-3 uppercase">Next Session</div>
                  <h3 className="text-lg font-black text-white">U10 Football — Group A</h3>
                  <p className="text-xs text-nx-ink-3">Tomorrow · 05:00–06:30 PM</p>

                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex justify-between py-0.5 border-b border-[#2a3033]/60">
                      <span className="text-nx-ink-3">Location</span>
                      <span className="font-bold text-white">External Pitch 2</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-[#2a3033]/60">
                      <span className="text-nx-ink-3">Coach</span>
                      <span className="font-bold text-white">Ahmed Hassan</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-[#2a3033]/60">
                      <span className="text-nx-ink-3">Availability</span>
                      <span className="font-bold text-nx-ink-2">External · unverified</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#2a3033]" />

                {/* Latest Attendance */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-nx-ink-3 uppercase">Latest Attendance</div>
                  <div className="text-3xl font-black text-[#c8ff05] font-mono">94%</div>
                  <div className="h-2 w-full rounded-full bg-[#1e2326] overflow-hidden">
                    <div className="h-full rounded-full bg-[#c8ff05]" style={{ width: '94%' }} />
                  </div>
                </div>

                <div className="border-t border-[#2a3033]" />

                {/* Privacy & Safeguards */}
                <div className="rounded-xl bg-[#0c1510] border border-[#345327] p-3 text-xs text-[#c9dfb4] leading-relaxed">
                  <div className="text-[10px] font-bold text-[#c8ff05] uppercase mb-1">
                    {isAr ? "الخصوصية وحماية القُصّر" : "Privacy & safeguards"}
                  </div>
                  {isAr
                    ? "يتم عرض بيانات الهوية والعائلة والتقييمات المصرح بها فقط. البيانات الطبية والحساسة محجوبة في هذا الملخص العام."
                    : "Only authorized identity, family, assessment and payer fields are displayed. Restricted youth/medical data is not shown in this overview."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Success & Athlete Pass Modal */}
      {registeredAthletePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-lg bg-background p-6 shadow-xl border max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                  {isAr ? "تم تسجيل الرياضي بنجاح" : "Athlete Successfully Registered"}
                </h3>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setRegisteredAthletePass(null)} aria-label="Close dialog">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {isAr
                ? "تم إصدار رقم العضوية والبطاقة الرقمية المشفرة بنجاح. يمكنك مشاركتها فوراً عبر واتساب أو طباعتها."
                : "Membership ID and encrypted digital pass have been generated. You can share immediately via WhatsApp or print."}
            </p>

            <AthleteCard athlete={registeredAthletePass} showActions={true} />

            <div className="pt-3 border-t flex justify-end">
              <Button onClick={() => setRegisteredAthletePass(null)}>{isAr ? "تم" : "Done"}</Button>
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
