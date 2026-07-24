/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Semantic status colours. Before these existed, `destructive` was the
        // only tokenised status, so every view invented its own green/amber —
        // the root cause of ~340 raw palette colours across the module views.
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          strong: "hsl(var(--warning-strong))",
        },
        "warning-strong": {
          DEFAULT: "hsl(var(--warning-strong))",
          foreground: "hsl(var(--warning-strong-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        // ── EDGE surface tokens ────────────────────────────────────────────
        // These are defined in globals.css under :root[data-layout="scripe"]
        // and resolve per theme there. They were CSS-only, which meant no
        // component could reach them from a class — that, more than anything
        // else, is why the shadcn primitive layer never moved onto the design
        // system: there was no token to migrate *to*.
        //
        // No hsl() wrapper: unlike the shadcn tokens above, these hold complete
        // colour values (oklch(...) or #hex), not bare HSL triplets. Wrapping
        // them would produce hsl(oklch(...)) and the declaration would be
        // dropped silently.
        //
        // Outside the scripe shell these variables are undefined, so the
        // fallbacks keep any stray usage rendering something sane rather than
        // transparent.
        edge: {
          void: "var(--edge-void, hsl(var(--background)))",
          sub: "var(--edge-sub, hsl(var(--muted)))",
          slab: "var(--edge-slab, hsl(var(--card)))",
          "slab-hi": "var(--edge-slab-hi, hsl(var(--accent)))",
          line: "var(--edge-line, hsl(var(--border)))",
          "line-hi": "var(--edge-line-hi, hsl(var(--border)))",
          ink: "var(--edge-ink, hsl(var(--foreground)))",
          "ink-2": "var(--edge-ink-2, hsl(var(--muted-foreground)))",
          "ink-3": "var(--edge-ink-3, hsl(var(--muted-foreground)))",
          accent: "var(--edge-accent, hsl(var(--primary)))",
          "accent-fill": "var(--edge-accent-fill, hsl(var(--primary)))",
          "accent-wash": "var(--edge-accent-wash, hsl(var(--primary) / 0.1))",
          emit: "var(--edge-emit, hsl(var(--ring)))",
          "on-fill": "var(--edge-on-fill, hsl(var(--primary-foreground)))",
        },
        // The modal scrim. Previously every overlay hardcoded bg-black/70 and
        // then layered a backdrop-blur on top, which EDGE law 1 bans outright.
        scrim: "var(--scrim)",
        // ── NEXUS shell tokens ─────────────────────────────────────────────
        // Defined in globals.css under :root[data-layout="nexus"] (plus the
        // pre-stamp :root:not([data-layout]) arm) and resolved per theme
        // there. Same contract as `edge` above: these hold COMPLETE colour
        // values (#hex / rgba() / oklch()), so no hsl() wrapper — wrapping
        // would silently drop the declaration. Fallbacks keep stray usage
        // under other layouts rendering something sane rather than
        // transparent. Contrast floors live in the globals.css block header.
        nx: {
          ground: "var(--nx-ground, hsl(var(--background)))",
          surface: "var(--nx-surface, hsl(var(--card)))",
          raised: "var(--nx-raised, hsl(var(--muted)))",
          "raised-2": "var(--nx-raised-2, hsl(var(--accent)))",
          line: "var(--nx-line, hsl(var(--border)))",
          "line-hi": "var(--nx-line-hi, hsl(var(--border)))",
          ink: "var(--nx-ink, hsl(var(--foreground)))",
          "ink-2": "var(--nx-ink-2, hsl(var(--muted-foreground)))",
          "ink-3": "var(--nx-ink-3, hsl(var(--muted-foreground)))",
          accent: "var(--nx-accent, hsl(var(--primary)))",
          "accent-fill": "var(--nx-accent-fill, hsl(var(--primary)))",
          "accent-wash": "var(--nx-accent-wash, hsl(var(--primary) / 0.1))",
          "on-fill": "var(--nx-on-fill, hsl(var(--primary-foreground)))",
          secondary: "var(--nx-secondary, hsl(var(--info)))",
          // Wave A extensions — defined globally in globals.css since the
          // token re-scope, so the fallbacks are belt-and-braces only.
          popover: "var(--nx-popover, hsl(var(--popover)))",
          hover: "var(--nx-hover, hsl(var(--accent)))",
          scrim: "var(--nx-scrim, var(--scrim))",
          // Status aliases of the global measured tokens — nexus never
          // re-derives status colours.
          danger: "var(--nx-danger, hsl(var(--destructive)))",
          warning: "var(--nx-warning, hsl(var(--warning)))",
          info: "var(--nx-info, hsl(var(--info)))",
          success: "var(--nx-success, hsl(var(--success)))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        ws: {
          accent: "var(--ws-accent)",
          "accent-light": "var(--ws-accent-light)",
          "accent-muted": "var(--ws-accent-muted)",
          "accent-fg": "var(--ws-accent-fg)",
          "rail-bg": "var(--ws-rail-bg)",
          "rail-hover": "var(--ws-rail-hover)",
        },
      },
      transitionDuration: {
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
        // Nexus motion scale — micro 140ms, standard 200ms, panel 300ms.
        // Exit runs at ~2/3 of the enter duration (pair with ease-nx-exit).
        "nx-micro": "var(--nx-t-micro, 140ms)",
        "nx-standard": "var(--nx-t-standard, 200ms)",
        "nx-panel": "var(--nx-t-panel, 300ms)",
      },
      transitionTimingFunction: {
        "smooth-out": "cubic-bezier(0.32, 0.72, 0, 1)",
        "nx-enter": "var(--nx-ease-enter, cubic-bezier(0.23, 1, 0.32, 1))",
        "nx-exit": "var(--nx-ease-exit, cubic-bezier(0.3, 0, 0.8, 0.15))",
      },
      boxShadow: {
        // The nexus signature glow — at most ONE element per screen wears it.
        "nx-glow": "var(--nx-glow, 0 0 0 0 transparent)",
        // Depth ladder + the lit-edge focus ring (Wave A).
        "nx-sm": "var(--nx-shadow-sm, 0 1px 2px rgb(0 0 0 / 0.2))",
        "nx-popover": "var(--nx-shadow-popover, 0 8px 24px -8px rgb(0 0 0 / 0.4))",
        "nx-modal": "var(--nx-shadow-modal, 0 24px 64px -16px rgb(0 0 0 / 0.5))",
        "nx-bar-top": "var(--nx-shadow-bar-top, 0 -8px 24px -8px rgb(0 0 0 / 0.4))",
        "nx-focus": "var(--nx-focus, 0 0 0 3px hsl(var(--ring) / 0.25))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // The nx radius ladder — primitives reach for these, never --radius.
        "nx-sm": "var(--nx-radius-sm, 6px)",
        "nx-control": "var(--nx-radius-control, 8px)",
        "nx-md": "var(--nx-radius-md, 10px)",
        "nx-lg": "var(--nx-radius-lg, 14px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Fake input caret (OTP slots and the like) — opacity only.
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        // One dot of the 3-dot loader — transform+opacity only. Stagger the
        // three dots with animation-delay in the markup.
        "nx-dot": {
          "0%, 80%, 100%": { opacity: "0.25", transform: "translateY(0)" },
          "40%": { opacity: "1", transform: "translateY(-25%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Consumers must pair these with a motion-reduce: path
        // (e.g. motion-reduce:animate-none) — no animation ships without one.
        "caret-blink": "caret-blink 1.2s ease-out infinite",
        "nx-dot": "nx-dot 1s ease-in-out infinite",
      },
      // One semantic stacking order for the whole app, low → high.
      //
      // This existed only as `modal/overlay/blur`, so everything else picked a
      // number by hand and the order came out wrong in ways nobody could see
      // from a single file: TooltipContent was z-50 and DialogContent z-1000, so
      // a tooltip inside a dialog rendered *behind* it; ToastViewport was z-100,
      // so a toast fired while a modal was open — the save-inside-a-dialog case,
      // i.e. the most common one — was completely hidden.
      //
      // Reach for these names, never a raw z-[...]. A literal number in a
      // component is a decision made without seeing the other layers.
      zIndex: {
        base: "0",
        raised: "10",
        header: "100",
        sticky: "200",
        dropdown: "900",
        // Popovers open from inside dropdowns occasionally (filter builders),
        // never the other way round — so popover sits one step above.
        popover: "950",
        blur: "998",
        overlay: "999",
        modal: "1000",
        toast: "1100",
        tooltip: "1200",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
