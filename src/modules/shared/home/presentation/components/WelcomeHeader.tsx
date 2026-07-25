"use client";

/**
 * Welcome Header
 *
 * Displays a time-of-day greeting with the user's name.
 */
import { memo } from "react";

interface Props {
  greeting: string;
  displayName: string;
}

export const WelcomeHeader = memo(function WelcomeHeader({ greeting, displayName }: Props) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-nx-ink md:text-3xl">
        {greeting}
        {displayName ? `, ${displayName}` : ""} <span aria-hidden="true">👋</span>
      </h1>
      <p className="text-nx-ink-2">
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
});
