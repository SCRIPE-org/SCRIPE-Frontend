import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/state-management",
  titleKey: "architecture.stateManagement.title",
  category: "architecture",
  order: 7,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.stateManagement.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.stateManagement.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.stateManagement.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "architecture.stateManagement.section_3_hdr_0",
      "architecture.stateManagement.section_3_hdr_1",
      "architecture.stateManagement.section_3_hdr_2"
    ],
    "rows": [
      [
        "architecture.stateManagement.section_3_cell_0_0",
        "architecture.stateManagement.section_3_cell_0_1",
        "architecture.stateManagement.section_3_cell_0_2"
      ],
      [
        "architecture.stateManagement.section_3_cell_1_0",
        "architecture.stateManagement.section_3_cell_1_1",
        "architecture.stateManagement.section_3_cell_1_2"
      ],
      [
        "architecture.stateManagement.section_3_cell_2_0",
        "architecture.stateManagement.section_3_cell_2_1",
        "architecture.stateManagement.section_3_cell_2_2"
      ],
      [
        "architecture.stateManagement.section_3_cell_3_0",
        "architecture.stateManagement.section_3_cell_3_1",
        "architecture.stateManagement.section_3_cell_3_2"
      ],
      [
        "architecture.stateManagement.section_3_cell_4_0",
        "architecture.stateManagement.section_3_cell_4_1",
        "architecture.stateManagement.section_3_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.stateManagement.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.stateManagement.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.stateManagement.section_6_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// Key factory for consistent cache keys\nexport const employeeKeys = {\n  all: [\"employees\"] as const,\n  list: (filters: { page: number; search: string }) =>\n    [...employeeKeys.all, \"list\", filters] as const,\n  detail: (id: string) =>\n    [...employeeKeys.all, \"detail\", id] as const,\n};\n\n// Query hook\nexport function useEmployees(filters: { page: number; search: string }) {\n  const repo = container.employeeRepository;\n\n  return useQuery({\n    queryKey: employeeKeys.list(filters),\n    queryFn: async () => {\n      const result = await repo.getAll(filters);\n      if (result.isErr()) throw result.error;\n      return result.value;\n    },\n    staleTime: 5 * 60 * 1000, // 5 minutes\n  });\n}\n\n// Mutation hook (auto-invalidates cache)\nexport function useCreateEmployee() {\n  const queryClient = useQueryClient();\n\n  return useMutation({\n    mutationFn: async (data: CreateEmployeeInput) => {\n      const result = await container.employeeRepository.create(data);\n      if (result.isErr()) throw result.error;\n      return result.value;\n    },\n    onSuccess: () => {\n      queryClient.invalidateQueries({ queryKey: employeeKeys.all });\n    },\n  });\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.stateManagement.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.stateManagement.section_9_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.stateManagement.section_10_hdr_0",
      "architecture.stateManagement.section_10_hdr_1",
      "architecture.stateManagement.section_10_hdr_2",
      "architecture.stateManagement.section_10_hdr_3"
    ],
    "rows": [
      [
        "architecture.stateManagement.section_10_cell_0_0",
        "architecture.stateManagement.section_10_cell_0_1",
        "architecture.stateManagement.section_10_cell_0_2",
        "architecture.stateManagement.section_10_cell_0_3"
      ],
      [
        "architecture.stateManagement.section_10_cell_1_0",
        "architecture.stateManagement.section_10_cell_1_1",
        "architecture.stateManagement.section_10_cell_1_2",
        "architecture.stateManagement.section_10_cell_1_3"
      ],
      [
        "architecture.stateManagement.section_10_cell_2_0",
        "architecture.stateManagement.section_10_cell_2_1",
        "architecture.stateManagement.section_10_cell_2_2",
        "architecture.stateManagement.section_10_cell_2_3"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.stateManagement.section_11_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "export const useAuthStore = create<AuthState>()(\n  persist(\n    (set) => ({\n      user: null,\n      token: null,\n      isAuthenticated: false,\n\n      login: (user, token) => set({\n        user, token, isAuthenticated: true,\n      }),\n\n      logout: () => set({\n        user: null, token: null, isAuthenticated: false,\n      }),\n    }),\n    {\n      name: \"auth-storage\",\n      partialize: (state) => ({\n        token: state.token,\n        user: state.user,\n      }),\n    }\n  )\n);",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.stateManagement.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "table",
    "headers": [
      "architecture.stateManagement.section_14_hdr_0",
      "architecture.stateManagement.section_14_hdr_1"
    ],
    "rows": [
      [
        "architecture.stateManagement.section_14_cell_0_0",
        "architecture.stateManagement.section_14_cell_0_1"
      ],
      [
        "architecture.stateManagement.section_14_cell_1_0",
        "architecture.stateManagement.section_14_cell_1_1"
      ],
      [
        "architecture.stateManagement.section_14_cell_2_0",
        "architecture.stateManagement.section_14_cell_2_1"
      ],
      [
        "architecture.stateManagement.section_14_cell_3_0",
        "architecture.stateManagement.section_14_cell_3_1"
      ],
      [
        "architecture.stateManagement.section_14_cell_4_0",
        "architecture.stateManagement.section_14_cell_4_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.stateManagement.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.stateManagement.section_16_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.stateManagement.section_17_hdr_0",
      "architecture.stateManagement.section_17_hdr_1",
      "architecture.stateManagement.section_17_hdr_2"
    ],
    "rows": [
      [
        "architecture.stateManagement.section_17_cell_0_0",
        "architecture.stateManagement.section_17_cell_0_1",
        "architecture.stateManagement.section_17_cell_0_2"
      ],
      [
        "architecture.stateManagement.section_17_cell_1_0",
        "architecture.stateManagement.section_17_cell_1_1",
        "architecture.stateManagement.section_17_cell_1_2"
      ],
      [
        "architecture.stateManagement.section_17_cell_2_0",
        "architecture.stateManagement.section_17_cell_2_1",
        "architecture.stateManagement.section_17_cell_2_2"
      ],
      [
        "architecture.stateManagement.section_17_cell_3_0",
        "architecture.stateManagement.section_17_cell_3_1",
        "architecture.stateManagement.section_17_cell_3_2"
      ],
      [
        "architecture.stateManagement.section_17_cell_4_0",
        "architecture.stateManagement.section_17_cell_4_1",
        "architecture.stateManagement.section_17_cell_4_2"
      ],
      [
        "architecture.stateManagement.section_17_cell_5_0",
        "architecture.stateManagement.section_17_cell_5_1",
        "architecture.stateManagement.section_17_cell_5_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "architecture.stateManagement.section_18_title",
    "contentKey": "architecture.stateManagement.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.stateManagement.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.stateManagement.section_20_item_0",
      "architecture.stateManagement.section_20_item_1"
    ]
  }
],
  relatedSlugs: [
  "architecture/frontend",
  "architecture/solid-pattern"
],
  lastUpdated: "2026-06-09",
});
