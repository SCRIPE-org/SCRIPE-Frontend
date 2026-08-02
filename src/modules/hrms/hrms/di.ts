/**
 * Hrms Module DI Container
 *
 * Provides dependency injection for the Hrms module.
 *
 * Clean Architecture Pattern:
 * - Services wrap IApiService (API calls only)
 * - Repositories use Services and map Models → Entities
 * - ViewModels use Repositories
 */
import { getModuleApiService } from "@/core/services/api-factory";

// Service
import { HrmsService } from "./core/src/data/services/HrmsService";

// Repository
import { HrmsRepository } from "./core/src/data/repositories/HrmsRepository";

// Interfaces
import type { IHrmsRepository } from "./core/src/domain/interfaces/IHrmsRepository";
import type { IHrmsService } from "./core/src/domain/interfaces/IHrmsService";

// StaffMember
import { StaffMemberService } from "./staff-member/src/data/services/StaffMemberService";
import { StaffMemberRepository } from "./staff-member/src/data/repositories/StaffMemberRepository";
import type { IStaffMemberService } from "./staff-member/src/domain/interfaces/IStaffMemberService";
import type { IStaffMemberRepository } from "./staff-member/src/domain/interfaces/IStaffMemberRepository";

// EmploymentRecord
import { EmploymentRecordService } from "./employment-record/src/data/services/EmploymentRecordService";
import { EmploymentRecordRepository } from "./employment-record/src/data/repositories/EmploymentRecordRepository";
import type { IEmploymentRecordService } from "./employment-record/src/domain/interfaces/IEmploymentRecordService";
import type { IEmploymentRecordRepository } from "./employment-record/src/domain/interfaces/IEmploymentRecordRepository";

// StaffAssignment
import { StaffAssignmentService } from "./staff-assignment/src/data/services/StaffAssignmentService";
import { StaffAssignmentRepository } from "./staff-assignment/src/data/repositories/StaffAssignmentRepository";
import type { IStaffAssignmentService } from "./staff-assignment/src/domain/interfaces/IStaffAssignmentService";
import type { IStaffAssignmentRepository } from "./staff-assignment/src/domain/interfaces/IStaffAssignmentRepository";

// StaffCompetency
import { StaffCompetencyService } from "./staff-competency/src/data/services/StaffCompetencyService";
import { StaffCompetencyRepository } from "./staff-competency/src/data/repositories/StaffCompetencyRepository";
import type { IStaffCompetencyService } from "./staff-competency/src/domain/interfaces/IStaffCompetencyService";
import type { IStaffCompetencyRepository } from "./staff-competency/src/domain/interfaces/IStaffCompetencyRepository";

// Qualification
import { QualificationService } from "./qualification/src/data/services/QualificationService";
import { QualificationRepository } from "./qualification/src/data/repositories/QualificationRepository";
import type { IQualificationService } from "./qualification/src/domain/interfaces/IQualificationService";
import type { IQualificationRepository } from "./qualification/src/domain/interfaces/IQualificationRepository";

// Certification
import { CertificationService } from "./certification/src/data/services/CertificationService";
import { CertificationRepository } from "./certification/src/data/repositories/CertificationRepository";
import type { ICertificationService } from "./certification/src/domain/interfaces/ICertificationService";
import type { ICertificationRepository } from "./certification/src/domain/interfaces/ICertificationRepository";

// StaffAvailability
import { StaffAvailabilityService } from "./staff-availability/src/data/services/StaffAvailabilityService";
import { StaffAvailabilityRepository } from "./staff-availability/src/data/repositories/StaffAvailabilityRepository";
import type { IStaffAvailabilityService } from "./staff-availability/src/domain/interfaces/IStaffAvailabilityService";
import type { IStaffAvailabilityRepository } from "./staff-availability/src/domain/interfaces/IStaffAvailabilityRepository";

export interface HrmsContainer {
  hrmsService: IHrmsService;
  hrmsRepository: IHrmsRepository;
  // StaffMember
  staffMemberService: IStaffMemberService;
  staffMemberRepository: IStaffMemberRepository;
  // EmploymentRecord
  employmentRecordService: IEmploymentRecordService;
  employmentRecordRepository: IEmploymentRecordRepository;
  // StaffAssignment
  staffAssignmentService: IStaffAssignmentService;
  staffAssignmentRepository: IStaffAssignmentRepository;
  // StaffCompetency
  staffCompetencyService: IStaffCompetencyService;
  staffCompetencyRepository: IStaffCompetencyRepository;
  // Qualification
  qualificationService: IQualificationService;
  qualificationRepository: IQualificationRepository;
  // Certification
  certificationService: ICertificationService;
  certificationRepository: ICertificationRepository;
  // StaffAvailability
  staffAvailabilityService: IStaffAvailabilityService;
  staffAvailabilityRepository: IStaffAvailabilityRepository;
}

let _container: HrmsContainer | null = null;

/**
 * Get the Hrms container (lazy initialization)
 */
export function getHrmsContainer(): HrmsContainer {
  if (!_container) {
    const apiService = getModuleApiService("HRMS");

    // Create Service (wraps IApiService)
    const hrmsService = new HrmsService(apiService);

    // Create Repository (uses Service)
    const staffMemberService = new StaffMemberService(apiService);
    const employmentRecordService = new EmploymentRecordService(apiService);
    const staffAssignmentService = new StaffAssignmentService(apiService);
    const staffCompetencyService = new StaffCompetencyService(apiService);
    const qualificationService = new QualificationService(apiService);
    const certificationService = new CertificationService(apiService);
    const staffAvailabilityService = new StaffAvailabilityService(apiService);
    _container = {
      hrmsService,
      hrmsRepository: new HrmsRepository(hrmsService),
      // StaffMember
      staffMemberService,
      staffMemberRepository: new StaffMemberRepository(staffMemberService),
      // EmploymentRecord
      employmentRecordService,
      employmentRecordRepository: new EmploymentRecordRepository(employmentRecordService),
      // StaffAssignment
      staffAssignmentService,
      staffAssignmentRepository: new StaffAssignmentRepository(staffAssignmentService),
      // StaffCompetency
      staffCompetencyService,
      staffCompetencyRepository: new StaffCompetencyRepository(staffCompetencyService),
      // Qualification
      qualificationService,
      qualificationRepository: new QualificationRepository(qualificationService),
      // Certification
      certificationService,
      certificationRepository: new CertificationRepository(certificationService),
      // StaffAvailability
      staffAvailabilityService,
      staffAvailabilityRepository: new StaffAvailabilityRepository(staffAvailabilityService),
    };
  }

  return _container;
}

/**
 * Hrms container accessor (for use in components)
 */
export const hrmsContainer = {
  get hrmsRepository() {
    return getHrmsContainer().hrmsRepository;
  },
  // StaffMember
  get staffMemberRepository() {
    return getHrmsContainer().staffMemberRepository;
  },
  // EmploymentRecord
  get employmentRecordRepository() {
    return getHrmsContainer().employmentRecordRepository;
  },
  // StaffAssignment
  get staffAssignmentRepository() {
    return getHrmsContainer().staffAssignmentRepository;
  },
  // StaffCompetency
  get staffCompetencyRepository() {
    return getHrmsContainer().staffCompetencyRepository;
  },
  // Qualification
  get qualificationRepository() {
    return getHrmsContainer().qualificationRepository;
  },
  // Certification
  get certificationRepository() {
    return getHrmsContainer().certificationRepository;
  },
  // StaffAvailability
  get staffAvailabilityRepository() {
    return getHrmsContainer().staffAvailabilityRepository;
  },
};
