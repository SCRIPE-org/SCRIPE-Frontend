// Locale pack — rich text editor block types.
// Owns the block/node names shown in the insert menu, the slash command list
// and the block settings panel. Split from the toolbar pack because the two
// surfaces are edited independently.
//
// The insert designers (CTA button, social links, colour picker, variable
// values) had shipped an entire second UI in English only: every field label,
// every placeholder, every accessible name and the block titles written into
// the document itself. They live here with EN and AR side by side, so a
// half-translated field is visible at review time rather than at runtime.
//
// NOT here, on purpose: platform names (Facebook, X, LinkedIn…) and the hex
// strings the colour picker shows. A brand name is a wordmark, not copy, and a
// hex value is data the user is authoring — translating either would be wrong.

export const en = {
  editorBlocks: {
    common: {
      /** Accessible name of the live-preview region inside a designer panel. */
      preview: "Preview",
      /**
       * The readout beside a slider. The unit is a translated string because
       * Arabic spells it out instead of borrowing the Latin abbreviation.
       */
      px: "{value}px",
    },

    button: {
      /** Visible toolbar label; hidden below the sm breakpoint. */
      trigger: "Button",
      /** The toolbar control's accessible name — it is icon-only on mobile. */
      triggerLabel: "Insert a call-to-action button",
      title: "Call-to-action button",
      text: "Button text",
      textPlaceholder: "Click here",
      /** Stands in for an empty label in the preview and the generated email. */
      textFallback: "Click here",
      url: "Link URL",
      urlPlaceholder: "https://example.com",
      urlHint: "Where the button takes the recipient.",
      background: "Background",
      textColor: "Text color",
      radius: "Corner radius",
      fontSize: "Font size",
      fullWidth: "Full width",
      shadow: "Shadow",
      insert: "Insert button",
      /**
       * Written into the document node at insert time, so it is frozen in the
       * language the author was using — the same way a typed heading is.
       */
      blockLabel: "CTA: {text}",
    },

    social: {
      trigger: "Social",
      triggerLabel: "Insert social media links",
      title: "Social media links",
      style: "Style",
      styleColored: "Colored",
      styleMono: "Mono",
      shape: "Shape",
      shapeCircle: "Circle",
      shapeRounded: "Rounded",
      /**
       * Alignment of the icon row inside the EMAIL, which is a physical box in
       * a mail client rather than a logical one — so these three stay
       * left/center/right instead of start/center/end.
       */
      align: "Align",
      alignLeft: "Left",
      alignCenter: "Center",
      alignRight: "Right",
      /** `platform` is a brand name and is never translated. */
      url: "{platform} link",
      insert: "Insert links ({count})",
      blockLabel: "Social links ({count})",
    },

    color: {
      /** `color` is the hex string itself. */
      swatch: "Use color {color}",
      custom: "Custom hex color",
      /** A sample hex, shown as a placeholder in the custom-value field. */
      hexPlaceholder: "3b82f6",
    },

    variables: {
      trigger: "Variables",
      triggerLabel: "Insert a variable",
      /** The filter field's accessible name; the placeholder is only a hint. */
      search: "Search variables",
      searchPlaceholder: "Search variables…",
      emptyTitle: "No variables match",
      emptyDescription: "Try another word, or clear the search.",
      sample: "Sample: {value}",
      addFallback: "Add fallback value",
      fallbackLabel: "Fallback value for {name}",
      fallbackPlaceholder: "e.g. Valued customer",
      insertFallback: "Insert",
      category: {
        recipient: "Recipient",
        company: "Company",
        system: "System",
        template: "Template",
      },
      // The built-in merge fields. Variables supplied by a caller carry their
      // own label and fall back to it, so this list covers the defaults only.
      names: {
        userName: "User name",
        userEmail: "Email address",
        firstName: "First name",
        lastName: "Last name",
        jobTitle: "Job title",
        companyName: "Company name",
        companyLogo: "Company logo URL",
        companyAddress: "Company address",
        companyPhone: "Phone number",
        companyWebsite: "Website URL",
        currentDate: "Current date",
        currentYear: "Current year",
        supportEmail: "Support email",
        loginUrl: "Login URL",
        dashboardUrl: "Dashboard URL",
        unsubscribeUrl: "Unsubscribe URL",
      },
    },

    values: {
      title: "Variable values",
      /** Accessible name of the filled/total counter chip. */
      progress: "{filled} of {total} variables filled",
      autoFill: "Auto-fill",
      autoFillLabel: "Fill every empty variable with its sample value",
      emptyTitle: "No variables in this template",
      /**
       * The braces are template syntax, not interpolation — this key is read
       * with no params, so `t()` returns it untouched.
       */
      emptyDescription: "Add one to the template body using the {{variableName}} syntax.",
      fieldType: "Field type for {name}",
      hasValue: "{name} has a value",
      isEmpty: "{name} is still empty",
      type: {
        text: "Text",
        textarea: "Long text",
        richtext: "Rich text",
        number: "Number",
        date: "Date",
        datetime: "Date & time",
        email: "Email",
        url: "URL",
        color: "Color",
      },
      placeholder: {
        loadingEditor: "Loading editor…",
        richText: "Enter rich text…",
        number: "0",
        date: "Select a date",
        datetime: "Select a date and time",
        email: "name@example.com",
        url: "https://…",
        select: "Select…",
      },
    },

    block: {
      /** Accessible name of the delete control on an inserted email block. */
      remove: "Remove block",
    },
  },
} as const;

export const ar = {
  editorBlocks: {
    common: {
      preview: "معاينة",
      px: "{value} بكسل",
    },

    button: {
      trigger: "زر",
      triggerLabel: "إدراج زر إجراء",
      title: "زر الإجراء",
      text: "نص الزر",
      textPlaceholder: "اضغط هنا",
      textFallback: "اضغط هنا",
      url: "رابط الزر",
      urlPlaceholder: "https://example.com",
      urlHint: "الوجهة التي ينتقل إليها المستلم عند الضغط.",
      background: "لون الخلفية",
      textColor: "لون النص",
      radius: "استدارة الحواف",
      fontSize: "حجم الخط",
      fullWidth: "عرض كامل",
      shadow: "ظل",
      insert: "إدراج الزر",
      blockLabel: "زر إجراء: {text}",
    },

    social: {
      trigger: "التواصل",
      triggerLabel: "إدراج روابط التواصل الاجتماعي",
      title: "روابط التواصل الاجتماعي",
      style: "النمط",
      styleColored: "ملوّن",
      styleMono: "أحادي اللون",
      shape: "الشكل",
      shapeCircle: "دائري",
      shapeRounded: "مستدير الحواف",
      align: "المحاذاة",
      alignLeft: "يسار",
      alignCenter: "وسط",
      alignRight: "يمين",
      url: "رابط {platform}",
      insert: "إدراج الروابط ({count})",
      blockLabel: "روابط التواصل ({count})",
    },

    color: {
      swatch: "استخدام اللون {color}",
      custom: "لون مخصص بصيغة hex",
      hexPlaceholder: "3b82f6",
    },

    variables: {
      trigger: "المتغيرات",
      triggerLabel: "إدراج متغير",
      search: "البحث في المتغيرات",
      searchPlaceholder: "ابحث في المتغيرات…",
      emptyTitle: "لا توجد متغيرات مطابقة",
      emptyDescription: "جرّب كلمة أخرى أو امسح البحث.",
      sample: "مثال: {value}",
      addFallback: "إضافة قيمة بديلة",
      fallbackLabel: "القيمة البديلة لـ {name}",
      fallbackPlaceholder: "مثال: عميلنا العزيز",
      insertFallback: "إدراج",
      category: {
        recipient: "المستلم",
        company: "الشركة",
        system: "النظام",
        template: "القالب",
      },
      names: {
        userName: "اسم المستخدم",
        userEmail: "البريد الإلكتروني",
        firstName: "الاسم الأول",
        lastName: "اسم العائلة",
        jobTitle: "المسمى الوظيفي",
        companyName: "اسم الشركة",
        companyLogo: "رابط شعار الشركة",
        companyAddress: "عنوان الشركة",
        companyPhone: "رقم الهاتف",
        companyWebsite: "رابط الموقع الإلكتروني",
        currentDate: "التاريخ الحالي",
        currentYear: "السنة الحالية",
        supportEmail: "بريد الدعم",
        loginUrl: "رابط تسجيل الدخول",
        dashboardUrl: "رابط لوحة التحكم",
        unsubscribeUrl: "رابط إلغاء الاشتراك",
      },
    },

    values: {
      title: "قيم المتغيرات",
      progress: "تمت تعبئة {filled} من {total} متغير",
      autoFill: "تعبئة تلقائية",
      autoFillLabel: "تعبئة كل متغير فارغ بقيمته النموذجية",
      emptyTitle: "لا توجد متغيرات في هذا القالب",
      emptyDescription: "أضف متغيرًا إلى نص القالب باستخدام الصيغة {{variableName}}.",
      fieldType: "نوع الحقل لـ {name}",
      hasValue: "{name} يحتوي على قيمة",
      isEmpty: "{name} ما زال فارغًا",
      type: {
        text: "نص",
        textarea: "نص طويل",
        richtext: "نص منسّق",
        number: "رقم",
        date: "تاريخ",
        datetime: "التاريخ والوقت",
        email: "بريد إلكتروني",
        url: "رابط",
        color: "لون",
      },
      placeholder: {
        loadingEditor: "جارٍ تحميل المحرر…",
        richText: "أدخل نصًا منسّقًا…",
        number: "0",
        date: "اختر تاريخًا",
        datetime: "اختر التاريخ والوقت",
        email: "name@example.com",
        url: "https://…",
        select: "اختر…",
      },
    },

    block: {
      remove: "إزالة الكتلة",
    },
  },
} as const;
