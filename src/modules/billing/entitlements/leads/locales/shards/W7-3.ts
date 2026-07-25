/**
 * Copy contributed by the leads create/assign/convert dialogs and the
 * convert-to-tenant wizard.
 *
 * Adds keys the base leads dictionary did not carry yet: the outbound email
 * template bodies (previously hardcoded English inside SendLeadEmailDialog)
 * and the "Free" price label in the edition picker.
 */
export const en = {
  leads: {
    convertWizard: {
      editionFree: "Free",
    },
    email: {
      templates: {
        initialContact: {
          subject: "Welcome to SCRIPE — Let's Connect",
          body: "<p>Hi [Contact Name],</p>\n<p>Thank you for your interest in SCRIPE. I'd love to learn more about <strong>[Company Name]</strong> and how we can work together.</p>\n<p>Would you be open to a quick 20-minute call this week?</p>",
        },
        followUp: {
          subject: "Following Up — SCRIPE for [Company Name]",
          body: "<p>Hi [Contact Name],</p>\n<p>I wanted to follow up on SCRIPE. I'm sure things have been busy — just didn't want to lose touch.</p>\n<p>If you have any questions or would like a demo, I'm here.</p>",
        },
        demoInvitation: {
          subject: "Your SCRIPE Demo is Ready",
          body: "<p>Hi [Contact Name],</p>\n<p>I've set aside time for a personalized SCRIPE demo tailored to <strong>[Company Name]</strong>.</p>\n<p>Reply to this email or click below to pick a time.</p>",
        },
      },
    },
  },
} as const;

export const ar = {
  leads: {
    convertWizard: {
      editionFree: "مجاني",
    },
    email: {
      templates: {
        initialContact: {
          subject: "أهلاً بك في SCRIPE — لنتواصل",
          body: "<p>مرحباً [Contact Name]،</p>\n<p>شكراً لاهتمامك بمنصة SCRIPE. يسعدني التعرف أكثر على <strong>[Company Name]</strong> ومناقشة كيف يمكننا العمل معاً.</p>\n<p>هل تناسبك مكالمة سريعة لمدة 20 دقيقة هذا الأسبوع؟</p>",
        },
        followUp: {
          subject: "متابعة — SCRIPE لـ [Company Name]",
          body: "<p>مرحباً [Contact Name]،</p>\n<p>أردت المتابعة بخصوص SCRIPE. أعلم أن الأمور قد تكون مشغولة — لم أرغب فقط في فقدان التواصل.</p>\n<p>إن كانت لديك أي أسئلة أو ترغب في عرض توضيحي، أنا هنا لمساعدتك.</p>",
        },
        demoInvitation: {
          subject: "عرض SCRIPE التوضيحي جاهز لك",
          body: "<p>مرحباً [Contact Name]،</p>\n<p>خصصت وقتاً لعرض توضيحي شخصي لمنصة SCRIPE مصمم خصيصاً لـ <strong>[Company Name]</strong>.</p>\n<p>يمكنك الرد على هذا البريد أو النقر أدناه لاختيار الموعد المناسب.</p>",
        },
      },
    },
  },
} as const;
