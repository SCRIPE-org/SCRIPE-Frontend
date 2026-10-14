/**
 * Party Repository Implementation
 *
 * Implements IPartyRepository using PartyService and orchestrates composite PartyProfile
 * across sub-repositories following Clean Architecture.
 */
import type {
  IPartyRepository,
  PartyListParams,
  CreatePersonParams,
  CreateOrganizationParams,
  AddContactPointParams,
  AddPartyRoleParams,
  AddPartyRelationshipParams,
} from "../../domain/interfaces/IPartyRepository";
import type { IPartyService } from "../../domain/interfaces/IPartyService";
import type { IPartyPersonRepository } from "@modules/party-kernel/party-person/src/domain/interfaces/IPartyPersonRepository";
import type { IPartyOrganizationRepository } from "@modules/party-kernel/party-organization/src/domain/interfaces/IPartyOrganizationRepository";
import type { IContactPointRepository } from "@modules/party-kernel/contact-point/src/domain/interfaces/IContactPointRepository";
import type { IPartyRoleRepository } from "@modules/party-kernel/party-role/src/domain/interfaces/IPartyRoleRepository";
import type { IPartyRelationshipRepository } from "@modules/party-kernel/party-relationship/src/domain/interfaces/IPartyRelationshipRepository";
import type { IMergeCandidateRepository } from "@modules/party-kernel/merge-candidate/src/domain/interfaces/IMergeCandidateRepository";

import { Party, type PartyContactLookup } from "../../domain/entities/Party";
import { PartyProfile } from "../../domain/entities/PartyProfile";
import { PartyMapper } from "../mappers/PartyMapper";

/**
 * Repository implementation for managing Party identities, lookups, and composite profiles.
 */
export class PartyRepository implements IPartyRepository {
  constructor(
    private readonly service: IPartyService,
    private readonly personRepo?: IPartyPersonRepository,
    private readonly organizationRepo?: IPartyOrganizationRepository,
    private readonly contactPointRepo?: IContactPointRepository,
    private readonly roleRepo?: IPartyRoleRepository,
    private readonly relationshipRepo?: IPartyRelationshipRepository,
    private readonly mergeCandidateRepo?: IMergeCandidateRepository
  ) {}

  async getAll(params: PartyListParams) {
    const result = await this.service.getAll(params);
    let items = result.items.map((model) => PartyMapper.toEntity(model));

    if (params.type && params.type !== "all") {
      const targetType = params.type.toLowerCase();
      items = items.filter((p) => p.type.toLowerCase() === targetType);
    }

    return {
      items,
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<Party> {
    const model = await this.service.getById(id);
    return PartyMapper.toEntity(model);
  }

  async getProfile(id: string): Promise<PartyProfile> {
    const party = await this.getById(id);

    // Concurrently fetch profile sub-resources with safe fallback
    const [
      canonicalProfileResult,
      personResult,
      organizationResult,
      contactPointsResult,
      rolesResult,
      relationshipsResult,
      mergeCandidatesResult,
    ] = await Promise.allSettled([
      this.service.getProfile ? this.service.getProfile(id) : Promise.resolve(null),
      party.isPerson && this.personRepo
        ? this.personRepo.getAll({ page: 1, pageSize: 100 })
        : Promise.resolve({ items: [] }),
      party.isOrganization && this.organizationRepo
        ? this.organizationRepo.getAll({ page: 1, pageSize: 100 })
        : Promise.resolve({ items: [] }),
      this.contactPointRepo
        ? this.contactPointRepo.getAll({ page: 1, pageSize: 100 })
        : Promise.resolve({ items: [] }),
      this.roleRepo
        ? this.roleRepo.getAll({ page: 1, pageSize: 100 })
        : Promise.resolve({ items: [] }),
      this.relationshipRepo
        ? this.relationshipRepo.getAll({ page: 1, pageSize: 100 })
        : Promise.resolve({ items: [] }),
      this.mergeCandidateRepo
        ? this.mergeCandidateRepo.getAll({ page: 1, pageSize: 100 })
        : Promise.resolve({ items: [] }),
    ]);

    const person =
      personResult.status === "fulfilled"
        ? personResult.value.items.find((p) => p.partyId === id) ?? null
        : null;

    const organization =
      organizationResult.status === "fulfilled"
        ? organizationResult.value.items.find((o) => o.partyId === id) ?? null
        : null;

    const contactPoints =
      contactPointsResult.status === "fulfilled"
        ? contactPointsResult.value.items.filter((c) => c.partyId === id)
        : [];

    const roles =
      rolesResult.status === "fulfilled"
        ? rolesResult.value.items.filter((r) => r.partyId === id)
        : [];

    const relationships =
      relationshipsResult.status === "fulfilled"
        ? relationshipsResult.value.items.filter((rel) => rel.sourcePartyId === id || rel.targetPartyId === id)
        : [];

    const mergeCandidates =
      mergeCandidatesResult.status === "fulfilled"
        ? mergeCandidatesResult.value.items.filter((m) => m.primaryPartyId === id || m.duplicatePartyId === id)
        : [];

    const canonicalProfile =
      canonicalProfileResult.status === "fulfilled" && canonicalProfileResult.value
        ? canonicalProfileResult.value
        : null;

    return new PartyProfile({
      party,
      person,
      organization,
      contactPoints,
      roles,
      relationships,
      mergeCandidates,
      canonicalProfile,
    });
  }

  async create(data: Record<string, unknown>): Promise<string> {
    // TASK 2 & CT-03: Eliminate new root-only creation from FE.
    // All creation pathways must call typed POST routes with required fullName or legalName.
    // Legacy server route remains on backend (do not delete), but FE rejects incomplete/untyped identities.
    const isPerson =
      data.type === "Person" ||
      (typeof data.fullName === "string" && data.fullName.trim().length > 0);

    if (isPerson) {
      const fullName = (
        typeof data.fullName === "string" ? data.fullName : ""
      ).trim();

      if (!fullName) {
        throw new Error("Person creation requires fullName");
      }

      return await this.createPerson({
        fullName,
        displayName: typeof data.displayName === "string" ? data.displayName : undefined,
        givenName: typeof data.givenName === "string" ? data.givenName : undefined,
        middleNames: typeof data.middleNames === "string" ? data.middleNames : undefined,
        familyName: typeof data.familyName === "string" ? data.familyName : undefined,
        dateOfBirth: typeof data.dateOfBirth === "string" ? data.dateOfBirth : undefined,
        isMinor: typeof data.isMinor === "boolean" ? data.isMinor : undefined,
        phone: typeof data.phone === "string" ? data.phone : undefined,
        email: typeof data.email === "string" ? data.email : undefined,
        idempotencyKey: typeof data.idempotencyKey === "string" ? data.idempotencyKey : undefined,
      });
    }

    if (data.type === "Organization") {
      const legalName = (
        typeof data.legalName === "string" ? data.legalName : ""
      ).trim();

      if (!legalName) {
        throw new Error("Organization creation requires legalName");
      }

      return await this.createOrganization({
        legalName,
        displayName: typeof data.displayName === "string" ? data.displayName.trim() : undefined,
        taxId: typeof data.taxId === "string" ? data.taxId.trim() : undefined,
        phone: typeof data.phone === "string" ? data.phone.trim() : undefined,
        email: typeof data.email === "string" ? data.email.trim() : undefined,
        idempotencyKey: typeof data.idempotencyKey === "string" ? data.idempotencyKey : undefined,
      });
    }

    throw new Error(
      "Direct untyped party creation is deprecated. All Contacts must be created as either Person (with fullName) or Organization (with legalName)."
    );
  }

  async createPerson(
    params: CreatePersonParams,
    explicitIdempotencyKey?: string
  ): Promise<string> {
    const fullName = params.fullName.trim();
    if (!fullName) {
      throw new Error("Full name is required");
    }

    if (!this.service.createPerson) {
      throw new Error("Backend does not support atomic person creation");
    }

    // TASK 3: Use caller-provided idempotency key across retries of the SAME intent.
    // Do not generate a new key for every HTTP retry.
    const idempotencyKey =
      explicitIdempotencyKey ||
      params.idempotencyKey ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : undefined);

    const response = await this.service.createPerson(
      {
        fullName,
        displayName: params.displayName?.trim() || fullName,
        givenName: params.givenName?.trim() || null,
        middleNames: params.middleNames?.trim() || null,
        familyName: params.familyName?.trim() || null,
      },
      idempotencyKey
    );
    const partyId = response.id;

    // Attach contact point if provided (separate non-blocking writes per ADR-002)
    const callerKey = explicitIdempotencyKey || params.idempotencyKey;
    const phoneKey = callerKey ? `${callerKey}:phone` : undefined;
    const emailKey = callerKey ? `${callerKey}:email` : undefined;

    if (params.phone && this.contactPointRepo) {
      try {
        const payload = {
          partyId,
          type: "Phone",
          value: params.phone.trim(),
          isPrimary: true,
        };
        if (phoneKey) {
          await this.contactPointRepo.create(payload, phoneKey);
        } else {
          await this.contactPointRepo.create(payload);
        }
      } catch (err) {
        if (params.onContactPointFailure) {
          params.onContactPointFailure(
            err instanceof Error ? err : new Error(String(err)),
            partyId
          );
        }
      }
    }

    if (params.email && this.contactPointRepo) {
      try {
        const payload = {
          partyId,
          type: "Email",
          value: params.email.trim(),
          isPrimary: true,
        };
        if (emailKey) {
          await this.contactPointRepo.create(payload, emailKey);
        } else {
          await this.contactPointRepo.create(payload);
        }
      } catch (err) {
        if (params.onContactPointFailure) {
          params.onContactPointFailure(
            err instanceof Error ? err : new Error(String(err)),
            partyId
          );
        }
      }
    }

    return partyId;
  }

  async createOrganization(
    params: CreateOrganizationParams,
    explicitIdempotencyKey?: string
  ): Promise<string> {
    const legalName = params.legalName.trim();
    if (!legalName) {
      throw new Error("Legal name is required");
    }
    const displayName = (params.displayName || legalName).trim();

    // 1. Atomic organization creation via backend endpoint
    if (!this.service.createOrganization) {
      throw new Error("Backend does not support atomic organization creation");
    }

    // Stable idempotency key per intent across retries
    const idempotencyKey =
      explicitIdempotencyKey ||
      params.idempotencyKey ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : undefined);

    const response = await this.service.createOrganization(
      {
        legalName,
        displayName,
      },
      idempotencyKey
    );
    const partyId = response.id;

    // 2. Primary contact methods if provided
    const callerKey = explicitIdempotencyKey || params.idempotencyKey;
    const phoneKey = callerKey ? `${callerKey}:phone` : undefined;
    const emailKey = callerKey ? `${callerKey}:email` : undefined;

    if (params.phone && this.contactPointRepo) {
      try {
        const payload = {
          partyId,
          type: "Phone",
          value: params.phone.trim(),
          isPrimary: true,
        };
        if (phoneKey) {
          await this.contactPointRepo.create(payload, phoneKey);
        } else {
          await this.contactPointRepo.create(payload);
        }
      } catch (err) {
        if (params.onContactPointFailure) {
          params.onContactPointFailure(
            err instanceof Error ? err : new Error(String(err)),
            partyId
          );
        }
      }
    }

    if (params.email && this.contactPointRepo) {
      try {
        const payload = {
          partyId,
          type: "Email",
          value: params.email.trim(),
          isPrimary: true,
        };
        if (emailKey) {
          await this.contactPointRepo.create(payload, emailKey);
        } else {
          await this.contactPointRepo.create(payload);
        }
      } catch (err) {
        if (params.onContactPointFailure) {
          params.onContactPointFailure(
            err instanceof Error ? err : new Error(String(err)),
            partyId
          );
        }
      }
    }

    return partyId;
  }

  async lookupPeople(params: { page?: number; pageSize?: number; search?: string } = {}) {
    if (!this.service.lookupPeople) {
      throw new Error("Backend does not support people lookup");
    }
    const res = await this.service.lookupPeople({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      search: params.search?.trim(),
    });
    return {
      items: (res.items || []).map(PartyMapper.toContactLookup),
      totalCount: res.totalCount,
      page: res.pageNumber,
      pageSize: res.pageSize,
      totalPages: res.totalPages,
    };
  }

  async lookupOrganizations(params: { page?: number; pageSize?: number; search?: string } = {}) {
    if (!this.service.lookupOrganizations) {
      throw new Error("Backend does not support organization lookup");
    }
    const res = await this.service.lookupOrganizations({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      search: params.search?.trim(),
    });
    return {
      items: (res.items || []).map(PartyMapper.toContactLookup),
      totalCount: res.totalCount,
      page: res.pageNumber,
      pageSize: res.pageSize,
      totalPages: res.totalPages,
    };
  }

  async lookupContacts(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: "all" | "Person" | "Organization";
  } = {}) {
    const type = params.type ?? "all";
    if (type === "Person") {
      const res = await this.lookupPeople(params);
      return { items: res.items, totalCount: res.totalCount };
    }
    if (type === "Organization") {
      const res = await this.lookupOrganizations(params);
      return { items: res.items, totalCount: res.totalCount };
    }

    // "all": fetch both in parallel, merge and sort alphabetically by displayName
    const [peopleRes, orgRes] = await Promise.allSettled([
      this.lookupPeople(params),
      this.lookupOrganizations(params),
    ]);

    // If both queries failed, propagate the error so the UI can display permission/network error state
    if (peopleRes.status === "rejected" && orgRes.status === "rejected") {
      throw peopleRes.reason || orgRes.reason || new Error("Failed to lookup contacts");
    }

    const peopleItems = peopleRes.status === "fulfilled" ? peopleRes.value.items : [];
    const orgItems = orgRes.status === "fulfilled" ? orgRes.value.items : [];
    const combined = [...peopleItems, ...orgItems].sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );
    const totalCount =
      (peopleRes.status === "fulfilled" ? peopleRes.value.totalCount : 0) +
      (orgRes.status === "fulfilled" ? orgRes.value.totalCount : 0);

    return { items: combined, totalCount };
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.service.update(id, data);
  }

  async updatePartyName(
    id: string,
    displayName: string,
    options?: { type?: string; fullName?: string }
  ): Promise<void> {
    // If updating a Person with fullName or known type, use canonical updatePerson
    if (options?.type === "Person" && this.service.updatePerson) {
      await this.service.updatePerson(id, {
        fullName: options.fullName?.trim() || displayName.trim(),
        displayName: displayName.trim(),
      });
      return;
    }

    if (options?.type === "Organization") {
      await this.service.update(id, {
        type: "Organization",
        displayName: displayName.trim(),
      });
      return;
    }

    // Preserve Party.Type and PartyId immutability per ADR-002
    await this.service.update(id, { displayName: displayName.trim() });
  }

  async updatePerson(
    id: string,
    data: {
      fullName: string;
      displayName?: string | null;
      givenName?: string | null;
      middleNames?: string | null;
      familyName?: string | null;
    }
  ): Promise<void> {
    if (!this.service.updatePerson) {
      throw new Error("Backend does not support atomic person update");
    }
    await this.service.updatePerson(id, {
      fullName: data.fullName.trim(),
      displayName: data.displayName ? data.displayName.trim() : null,
      givenName: data.givenName ? data.givenName.trim() : null,
      middleNames: data.middleNames ? data.middleNames.trim() : null,
      familyName: data.familyName ? data.familyName.trim() : null,
    });
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async addContactPoint(params: AddContactPointParams): Promise<string> {
    if (!this.contactPointRepo) {
      throw new Error("ContactPoint repository is not wired");
    }
    return this.contactPointRepo.create(
      {
        partyId: params.partyId,
        type: params.type,
        value: params.value.trim(),
        isPrimary: params.isPrimary ?? false,
      },
      params.idempotencyKey
    );
  }

  async updateContactPoint(
    id: string,
    params: {
      partyId: string;
      type: string;
      value: string;
      isPrimary?: boolean;
    }
  ): Promise<void> {
    if (!this.contactPointRepo) {
      throw new Error("ContactPoint repository is not wired");
    }
    await this.contactPointRepo.update(id, {
      partyId: params.partyId,
      type: params.type,
      value: params.value.trim(),
      isPrimary: params.isPrimary ?? false,
    });
  }

  async removeContactPoint(id: string): Promise<void> {
    if (!this.contactPointRepo) {
      throw new Error("ContactPoint repository is not wired");
    }
    await this.contactPointRepo.delete(id);
  }

  async addRole(params: AddPartyRoleParams): Promise<string> {
    if (!this.roleRepo) {
      throw new Error("PartyRole repository is not wired");
    }
    return this.roleRepo.create({
      partyId: params.partyId,
      roleType: params.roleType,
      validFrom: params.validFrom || new Date().toISOString(),
      validTo: params.validTo,
    });
  }

  async removeRole(id: string): Promise<void> {
    if (!this.roleRepo) {
      throw new Error("PartyRole repository is not wired");
    }
    await this.roleRepo.delete(id);
  }

  async addRelationship(params: AddPartyRelationshipParams): Promise<string> {
    if (!this.relationshipRepo) {
      throw new Error("PartyRelationship repository is not wired");
    }
    return this.relationshipRepo.create({
      sourcePartyId: params.sourcePartyId,
      targetPartyId: params.targetPartyId,
      relationshipType: params.relationshipType,
      validFrom: params.validFrom || new Date().toISOString(),
      validTo: params.validTo,
    });
  }

  async removeRelationship(id: string): Promise<void> {
    if (!this.relationshipRepo) {
      throw new Error("PartyRelationship repository is not wired");
    }
    await this.relationshipRepo.delete(id);
  }
}
