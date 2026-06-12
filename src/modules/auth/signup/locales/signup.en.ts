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

    // Step 1 — Plan
    plan: {
      title: "Choose your plan",
      subtitle: "Select the plan that fits your needs",
      monthly: "Monthly",
      annual: "Annual",
      mo: "mo",
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
      compareTitle: "Compare all plans",
      compareSubtitle: "See exactly what's included in each plan",
      noFeatures: "No features configured yet. Add features in the admin panel.",
      comparePricesNote: "All prices shown in USD. Annual billing billed as a single payment.",
      feature: "Feature",
      featureSingle: "feature",
      featurePlural: "features",
      unlimited: "Unlimited",
      expandAll: "Expand all",
      collapseAll: "Collapse all",
      featuresCount: "{{count}} features in {{categoriesCount}} categories",
      featuresHeader: "Features",
      forever: "forever",
      currencyNote: "Prices shown in {{currency}}",
      inheritanceText: "All {{prevEditionName}} features, plus:",
      features: {
        basic: "Basic features",
        singleAdmin: "1 admin user",
        communitySupport: "Community support",
      },
    },

    // Step 2 — Account
    account: {
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
    },

    // Common
    common: {
      back: "← Back",
      optional: "optional",
    },

    // Errors
    errors: {
      fullNameRequired: "Please enter your full name.",
      emailRequired: "Please enter your email address.",
      passwordMinLength: "Password must be at least 12 characters.",
      termsRequired: "You must accept the terms of service.",
      workspaceNameRequired: "Please enter your workspace name.",
      subdomainMinLength: "Subdomain must be at least 3 characters.",
      subdomainUnavailable: "Please choose an available subdomain.",
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

      // Typewriter headlines
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

      // Q3 — Priority labels
      priority: {
        analytics: "Analytics & Insights",
        automation: "Automation & Workflows",
        security: "Security & Compliance",
        collaboration: "Team Collaboration",
        integrations: "Integrations & APIs",
        support: "Customer Support",
        speed: "Speed & Performance",
        customization: "Customization",
      },

      // Recommendation hint (shown before Q3)
      hint: {
        starter: "Starter",
        team: "Team",
        business: "Business",
        professional: "Professional",
        enterprise: "Enterprise",
        message: "Based on your profile, we'll highlight our {{plan}} plan for you.",
      },
    },

    // Contact Sales
    contactSales: {
      title: "Talk to our sales team",
      interested: "Interested in:",
      company: "Company",
      companyPlaceholder: "Acme Inc.",
      companySize: "Company size",
      noteLabel: "Anything you'd like to share?",
      notePlaceholder: "Team size, timeline, specific requirements…",
      cta: "Request a demo",
      successTitle: "We'll be in touch!",
      successSubtitle: "Thanks! We'll reply within 1 business day.",
      fallback: "Or email us directly at {{email}}",
      backToPlans: "← Back to plans",
    },

    // Step 5 — Review (replaces Payment)
    review: {
      // free branch — ZERO payment language
      freeTitle: "You're all set!",
      freeSubtitle: "Review your details and create your workspace.",
      createWorkspace: "Create your workspace",
      // trial branch — card collected on Stripe's secure page
      trialTitle: "Start your {{days}}-day free trial",
      trialSubtitle: "Add a card on the secure checkout page — you won't be charged during the trial.",
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
      promoHint: "Have a promo code? Apply it on the secure checkout page.",
      paymentPageNote: "",
      checkoutCanceled: "Checkout canceled — you can try again or change your plan.",
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
    },
  },
};
