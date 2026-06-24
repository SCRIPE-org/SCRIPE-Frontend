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

/**
 * Constant definition representing welcome header.
 */
export const WelcomeHeader = memo(function WelcomeHeader({ greeting, displayName }: Props) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        {greeting}
        {displayName ? `, ${displayName}` : ""} 👋
      </h1>
      <p className="text-muted-foreground">
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
