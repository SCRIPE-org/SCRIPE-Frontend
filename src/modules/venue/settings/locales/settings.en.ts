export const en = {
  venueSettings: {
    title: "Venue Settings",
    description:
      "Branch profiles, booking defaults, team collaboration, and advanced configuration.",
    tabs: {
      branch: "Branch & Venue",
      booking: "Booking Defaults",
      team: "Team & Access",
      preferences: "Preferences",
      advanced: "Advanced",
    },
    branch: {
      title: "Operating Branch Details",
      description: "Authoritative branch location, active timezone, and operating profile.",
      name: "Branch Name",
      timezone: "Operating Timezone",
      noSelection: "No branch selected",
      timezoneUnavailable: "Timezone unavailable",
      multiBranchNote:
        "To configure multiple branches or update physical campus records, open Advanced Settings → Branch Registry.",
    },
    booking: {
      title: "Global Booking Preferences",
      description: "Venue-wide scheduling defaults and booking policies.",
      courtRulesTitle: "Court-Specific Rules Architecture",
      courtRulesDescription:
        "Slot duration (60 min, 90 min, etc.), pricing, and working hours are configured canonically inside each Court's Detail view.",
      courtsLink: "Courts & Spaces",
      windowTitle: "Advance Booking Window",
      windowDescription:
        "Maximum days in advance clients and operators can reserve slots (Default: 14 days).",
      windowDays: "{{count}} Days",
    },
    team: {
      title: "Venue Management Mode & Collaboration",
      description: "Control whether you operate solo or collaborate with staff members.",
      soloTitle: "Just Me (Solo Owner)",
      soloDescription:
        "Keep navigation simple and clean. Team management is hidden from normal menus.",
      teamTitle: "Me and My Team (Collaborative)",
      teamDescription:
        "Expose Team in the secondary sidebar to invite managers, receptionists, and assign roles.",
      manageTitle: "Manage Team Members & Permissions",
      manageDescription: "Configure staff accounts, roles, and administrative access.",
      openTeam: "Open Team Management",
    },
    preferences: {
      title: "Language & Regional Preferences",
      description: "Customize your user interface language and layout direction.",
      languageTitle: "Interface Language",
      languageDescription: "English and Arabic with native RTL support",
    },
    advanced: {
      title: "Advanced Administrative Configuration",
      description:
        "Technical registries and multi-campus configurations for power operators and administrators.",
      badge: "Admin Only",
      registries: {
        facilitiesTitle: "Branch & Facility Registry",
        facilitiesDesc: "Physical facility branches and multi-location metadata.",
        availabilityTitle: "Operating Hours & Matrix",
        availabilityDesc: "Multi-window shifts, schedule matrices, and date exceptions.",
        sitesTitle: "Sites & Campuses",
        sitesDesc: "Enterprise site boundaries and campus hierarchy.",
        pricingTitle: "Commercial Pricing Catalog",
        pricingDesc: "Authoritative catalog price books and tax categories.",
        builderTitle: "Resource Builder",
        builderDesc: "Direct schedulable resource schema configuration.",
        profilesTitle: "Resource Profiles",
        profilesDesc: "Archetype policy templates across facility spaces.",
      },
    },
    resourceNav: {
      backToSettings: "Back to Venue Settings",
      advancedConfiguration: "Advanced Configuration",
    },
  },
};
