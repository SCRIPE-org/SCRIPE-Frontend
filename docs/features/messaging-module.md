# Messaging Module

> Email composer, message templates editor, and notification sender — all admin-facing.

---

## Overview

The messaging module is part of the **System** parent module and provides three sub-modules for admin communication: email composing, message template management, and in-app notification sending. Each follows the SOLID View/ViewModel pattern with clean data layer separation.

---

## Sub-Module Structure

```
modules/system/messaging/
├── email-composer/                    # Compose & send emails
│   ├── index.ts
│   └── src/
│       ├── data/
│       │   ├── repositories/EmailRepository.ts
│       │   └── services/EmailService.ts
│       ├── domain/
│       │   ├── entities/Email.ts
│       │   └── interfaces/IEmailRepository.ts
│       └── presentation/
│           ├── components/
│           │   ├── AttachmentUploader.tsx
│           │   ├── ComposeSection.tsx
│           │   ├── EmailPreviewDialog.tsx
│           │   ├── HistorySection.tsx
│           │   ├── SchedulePicker.tsx
│           │   └── TemplatePicker.tsx
│           ├── viewmodels/
│           │   └── useEmailComposerViewModel.ts
│           └── views/
│               └── EmailComposerView.tsx
│
├── message-templates/                 # CRUD for templates
│   ├── index.ts
│   └── src/
│       ├── data/
│       │   ├── mappers/MessageTemplateMapper.ts
│       │   ├── models/MessageTemplateModel.ts
│       │   ├── repositories/MessageTemplateRepository.ts
│       │   └── services/MessageTemplateService.ts
│       ├── domain/
│       │   ├── entities/MessageTemplate.ts
│       │   └── interfaces/IMessageTemplateRepository.ts
│       └── presentation/
│           ├── components/
│           │   ├── DesignVariablesPanel.tsx
│           │   ├── PlaceholderSchemaBuilder.tsx
│           │   ├── PreviewDialog.tsx
│           │   └── TemplateLivePreview.tsx
│           ├── viewmodels/
│           │   ├── useMessageTemplatesViewModel.ts
│           │   └── useTemplateFormViewModel.ts
│           └── views/
│               ├── MessageTemplatesView.tsx
│               └── TemplateFormView.tsx
│
└── notification-sender/               # Send in-app notifications
    ├── index.ts
    └── src/
        ├── data/
        │   ├── repositories/NotificationSenderRepository.ts
        │   └── services/NotificationSenderService.ts
        ├── domain/
        │   ├── entities/Notification.ts
        │   └── interfaces/INotificationSenderRepository.ts
        └── presentation/
            ├── viewmodels/
            │   └── useNotificationSenderViewModel.ts
            └── views/
                └── NotificationSenderView.tsx
```

---

## Email Composer (`/messaging/email-composer`)

### Features

| Feature          | Implementation                                         |
| ---------------- | ------------------------------------------------------ |
| Compose          | Rich text editor with subject, body, cc/bcc, signature |
| Template picker  | Select from database templates, auto-fill placeholders |
| Attachments      | Upload files via `IFileService` (max 10 MB each)       |
| Image embedding  | Upload inline images via `IFileService` (max 5 MB)     |
| Recipient search | Autocomplete search for admins/users                   |
| Schedule         | Date/time picker for delayed delivery                  |
| Preview          | Preview rendered email before sending                  |
| History          | Paginated sent email log with status tracking          |

### ViewModels

**`useEmailComposerViewModel`** — Orchestrator handling:

- Compose state (subject, body, recipients, attachments)
- Template selection and placeholder rendering
- Image/attachment uploads (via API → `IFileService`)
- Scheduling
- Send/send-bulk mutations
- Sent email history with filters

### Components

| Component            | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `ComposeSection`     | Main compose form (recipients, subject, body editor) |
| `TemplatePicker`     | Modal to browse/select database templates            |
| `AttachmentUploader` | Drag-and-drop file attachment with progress          |
| `SchedulePicker`     | Date/time picker for scheduled delivery              |
| `EmailPreviewDialog` | Rendered HTML preview before sending                 |
| `HistorySection`     | Paginated table of sent emails with status           |

### Data Flow

```
EmailComposerView → useEmailComposerViewModel
    → IEmailRepository (interface)
        → EmailRepository (implementation)
            → EmailService (API calls)
                → POST /api/v1/emails/send
                → POST /api/v1/emails/send-bulk
                → GET  /api/v1/emails/sent
                → GET  /api/v1/emails/search-recipients
                → POST /api/v1/images/upload-image
                → POST /api/v1/images/upload-attachment
```

---

## Message Templates (`/messaging/templates`)

### Features

| Feature            | Implementation                                                 |
| ------------------ | -------------------------------------------------------------- |
| List               | `GenericCrudView` with channel/language/category filters       |
| Create/Edit        | Full-page form with rich text editor                           |
| Live Preview       | Real-time template preview via `ITemplateRenderer.RenderRaw()` |
| Placeholder Schema | Visual schema builder for defining placeholder types           |
| Design Variables   | Panel for configuring colors, fonts, logo, footer              |
| Versioning         | Auto-increment version on update                               |

### ViewModels

**`useMessageTemplatesViewModel`** — List page orchestrator:

- Paginated template list with filters
- CRUD mutations (create, update, soft delete)
- Column definitions

**`useTemplateFormViewModel`** — Form page orchestrator:

- Form state (react-hook-form + zod validation)
- Live preview rendering via preview API
- Placeholder schema management
- Design variables management

### Components

| Component                  | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `PreviewDialog`            | Full-width preview of rendered template    |
| `TemplateLivePreview`      | Side-by-side editor + live preview         |
| `PlaceholderSchemaBuilder` | Visual builder for placeholder definitions |
| `DesignVariablesPanel`     | Color, font, logo, footer settings         |

### Data Flow

```
MessageTemplatesView → useMessageTemplatesViewModel
    → IMessageTemplateRepository
        → MessageTemplateRepository
            → MessageTemplateService
                → GET  /api/v1/message-templates
                → POST /api/v1/message-templates
                → PUT  /api/v1/message-templates/{id}
                → DELETE /api/v1/message-templates/{id}

TemplateFormView → useTemplateFormViewModel
    → IMessageTemplateRepository
        → MessageTemplateRepository
            → MessageTemplateService
                → GET  /api/v1/message-templates/{id}
                → POST /api/v1/message-templates/preview
```

---

## Notification Sender (`/messaging/notifications`)

### Features

| Feature        | Implementation                            |
| -------------- | ----------------------------------------- |
| Send           | Compose and send in-app notifications     |
| Target search  | Autocomplete for admins + roles           |
| Type selection | Info, Success, Warning, Error             |
| Category       | General, Security, System, Activity       |
| Action URL     | Optional deep-link for notification click |

### ViewModels

**`useNotificationSenderViewModel`** — Orchestrator:

- Compose state (title, body, type, category, target)
- Target search (admins + roles)
- Send mutation

### Data Flow

```
NotificationSenderView → useNotificationSenderViewModel
    → INotificationSenderRepository
        → NotificationSenderRepository
            → NotificationSenderService
                → GET  /api/v1/notifications/search-targets
                → POST /api/v1/notifications/send
```

---

## Route Registration

```
src/app/(modules)/messaging/
├── email-composer/page.tsx     → EmailComposerView
├── templates/page.tsx          → MessageTemplatesView
├── templates/[id]/page.tsx     → TemplateFormView
└── notifications/page.tsx      → NotificationSenderView
```

---

## Backend API Summary

| Area              | Endpoint                               | Method         | Description              |
| ----------------- | -------------------------------------- | -------------- | ------------------------ |
| **Email**         | `/api/v1/emails/send`                  | POST           | Send single email        |
| **Email**         | `/api/v1/emails/send-bulk`             | POST           | Send bulk emails         |
| **Email**         | `/api/v1/emails/sent`                  | GET            | Sent email history       |
| **Email**         | `/api/v1/emails/search-recipients`     | GET            | Recipient autocomplete   |
| **Email**         | `/api/v1/emails/statistics`            | GET            | Email statistics         |
| **Email**         | `/api/v1/emails/{id}/resend`           | POST           | Resend email             |
| **Upload**        | `/api/v1/images/upload-image`          | POST           | Upload email image       |
| **Upload**        | `/api/v1/images/upload-attachment`     | POST           | Upload attachment        |
| **Templates**     | `/api/v1/message-templates`            | GET/POST       | List/Create templates    |
| **Templates**     | `/api/v1/message-templates/{id}`       | GET/PUT/DELETE | Get/Update/Delete        |
| **Templates**     | `/api/v1/message-templates/preview`    | POST           | Preview with sample data |
| **Notifications** | `/api/v1/notifications/send`           | POST           | Send notification        |
| **Notifications** | `/api/v1/notifications/search-targets` | GET            | Search targets           |

---

## Related Docs

- [Backend — Messaging & Communication Center](../../SCRIPE-Backend/docs/messaging-communication-center.md)
- [Backend — Notification Center](../../SCRIPE-Backend/docs/features/notification-center.md)
- [Backend — File Management](../../SCRIPE-Backend/docs/features/file-management.md)
