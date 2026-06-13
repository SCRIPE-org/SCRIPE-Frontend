import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "architecture.solidPattern.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.solidPattern.principlesTitle",
    id: "solid-principles",
  },
  {
    type: "table",
    headers: ["Principle", "Meaning", "Application"],
    rows: [
      [
        "S — Single Responsibility",
        "One reason to change",
        "Each ViewModel handles ONE concern (stats, filters, table)",
      ],
      [
        "O — Open/Closed",
        "Open for extension, closed for modification",
        "Base hooks extended via composition, never modified",
      ],
      [
        "L — Liskov Substitution",
        "Subtypes must be substitutable",
        "All ViewModels return consistent typed interfaces",
      ],
      [
        "I — Interface Segregation",
        "No client forced to depend on unused interfaces",
        "Components receive only the props they need",
      ],
      [
        "D — Dependency Inversion",
        "Depend on abstractions",
        "Views depend on ViewModel hook interfaces, not implementations",
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.solidPattern.scenariosTitle",
    id: "scenarios",
  },
  { type: "paragraph", contentKey: "architecture.solidPattern.scenariosIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.solidPattern.scenario1Title",
    id: "crud-list",
  },
  { type: "paragraph", contentKey: "architecture.solidPattern.scenario1Intro" },
  {
    type: "code",
    language: "text",
    filename: "CRUD List Page Structure",
    code: `user-management/src/presentation/
├── views/
│   └── UserManagementView.tsx      # ~200 lines max, pure composition
├── viewmodels/
│   ├── useUserManagementViewModel.ts    # Orchestrator
│   ├── useStatisticsViewModel.ts        # Stats logic
│   ├── useFilterViewModel.ts            # Filter state
│   └── useBlockUserAction.ts            # Row action
└── components/
    ├── StatisticsSection.tsx       # Stats UI
    └── FilterSection.tsx           # Filter UI`,
  },
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.solidPattern.scenario2Title",
    id: "dashboard",
  },
  { type: "paragraph", contentKey: "architecture.solidPattern.scenario2Intro" },
  {
    type: "code",
    language: "text",
    filename: "Dashboard Page Structure",
    code: `dashboard/src/presentation/
├── views/
│   └── DashboardView.tsx           # ~200 lines max
├── viewmodels/
│   ├── useDashboardViewModel.ts    # Orchestrator
│   ├── useKPIViewModel.ts          # KPI cards
│   ├── useChartViewModel.ts        # Chart data + period
│   └── useRecentActivityViewModel.ts
└── components/
    ├── KPICards.tsx
    ├── SalesChart.tsx
    └── RecentActivityTable.tsx`,
  },
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.solidPattern.scenario3Title",
    id: "detail-profile",
  },
  { type: "paragraph", contentKey: "architecture.solidPattern.scenario3Intro" },
  {
    type: "code",
    language: "typescript",
    filename: "Profile Orchestrator ViewModel",
    code: `export function useUserProfileViewModel(userId: string) {
  const [activeTab, setActiveTab] = useState("activity");

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userRepository.getById(userId),
  });

  const header = useProfileHeaderViewModel(user);
  const activity = useActivityTabViewModel(userId);
  const settings = useSettingsTabViewModel(userId);

  return {
    user, isLoading, error,
    activeTab, setActiveTab,
    tabs: [
      { id: "activity", label: t("profile.tabs.activity") },
      { id: "settings", label: t("profile.tabs.settings") },
    ],
    header, activity, settings,
  };
}`,
    highlightLines: [9, 10, 11],
  },
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.solidPattern.scenario4Title",
    id: "settings",
  },
  { type: "paragraph", contentKey: "architecture.solidPattern.scenario4Intro" },
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.solidPattern.scenario5Title",
    id: "wizard",
  },
  { type: "paragraph", contentKey: "architecture.solidPattern.scenario5Intro" },
  {
    type: "code",
    language: "typescript",
    filename: "Wizard ViewModel Pattern",
    code: `export function useOnboardingViewModel() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const step1 = useStep1ViewModel();
  const step2 = useStep2ViewModel();
  const step3 = useStep3ViewModel();

  const canGoNext = useMemo(() => {
    if (currentStep === 1) return step1.form.formState.isValid;
    if (currentStep === 2) return step2.form.formState.isValid;
    return true;
  }, [currentStep, step1, step2]);

  const { mutate: submitAll, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      const combined = {
        ...step1.form.getValues(),
        ...step2.form.getValues(),
        ...step3.form.getValues(),
      };
      return onboardingRepository.complete(combined);
    },
  });

  return {
    currentStep, totalSteps,
    canGoNext, canGoPrev: currentStep > 1,
    goNext: () => setCurrentStep(s => Math.min(s + 1, totalSteps)),
    goPrev: () => setCurrentStep(s => Math.max(s - 1, 1)),
    step1, step2, step3,
    isSubmitting, submitAll,
  };
}`,
    highlightLines: [5, 6, 7, 9],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.solidPattern.rulesTitle",
    id: "golden-rules",
  },
  {
    type: "list",
    variant: "ordered",
    items: [
      "Views are pure UI — No state, no logic, no mutations",
      "ViewModels handle ALL logic — State, mutations, computed values",
      "One ViewModel per concern — Statistics, Filters, Table = separate hooks",
      "Orchestrator composes — Main ViewModel composes section ViewModels",
      "Columns defined in ViewModel — Not in View or Component",
      "Max ~200 lines per View — If longer, extract section components",
      "No JSX in ViewModels — ViewModels return data, not UI",
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "architecture.solidPattern.antiPatternWarning",
  },
];

registerPage({
  slug: "architecture/solid-pattern",
  titleKey: "architecture.solidPattern.title",
  descriptionKey: "architecture.solidPattern.description",
  category: "architecture",
  order: 6,
  sections,
  relatedSlugs: ["architecture/frontend", "architecture/state-management"],
  lastUpdated: "2026-02-19",
});
