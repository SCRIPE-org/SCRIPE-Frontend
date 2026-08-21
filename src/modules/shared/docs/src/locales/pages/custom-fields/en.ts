// FILE-EXCEPTION: file length
/**
 * Exported constant defining parameters and fields for en configurations.
 *
 * Custom Fields product documentation — nine pages under the Custom Fields
 * section of the docs portal. Namespaced under modules.customFields.docs so it
 * never collides with the developer-facing modules.customFields.overview page.
 */
export const en = {
  modules: {
    customFields: {
      docs: {
        // ═══════════════════════════════════════════════════
        //  Custom Fields (section landing)
        // ═══════════════════════════════════════════════════
        home: {
          title: "Custom Fields",
          description:
            "Add your own fields to the records you already use — what a custom field is, what it is made of, how it is scoped, and where to find the rest of the documentation.",
          intro:
            "Custom fields let you add your own information to the records you already work with — a nationality on a person, a preferred foot on a player, a purchase-order number on a booking — without waiting for a release and without anybody writing code. You define the field once on the Custom Fields screen, and from that moment every create and edit form for that kind of record shows it, the record list gains a column for it, and the value you type is stored against that specific record.",
          valueInfoTitle: "In one sentence",
          valueInfoContent:
            "A custom field is a question you decide to ask about a record: defined once by an administrator, and answered from then on by everybody who fills that record in.",

          whatTitle: "What you get",
          whatIntro:
            "Custom fields are not a free-text notes box bolted onto the side of a record. Each one is a real, typed, named field with its own validation rules, its own place in the form, its own column in the list, and its own audit trail.",
          featDefineOnce: "Defined once, used everywhere",
          featDefineOnceDesc:
            "Add the field on the Custom Fields screen and every create and edit form for that record type picks it up, along with an extra column in the record list. No release, no code, no waiting.",
          featTyped: "Checked on the way in",
          featTypedDesc:
            "Each value type has its own rules — a real email address, a hex colour, a rating from 1 to 5 — so a wrong value is refused with a specific message rather than quietly stored and discovered six months later.",
          featSeventeen: "Seventeen value types",
          featSeventeenDesc:
            "Text and long text, single and multiple choice, numbers, percentages, ratings, money, durations, dates, date-and-time with a real time zone, times, email, web addresses, phone numbers, yes/no and colour.",
          featScoped: "Yours, or the whole platform's",
          featScopedDesc:
            "A field you create belongs to your workspace only. Platform administrators can create global fields that every workspace inherits and no workspace can edit or delete.",
          featSecured: "Restrictable field by field",
          featSecuredDesc:
            "A role or a user group can hide a specific field from the people holding it, and the product will not let somebody who cannot see a value erase it by editing the record around it.",
          featAccountable: "Accountable",
          featAccountableDesc:
            "Every definition change is recorded with who and when, a usage report tells you how many answers a field holds before you delete it, and the whole set of definitions exports to a spreadsheet.",

          anatomyTitle: "What a field is made of",
          anatomyIntro:
            "This is the complete set of things a field definition carries. Three of them are permanent once saved, because answers already recorded against them would stop making sense if they moved. Control names are shown as they appear in the English interface.",
          thPart: "Setting",
          thWhat: "What it is",
          thChange: "Changeable later?",
          partEntityType:
            "The kind of record the field belongs to — people, staff members, bookings, and so on.",
          partKey:
            "The machine name, used in error messages and exports. Lower case, starts with a letter, letters, digits and underscores only.",
          partValueType: "One of the seventeen types, deciding what can be entered and how it is checked.",
          partLabelEn: "The English label people see above the input.",
          partLabelAr: "The Arabic label, optional. Falls back to the English one when blank.",
          partPlaceholder:
            "Optional greyed-out hint text shown inside the empty input, in each language.",
          partRequired: "Whether a record can be saved with this field left blank.",
          partSortOrder: "Where the field sits relative to the other custom fields on the form.",
          partFieldGroup: "The optional heading the field is gathered under.",
          partOptions: "The list of allowed answers. Select and MultiSelect only.",
          partValidator: "An optional extra format check, plus its setting. Text fields only.",
          partSensitivity:
            "A classification label — Unclassified, Internal, Confidential or Restricted — for reporting and export handling.",
          partExportable:
            "A marker saying whether this field's values should be included in exports. It does not affect the definitions export, which always lists the field and reports the flag.",
          partActive:
            "Whether the field is still offered on forms. An inactive field keeps its stored answers.",
          partScope:
            "Whether the field belongs to your workspace or to the whole platform. Decided by who creates it.",
          changeNever: "No — permanent once saved",
          changeAnytime: "Yes, at any time",
          changeAnytimeConditions: "Yes, unless a role or group restricts the field",
          changeAnytimeCare: "Yes, but read the warnings first",

          exampleTitle: "A worked example, start to finish",
          exampleIntro:
            "Suppose the academy needs to record each player's nationality, and the product has no such field. Nothing here needs a developer.",
          ex1Title: "Decide what you are asking",
          ex1Content:
            "The question is \"what nationality is this player?\". The answer is a short piece of text with no fixed list of choices, so the value type is Text. If you did want a fixed list, Select would be the right choice instead — and that decision is permanent, so it is worth a moment's thought.",
          ex2Title: "Define the field",
          ex2Content:
            "On the Custom Fields screen, choose Add. Pick the record type for people, set the key to nationality, the English label to Nationality, the value type to Text, and leave Required off for now. Save.",
          ex3Title: "Fill it in",
          ex3Content:
            "Open any player record. A Custom Fields section now shows a Nationality input, empty. Type a value and save the record. No error means the value was accepted and stored against that player.",
          ex4Title: "Read it back",
          ex4Content:
            "Reopen the record and the value is there. The record list also has a Nationality column now, so you can see the answer for every player at once without opening any of them.",
          ex5Title: "Tighten it up",
          ex5Content:
            "Later you decide the field must always be filled in. Edit the definition and turn Required on. From then on a player cannot be saved with Nationality blank — but note that players saved earlier with it blank stay as they are until somebody edits them.",

          scopeTitle: "Your workspace, or the whole platform",
          scopeIntro:
            "A field created by an administrator inside a workspace belongs to that workspace. Nobody in another workspace sees it, and its answers are never visible outside it. This is the normal case and needs no thought.",
          scopeGlobal:
            "A platform administrator working with no workspace selected creates a global field instead, and the form shows a Global (all tenants) switch when that applies. A global field is inherited by every workspace: everybody can fill it in, and nobody but a platform administrator can edit, reorder or delete it. Global fields also skip the per-workspace field quota.",
          scopeInfoTitle: "Scope is decided at creation",
          scopeInfoContent:
            "There is no way to convert a workspace field into a global one, or the reverse. If the scope is wrong, the field has to be recreated at the right scope — and any answers already recorded against the old one stay with the old one.",

          notTitle: "What custom fields are not",
          notIntro:
            "A few things people reasonably expect of them, that they deliberately do not do.",
          not1: "They are not a substitute for a real feature. A custom field stores and displays an answer; it does not calculate anything, trigger anything, or appear in a report you have not built.",
          not2: "They are not an access-control mechanism. The Sensitivity setting is a label. Field-level security, configured on roles and user groups, is the thing that actually hides a field.",
          not3: "They are not a document store. There is no value type for uploading a file or an image; attachments belong to the record's own attachment features.",
          not4: "They are not free-form. Every field has exactly one value type, chosen up front and permanent, and every value is checked against it on the way in.",
          not5: "They are not retroactive. Tightening a field — making it required, or attaching a format check — never goes back and re-checks answers that were already saved.",

          nextTitle: "Where to go next",
          nextIntro: "The rest of this section covers each part in full.",
          thPage: "Page",
          thCovers: "What it covers",
          pageValueTypes: "Value Types",
          coversValueTypes:
            "All seventeen types, one at a time: what each one stores, what it accepts, what it rejects, and worked example inputs with the error code the product returns.",
          pageDefining: "Defining a Field",
          coversDefining:
            "The definition form control by control, the full walkthrough, key naming rules, creating a field from inside a record, and every rejection you can hit.",
          pageGroups: "Field Groups",
          coversGroups:
            "Gathering a record type's fields under headings, the stable key, ordering, deleting, global groups, and what groups do and do not affect.",
          pageOptions: "Options",
          coversOptions:
            "Writing the allowed answers for Select and MultiSelect, the bilingual option editor, how a submitted value is matched, and what changing the list later does to existing records.",
          pageValidators: "Validators",
          coversValidators:
            "All 13 built-in format checks with valid and invalid example inputs, the six that need a setting, the seven supported postal-code countries, and what a rejection looks like.",
          pageSecurity: "Field-Level Security",
          coversSecurity:
            "Restricting a field on a role or user group, what a restricted person sees, why their saves do not destroy hidden values, and why required and restricted cannot be combined.",
          pageManaging: "Managing Fields",
          coversManaging:
            "Editing, deactivating, the definition history dialog, the usage and impact report, deleting without destroying data, the spreadsheet export, and the two read-only reference screens.",
          pageLimits: "Limits and Behaviours",
          coversLimits:
            "Every fixed cap, every deliberate limitation, and the reason for each — so you do not spend an afternoon looking for a setting that is not there.",

          accessTitle: "Permissions",
          accessIntro:
            "Working with definitions needs permissions of its own. Filling in a field somebody else defined needs nothing beyond access to the record itself.",
          thNeed: "Permission",
          thWhoNeedsIt: "What it allows",
          permView:
            "See the Custom Fields screen, the definition list, the History and Usage dialogs, and the two read-only reference screens.",
          permCreate:
            "Create a definition, including through the Add custom field link inside a record form.",
          permUpdate: "Edit an existing definition.",
          permDelete: "Delete a definition, including confirming a destructive delete.",
          permGroups:
            "The field-groups feature, gated separately. A role holding every custom-fields permission above does not automatically hold these.",
          planInfoTitle: "Custom fields are part of your plan",
          planInfoContent:
            "The feature is entitlement-gated and quota-limited: the Free edition allows zero fields, and every plan has a maximum number of fields per workspace. If the Custom Fields screen is missing, the Add button is absent, or a save is refused for quota, that is a plan matter rather than a fault. Global platform fields do not count against a workspace's quota.",
        },

        // ═══════════════════════════════════════════════════
        //  Value Types
        // ═══════════════════════════════════════════════════
        valueTypes: {
          title: "Value Types",
          description:
            "All seventeen custom-field value types: what each one stores, exactly what it accepts and rejects, worked example inputs, and the error codes the product returns.",
          intro:
            "Every custom field has exactly one value type, chosen when the field is defined. The value type decides what control appears on the form, what the product accepts, how the value is stored and how it is displayed afterwards. This page covers all seventeen, one at a time, with example inputs that are accepted and example inputs that are refused.",
          permanentTitle: "The value type can never be changed",
          permanentContent:
            "Once a field is saved, its value type is fixed for the life of the field. There is no conversion — answers already recorded under the old type would stop making sense. If you pick the wrong type, the field has to be deleted and recreated, and the answers already stored against it are lost with it. Spend the extra minute up front.",

          orderTitle: "How a submitted value is checked",
          orderIntro:
            "Every save runs the same four steps in the same order for every type. Knowing the order explains most surprises.",
          order1:
            "Is the value empty? A missing value, a blank string, or a string of nothing but spaces counts as empty. For MultiSelect an empty list counts too, and for DateTime and Currency a value counts as empty only when both of its parts are missing.",
          order2:
            "If it is empty and the field is Required, the save is refused with VALIDATION_REQUIRED. If it is empty and the field is not required, the stored value is cleared and nothing else runs — no type check, no validator.",
          order3:
            "If it is not empty, the type's own rules run: length caps, number parsing, range checks, allowed-option matching, format checks.",
          order4:
            "For a Text field with a validator attached, and only then, the validator runs last — after the global 4,000-character cap and after the validator's own shorter length cap.",
          orderKeyNote:
            "One detail worth knowing before you read any error message: the message names the field's key, not its label. A field labelled Nationality with the key nationality produces \"'nationality' expects a date.\", not \"'Nationality'\".",

          thExample: "Example input",
          thOutcome: "What happens",

          groupTextTitle: "Text and choices",
          textTitle: "Text",
          textStores:
            "A single line of free-form text, up to 4,000 characters. Renders as an ordinary single-line input.",
          textChecks:
            "The only check is the length cap — unless a validator is attached, which makes Text the only type that can carry a format check. The value is stored exactly as submitted; unlike Select, Text does not trim surrounding spaces.",
          textOk: "Accepted, and stored exactly as submitted.",
          textTooLong:
            "Refused: VALIDATION_MAX_LENGTH. Text stops at 4,000 characters — use LongText for anything longer.",
          textBlankOptional:
            "Accepted, and stored as cleared. Whitespace-only counts as empty, so any attached validator never runs on it.",
          textBlankRequired: "Refused: VALIDATION_REQUIRED. Whitespace-only counts as empty here too.",
          exText4500: "A value 4,500 characters long",
          exSpacesOptional: "Three spaces, on a field that is not Required",
          exSpacesRequired: "Three spaces, on a Required field",

          longTextTitle: "LongText",
          longTextStores:
            "Longer free-form content, up to 10,000 characters. Renders as a real multi-line text area, not a taller single-line box.",
          longTextChecks:
            "Only the 10,000-character cap. LongText cannot carry a validator. The on-screen counter turns red once you pass the cap, but it does not stop you typing — the refusal comes when you save.",
          longTextOk:
            "Accepted. This is well past Text's own 4,000-character cap, which is the reason LongText exists.",
          longTextTooLong: "Refused: VALIDATION_MAX_LENGTH, naming the 10,000-character cap.",
          exLong6000: "A 6,000-character description",
          exLong12000: "A 12,000-character description",

          selectTitle: "Select",
          selectStores:
            "One answer chosen from a list you write yourself. Renders as a dropdown offering exactly your options.",
          selectChecks:
            "The submitted value must match one of the field's configured options exactly. Both sides are trimmed before comparison, and the comparison is case-sensitive. For an options list of Small, Medium, Large:",
          selectOk: "Accepted, and stored as the option text itself.",
          selectTrimmed: "Accepted. Surrounding spaces are trimmed before the comparison.",
          selectCase:
            "Refused: VALIDATION_INVALID_FORMAT. Matching is case-sensitive, so Medium and medium are different answers — which also means the two can legitimately both exist as separate options.",
          selectUnknown:
            "Refused: VALIDATION_INVALID_FORMAT. The message quotes the rejected value and the field's key.",
          exSelectPadded: "\" Medium\" with a leading space",

          multiSelectTitle: "MultiSelect",
          multiSelectStores:
            "Several answers from the same kind of list, up to 19 of them. Renders as a multi-select combobox with a live \"N of 19 selected\" counter.",
          multiSelectChecks:
            "Every submitted answer must be one of the field's configured options, no answer may repeat, and there may be at most 19. The order you pick in is preserved end to end. For an options list of Red, Green, Blue, Yellow:",
          multiOk:
            "Accepted, and read back in the order picked — Blue first, then Red — not re-sorted into the order the options were listed in.",
          multiTooMany:
            "Refused: VALIDATION_MAX_LENGTH, naming the ceiling of 19. The picker itself makes the twentieth option unselectable, so reaching this needs a request that bypasses the form.",
          multiDuplicate:
            "Refused: VALIDATION_UNIQUE. A repeated answer is rejected rather than quietly collapsed to one.",
          multiUnknown: "Refused: VALIDATION_INVALID_FORMAT — Purple is not one of the field's options.",
          multiEmpty:
            "Treated as empty: cleared if the field is optional, refused with VALIDATION_REQUIRED if it is required.",
          exMultiTwo: "Blue, then Red",
          exMultiTwenty: "20 selections",
          exMultiRepeat: "Red, then Red again",
          exMultiEmptyList: "An explicitly empty list",

          groupNumberTitle: "Numbers and measures",
          numberTitle: "Number",
          numberStores:
            "Any number, whole or with decimals, positive or negative, with up to six decimal places.",
          numberChecks:
            "Only that the value parses as a number. No minimum, maximum, precision or rounding rule is applied, so choose Number when genuinely any number is a valid answer — and choose Percent, Rating, Currency or Duration when it is not.",
          numberOk: "Accepted.",
          numberNegative: "Accepted. Negative values are perfectly valid for this type.",
          numberPrecision:
            "Accepted, and stored to six decimal places. Anything finer than that is not preserved.",
          numberInvalid:
            "Refused: VALIDATION_INVALID_FORMAT — the message reads \"expects a number\". A number written as words is not parsed.",
          exAboutForty: "\"about 40\"",

          percentTitle: "Percent",
          percentStores:
            "A percentage between 0 and 100 inclusive, decimals allowed. Renders as a plain numeric input, and displays afterwards as the number with a % sign appended.",
          percentChecks:
            "The value must parse as a number and fall inside 0 to 100. It is stored exactly as typed — this is the detail to get right if you ever read the raw data or build an export.",
          percentOk: "Accepted, and shown afterwards as 25%.",
          percentDecimal: "Accepted, and shown as 33.5%. Fractions of a percentage point are kept exactly.",
          percentQuarter:
            "Accepted — but it means a quarter of one percent, shown as 0.25%. Percent stores the number you would say out loud, never a 0-to-1 fraction.",
          percentTooHigh: "Refused: VALIDATION_RANGE, naming the bounds 0 and 100.",
          percentNegative: "Refused: VALIDATION_RANGE. The lower bound is 0, and it is inclusive.",

          ratingTitle: "Rating",
          ratingStores:
            "A whole number from 1 to 5, captured on a slider. Displays afterwards as \"4 / 5\".",
          ratingChecks:
            "The value must parse as a number, be a whole number, and fall between 1 and 5 inclusive. There is no star control and no free-text entry.",
          ratingOk: "Accepted, and shown as 4 / 5.",
          ratingZero:
            "Refused: VALIDATION_RANGE. A zero is a real submitted value that fails the 1-to-5 check; it is not read as \"unrated\".",
          ratingFraction:
            "Refused: VALIDATION_RANGE. Half ratings are not supported — this is a genuine difference from Number, which allows any decimal.",
          ratingTooHigh: "Refused: VALIDATION_RANGE, with the same message a 0 gets.",
          ratingUntouched:
            "Saved as empty, not as 1. The slider thumb has to sit somewhere, so an untouched field shows at its leftmost position — that is a display artefact, not a stored answer.",
          exRatingUntouched: "The slider left untouched on a new record",

          currencyTitle: "Currency",
          currencyStores:
            "An amount together with its three-letter currency code, held as two independent inputs inside one labelled group. Displays afterwards through the reader's own number formatting, showing the code rather than a symbol so EUR and USD are never ambiguous.",
          currencyChecks:
            "Both parts are required together. The amount must parse as a number; the code must be exactly three uppercase ASCII letters. The code input uppercases and letter-filters as you type, because the check itself does not coerce lower case — it rejects it.",
          currencyOk: "Accepted. Displays as the amount alongside the code, for example USD 100.50.",
          currencyLower:
            "Refused if it ever reaches the server: VALIDATION_INVALID_FORMAT, naming the 3-letter ISO 4217 requirement. In the form itself the input forces upper case as you type, so you will not normally see this.",
          currencyNoCode:
            "Refused: VALIDATION_INVALID_FORMAT. The form also blocks this before it calls the server, with a message saying the field needs both an amount and a currency code.",
          currencyNoAmount:
            "Refused the same way. A code with no amount is a broken value, not a cleared one — only both parts missing counts as empty.",
          currencyZzz:
            "Accepted. Only the shape of the code is checked, never its membership of the real ISO 4217 list, so a well-formed code that does not exist gets through. The display falls back to \"ZZZ 100.50\" for a code the reader's browser does not recognise.",
          currencyMinor:
            "Accepted, and it means ten thousand and fifty. There are no minor units anywhere in custom-field storage — 100.50 is stored as 100.50, never as 10050.",
          exCurrencyOk: "100.50 with the code USD",
          exCurrencyLower: "100.50 with the code usd",
          exCurrencyNoCode: "100.50 with the code left blank",
          exCurrencyNoAmount: "The amount left blank with the code USD",
          exCurrencyZzz: "100.50 with the code ZZZ",
          exCurrencyMinor: "10050 with the code USD",

          durationTitle: "Duration",
          durationStores:
            "A length of time counted in minutes. Renders as a number input with a visible \"minutes\" label beside it, never as a bare unlabelled number.",
          durationChecks:
            "The value must parse as a number and must not be negative. Zero is accepted — a legitimate \"no buffer\". There is no upper bound at all.",
          durationOk: "Accepted, and displayed as 90 minutes.",
          durationFraction:
            "Accepted, and kept exactly as 1.5 — ninety seconds. Decimals are not rounded to whole minutes.",
          durationZero: "Accepted. Zero is a real answer, not an empty one.",
          durationLarge:
            "Accepted — 5,400 minutes, which is three and a half days. Nothing warns you, because there is no maximum.",
          durationNegative: "Refused: VALIDATION_RANGE, with a message saying the value must not be negative.",

          groupDateTitle: "Dates and times",
          dateTitle: "Date",
          dateStores:
            "A calendar date with no time component at all — a birthday, a contract date, an expiry. Renders as a date picker.",
          dateChecks:
            "Only that the value parses as a date. Because the stored value is a plain calendar date rather than a moment in time, it reads back identically for every viewer regardless of their time zone.",
          dateOk: "Accepted, and read back as the same calendar date for every viewer, anywhere.",
          dateNoTime:
            "Ignored. Date holds no time component, so a time submitted alongside the date is simply not stored. Use DateTime when the time matters.",
          dateInvalid: "Refused: VALIDATION_INVALID_FORMAT — the message reads \"expects a date\".",
          exDateWithTime: "A date with a time component attached",
          exNotADate: "\"next Tuesday\"",

          dateTimeTitle: "DateTime",
          dateTimeStores:
            "A precise moment together with the time zone it belongs to. Both halves are stored, so a kick-off at 18:00 in Cairo still reads as 18:00 in Cairo for somebody looking at it from London.",
          dateTimeChecks:
            "The instant must parse, and the time zone must be a recognised IANA zone identifier. The zone is required as soon as either half is present — an instant with no zone is refused, not silently interpreted. The form shows the zone as a small disclosure beside the entered time, with a Change link that opens a searchable picker.",
          dateTimeOk: "Accepted. Both the instant and its zone are read back exactly as entered.",
          dateTimeNoZone:
            "Refused: VALIDATION_INVALID_TIMEZONE. A moment with no zone is exactly what DateTime exists to prevent.",
          dateTimeBadZone:
            "Refused: VALIDATION_INVALID_TIMEZONE, naming the unrecognised identifier. Zones are real IANA names such as Africa/Cairo or Asia/Tokyo.",
          dateTimeEmpty:
            "Treated as empty: cleared if the field is optional, refused with VALIDATION_REQUIRED if it is required. Only both halves missing counts as empty.",
          exDateTimeOk: "18:00 on 21 August 2026, zone Africa/Cairo",
          exDateTimeNoZone: "18:00 on 21 August 2026, zone left blank",
          exDateTimeBadZone: "18:00 on 21 August 2026, zone Not/AZone",
          exDateTimeBothBlank: "Both the instant and the zone left blank",

          timeTitle: "Time",
          timeStores:
            "A time of day on a 24-hour clock, seconds included, with no date attached — an opening time, a curfew, a kick-off slot. Renders as a native time picker with seconds enabled, and displays afterwards in each reader's own local time format.",
          timeChecks:
            "The value must be hours, minutes and seconds separated by colons, with hours 0 to 23, minutes 0 to 59 and seconds 0 to 59. Unpadded input is accepted and normalised rather than refused.",
          timeOk: "Accepted, and shown in the reader's own format — for example 2:30:00 PM for an English (US) reader.",
          timeNormalised:
            "Accepted, and normalised to 09:05:00 before storage. Two submissions of the same time written with different digit widths always end up identical.",
          timeHourRange: "Refused: VALIDATION_INVALID_FORMAT. Hours run 0 to 23, so 24 is out of range.",
          timeMinuteRange: "Refused: VALIDATION_INVALID_FORMAT. Minutes run 0 to 59.",
          timeAmPm:
            "Refused: VALIDATION_INVALID_FORMAT. Twelve-hour text is not parsed — the stored form is always 24-hour, even though the display is not.",

          groupContactTitle: "Contact details and links",
          emailTitle: "Email",
          emailStores:
            "An email address. Renders as a native email input, and displays afterwards as a clickable mail link.",
          emailChecks:
            "The address is parsed as a real address rather than matched against a pattern, and it must be nothing but the address. Case is preserved exactly as typed — no lowercasing.",
          emailOk:
            "Accepted, stored with its exact capitalisation, and shown as a clickable mail link.",
          emailDisplayName:
            "Refused: VALIDATION_INVALID_EMAIL. A display-name wrapper parses as an address but is rejected rather than silently stripped, because an Email field has no display name to keep.",
          emailInvalid: "Refused: VALIDATION_INVALID_EMAIL.",
          exEmailDisplayName: "\"Test User <test@example.com>\"",

          urlTitle: "Url",
          urlStores:
            "A web address. Renders as a native URL input, and displays afterwards as a real link that opens in a new tab.",
          urlChecks:
            "The value must be an absolute address whose scheme is exactly http or https. Every other scheme is refused. The scheme is checked again on the way out, before the value is ever rendered as a link.",
          urlOk: "Accepted, and shown as a link opening in a new tab.",
          urlHttpOk:
            "Accepted. Plain http is deliberately allowed — a company site or an internal address during setup is legitimate data.",
          urlNoScheme:
            "Refused: VALIDATION_INVALID_FORMAT. A bare host is rejected rather than guessed at, so nothing has to decide whether you meant http or https.",
          urlScheme:
            "Refused: VALIDATION_INVALID_FORMAT. This is a real security boundary, not a style rule — and because the scheme is re-checked before display, even a value stored before this check existed shows as inert text rather than a live link.",
          urlFtp: "Refused: VALIDATION_INVALID_FORMAT. Only http and https are on the list.",

          phoneTitle: "Phone",
          phoneStores:
            "A phone number in international format. Renders through a country picker with flags and search, and displays afterwards reformatted for readability — for example +20 123 456 7890.",
          phoneChecks:
            "The stored value must start with a +, its first digit must not be zero, and it must hold between 8 and 15 digits in total. That is a check on shape only.",
          phoneOk: "Accepted, and displayed reformatted rather than as the bare stored string.",
          phoneNoPlus: "Refused: VALIDATION_INVALID_FORMAT. The leading + is part of the format.",
          phoneLeadingZero: "Refused: VALIDATION_INVALID_FORMAT. A country code never starts with zero.",
          phoneTooShort: "Refused: VALIDATION_INVALID_FORMAT. Seven digits is below the minimum of eight.",
          phoneUnassignable:
            "Accepted by the server, which checks shape only and not whether the number could really exist. The form's own picker additionally checks the number against the selected country's real numbering plan, so you cannot build this value through the interface — only a request that bypasses the form.",

          groupOtherTitle: "Yes/no and colour",
          booleanTitle: "Boolean",
          booleanStores: "A plain yes or no. Renders as an on/off toggle. Has no placeholder and no options.",
          booleanChecks:
            "Only the words true and false are parsed, in either case. Nothing else is treated as a synonym.",
          boolTrue: "Accepted.",
          boolFalse: "Accepted.",
          boolOne:
            "Refused: VALIDATION_INVALID_FORMAT — the message reads \"expects a boolean\". A numeric 1 is not read as true.",
          boolYes: "Refused: VALIDATION_INVALID_FORMAT. Neither yes/no nor on/off is accepted.",

          colorTitle: "Color",
          colorStores:
            "A colour, stored as a hex value. Renders as a grid of twenty swatches plus a custom hex entry, and displays afterwards as the hex text with a small matching colour chip beside it.",
          colorChecks:
            "The value must be a # followed by exactly three or exactly six hexadecimal digits. Case is normalised to lower case on save; length is not.",
          colorOk: "Accepted, and stored as #aabbcc. Upper case is folded down to lower case.",
          colorShort:
            "Accepted, and kept as #abc. The shorthand is never expanded to #aabbcc, even though a renderer treats the two as the same colour — so the same colour can legitimately be stored two ways across different records.",
          colorNoHash: "Refused: VALIDATION_INVALID_FORMAT. The leading # is required.",
          colorBadLength: "Refused: VALIDATION_INVALID_FORMAT. Three or six digits, nothing in between.",
          colorNamed: "Refused: VALIDATION_INVALID_FORMAT. Colour names are not accepted, only hex values.",

          emptyTitle: "Empty values and the Required toggle",
          emptyIntro:
            "Every type shares one definition of empty, and it is checked before anything else. A value counts as empty when:",
          empty1: "it is missing from the save entirely;",
          empty2: "it is blank, or made up of nothing but spaces;",
          empty3: "for MultiSelect, the list of selections is explicitly empty;",
          empty4: "for DateTime, both the instant and the time zone are missing — not just one of them;",
          empty5: "for Currency, both the amount and the currency code are missing — not just one of them.",
          emptyOutcome:
            "An empty value on a Required field is refused with VALIDATION_REQUIRED. An empty value on an optional field is accepted and the stored answer is cleared — the row is kept rather than deleted, so history is not lost.",
          emptyWarnTitle: "Rating is the exception worth remembering",
          emptyWarnContent:
            "An explicitly submitted 0 on a Rating field is a real, non-empty value and fails the 1-to-5 range check exactly as a 6 would. Only a genuinely missing or blank submission counts as unrated. Separately, and for the same reason a slider needs a position, an untouched Rating field appears to sit at 1 while still being empty.",

          codesTitle: "Error codes you may see",
          codesIntro:
            "Every refusal is an HTTP 422 with one of these machine-readable codes. If you ever see a 500 from saving a custom-field value, that is a defect worth reporting — the validation path is written to refuse cleanly, never to fail.",
          thCode: "Code",
          thWhenItFires: "When it fires",
          codeRequired: "The field is Required and the submitted value is empty or whitespace-only.",
          codeInvalidFormat:
            "The value does not match the shape the type expects — an unparsable number, date or time, an option that is not on the list, a disallowed URL scheme, a bad phone shape, a bad hex colour, a bad currency code, or most validator failures.",
          codeInvalidEmail: "An Email field's value is not a real address, or carries a display name.",
          codeInvalidTimezone:
            "A DateTime value is missing its time zone once an instant is present, or names a zone that is not a recognised IANA identifier.",
          codeRange:
            "A number is outside its type's bounds — Percent outside 0 to 100, Rating outside a whole 1 to 5, a negative Duration, or a Numeric Range validator's own bounds.",
          codeMaxLength:
            "Text past 4,000 characters, LongText past 10,000, an Email or Url past 4,000, more than 19 MultiSelect selections, or a Length Range validator's upper bound.",
          codeMinLength: "A Length Range validator's lower bound.",
          codeUnique: "The same MultiSelect option was submitted more than once in one save.",
          codesInfoTitle: "Messages name the key, not the label",
          codesInfoContent:
            "Error messages quote the field's machine key — 'shirt_size' — rather than its display label. If you are matching a message to a field, match on the key.",

          catalogueTitle: "The Value Types screen in the product",
          catalogueIntro:
            "The product carries its own read-only catalogue of these types, reached from a link in the Custom Fields page header. It is documentation, not configuration: nothing on it can be added, edited or removed, because value types are fixed by the platform. It is gated behind the same permission as the Custom Fields screen itself, and it is fully translated, right-to-left included.",
          catalogueColumns:
            "Each row shows the type's name, a description of what it is for, whether it takes a placeholder, whether it owns an options list, and whether it supports a validator. Text is the only row showing validator support — that is the Text-only boundary made visible.",
          catalogueNoPlanColumn:
            "There is deliberately no plan or entitlement column on that screen. Value types are not individually plan-gated, so a column implying otherwise would be showing something that does not exist.",
        },

        // ═══════════════════════════════════════════════════
        //  Defining a Field
        // ═══════════════════════════════════════════════════
        defining: {
          title: "Defining a Field",
          description:
            "The definition form control by control, the full walkthrough, the rules for keys, creating a field from inside a record, every rejection, and what can still be changed after saving.",
          intro:
            "Field definitions live on the Custom Fields screen in the Administration workspace. This page walks the whole form: every control, what reveals it, what it does, and what happens when a save is refused. Control names are given as they appear in the English interface.",
          beforeTitle: "Two decisions to make before you open the form",
          beforeContent:
            "The record type and the value type are both permanent once saved, and so is the key. Everything else can be edited later. If you are unsure which value type fits, read the Value Types page first — recreating a field means losing every answer already stored against it.",

          whereTitle: "Where the screen is",
          whereIntro: "Custom fields are administered from four related screens.",
          where1:
            "The Custom Fields screen itself, in the Administration workspace, is where definitions are created, edited, deactivated and deleted, and where a validator is attached.",
          where2:
            "The Field Groups screen, reached from a link in that page's header, gathers a record type's fields under headings.",
          where3:
            "The Value Types and Entity Types screens, also reached from that header, are read-only references. They have no sidebar entry of their own by design.",
          where4:
            "The Add custom field link at the end of the Custom Fields section on a record form opens the same definition form in a side panel, without leaving the record.",

          controlsTitle: "The form, control by control",
          controlsIntro:
            "Not every control is always visible. Several appear only once a particular value type or scope is chosen, which is why the form looks shorter than this table on any given day.",
          thControl: "Control",
          thDoes: "What it does",
          thWhenShown: "When it appears",
          ctlEntityTypeDoes:
            "Chooses the kind of record the field belongs to. Record types with no screen in this app are listed after the rest and marked API only — a field on one of those is reachable through the API but has nowhere to render.",
          ctlEntityTypeWhen:
            "On create. Fixed and not editable when the form is opened from inside a record, and permanent after saving.",
          ctlKeyDoes:
            "Sets the machine name used in error messages, exports and the API. Lower case, must start with a letter, and may contain only letters, digits and underscores.",
          ctlKeyWhen: "On create only. Permanent after saving.",
          ctlLabelEnDoes: "The English label shown above the input on every form. Required.",
          ctlLabelArDoes:
            "The Arabic label. Optional — an Arabic reader sees the English label when this is blank.",
          ctlAlways: "Always.",
          ctlValueTypeDoes:
            "Chooses one of the seventeen types, deciding the control, the validation and the storage. Selecting it is what reveals the Options box or the Validator dropdown.",
          ctlValueTypeWhen: "On create only. Permanent after saving.",
          ctlPlaceholderEnDoes:
            "Optional greyed-out hint shown inside the empty input, in English — for example \"e.g. Enter your shirt size\".",
          ctlPlaceholderArDoes: "The same hint in Arabic.",
          ctlPlaceholderWhen:
            "Only for the value types whose control has a placeholder at all. Boolean, Rating, Color, Date and the other picker-based types have none.",
          ctlOptionsDoes:
            "Holds the list of allowed answers, one row per option, with an English and an Arabic label for each. See the Options page.",
          ctlOptionsWhen: "Only when the value type is Select or MultiSelect.",
          ctlValidatorDoes:
            "Attaches one of the 13 built-in format checks. Defaults to no validator. See the Validators page.",
          ctlValidatorWhen:
            "Only when the value type is Text. It is never shown for the other sixteen types.",
          ctlValidatorParamDoes:
            "Supplies the setting a parameterised check needs — a country dropdown for Postal Code, free text for the other five.",
          ctlValidatorParamWhen:
            "Only once one of the six parameterised validators is chosen.",
          ctlFieldGroupDoes:
            "Puts the field under one of the record type's field groups, or under no group. Changing the record type clears the choice.",
          ctlFieldGroupWhen:
            "Only when you hold the field-groups view permission and at least one group exists for the chosen record type.",
          ctlRequiredDoes:
            "Refuses a save that leaves the field blank. Whitespace-only counts as blank for every value type.",
          ctlSortOrderDoes:
            "Positions the field relative to the other custom fields on the form. Lower numbers come first.",
          ctlSensitivityDoes:
            "Labels how the field's contents should be treated — Unclassified, Internal, Confidential or Restricted. Defaults to Unclassified. It is a label for reporting and export handling; it does not control who can see the field.",
          ctlExportableDoes:
            "Marks whether this field's values should be included in exports. On by default. It is tidying rather than a permission — anybody who can already read the field can still read its values elsewhere — and it does not remove the field from the definitions export, which lists it either way.",
          ctlActiveDoes:
            "Whether the field is still offered on forms. Turning it off retires the field without touching the answers already stored against it.",
          ctlActiveWhen: "On edit. A newly created field is active.",
          ctlGlobalDoes:
            "Creates the field for every workspace on the platform rather than for one. Global fields skip the per-workspace quota, and only a platform administrator can edit or delete them afterwards.",
          ctlGlobalWhen:
            "Only for a platform Super Admin working with no workspace selected. On create only — a field's scope is permanent.",

          stepsTitle: "Step by step",
          stepsIntro: "The whole flow, for the ordinary case of a workspace-scoped field.",
          s1Title: "Open the Custom Fields screen and choose Add",
          s1Content:
            "The screen lists every field your workspace can see, including any global fields inherited from the platform. Global rows carry a badge and offer no edit or delete controls.",
          s2Title: "Pick the record type",
          s2Content:
            "Choose the kind of record the field belongs to. If your record type is marked API only, stop and reconsider — the field will save, but nothing in the interface will render it.",
          s3Title: "Choose the value type",
          s3Content:
            "Pick from the seventeen. This is the decision that cannot be undone later, and it is also what makes the Options box or the Validator dropdown appear further down the form.",
          s4Title: "Name the field",
          s4Content:
            "Enter the English label, an Arabic label if you have one, and the key. The key is permanent, so pick something you will still recognise in an error message a year from now.",
          s5Title: "Fill in the type's own settings",
          s5Content:
            "For Select and MultiSelect, add the options. For Text, choose a validator if you want one and supply its setting. Add placeholders if the control takes them.",
          s6Title: "Set behaviour and position",
          s6Content:
            "Turn Required on or off, set the Sort Order, and choose a Field Group if you use them. A group only offers itself if it belongs to the record type you chose.",
          s7Title: "Set the classification",
          s7Content:
            "Sensitivity defaults to Unclassified and Include in exports defaults to on. Leave both alone unless you have a reason — the export default in particular exists so that fields are never quietly missing from a spreadsheet.",
          s8Title: "Save, and read the message if it is refused",
          s8Content:
            "A refusal is always specific about what is wrong. The table further down this page lists every rejection you can hit and what it means.",

          keyTitle: "Choosing a key",
          keyIntro:
            "The key is the field's machine name. It appears in every error message, in the spreadsheet export, and in the API. It must be lower case, start with a letter, and contain only letters, digits and underscores — and it must be unique for that record type within your workspace.",
          thKeyExample: "Key",
          thOutcome: "What happens",
          keyOk: "Accepted. This is the shape to aim for.",
          keyOkDigits: "Accepted. Digits and underscores are fine after the first character.",
          keyUpper: "Refused. Keys are lower case.",
          keyLeadingDigit: "Refused. A key must start with a letter.",
          keyHyphen: "Refused. Hyphens are not part of the grammar — use an underscore.",
          keySpace: "Refused. Spaces are not allowed.",
          keyWarnTitle: "The key is permanent",
          keyWarnContent:
            "Once the field is saved, the key cannot be changed by anybody, because answers already stored are addressed by it. If a key is wrong, the field has to be deleted and recreated — and deleting it destroys the answers already recorded against it. This is the single most common regret when defining a field in a hurry.",

          inlineTitle: "Adding a field from inside a record",
          inlineIntro:
            "You do not have to leave what you are doing to add a field. Every form that supports custom fields ends its Custom Fields section with an Add custom field link, gated behind the create permission.",
          i1Title: "Click Add custom field",
          i1Content:
            "The definition form opens in a side panel rather than a dialog on top of a dialog. The record form behind it stays visible and readable, and nothing you have already typed into it is lost.",
          i2Title: "Note the record type is fixed",
          i2Content:
            "The record type is shown as context rather than as a dropdown — it is whatever screen you are already on. Every other control behaves exactly as it does on the full screen, validator picker included.",
          i3Title: "Fill in and save",
          i3Content:
            "The panel closes and the new field appears immediately in the still-open record form, empty and ready to fill in.",
          i4Title: "Carry on with the record",
          i4Content:
            "Fill in the new field along with everything else and save the record once. The definition and the answer are two separate saves, in that order.",
          inlineInfoTitle: "If the link is not there",
          inlineInfoContent:
            "The Add custom field link only appears for somebody holding the create permission. Without it, the Custom Fields section still works normally for filling in existing fields — only the shortcut to defining a new one is absent. And on a record type with no custom fields defined yet, the Custom Fields section does not appear at all.",

          rejectTitle: "What gets rejected, and why",
          rejectIntro:
            "Every refusal at definition time carries a specific message. These are the ones you can actually hit from the form or from a request that bypasses it.",
          thSituation: "Situation",
          thWhatYouSee: "What you see",
          rejDuplicateKey: "A key that already exists for that record type",
          rejDuplicateKeyMsg:
            "Refused as already existing. Keys are unique per record type within a workspace — the same key on a different record type is fine.",
          rejUnknownEntityType: "A record type that is not registered",
          rejUnknownEntityTypeMsg:
            "Refused, naming the key: it is not a registered entity type. Only reachable by bypassing the dropdown.",
          rejNoOptions: "A Select or MultiSelect field with no options",
          rejNoOptionsMsg: "Refused: options are required for Select fields.",
          rejOptionsOnOther: "Options supplied for a type that does not take them",
          rejOptionsOnOtherMsg: "Refused: options are only allowed for Select fields.",
          rejValidatorNonText: "A validator attached to a non-Text field",
          rejValidatorNonTextMsg:
            "Refused, naming the type: a validator can only be attached to a Text field. The dropdown is not even shown for those types, so this is the server refusing the same thing a second time.",
          rejValidatorNoParam: "A parameterised validator with its setting left blank",
          rejValidatorNoParamMsg: "Refused, naming the validator: it requires a parameter.",
          rejValidatorExtraParam: "A setting supplied for a validator that takes none",
          rejValidatorExtraParamMsg: "Refused, naming the validator: it does not accept a parameter.",
          rejRequiredRestricted: "Marking a field required while a role or group restricts it",
          rejRequiredRestrictedMsg:
            "Refused, naming the field: it cannot be made required while it is restricted. Remove the restriction first, or leave the field optional.",
          rejGroupWrongType: "A field group belonging to a different record type",
          rejGroupWrongTypeMsg:
            "Refused: the selected field group belongs to a different entity type. Changing the record type on the form clears the group choice for exactly this reason.",
          rejGlobalNotSuperAdmin: "Creating a global field without being a platform Super Admin",
          rejGlobalNotSuperAdminMsg: "Refused: only a platform Super Admin can create a global custom field.",
          rejQuota: "Passing your plan's field limit",
          rejQuotaMsg:
            "Refused on quota. The Free edition allows zero fields; every other plan has its own maximum per workspace. Global platform fields do not count against it.",

          afterTitle: "After saving: what can still change",
          afterIntro:
            "Three things are permanent, and everything else is not. It is worth knowing which is which before you save rather than after.",
          editableTitle: "Editable at any time",
          editable1: "Both labels, and both placeholders",
          editable2: "Required — unless a role or user group restricts the field",
          editable3: "Sort Order, and the Field Group",
          editable4: "Sensitivity, and Include in exports",
          editable5: "Active, which retires the field without touching its stored answers",
          editable6: "The options list — though renaming an option changes what existing records display",
          editable7: "The validator and its setting — though this never re-checks answers already saved",
          permanentTitle: "Permanent once saved",
          permanent1: "The record type",
          permanent2: "The key",
          permanent3: "The value type",
          permanent4: "The scope — workspace or global",
          afterOutro:
            "There is no migration path for any of the four permanent settings. Getting one wrong means deleting the field and starting again, which destroys the answers already recorded against it.",

          verifyTitle: "Checking it worked",
          verifyIntro: "Four quick checks that catch almost every mistake.",
          verify1:
            "Open a record of that type. The Custom Fields section should show your new field, empty, with the label and placeholder you set.",
          verify2:
            "Type a value and save. No error means the value was accepted; reopen the record and confirm it is still there.",
          verify3:
            "Clear the value and save again. On an optional field this should succeed and leave the field genuinely empty, not showing the old value.",
          verify4:
            "Check the record list. Your field should be an extra column there too, showing the answer for every record at once.",
          verifyWarnTitle: "If the field does not appear",
          verifyWarnContent:
            "Check the record type first — a field defined against a record type marked API only has nowhere to render. Then check Active. Then check whether a role or user group restricts the field's key, because a restricted field is omitted entirely rather than shown blank, and looks exactly like a field that was never defined.",
        },

        // ═══════════════════════════════════════════════════
        //  Field Groups
        // ═══════════════════════════════════════════════════
        groups: {
          title: "Field Groups",
          description:
            "Gathering a record type's custom fields under headings you order by hand: creating a group, the permanent stable key, ordering, deleting, global groups, and what a group does not affect.",
          intro:
            "A field group gathers several of one record type's custom fields under a heading, in an order you set by hand. Without groups, custom fields simply appear in Sort Order under a single Custom Fields heading; with them, you can separate contact details from medical details from kit preferences on the same form. Groups are managed on the Field Groups screen, reached from a link in the Custom Fields page header.",
          permInfoTitle: "Field groups need their own permissions",
          permInfoContent:
            "The whole feature is gated on a separate set of permissions from field definitions, including a distinct one for reordering. A role that already holds every custom-fields permission does not automatically hold these. Without them there is no Manage field groups link and no Field Group picker on the definition form at all — nothing is broken, the feature simply is not granted. Editing a field that already has a group and saving keeps that group rather than clearing it.",

          whatTitle: "What a group is made of",
          whatIntro:
            "Groups belong to exactly one record type, so the screen shows nothing until you pick one — and the empty state says so rather than looking broken.",
          thPart: "Setting",
          thWhat: "What it is",
          thChange: "Changeable later?",
          partEntityType: "The record type whose fields this group can gather.",
          partStableKey:
            "A machine name for the group, unique within the record type. Lower case, starts with a letter, letters, digits and underscores only.",
          partLabelEn: "The English heading shown above the group's fields.",
          partLabelAr: "The Arabic heading.",
          partSortOrder: "Where the group sits relative to the record type's other groups.",
          partScope: "Whether the group belongs to your workspace or to the whole platform.",
          changeNever: "No — permanent once saved",
          changeAnytime: "Yes, at any time",

          createTitle: "Creating a group",
          createIntro: "Four steps, on the Field Groups screen.",
          c1Title: "Pick the record type",
          c1Content:
            "Nothing is listed before you do. A group is only ever valid for one record type, so there is no all-record-types view to start from.",
          c2Title: "Give it a stable key",
          c2Content:
            "The form requires one. It lowercases as you type and refuses characters outside the grammar. Choose carefully — this one is permanent.",
          c3Title: "Give it labels and an order",
          c3Content:
            "An English heading, an Arabic heading, and a number deciding where the group sits among the record type's other groups.",
          c4Title: "Save, then assign fields to it",
          c4Content:
            "The group appears in the list. Open any custom field definition for the same record type and a Field Group picker now offers it, alongside a no group entry.",

          stableKeyTitle: "The stable key",
          stableKeyIntro:
            "The stable key is the group's machine name. It follows the same grammar as a field key — lower case, starting with a letter, letters, digits and underscores — and it must be unique among that record type's groups.",
          thKeyExample: "Stable key",
          thOutcome: "What happens",
          skOk: "Accepted.",
          skLowercased: "Accepted, and lowercased as you type. You will see it become contact_details.",
          skHyphen: "Refused as you type. The input rejects characters outside the grammar.",
          skLeadingDigit: "Refused. A stable key must start with a letter.",
          skDuplicate:
            "Refused, naming the key: a field group with that key already exists for this record type.",
          exSkDuplicate: "A key already used by another group on the same record type",
          stableKeyWhy:
            "Once the group is saved, the stable key is visible but greyed out and cannot be changed by anybody. That is deliberate rather than an oversight: exported schema names a group by this key, so renaming it would silently turn a future re-import from an update into a create, against a bundle that has already shipped. Being able to see the key still matters — you need it to match an exported bundle to the group it refers to — which is why it is shown rather than hidden.",
          stableKeyWarnTitle: "There is no rename",
          stableKeyWarnContent:
            "If a stable key is wrong, the group has to be deleted and recreated, and every field assigned to it has to be reassigned. Do not expect an edit button to appear — its absence is the design.",

          assignTitle: "Assigning a field to a group",
          assignIntro:
            "Assignment happens on the field, not on the group. There is no drag-fields-into-a-group screen.",
          assign1:
            "Open a custom field definition for the same record type. A Field Group picker offers every group on that record type, plus a no group entry.",
          assign2:
            "Choosing no group is the only way to ungroup a field. There is no separate unset control anywhere else.",
          assign3:
            "Changing the record type on a create form clears any group already chosen, because a group from one record type is never valid for another.",
          assign4:
            "A field can belong to at most one group. There is no way to show one field under two headings.",

          orderTitle: "Ordering groups",
          orderIntro:
            "Groups are ordered on the Field Groups screen, by dragging a row or by using its Move up and Move down buttons. Both do the same thing and both persist.",
          orderKeyboard:
            "The buttons are not a convenience feature. A keyboard-only user has no drag gesture, so the buttons are the accessible path and are expected to work identically — if a row moves by dragging but not by button, that is a defect.",
          orderLimitTitle: "Reordering stops working past 100 groups",
          orderLimitContent:
            "A reorder request carries the whole reorderable set at once, and more than 100 groups for a single record type is refused outright. Past that point no group on that record type can be moved at all. The screen says so rather than failing generically, but the ceiling is real and is not configurable.",
          orderGlobalTitle: "You cannot position your group relative to a global one",
          orderGlobalContent:
            "Reordering is all or nothing and refuses any group the caller does not own, so a workspace's reorder covers only its own groups, which are then renumbered from zero. Those numbers can collide with a global group's own order, and the tie is broken on the English label. The visible effect is that moving your group to the top can land it below a global group and look as though nothing happened.",

          deleteTitle: "Deleting a group",
          deleteIntro:
            "Deleting a group never deletes fields. The confirmation says so explicitly, and afterwards the fields still exist and are simply ungrouped, appearing under the default Custom Fields heading again.",
          deleteEditing:
            "One edge worth knowing: if you start editing a group and then delete that same group from its row while the edit panel is still open, the panel closes and no new group is created. Saving at that point does not resurrect the group under a new identity.",

          globalTitle: "Global groups",
          globalIntro:
            "A platform administrator with no workspace selected creates a global group, and a notice on the screen explains that. The scope switch appears on create and never on edit, because a group's scope is permanent in the same way a field's is.",
          globalTenantView:
            "Inside a workspace, a global group shows a Global badge and offers no edit, delete or move controls at all. That is not the interface hiding something arbitrarily — the server would refuse those operations, so the controls are not offered.",

          effectTitle: "What a group does and does not affect",
          doesTitle: "A group does",
          does1: "Put related fields together under one heading on the record form",
          does2: "Let you order groups by hand, by dragging or with Move up and Move down",
          does3: "Carry its own English and Arabic heading, translated like everything else",
          does4: "Survive a field being deleted, and let a field leave it via the no group entry",
          doesNotTitle: "A group does not",
          doesNot1: "Control who can see a field — that is field-level security, which is unrelated",
          doesNot2: "Delete its fields when the group itself is deleted",
          doesNot3: "Carry across record types, or apply to more than one record type at once",
          doesNot4: "Change how a value is validated, stored, exported or displayed",

          errorsTitle: "Group errors you may see",
          thSituation: "Situation",
          thWhatYouSee: "What you see",
          errDuplicateKey: "A stable key already used on that record type",
          errDuplicateKeyMsg: "Refused, naming the key: a field group with that key already exists for this entity type.",
          errWrongEntityType: "Assigning a field to a group from another record type",
          errWrongEntityTypeMsg: "Refused: the selected field group belongs to a different entity type.",
          errTooManyReorder: "Reordering more than 100 groups at once",
          errTooManyReorderMsg: "Refused, naming the maximum: more than that many groups cannot be reordered in one request.",
          errDuplicateReorder: "The same group listed twice in one reorder",
          errDuplicateReorderMsg: "Refused: the same field group appears more than once in the reorder list.",
          errMixedReorder: "Groups from two record types in one reorder",
          errMixedReorderMsg: "Refused: all field groups in one reorder request must belong to the same entity type.",
          errGlobalNotSuperAdmin: "Creating a global group without being a platform Super Admin",
          errGlobalNotSuperAdminMsg: "Refused: only a platform Super Admin can create a global field group.",
          errNoDefinition: "Assigning a group to a field with no definition record yet",
          errNoDefinitionMsg:
            "Refused, explaining that the field has no definition record and that the definitions backfill has to be run first. This only happens in an environment upgraded from an older version.",
        },

        // ═══════════════════════════════════════════════════
        //  Options
        // ═══════════════════════════════════════════════════
        options: {
          title: "Options",
          description:
            "Writing the allowed answers for Select and MultiSelect fields: the bilingual option editor, how a submitted value is matched, and what adding, renaming or removing an option does to records that already exist.",
          intro:
            "A Select or MultiSelect field carries its own list of allowed answers. The list belongs to the field — there is no shared list reused across several fields — and it is written on the definition form, in the Options box that appears as soon as you choose either of those two value types. Both types use exactly the same list and the same editor; the only difference is that a MultiSelect answer can hold several entries from it at once.",
          storedInfoTitle: "The English option text is the stored answer",
          storedInfoContent:
            "There is no separate hidden code behind an option. The English label you type is literally what gets written onto every record that chooses it, and it is what the product compares a submitted value against. The Arabic label is for display only. This one fact explains every behaviour on this page.",

          editorTitle: "The options editor",
          editorIntro:
            "Options are edited as a list of rows rather than as free text. Each row is one option.",
          editor1: "Add option adds a row at the end of the list.",
          editor2: "Each row takes an English label and an Arabic label.",
          editor3: "Remove option deletes a row.",
          editor4:
            "Row order is the order the options are offered in on the record form, top to bottom.",
          editor5:
            "An empty list shows a prompt to add the first option — a Select field with no options cannot be saved.",
          editorBilingual:
            "The two labels are stored as two parallel lists, matched up row by row. An Arabic reader sees the Arabic label; the answer written onto the record is the English one either way. Leaving an Arabic label blank is allowed, and that option then shows its English label to everybody.",

          exampleTitle: "A worked example",
          exampleIntro:
            "A shirt-size field on a Select type, with three options. The right-hand column is what actually lands on a record.",
          thEnglish: "English label",
          thArabic: "Arabic label",
          thStored: "Stored on the record",
          exampleOutro:
            "An Arabic-reading user picking متوسط stores Medium, exactly as an English-reading user picking Medium does. Both see their own language on the way in and on the way out; the data underneath is one consistent value.",

          matchTitle: "How a submitted value is matched",
          matchIntro:
            "The submitted value is trimmed, then compared against the English labels exactly. The comparison is case-sensitive. Using the three options above:",
          thSubmitted: "Submitted value",
          thOutcome: "What happens",
          matchOk: "Accepted, and stored as Medium.",
          matchTrimmed:
            "Accepted. Both sides are trimmed before comparison, so surrounding spaces never cause a spurious rejection.",
          matchCase:
            "Refused: VALIDATION_INVALID_FORMAT. Case matters — which also means Medium and medium can legitimately coexist as two separate options if you really want them to.",
          matchArabic:
            "Refused if submitted directly to the API: only the English labels are matched. Choosing متوسط in the interface works normally, because the interface submits the English label behind it.",
          matchUnknown:
            "Refused: VALIDATION_INVALID_FORMAT, with a message quoting both the rejected value and the field's key.",
          matchBlank:
            "Treated as empty: stored as cleared on an optional field, refused with VALIDATION_REQUIRED on a required one.",
          exPadded: "\" Medium\" with a leading space",
          exBlank: "A blank value",

          multiTitle: "MultiSelect specifics",
          multiIntro:
            "MultiSelect reuses this same list and this same editor. What differs is the value: several answers at once, in the order they were picked, up to a hard ceiling of 19.",
          multiOrder:
            "Accepted, and read back as Blue then Red — the order picked, not the order the options were listed in.",
          multiRemove:
            "Accepted. Removing one selection leaves the others in their existing relative order.",
          multiTooMany:
            "Refused: VALIDATION_MAX_LENGTH, naming the ceiling of 19. The picker makes every unselected option unpickable once you reach 19, and shows a live \"N of 19 selected\" counter, so this is normally unreachable from the interface.",
          multiDuplicate: "Refused: VALIDATION_UNIQUE. A repeated selection is rejected, not collapsed.",
          multiEmpty:
            "Treated as empty, exactly as a blank scalar is for every other type: cleared on an optional field, refused on a required one.",
          exMultiOrder: "Blue, then Red — on a field whose options list Red before Blue",
          exMultiRemove: "Removing one selection from three",
          exMultiTwenty: "A twentieth selection",
          exMultiRepeat: "The same option selected twice",
          exMultiEmptyList: "An explicitly empty list",
          multiOrderWarnTitle: "Selection order is not option order",
          multiOrderWarnContent:
            "Because a MultiSelect answer preserves the order it was picked in, a list column showing that answer is not guaranteed to read in the order you authored the options. That is what makes order round-trip faithfully, but it surprises most people the first time they notice it.",

          changingTitle: "Changing the list later",
          changingIntro:
            "The options list is editable at any time. Because the option text is the stored answer, some edits reach backwards into records that already exist and some do not.",
          thChange: "Edit",
          thEffect: "Effect on records that already exist",
          chgAdd: "Adding a new option",
          chgAddEffect: "None. Existing answers are untouched; the new option simply becomes available.",
          chgRename: "Renaming an English label",
          chgRenameEffect:
            "Every record already holding the old text now displays the new text. Nothing is migrated and nothing is lost, because the option row is what the record points at — but the answer people see has changed under them.",
          chgRemove: "Removing an option",
          chgRemoveEffect:
            "Records already holding it keep their stored answer and keep displaying it. The option is no longer offered to anybody new, and the next time somebody edits one of those records they will have to choose a different answer to save it.",
          chgReorder: "Reordering the rows",
          chgReorderEffect:
            "Changes the order the options are offered in. It does not change any stored answer, and it does not reorder an existing MultiSelect answer, which keeps the order it was picked in.",
          chgArabicOnly: "Changing only an Arabic label",
          chgArabicOnlyEffect:
            "Display only. The stored answer is the English label, so nothing about the data changes.",
          renameWarnTitle: "Rename with care, and prefer adding",
          renameWarnContent:
            "Renaming an option is the one edit that silently rewrites what history looks like: a record answered \"Medium\" last year will read as whatever you renamed Medium to. If the distinction matters to you, add a new option and stop offering the old one rather than renaming it.",

          errorsTitle: "Option errors you may see",
          thSituation: "Situation",
          thWhatYouSee: "What you see",
          errNoOptions: "Saving a Select or MultiSelect field with an empty list",
          errNoOptionsMsg: "Refused: options are required for Select fields.",
          errOptionsOnOther: "Options supplied on a type that does not take them",
          errOptionsOnOtherMsg: "Refused: options are only allowed for Select fields.",
          errNotAllowed: "A value that is not one of the options",
          errNotAllowedMsg:
            "Refused: VALIDATION_INVALID_FORMAT, quoting the value and the field's key.",
          errTooMany: "More than 19 MultiSelect selections",
          errTooManyMsg: "Refused: VALIDATION_MAX_LENGTH, naming the ceiling of 19.",
          errDuplicate: "The same MultiSelect option twice in one save",
          errDuplicateMsg: "Refused: VALIDATION_UNIQUE, quoting the repeated value.",

          notYetTitle: "What the options list does not do",
          notYetIntro: "Three things people reasonably ask for, and what the answer is today.",
          notYet1:
            "There is no way to reuse one list across several fields. A Countries list needed by three fields is written three times, and edited three times.",
          notYet2:
            "There is no colour, icon or code per option that you can set. The label is the whole option as far as the definition form is concerned.",
          notYet3:
            "There is no ceiling on how many options a list may hold, but a MultiSelect answer still cannot select more than 19 of them.",
        },

        // ═══════════════════════════════════════════════════
        //  Validators
        // ═══════════════════════════════════════════════════
        validators: {
          title: "Validators",
          description:
            "All 13 built-in format checks for Text fields, with accepted and rejected example inputs, the six that need a setting, the seven supported postal-code countries, and every rejection you can hit.",
          intro:
            "A validator is an optional extra format check you attach to a Text field at definition time, so a value in the wrong shape is refused the moment somebody tries to save it instead of quietly becoming bad data that surfaces months later. You pick one of 13 built-in checks from a dropdown, and seven of them need no further setting.",
          textOnlyTitle: "Validators are Text-only",
          textOnlyContent:
            "A validator can only ever be attached to a Text field. Not Number, not Date, not Select, not Email, not Url, not Phone, not LongText, not any of the others — the Validator dropdown is not even shown for them, and the server refuses the same thing again if a request bypasses the form. If you need an email address with extra constraints, the answer today is a Text field with a validator rather than an Email field.",

          whyClosedTitle: "Why there is no pattern box",
          whyClosedIntro:
            "There is deliberately no free-text or regular-expression entry anywhere in the product. A pattern written by hand can be made to consume enormous amounts of processing time on a short input, which turns a data-entry form into a way of taking the system down. The set of checks is therefore fixed and curated instead, and each one carries its own short length cap and its own time limit.",

          howTitle: "How a validator runs",
          howIntro: "Four things happen in this order every time a value is saved into the field.",
          how1: "If the value is empty or nothing but spaces, it is treated as empty and no validator runs at all.",
          how2: "The global 4,000-character Text cap runs, and refuses with VALIDATION_MAX_LENGTH if the value is longer.",
          how3:
            "The validator's own, much shorter length cap runs — 11 characters for a SWIFT code, 15 for an IMEI, and so on — and also refuses with VALIDATION_MAX_LENGTH.",
          how4: "Only then does the validator's actual check run, refusing with its own code and message.",
          howTwoPoints:
            "The check is enforced at two separate points, and it is worth knowing both exist. At definition time, an invalid validator or setting combination is refused when you save the definition. At value time, the validator runs again against every value somebody saves into the field.",

          fixedTitle: "The seven checks with no setting",
          fixedIntro:
            "These validate a specific external format and never take a parameter — supplying one is itself refused. Three of them verify a real check digit, which means a single mistyped digit is caught rather than only a wrong length.",
          thValidator: "Validator",
          thShape: "Shape",
          thMaxLength: "Max length",
          thChecksum: "Check digit",
          shapeIban: "Two letters, two digits, then 11 to 30 letters or digits",
          shapeImei: "Exactly 15 digits",
          shapeSwift: "Six letters, two letters or digits, optionally three more",
          shapePlate: "2 to 15 letters, digits, spaces or hyphens, either case",
          shapeEgypt: "14 digits: century marker, then a plausible YYMMDD, then seven more",
          shapeSaudi: "10 digits starting with 1 or 2",
          shapeEmirati: "784, four digits, seven digits, one digit — hyphens optional",
          checksumReal: "Yes — verified",
          checksumNone: "None in the standard",
          checksumUnpublished: "Not verified — none published",
          thExample: "Example input",
          thOutcome: "What happens",

          ibanTitle: "IBAN",
          ibanFor:
            "For an international bank account number. Use it wherever a wrong digit would send money to the wrong place.",
          ibanChecks:
            "The shape is checked first, then the real ISO check digits are verified. Capped at 34 characters — no live IBAN is longer. The value is matched exactly as submitted: it is not uppercased and spaces are not stripped for you.",
          ibanOk: "Accepted. Shape and check digits both hold.",
          ibanBadCheck:
            "Refused: VALIDATION_INVALID_FORMAT. The shape is perfectly valid and only the check digit is wrong — which is precisely the class of mistake a shape-only check would miss.",
          ibanLower: "Refused. The letters must be upper case.",
          ibanSpaces:
            "Refused. IBANs are often printed in groups of four for readability, but the stored form has no spaces in it.",

          imeiTitle: "IMEI",
          imeiFor: "For a mobile device's identity number, as printed on the device or its box.",
          imeiChecks:
            "Exactly 15 digits, then the real check digit is verified. Capped at 15 characters. The 16- and 17-character display variants some devices show are not accepted.",
          imeiOk: "Accepted.",
          imeiBadCheck:
            "Refused: VALIDATION_INVALID_FORMAT. Fifteen digits, right shape, wrong final digit.",
          imeiShort:
            "Refused: VALIDATION_INVALID_FORMAT. Fourteen digits fails the shape check — the length cap only ever catches a value longer than 15.",

          swiftBicTitle: "SWIFT / BIC Code",
          swiftBicFor: "For a bank identifier code, used alongside an account number for an international transfer.",
          swiftBicChecks:
            "Eight or eleven characters: six letters, then two letters or digits, then optionally three more letters or digits. Upper case only, no separators, capped at 11 characters. There is no check digit in the standard, so a well-formed code that belongs to no real bank is accepted.",
          swiftOk8: "Accepted — the eight-character form.",
          swiftOk11: "Accepted — the eleven-character form with a branch code.",
          swiftDigit: "Refused: VALIDATION_INVALID_FORMAT. The first six characters must all be letters.",
          swiftLower: "Refused. This is a fixed external format, and lower case is not part of it.",
          swiftLength: "Refused. Eight or eleven characters exactly — nine is neither.",

          plateTitle: "Vehicle Plate Number",
          plateFor:
            "For a vehicle registration plate, where you want to catch obvious nonsense without committing to any one country's format.",
          plateChecks:
            "2 to 15 characters, made up of letters, digits, spaces and hyphens in any combination. Case-insensitive. Deliberately permissive — there is no country-specific plate format anywhere in this check, because plate formats differ by country and by vehicle class within a country.",
          plateOk: "Accepted.",
          plateLowerOk: "Accepted. Unlike SWIFT, this check does not care about case.",
          plateTooShort: "Refused: VALIDATION_INVALID_FORMAT. The minimum is two characters.",
          plateBadChar: "Refused. A slash is not one of the four allowed character classes.",

          egyptIdTitle: "Egyptian National ID",
          egyptIdFor: "For an Egyptian national identity number.",
          egyptIdChecks:
            "Fourteen digits: a century marker of 2 or 3, then a date of birth as YYMMDD that has to be calendar-plausible, then seven more digits. Structure only — Egypt has never published a check-digit algorithm, so the last digit is not verified. Shipping a guessed algorithm would reject real, valid IDs, which is worse than not checking.",
          egyptOk: "Accepted.",
          egyptBadMonth: "Refused: VALIDATION_INVALID_FORMAT. Month 13 is not a plausible month.",
          egyptBadDay: "Refused. Day 32 is not a plausible day.",
          egyptBadCentury: "Refused. The century marker must be 2 or 3.",
          egyptLength: "Refused. Thirteen digits is not fourteen.",

          saudiIdTitle: "Saudi National ID",
          saudiIdFor: "For a Saudi national identity number or an Iqama (residency) number.",
          saudiIdChecks:
            "Ten digits, the first being 1 for a citizen or 2 for a resident, and the real check digit is verified. Capped at 10 characters.",
          saudiOk: "Accepted. Shape and check digit both hold.",
          saudiBadCheck: "Refused: VALIDATION_INVALID_FORMAT. Right shape, wrong check digit.",
          saudiBadPrefix: "Refused. The first digit must be 1 or 2.",
          saudiLength: "Refused. Nine digits is not ten.",

          emiratiIdTitle: "Emirati ID (UAE)",
          emiratiIdFor: "For an Emirates ID number.",
          emiratiIdChecks:
            "The 784-YYYY-XXXXXXX-C form, with the hyphens optional. Capped at 18 characters. Structure only — the UAE has never published a check-digit algorithm, so the final digit is not verified, for the same reason as the Egyptian check.",
          emiratiOk: "Accepted, hyphens and all.",
          emiratiNoHyphens: "Accepted. The hyphens are optional, so both written forms work.",
          emiratiBadPrefix: "Refused: VALIDATION_INVALID_FORMAT. Every Emirates ID starts with 784.",
          emiratiLength: "Refused. The middle block is seven digits, not six.",

          paramTitle: "The six checks that need a setting",
          paramIntro:
            "These require a Validator Parameter, and leaving it blank is refused at definition time — as is supplying one for a validator that takes none. The Validator Parameter control appears as soon as you pick one of these six.",
          thParamFormat: "Setting format",
          thParamExample: "Example setting",
          paramFmtPostal: "A country, chosen from a dropdown of the seven supported ones",
          paramFmtNumeric: "Two comma-separated bounds; either side may be blank for an open end",
          paramFmtLength: "Two comma-separated character counts; either side may be blank",
          paramFmtOneOf: "One allowed value per line",
          paramFmtContains: "Any literal text",
          paramFmtStartsWith: "Any literal text",
          paramExOneOf: "Goalkeeper / Defender / Midfielder / Forward, one per line",

          postalTitle: "Postal Code",
          postalFor:
            "For a postal code in a specific country. The country is part of the definition, not something the person filling in the record chooses.",
          postalChecks:
            "The value is matched against the real postal-code format of the country you configured. Capped at 16 characters. Seven countries are supported and the dropdown never offers any others.",
          postalEgOk: "Accepted. Egypt is five digits.",
          postalEgBad: "Refused: VALIDATION_INVALID_FORMAT. Four digits is not five.",
          postalUsOk: "Accepted. The five-digit and the ZIP+4 forms are both valid.",
          postalGbOk: "Accepted. The UK format is matched in either case, with or without its space.",
          postalCaOk: "Accepted, including the real letter exclusions Canada Post applies.",
          exPostalEg: "11511, with the setting EG",
          exPostalEgBad: "1151, with the setting EG",
          exPostalUsPlus4: "90210-1234, with the setting US",
          exPostalGb: "SW1A 1AA, with the setting GB",
          exPostalCa: "K1A 0B1, with the setting CA",

          numericRangeTitle: "Numeric Range",
          numericRangeFor:
            "For a number inside bounds you set, on a field that is Text rather than Number — a shirt number, a squad size, a jersey count.",
          numericRangeChecks:
            "The value must parse as a number and fall inside the range. The setting is two comma-separated bounds; leaving one side blank makes that end open, but leaving both blank is refused, because a range that accepts everything is the same as attaching no validator at all.",
          numericOk: "Accepted.",
          numericOut: "Refused: VALIDATION_RANGE.",
          numericNotANumber: "Refused: VALIDATION_RANGE. A value that is not a number cannot be inside a range.",
          numericOpenOk: "Accepted. An open upper bound means any number at or above the lower one.",
          numericBothBlank:
            "Refused at definition time, explaining that the validator needs at least one bound.",
          exNumeric50: "50, with the setting 1,100",
          exNumeric150: "150, with the setting 1,100",
          exNumericText: "\"fifty\", with the setting 1,100",
          exNumericOpen: "5000, with the setting 1,",
          exNumericBothBlank: "The setting , with both sides blank",

          lengthRangeTitle: "Length Range",
          lengthRangeFor:
            "For text that has to be a certain length — a two-letter code, a reference of at least eight characters.",
          lengthRangeChecks:
            "The number of characters must fall inside the range. The setting is two comma-separated character counts, and either side may be left blank for an open end. This check produces two distinct codes rather than one, so you can tell too short from too long.",
          lengthOk: "Accepted.",
          lengthTooShort: "Refused: VALIDATION_MIN_LENGTH, naming the minimum.",
          lengthTooLong: "Refused: VALIDATION_MAX_LENGTH, naming the maximum.",
          exLength10: "\"Alexandria\" — 10 characters, with the setting 2,50",
          exLength1: "\"A\" — 1 character, with the setting 2,50",
          exLength80: "An 80-character value, with the setting 2,50",

          oneOfListTitle: "One of a List",
          oneOfListFor:
            "For a closed set of answers on a Text field. If the closed set is the whole point of the field, a Select field is usually the better choice — but this exists for the case where you want a validator's behaviour on a Text field.",
          oneOfListChecks:
            "The value must exactly match one line of the list you configured, one value per line. Matching is case-sensitive.",
          oneOfOk: "Accepted.",
          oneOfCase: "Refused: VALIDATION_INVALID_FORMAT. The match is case-sensitive.",
          oneOfUnknown: "Refused: VALIDATION_INVALID_FORMAT. The value is not on the list.",

          containsTitle: "Contains Text",
          containsFor:
            "For a value that must include a marker somewhere in it — a club prefix, a season tag, a department code.",
          containsChecks: "The value must contain the literal text you configured, matched case-sensitively.",
          containsOk: "Accepted, with the setting FC-.",
          containsCase: "Refused: VALIDATION_INVALID_FORMAT. The match respects case.",
          containsMissing: "Refused: VALIDATION_INVALID_FORMAT. The marker is not present.",

          startsWithTitle: "Starts With Text",
          startsWithFor:
            "For a value that must begin with a prefix — a country code, a branch code, a fixed reference stem.",
          startsWithChecks: "The value must begin with the literal text you configured, matched case-sensitively.",
          startsOk: "Accepted, with the setting EG-.",
          startsWrongPlace:
            "Refused: VALIDATION_INVALID_FORMAT. The text is present but not at the start — use Contains Text if position does not matter.",
          startsCase: "Refused: VALIDATION_INVALID_FORMAT. The match respects case.",

          postalCountriesTitle: "The seven Postal Code countries",
          postalCountriesIntro:
            "Postal Code ships real, cited formats for exactly seven countries, and the setting is a dropdown rather than free text, so no other country can be chosen from the form.",
          thCountry: "Country",
          thFormat: "Format",
          thValidExample: "Valid example",
          fmtEg: "Exactly five digits",
          fmtSa: "Five digits, optionally a hyphen and a four-digit extension",
          fmtUs: "A five-digit ZIP, optionally a hyphen and a four-digit extension",
          fmtGb: "The standard UK postcode shape, either case, space optional",
          fmtDe: "Exactly five digits, leading zero allowed",
          fmtFr: "Exactly five digits",
          fmtCa: "The A1A 1A1 shape, with Canada Post's real letter exclusions applied",
          uaeTitle: "The United Arab Emirates is deliberately absent",
          uaeContent:
            "The UAE has no national postal-code system, so there is no real format to check a value against — strict or loose. It is not a missing entry waiting to be added: attempting to use it is refused at definition time with its own explanatory message, distinct from the generic unsupported-country message you would get for a typo, telling you to leave the field without a validator instead. The dropdown never offers it.",

          attachTitle: "Rejections when attaching a validator",
          attachIntro:
            "These all happen at definition time, before any value is ever saved. Several are only reachable from a request that bypasses the form, because the form does not offer the invalid combination in the first place.",
          thSituation: "Situation",
          thWhatYouSee: "What you see",
          attNonText: "A validator on a field that is not Text",
          attNonTextMsg:
            "Refused, naming the value type: a validator can only be attached to a Text field.",
          attNoParam: "A parameterised validator with a blank setting",
          attNoParamMsg: "Refused, naming the validator: it requires a parameter.",
          attExtraParam: "A setting on one of the seven that take none",
          attExtraParamMsg: "Refused, naming the validator: it does not accept a parameter.",
          attBadRange: "A malformed range setting",
          attBadRangeMsg:
            "Refused, explaining that two comma-separated bounds are needed, that either side may be blank, and that the lower bound must not exceed the upper one.",
          attNoBound: "A range setting with both sides blank",
          attNoBoundMsg:
            "Refused, explaining that a parameter with both sides blank would accept every value, which is the same as attaching no validator at all.",
          attUnsupportedCountry: "A Postal Code country that is not one of the seven",
          attUnsupportedCountryMsg:
            "Refused, naming the country and listing the seven supported ones: EG, SA, US, GB, DE, FR, CA.",
          attUae: "Postal Code with AE",
          attUaeMsg:
            "Refused with its own dedicated message, explaining that the UAE has no national postal-code system and that the field should be left without a validator instead.",

          codesTitle: "Validator error codes",
          codesIntro:
            "Every validator rejection is an HTTP 422, never a 500. If a validator failure ever produces a 500, that is a defect worth reporting — each one is written to refuse cleanly.",
          thCode: "Code",
          thWhenItFires: "When it fires",
          codeInvalidFormat:
            "Most validator failures: a shape that does not match, a check digit that does not verify, a value that is not on a One of a List list, a Contains or Starts With marker that is absent, or a postal code that does not match its country.",
          codeRange: "Numeric Range — the value is outside the bounds, or is not a number at all.",
          codeMaxLength:
            "The global 4,000-character Text cap, a validator's own shorter cap, or Length Range's upper bound.",
          codeMinLength: "Length Range's lower bound.",
          codeRequired:
            "The field is Required and the value is empty. This fires before any validator runs, so a whitespace-only value on a required field gets the generic required message rather than a validator-specific one.",
          codesInfoTitle: "Messages name the key, not the label",
          codesInfoContent:
            "A validator message quotes the field's machine key — \"'shirt_size' is not a valid IBAN.\" — rather than its display label. Match on the key when you are tracing a failure.",

          limitsTitle: "What validators do not do",
          limit1:
            "They only ever attach to a Text field. There is no way to put a format check on any of the other sixteen types.",
          limit2:
            "They never re-check values that were already saved. Attaching a validator to a field that holds answers leaves those answers exactly as they are, including ones that would now fail, until somebody re-enters and saves them.",
          limit3:
            "They never run on an empty value. On a field that is not Required, a value of nothing but spaces is stored as cleared with no validator error at all — mark the field Required if a blank answer should be refused.",
          limit4:
            "They cannot be searched or filtered for. There is no view of every field using IBAN; the only way to see which validator a field has is to open that field.",
          limit5:
            "They have no browsable reference inside the product. To see the list of validators you open a Text field's definition form and read the dropdown.",
          limit6:
            "They cannot be written by hand. There is no regular-expression or pattern entry anywhere, by design, and the 13 built-in checks are the complete set.",
        },

        // ═══════════════════════════════════════════════════
        //  Field-Level Security
        // ═══════════════════════════════════════════════════
        security: {
          title: "Field-Level Security",
          description:
            "Hiding a specific custom field from the people holding a role or user group: how it is configured, what they see, why their saves do not destroy hidden values, and why required and restricted cannot be combined.",
          intro:
            "Field-level security lets you hide a named field from the people holding a particular role or user group. It applies to custom fields exactly as it does to a screen's built-in fields — a field an administrator has deliberately restricted is not readable through the custom-field API either. This is the mechanism to reach for when a value genuinely must not be seen.",
          notSensitivityTitle: "This is not the Sensitivity setting",
          notSensitivityContent:
            "A field definition's Sensitivity setting — Unclassified, Internal, Confidential, Restricted — is a label for reporting and export handling. It does not restrict access to anything, and the two mechanisms are entirely unconnected. If you want a field hidden, configure it here, on the role or user group, not on the field definition.",

          whereTitle: "Where restrictions are configured",
          whereIntro:
            "Restrictions are set on the thing that grants access, not on the field. There are two places, and they add together.",
          where1:
            "Per role: the restricted-fields list on a permission, in that role's permission dialog.",
          where2: "Per user group: the group's own restrictions.",
          whereKeyed:
            "Field names are typed by hand, and they are keyed by the permission resource that already guards the record — employees, party-people — rather than by record type. The details below are worth reading once before you configure anything.",
          thAspect: "Aspect",
          thBehaviour: "Behaviour",
          aspSources: "Two sources",
          behSources:
            "A role restriction and a group restriction union together. A group can never widen what a role has restricted, and there is no override in either direction.",
          aspCase: "Case",
          behCase: "Matching ignores case, so Salary, salary and SALARY are the same field.",
          aspResource: "Keying",
          behResource:
            "Restrictions are keyed by permission resource, the same resource that guards the record itself — not by entity type and not by field group.",
          aspBuiltIn: "Scope of the mechanism",
          behBuiltIn:
            "The same mechanism covers a screen's built-in fields and its custom fields. One restricted-fields list, one behaviour.",
          aspExempt: "Exemption",
          behExempt:
            "The platform system administrator is always exempt and always sees every field. That is the same exemption the built-in mechanism already makes.",

          seesTitle: "What a restricted person sees",
          seesIntro:
            "Nothing at all. The field is not greyed out, not blank, not marked as hidden — the entry is omitted from the record form and from the record list entirely.",
          seesIndistinguishable:
            "An omitted field is indistinguishable from a field that was never defined. That is deliberate: showing a placeholder would tell somebody there is a value they are not allowed to see, which is itself information. It also means a colleague reporting that a field is missing may be describing a restriction rather than a fault — check the role and group restrictions before you go looking for a defect.",

          savingTitle: "Saving around a hidden field",
          savingIntro:
            "This is the part worth understanding properly, because the obvious implementation would destroy data. When somebody saves a record, the save replaces the whole set of custom-field values at once — so a field absent from the request would normally mean \"clear it\".",
          savingWhy:
            "A restricted field is absent for a completely different reason: the person was never sent it. The product tells those two cases apart, and leaves a restricted field's stored value exactly as it was. Somebody who cannot see a value can no longer erase it by editing the record around it.",
          savingInfoTitle: "The practical consequence",
          savingInfoContent:
            "You can safely give somebody edit access to a record while restricting one sensitive field on it. Their ordinary edits go through, and the value they cannot see survives untouched.",

          writingTitle: "Writing a restricted field on purpose",
          writingIntro:
            "An attempt to write a restricted field explicitly is refused outright, and nothing else in the same save is applied either. Rejecting the whole request rather than quietly dropping the one field is deliberate: a save reported as successful but silently missing a field is the harder failure to notice.",
          writingProbe:
            "The refusal also fires when the submitted value happens to equal the stored one, so nobody can work out a hidden value by testing which submissions are accepted.",
          thAttempt: "Attempt",
          thResult: "Result",
          attSaveOthers: "Saving the record, changing only fields you can see",
          resSaveOthers:
            "Succeeds. The restricted field's stored value is left exactly as it was, not cleared.",
          attWriteRestricted: "Sending a value for the restricted field",
          resWriteRestricted:
            "Refused with a message naming the field, and the record is not saved at all — not even the fields you were allowed to change.",
          attWriteSameValue: "Sending the restricted field's current value",
          resWriteSameValue:
            "Refused the same way. The result does not depend on whether your guess was right, so it cannot be used to probe the value.",
          attReadApi: "Reading the record's custom-field values directly",
          resReadApi:
            "The restricted field is absent from the response. This was the gap that field-level security used to leave open for custom fields specifically, and it is closed.",

          requiredTitle: "Required and restricted cannot be combined",
          requiredIntro:
            "A required field can never be filled in by somebody who is not allowed to see it — they would be unable to save the record at all. The product therefore refuses the combination, in whichever order you attempt it.",
          thSituation: "Attempt",
          thWhatYouSee: "What you see",
          reqRestrictRequired: "Restricting a field that is currently required",
          reqRestrictRequiredMsg: "Refused, naming the field.",
          reqRequireRestricted: "Marking a field required while a role or group restricts it",
          reqRequireRestrictedMsg:
            "Refused, naming the field and telling you to remove the restriction first or leave the field optional.",
          requiredInfoTitle: "Order does not help",
          requiredInfoContent:
            "Doing the two operations in the other order does not get around the rule. Both directions are checked, so there is no sequence that leaves a field both required and restricted.",

          reachTitle: "Where else a restriction reaches",
          reachIntro:
            "A restriction is not only a form-level thing. It applies consistently everywhere the field's values could otherwise surface.",
          reach1: "The record form: the field is omitted.",
          reach2: "The record list: the column is omitted.",
          reach3:
            "The custom-field value API: the field is absent from the response, and refused on write.",
          reach4:
            "The definitions spreadsheet export: restricted columns are absent from the file rather than present and blank.",

          exampleTitle: "A worked example",
          exampleIntro:
            "Restricting a salary field on a staff record, and confirming it behaves.",
          e1Title: "Define the field and give it a value",
          e1Content:
            "As an administrator who can see everything, define a custom field with the key salary on the staff record type, and set a value on one record.",
          e2Title: "Restrict it on a role",
          e2Content:
            "Add salary to the restricted-fields list on the relevant permission in a role, then sign in as somebody holding only that role.",
          e3Title: "Confirm it is absent, not blank",
          e3Content:
            "Open the same staff record. The Salary field should not be on the form at all, and there should be no Salary column in the staff list. If you see it empty rather than missing, the restriction is not applied.",
          e4Title: "Save the record and check the value survived",
          e4Content:
            "As that restricted user, change something else on the record and save. Then, as the unrestricted administrator, reopen the record and confirm the salary is still there. This is the case that would destroy data in a naive implementation.",
          e5Title: "Confirm the two rules that protect the configuration",
          e5Content:
            "Try to mark salary required while the restriction is in place — refused. Remove the restriction, mark it required, then try to restrict it again — also refused. Finally, put the same key in a user group's restrictions instead of a role's and confirm it behaves identically.",
          proofTitle: "One honest caveat about verification",
          proofContent:
            "Every authorisation behaviour described on this page is enforced by real, unit-tested guards, but there is currently no end-to-end automated test proving it through the full HTTP stack. That makes manual verification genuinely informative here rather than redundant — if you are commissioning a workspace where a field must not be seen, check it by hand once.",
        },

        // ═══════════════════════════════════════════════════
        //  Managing Fields
        // ═══════════════════════════════════════════════════
        managing: {
          title: "Managing Fields",
          description:
            "Editing and retiring definitions, the change-history dialog, the usage and impact report, deleting without destroying data, the 18-column spreadsheet export, and the two read-only reference screens.",
          intro:
            "Once fields exist, the Custom Fields screen is where they are looked after: edited, retired, audited, measured and exported. This page covers each of those, and the two read-only reference screens that answer \"what types exist\" and \"what record types can I attach to\".",

          rowMenuTitle: "The row menu",
          rowMenuIntro:
            "Every field in the list has a row menu with four actions. Each needs its own permission, so a role may see some and not others.",
          thAction: "Action",
          thDoes: "What it does",
          thNeeds: "Permission",
          actEdit: "Opens the definition form, populated from the field's full detail.",
          actHistory:
            "Lists every recorded change to the field's definition, newest first, with who and when.",
          actUsage:
            "Reports how many answers the field holds, broken down by record type, and whether deleting it would destroy data.",
          actDelete:
            "Deletes the definition — refused first if it holds answers, until you confirm explicitly.",

          editTitle: "Editing a definition",
          editIntro:
            "Editing opens the same form as creating, with the permanent settings shown but not editable: record type, key, value type and scope. Everything else can be changed, and the changes take effect on the next form somebody opens.",
          editLoadFailure:
            "If the detail behind the Edit button fails to load, the form deliberately does not open, and you get a message instead. That is a safeguard rather than an inconvenience: the list row does not carry the options, the placeholders or the validator, so opening a form populated from it and saving would silently erase all three.",
          editWarnTitle: "Two edits reach backwards",
          editWarnContent:
            "Renaming an option changes what every existing record displays, because the option text is the stored answer. Attaching or changing a validator does not re-check answers already saved, so a field can hold values that its own current validator would refuse. Both are covered in detail on the Options and Validators pages.",

          retireTitle: "Retiring a field: deactivate or delete",
          retireIntro:
            "These are not the same operation and the difference matters. If you are unsure, deactivate — it is the reversible one.",
          deactivateTitle: "Turning Active off",
          deactivate1: "The field stops being offered on create and edit forms",
          deactivate2: "Every answer already stored is kept, untouched",
          deactivate3: "It is reversible — turning Active back on restores the field as it was",
          deactivate4: "It is recorded in history as Deactivated, and can be Reactivated later",
          deleteColTitle: "Deleting the definition",
          deleteCol1: "Refused on the first attempt if the field holds any answers",
          deleteCol2: "Destroys those answers once the retention window passes, if you confirm",
          deleteCol3: "Frees the key, so a new field could later reuse it — with none of the old answers",
          deleteCol4: "Is recorded in history as Deleted, and may be Restored while it is recoverable",

          historyTitle: "Definition history",
          historyIntro:
            "The History entry in a field's row menu opens a dialog listing what has happened to that field's definition, newest first, with the person who did it and when. A change made by the system rather than a person is attributed to the system. Entries are paged, and the dialog says how many changes there are in total.",
          thEvent: "Event",
          thMeans: "What it means",
          evCreated: "The field was defined.",
          evUpdated: "Something on the definition changed — a label, a flag, the validator, the options.",
          evDeactivated: "Active was turned off, retiring the field without touching its answers.",
          evReactivated: "Active was turned back on.",
          evDeleted: "The definition was deleted and is still recoverable.",
          evRestored: "A deleted definition was brought back.",
          evPurged:
            "The definition was permanently removed and is no longer recoverable. The dialog marks this one explicitly so it cannot be read as an ordinary delete.",
          historyParts:
            "Each entry also says which part of the field it concerns, because a field is more than a single row.",
          thPart: "Part",
          partField: "The field itself.",
          partDefinition: "The definition record behind it.",
          partVersion: "A version of the definition.",
          partOption: "One entry in the field's options list.",
          partVisibilityRule:
            "A conditional show-or-hide rule attached to the field. There is no screen for creating one, so in practice most workspaces will never see an entry of this kind.",
          historyScopeTitle: "History covers the definition, never the answers",
          historyScopeContent:
            "This dialog will not tell you who changed a particular person's nationality, and it is not meant to. Listing value changes here would turn it into a readable copy of everybody's field data, going around field-level security and every other visibility rule at once. Only definition-side changes are eligible, and the value-bearing records are excluded by name rather than by omission.",
          historyUnavailableTitle: "If history says the module is unavailable",
          historyUnavailableContent:
            "That is a deployment shape rather than a fault in the field: the audit store lives in another module, and this deployment is running without it. No history was recorded for that period either. It is one for whoever administers the deployment, not something you can fix from the screen. History on a global platform field is separately restricted to platform administrators, and shows a different message.",

          usageTitle: "Usage and impact",
          usageIntro:
            "The Usage & impact entry in the row menu reports what the field is actually carrying before you change or remove it. Read the whole dialog rather than one number.",
          thReading: "What it shows",
          readStoredValues: "Stored values",
          readStoredValuesMeans: "How many answers exist for this field.",
          readLegacyValues: "Values in the legacy store",
          readLegacyValuesMeans:
            "Answers still held in the older storage from before the current value store. Counted separately so a migration in progress is visible rather than hidden.",
          readOptions: "Options",
          readOptionsMeans: "How many options the field's list holds, for a Select or MultiSelect field.",
          readByRecordType: "By record type",
          readByRecordTypeMeans:
            "The same answer count split by the kind of record holding it, so you can see where the data actually is.",
          readAffectedOrgs: "Organisations holding values",
          readAffectedOrgsMeans:
            "For a global platform field, how many workspaces hold answers for it. This is the number that makes a delete genuinely consequential.",
          readScopeNotice: "The scope notice at the top",
          readScopeNoticeMeans:
            "Says whether the counts below cover your workspace only or every workspace on the platform. The two differ by orders of magnitude for an inherited field, and nothing about a bare number tells you which one you are looking at.",
          usageWarnTitle: "Read the warning, not the number",
          usageWarnContent:
            "The \"this will destroy data\" line comes from the server's own verdict, never from the count on screen. A global platform field is measured across every workspace that inherited it, so it can show zero in your own workspace and still warn you — correctly. The warning is the thing to trust.",

          deleteTitle: "Deleting without destroying data",
          deleteIntro:
            "Deleting a field that holds answers takes two deliberate steps. A field with no answers takes one.",
          d1Title: "Open Usage & impact first",
          d1Content:
            "See how many answers exist and where they are. If the number surprises you, stop here — deactivating the field is almost always the better move.",
          d2Title: "Choose Delete",
          d2Content:
            "If the field holds answers, the delete is refused with a conflict and the dialog explains exactly what would be lost, naming the number of stored values and the number of record types.",
          d3Title: "Confirm the destructive delete",
          d3Content:
            "Confirming from inside that dialog is what actually proceeds. This is a separate, explicit act rather than a second click on the same button, so a field with data cannot be removed by momentum.",
          d4Title: "Or delete an empty field in one step",
          d4Content:
            "A field with no answers deletes with no warning and no extra step, because there is nothing to lose.",
          deleteRetention:
            "A confirmed delete destroys the stored answers once the retention window passes, not instantly. Until then the definition may still be Restored, and history records both the delete and the restore. After the window, the answers are gone and the history entry reads as Purged.",

          exportTitle: "Exporting definitions to a spreadsheet",
          exportIntro:
            "The Export action in the Custom Fields page header downloads a spreadsheet of the definitions you can see, one row per field with headers on the first row. These are the 18 columns.",
          thColumn: "Column",
          thContains: "Contains",
          colEntityType: "The record type the field is defined against.",
          colKey: "The field's machine key.",
          colLabelEn: "The English label.",
          colLabelAr: "The Arabic label, blank if none was set.",
          colValueType: "One of the seventeen value types.",
          colRequired: "Whether the field is required.",
          colActive: "Whether the field is still offered on forms.",
          colSortOrder: "The field's position among the record type's custom fields.",
          colOptionsEn: "The English options, for a Select or MultiSelect field.",
          colOptionsAr: "The Arabic options, aligned with the English ones.",
          colSensitivity: "The classification label set on the definition.",
          colExportable:
            "The Include in exports setting, reported as Yes or No. It is never used to filter this file — a definitions export that dropped rows would hide exactly the fields an administrator most needs to audit.",
          colValidator: "The attached validator, for a Text field.",
          colValidatorParam: "The validator's setting, where it takes one.",
          colPlaceholderEn: "The English placeholder hint.",
          colPlaceholderAr: "The Arabic placeholder hint.",
          colScope: "Platform for a global field, Organisation for a workspace one.",
          colCreated: "When the definition was created, in UTC.",
          exportBooleans:
            "Yes/no columns are written as the words Yes and No rather than as spreadsheet booleans, so they survive being opened in a different language and still read as intended.",
          exportSafetyTitle: "Labels that look like formulas stay text",
          exportSafetyContent:
            "Every cell is written as inert text, never as a formula. A field labelled =SUM(A1) arrives in the file as the literal characters, not as a calculation — and the same holds for a label beginning with +, -, @, or a tab followed by =. This is categorical rather than a filter of known cases.",
          exportLimitTitle: "Two limits on the export",
          exportLimitContent:
            "It contains definitions and never anybody's answers — there is no values export anywhere in the product. And past 10,000 definitions it refuses outright, telling you to narrow the export to a single record type, rather than handing you a truncated file that looks complete. Fields restricted from you are absent from the file rather than blank.",

          referenceTitle: "The two reference screens",
          referenceIntro:
            "Both are reached from links in the Custom Fields page header, both are read-only, and both are gated behind the same view permission as the Custom Fields screen itself. Neither has a sidebar entry of its own, which is deliberate.",
          valueTypesScreenTitle: "Value Types",
          valueTypesScreenIntro:
            "A table of all seventeen value types with, for each, a description of what it is for, whether it takes a placeholder, whether it owns an options list, and whether it supports a validator. Use it to answer \"what types exist\" without opening a definition form. Text is the only row showing validator support.",
          entityTypesScreenTitle: "Entity Types",
          entityTypesScreenIntro:
            "A list of every record type a custom field can be attached to: its display name, its key, and the module that owns it.",
          entityTypesScreenDrift:
            "It also shows two separate screen columns plus a status, which is not a duplication. One is what the platform claims about this application; the other is what this application actually has. The status column says whether the two agree, and a row reading Out of Sync is a real defect worth reporting — it means either a field pointed at a record type nobody can render, or a screen the platform does not know exists.",
          apiOnlyTitle: "API-only record types",
          apiOnlyContent:
            "A record type with no screen in this application is still a legal target for a custom field. It is listed after the screen-backed ones on the definition form, with an API only suffix. A field defined against one of those is reachable through the API and has nowhere at all to render in the interface — which is fine if that is what you intended, and a puzzle if it is not.",
        },

        // ═══════════════════════════════════════════════════
        //  Limits and Behaviours
        // ═══════════════════════════════════════════════════
        limits: {
          title: "Limits and Behaviours",
          description:
            "Every fixed cap and every deliberate limitation in custom fields, each with the reason it is that way — so nobody spends an afternoon looking for a setting that does not exist.",
          intro:
            "This page collects every limit a custom-fields administrator can reasonably expect to hit, and says why each one is where it is. Everything here describes current behaviour rather than a promise about the future. A limit stated plainly is cheaper than a limit discovered at four in the afternoon.",

          numbersTitle: "The fixed numbers",
          numbersIntro:
            "These are constants in the product. None of them can be raised or lowered for an individual field, and only the last one varies at all.",
          thLimit: "Limit",
          thValue: "Value",
          thConfigurable: "Configurable?",
          limTextLength: "Text field length, in characters",
          limLongTextLength: "LongText field length, in characters",
          limMultiSelect: "MultiSelect selections per value",
          limRating: "Rating scale, whole numbers only",
          limPercent: "Percent range, inclusive",
          limPhoneDigits: "Phone digits, after the leading +",
          limCurrencyCode: "Currency code length, uppercase letters",
          limDuration: "Duration upper bound",
          limGroupReorder: "Field groups per record type in one reorder",
          limExportRows: "Definitions per spreadsheet export",
          limFieldsPerWorkspace: "Custom fields per workspace",
          cfgNo: "No",
          cfgPlan: "Set by your plan",
          valNoUpperBound: "None",
          valPlanQuota: "Plan quota — zero on the Free edition",

          validatorsTitle: "Validator behaviours",
          thBehaviour: "Behaviour",
          thWhy: "Why",
          vTextOnly: "Validators attach to Text fields only.",
          vTextOnlyWhy:
            "The safety argument for the built-in patterns was derived for single-line text input. Extending it to a differently shaped input needs that analysis redone, and that is not something to smuggle into a feature release. A Text field with a validator is the answer when you need an email address with extra constraints.",
          vNoRetro: "Attaching a validator never re-checks answers already saved.",
          vNoRetroWhy:
            "Validation runs in exactly one place: the save path. Nothing walks historical data when a validator is newly attached, so a field can legitimately hold values its own current validator would refuse, until somebody re-enters them.",
          vWhitespace: "A whitespace-only value skips validation entirely unless the field is Required.",
          vWhitespaceWhy:
            "The emptiness check runs before any type or validator check. On an optional field a value of nothing but spaces is therefore stored as cleared with no validator error at all. Mark the field Required if a blank answer should be refused.",
          vNoRegex: "There is no pattern or regular-expression box anywhere.",
          vNoRegexWhy:
            "A hand-written pattern can be made to consume enormous processing time on a short input, turning a data-entry form into a way of taking the system down. The 13 curated checks exist precisely so that nobody has to author one.",
          vNoFilter: "The definitions list cannot be filtered or searched by validator.",
          vNoFilterWhy:
            "No such view was built. To see which validator a field uses, open that field's definition form.",
          vNoReference: "There is no browsable validator reference inside the product.",
          vNoReferenceWhy:
            "Value types and record types each got a read-only reference screen; validators did not. The dropdown on a Text field's definition form is the only in-product list.",
          vNoChecksumEgUae: "The Egyptian and Emirati ID checks verify structure but not a check digit.",
          vNoChecksumEgUaeWhy:
            "Neither country publishes a check-digit algorithm, and the community guesses found during research disagreed with each other. A wrong algorithm would reject real, valid IDs, which is worse than not checking the final digit at all.",
          vNoAe: "Postal Code does not support the United Arab Emirates.",
          vNoAeWhy:
            "The UAE has no national postal-code system, so there is nothing to validate against. Attempting it is refused with its own explanatory message rather than a generic one.",

          typesTitle: "Value-type behaviours",
          tValueTypeFixed: "A field's value type can never be changed.",
          tValueTypeFixedWhy:
            "Answers already recorded under the old type would stop making sense, and there is no conversion. The same applies to the key, the record type and the scope.",
          tMultiOrder: "A MultiSelect answer reads back in selection order, not option order.",
          tMultiOrderWhy:
            "Preserving the order somebody picked in is what makes the value round-trip faithfully. The cost is that a list column showing that answer is not guaranteed to follow the order you authored the options in.",
          tLongTextNoBlock: "LongText lets you type past its 10,000-character cap.",
          tLongTextNoBlockWhy:
            "The on-screen counter turns red, but there is no pre-submit block the way MultiSelect blocks a twentieth selection. The refusal comes from the save.",
          tCurrencyShape: "A Currency code is checked for shape only.",
          tCurrencyShapeWhy:
            "There is no authoritative list of real currency codes in the product to check against, and a workspace may legitimately need any of roughly 180 real ones. Three uppercase letters is therefore the whole check, and a well-formed but non-existent code such as ZZZ is accepted.",
          tCurrencyPlain: "Currency stores a plain amount, never minor units.",
          tCurrencyPlainWhy:
            "It follows the same convention as every other monetary amount in the product. 100.50 is stored as 100.50, never as 10050 — which matters if you ever read the raw data or build a report on it.",
          tDurationMinutes: "Duration's unit is always minutes, and it has no maximum.",
          tDurationMinutesWhy:
            "Minutes is the convention the scheduling and booking parts of the product already use for duration-shaped data, and the form labels the unit visibly rather than leaving a bare number. Only negative values are refused; there is no upper bound and no per-field way to set one.",
          tRatingSlider: "An untouched Rating field shows its slider at 1 while still being empty.",
          tRatingSliderWhy:
            "A slider always needs a real number to position its thumb. Nothing is submitted until somebody actually moves it, so the field genuinely saves as empty — but it looks like a 1 until you know that.",
          tRatingZero: "A Rating of 0 is refused rather than treated as unrated.",
          tRatingZeroWhy:
            "Unrated means the field was left genuinely empty. An explicitly submitted 0 is a real value that fails the 1-to-5 check exactly as a 6 would, and it gets the same message.",
          tPhoneShape: "Phone validates shape, not whether the number could exist.",
          tPhoneShapeWhy:
            "The server checks the international grammar only. The form's own picker additionally checks the digits against the selected country's real numbering plan, so the gap is only reachable from a request that bypasses the form — an accepted data-quality limitation rather than a security one.",
          tPhoneFlag: "Phone's displayed country flag can be wrong on a shared calling code.",
          tPhoneFlagWhy:
            "Some calling codes are shared by several countries, and there is no separate country column — the flag is derived from the number itself. The stored number is unaffected; only the flag beside it can pick the wrong country within a shared code.",
          tColorShorthand: "Color never unifies the three-digit and six-digit forms.",
          tColorShorthandWhy:
            "Both are valid and both persist exactly as submitted, so the same colour can be stored two ways across different records. Only case is normalised, always to lower case.",
          tTimeText: "Time is stored as canonical text rather than as a database time.",
          tTimeTextWhy:
            "A deliberate storage choice, made to avoid repeating a known sorting problem that an existing time column elsewhere in the product has on one database. Unpadded input is accepted and normalised, so two spellings of the same time always converge.",
          tPercentStorage: "Percent stores the number you would say aloud, not a fraction.",
          tPercentStorageWhy:
            "25 is stored as 25 and displayed as 25%. It is never 0.25, and the display appends the sign rather than running a fraction-based formatter, specifically so a 25 can never be shown as 2500%.",
          tTextNotTrimmed: "Text does not trim surrounding spaces; Select does.",
          tTextNotTrimmedWhy:
            "A Text value is stored exactly as submitted, because leading or trailing space can be meaningful in free text. A Select value is trimmed on both sides before being matched against the options, so a stray space never causes a spurious rejection.",
          tOracleBytes: "Long Arabic text can be refused below the stated character cap on one database.",
          tOracleBytesWhy:
            "The 4,000-character Text cap is an exact character count on two of the three supported databases. On the third it is counted in bytes, so multi-byte text — Arabic included — can reach the limit sooner. Use LongText if you are close to the boundary.",

          optionsTitle: "Option behaviours",
          oTextIsValue: "The English option text is the stored answer.",
          oTextIsValueWhy:
            "There is no separate code behind an option, so renaming one changes what every existing record displays. Prefer adding a new option and retiring the old one when the distinction matters.",
          oCaseSensitive: "Option matching is exact and case-sensitive.",
          oCaseSensitiveWhy:
            "Two options differing only by case are a legitimately distinct pair, and folding case would make them collide. Both sides are trimmed first, so only case and content matter.",
          oEnglishStored: "The Arabic option label is display only.",
          oEnglishStoredWhy:
            "The two label lists are matched row by row, and the English one is what is written to the record and validated against. An Arabic reader sees Arabic on the way in and on the way out; the data underneath stays one consistent value.",
          oNoSharedSets: "Each field carries its own options list.",
          oNoSharedSetsWhy:
            "There is no way to define a list once and reuse it across several fields. A Countries list needed by three fields is written and maintained three times.",

          groupsTitle: "Field-group behaviours",
          gStableKeyFixed: "A group's stable key can never be changed, by anybody.",
          gStableKeyFixedWhy:
            "Exported schema names a group by this key, so a rename would silently turn a future re-import from an update into a create, against a bundle already shipped. A wrong key means recreating the group.",
          gReorderCeiling: "Reordering refuses more than 100 groups on one record type.",
          gReorderCeilingWhy:
            "A reorder request carries the whole set at once. Past 100, no group on that record type can be moved at all — the screen says so rather than failing generically.",
          gGlobalOrdering: "A workspace cannot position its group relative to a global one.",
          gGlobalOrderingWhy:
            "Reordering is all-or-nothing and refuses any group the caller does not own, so a workspace's own groups are renumbered from zero. Those numbers can collide with a global group's, the tie is broken on the English label, and the visible effect is that moving your group to the top can leave it below a global one.",
          gSeparatePerms: "Field groups need their own permissions.",
          gSeparatePermsWhy:
            "They are gated separately from field definitions, including a distinct permission for reordering. A role holding every custom-fields permission does not get them automatically, and without them the link and the picker are simply absent.",
          gOneEntityType: "A group belongs to exactly one record type.",
          gOneEntityTypeWhy:
            "Nothing is listed until you pick a record type, and changing a field's record type clears its group, because a group from one type is never valid for another.",
          gUniquenessIndex: "In an upgraded database, stable-key uniqueness rests on the application check.",
          gUniquenessIndexWhy:
            "Groups that existed before stable keys carry an empty key until a backfill is run, and the database-level uniqueness constraint stays switched off until that has happened everywhere — it would otherwise reject the second of those empty keys.",

          securityTitle: "Security and classification behaviours",
          sSensitivityLabel: "Sensitivity is a label, not an access control.",
          sSensitivityLabelWhy:
            "It is stored, round-tripped and reportable, and it changes nothing about who can read a value. Field-level security is the mechanism that restricts access, and the two are unconnected.",
          sRestrictedByResource: "Restrictions are keyed by permission resource, not by record type.",
          sRestrictedByResourceWhy:
            "It is the same resource that already guards the record itself, so one restricted-fields list covers a screen's built-in fields and its custom fields alike. Names are matched without regard to case.",
          sRestrictedInvisible: "A restricted field is absent, not blank.",
          sRestrictedInvisibleWhy:
            "Showing a placeholder would reveal that a value exists, which is itself information. The consequence is that a restricted field is indistinguishable from one that was never defined — worth remembering when somebody reports a missing field.",
          sRejectWholeSave: "Writing a restricted field refuses the entire save.",
          sRejectWholeSaveWhy:
            "Quietly dropping the one field and reporting success is the harder failure to notice. The refusal also fires when the submitted value equals the stored one, so nobody can probe a hidden value by testing what is accepted.",
          sRequiredExclusive: "Required and restricted cannot be combined.",
          sRequiredExclusiveWhy:
            "Somebody who cannot see a field could never satisfy it, so the record would be unsaveable for them. Both directions are refused, whichever you try first, and the message names the field.",
          sHistoryNoValues: "Definition history never shows value changes.",
          sHistoryNoValuesWhy:
            "Including them would make the dialog a readable copy of everybody's field data, going around field-level security and every other visibility rule at once. The value-bearing records are excluded by name rather than by omission.",

          exportTitle: "Export and portability behaviours",
          eDefinitionsOnly: "The spreadsheet export contains definitions, never answers.",
          eDefinitionsOnlyWhy:
            "It is a definitions export by design, and there is no values export anywhere in the product. Nobody's data can leave through it.",
          eRefusesPastLimit: "Past 10,000 definitions the export refuses instead of truncating.",
          eRefusesPastLimitWhy:
            "A silently truncated file is worse than no file, because it looks complete. The refusal tells you to narrow the export to a single record type.",
          eRestrictedAbsent: "Fields restricted from you are absent from the file, not blank.",
          eRestrictedAbsentWhy:
            "Field-level security applies to the export exactly as it does on screen, and a blank column would still reveal that the field exists.",
          eNoImport: "Definitions can be exported but not imported.",
          eNoImportWhy:
            "There is no import path, so a spreadsheet cannot be used to create fields in bulk. The export is a report, not a template.",
          eTextCells: "Every export cell is written as text.",
          eTextCellsWhy:
            "A label beginning with =, +, - or @ arrives as literal characters rather than as a spreadsheet formula. This is categorical rather than a filter of known cases, so nothing that looks like a calculation can become one.",

          reachTitle: "Where fields do and do not appear",
          rApiOnlyTypes: "Some record types have no screen at all.",
          rApiOnlyTypesWhy:
            "They are legal targets and are listed last on the definition form with an API only suffix. A field defined against one is reachable through the API and has nowhere in the interface to render.",
          rHandRolledForms: "A handful of screens wire their custom fields by hand.",
          rHandRolledFormsWhy:
            "Most screens pick custom fields up automatically. A few whose create and edit interfaces predate that mechanism — among them webhooks, message templates, tenant plans, plugin definitions, leads and themes — implement the same Custom Fields section themselves. Behaviour should be identical; if it is not, that is worth reporting.",
          rDsrCreateOnly: "Data subject requests take custom fields on create only.",
          rDsrCreateOnlyWhy:
            "A submitted request moves through a review workflow rather than being generally editable, so there is no edit form to carry custom fields into. That is by design, not an omission.",
          rDialogForms: "Most record create and edit forms are still dialogs.",
          rDialogFormsWhy:
            "Custom-field authoring itself moved out of a nested dialog into a side panel, which is why adding a field from inside a record no longer stacks two dialogs. The surrounding record forms were deliberately left alone — moving them is a much wider change across modules that have nothing to do with custom fields.",
          rNoSidebarEntry: "The Value Types and Entity Types screens have no sidebar entry.",
          rNoSidebarEntryWhy:
            "Sidebar navigation is seeded centrally, and these two were deliberately left out of that seed. They are reached from links in the Custom Fields page header instead.",

          absentTitle: "Things the product does not do",
          absentIntro:
            "Asked often enough to be worth stating plainly. None of these is a fault to report.",
          absent1:
            "The seventeen value types are the complete set. There is no type for uploading a file or an image, for formatted rich text, or for pointing at another record — that kind of information belongs to the record's own built-in fields and attachments.",
          absent2:
            "There is no values export. The spreadsheet export covers definitions only.",
          absent3:
            "There is no import, and no bulk creation. Fields are created one at a time, on the form.",
          absent4:
            "There is no shared options list. Each field carries and maintains its own.",
          absent5:
            "There is no conditional show-or-hide that an administrator can configure. A field is either on the form or it is not, subject to Active and to field-level security.",
          absent6:
            "There is no calculation, no default value, and no cross-field rule. A custom field records an answer; it does not derive one.",
          absentInfoTitle: "If you need one of these",
          absentInfoContent:
            "Say so to whoever owns your product roadmap rather than working around it in a way that costs you data. Recreating a field to change something permanent destroys the answers already stored against it, and that is the expensive mistake this page exists to prevent.",
        },
      },
    },
  },
};
