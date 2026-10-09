import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartyRepository } from "./PartyRepository";
import { PartyModel } from "../models/PartyModel";
import { PartyPerson } from "@modules/party-kernel/party-person/src/domain/entities/PartyPerson";
import { ContactPoint } from "@modules/party-kernel/contact-point/src/domain/entities/ContactPoint";
import { PartyRole } from "@modules/party-kernel/party-role/src/domain/entities/PartyRole";
import { PartyRelationship } from "@modules/party-kernel/party-relationship/src/domain/entities/PartyRelationship";
import { MergeCandidate } from "@modules/party-kernel/merge-candidate/src/domain/entities/MergeCandidate";
import type { IPartyService } from "../../domain/interfaces/IPartyService";
import type { IPartyPersonRepository } from "@modules/party-kernel/party-person/src/domain/interfaces/IPartyPersonRepository";
import type { IPartyOrganizationRepository } from "@modules/party-kernel/party-organization/src/domain/interfaces/IPartyOrganizationRepository";
import type { IContactPointRepository } from "@modules/party-kernel/contact-point/src/domain/interfaces/IContactPointRepository";
import type { IPartyRoleRepository } from "@modules/party-kernel/party-role/src/domain/interfaces/IPartyRoleRepository";
import type { IPartyRelationshipRepository } from "@modules/party-kernel/party-relationship/src/domain/interfaces/IPartyRelationshipRepository";
import type { IMergeCandidateRepository } from "@modules/party-kernel/merge-candidate/src/domain/interfaces/IMergeCandidateRepository";

describe("PartyRepository", () => {
  const partyService = {
    getAll: vi.fn(),
    getById: vi.fn(),
    getProfile: vi.fn(),
    create: vi.fn(),
    createPerson: vi.fn(),
    createOrganization: vi.fn(),
    update: vi.fn(),
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
        type: "phone",
        value: "+966501234567",
        isPrimary: true,
      });
      expect(contactPointRepo.create).toHaveBeenCalledWith({
        partyId: "person-party-1",
        type: "email",
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
      expect(partyService.createOrganization).toHaveBeenCalledWith({
        legalName: "Riyadh Sports Hub LLC",
        displayName: "Riyadh Sports Hub",
      });
      expect(contactPointRepo.create).toHaveBeenCalledWith({
        partyId: "org-party-200",
        type: "phone",
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
      expect(partyService.createOrganization).toHaveBeenCalledWith({
        legalName: "Riyadh Falcons Sports Academy LLC",
        displayName: "Riyadh Falcons",
      });
    });

    it("never infers Organization legalName from displayName and falls back to legacy create", async () => {
      partyService.create.mockResolvedValue({ id: "legacy-party-1" });

      const partyId = await repository.create({
        type: "Organization",
        displayName: "Unnamed Org Display Only",
      });

      expect(partyId).toBe("legacy-party-1");
      expect(partyService.create).toHaveBeenCalledWith({
        type: "Organization",
        displayName: "Unnamed Org Display Only",
      });
      expect(partyService.createOrganization).not.toHaveBeenCalled();
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
  });
});
