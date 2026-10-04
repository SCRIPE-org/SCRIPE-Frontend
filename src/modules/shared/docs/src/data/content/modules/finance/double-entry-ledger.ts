import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.finance.ledger.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.finance.ledger.infoTitle",
    contentKey: "modules.finance.ledger.infoContent",
  },

  // ─── Chart of Accounts & General Ledger ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.ledger.coaTitle",
    id: "chart-of-accounts",
  },
  { type: "paragraph", contentKey: "modules.finance.ledger.coaDesc" },

  // ─── Double-Entry Invariance & Ledger Rules ───────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.ledger.invarianceTitle",
    id: "double-entry-invariance",
  },
  { type: "paragraph", contentKey: "modules.finance.ledger.invarianceDesc" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/Finance/Finance.Domain/Entities/JournalEntry.cs",
    code: `public sealed class JournalEntry : TenantAggregateRoot
{
    private readonly List<JournalLine> _lines = new();
    public IReadOnlyCollection<JournalLine> Lines => _lines.AsReadOnly();
    public DateTimeOffset PostedAtUtc { get; private set; }
    public string TransactionReference { get; private set; } = string.Empty;

    public Result ValidateBalancing()
    {
        var sumDebits = _lines.Where(l => l.EntryType == EntryType.Debit).Sum(l => l.Amount);
        var sumCredits = _lines.Where(l => l.EntryType == EntryType.Credit).Sum(l => l.Amount);

        if (sumDebits != sumCredits)
            return Result.Failure($"Ledger out of balance: Debits={sumDebits}, Credits={sumCredits}");

        return Result.Success();
    }
}`,
  },

  // ─── Immutable Audit Trails & Reconciliation ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.finance.ledger.auditTitle",
    id: "audit-reconciliation",
  },
  { type: "paragraph", contentKey: "modules.finance.ledger.auditDesc" },
];

registerPage({
  slug: "modules/finance/double-entry-ledger",
  titleKey: "modules.finance.ledger.title",
  descriptionKey: "modules.finance.ledger.description",
  category: "module-finance",
  order: 2,
  sections,
  relatedSlugs: [
    "modules/finance-overview",
    "modules/finance/invoices-payments",
    "modules/finance/multi-party-settlements",
  ],
  lastUpdated: "2026-10-03",
});
