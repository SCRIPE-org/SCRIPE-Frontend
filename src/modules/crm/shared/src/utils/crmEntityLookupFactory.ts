import type { IApiService } from "@core/interfaces/api.interface";
import type { ICrmAccountRepository } from "../../../accounts/src/domain/interfaces/ICrmAccountRepository";
import type { ICrmContactRepository } from "../../../contacts/src/domain/interfaces/ICrmContactRepository";
import type {
  CrmEntitySearchItem,
  CrmEntitySearchRequest,
  CrmQuickCreateEntityInput,
  ICrmEntityLookupProvider,
  ICrmSettingsRepository,
} from "../types/crmSharedTypes";

/** Re-exported shared API service contract for entity lookup callers. */
export type { IApiService };

/**
 * Composes the cross-submodule entity/assignee lookup and inline quick-create provider
 * from Account, Contact, and Settings repositories without breaking submodule isolation.
 */
export function buildCrmEntityLookupProvider(
  accountRepository: ICrmAccountRepository,
  contactRepository: ICrmContactRepository,
  settingsRepository: ICrmSettingsRepository
): ICrmEntityLookupProvider {
  return {
    async searchEntities(request: CrmEntitySearchRequest): Promise<CrmEntitySearchItem[]> {
      const limit = Math.min(Math.max(request.pageSize ?? 25, 1), 50);
      const query = request.query?.trim() || undefined;

      if (request.kind === "party") {
        const parties = await accountRepository.lookupCandidateParties(query, "all");
        return parties.slice(0, limit).map((party) => ({
          id: party.partyId,
          partyId: party.partyId,
          kind: "party" as const,
          label: party.legalNameEn,
          labelAr: party.legalNameAr ?? null,
          description: party.partyKind || null,
          isVerified: Boolean(party.isVerified),
        }));
      }

      if (request.kind === "account") {
        const result = await accountRepository.getAccounts({ page: 1, pageSize: limit, search: query });
        return result.items.map((acc) => ({
          id: acc.id,
          partyId: acc.partyId,
          accountId: acc.id,
          kind: "account" as const,
          label: acc.partyLegalNameEn,
          labelAr: acc.partyLegalNameAr ?? null,
          description: [acc.commercialTierCode, acc.preferredCurrencyCode].filter(Boolean).join(" · ") || null,
          isVerified: true,
        }));
      }

      if (request.kind === "contact") {
        const result = await contactRepository.getContacts({
          page: 1,
          pageSize: limit,
          search: query,
          accountId: request.accountId,
        });
        return result.items.map((contact) => ({
          id: contact.id,
          partyId: contact.personPartyId,
          contactId: contact.id,
          accountId: contact.primaryAccountId,
          kind: "contact" as const,
          label: contact.personLegalNameEn,
          labelAr: contact.personLegalNameAr ?? null,
          description:
            [contact.jobTitleSnapshot, contact.primaryAccountNameEn, contact.email || contact.phone]
              .filter(Boolean)
              .join(" · ") || null,
          isVerified: Boolean(contact.personPartyId),
          email: contact.email ?? null,
          phone: contact.phone ?? null,
        }));
      }

      const assigneeKind = request.kind === "user" ? "user" : request.kind === "team" ? "team" : "all";
      const assignees = await settingsRepository.lookupAssignees(query, assigneeKind, limit);
      return assignees.map((assignee) => ({
        id: assignee.id,
        kind: assignee.kind,
        label: assignee.displayName,
        labelAr: assignee.displayNameAr ?? null,
        description: assignee.subtitle ?? null,
        email: assignee.email ?? null,
      }));
    },

    async quickCreateEntity(input: CrmQuickCreateEntityInput): Promise<CrmEntitySearchItem> {
      const effectiveKind = input.kind === "party" ? (input.entitySubKind ?? "contact") : input.kind;
      if (effectiveKind === "account") {
        const created = await accountRepository.createAccount({
          organizationNameEn: input.nameEn.trim(),
          organizationNameAr: input.nameAr?.trim() || undefined,
          email: input.email?.trim() || undefined,
          phone: input.phone?.trim() || undefined,
          commercialTierCode: input.commercialTierCode?.trim() || undefined,
        });
        return {
          id: created.id,
          partyId: created.partyId,
          accountId: created.id,
          kind: "account",
          label: created.partyLegalNameEn || input.nameEn.trim(),
          labelAr: created.partyLegalNameAr ?? input.nameAr?.trim() ?? null,
          description: input.email?.trim() || null,
          isVerified: true,
          email: input.email?.trim() || null,
          phone: input.phone?.trim() || null,
        };
      }

      const created = await contactRepository.createContact({
        fullNameEn: input.nameEn.trim(),
        fullNameAr: input.nameAr?.trim() || undefined,
        email: input.email?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        jobTitleSnapshot: input.jobTitle?.trim() || undefined,
        primaryAccountId: input.primaryAccountId?.trim() || undefined,
      });
      return {
        id: created.id,
        partyId: created.personPartyId,
        contactId: created.id,
        accountId: created.primaryAccountId,
        kind: "contact",
        label: created.personLegalNameEn || input.nameEn.trim(),
        labelAr: created.personLegalNameAr ?? input.nameAr?.trim() ?? null,
        description:
          [created.jobTitleSnapshot ?? input.jobTitle, created.email ?? input.email, created.phone ?? input.phone]
            .filter(Boolean)
            .join(" · ") || null,
        isVerified: Boolean(created.personPartyId),
        email: created.email ?? input.email ?? null,
        phone: created.phone ?? input.phone ?? null,
      };
    },
  };
}
