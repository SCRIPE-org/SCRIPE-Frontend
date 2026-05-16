/**
* Marketplace ViewModel
*
* Handles all state management for the Marketplace list view.
* Uses useCrudViewModel for standard CRUD operations.
*/
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getMarketplaceContainer } from "../../../di";
import type { Marketplace } from "../../domain/entities/Marketplace";

export function useMarketplaceViewModel() {
const { marketplaceRepository } = getMarketplaceContainer();

const vm = useCrudViewModel(["marketplace"], {
getAll: async (params) => {
const res = await marketplaceRepository.getAll({
page: params.page,
pageSize: params.pageSize,
search: params.search,
});
return {
items: res.items || [],
pagination: {
itemsCount: res.totalCount,
pageSize: params.pageSize,
page: params.page,
pagesCount: res.totalPages,
},
};
},
create: async (data) => {
const id = await marketplaceRepository.create(data as Record<string, unknown>);
  return { id } as unknown as Marketplace;
  },
  update: async (id, data) => {
  await marketplaceRepository.update(id, data as Record<string, unknown>);
    return { id } as unknown as Marketplace;
    },
    delete: async (id) => {
    await marketplaceRepository.delete(id);
    },
    });

    return { vm };
    }