import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  //  Pipeline Architecture
  { type: "heading", level: 2, titleKey: "features.emailSystem.pipelineTitle", id: "pipeline" },
  { type: "paragraph", contentKey: "features.emailSystem.pipelineIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Email Pipeline",
    nodes: [
      { id: "manual", label: "SendManualEmailCommand", type: "default" },
      { id: "bulk", label: "SendBulkEmailCommand", type: "default" },
      { id: "system", label: "System Events (OTP, Reset)", type: "default" },
      { id: "ieq", label: "IEmailQueue interface", type: "primary" },
      { id: "mq", label: "EmailQueue (In-memory Channel)", type: "info" },
      { id: "hq", label: "HangfireEmailQueue (Persistent)", type: "info" },
      { id: "eqw", label: "EmailQueueWorker (BackgroundService)", type: "success" },
      { id: "esw", label: "EmailSendingWorker (Hangfire)", type: "success" },
      { id: "smtp", label: "SmtpEmailSender (Production)", type: "warning" },
      { id: "dev", label: "DevEmailSender (Console log)", type: "warning" },
      { id: "log", label: "SentEmailLog (Audit)", type: "danger" },
    ],
    connections: [
      { from: "manual", to: "ieq" },
      { from: "bulk", to: "ieq" },
      { from: "system", to: "ieq" },
      { from: "ieq", to: "mq", style: "dashed" },
      { from: "ieq", to: "hq", style: "dashed" },
      { from: "mq", to: "eqw" },
      { from: "hq", to: "esw" },
      { from: "eqw", to: "smtp" },
      { from: "esw", to: "smtp" },
      { from: "smtp", to: "log" },
      { from: "dev", to: "log" },
    ],
  },

  //  Controller Endpoints 
  { type: "heading", level: 2, titleKey: "features.emailSystem.endpointsTitle", id: "endpoints" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/emails/send",
        descriptionKey: "Send manual email  queued",
        auth: "JWT",
        permission: "emails.create",
      },
      {
        method: "POST",
        path: "/emails/send-bulk",
        descriptionKey: "Send to multiple recipients",
        auth: "JWT",
        permission: "emails.create",
      },
      {
        method: "GET",
        path: "/emails/search-recipients",
        descriptionKey: "Autocomplete for admin/user selection",
        auth: "JWT",
        permission: "emails.view",
      },
      {
        method: "GET",
        path: "/emails/sent",
        descriptionKey: "Paginated sent history (filter: status, date range, search)",
        auth: "JWT",
        permission: "emails.view",
      },
      {
        method: "GET",
        path: "/emails/{id}",
        descriptionKey: "Single sent email detail",
        auth: "JWT",
        permission: "emails.view",
      },
      {
        method: "GET",
        path: "/emails/statistics",
        descriptionKey: "Totals by status + time-based counts",
        auth: "JWT",
        permission: "emails.view",
      },
      {
        method: "POST",
        path: "/emails/{id}/resend",
        descriptionKey: "Re-queue a failed/sent email",
        auth: "JWT",
        permission: "emails.create",
      },
      {
        method: "DELETE",
        path: "/emails/{id}",
        descriptionKey: "Cancel pending email (soft-delete)",
        auth: "JWT",
        permission: "emails.create",
      },
    ],
  },

  //  Queue Implementations
  { type: "heading", level: 2, titleKey: "features.emailSystem.queueTitle", id: "queue" },
  { type: "heading", level: 3, titleKey: "features.emailSystem.inMemoryTitle", id: "in-memory" },
  {
    type: "code",
    language: "csharp",
    filename: "EmailQueue.cs",
    code: `// Uses System.Threading.Channels for backpressure
private readonly Channel<EmailMessage> _channel = Channel.CreateUnbounded<EmailMessage>();

// Enqueue: non-blocking write
await _channel.Writer.WriteAsync(message);

// Dequeue: blocking read (in BackgroundService loop)
var message = await _channel.Reader.ReadAsync(stoppingToken);`,
  },
  { type: "heading", level: 3, titleKey: "features.emailSystem.hangfireTitle", id: "hangfire" },
  {
    type: "code",
    language: "csharp",
    filename: "HangfireEmailQueue.cs",
    code: `// Enqueues as a Hangfire background job  survives app restarts
BackgroundJob.Enqueue<IEmailSender>(sender => sender.SendEmailAsync(to, subject, body, ...));`,
  },

  //  Sender Implementations 
  { type: "heading", level: 2, titleKey: "features.emailSystem.sendersTitle", id: "senders" },
  {
    type: "table",
    headers: ["Sender", "Environment", "Behavior"],
    rows: [
      ["SmtpEmailSender", "Production", "Full SMTP delivery via EmailSettings"],
      ["DevEmailSender", "Development", "Logs email content to console (no actual send)"],
      ["NullEmailSender", "Testing", "No-op, always succeeds"],
    ],
  },
  { type: "info", variant: "note", contentKey: "features.emailSystem.senderNote" },

  //  Background Worker Pattern
  { type: "heading", level: 2, titleKey: "features.emailSystem.workerTitle", id: "worker" },
  {
    type: "code",
    language: "csharp",
    filename: "EmailQueueWorker.cs",
    code: `// EmailQueueWorker  infinite loop processing
protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    while (!stoppingToken.IsCancellationRequested)
    {
        var message = await _emailQueue.DequeueAsync(stoppingToken);
        if (message is null) continue;

        // Scoped service resolution (IEmailSender may be transient)
        using var scope = _serviceProvider.CreateScope();
        var emailSender = scope.ServiceProvider.GetRequiredService<IEmailSender>();

        // Template vs raw email
        if (!string.IsNullOrEmpty(message.TemplateName))
            await emailSender.SendTemplatedEmailAsync(message.To, message.TemplateName, message.TemplateData);
        else
            await emailSender.SendEmailAsync(message.To, message.Subject, message.Body);
    }
}`,
  },

  //  Error Handling 
  { type: "heading", level: 2, titleKey: "features.emailSystem.errorTitle", id: "errors" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "On SMTP failure: logged with error, worker continues processing next email",
      "After failure: 5-second delay before next dequeue (prevents tight error loops)",
      "ResendEmail endpoint allows re-queuing failed emails",
      "CancelEmail soft-deletes pending emails before they're processed",
    ],
  },

  //  HTML Sanitizer 
  { type: "heading", level: 2, titleKey: "features.emailSystem.sanitizerTitle", id: "sanitizer" },
  { type: "paragraph", contentKey: "features.emailSystem.sanitizerIntro" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "Removes <script> tags",
      "Removes javascript: URLs in href attributes",
      "Strips event handlers (onclick, onerror, etc.)",
    ],
  },
];

registerPage({
  slug: "features/email-system",
  titleKey: "features.emailSystem.title",
  descriptionKey: "features.emailSystem.description",
  category: "features",
  order: 6,
  sections,
  relatedSlugs: ["features/notification-system", "features/message-templates"],
  lastUpdated: "2026-02-20",
});
