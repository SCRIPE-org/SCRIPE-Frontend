// FILE-EXCEPTION: static documentation content
import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ─────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.signupCustomization.intro" },

  // ─── What Is the Intelligence Engine ───────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.signupCustomization.whatIsTitle",
    id: "what-is",
  },
  { type: "paragraph", contentKey: "modules.signupCustomization.whatIsIntro" },

  // ─── Signup Flow Overview ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.signupCustomization.flowTitle",
    id: "signup-flow",
  },
  { type: "paragraph", contentKey: "modules.signupCustomization.flowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "User starts signup", type: "default" },
      { id: "B", label: "Category Selection (EditionCategory)", type: "primary" },
      { id: "C", label: "Global Onboarding Questions (Key, QuestionType)", type: "info" },
      { id: "D", label: "Category-scoped Questions (EditionCategoryId)", type: "info" },
      { id: "E", label: "Answers stored as SignupSessionAnswer", type: "default" },
      { id: "F", label: "RecommendationEngine evaluates RecommendationRules", type: "warning" },
      { id: "G", label: "Recommended Edition displayed with reason text", type: "success" },
      { id: "H", label: "User proceeds to billing / free signup", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
      { from: "F", to: "G" },
      { from: "G", to: "H" },
    ],
  },

  // ─── OnboardingQuestion Entity ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.signupCustomization.questionTitle",
    id: "onboarding-question",
  },
  { type: "paragraph", contentKey: "modules.signupCustomization.questionIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      [
        "Key",
        "string (max 100)",
        'Stable slug used in code and seeding, e.g. "team_size", "erp_priorities". Must be unique.',
      ],
      [
        "EditionCategoryId",
        "Guid?",
        "Optional FK to EditionCategory. Null = global (shown to all users). Non-null = only shown for that category.",
      ],
      ["QuestionType", "QuestionType enum", "SingleSelect (0) or MultiSelect (1)."],
      ["MinSelections", "int", "Minimum number of options the user must select. Default 1."],
      [
        "MaxSelections",
        "int",
        "Maximum number of options the user may select. Default 1 (typically 1 for SingleSelect).",
      ],
      [
        "IsRequired",
        "bool",
        "Whether the question must be answered before proceeding. Default true.",
      ],
      ["SortOrder", "int", "Display order within the flow. Lower values appear first."],
      [
        "DependsOnQuestionKey",
        "string? (max 100)",
        "Key of a preceding question this question depends on for conditional branching. Null = always shown.",
      ],
      [
        "DependsOnAnswerValue",
        "string? (max 200)",
        "The answer value from the preceding question that must be selected for this question to appear.",
      ],
      ["LabelEn", "string (max 500)", "Question text displayed to the user in English."],
      ["LabelAr", "string (max 500)", "Question text displayed to the user in Arabic."],
      [
        "HintEn",
        "string? (max 1000)",
        "Optional helper/hint text shown beneath the question in English.",
      ],
      [
        "HintAr",
        "string? (max 1000)",
        "Optional helper/hint text shown beneath the question in Arabic.",
      ],
      [
        "IconKey",
        "string? (max 100)",
        'Lucide icon name displayed alongside the question (e.g. "users", "target"). See lucide.dev/icons.',
      ],
      [
        "IsSystem",
        "bool",
        "If true, this question is system-seeded and cannot be deleted by users.",
      ],
    ],
  },

  // ─── OnboardingAnswerOption Entity ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.signupCustomization.optionTitle",
    id: "answer-option",
  },
  { type: "paragraph", contentKey: "modules.signupCustomization.optionIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["OnboardingQuestionId", "Guid", "FK to the parent OnboardingQuestion."],
      [
        "Value",
        "string (max 200)",
        'Stable slug used in scoring and branching logic, e.g. "solo", "2-10", "compliance". Unique within the same question.',
      ],
      [
        "LabelEn",
        "string (max 500)",
        'Primary display label in English (e.g. "Just me", "2–10 people").',
      ],
      ["LabelAr", "string (max 500)", "Primary display label in Arabic."],
      [
        "SublabelEn",
        "string? (max 500)",
        "Optional secondary/descriptive label in English shown beneath the main label.",
      ],
      ["SublabelAr", "string? (max 500)", "Optional secondary/descriptive label in Arabic."],
      [
        "IconKey",
        "string? (max 100)",
        'Lucide icon name displayed alongside the option (e.g. "user", "users", "building-2").',
      ],
      ["SortOrder", "int", "Display order within the option list. Lower values appear first."],
      [
        "SignalWeight",
        "int",
        "Integer weight contributed to the edition recommendation score when selected. Default 0 (neutral). Positive = push toward edition; negative = de-prioritize.",
      ],
      [
        "RelevanceBoost",
        "int",
        "Integer boost applied to this option's ranking when its visibility conditions are satisfied. Default 0.",
      ],
    ],
  },

  // ─── Option-Level Conditions (OnboardingAnswerOptionCondition) ──
  {
    type: "heading",
    level: 2,
    titleKey: "modules.signupCustomization.conditionTitle",
    id: "option-conditions",
  },
  { type: "paragraph", contentKey: "modules.signupCustomization.conditionIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["AnswerOptionId", "Guid", "FK to the owning OnboardingAnswerOption."],
      [
        "DependsOnQuestionKey",
        "string (max 100)",
        'Stable Key of the preceding question whose answer this condition reacts to, e.g. "scale_healthcare".',
      ],
      [
        "MatchValuesRaw",
        "string (max 1000)",
        "Backing storage: comma-delimited answer values that satisfy this condition. Accessed via MatchValues computed property.",
      ],
      [
        "MatchValues",
        "IReadOnlyList<string> (computed)",
        "The set of answer values that trigger visibility. Condition is satisfied if the user's selected values intersect this set (AnyOf / OR semantics).",
      ],
      [
        "MatchMode",
        "ConditionMatchMode enum",
        "Currently only AnyOf (0) — option visible if user's selection intersects MatchValues.",
      ],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.signupCustomization.conditionNote",
  },

  // ─── SignupSessionAnswer Entity ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.signupCustomization.sessionAnswerTitle",
    id: "signup-session-answer",
  },
  { type: "paragraph", contentKey: "modules.signupCustomization.sessionAnswerIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      [
        "SignupSessionRef",
        "string (max 256)",
        "Ties the answer to the in-flight SignupSession by its stable Ref string. Avoids a cross-module FK while allowing grouping and resume queries.",
      ],
      [
        "QuestionKey",
        "string (max 100)",
        "The question this answer belongs to. Matches OnboardingQuestion.Key.",
      ],
      [
        "ValueJson",
        "string (max 4000)",
        'The submitted answer serialized as JSON. Single-select: "\\"solo\\"". Multi-select: "[\\"compliance\\",\\"scale\\"]".',
      ],
      ["AnsweredAt", "DateTime", "UTC timestamp of when the user submitted this answer."],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.signupCustomization.sessionAnswerTip",
  },

  // ─── RecommendationRule Entity ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.signupCustomization.ruleTitle",
    id: "recommendation-rule",
  },
  { type: "paragraph", contentKey: "modules.signupCustomization.ruleIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      [
        "Name",
        "string (max 200)",
        'Stable slug used for seeding and upsert operations, e.g. "base-solo-free", "team-compliance-ultra".',
      ],
      [
        "EditionCategoryId",
        "Guid?",
        "Optional scope to a specific edition category. Null = rule applies across all categories.",
      ],
      [
        "ConditionJson",
        "string (max 4000)",
        'JSON predicate bag matched against signup answers. Single value: {"team_size":"solo"}. Multi-value (any match): {"priorities":["compliance","security"]}.',
      ],
      [
        "RecommendedTierLevel",
        "int?",
        "Target tier when no specific edition is pinned. 0 = Free, 1 = Pro, 2 = Ultra, 3 = Enterprise. Null = use RecommendedEditionId instead.",
      ],
      [
        "RecommendedEditionId",
        "Guid?",
        "Pin recommendation to a specific edition. Takes precedence over RecommendedTierLevel when both are set.",
      ],
      [
        "ScoreBonus",
        "int",
        "Score added when this rule matches. Higher totals surface the edition higher in the recommendation list.",
      ],
      [
        "ReasonEn",
        "string (max 1000)",
        "English explanation shown to the user explaining why this edition was recommended.",
      ],
      ["ReasonAr", "string (max 1000)", "Arabic explanation shown to the user."],
      ["Priority", "int", "Tie-break evaluation order. Lower values are evaluated first."],
      [
        "IsSystem",
        "bool",
        "If true, this rule is system-seeded and protected from deletion in the admin UI.",
      ],
    ],
  },

  // ─── Scoring Algorithm ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.signupCustomization.scoringTitle",
    id: "scoring-algorithm",
  },
  { type: "paragraph", contentKey: "modules.signupCustomization.scoringIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "RecommendationEngine (conceptual)",
    code: `// 1. Load all active RecommendationRules ordered by Priority ASC
// 2. For each rule, parse ConditionJson and match against SignupSessionAnswers
// 3. Matched rules add ScoreBonus to the candidate edition's total score
// 4. Sort editions by total score DESC
// 5. Return top edition with the highest-priority matching rule's ReasonEn/ReasonAr`,
  },

  // ─── API Endpoints ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.signupCustomization.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.signupCustomization.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/onboarding/questions",
        descriptionKey: "modules.signupCustomization.ep.questions",
        auth: "JWT",
        permission: "entitlements.manage",
      },
      {
        method: "POST",
        path: "/api/v1/onboarding/questions",
        descriptionKey: "modules.signupCustomization.ep.createQuestion",
        auth: "JWT",
        permission: "entitlements.manage",
      },
      {
        method: "PUT",
        path: "/api/v1/onboarding/questions/{id}",
        descriptionKey: "modules.signupCustomization.ep.updateQuestion",
        auth: "JWT",
        permission: "entitlements.manage",
      },
      {
        method: "DELETE",
        path: "/api/v1/onboarding/questions/{id}",
        descriptionKey: "modules.signupCustomization.ep.deleteQuestion",
        auth: "JWT",
        permission: "entitlements.manage",
      },
      {
        method: "GET",
        path: "/api/v1/onboarding/flow",
        descriptionKey: "modules.signupCustomization.ep.flow",
        auth: "Public",
        permission: "",
      },
      {
        method: "POST",
        path: "/api/v1/onboarding/answers",
        descriptionKey: "modules.signupCustomization.ep.submitAnswers",
        auth: "Public",
        permission: "",
      },
      {
        method: "GET",
        path: "/api/v1/onboarding/recommend",
        descriptionKey: "modules.signupCustomization.ep.recommend",
        auth: "Public",
        permission: "",
      },
      {
        method: "GET",
        path: "/api/v1/onboarding/rules",
        descriptionKey: "modules.signupCustomization.ep.rules",
        auth: "JWT",
        permission: "entitlements.manage",
      },
      {
        method: "POST",
        path: "/api/v1/onboarding/rules",
        descriptionKey: "modules.signupCustomization.ep.createRule",
        auth: "JWT",
        permission: "entitlements.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/signup-customization",
  titleKey: "modules.signupCustomization.title",
  descriptionKey: "modules.signupCustomization.description",
  category: "modules",
  order: 15,
  sections,
  relatedSlugs: [
    "modules/entitlements-overview",
    "modules/editions",
    "features/self-service-signup",
    "modules/platform-management",
  ],
  lastUpdated: "2026-06-29",
});
