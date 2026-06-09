import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "frontend/form-validation",
  titleKey: "frontend.formValidation.title",
  category: "frontend",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "frontend.formValidation.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.formValidation.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.formValidation.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    frontend([\"Frontend Validation\"])\n    zod([\"Zod Schemas\"])\n    %% zod: Type-safe schema definitions\n    rhf([\"React Hook Form\"])\n    %% rhf: Form state + zodResolver\n    backend{{\"Backend Validation\"}}\n    fluent[\"FluentValidation\"]\n    %% fluent: Server-side validators\n    pipeline[\"ValidationBehavior (AstraFlow mediator)\"]\n    frontend --> zod\n    zod -->|\"zodResolver\"| rhf\n    rhf -->|\"API call\"| backend\n    backend --> fluent\n    fluent --> pipeline",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.formValidation.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.formValidation.section_5_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "import { z } from 'zod';\n\n// Domain entity schema (in domain/entities/)\nexport const AdminSchema = z.object({\n  id: z.string().uuid(),\n  email: z.string().email(),\n  firstName: z.string().min(2).max(50),\n  lastName: z.string().min(2).max(50),\n  phoneNumber: z.string().optional(),\n  role: z.object({\n    id: z.string().uuid(),\n    name: z.string(),\n  }),\n  isActive: z.boolean(),\n  isBlocked: z.boolean(),\n  createdAt: z.string().datetime(),\n  lastLoginAt: z.string().datetime().optional(),\n});\n\nexport type Admin = z.infer<typeof AdminSchema>;\n\n// Form-specific schemas (in presentation/viewmodels/)\nexport const CreateAdminSchema = z.object({\n  email: z.string().email(\"Invalid email address\"),\n  firstName: z.string().min(2, \"Must be at least 2 characters\"),\n  lastName: z.string().min(2, \"Must be at least 2 characters\"),\n  password: z.string()\n    .min(8, \"Must be at least 8 characters\")\n    .regex(/[A-Z]/, \"Must contain an uppercase letter\")\n    .regex(/[0-9]/, \"Must contain a number\")\n    .regex(/[^A-Za-z0-9]/, \"Must contain a special character\"),\n  confirmPassword: z.string(),\n  roleId: z.string().uuid(\"Please select a role\"),\n  phoneNumber: z.string().optional(),\n}).refine(data => data.password === data.confirmPassword, {\n  message: \"Passwords don't match\",\n  path: [\"confirmPassword\"],\n});\n\nexport type CreateAdminInput = z.infer<typeof CreateAdminSchema>;",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.formValidation.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.formValidation.section_8_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "import { useForm } from 'react-hook-form';\nimport { zodResolver } from '@hookform/resolvers/zod';\n\nexport function useCreateAdminViewModel() {\n  const form = useForm<CreateAdminInput>({\n    resolver: zodResolver(CreateAdminSchema),\n    defaultValues: {\n      email: '',\n      firstName: '',\n      lastName: '',\n      password: '',\n      confirmPassword: '',\n      roleId: '',\n    },\n    mode: 'onBlur',  // Validate on blur for better UX\n  });\n\n  const createMutation = useMutation({\n    mutationFn: (data: CreateAdminInput) => adminRepo.create(data),\n    onSuccess: () => {\n      form.reset();\n      toast.success(t('admins.createSuccess'));\n    },\n    onError: (error: ApiError) => {\n      // Map server validation errors to form fields\n      if (error.type === 'ValidationError') {\n        error.errors.forEach(e => {\n          form.setError(e.propertyName as any, {\n            type: 'server',\n            message: e.errorMessage,\n          });\n        });\n      }\n    },\n  });\n\n  return {\n    form,\n    onSubmit: form.handleSubmit(data => createMutation.mutate(data)),\n    isSubmitting: createMutation.isPending,\n  };\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.formValidation.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.formValidation.section_11_content"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "frontend.formValidation.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.formValidation.section_13_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class CreateAdminCommandValidator\n    : AbstractValidator<CreateAdminCommand>\n{\n    public CreateAdminCommandValidator(IAdminRepository repo)\n    {\n        RuleFor(x => x.Email)\n            .NotEmpty().WithMessage(\"Email is required\")\n            .EmailAddress().WithMessage(\"Invalid email format\")\n            .MustAsync(async (email, ct) =>\n                !await repo.ExistsAsync(e => e.Email == email))\n            .WithMessage(\"Email already registered\");\n\n        RuleFor(x => x.Password)\n            .NotEmpty().MinimumLength(8)\n            .Matches(\"[A-Z]\").WithMessage(\"Uppercase required\")\n            .Matches(\"[0-9]\").WithMessage(\"Digit required\")\n            .Matches(\"[^a-zA-Z0-9]\").WithMessage(\"Special char required\");\n\n        RuleFor(x => x.FirstName)\n            .NotEmpty().Length(2, 50);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "frontend.formValidation.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.formValidation.section_16_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// Backend returns:\n{\n  \"type\": \"ValidationError\",\n  \"errors\": [\n    { \"propertyName\": \"Email\", \"errorMessage\": \"Email already registered\" },\n    { \"propertyName\": \"Password\", \"errorMessage\": \"Digit required\" }\n  ]\n}\n\n// Frontend maps to form:\nerror.errors.forEach(e => {\n  const field = e.propertyName.charAt(0).toLowerCase()\n              + e.propertyName.slice(1); // PascalCase → camelCase\n  form.setError(field, {\n    type: 'server',\n    message: e.errorMessage,\n  });\n});",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.formValidation.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "table",
    "headers": [
      "frontend.formValidation.section_19_hdr_0",
      "frontend.formValidation.section_19_hdr_1",
      "frontend.formValidation.section_19_hdr_2"
    ],
    "rows": [
      [
        "frontend.formValidation.section_19_cell_0_0",
        "frontend.formValidation.section_19_cell_0_1",
        "frontend.formValidation.section_19_cell_0_2"
      ],
      [
        "frontend.formValidation.section_19_cell_1_0",
        "frontend.formValidation.section_19_cell_1_1",
        "frontend.formValidation.section_19_cell_1_2"
      ],
      [
        "frontend.formValidation.section_19_cell_2_0",
        "frontend.formValidation.section_19_cell_2_1",
        "frontend.formValidation.section_19_cell_2_2"
      ],
      [
        "frontend.formValidation.section_19_cell_3_0",
        "frontend.formValidation.section_19_cell_3_1",
        "frontend.formValidation.section_19_cell_3_2"
      ],
      [
        "frontend.formValidation.section_19_cell_4_0",
        "frontend.formValidation.section_19_cell_4_1",
        "frontend.formValidation.section_19_cell_4_2"
      ],
      [
        "frontend.formValidation.section_19_cell_5_0",
        "frontend.formValidation.section_19_cell_5_1",
        "frontend.formValidation.section_19_cell_5_2"
      ],
      [
        "frontend.formValidation.section_19_cell_6_0",
        "frontend.formValidation.section_19_cell_6_1",
        "frontend.formValidation.section_19_cell_6_2"
      ],
      [
        "frontend.formValidation.section_19_cell_7_0",
        "frontend.formValidation.section_19_cell_7_1",
        "frontend.formValidation.section_19_cell_7_2"
      ],
      [
        "frontend.formValidation.section_19_cell_8_0",
        "frontend.formValidation.section_19_cell_8_1",
        "frontend.formValidation.section_19_cell_8_2"
      ],
      [
        "frontend.formValidation.section_19_cell_9_0",
        "frontend.formValidation.section_19_cell_9_1",
        "frontend.formValidation.section_19_cell_9_2"
      ],
      [
        "frontend.formValidation.section_19_cell_10_0",
        "frontend.formValidation.section_19_cell_10_1",
        "frontend.formValidation.section_19_cell_10_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.formValidation.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "frontend.formValidation.section_21_item_0",
      "frontend.formValidation.section_21_item_1",
      "frontend.formValidation.section_21_item_2"
    ]
  }
],
  relatedSlugs: [
  "frontend/crud-system",
  "architecture/cqrs-pipeline",
  "frontend/state-management"
],
  lastUpdated: "2026-06-09",
});
