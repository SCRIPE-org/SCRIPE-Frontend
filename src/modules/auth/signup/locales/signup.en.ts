export const en = {
  signup: {
    createWorkspace: "Create your workspace",
    getStarted: "Get started with Scripe in under 2 minutes",

    // Stepper labels
    steps: {
      plan: "Plan",
      account: "Account",
      verify: "Verify",
      workspace: "Workspace",
      payment: "Payment",
      setup: "Setting Up",
      welcome: "Welcome",
    },
    stepper: {
      label: "Signup progress",
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
      emailPlaceholder: "you@company.com",
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

    // Step 5 — Payment
    payment: {
      freeTitle: "You're all set!",
      freeSubtitle: "No payment required for the Free plan.",
      trialTitle: "Start your {{days}}-day trial",
      paidTitle: "Complete your purchase",
      plan: "plan",
      cardNotRequired: "No credit card required",
      trialNote: "No charge today. You'll be billed after your trial ends.",
      trialCta: "Start free trial →",
      payCta: "Complete purchase →",
      continueFree: "Continue →",
      processing: "Processing…",
      promoCode: "Promo code",
      promoApply: "Apply",
      promoApplied: "Promo code applied!",
      promoInvalid: "Invalid promo code.",
      promoExpired: "This promo code has expired.",
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
  },
};
