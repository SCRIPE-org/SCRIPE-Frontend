import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartyRepository } from "./PartyRepository";
import { PartyModel } from "../models/PartyModel";
import { PartyPerson } from "../../../../party-person/src/domain/entities/PartyPerson";
import { ContactPoint } from "../../../../contact-point/src/domain/entities/ContactPoint";
import { PartyRole } from "../../../../party-role/src/domain/entities/PartyRole";
import { PartyRelationship } from "../../../../party-relationship/src/domain/entities/PartyRelationship";
import { MergeCandidate } from "../../../../merge-candidate/src/domain/entities/MergeCandidate";
import type { IPartyService } from "../../domain/interfaces/IPartyService";
import type { IPartyPersonRepository } from "../../../../party-person/src/domain/interfaces/IPartyPersonRepository";
import type { IPartyOrganizationRepository } from "../../../../party-organization/src/domain/interfaces/IPartyOrganizationRepository";
import type { IContactPointRepository } from "../../../../contact-point/src/domain/interfaces/IContactPointRepository";
import type { IPartyRoleRepository } from "../../../../party-role/src/domain/interfaces/IPartyRoleRepository";
import type { IPartyRelationshipRepository } from "../../../../party-relationship/src/domain/interfaces/IPartyRelationshipRepository";
import type { IMergeCandidateRepository } from "../../../../merge-candidate/src/domain/interfaces/IMergeCandidateRepository";

describe("PartyRepository", () => {
  const partyService = {
    getAll: vi.fn(),
    getById: vi.fn(),
    getProfile: vi.fn(),
    create: vi.fn(),
    createPerson: vi.fn(),
    createOrganization: vi.fn(),
    lookupPeople: vi.fn(),
    lookupOrganizations: vi.fn(),
    update: vi.fn(),
    updatePerson: vi.fn(),
    delete: vi.fn(),
  };

  const personRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const organizationRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const contactPointRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const roleRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const relationshipRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mergeCandidateRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  let repository: PartyRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new PartyRepository(
      partyService as unknown as IPartyService,
      personRepo as unknown as IPartyPersonRepository,
      organizationRepo as unknown as IPartyOrganizationRepository,
      contactPointRepo as unknown as IContactPointRepository,
      roleRepo as unknown as IPartyRoleRepository,
      relationshipRepo as unknown as IPartyRelationshipRepository,
      mergeCandidateRepo as unknown as IMergeCandidateRepository
    );
  });

  describe("getAll", () => {
    it("returns paginated parties and respects type filtering", async () => {
      partyService.getAll.mockResolvedValue({
        items: [
          new PartyModel("p1", "Person", "Nora Al-Mansoor", "2026-01-01T00:00:00Z"),
          new PartyModel("p2", "Organization", "Al-Hilal Academy", "2026-01-02T00:00:00Z"),
        ],
        totalCount: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });

      const allResult = await repository.getAll({ page: 1, pageSize: 20, type: "all" });
      expect(allResult.items).toHaveLength(2);

      const peopleResult = await repository.getAll({ page: 1, pageSize: 20, type: "Person" });
      expect(peopleResult.items).toHaveLength(1);
      expect(peopleResult.items[0].displayName).toBe("Nora Al-Mansoor");
      expect(peopleResult.items[0].isPerson).toBe(true);

      const orgResult = await repository.getAll({ page: 1, pageSize: 20, type: "Organization" });
      expect(orgResult.items).toHaveLength(1);
      expect(orgResult.items[0].displayName).toBe("Al-Hilal Academy");
      expect(orgResult.items[0].isOrganization).toBe(true);
    });
  });

  describe("createPerson", () => {
    it("creates person atomically via backend endpoint with contact points", async () => {
      partyService.createPerson.mockResolvedValue({ id: "person-party-1" });
      contactPointRepo.create.mockResolvedValue({ id: "cp-1" });

      const partyId = await repository.createPerson({
        fullName: "Dr. Fatima Zahra Al-Sayed",
        phone: "+966501234567",
        email: "fatima.zahra@scripe.com",
      });

      expect(partyId).toBe("person-party-1");
      expect(partyService.createPerson).toHaveBeenCalledWith(
        {
          fullName: "Dr. Fatima Zahra Al-Sayed",
          displayName: "Dr. Fatima Zahra Al-Sayed",
          givenName: null,
          middleNames: null,
          familyName: null,
        },
        expect.any(String)
      );
      expect(contactPointRepo.create).toHaveBeenCalledWith({
        partyId: "person-party-1",
        type: "Phone",
        value: "+966501234567",
        isPrimary: true,
      });
      expect(contactPointRepo.create).toHaveBeenCalledWith({
        partyId: "person-party-1",
        type: "Email",
        value: "fatima.zahra@scripe.com",
        isPrimary: true,
      });
    });

    it("throws error when full name is empty", async () => {
      await expect(
        repository.createPerson({
          fullName: "   ",
        })
      ).rejects.toThrow("Full name is required");

      expect(partyService.createPerson).not.toHaveBeenCalled();
    });
  });

  describe("createOrganization", () => {
    it("creates organization atomically via backend endpoint with primary contact point", async () => {
      partyService.createOrganization.mockResolvedValue({ id: "org-party-200" });
      contactPointRepo.create.mockResolvedValue("contact-200");

      const partyId = await repository.createOrganization({
        displayName: "Riyadh Sports Hub",
        legalName: "Riyadh Sports Hub LLC",
        taxId: "TAX-12345-SA",
        phone: "+966114445555",
      });

      expect(partyId).toBe("org-party-200");
      expect(partyService.createOrganization).toHaveBeenCalledWith(
        {
          legalName: "Riyadh Sports Hub LLC",
          displayName: "Riyadh Sports Hub",
        },
        expect.any(String)
      );
      expect(contactPointRepo.create).toHaveBeenCalledWith({
        partyId: "org-party-200",
        type: "Phone",
        value: "+966114445555",
        isPrimary: true,
      });
    });

    it("propagates backend errors directly without fallback to root-only creation", async () => {
      partyService.createOrganization.mockRejectedValue(new Error("Organization quota exceeded"));

      await expect(
        repository.createOrganization({
          displayName: "Riyadh Sports Hub",
          legalName: "Riyadh Sports Hub LLC",
        })
      ).rejects.toThrow("Organization quota exceeded");

      expect(partyService.create).not.toHaveBeenCalled();
    });
  });

  describe("getProfile", () => {
    it("assembles composite PartyProfile across sub-repositories", async () => {
      partyService.getById.mockResolvedValue(
        new PartyModel("p-1", "Person", "Tariq Aziz", "2026-02-01T10:00:00Z")
      );
      partyService.getProfile.mockResolvedValue({
        id: "p-1",
        type: "Person",
        displayName: "Tariq Aziz",
        fullName: "Tariq Aziz",
        legalName: null,
      });
      personRepo.getAll.mockResolvedValue({
        items: [
          new PartyPerson({
            id: "pp-1",
            partyId: "p-1",
            firstName: "Tariq",
            lastName: "Aziz",
            isMinor: false,
            createdAt: "2026-02-01T10:00:00Z",
          }),
        ],
      });
      contactPointRepo.getAll.mockResolvedValue({
        items: [
          new ContactPoint({
            id: "cp-1",
            partyId: "p-1",
            type: "phone",
            value: "+966550001122",
            isPrimary: true,
            createdAt: "2026-02-01T10:00:00Z",
          }),
        ],
      });
      roleRepo.getAll.mockResolvedValue({
        items: [
          new PartyRole({
            id: "pr-1",
            partyId: "p-1",
            roleType: "Head Coach",
            createdAt: "2026-02-01T10:00:00Z",
          }),
        ],
      });
      relationshipRepo.getAll.mockResolvedValue({
        items: [
          new PartyRelationship({
            id: "rel-1",
            sourcePartyId: "p-1",
            targetPartyId: "org-1",
            relationshipType: "EmployeeOf",
            createdAt: "2026-02-01T10:00:00Z",
          }),
        ],
      });
      mergeCandidateRepo.getAll.mockResolvedValue({
        items: [
          new MergeCandidate({
            id: "mc-1",
            primaryPartyId: "p-1",
            duplicatePartyId: "p-legacy-9",
            status: "Pending",
            reason: "Phone match",
            matchScore: 0.95,
            createdAt: "2026-02-01T10:00:00Z",
          }),
        ],
      });

      const profile = await repository.getProfile("p-1");

      expect(profile.id).toBe("p-1");
      expect(profile.displayName).toBe("Tariq Aziz");
      expect(profile.isPerson).toBe(true);
      expect(profile.primaryPhone).toBe("+966550001122");
      expect(profile.contactPoints).toHaveLength(1);
      expect(profile.roles).toHaveLength(1);
      expect(profile.roles[0].roleType).toBe("Head Coach");
      expect(profile.relationships).toHaveLength(1);
      expect(profile.mergeCandidates).toHaveLength(1);
      expect(profile.mergeCandidates[0].matchScore).toBe(0.95);
    });
  });

  describe("updatePartyName and immutability", () => {
    it("updates only displayName while preserving PartyId and Party.Type", async () => {
      await repository.updatePartyName("p-1", "Tariq Aziz Updated");
      expect(partyService.update).toHaveBeenCalledWith("p-1", {
        displayName: "Tariq Aziz Updated",
      });
    });
  });

  describe("create routing (Task 2 & Task 3)", () => {
    it("routes typed person payloads with fullName to atomic createPerson", async () => {
      partyService.createPerson.mockResolvedValue({ id: "typed-person-1" });

      const partyId = await repository.create({
        type: "Person",
        fullName: "Dr. Fatima Zahra",
        displayName: "Fatima Zahra",
      });

      expect(partyId).toBe("typed-person-1");
      expect(partyService.createPerson).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Dr. Fatima Zahra",
          displayName: "Fatima Zahra",
        }),
        expect.any(String)
      );
    });

    it("routes typed organization payloads with explicit legalName to createOrganization", async () => {
      partyService.createOrganization.mockResolvedValue({ id: "typed-org-1" });

      const partyId = await repository.create({
        type: "Organization",
        legalName: "Riyadh Falcons Sports Academy LLC",
        displayName: "Riyadh Falcons",
      });

      expect(partyId).toBe("typed-org-1");
      expect(partyService.createOrganization).toHaveBeenCalledWith(
        {
          legalName: "Riyadh Falcons Sports Academy LLC",
          displayName: "Riyadh Falcons",
        },
        expect.any(String)
      );
    });

    it("rejects untyped or missing legalName on Organization creation without falling back to generic root create", async () => {
      await expect(
        repository.create({
          type: "Organization",
          displayName: "Unnamed Org Display Only",
        })
      ).rejects.toThrow("Organization creation requires legalName");

      expect(partyService.create).not.toHaveBeenCalled();
      expect(partyService.createOrganization).not.toHaveBeenCalled();
    });

    it("rejects untyped or missing fullName on Person creation without falling back to generic root create", async () => {
      await expect(
        repository.create({
          type: "Person",
          displayName: "Unnamed Person Display Only",
        })
      ).rejects.toThrow("Person creation requires fullName");

      expect(partyService.create).not.toHaveBeenCalled();
      expect(partyService.createPerson).not.toHaveBeenCalled();
    });

    it("preserves stable idempotency key provided by caller across retries", async () => {
      partyService.createPerson.mockResolvedValue({ id: "idempotent-person-1" });

      const stableKey = "custom-idempotency-key-12345";
      const partyId = await repository.createPerson({
        fullName: "Ali Mansoor",
        idempotencyKey: stableKey,
      });

      expect(partyId).toBe("idempotent-person-1");
      expect(partyService.createPerson).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Ali Mansoor",
        }),
        stableKey
      );
    });

    it("passes derived idempotency keys to contact point sub-writes when caller supplies idempotencyKey", async () => {
      partyService.createPerson.mockResolvedValue({ id: "idempotent-person-2" });
      contactPointRepo.create.mockResolvedValue("cp-id-1");

      const stableKey = "intent-uuid-456";
      const partyId = await repository.createPerson({
        fullName: "Yousef Al-Harbi",
        phone: "+966551122334",
        email: "yousef@harbi.sa",
        idempotencyKey: stableKey,
      });

      expect(partyId).toBe("idempotent-person-2");
      expect(contactPointRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          partyId: "idempotent-person-2",
          type: "Phone",
          value: "+966551122334",
        }),
        "intent-uuid-456:phone"
      );
      expect(contactPointRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          partyId: "idempotent-person-2",
          type: "Email",
          value: "yousef@harbi.sa",
        }),
        "intent-uuid-456:email"
      );
    });

    it("survives contact point failure and triggers onContactPointFailure without blocking party creation", async () => {
      partyService.createPerson.mockResolvedValue({ id: "resilient-person-1" });
      contactPointRepo.create.mockRejectedValue(new Error("Contact point quota exceeded"));

      const failureCallback = vi.fn();
      const partyId = await repository.createPerson({
        fullName: "Maryam Khalid",
        phone: "+966500000000",
        onContactPointFailure: failureCallback,
      });

      expect(partyId).toBe("resilient-person-1");
      expect(failureCallback).toHaveBeenCalledWith(
        expect.any(Error),
        "resilient-person-1"
      );
    });
  });

  describe("lookupContacts and typed lookups", () => {
    it("delegates to lookupPeople when type is Person", async () => {
      partyService.lookupPeople.mockResolvedValue({
        items: [
          {
            id: "person-1",
            type: "Person",
            displayName: "Dr. Fatima Zahra",
            fullName: "Dr. Fatima Zahra",
            legalName: null,
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 20,
      });

      const res = await repository.lookupContacts({ search: "Fatima", type: "Person" });
      expect(partyService.lookupPeople).toHaveBeenCalledWith({ search: "Fatima", page: 1, pageSize: 20 });
      expect(res.items).toHaveLength(1);
      expect(res.items[0].displayName).toBe("Dr. Fatima Zahra");
      expect(res.items[0].type).toBe("Person");
    });

    it("delegates to lookupOrganizations when type is Organization", async () => {
      partyService.lookupOrganizations.mockResolvedValue({
        items: [
          {
            id: "org-1",
            type: "Organization",
            displayName: "Riyadh Falcons",
            fullName: null,
            legalName: "Riyadh Falcons Sports LLC",
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 20,
      });

      const res = await repository.lookupContacts({ search: "Falcons", type: "Organization" });
      expect(partyService.lookupOrganizations).toHaveBeenCalledWith({ search: "Falcons", page: 1, pageSize: 20 });
      expect(res.items).toHaveLength(1);
      expect(res.items[0].legalName).toBe("Riyadh Falcons Sports LLC");
    });

    it("queries both people and organizations concurrently and sorts alphabetically when type is all", async () => {
      partyService.lookupPeople.mockResolvedValue({
        items: [
          {
            id: "p-2",
            type: "Person",
            displayName: "Zaid Omar",
            fullName: "Zaid Omar",
            legalName: null,
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 20,
      });
      partyService.lookupOrganizations.mockResolvedValue({
        items: [
          {
            id: "org-2",
            type: "Organization",
            displayName: "Al-Ahli Club",
            fullName: null,
            legalName: "Al-Ahli Club LLC",
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 20,
      });

      const res = await repository.lookupContacts({ type: "all" });
      expect(partyService.lookupPeople).toHaveBeenCalled();
      expect(partyService.lookupOrganizations).toHaveBeenCalled();
      expect(res.items).toHaveLength(2);
      expect(res.items[0].displayName).toBe("Al-Ahli Club");
      expect(res.items[1].displayName).toBe("Zaid Omar");
    });
  });

  describe("addContactPoint and partial-save recovery", () => {
    it("attaches contact point to an existing party ID without re-invoking creation", async () => {
      contactPointRepo.create.mockResolvedValue({ id: "cp-recovery-1" });

      await repository.addContactPoint({
        partyId: "existing-party-123",
        type: "phone",
        value: "+966509998877",
        isPrimary: true,
      });

      expect(contactPointRepo.create).toHaveBeenCalledWith(
        {
          partyId: "existing-party-123",
          type: "phone",
          value: "+966509998877",
          isPrimary: true,
        },
        undefined
      );
      expect(partyService.createPerson).not.toHaveBeenCalled();
      expect(partyService.createOrganization).not.toHaveBeenCalled();
    });

    it("forwards caller idempotencyKey to contactPointRepo.create", async () => {
      contactPointRepo.create.mockResolvedValue({ id: "cp-recovery-2" });

      await repository.addContactPoint({
        partyId: "existing-party-456",
        type: "email",
        value: "info@example.com",
        isPrimary: true,
        idempotencyKey: "retry-key-abc:email",
      });

      expect(contactPointRepo.create).toHaveBeenCalledWith(
        {
          partyId: "existing-party-456",
          type: "email",
          value: "info@example.com",
          isPrimary: true,
        },
        "retry-key-abc:email"
      );
    });
  });

  describe("updatePartyName and updatePerson concurrency rowVersion", () => {
    it("forwards explicit rowVersion to service.updatePerson without calling getProfile", async () => {
      partyService.updatePerson.mockResolvedValue(undefined);

      await repository.updatePartyName("p-person-1", "Dr. Fatima Al-Zahra", {
        type: "Person",
        fullName: "Dr. Fatima Bint Al-Zahra",
        rowVersion: "AAAAAAAAAAAAAAAAAAAAAA==",
      });

      expect(partyService.updatePerson).toHaveBeenCalledWith("p-person-1", {
        fullName: "Dr. Fatima Bint Al-Zahra",
        displayName: "Dr. Fatima Al-Zahra",
        rowVersion: "AAAAAAAAAAAAAAAAAAAAAA==",
      });
      expect(partyService.getProfile).not.toHaveBeenCalled();
    });

    it("fetches rowVersion from service.getProfile when updating a Person without explicit rowVersion", async () => {
      partyService.getProfile.mockResolvedValue({
        id: "p-person-2",
        type: "Person",
        displayName: "Tariq Aziz",
        fullName: "Tariq Aziz",
        legalName: null,
        rowVersion: "AQEBAQEBAQEBAQEBAQEBAQ==",
      });
      partyService.updatePerson.mockResolvedValue(undefined);

      await repository.updatePartyName("p-person-2", "Tariq Aziz Updated", {
        type: "Person",
        fullName: "Tariq Aziz Full",
      });

      expect(partyService.getProfile).toHaveBeenCalledWith("p-person-2");
      expect(partyService.updatePerson).toHaveBeenCalledWith("p-person-2", {
        fullName: "Tariq Aziz Full",
        displayName: "Tariq Aziz Updated",
        rowVersion: "AQEBAQEBAQEBAQEBAQEBAQ==",
      });
    });
  });
});
