"use client";

interface BookingStepperHeaderProps {
  isContextual: boolean;
  step: number;
  t: (key: string, values?: Record<string, string | number>) => string;
}

/**
 * Horizontal step progress indicator for the Click-to-Book workflow.
 */
export function BookingStepperHeader({ isContextual, step, t }: BookingStepperHeaderProps) {
  return (
    <div
      data-testid="click-to-book-stepper"
      className="flex items-center justify-between rounded-nx-lg border border-nx-line bg-nx-raised/40 px-3.5 py-2.5"
    >
      {!isContextual && (
        <>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                step >= 0
                  ? "bg-nx-accent-fill text-nx-on-fill ring-1 ring-nx-accent-fill"
                  : "bg-nx-raised text-nx-ink-3"
              }`}
            >
              1
            </span>
            <span
              className={`text-xs font-semibold ${step >= 0 ? "font-bold text-nx-ink" : "text-nx-ink-3"}`}
            >
              {t("operationsCalendar.clickToBook.stepper.courtAndTime")}
            </span>
          </div>
          <div
            className={`mx-2 h-px flex-1 sm:mx-3 ${step >= 1 ? "bg-nx-accent-fill" : "bg-nx-line"}`}
          />
        </>
      )}

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
            step >= 1
              ? "bg-nx-accent-fill text-nx-on-fill ring-1 ring-nx-accent-fill"
              : "bg-nx-raised text-nx-ink-3"
          }`}
        >
          {isContextual ? 1 : 2}
        </span>
        <span
          className={`text-xs font-semibold ${step >= 1 ? "font-bold text-nx-ink" : "text-nx-ink-3"}`}
        >
          {t("operationsCalendar.clickToBook.stepper.customer")}
        </span>
      </div>

      <div
        className={`mx-2 h-px flex-1 sm:mx-3 ${step >= 2 ? "bg-nx-accent-fill" : "bg-nx-line"}`}
      />

      <div data-testid="click-to-book-step-3" className="flex shrink-0 items-center gap-2">
        <span
          className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
            step >= 2
              ? "bg-nx-accent-fill text-nx-on-fill ring-1 ring-nx-accent-fill"
              : "bg-nx-raised text-nx-ink-3"
          }`}
        >
          {isContextual ? 2 : 3}
        </span>
        <span
          className={`text-xs font-semibold ${step >= 2 ? "font-bold text-nx-ink" : "text-nx-ink-3"}`}
        >
          {t("operationsCalendar.clickToBook.stepper.confirm")}
        </span>
      </div>
    </div>
  );
}
