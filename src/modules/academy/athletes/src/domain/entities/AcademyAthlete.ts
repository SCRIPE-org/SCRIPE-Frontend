export interface AthleteSportParticipation {
  id: string;
  athleteProfileId: string;
  sportId: string;
  sportNameEn: string;
  sportNameAr: string;
  disciplineId?: string | null;
  disciplineNameEn?: string | null;
  disciplineNameAr?: string | null;
  skillLevel: string;
  joinedDate: string;
  isActive: boolean;
}

export interface AthleteSportTaxonomyItem {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isActive: boolean;
}

export interface AcademyAthlete {
  id: string;
  partyId: string;
  athleteProfileId: string;
  guardianPartyId?: string | null;
  primaryBranchId?: string | null;
  membershipNumber: string;
  phoneNumber?: string | null;
  qrCodeToken?: string | null;
  firstNameEn: string;
  lastNameEn: string;
  firstNameAr: string;
  lastNameAr: string;
  dateOfBirth: string;
  gender: string;
  isMinor: boolean;
  nationalId?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianRelationship?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  medicalClearanceSigned: boolean;
  medicalNotes?: string | null;
  guardianConsentSigned: boolean;
  intakeDate: string;
  status: string;
  participations: AthleteSportParticipation[];
}

export interface AthleteCard {
  athleteId: string;
  membershipNumber: string;
  firstNameEn: string;
  lastNameEn: string;
  firstNameAr: string;
  lastNameAr: string;
  academyName?: string | null;
  primaryBranchName?: string | null;
  sports: string[];
  status: string;
  intakeDate: string;
  cardToken: string;
}

export interface AthleteQr {
  membershipNumber: string;
  cardToken: string;
  cardUrl: string;
  qrCodeDataUri: string;
}

export interface GuardianSummary {
  guardianPartyId: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  enrolledAthletesCount: number;
}

export interface RegisterChildAthletePayload {
  primaryBranchId?: string | null;
  firstNameEn: string;
  lastNameEn: string;
  firstNameAr: string;
  lastNameAr: string;
  dateOfBirth: string;
  gender: string;
  nationalId?: string | null;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  medicalClearanceSigned: boolean;
  medicalNotes?: string | null;
  guardianConsentSigned: boolean;
  initialSportId?: string | null;
  initialDisciplineId?: string | null;
  initialSkillLevel?: string;
}

export interface RegisterAdultAthletePayload {
  primaryBranchId?: string | null;
  firstNameEn: string;
  lastNameEn: string;
  firstNameAr: string;
  lastNameAr: string;
  dateOfBirth: string;
  gender: string;
  nationalId?: string | null;
  phoneNumber: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  medicalClearanceSigned: boolean;
  medicalNotes?: string | null;
  initialSportId?: string | null;
  initialDisciplineId?: string | null;
  initialSkillLevel?: string;
}

export interface LinkSiblingAthletePayload {
  guardianPartyId: string;
  primaryBranchId?: string | null;
  firstNameEn: string;
  lastNameEn: string;
  firstNameAr: string;
  lastNameAr: string;
  dateOfBirth: string;
  gender: string;
  nationalId?: string | null;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  medicalClearanceSigned: boolean;
  medicalNotes?: string | null;
  guardianConsentSigned: boolean;
  initialSportId?: string | null;
  initialDisciplineId?: string | null;
  initialSkillLevel?: string;
}

export interface AddSportParticipationPayload {
  sportId: string;
  disciplineId?: string | null;
  skillLevel?: string;
}
