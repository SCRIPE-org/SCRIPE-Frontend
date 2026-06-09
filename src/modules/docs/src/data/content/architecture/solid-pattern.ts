import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/solid-pattern",
  titleKey: "architecture.solidPattern.title",
  category: "architecture",
  order: 6,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.solidPattern.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "architecture.solidPattern.section_3_hdr_0",
      "architecture.solidPattern.section_3_hdr_1",
      "architecture.solidPattern.section_3_hdr_2"
    ],
    "rows": [
      [
        "architecture.solidPattern.section_3_cell_0_0",
        "architecture.solidPattern.section_3_cell_0_1",
        "architecture.solidPattern.section_3_cell_0_2"
      ],
      [
        "architecture.solidPattern.section_3_cell_1_0",
        "architecture.solidPattern.section_3_cell_1_1",
        "architecture.solidPattern.section_3_cell_1_2"
      ],
      [
        "architecture.solidPattern.section_3_cell_2_0",
        "architecture.solidPattern.section_3_cell_2_1",
        "architecture.solidPattern.section_3_cell_2_2"
      ],
      [
        "architecture.solidPattern.section_3_cell_3_0",
        "architecture.solidPattern.section_3_cell_3_1",
        "architecture.solidPattern.section_3_cell_3_2"
      ],
      [
        "architecture.solidPattern.section_3_cell_4_0",
        "architecture.solidPattern.section_3_cell_4_1",
        "architecture.solidPattern.section_3_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.solidPattern.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_5_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.solidPattern.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_7_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_8_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "user-management/src/presentation/\n├── views/\n│   └── UserManagementView.tsx      # ~60 lines, pure composition\n├── viewmodels/\n│   ├── useUserManagementViewModel.ts    # Orchestrator\n│   ├── useStatisticsViewModel.ts        # Stats logic\n│   ├── useFilterViewModel.ts            # Filter state\n│   └── useBlockUserAction.ts            # Row action\n└── components/\n    ├── StatisticsSection.tsx       # Stats UI\n    └── FilterSection.tsx           # Filter UI",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.solidPattern.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_11_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_12_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "dashboard/src/presentation/\n├── views/\n│   └── DashboardView.tsx           # ~60 lines\n├── viewmodels/\n│   ├── useDashboardViewModel.ts    # Orchestrator\n│   ├── useKPIViewModel.ts          # KPI cards\n│   ├── useChartViewModel.ts        # Chart data + period\n│   └── useRecentActivityViewModel.ts\n└── components/\n    ├── KPICards.tsx\n    ├── SalesChart.tsx\n    └── RecentActivityTable.tsx",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.solidPattern.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_15_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_16_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "export function useUserProfileViewModel(userId: string) {\n  const [activeTab, setActiveTab] = useState(\"activity\");\n\n  const { data: user, isLoading, error } = useQuery({\n    queryKey: [\"user\", userId],\n    queryFn: () => userRepository.getById(userId),\n  });\n\n  const header = useProfileHeaderViewModel(user);\n  const activity = useActivityTabViewModel(userId);\n  const settings = useSettingsTabViewModel(userId);\n\n  return {\n    user, isLoading, error,\n    activeTab, setActiveTab,\n    tabs: [\n      { id: \"activity\", label: t(\"profile.tabs.activity\") },\n      { id: \"settings\", label: t(\"profile.tabs.settings\") },\n    ],\n    header, activity, settings,\n  };\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.solidPattern.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_19_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.solidPattern.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_21_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.solidPattern.section_22_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "export function useOnboardingViewModel() {\n  const [currentStep, setCurrentStep] = useState(1);\n  const totalSteps = 3;\n\n  const step1 = useStep1ViewModel();\n  const step2 = useStep2ViewModel();\n  const step3 = useStep3ViewModel();\n\n  const canGoNext = useMemo(() => {\n    if (currentStep === 1) return step1.form.formState.isValid;\n    if (currentStep === 2) return step2.form.formState.isValid;\n    return true;\n  }, [currentStep, step1, step2]);\n\n  const { mutate: submitAll, isPending: isSubmitting } = useMutation({\n    mutationFn: async () => {\n      const combined = {\n        ...step1.form.getValues(),\n        ...step2.form.getValues(),\n        ...step3.form.getValues(),\n      };\n      return onboardingRepository.complete(combined);\n    },\n  });\n\n  return {\n    currentStep, totalSteps,\n    canGoNext, canGoPrev: currentStep > 1,\n    goNext: () => setCurrentStep(s => Math.min(s + 1, totalSteps)),\n    goPrev: () => setCurrentStep(s => Math.max(s - 1, 1)),\n    step1, step2, step3,\n    isSubmitting, submitAll,\n  };\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.solidPattern.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "list",
    "variant": "ordered",
    "items": [
      "architecture.solidPattern.section_25_item_0",
      "architecture.solidPattern.section_25_item_1",
      "architecture.solidPattern.section_25_item_2",
      "architecture.solidPattern.section_25_item_3",
      "architecture.solidPattern.section_25_item_4",
      "architecture.solidPattern.section_25_item_5",
      "architecture.solidPattern.section_25_item_6"
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "architecture.solidPattern.section_26_title",
    "contentKey": "architecture.solidPattern.section_26_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.solidPattern.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.solidPattern.section_28_item_0",
      "architecture.solidPattern.section_28_item_1"
    ]
  }
],
  relatedSlugs: [
  "architecture/frontend",
  "architecture/state-management"
],
  lastUpdated: "2026-06-09",
});
