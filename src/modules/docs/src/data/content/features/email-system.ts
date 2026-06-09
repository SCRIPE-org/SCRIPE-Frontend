import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/email-system",
  titleKey: "features.emailSystem.title",
  category: "features",
  order: 6,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.emailSystem.section_0_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.emailSystem.section_1_title",
    "id": "sec_1"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    manual[\"SendManualEmailCommand\"]\n    bulk[\"SendBulkEmailCommand\"]\n    system[\"System Events (OTP, Reset)\"]\n    ieq([\"IEmailQueue interface\"])\n    mq([\"EmailQueue (In-memory Channel)\"])\n    hq([\"HangfireEmailQueue (Persistent)\"])\n    eqw([\"EmailQueueWorker (BackgroundService)\"])\n    esw([\"EmailSendingWorker (Hangfire)\"])\n    smtp{{\"SmtpEmailSender (Production)\"}}\n    dev{{\"DevEmailSender (Console log)\"}}\n    log[\"SentEmailLog (Audit)\"]\n    manual --> ieq\n    bulk --> ieq\n    system --> ieq\n    ieq -.-> mq\n    ieq -.-> hq\n    mq --> eqw\n    hq --> esw\n    eqw --> smtp\n    esw --> smtp\n    smtp --> log\n    dev --> log",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.emailSystem.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "table",
    "headers": [
      "features.emailSystem.section_4_hdr_0",
      "features.emailSystem.section_4_hdr_1",
      "features.emailSystem.section_4_hdr_2",
      "features.emailSystem.section_4_hdr_3",
      "features.emailSystem.section_4_hdr_4"
    ],
    "rows": [
      [
        "features.emailSystem.section_4_cell_0_0",
        "features.emailSystem.section_4_cell_0_1",
        "features.emailSystem.section_4_cell_0_2",
        "features.emailSystem.section_4_cell_0_3",
        "features.emailSystem.section_4_cell_0_4"
      ],
      [
        "features.emailSystem.section_4_cell_1_0",
        "features.emailSystem.section_4_cell_1_1",
        "features.emailSystem.section_4_cell_1_2",
        "features.emailSystem.section_4_cell_1_3",
        "features.emailSystem.section_4_cell_1_4"
      ],
      [
        "features.emailSystem.section_4_cell_2_0",
        "features.emailSystem.section_4_cell_2_1",
        "features.emailSystem.section_4_cell_2_2",
        "features.emailSystem.section_4_cell_2_3",
        "features.emailSystem.section_4_cell_2_4"
      ],
      [
        "features.emailSystem.section_4_cell_3_0",
        "features.emailSystem.section_4_cell_3_1",
        "features.emailSystem.section_4_cell_3_2",
        "features.emailSystem.section_4_cell_3_3",
        "features.emailSystem.section_4_cell_3_4"
      ],
      [
        "features.emailSystem.section_4_cell_4_0",
        "features.emailSystem.section_4_cell_4_1",
        "features.emailSystem.section_4_cell_4_2",
        "features.emailSystem.section_4_cell_4_3",
        "features.emailSystem.section_4_cell_4_4"
      ],
      [
        "features.emailSystem.section_4_cell_5_0",
        "features.emailSystem.section_4_cell_5_1",
        "features.emailSystem.section_4_cell_5_2",
        "features.emailSystem.section_4_cell_5_3",
        "features.emailSystem.section_4_cell_5_4"
      ],
      [
        "features.emailSystem.section_4_cell_6_0",
        "features.emailSystem.section_4_cell_6_1",
        "features.emailSystem.section_4_cell_6_2",
        "features.emailSystem.section_4_cell_6_3",
        "features.emailSystem.section_4_cell_6_4"
      ],
      [
        "features.emailSystem.section_4_cell_7_0",
        "features.emailSystem.section_4_cell_7_1",
        "features.emailSystem.section_4_cell_7_2",
        "features.emailSystem.section_4_cell_7_3",
        "features.emailSystem.section_4_cell_7_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.emailSystem.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.emailSystem.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "features.emailSystem.section_7_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Uses System.Threading.Channels for backpressure\nprivate readonly Channel<EmailMessage> _channel = Channel.CreateUnbounded<EmailMessage>();\n\n// Enqueue: non-blocking write\nawait _channel.Writer.WriteAsync(message);\n\n// Dequeue: blocking read (in BackgroundService loop)\nvar message = await _channel.Reader.ReadAsync(stoppingToken);",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.emailSystem.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "features.emailSystem.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Enqueues as a Hangfire background job  survives app restarts\nBackgroundJob.Enqueue<IEmailSender>(sender => sender.SendEmailAsync(to, subject, body, ...));",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.emailSystem.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "table",
    "headers": [
      "features.emailSystem.section_13_hdr_0",
      "features.emailSystem.section_13_hdr_1",
      "features.emailSystem.section_13_hdr_2"
    ],
    "rows": [
      [
        "features.emailSystem.section_13_cell_0_0",
        "features.emailSystem.section_13_cell_0_1",
        "features.emailSystem.section_13_cell_0_2"
      ],
      [
        "features.emailSystem.section_13_cell_1_0",
        "features.emailSystem.section_13_cell_1_1",
        "features.emailSystem.section_13_cell_1_2"
      ],
      [
        "features.emailSystem.section_13_cell_2_0",
        "features.emailSystem.section_13_cell_2_1",
        "features.emailSystem.section_13_cell_2_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.emailSystem.section_14_title",
    "contentKey": "features.emailSystem.section_14_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.emailSystem.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "features.emailSystem.section_16_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// EmailQueueWorker  infinite loop processing\nprotected override async Task ExecuteAsync(CancellationToken stoppingToken)\n{\n    while (!stoppingToken.IsCancellationRequested)\n    {\n        var message = await _emailQueue.DequeueAsync(stoppingToken);\n        if (message is null) continue;\n\n        // Scoped service resolution (IEmailSender may be transient)\n        using var scope = _serviceProvider.CreateScope();\n        var emailSender = scope.ServiceProvider.GetRequiredService<IEmailSender>();\n\n        // Template vs raw email\n        if (!string.IsNullOrEmpty(message.TemplateName))\n            await emailSender.SendTemplatedEmailAsync(message.To, message.TemplateName, message.TemplateData);\n        else\n            await emailSender.SendEmailAsync(message.To, message.Subject, message.Body);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.emailSystem.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.emailSystem.section_19_item_0",
      "features.emailSystem.section_19_item_1",
      "features.emailSystem.section_19_item_2",
      "features.emailSystem.section_19_item_3"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.emailSystem.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.emailSystem.section_21_item_0",
      "features.emailSystem.section_21_item_1",
      "features.emailSystem.section_21_item_2"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.emailSystem.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.emailSystem.section_23_item_0",
      "features.emailSystem.section_23_item_1"
    ]
  }
],
  relatedSlugs: [
  "features/notification-system",
  "features/message-templates"
],
  lastUpdated: "2026-06-09",
});
