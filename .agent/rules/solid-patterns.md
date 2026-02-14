---
trigger: always_on
---

# SOLID View/ViewModel Patterns Guide

> **MANDATORY ARCHITECTURE** for ALL pages in `src/modules/`

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Page Type Scenarios](#page-type-scenarios)
3. [ViewModel Patterns](#viewmodel-patterns)
4. [Decision Flowcharts](#decision-flowcharts)
5. [File Structure Templates](#file-structure-templates)

---

## Core Principles

### The Golden Rules

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIEW (Pure UI)                               │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Max ~60 lines                                                │
│  ✅ Zero useState, Zero useEffect                                │
│  ✅ Only destructures from ViewModel                             │
│  ✅ Returns JSX with component composition                       │
│  ❌ NO business logic                                            │
│  ❌ NO API calls                                                 │
│  ❌ NO data transformations                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                         uses hook
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    VIEWMODEL (All Logic)                        │
├─────────────────────────────────────────────────────────────────┤
│  ✅ All useState lives here                                      │
│  ✅ All useQuery/useMutation lives here                          │
│  ✅ All event handlers defined here                              │
│  ✅ All data transformations here                                │
│  ✅ Returns typed interface for View                             │
│  ❌ NO JSX                                                       │
│  ❌ NO direct DOM manipulation                                   │
└─────────────────────────────────────────────────────────────────┘
```

### SOLID Breakdown

| Principle                 | Application                                                     |
| ------------------------- | --------------------------------------------------------------- |
| **S**ingle Responsibility | Each ViewModel handles ONE concern (filter, stats, table, etc.) |
| **O**pen/Closed           | ViewModels extend via composition, not modification             |
| **L**iskov Substitution   | All ViewModels return consistent typed interfaces               |
| **I**nterface Segregation | Views receive only the props they need                          |
| **D**ependency Inversion  | ViewModels depend on Repository interfaces, not implementations |

---

## Page Type Scenarios

### Scenario 1: CRUD List Page

**Use when**: Managing entity collections (Users, Products, Orders)

```
📁 user-management/src/presentation/
├── views/
│   └── UserManagementView.tsx      # ~60 lines, pure composition
├── viewmodels/
│   ├── useUserManagementViewModel.ts    # Orchestrator
│   ├── useStatisticsViewModel.ts        # Stats logic
│   ├── useFilterViewModel.ts            # Filter state
│   └── useBlockUserAction.ts            # Row action
└── components/
    ├── StatisticsSection.tsx       # Stats UI
    └── FilterSection.tsx           # Filter UI
```

**View Pattern**:

```typescript
'use client';

export function UserManagementView() {
  const vm = useUserManagementViewModel();

  return (
    <div>
      <h1>{vm.title}</h1>
      <FilterSection {...vm.filters} />
      <StatisticsSection {...vm.statistics} />
      <GenericCrudView {...vm.table} columns={vm.columns} />
    </div>
  );
}
```

---

### Scenario 2: Dashboard / Analytics Page

**Use when**: Displaying charts, KPIs, metrics, summaries

```
📁 dashboard/src/presentation/
├── views/
│   └── DashboardView.tsx           # ~60 lines
├── viewmodels/
│   ├── useDashboardViewModel.ts    # Orchestrator
│   ├── useKPIViewModel.ts          # KPI cards
│   ├── useChartViewModel.ts        # Chart data
│   └── useRecentActivityViewModel.ts
└── components/
    ├── KPICards.tsx
    ├── SalesChart.tsx
    ├── RevenueChart.tsx
    └── RecentActivityTable.tsx
```

**ViewModel Pattern**:

```typescript
"use client";

interface ChartViewModelResult {
  data: ChartDataPoint[];
  isLoading: boolean;
  period: "week" | "month" | "year";
  setPeriod: (p: "week" | "month" | "year") => void;
  chartConfig: ChartConfig;
}

export function useChartViewModel(): ChartViewModelResult {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const { data, isLoading } = useQuery({
    queryKey: ["chart", period],
    queryFn: () => analyticsRepository.getSalesData(period),
  });

  const chartConfig = useMemo(
    () => ({
      type: "line",
      colors: ["#3b82f6"],
      // ...
    }),
    []
  );

  return { data: data ?? [], isLoading, period, setPeriod, chartConfig };
}
```

---

### Scenario 3: Detail / Profile Page

**Use when**: Viewing single entity with tabs/sections

```
📁 user-profile/src/presentation/
├── views/
│   └── UserProfileView.tsx         # ~60 lines
├── viewmodels/
│   ├── useUserProfileViewModel.ts  # Orchestrator (fetches user)
│   ├── useProfileHeaderViewModel.ts
│   ├── useActivityTabViewModel.ts
│   └── useSettingsTabViewModel.ts
└── components/
    ├── ProfileHeader.tsx
    ├── ActivityTab.tsx
    ├── SettingsTab.tsx
    └── TabNavigation.tsx
```

**Orchestrator Pattern**:

```typescript
"use client";

interface UserProfileViewModelResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;

  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: TabConfig[];

  header: ProfileHeaderViewModelResult;
  activity: ActivityTabViewModelResult;
  settings: SettingsTabViewModelResult;
}

export function useUserProfileViewModel(userId: string): UserProfileViewModelResult {
  const [activeTab, setActiveTab] = useState("activity");

  // Fetch main user data
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userRepository.getById(userId),
  });

  // Compose section ViewModels
  const header = useProfileHeaderViewModel(user);
  const activity = useActivityTabViewModel(userId);
  const settings = useSettingsTabViewModel(userId);

  const tabs = [
    { id: "activity", label: t("profile.tabs.activity") },
    { id: "settings", label: t("profile.tabs.settings") },
  ];

  return {
    user,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    tabs,
    header,
    activity,
    settings,
  };
}
```

---

### Scenario 4: Settings / Configuration Page

**Use when**: Multiple form sections that save independently

```
📁 settings/src/presentation/
├── views/
│   └── SettingsView.tsx            # ~50 lines
├── viewmodels/
│   ├── useSettingsViewModel.ts     # Orchestrator
│   ├── useGeneralSettingsViewModel.ts
│   ├── useNotificationSettingsViewModel.ts
│   └── useSecuritySettingsViewModel.ts
└── components/
    ├── GeneralSettingsForm.tsx
    ├── NotificationSettingsForm.tsx
    └── SecuritySettingsForm.tsx
```

**Form Section ViewModel Pattern**:

```typescript
"use client";

interface GeneralSettingsViewModelResult {
  form: UseFormReturn<GeneralSettingsSchema>;
  isLoading: boolean;
  isSaving: boolean;
  onSubmit: (data: GeneralSettingsSchema) => void;
  isDirty: boolean;
}

export function useGeneralSettingsViewModel(): GeneralSettingsViewModelResult {
  const form = useForm<GeneralSettingsSchema>({
    resolver: zodResolver(generalSettingsSchema),
  });

  // Fetch current settings
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "general"],
    queryFn: () => settingsRepository.getGeneral(),
  });

  // Populate form when data arrives
  useEffect(() => {
    if (data) form.reset(data);
  }, [data, form]);

  // Save mutation
  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: settingsRepository.updateGeneral,
    onSuccess: () => toast.success(t("settings.saved")),
  });

  return {
    form,
    isLoading,
    isSaving,
    onSubmit: form.handleSubmit((data) => mutate(data)),
    isDirty: form.formState.isDirty,
  };
}
```

---

### Scenario 5: Wizard / Multi-Step Form

**Use when**: Complex flows like onboarding, checkout, registration

```
📁 onboarding/src/presentation/
├── views/
│   └── OnboardingView.tsx          # ~60 lines
├── viewmodels/
│   ├── useOnboardingViewModel.ts   # Wizard orchestrator
│   ├── useStep1ViewModel.ts
│   ├── useStep2ViewModel.ts
│   └── useStep3ViewModel.ts
└── components/
    ├── StepIndicator.tsx
    ├── Step1Form.tsx
    ├── Step2Form.tsx
    └── Step3Form.tsx
```

**Wizard ViewModel Pattern**:

```typescript
"use client";

interface OnboardingViewModelResult {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrev: boolean;

  goNext: () => void;
  goPrev: () => void;
  goToStep: (step: number) => void;

  step1: Step1ViewModelResult;
  step2: Step2ViewModelResult;
  step3: Step3ViewModelResult;

  isSubmitting: boolean;
  submitAll: () => void;
}

export function useOnboardingViewModel(): OnboardingViewModelResult {
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
    currentStep,
    totalSteps,
    canGoNext,
    canGoPrev: currentStep > 1,
    goNext: () => setCurrentStep((s) => Math.min(s + 1, totalSteps)),
    goPrev: () => setCurrentStep((s) => Math.max(s - 1, 1)),
    goToStep: setCurrentStep,
    step1,
    step2,
    step3,
    isSubmitting,
    submitAll,
  };
}
```

---

### Scenario 6: Report / Export Page

**Use when**: Generating and downloading reports

```
📁 reports/src/presentation/
├── views/
│   └── ReportBuilderView.tsx       # ~50 lines
├── viewmodels/
│   ├── useReportBuilderViewModel.ts
│   └── useReportPreviewViewModel.ts
└── components/
    ├── ReportFilters.tsx
    ├── ReportPreview.tsx
    └── ExportButtons.tsx
```

**Report ViewModel Pattern**:

```typescript
"use client";

interface ReportBuilderViewModelResult {
  // Filters
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedColumns: string[];
  toggleColumn: (col: string) => void;

  // Preview
  previewData: ReportRow[];
  isLoadingPreview: boolean;
  refreshPreview: () => void;

  // Export
  isExporting: boolean;
  exportPdf: () => void;
  exportExcel: () => void;
  exportCsv: () => void;
}
```

---

### Scenario 7: Simple Read-Only List

**Use when**: Displaying data without CRUD operations

```
📁 activity-log/src/presentation/
├── views/
│   └── ActivityLogView.tsx         # ~40 lines
├── viewmodels/
│   └── useActivityLogViewModel.ts
└── components/
    └── ActivityLogTable.tsx
```

**Simpler ViewModel (No Mutations)**:

```typescript
'use client';

interface ActivityLogViewModelResult {
  activities: Activity[];
  isLoading: boolean;
  error: Error | null;

  // Pagination
  page: number;
  setPage: (p: number) => void;
  totalPages: number;

  // Filtering
  search: string;
  setSearch: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
}

export function useActivityLogViewModel(): ActivityLogViewModelResult {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['activities', page, search, typeFilter],
    queryFn: () => activityRepository.list({ page, search, type: typeFilter }),
  });

  return {
    activities: data?.items ?? [],
    isLoading, error,
    page, setPage,
    to
```
