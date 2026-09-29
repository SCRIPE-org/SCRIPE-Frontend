"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReceiptText, Banknote } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

export function VenueMoneyNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    {
      href: "/venue/money/receivables",
      label: t("money.receivables.title") || "Receivables",
      icon: ReceiptText,
      active: pathname === "/venue/money/receivables",
    },
    {
      href: "/venue/money/payments",
      label: t("money.payments.title") || "Manual Payments",
      icon: Banknote,
      active: pathname === "/venue/money/payments",
    },
  ];

  return (
    <nav
      aria-label="Money operations"
      className="flex items-center gap-1 border-b border-nx-line pb-3 mb-6"
    >
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={link.active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-nx-sm text-xs font-medium transition-colors",
              link.active
                ? "bg-nx-surface text-nx-ink shadow-[inset_0_0_0_1px_var(--nx-line-hi)]"
                : "text-nx-ink-2 hover:text-nx-ink hover:bg-nx-surface/50"
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
