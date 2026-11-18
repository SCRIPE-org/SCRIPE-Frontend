"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { getCrmContainer } from "../../../../di";
import type {
  CrmEntitySearchItem,
  CrmEntitySearchKind,
  CrmQuickCreateEntityInput,
} from "../../domain/models/crm-overview.types";

export type {
  CrmEntitySearchItem,
  CrmEntitySearchKind,
  CrmQuickCreateEntityInput,
};

const EMPTY_OPTIONS: GenericSelectOption[] = [];

export interface UseCrmEntitySearchViewModelOptions {
  entityKind: CrmEntitySearchKind;
  value?: string | null;
  initialLabel?: string | null;
  initialDescription?: string | null;
  accountId?: string;
  valueMode?: "id" | "partyId";
  pageSize?: number;
}

function resolveOptionValue(
  item: CrmEntitySearchItem,
  entityKind: CrmEntitySearchKind,
  valueMode?: "id" | "partyId"
): string {
  if (valueMode === "partyId" || (!valueMode && entityKind === "party")) {
    return item.partyId || item.id;
  }
  return item.id;
}

/**
 * ViewModel hook mediating server-backed CRM entity/assignee searches and inline quick creation
 * strictly through CrmOverviewRepository -> Service -> IApiService.
 */
export function useCrmEntitySearchViewModel({
  entityKind,
  value,
  initialLabel,
  initialDescription,
  accountId,
  valueMode,
  pageSize = 25,
}: UseCrmEntitySearchViewModelOptions) {
  const { language } = useI18n();
  const isRtl = language === "ar";
  const normalizedValue = value ?? "";
  const normalizedInitialLabel = initialLabel ?? "";
  const normalizedInitialDesc = initialDescription ?? "";
  const scopedAccountId = accountId ?? "";
  const resolvedValueMode = valueMode ?? "";

  const itemByValueRef = useRef<Map<string, CrmEntitySearchItem>>(new Map());
  const [createdOptions, setCreatedOptions] = useState<GenericSelectOption[]>(EMPTY_OPTIONS);
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const toOption = useCallback(
    (item: CrmEntitySearchItem): GenericSelectOption => {
      const optionValue = resolveOptionValue(
        item,
        entityKind,
        resolvedValueMode === "id" || resolvedValueMode === "partyId" ? resolvedValueMode : undefined
      );
      const label = (isRtl && item.labelAr ? item.labelAr : item.label) || "";
      return {
        value: optionValue,
        label,
        description: item.description ?? undefined,
      };
    },
    [entityKind, isRtl, resolvedValueMode]
  );

  // Preserve initial human-readable label and quick-created records so encrypted IDs never flash.
  const fallbackOptions = useMemo<GenericSelectOption[]>(() => {
    const next: GenericSelectOption[] = [];
    const seen = new Set<string>();
    if (normalizedValue && normalizedInitialLabel) {
      seen.add(normalizedValue);
      next.push({
        value: normalizedValue,
        label: normalizedInitialLabel,
        description: normalizedInitialDesc || undefined,
      });
    }
    for (const opt of createdOptions) {
      if (!seen.has(opt.value)) {
        seen.add(opt.value);
        next.push(opt);
      }
    }
    return next.length > 0 ? next : EMPTY_OPTIONS;
  }, [normalizedValue, normalizedInitialLabel, normalizedInitialDesc, createdOptions]);

  const handleServerSearch = useCallback(
    async (query: string): Promise<GenericSelectOption[]> => {
      setLastSearchQuery(query.trim());
      const container = getCrmContainer();
      const repo = container.overviewRepository;
      let items: CrmEntitySearchItem[] = [];

      if (typeof repo?.searchEntities === "function") {
        items = await repo.searchEntities({
          kind: entityKind,
          query,
          accountId: scopedAccountId || undefined,
          pageSize,
        });
      } else if (entityKind === "account" && typeof container.accountRepository?.getAccounts === "function") {
        const res = await container.accountRepository.getAccounts({ page: 1, pageSize, search: query || undefined });
        items = (res.items ?? []).map((a) => ({
          id: a.id,
          partyId: a.partyId,
          accountId: a.id,
          kind: "account" as const,
          label: a.partyLegalNameEn,
          labelAr: a.partyLegalNameAr ?? null,
          description: [a.commercialTierCode, a.preferredCurrencyCode].filter(Boolean).join(" · ") || null,
          isVerified: true,
        }));
      } else if (entityKind === "contact" && typeof container.contactRepository?.getContacts === "function") {
        const res = await container.contactRepository.getContacts({
          page: 1,
          pageSize,
          search: query || undefined,
          accountId: scopedAccountId || undefined,
        });
        items = (res.items ?? []).map((c) => ({
          id: c.id,
          partyId: c.personPartyId,
          contactId: c.id,
          accountId: c.primaryAccountId ?? undefined,
          kind: "contact" as const,
          label: c.personLegalNameEn,
          labelAr: c.personLegalNameAr ?? null,
          description: [c.jobTitleSnapshot, c.primaryAccountNameEn, c.email || c.phone].filter(Boolean).join(" · ") || null,
          isVerified: Boolean(c.personPartyId),
          email: c.email ?? null,
          phone: c.phone ?? null,
        }));
      }

      const mode = resolvedValueMode === "id" || resolvedValueMode === "partyId" ? resolvedValueMode : undefined;
      for (const item of items) {
        const optVal = resolveOptionValue(item, entityKind, mode);
        if (optVal) {
          itemByValueRef.current.set(optVal, item);
        }
      }
      return items.map(toOption).filter((opt) => Boolean(opt.value && opt.label));
    },
    [entityKind, scopedAccountId, pageSize, resolvedValueMode, toOption]
  );

  const getCachedItem = useCallback((val: string): CrmEntitySearchItem | undefined => {
    return itemByValueRef.current.get(val);
  }, []);

  const handleQuickCreate = useCallback(
    async (input: CrmQuickCreateEntityInput): Promise<{ value: string; item: CrmEntitySearchItem }> => {
      setIsCreating(true);
      try {
        const container = getCrmContainer();
        const repo = container.overviewRepository;
        let created: CrmEntitySearchItem | null = null;

        if (typeof repo?.quickCreateEntity === "function") {
          created = await repo.quickCreateEntity(input);
        } else {
          const effKind = input.kind === "party" ? (input.entitySubKind ?? "contact") : input.kind;
          if (effKind === "account" && typeof container.accountRepository?.createAccount === "function") {
            const acc = await container.accountRepository.createAccount({
              organizationNameEn: input.nameEn.trim(),
              organizationNameAr: input.nameAr?.trim() || undefined,
              commercialTierCode: input.commercialTierCode?.trim() || undefined,
            });
            created = {
              id: acc.id,
              partyId: acc.partyId,
              accountId: acc.id,
              kind: "account",
              label: acc.partyLegalNameEn || input.nameEn.trim(),
              labelAr: acc.partyLegalNameAr ?? null,
              description: [acc.commercialTierCode, acc.preferredCurrencyCode, input.email].filter(Boolean).join(" · ") || null,
              isVerified: true,
            };
          } else if (typeof container.contactRepository?.createContact === "function") {
            const contact = await container.contactRepository.createContact({
              fullNameEn: input.nameEn.trim(),
              fullNameAr: input.nameAr?.trim() || undefined,
              email: input.email?.trim() || undefined,
              phone: input.phone?.trim() || undefined,
              jobTitleSnapshot: input.jobTitle?.trim() || undefined,
              primaryAccountId: input.primaryAccountId?.trim() || undefined,
            });
            created = {
              id: contact.id,
              partyId: contact.personPartyId,
              contactId: contact.id,
              accountId: contact.primaryAccountId ?? undefined,
              kind: "contact",
              label: contact.personLegalNameEn || input.nameEn.trim(),
              labelAr: contact.personLegalNameAr ?? null,
              description: [contact.jobTitleSnapshot, contact.email || contact.phone].filter(Boolean).join(" · ") || null,
              isVerified: Boolean(contact.personPartyId),
            };
          }
        }

        if (!created) {
          throw new Error("Quick create repository method unavailable");
        }

        const mode = resolvedValueMode === "id" || resolvedValueMode === "partyId" ? resolvedValueMode : undefined;
        const optVal = resolveOptionValue(created, entityKind, mode);
        itemByValueRef.current.set(optVal, created);
        const opt = toOption(created);
        setCreatedOptions((prev) => [opt, ...prev.filter((p) => p.value !== opt.value)]);
        setIsQuickCreateOpen(false);
        return { value: optVal, item: created };
      } finally {
        setIsCreating(false);
      }
    },
    [entityKind, resolvedValueMode, toOption]
  );

  return {
    fallbackOptions,
    handleServerSearch,
    getCachedItem,
    lastSearchQuery,
    isQuickCreateOpen,
    setIsQuickCreateOpen,
    isCreating,
    handleQuickCreate,
  };
}
