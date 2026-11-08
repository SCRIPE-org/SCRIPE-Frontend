"use client";

/**
 * AccountBillingView
 *
 * Sovereign Slice 14 (/account/billing):
 * B2B Executive Scouting & Travel Expense Vault (with Submit Expense Claim form),
 * B2B2C Guardian/VIP Member Invoices, and Facility Booking Credit Ledger.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { useAccountBillingSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import {
  CreditCard,
  Receipt,
  Plus,
  Wallet,
  CheckCircle2,
  FileText,
} from "lucide-react";

export function AccountBillingView() {
  const { t } = useI18n();
  const { billing, submitExpenseClaim, isSubmittingExpense } =
    useAccountBillingSliceViewModel();

  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("SCOUTING_TRAVEL");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const expenses = billing?.expenses ?? [];
  const invoices = billing?.invoices ?? [];

  const handleSubmitExpense = async () => {
    const amountNum = Number(expenseAmount);
    if (!expenseTitle.trim() || !amountNum || amountNum <= 0) return;
    await submitExpenseClaim({
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: amountNum,
      currency: billing?.defaultCurrency || "USD",
    });
    setExpenseTitle("");
    setExpenseAmount("");
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.billing.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">
            {t("profile.billing.description")}
          </p>
        </div>

        {submittedNotice && (
          <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{t("profile.billing.expenseSubmittedNotice")}</span>
          </Badge>
        )}
      </div>

      {/* 1. Executive Spend Summary & Facility Credit Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-nx-line bg-nx-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-nx-ink-3">
            <span>{t("profile.billing.cardInstrument")}</span>
            <CreditCard className="h-4 w-4 text-nx-accent" />
          </div>
          <p className="text-sm font-bold font-mono text-nx-ink">
            {billing?.reimbursementIbanMasked || "••••"}
          </p>
        </Card>

        <Card className="border border-nx-line bg-nx-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-nx-ink-3">
            <span>{t("profile.billing.monthlySpendLabel")}</span>
            <Receipt className="h-4 w-4 text-nx-accent" />
          </div>
          <p className="text-sm font-bold font-mono text-nx-ink">
            ${billing?.pendingReimbursementTotal ?? 0} / ${billing?.settledReimbursementTotal ?? 0}
          </p>
        </Card>

        <Card className="border border-nx-line bg-nx-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-nx-ink-3">
            <span>{t("profile.billing.facilityCreditsLabel")}</span>
            <Wallet className="h-4 w-4 text-nx-accent" />
          </div>
          <p className="text-sm font-bold font-mono text-success">
            ${billing?.facilityBookingCreditsBalance ?? 0}
          </p>
        </Card>
      </div>

      {/* 2. B2B Executive Scouting & Travel Expense Vault */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.billing.expensesTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.billing.expensesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {expenses.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.billing.noExpenses")}</p>
          ) : (
            <div className="space-y-2.5">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-nx-ink block">{exp.title}</span>
                    <span className="text-[11px] font-mono text-nx-ink-3">
                      {exp.category} &bull;{" "}
                      {exp.incurredAtUtc ? new Date(exp.incurredAtUtc).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-nx-ink">
                      {exp.currency} {exp.amount}
                    </span>
                    <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/10">
                      {exp.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit New Expense Claim */}
          <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
            <Input
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              placeholder={t("profile.billing.categoryPlaceholder")}
              className="h-8 text-xs font-mono bg-nx-surface border-nx-line text-nx-ink"
            />
            <Input
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder={t("profile.billing.expenseTitlePlaceholder")}
              className="h-8 text-xs bg-nx-surface border-nx-line text-nx-ink"
            />
            <Input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder={t("profile.billing.amountPlaceholder")}
              className="h-8 text-xs font-mono bg-nx-surface border-nx-line text-nx-ink"
            />
            <Button
              type="button"
              size="sm"
              disabled={isSubmittingExpense}
              onClick={handleSubmitExpense}
              data-testid="submit-expense-claim-btn"
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("profile.billing.submitExpenseBtn")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. B2B2C Guardian / Member Invoices */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.billing.invoicesTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.billing.invoicesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.billing.noInvoices")}</p>
          ) : (
            <div className="space-y-2.5">
              {invoices.map((inv) => (
                <div
                  key={inv.invoiceNumber}
                  className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-nx-ink block">{inv.description}</span>
                    <span className="text-[11px] font-mono text-nx-ink-3">
                      {inv.invoiceNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-nx-ink">
                      {inv.currency} {inv.amount}
                    </span>
                    <Badge variant="outline" className="text-[10px] border-nx-line text-nx-ink-2">
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
