// Locale pack — rich text editor toolbar.
// Owns the control names for the formatting toolbar. Every glyph-only control
// there needs an accessible name, so these keys are load-bearing, not cosmetic.
//
// Two conventions worth stating once, because both look like missing
// translations at review time and are not:
//
// 1. KEYBOARD CHORDS stay Latin in both packs. "Ctrl+B" is the key the user
//    physically presses; transliterating it would name a key that is not on the
//    keyboard. The surrounding word is translated, the chord is not.
// 2. STYLE ABBREVIATIONS (¶, H1..H3) are typographic marks, not words — the
//    same class of thing as a wordmark or a maths symbol. They render identically
//    in both packs; the dropdown ROW next to each mark carries the translated
//    name, and the trigger carries the translated accessible name, so an Arabic
//    reader never has to decode the mark alone.
//
// ALIGNMENT is deliberately absolute in both packs: "Align left" means the
// authored paragraph is flush left in the rendered document, whatever direction
// the editing UI happens to be running in. It is a property of the user's
// content, not of the app chrome, so it does not mirror.

export const en = {
  editor: {
    /** Default body placeholder; a caller-supplied one wins. */
    placeholder: "Start typing…",
    /** Screen-reader form of the visible "1,234/5,000" ratio. */
    characterCount: "{count} of {max} characters used",
    sourceLabel: "HTML source",
    toolbar: {
      /** Names the whole control strip, so its buttons are announced in context. */
      label: "Formatting",
      textStyle: "Text style",
      style: {
        paragraph: "Paragraph",
        heading1: "Heading 1",
        heading2: "Heading 2",
        heading3: "Heading 3",
      },
      styleShort: {
        paragraph: "¶",
        heading1: "H1",
        heading2: "H2",
        heading3: "H3",
      },
      bold: "Bold (Ctrl+B)",
      italic: "Italic (Ctrl+I)",
      underline: "Underline (Ctrl+U)",
      strikethrough: "Strikethrough",
      subscript: "Subscript",
      superscript: "Superscript",
      align: {
        left: "Align left",
        center: "Align center",
        right: "Align right",
        justify: "Justify",
      },
      list: {
        bullet: "Bullet list",
        numbered: "Numbered list",
      },
      blockquote: "Blockquote",
      inlineCode: "Inline code",
      codeBlock: "Code block",
      divider: "Horizontal divider",
      source: "HTML source",
      undo: "Undo (Ctrl+Z)",
      redo: "Redo (Ctrl+Y)",
      color: {
        text: "Text color",
        highlight: "Highlight",
        custom: "Custom color",
        customPlaceholder: "#RRGGBB",
        apply: "Apply",
        /**
         * Swatch names. The first eight name a ROLE (the palette's neutral and
         * status steps); the last eight name a HUE, because a hue slot has no
         * role to borrow — the user is picking a colour, so the colour is the
         * name.
         */
        swatch: {
          default: "Default",
          muted: "Muted",
          subtle: "Subtle",
          blue: "Blue",
          cyan: "Cyan",
          green: "Green",
          orange: "Orange",
          violet: "Violet",
          red: "Red",
          deepGreen: "Deep green",
          magenta: "Magenta",
          yellow: "Yellow",
        },
      },
      link: {
        trigger: "Link",
        url: "URL",
        urlPlaceholder: "https://example.com",
        apply: "Apply",
        remove: "Remove",
      },
      image: {
        trigger: "Insert image",
        url: "Image URL",
        urlPlaceholder: "https://example.com/image.png",
        insert: "Insert",
        upload: "Upload image",
        uploading: "Uploading…",
      },
    },
  },
} as const;

export const ar = {
  editor: {
    placeholder: "ابدأ الكتابة…",
    characterCount: "{count} من {max} حرف",
    sourceLabel: "شفرة HTML",
    toolbar: {
      label: "التنسيق",
      textStyle: "نمط النص",
      style: {
        paragraph: "فقرة",
        heading1: "عنوان 1",
        heading2: "عنوان 2",
        heading3: "عنوان 3",
      },
      // Typographic marks, not words — identical in both packs by design.
      styleShort: {
        paragraph: "¶",
        heading1: "H1",
        heading2: "H2",
        heading3: "H3",
      },
      // The chord stays Latin: it names a physical key.
      bold: "عريض (Ctrl+B)",
      italic: "مائل (Ctrl+I)",
      underline: "تسطير (Ctrl+U)",
      strikethrough: "يتوسطه خط",
      subscript: "نص منخفض",
      superscript: "نص مرتفع",
      // Absolute, not mirrored — see the header note.
      align: {
        left: "محاذاة لليسار",
        center: "توسيط",
        right: "محاذاة لليمين",
        justify: "ضبط",
      },
      list: {
        bullet: "قائمة نقطية",
        numbered: "قائمة رقمية",
      },
      blockquote: "اقتباس",
      inlineCode: "كود ضمن السطر",
      codeBlock: "كتلة كود",
      divider: "فاصل أفقي",
      source: "شفرة HTML",
      undo: "تراجع (Ctrl+Z)",
      redo: "إعادة (Ctrl+Y)",
      color: {
        text: "لون النص",
        highlight: "تمييز",
        custom: "لون مخصص",
        customPlaceholder: "#RRGGBB",
        apply: "تطبيق",
        swatch: {
          default: "افتراضي",
          muted: "باهت",
          subtle: "خفيف",
          blue: "أزرق",
          cyan: "سماوي",
          green: "أخضر",
          orange: "برتقالي",
          violet: "بنفسجي",
          red: "أحمر",
          deepGreen: "أخضر داكن",
          magenta: "أرجواني",
          yellow: "أصفر",
        },
      },
      link: {
        trigger: "رابط",
        url: "الرابط",
        urlPlaceholder: "https://example.com",
        apply: "تطبيق",
        remove: "إزالة",
      },
      image: {
        trigger: "إدراج صورة",
        url: "رابط الصورة",
        urlPlaceholder: "https://example.com/image.png",
        insert: "إدراج",
        upload: "رفع صورة",
        uploading: "جارٍ الرفع…",
      },
    },
  },
} as const;
