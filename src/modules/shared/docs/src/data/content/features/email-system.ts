// FILE-EXCEPTION: static documentation content
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ── Pipeline Architecture Section ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.emailSystem.pipelineTitle",
    id: "pipeline",
  },
  { type: "paragraph", contentKey: "features.emailSystem.pipelineIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Email Dispatch & Execution Flow",
    nodes: [
      { id: "trigger", label: "Email Event Trigger", type: "default" },
      { id: "queue_facade", label: "IEmailQueue Interface", type: "primary" },
      { id: "in_memory_channel", label: "EmailQueue (Channels)", type: "info" },
      { id: "hangfire_queue", label: "HangfireEmailQueue (Db)", type: "info" },
      { id: "worker_in_memory", label: "EmailQueueWorker (BgService)", type: "success" },
      { id: "worker_hangfire", label: "Hangfire Job Processor", type: "success" },
      { id: "sender_resolve", label: "IEmailSender.ForRole(role)", type: "warning" },
      { id: "smtp_sender", label: "SmtpEmailSender (SMTP Client)", type: "danger" },
      { id: "console_sender", label: "DevEmailSender (Console)", type: "warning" },
      { id: "null_sender", label: "NullEmailSender (Test stub)", type: "default" },
      { id: "db_log", label: "SentEmailLog (Audit Log)", type: "info" },
    ],
    connections: [
      { from: "trigger", to: "queue_facade", label: "Invoke QueueEmailAsync" },
      { from: "queue_facade", to: "in_memory_channel", label: "InMemory provider active" },
      { from: "queue_facade", to: "hangfire_queue", label: "Hangfire provider active" },
      { from: "in_memory_channel", to: "worker_in_memory", label: "Read from channel" },
      { from: "hangfire_queue", to: "worker_hangfire", label: "Execute BackgroundJob" },
      { from: "worker_in_memory", to: "sender_resolve", label: "Resolve sender" },
      { from: "worker_hangfire", to: "sender_resolve", label: "Resolve sender" },
      { from: "sender_resolve", to: "smtp_sender", label: "Production context" },
      { from: "sender_resolve", to: "console_sender", label: "Development context" },
      { from: "sender_resolve", to: "null_sender", label: "Testing context" },
      { from: "smtp_sender", to: "db_log", label: "Save delivery status" },
      { from: "console_sender", to: "db_log", label: "Log mock send" },
    ],
  },

  // ── Controller Endpoints ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.emailSystem.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/emails/send",
        descriptionKey: "Send manual transactional email (queues message)",
        auth: "JWT",
        permission: "emails.create",
      },
      {
        method: "POST",
        path: "/api/v1/emails/send-bulk",
        descriptionKey: "Send transactional email to multiple recipients",
        auth: "JWT",
        permission: "emails.create",
      },
      {
        method: "GET",
        path: "/api/v1/emails/search-recipients",
        descriptionKey: "Search matching recipients for administration panel selection",
        auth: "JWT",
        permission: "emails.view",
      },
      {
        method: "GET",
        path: "/api/v1/emails/sent",
        descriptionKey: "Paginated log history of sent emails (filters by status, date range)",
        auth: "JWT",
        permission: "emails.view",
      },
      {
        method: "GET",
        path: "/api/v1/emails/{id}",
        descriptionKey: "Retrieve single sent email audit log details",
        auth: "JWT",
        permission: "emails.view",
      },
      {
        method: "GET",
        path: "/api/v1/emails/statistics",
        descriptionKey: "Retrieve overall totals and status counts of sent emails",
        auth: "JWT",
        permission: "emails.view",
      },
      {
        method: "POST",
        path: "/api/v1/emails/{id}/resend",
        descriptionKey: "Re-enqueue a failed or completed email for redelivery",
        auth: "JWT",
        permission: "emails.create",
      },
      {
        method: "DELETE",
        path: "/api/v1/emails/{id}",
        descriptionKey: "Cancel/remove a pending email from the queue (soft-delete)",
        auth: "JWT",
        permission: "emails.create",
      },
    ],
  },

  // ── Queue Implementations ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.emailSystem.queueTitle",
    id: "queue",
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.emailSystem.inMemoryTitle",
    id: "in-memory",
  },
  {
    type: "code",
    language: "csharp",
    filename: "EmailQueue.cs",
    code: `// Bounded System.Threading.Channels for backpressure control (max 1000 items)
public sealed class EmailQueue : IEmailQueue
{
    private readonly Channel<EmailMessage> _queue;

    public EmailQueue()
    {
        var options = new BoundedChannelOptions(1000) 
        { 
            FullMode = BoundedChannelFullMode.Wait 
        };
        _queue = Channel.CreateBounded<EmailMessage>(options);
    }

    public async ValueTask QueueEmailAsync(EmailMessage message, CancellationToken ct = default)
    {
        await _queue.Writer.WriteAsync(message, ct);
    }

    public async ValueTask<EmailMessage?> DequeueAsync(CancellationToken ct)
    {
        try
        {
            return await _queue.Reader.ReadAsync(ct);
        }
        catch (OperationCanceledException)
        {
            return null;
        }
    }
}`,
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.emailSystem.hangfireTitle",
    id: "hangfire",
  },
  {
    type: "code",
    language: "csharp",
    filename: "HangfireEmailQueue.cs",
    code: `// Hangfire-backed email queue: Jobs are serialized and persisted to DB
public sealed class HangfireEmailQueue : IEmailQueue
{
    public ValueTask QueueEmailAsync(EmailMessage message, CancellationToken ct = default)
    {
        if (!string.IsNullOrEmpty(message.TemplateName) && message.TemplateData is not null)
        {
            var placeholders = new Dictionary<string, string>(message.TemplateData);
            BackgroundJob.Enqueue<EmailJobProcessor>(
                processor => processor.SendTemplatedEmailAsync(
                    message.To, message.TemplateName, placeholders, message.SenderRole
                )
            );
        }
        else
        {
            BackgroundJob.Enqueue<EmailJobProcessor>(
                processor => processor.SendEmailAsync(
                    message.To, message.Subject, message.Body, message.SenderRole
                )
            );
        }
        return ValueTask.CompletedTask;
    }

    public ValueTask<EmailMessage?> DequeueAsync(CancellationToken ct)
    {
        throw new NotSupportedException("Hangfire processes jobs automatically via its own workers");
    }
}`,
  },

  // ── Pluggable Senders ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.emailSystem.sendersTitle",
    id: "senders",
  },
  {
    type: "table",
    headers: ["Sender Strategy", "Active Environment", "Execution Mode", "Behavior"],
    rows: [
      [
        "SmtpEmailSender",
        "Production / Staging",
        "Active SMTP Client",
        "Sends fully styled HTML emails via System.Net.Mail using verified credentials and brand layout rules",
      ],
      [
        "DevEmailSender",
        "Development",
        "Logger Console Stub",
        "Intercepts dispatch requests and logs styled HTML to the console log, creating mock SentEmailLog entries",
      ],
      [
        "NullEmailSender",
        "Testing",
        "No-Op Stub",
        "Accepts all emails and returns task completion instantly, skipping any logging or output operations",
      ],
    ],
  },
  { type: "info", variant: "note", contentKey: "features.emailSystem.senderNote" },

  // ── Background Worker ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.emailSystem.workerTitle",
    id: "worker",
  },
  {
    type: "code",
    language: "csharp",
    filename: "EmailQueueWorker.cs",
    code: `// Hosted background worker loop processing System.Threading.Channels messages
public sealed class EmailQueueWorker : BackgroundService
{
    private readonly IEmailQueue _emailQueue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailQueueWorker> _logger;

    public EmailQueueWorker(
        IEmailQueue emailQueue,
        IServiceProvider serviceProvider,
        ILogger<EmailQueueWorker> logger)
    {
        _emailQueue = emailQueue;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email queue worker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var message = await _emailQueue.DequeueAsync(stoppingToken);
                if (message is null) continue;

                await ProcessEmailAsync(message, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing email from queue");
                // 5-second backoff prevents tight loop CPU lockups on connection failures
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }
}`,
  },

  // ── Error Handling and Sanitization ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.emailSystem.errorTitle",
    id: "errors",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "SMTP Connection Failures: Exceptions are caught, logged, and worker thread sleeps for 5 seconds before processing subsequent queue elements.",
      "Hangfire Retry Policies: Automatic retry filters retry failed background deliveries (3 attempts) with a custom exponential delay (10s, 60s, 300s).",
      "Deferred Email Processing: Scheduled emails are kept pending in the database (SentEmailLog) and processed in batches of 50 by EmailProcessingJob.",
      "Gmail/Yahoo Bulk Compliances: Every SMTP email header contains List-Unsubscribe, List-Unsubscribe-Post='List-Unsubscribe=One-Click', Return-Path, and X-Mailer values to avoid spam classification.",
      "Email Sender Roles: Specific roles (Auth, Billing, Sales, Support) resolve automatically to Gmail/Google Workspace group aliases to delegating sends dynamically.",
    ],
  },

  // ── HTML Sanitizer ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.emailSystem.sanitizerTitle",
    id: "sanitizer",
  },
  { type: "paragraph", contentKey: "features.emailSystem.sanitizerIntro" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "Strips script elements (<script>) and nested code structures entirely from the body.",
      "Blocks all javascript: scheme references in link anchors (href) and image src attributes.",
      "Removes inline Javascript event handler attributes (such as onload, onclick, onerror, and onmouseover) from HTML nodes.",
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
  lastUpdated: "2026-06-28",
});
