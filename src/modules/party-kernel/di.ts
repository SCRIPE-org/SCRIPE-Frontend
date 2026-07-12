/**
* PartyKernel Module DI Container
*
* Provides dependency injection for the PartyKernel module.
*
* Clean Architecture Pattern:
* - Services wrap IApiService (API calls only)
* - Repositories use Services and map Models → Entities
* - ViewModels use Repositories
*/
import { getModuleApiService } from "@/core/services/api-factory";

// Service
import { PartyKernelService } from "./core/src/data/services/PartyKernelService";

// Repository
import { PartyKernelRepository } from "./core/src/data/repositories/PartyKernelRepository";

// Interfaces
import type { IPartyKernelRepository } from "./core/src/domain/interfaces/IPartyKernelRepository";
import type { IPartyKernelService } from "./core/src/domain/interfaces/IPartyKernelService";

// Party
import { PartyService } from "./party/src/data/services/PartyService";
import { PartyRepository } from "./party/src/data/repositories/PartyRepository";
import type { IPartyService } from "./party/src/domain/interfaces/IPartyService";
import type { IPartyRepository } from "./party/src/domain/interfaces/IPartyRepository";

// PartyPerson
import { PartyPersonService } from "./party-person/src/data/services/PartyPersonService";
import { PartyPersonRepository } from "./party-person/src/data/repositories/PartyPersonRepository";
import type { IPartyPersonService } from "./party-person/src/domain/interfaces/IPartyPersonService";
import type { IPartyPersonRepository } from "./party-person/src/domain/interfaces/IPartyPersonRepository";

// PartyOrganization
import { PartyOrganizationService } from "./party-organization/src/data/services/PartyOrganizationService";
import { PartyOrganizationRepository } from "./party-organization/src/data/repositories/PartyOrganizationRepository";
import type { IPartyOrganizationService } from "./party-organization/src/domain/interfaces/IPartyOrganizationService";
import type { IPartyOrganizationRepository } from "./party-organization/src/domain/interfaces/IPartyOrganizationRepository";

// PartyRole
import { PartyRoleService } from "./party-role/src/data/services/PartyRoleService";
import { PartyRoleRepository } from "./party-role/src/data/repositories/PartyRoleRepository";
import type { IPartyRoleService } from "./party-role/src/domain/interfaces/IPartyRoleService";
import type { IPartyRoleRepository } from "./party-role/src/domain/interfaces/IPartyRoleRepository";

// PartyRelationship
import { PartyRelationshipService } from "./party-relationship/src/data/services/PartyRelationshipService";
import { PartyRelationshipRepository } from "./party-relationship/src/data/repositories/PartyRelationshipRepository";
import type { IPartyRelationshipService } from "./party-relationship/src/domain/interfaces/IPartyRelationshipService";
import type { IPartyRelationshipRepository } from "./party-relationship/src/domain/interfaces/IPartyRelationshipRepository";

// ContactPoint
import { ContactPointService } from "./contact-point/src/data/services/ContactPointService";
import { ContactPointRepository } from "./contact-point/src/data/repositories/ContactPointRepository";
import type { IContactPointService } from "./contact-point/src/domain/interfaces/IContactPointService";
import type { IContactPointRepository } from "./contact-point/src/domain/interfaces/IContactPointRepository";

// MergeCandidate
import { MergeCandidateService } from "./merge-candidate/src/data/services/MergeCandidateService";
import { MergeCandidateRepository } from "./merge-candidate/src/data/repositories/MergeCandidateRepository";
import type { IMergeCandidateService } from "./merge-candidate/src/domain/interfaces/IMergeCandidateService";
import type { IMergeCandidateRepository } from "./merge-candidate/src/domain/interfaces/IMergeCandidateRepository";

export interface PartyKernelContainer {
partyKernelService: IPartyKernelService;
partyKernelRepository: IPartyKernelRepository;
  // Party
  partyService: IPartyService;
  partyRepository: IPartyRepository;
  // PartyPerson
  partyPersonService: IPartyPersonService;
  partyPersonRepository: IPartyPersonRepository;
  // PartyOrganization
  partyOrganizationService: IPartyOrganizationService;
  partyOrganizationRepository: IPartyOrganizationRepository;
  // PartyRole
  partyRoleService: IPartyRoleService;
  partyRoleRepository: IPartyRoleRepository;
  // PartyRelationship
  partyRelationshipService: IPartyRelationshipService;
  partyRelationshipRepository: IPartyRelationshipRepository;
  // ContactPoint
  contactPointService: IContactPointService;
  contactPointRepository: IContactPointRepository;
  // MergeCandidate
  mergeCandidateService: IMergeCandidateService;
  mergeCandidateRepository: IMergeCandidateRepository;
}

let _container: PartyKernelContainer | null = null;

/**
* Get the PartyKernel container (lazy initialization)
*/
export function getPartyKernelContainer(): PartyKernelContainer {
if (!_container) {
const apiService = getModuleApiService("PARTY_KERNEL");

// Create Service (wraps IApiService)
const partyKernelService = new PartyKernelService(apiService);

// Create Repository (uses Service)
      const partyService = new PartyService(apiService);
      const partyPersonService = new PartyPersonService(apiService);
      const partyOrganizationService = new PartyOrganizationService(apiService);
      const partyRoleService = new PartyRoleService(apiService);
      const partyRelationshipService = new PartyRelationshipService(apiService);
      const contactPointService = new ContactPointService(apiService);
      const mergeCandidateService = new MergeCandidateService(apiService);
_container = {
partyKernelService,
partyKernelRepository: new PartyKernelRepository(partyKernelService),
      // Party
      partyService,
      partyRepository: new PartyRepository(partyService),
          // PartyPerson
      partyPersonService,
      partyPersonRepository: new PartyPersonRepository(partyPersonService),
          // PartyOrganization
      partyOrganizationService,
      partyOrganizationRepository: new PartyOrganizationRepository(partyOrganizationService),
          // PartyRole
      partyRoleService,
      partyRoleRepository: new PartyRoleRepository(partyRoleService),
          // PartyRelationship
      partyRelationshipService,
      partyRelationshipRepository: new PartyRelationshipRepository(partyRelationshipService),
          // ContactPoint
      contactPointService,
      contactPointRepository: new ContactPointRepository(contactPointService),
          // MergeCandidate
      mergeCandidateService,
      mergeCandidateRepository: new MergeCandidateRepository(mergeCandidateService),
    };
}

return _container;
}

/**
* PartyKernel container accessor (for use in components)
*/
export const partyKernelContainer = {
get partyKernelRepository() {
return getPartyKernelContainer().partyKernelRepository;
},
  // Party
  get partyRepository() {
    return getPartyKernelContainer().partyRepository;
  },
  // PartyPerson
  get partyPersonRepository() {
    return getPartyKernelContainer().partyPersonRepository;
  },
  // PartyOrganization
  get partyOrganizationRepository() {
    return getPartyKernelContainer().partyOrganizationRepository;
  },
  // PartyRole
  get partyRoleRepository() {
    return getPartyKernelContainer().partyRoleRepository;
  },
  // PartyRelationship
  get partyRelationshipRepository() {
    return getPartyKernelContainer().partyRelationshipRepository;
  },
  // ContactPoint
  get contactPointRepository() {
    return getPartyKernelContainer().contactPointRepository;
  },
  // MergeCandidate
  get mergeCandidateRepository() {
    return getPartyKernelContainer().mergeCandidateRepository;
  },
};