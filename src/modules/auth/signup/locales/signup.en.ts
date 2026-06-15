export const en = {
  signup: {
    createWorkspace: "Create your workspace account",
    getStarted: "Get started with Scripe in under 2 minutes",

    // Stepper labels
    steps: {
      organization: "Organization Type",
      plan: "Plan",
      account: "Account",
      verify: "Verify",
      workspace: "Workspace",
      review: "Review",
      setup: "Setting Up",
      welcome: "Welcome",
    },
    stepper: {
      label: "Signup progress",
    },

    // Header — persistent top bar
    header: {
      haveAccount: "Already have an account?",
      signIn: "Sign in",
    },

    // Shell — chrome shared across every phase of the new wizard
    shell: {
      themeToLight: "Switch to light mode",
      themeToDark: "Switch to dark mode",
      preview: "Preview",
    },

    // Welcome screen (new Elevate redesign — phase F2)
    welcome: {
      // Fallbacks only — live copy comes from getWelcomeContent(); these render
      // if the content endpoint is unreachable so the screen never blanks out.
      headlineFallback: "Build your workspace",
      subcopyFallback:
        "One platform for your whole operation — set up in minutes, scale without limits.",
      ctaFallback: "Get started",
      trustedByFallback: "teams run on SCRIPE",
      // Section labels
      proofTitle: "Trusted by teams that take operations seriously",
      complianceTitle: "Audited and compliant",
      logosTitle: "Powering teams across industries",
      // States
      loadError: "We couldn't load the latest details, but you can still continue.",
      retry: "Try again",
      reassurance: "No credit card required to start.",
    },

    // Temporary placeholder for phases not yet built (removed after F1–F2)
    stub: {
      title: "Coming together",
      body: "This step of the new signup experience is being built.",
      phaseLabel: "Phase: {{phase}}",
      back: "Back",
    },

    // Step 1 — Plan
    plan: {
      title: "Choose your plan",
      subtitle: "Select the plan that fits your needs",
      monthly: "Monthly",
      annual: "Annual",
      mo: "mo",
      yr: "yr",
      free: "Free",
      custom: "Custom pricing",
      loadFailed: "Failed to load plans. Please try again.",
      startFree: "Start Free",
      choosePlan: "Choose {{plan}}",
      contactSales: "Talk to Sales",
      compareAll: "Compare all features",
      showComparison: "Compare all plans & features",
      hideComparison: "Hide comparison",
      savePercent: "Save {{percent}}%",
      billedAnnually: "billed annually",
      trialDays: "{{days}}-day free trial",
      freeTagline: "Get started for free",
      allCategories: "All",
      included: "Included",
      notIncluded: "Not included",
      categoryFilterLabel: "Filter by industry",
      billingCycleLabel: "Billing cycle",
      compareTitle: "Compare all plans",
      compareSubtitle: "See exactly what's included in each plan",
      noFeatures: "No features configured yet. Add features in the admin panel.",
      noFeaturesData: "No feature data available for this plan yet.",
      scrollToCompare: "Scroll to compare all features",
      comparePricesNote:
        "All prices shown in {{currency}}. Annual billing billed as a single payment.",
      feature: "Feature",
      featureSingle: "feature",
      featurePlural: "features",
      unlimited: "Unlimited",
      expandAll: "Expand all",
      collapseAll: "Collapse all",
      expandSection: "Expand section",
      collapseSection: "Collapse section",
      featuresCount: "{{count}} features in {{categoriesCount}} categories",
      featuresHeader: "Features",
      features: "Features",
      forever: "forever",
      currencyNote: "Prices shown in {{currency}}",
      currencyLockedNote: "Prices shown in {{currency}}, based on your location",
      currencyDetected: "Currency detected from your location",
      whyRecommended: "Why we recommend this",
      detected: "Detected",
      searchCurrency: "Search currency…",
      noCurrencyFound: "No currency found",
      selectCurrency: "Select currency",
      inheritanceText: "All {{prevEditionName}} features, plus:",
      recommended: "Recommended for you",
      recommendedForYou: "Recommended for you",
      fxConvertedTooltip: "Approximate price. Billed in USD at checkout.",
      approximateNote: "Approx.",
      legacyFeatures: {
        basic: "Basic features",
        singleAdmin: "1 admin user",
        communitySupport: "Community support",
      },
    },

    // Plans phase (Elevate redesign — F4). Distinct from the legacy `plan`
    // namespace; chrome only — edition names/feature labels come from the API.
    plans: {
      title: "Choose the plan that fits",
      subtitle: "Pricing is set for your region and billed in your local currency. Switch industries or billing any time.",
      industry: {
        prefix: "Plans for",
        ariaLabel: "Choose an industry",
      },
      billing: {
        label: "Billing cycle",
        monthly: "Monthly",
        annual: "Annual",
        save: "Save {{percent}}%",
      },
      region: {
        line: "Prices in {{currency}} · {{country}}",
        lineNoCountry: "Prices in {{currency}}",
      },
      badge: {
        recommended: "Recommended for you",
        mostPopular: "Most popular",
        bestValue: "Best value",
      },
      price: {
        free: "Free",
        forever: "forever",
        custom: "Custom",
        perMonth: "mo",
        perYear: "{{price}} / yr",
        approx: "Approx.",
        approxTooltip: "Approximate. Billed in USD at checkout.",
      },
      cta: {
        free: "Get started free",
        trial: "Start {{days}}-day trial",
        subscribe: "Subscribe — {{price}}/mo",
        contactSales: "Contact sales",
      },
      feature: {
        unlimited: "Unlimited",
      },
      compare: {
        show: "Compare all features",
        hide: "Hide comparison",
        featuresColumn: "Features",
      },
      error: {
        title: "We couldn't load the plans",
        body: "Something interrupted the connection. Please try again.",
        retry: "Try again",
      },
      empty: "No plans are available for this industry yet.",
    },

    // Step 2 — Account
    account: {
      // Elevate redesign (F5) — phase heading + adaptive CTA
      title: "Create your account",
      subtitle: "Just a few details to get your workspace started.",
      continueFree: "Create account",
      back: "Back",
      fullName: "Full name",
      fullNamePlaceholder: "John Doe",
      workEmail: "Work email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "Min. 12 characters",
      acceptTerms: "I agree to the",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      and: "and",
      continue: "Continue",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in",
      trustCue: "256-bit encrypted · No credit card required",
      passwordStrength: {
        veryWeak: "Very Weak",
        weak: "Weak",
        fair: "Fair",
        good: "Good",
        strong: "Strong",
      },
    },

    // Password strength (used by PasswordStrengthMeter)
    password: {
      veryWeak: "Very weak",
      weak: "Weak",
      fair: "Fair",
      strong: "Strong",
      veryStrong: "Very strong",
    },

    // Step 3 — Verification
    verification: {
      title: "Verify your email",
      sentCode: "We sent a 6-digit code to",
      enterCode: "Please enter the 6-digit code.",
      verifyAndContinue: "Verify & Continue",
      resendCode: "Resend code",
      resendIn: "Resend in {{seconds}}s",
      back: "Back",
      invalidCode: "Invalid or expired code. Please try again.",
      verificationFailed: "Verification failed. Please try again.",
      // Elevate redesign (F6)
      codeInputLabel: "Enter the 6-digit verification code",
      changeEmail: "Change email",
    },

    // Step 4 — Workspace
    workspace: {
      title: "Set up your workspace",
      subtitle: "Your team's home on Scripe",
      orgName: "Organization name",
      orgNamePlaceholder: "Acme Inc.",
      workspaceUrl: "Workspace URL",
      subdomainPlaceholder: "acme",
      domainSuffix: ".admin.scripe.org",
      createWorkspace: "Create workspace",
      subdomainTaken: "This subdomain is already taken.",
      subdomainReserved: "This subdomain is reserved.",
      subdomainInvalid: "Invalid format. Use lowercase letters, numbers, and hyphens.",
      subdomainAvailable: "{{subdomain}}.admin.scripe.org is available!",
      trySuggestion: 'Try "{{suggestion}}"?',
      adminUsername: "Admin username",
      adminUsernamePlaceholder: "admin",
      usernameHint: "Your final login username will be: ",
      back: "Back",
      // Elevate redesign (F7)
      continue: "Continue",
      subdomainAvailableShort: "This URL is available.",
      previewLabel: "Workspace URL preview: {{url}}",
    },

    // Step 6 — Provisioning
    provisioning: {
      creatingWorkspace: "Creating workspace",
      settingDefaults: "Setting up defaults",
      registeringAccount: "Registering your account",
      configuringPermissions: "Configuring permissions",
      almostReady: "Almost ready…",
      usuallyTakes: "This usually takes a few seconds",
    },

    // Step 7 — Complete
    complete: {
      welcomeTitle: "Welcome to Scripe! 🎉",
      workspaceReady: "Your workspace {{name}} is ready. Redirecting you to your dashboard…",
      inviteTeam: "Invite your team members",
      customizeBranding: "Customize your branding",
      exploreModules: "Explore modules & features",
      redirecting: "Redirecting…",
      goToWorkspace: "Go to my workspace",
    },

    // Common
    common: {
      back: "Back",
      optional: "optional",
      backLabel: "Go back to previous question",
      loading: "Loading...",
    },

    // Errors
    errors: {
      fullNameRequired: "Please enter your full name.",
      fullNameMin: "Please enter your full name.",
      fullNameMax: "Name must be 100 characters or fewer.",
      emailRequired: "Please enter your email address.",
      emailInvalid: "Please enter a valid email address.",
      passwordMinLength: "Password must be at least 12 characters.",
      passwordUppercase: "Add at least one uppercase letter.",
      passwordLowercase: "Add at least one lowercase letter.",
      passwordNumber: "Add at least one number.",
      termsRequired: "You must accept the terms of service.",
      workspaceNameRequired: "Please enter your workspace name.",
      workspaceNameMin: "Workspace name must be at least 2 characters.",
      workspaceNameMax: "Workspace name must be 100 characters or fewer.",
      subdomainMinLength: "Subdomain must be at least 3 characters.",
      subdomainMaxLength: "Subdomain must be 63 characters or fewer.",
      subdomainFormat: "Use lowercase letters, numbers, and hyphens.",
      subdomainUnavailable: "Please choose an available subdomain.",
      usernameMax: "Username must be 50 characters or fewer.",
      timezoneRequired: "Please select a timezone.",
      companyMax: "Company name must be 200 characters or fewer.",
      noteMax: "Note must be 1000 characters or fewer.",
      emailVerificationExpired: "Email verification expired. Please go back and verify again.",
      signupFailed: "Signup failed. Please try again.",
    },

    // Copyright
    copyright: "All rights reserved",

    // Step 0 — Category ("Organization")
    category: {
      title: "What type of organization are you?",
      subtitle: "We'll tailor the plans to fit.",
      allIndustries: "All Industries",
      continue: "Continue →",
      fromPrice: "from {{price}}/mo",
      freeAvailable: "Free plan available",
      notSure: "Not sure? Start with General",
      skipButton: "Skip — show me all plans",
    },

    // Step 0b — Discovery (conversational 3-question flow)
    discovery: {
      badge: "Smart Discovery · Finding your perfect plan",
      loadError: "Couldn't load questions. You can skip and go straight to plans.",
      // Typewriter headlines
      seePlans: "See your personalized plans",
      q1Title: "What kind of business are you?",
      q2Title: "How big is your team?",
      q3Title: "What matters most to you?",

      // Sub-headings
      q1Sub: "We'll tailor your plan recommendations to your industry.",
      q2Sub: "We'll match features and quotas to your team's scale.",
      q3Sub: "We'll pin the feature you care about most on your recommended plan.",

      // Skip actions
      skipQ: "Skip · I'll choose later",
      skipToPlans: "Skip · Show me the plans",
      skipAll: "Skip all questions · Take me straight to plans",
      q3Confirm: "Done · Show my plan →",
      q3MaxReached: "3 of 3 selected (maximum)",
      q3Count: "{{count}} of {{max}} selected",
      q3GroupLabel: "Select your top priorities (up to 3)",
      selected: "selected",
      limitReached: "limit reached",
      q3ConfirmLabel: "Confirm priorities and see recommended plan",
      skipToPlansLabel: "Skip priorities and go directly to plans",

      // Q2 — Team size labels
      teamSize: {
        solo: "Solo",
        soloSub: "Just me",
        small: "Small",
        smallSub: "2 – 10 people",
        medium: "Medium",
        mediumSub: "11 – 50 people",
        growing: "Growing",
        growingSub: "51 – 200 people",
        enterprise: "Enterprise",
        enterpriseSub: "200+ people",
      },

      // Q3 — Priority labels (general)
      priority: {
        analytics: "Analytics & Insights",
        automation: "Automation & Workflows",
        security: "Security & Compliance",
        collaboration: "Team Collaboration",
        integrations: "Integrations & APIs",
        support: "Customer Support",
        speed: "Speed & Performance",
        customization: "Customization",
        // ERP-specific
        multiTenant: "Multi-Tenant",
        compliance: "Compliance",
        apiAccess: "API Access",
        whiteLabel: "White-label",
        sso: "Single Sign-On (SSO)",
        // Healthcare-specific
        hipaa: "HIPAA Compliance",
        patientData: "Patient Data Security",
        audit: "Audit Trails",
        dedicatedSupport: "Dedicated Support",
      },

      // Recommendation hint (shown before Q3)
      hint: {
        free: "Free",
        pro: "Pro",
        ultra: "Ultra",
        enterprise: "Enterprise",
        message: "Based on your profile, we'll highlight our {{plan}} plan for you.",
      },

      // Async scorer status indicator
      scoring: "Finding your best match\u2026",

      // Navigation / state labels (Task 32)
      skip: "Skip",
      pickUpTo: "Pick up to {{max}}",
      next: "Next",
      back: "Back",
      loading: "Loading questions...",
      error: "Couldn't load questions",
      retry: "Try again",

      // ── Adaptive Discovery stage (Elevate redesign — F3) ──────────────────
      // Chrome copy only; question + option text arrives localized from the API.
      stage: {
        progressLabel: "Discovery progress",
        next: "Next",
        back: "Back",
        skipStep: "Skip this",
        skipAll: "Skip — show me the plans",
        skipToPlans: "Skip to plans",
        seePlans: "See my plan",
        topPriority: "Top",

        // Live profile preview (trailing column / inline on mobile)
        profileTitle: "Your profile",
        profileEmpty: "Answer a few questions and we'll shape a plan around how you work.",
        profileBuilding: "Here's what we have so far.",
        profileTease: "We'll use this to recommend the plan that fits you best.",

        // Error / empty recovery
        errorTitle: "We couldn't load the questions",
        errorBody:
          "Something interrupted the connection. Try again, or skip straight to the plans.",
        retry: "Try again",
      },
    },

    // Contact Sales
    contactSales: {
      title: "Talk to our sales team",
      subtitle: "Tell us about your team and we'll tailor a plan to fit.",
      interested: "Interested in:",
      company: "Company name",
      companyPlaceholder: "Acme Inc.",
      companyRequired: "Please enter your company name.",
      companySize: "Company size",
      noteLabel: "Anything you'd like to share?",
      notePlaceholder: "Timeline, specific requirements, integrations you need\u2026",
      cta: "Request a demo",
      successTitle: "We'll be in touch!",
      successSubtitle: "Our sales team will reach out within 1\u20132 business days.",
      fallback: "Or email us directly at {{email}}",
      backToPlans: "\u2190 Back to plans",
      phone: "Phone number",
      phonePlaceholder: "+1 555 000 0000",
      whatsNext: "What happens next",
      next1: "Our team reviews your requirements",
      next2: "You'll get a tailored demo invitation",
      next3: "Custom pricing crafted for your business",
      yourAnswers: "Your profile",
      people: "people",
    },

    // Step 5 — Review (replaces Payment)
    review: {
      // free branch — ZERO payment language
      freeTitle: "You're all set!",
      freeSubtitle: "Review your details and create your workspace.",
      createWorkspace: "Create your workspace",
      // trial branch — card collected on Stripe's secure page
      trialTitle: "Start your {{days}}-day free trial",
      trialSubtitle:
        "Add a card on the secure checkout page — you won't be charged during the trial.",
      trialStarts: "{{days}}-day free trial — starts when you complete checkout",
      thenPrice: "Then {{price}}/{{cycle}}",
      cancelAnytime: "Cancel anytime",
      reminder: "We'll remind you 3 days before any charge",
      startTrialCta: "Start free trial — continue to secure checkout",
      // checkout branch
      checkoutTitle: "Review your plan",
      checkoutSubtitle: "Please confirm your details before continuing to secure checkout.",
      billedTotal: "Billed today",
      checkoutCta: "Continue to secure checkout",
      // shared
      planLabel: "Plan",
      billingLabel: "Billing",
      workspaceLabel: "Workspace",
      accountLabel: "Account",
      perMonth: "month",
      perYear: "year",
      editPlan: "Edit plan",
      launchWorkspace: "Launch my workspace",
      goToCheckout: "Go to checkout",
      changePlan: "Change plan",
      promoHint: "Have a promo code? Apply it on the secure checkout page.",
      paymentPageNote: "The payment page is in English.",
      checkoutCanceled: "Checkout canceled — you can try again or change your plan.",
      dismiss: "Dismiss",
      // Elevate redesign (F8) — CTA copy per checkoutMode
      createWorkspaceCta: "Create workspace",
      startTrialShortCta: "Start trial",
      subscribeCta: "Subscribe — {{price}}",
    },

    // Finalize page (post-Stripe polling)
    finalize: {
      processing: "Setting up your workspace…",
      waiting: "Confirming your payment with our payment provider.",
      slow: "This usually completes within 15 minutes — we'll email your access link.",
      paymentConfirmed: "Payment confirmed!",
      opening: "Opening your workspace…",
      successTitle: "Your workspace is ready!",
      redirecting: "Taking you to your dashboard…",
      failed: "Signup didn't complete. Your card was not charged.",
      expired: "This link has expired.",
      startAgain: "Start a new signup — you were not charged",
      consumedTitle: "Signup already complete",
      consumedSubtitle: "Your workspace is ready — log in with your credentials.",
      changePlan: "Change plan",
      timeoutTitle: "Taking longer than expected",
      timeoutSubtitle:
        "We're still setting things up. We'll email you when your workspace is ready.",
    },

    // Billing cycle labels (used by ResumeSignupModal)
    billing: {
      monthly: "Monthly",
      yearly: "Yearly",
    },

    // Resume Modal (shown when returning to signup with a pending session)
    resume: {
      title: "Resume your signup",
      subtitle: "You have a pending signup session. Would you like to continue?",
      pendingPlan: "Pending plan: {{plan}}",
      pendingPlanLabel: "Pending plan",
      continue: "Continue signup",
      changePlan: "Choose a different plan",
      startFresh: "Start fresh",
    },
  },

  // ── Recommendation reasons ───────────────────────────────────────────────
  // Top-level namespace (sibling of `signup`): the backend emits bare
  // "recommendation.reason.*" keys from GET /auth/signup/recommendation, which
  // the plan card renders verbatim via t(key). Keep keys in sync with
  // GetSignupRecommendationQueryHandler.cs.
  recommendation: {
    reason: {
      scored: "Matched to your profile",
      catalog_empty: "A solid starting point — you can switch plans anytime",
      team: {
        solo: "Sized for a solo founder",
        small: "Fits a small team",
        medium: "Scales with a growing team",
        large: "Built for a large team",
        enterprise: "Ready for enterprise scale",
        unknown: "Flexible for any team size",
      },
      priority: {
        security: "Covers your security & compliance needs",
        scale: "Handles your scale & API needs",
        support: "Includes the support level you want",
      },
      vertical_match: "Tailored to your industry",
    },
  },
};
