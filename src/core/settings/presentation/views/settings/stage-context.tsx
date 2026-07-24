"use client";

/**
 * The Stage aim — how a control tells the live preview what to show.
 *
 * Two signals, one channel:
 *
 *   aimAt(subject)          a row says "the thing I govern is a table"
 *   peek(subject, patch)    an option says "…and here is how it looks as `striped`"
 *
 * `patch` is an UNCOMMITTED slice of Settings. The Stage renders it by wrapping
 * its subtree in a nested SettingsContext whose value is
 * `{ ...committedSettings, ...patch }`. Every primitive in the system already
 * reads that context (Button reads buttonStyle, GenericTable reads tableStyle,
 * GenericForm reads formStyle, Logo reads logoType…), so a peek needs no
 * per-component wiring at all — and it can never write to storage, because the
 * patch lives in this component's state and nowhere else.
 *
 * Releasing (pointer leaves, focus moves out) drops straight back to the
 * group's default subject with no patch, so the Stage always shows something.
 */

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Settings } from "@core/settings";
import type { StageSubject } from "./settings-map";

export interface StageAim {
  subject: StageSubject;
  /** Uncommitted values the Stage renders with, or null for "as committed". */
  patch: Partial<Settings> | null;
}

interface StageApi extends StageAim {
  aimAt: (subject: StageSubject) => void;
  peek: (subject: StageSubject, patch: Partial<Settings>) => void;
  release: () => void;
}

const StageContext = createContext<StageApi | null>(null);

const NOOP_STAGE: StageApi = {
  subject: "surface",
  patch: null,
  aimAt: () => {},
  peek: () => {},
  release: () => {},
};

/**
 * Read the Stage aim. Controls rendered outside a StageHost (Storybook, tests)
 * fall back to a no-op rather than throwing — a settings control must never
 * depend on a preview being mounted to work.
 */
export function useStage(): StageApi {
  return useContext(StageContext) ?? NOOP_STAGE;
}

interface StageHostProps {
  /** What the Stage shows when nothing is hovered or focused. */
  defaultSubject: StageSubject;
  children: React.ReactNode;
}

/**
 * Owns the transient aim. Mount this with `key={groupId}` so switching groups
 * resets the aim to that group's default without an effect.
 */
export function StageHost({ defaultSubject, children }: StageHostProps) {
  const [transient, setTransient] = useState<StageAim | null>(null);

  const aimAt = useCallback((subject: StageSubject) => {
    setTransient({ subject, patch: null });
  }, []);

  const peek = useCallback((subject: StageSubject, patch: Partial<Settings>) => {
    setTransient({ subject, patch });
  }, []);

  const release = useCallback(() => setTransient(null), []);

  const value = useMemo<StageApi>(
    () => ({
      subject: transient?.subject ?? defaultSubject,
      patch: transient?.patch ?? null,
      aimAt,
      peek,
      release,
    }),
    [transient, defaultSubject, aimAt, peek, release]
  );

  return <StageContext.Provider value={value}>{children}</StageContext.Provider>;
}
