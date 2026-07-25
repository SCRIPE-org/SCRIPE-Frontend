/**
 * Copy for the email composer and notification sender views.
 *
 * This package is the sole consumer of `messaging.email.confirmSendDescription`
 * and `messaging.notifications.confirmSendDescription`, so both are safely
 * re-pitched here: the base copy borrowed the notification's "Send this
 * [x] to" phrasing for the email dialog too, which read as a sentence with no
 * object once the recipient breakdown moved into the dialog body, and the
 * notification's version was being hand-concatenated with a raw string join
 * instead of a real `t()` interpolation (broken word order under RTL).
 *
 * Everything else here is copy that never existed: the recipient/target
 * "Remove {{name}}" names (the shipped version announced a bare "Remove" on
 * every chip in a multi-chip row, indistinguishable to a screen reader), the
 * schedule picker's weekday/timezone options (hardcoded English with no
 * lookup at all), and the variable-insert popover strings.
 */
export const en = {
  messaging: {
    email: {
      // Overrides the base's mismatched "Send this email to" — the recipient/
      // cc/bcc/subject/attachment/schedule breakdown already lives in the
      // dialog body, so the description reads as a plain confirmation line.
      confirmSendDescription: "Review the details below before sending.",
      // The base key `common.back` reads "Back", which is the wrong verb for
      // "leave this pending email queued as-is".
      keepPending: "Keep",
      insertVariable: "Insert variable",
      insertVariableIntoSubject: "Insert variable into subject",
      noRecipientsFoundHint: "Type a full email and press Enter.",
      sendToCustomEmail: "Send to:",
      removeRecipientNamed: "Remove {{name}}",
      removeAttachmentNamed: "Remove {{name}}",
      attachmentCountLabel: "{{count}} file(s)",
      attachmentsTotalSize: "Total: {{size}}",
      attachmentsCount: "{{count}} attachment(s)",
      variablesPanel: "Variables",
      resendSuccess: "Email re-queued for sending",
      resendError: "Failed to resend email",
      days: {
        sunday: "Sunday",
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
      },
      timezones: {
        utc: "UTC (GMT+0)",
        easternUs: "Eastern (GMT-5)",
        centralUs: "Central (GMT-6)",
        pacificUs: "Pacific (GMT-8)",
        london: "London (GMT+0)",
        berlin: "Berlin (GMT+1)",
        dubai: "Dubai (GMT+4)",
        india: "India (GMT+5:30)",
        china: "China (GMT+8)",
        tokyo: "Tokyo (GMT+9)",
        sydney: "Sydney (GMT+11)",
        cairo: "Cairo (GMT+2)",
      },
      scheduleWillSend: "Will send on {{date}} at {{time}} ({{tz}})",
      recurringSendsDaily: "Sends every day at {{time}}",
      recurringSendsWeekly: "Sends every {{day}} at {{time}}",
      recurringSendsMonthly: "Sends on day {{day}} of each month at {{time}}",
    },
    notifications: {
      confirmSendDescription: "Send this notification to {{count}} target(s)?",
      noTargetsFound: "No targets found",
      removeTargetNamed: "Remove {{name}}",
    },
  },
} as const;

export const ar = {
  messaging: {
    email: {
      confirmSendDescription: "راجع التفاصيل أدناه قبل الإرسال.",
      keepPending: "إبقاء",
      insertVariable: "إدراج متغير",
      insertVariableIntoSubject: "إدراج متغير في الموضوع",
      noRecipientsFoundHint: "اكتب بريدًا إلكترونيًا كاملاً واضغط Enter.",
      sendToCustomEmail: "إرسال إلى:",
      removeRecipientNamed: "إزالة {{name}}",
      removeAttachmentNamed: "إزالة {{name}}",
      attachmentCountLabel: "{{count}} ملف(ات)",
      attachmentsTotalSize: "الإجمالي: {{size}}",
      attachmentsCount: "{{count}} مرفق(ات)",
      variablesPanel: "المتغيرات",
      resendSuccess: "أُعيدت جدولة البريد الإلكتروني للإرسال",
      resendError: "فشل في إعادة إرسال البريد الإلكتروني",
      days: {
        sunday: "الأحد",
        monday: "الاثنين",
        tuesday: "الثلاثاء",
        wednesday: "الأربعاء",
        thursday: "الخميس",
        friday: "الجمعة",
        saturday: "السبت",
      },
      timezones: {
        utc: "التوقيت العالمي المنسق (GMT+0)",
        easternUs: "شرق أمريكا (GMT-5)",
        centralUs: "وسط أمريكا (GMT-6)",
        pacificUs: "غرب أمريكا (GMT-8)",
        london: "لندن (GMT+0)",
        berlin: "برلين (GMT+1)",
        dubai: "دبي (GMT+4)",
        india: "الهند (GMT+5:30)",
        china: "الصين (GMT+8)",
        tokyo: "طوكيو (GMT+9)",
        sydney: "سيدني (GMT+11)",
        cairo: "القاهرة (GMT+2)",
      },
      scheduleWillSend: "سيتم الإرسال في {{date}} الساعة {{time}} ({{tz}})",
      recurringSendsDaily: "يُرسل كل يوم الساعة {{time}}",
      recurringSendsWeekly: "يُرسل كل {{day}} الساعة {{time}}",
      recurringSendsMonthly: "يُرسل في اليوم {{day}} من كل شهر الساعة {{time}}",
    },
    notifications: {
      confirmSendDescription: "إرسال هذا الإشعار إلى {{count}} هدف(أهداف)؟",
      noTargetsFound: "لم يتم العثور على أهداف",
      removeTargetNamed: "إزالة {{name}}",
    },
  },
} as const;
