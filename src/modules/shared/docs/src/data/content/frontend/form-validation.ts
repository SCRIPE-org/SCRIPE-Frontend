// FILE-EXCEPTION: static documentation content
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "frontend.formValidation.intro" },

  // ─── Validation Architecture ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.formValidation.architectureTitle",
    id: "architecture",
  },
  {
    type: "flowchart",
    title: "Validation Architecture (Frontend + Backend)",
    direction: "vertical",
    nodes: [
      { id: "frontend", label: "Frontend Validation", type: "primary" },
      {
        id: "zod",
        label: "Zod Schemas",
        type: "info",
        description: "Type-safe schema definitions",
      },
      {
        id: "rhf",
        label: "React Hook Form",
        type: "success",
        description: "Form state + zodResolver",
      },
      { id: "backend", label: "Backend Validation", type: "warning" },
      {
        id: "fluent",
        label: "FluentValidation",
        type: "danger",
        description: "Server-side validators",
      },
      { id: "pipeline", label: "ValidationBehavior (AstraFlow mediator)", type: "danger" },
    ],
    connections: [
      { from: "frontend", to: "zod" },
      { from: "zod", to: "rhf", label: "zodResolver" },
      { from: "rhf", to: "backend", label: "API call" },
      { from: "backend", to: "fluent" },
      { from: "fluent", to: "pipeline" },
    ],
  },

  // ─── Zod Schemas ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.formValidation.zodTitle",
    id: "zod-schemas",
  },
  {
    type: "code",
    language: "typescript",
    filename: "Domain Entity Schema — Admin",
    code: `import { z } from 'zod';

// Domain entity schema (in domain/entities/)
/**
 * Exported constant defining parameters and fields for admin schema configurations.
 */
export const AdminSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phoneNumber: z.string().optional(),
  role: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  isActive: z.boolean(),
  isBlocked: z.boolean(),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional(),
});

/**
 * Exported type defining parameters and fields for admin configurations.
 */
export type Admin = z.infer<typeof AdminSchema>;

// Form-specific schemas (in presentation/viewmodels/)
/**
 * Exported constant defining parameters and fields for create admin schema configurations.
 */
export const CreateAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "Must be at least 2 characters"),
  lastName: z.string().min(2, "Must be at least 2 characters"),
  password: z.string()
    .min(8, "Must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  confirmPassword: z.string(),
  roleId: z.string().uuid("Please select a role"),
  phoneNumber: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Exported type defining parameters and fields for create admin input configurations.
 */
export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;`,
  },
  {
    type: "heading",
    level: 3,
    titleKey: "frontend.formValidation.zodUtilsTitle",
    id: "zod-schema-builders",
  },
  { type: "paragraph", contentKey: "frontend.formValidation.zodUtilsIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "zod-form-utils.ts & zod-utils.ts — Shared Validation Helpers",
    code: `// 1. Shared Zod builders for react-hook-form inputs
export const signupSchema = z.object({
  email: emailField(),
  password: strongPassword(),
  workspace: requiredStr({ min: 3, max: 100, label: "Workspace Name" }),
  cron: cronField(),
});

// 2. Safe API parsing to prevent UI crashes on API contract drift
export function toEntity(dto: UserDto): User {
  const result = safeParseApiResponse(UserSchema, dto, "UserDto mapping warning");
  
  // Degrades gracefully by returning fallback entity even if parsing fails validation
  return new User({
    id: result.id,
    email: result.email ?? "",
    firstName: result.firstName ?? "Unnamed",
    isActive: result.isActive ?? false,
  });
}`,
  },

  // ─── React Hook Form Integration ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.formValidation.rhfTitle",
    id: "react-hook-form",
  },
  {
    type: "code",
    language: "typescript",
    filename: "Form ViewModel with zodResolver",
    code: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * React hook/ViewModel orchestrating state and data flows for create admin view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useCreateAdminViewModel() {
  const form = useForm<CreateAdminInput>({
    resolver: zodResolver(CreateAdminSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      roleId: '',
    },
    mode: 'onBlur',  // Validate on blur for better UX
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAdminInput) => adminRepo.create(data),
    onSuccess: () => {
      form.reset();
      toast.success(t('admins.createSuccess'));
    },
    onError: (error: ApiError) => {
      // Map server validation errors to form fields
      if (error.type === 'ValidationError') {
        error.errors.forEach(e => {
          form.setError(e.propertyName as any, {
            type: 'server',
            message: e.errorMessage,
          });
        });
      }
    },
  });

  return {
    form,
    onSubmit: form.handleSubmit(data => createMutation.mutate(data)),
    isSubmitting: createMutation.isPending,
  };
}`,
    highlightLines: [5, 6, 27, 28, 29, 30, 31, 32],
  },

  // ─── Server Error Mapping ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.formValidation.serverErrorTitle",
    id: "server-errors",
  },
  { type: "paragraph", contentKey: "frontend.formValidation.serverErrorIntro" },
  {
    type: "tabs",
    tabs: [
      {
        label: "Backend Validator",
        language: "csharp",
        filename: "CreateAdminValidator.cs — FluentValidation",
        code: `public class CreateAdminCommandValidator
    : AbstractValidator<CreateAdminCommand>
{
    public CreateAdminCommandValidator(IAdminRepository repo)
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MustAsync(async (email, ct) =>
                !await repo.ExistsAsync(e => e.Email == email))
            .WithMessage("Email already registered");

        RuleFor(x => x.Password)
            .NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Uppercase required")
            .Matches("[0-9]").WithMessage("Digit required")
            .Matches("[^a-zA-Z0-9]").WithMessage("Special char required");

        RuleFor(x => x.FirstName)
            .NotEmpty().Length(2, 50);
    }
}`,
      },
      {
        label: "Frontend Error Mapping",
        language: "typescript",
        filename: "Error Response → form.setError()",
        code: `// Backend returns:
{
  "type": "ValidationError",
  "errors": [
    { "propertyName": "Email", "errorMessage": "Email already registered" },
    { "propertyName": "Password", "errorMessage": "Digit required" }
  ]
}

// Frontend maps to form:
error.errors.forEach(e => {
  const field = e.propertyName.charAt(0).toLowerCase()
              + e.propertyName.slice(1); // PascalCase → camelCase
  form.setError(field, {
    type: 'server',
    message: e.errorMessage,
  });
});`,
      },
    ],
  },

  // ─── Validation Rules Reference ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.formValidation.rulesTitle",
    id: "rules-reference",
  },
  {
    type: "table",
    headers: ["Rule", "Zod (Frontend)", "FluentValidation (Backend)"],
    rows: [
      ["Required", "z.string().min(1)", ".NotEmpty()"],
      ["Email", "z.string().email()", ".EmailAddress()"],
      ["Min length", "z.string().min(n)", ".MinimumLength(n)"],
      ["Max length", "z.string().max(n)", ".MaximumLength(n)"],
      ["Regex", "z.string().regex(r)", ".Matches(r)"],
      ["UUID", "z.string().uuid()", "Custom validator"],
      ["Number range", "z.number().min(n).max(m)", ".InclusiveBetween(n, m)"],
      ["Enum", "z.enum([...])", ".IsInEnum()"],
      ["Custom", "z.refine(fn)", ".Must(fn) / .MustAsync(fn)"],
      ["Cross-field", "z.refine() on parent", ".Must() with context"],
      ["Unique (async)", "Custom hook", ".MustAsync() with repo query"],
    ],
  },
];

registerPage({
  slug: "frontend/form-validation",
  titleKey: "frontend.formValidation.title",
  descriptionKey: "frontend.formValidation.description",
  category: "frontend",
  order: 5,
  sections,
  relatedSlugs: ["frontend/crud-system", "architecture/cqrs-pipeline", "frontend/state-management"],
  lastUpdated: "2026-02-20",
});
