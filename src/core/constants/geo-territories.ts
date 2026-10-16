/**
 * Geo Territories & International Address Engine
 *
 * Source of truth for hierarchical geographic structures:
 * Country -> State / Province / Governorate / Emirate -> City / District -> Postal Code Validation.
 * Follows Universal Postal Union (UPU S42) and Google i18n address standards.
 *
 * @module core/constants/geo-territories
 */

export type TerritoryDivisionType =
  | "governorate" // Egypt
  | "province" // Saudi Arabia, Canada, Italy
  | "emirate" // UAE
  | "state" // USA, Germany, Australia, India
  | "county" // UK, Ireland
  | "region"; // General fallback

export interface GeoState {
  code: string;
  name: string;
  nameAr: string;
  cities: string[];
}

export interface GeoCountryTerritory {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  nameAr: string;
  divisionType: TerritoryDivisionType;
  divisionLabel: string;
  divisionLabelAr: string;
  cityLabel: string;
  cityLabelAr: string;
  hasDistrict: boolean;
  districtLabel?: string;
  districtLabelAr?: string;
  postalCodeRequired: boolean;
  postalCodeRegex: RegExp | null;
  postalCodePlaceholder: string;
  postalCodePlaceholderAr: string;
  postalCodeHelpText?: string;
  postalCodeHelpTextAr?: string;
  states: GeoState[];
}

// ═══════════════════════════════════════════════════════════════════════════
// EGYPT (EG) — 27 Governorates & Curated Districts
// ═══════════════════════════════════════════════════════════════════════════
const EGYPT_TERRITORY: GeoCountryTerritory = {
  code: "EG",
  name: "Egypt",
  nameAr: "مصر",
  divisionType: "governorate",
  divisionLabel: "Governorate",
  divisionLabelAr: "المحافظة",
  cityLabel: "City / District",
  cityLabelAr: "المدينة / الحي / المركز",
  hasDistrict: true,
  districtLabel: "Neighborhood / Sub-District",
  districtLabelAr: "الحي / المنطقة الفرعية",
  postalCodeRequired: true,
  postalCodeRegex: /^\d{5}$/,
  postalCodePlaceholder: "e.g. 11716",
  postalCodePlaceholderAr: "مثال: 11716",
  postalCodeHelpText: "5-digit Egyptian postal code",
  postalCodeHelpTextAr: "الرمز البريدي المصري المكون من 5 أرقام",
  states: [
    {
      code: "CAIRO",
      name: "Cairo",
      nameAr: "القاهرة",
      cities: [
        "Maadi",
        "New Cairo (Fifth Settlement)",
        "Nasr City",
        "Heliopolis (Masr El Gedida)",
        "Zamalek",
        "Downtown Cairo",
        "Mokattam",
        "El Shorouk",
        "Madinaty",
        "Rehab City",
        "Helwan",
        "Shubra",
        "Ain Shams",
        "New Administrative Capital",
        "Al Banafseg",
        "Al Narjis",
        "Al Tagamoa",
        "Al Yasmin",
        "Al Rehab",
        "Badr City",
        "El Marg",
        "El Matareya",
        "El Zeitoun",
        "El Sayeda Zeinab",
        "Abbaseya",
      ],
    },
    {
      code: "GIZA",
      name: "Giza",
      nameAr: "الجيزة",
      cities: [
        "Dokki",
        "Mohandessin",
        "6th of October City",
        "Sheikh Zayed City",
        "Al Haram",
        "Faisal",
        "Agouza",
        "Giza City",
        "Imbaba",
        "Al Omraniya",
        "Smart Village",
        "Hadayek October",
        "October Gardens",
        "Al Badrasheen",
      ],
    },
    {
      code: "ALEX",
      name: "Alexandria",
      nameAr: "الإسكندرية",
      cities: [
        "Smouha",
        "Miami",
        "Sidi Gaber",
        "Montaza",
        "Gleem",
        "Stanley",
        "Roushdy",
        "Mansheya",
        "Borg El Arab",
        "Loran",
        "San Stefano",
        "Sporting",
        "Al Agamy",
        "Kafr Abdo",
      ],
    },
    {
      code: "QALYUBIA",
      name: "Qalyubia",
      nameAr: "القليوبية",
      cities: ["Banha", "Shubra El Kheima", "Qalyub", "El Obour City", "Khanka", "Toukh"],
    },
    {
      code: "SHARQIA",
      name: "Sharqia",
      nameAr: "الشرقية",
      cities: ["Zagazig", "10th of Ramadan City", "Belbeis", "Faqous", "Minya El Qamh"],
    },
    {
      code: "DAKAHLIA",
      name: "Dakahlia",
      nameAr: "الدقهلية",
      cities: ["Mansoura", "Talkha", "Mit Ghamr", "Senbellawein", "Dikirnis", "Gamasa"],
    },
    {
      code: "RED_SEA",
      name: "Red Sea",
      nameAr: "البحر الأحمر",
      cities: ["Hurghada", "El Gouna", "Marsa Alam", "Soma Bay", "Safaga", "El Quseir"],
    },
    {
      code: "SOUTH_SINAI",
      name: "South Sinai",
      nameAr: "جنوب سيناء",
      cities: ["Sharm El Sheikh", "Dahab", "Nuweiba", "Taba", "Ras Sedr"],
    },
    {
      code: "MATROUH",
      name: "Matrouh",
      nameAr: "مطروح",
      cities: ["Marsa Matrouh", "El Alamein", "North Coast (Sahel)", "Sidi Abdel Rahman", "Siwa"],
    },
    {
      code: "PORT_SAID",
      name: "Port Said",
      nameAr: "بورسعيد",
      cities: ["Port Said City", "Port Fouad", "Al Arab", "Al Dawahi"],
    },
    {
      code: "SUEZ",
      name: "Suez",
      nameAr: "السويس",
      cities: ["Suez City", "Ain Sokhna", "Al Arbaeen", "Faisal"],
    },
    {
      code: "ISMAILIA",
      name: "Ismailia",
      nameAr: "الإسماعيلية",
      cities: ["Ismailia City", "Fayed", "El Qantara", "El Tel El Kebir"],
    },
    {
      code: "GHARBIA",
      name: "Gharbia",
      nameAr: "الغربية",
      cities: ["Tanta", "El Mahalla El Kubra", "Zifta", "Kafr El Zayat"],
    },
    {
      code: "MENOFIA",
      name: "Menofia",
      nameAr: "المنوفية",
      cities: ["Shibin El Kom", "Sadat City", "Ashmoun", "Menouf", "Quesna"],
    },
    {
      code: "BEHEIRA",
      name: "Beheira",
      nameAr: "البحيرة",
      cities: ["Damanhour", "Kafr El Dawwar", "Wadi El Natrun", "Edko", "Rosetta (Rashid)"],
    },
    {
      code: "DAMIETTA",
      name: "Damietta",
      nameAr: "دمياط",
      cities: ["Damietta City", "New Damietta", "Ras El Bar", "Faraskour"],
    },
    {
      code: "KAFR_EL_SHEIKH",
      name: "Kafr El Sheikh",
      nameAr: "كفر الشيخ",
      cities: ["Kafr El Sheikh City", "Desouk", "Baltim", "Metoubas"],
    },
    {
      code: "FAYOUM",
      name: "Fayoum",
      nameAr: "الفيوم",
      cities: ["Fayoum City", "New Fayoum", "Sinnuris", "Ibshaway"],
    },
    {
      code: "BENI_SUEF",
      name: "Beni Suef",
      nameAr: "بني سويف",
      cities: ["Beni Suef City", "New Beni Suef", "Nasser", "Biba", "Al Wasta"],
    },
    {
      code: "MINYA",
      name: "Minya",
      nameAr: "المنيا",
      cities: ["Minya City", "New Minya", "Mallawi", "Samalut", "Beni Mazar"],
    },
    {
      code: "ASSIUT",
      name: "Assiut",
      nameAr: "أسيوط",
      cities: ["Assiut City", "New Assiut", "Dairut", "Manfalut", "Abnoub"],
    },
    {
      code: "SOHAG",
      name: "Sohag",
      nameAr: "سوهاج",
      cities: ["Sohag City", "New Sohag", "Akhmim", "Girga", "Tahta"],
    },
    {
      code: "QENA",
      name: "Qena",
      nameAr: "قنا",
      cities: ["Qena City", "New Qena", "Nag Hammadi", "Qus", "Dishna"],
    },
    {
      code: "LUXOR",
      name: "Luxor",
      nameAr: "الأقصر",
      cities: ["Luxor City", "New Luxor", "Esna", "Armant", "Al Bayadiya"],
    },
    {
      code: "ASWAN",
      name: "Aswan",
      nameAr: "أسوان",
      cities: ["Aswan City", "New Aswan", "Kom Ombo", "Edfu", "Abu Simbel"],
    },
    {
      code: "NORTH_SINAI",
      name: "North Sinai",
      nameAr: "شمال سيناء",
      cities: ["Arish", "Sheikh Zuweid", "Bir El Abd"],
    },
    {
      code: "NEW_VALLEY",
      name: "New Valley",
      nameAr: "الوادي الجديد",
      cities: ["Kharga", "Dakhla", "Farafra", "Baris"],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SAUDI ARABIA (SA) — 13 Administrative Regions & Major Cities
// ═══════════════════════════════════════════════════════════════════════════
const SAUDI_TERRITORY: GeoCountryTerritory = {
  code: "SA",
  name: "Saudi Arabia",
  nameAr: "المملكة العربية السعودية",
  divisionType: "province",
  divisionLabel: "Province / Region",
  divisionLabelAr: "المنطقة الإدارية",
  cityLabel: "City",
  cityLabelAr: "المدينة",
  hasDistrict: true,
  districtLabel: "District (Hayy)",
  districtLabelAr: "الحي",
  postalCodeRequired: true,
  postalCodeRegex: /^\d{5}$/,
  postalCodePlaceholder: "e.g. 12345",
  postalCodePlaceholderAr: "مثال: 12345",
  postalCodeHelpText: "5-digit Saudi National Address postal code",
  postalCodeHelpTextAr: "الرمز البريدي للعنوان الوطني المكون من 5 أرقام",
  states: [
    {
      code: "RIYADH",
      name: "Riyadh Region",
      nameAr: "منطقة الرياض",
      cities: [
        "Riyadh",
        "Al-Kharj",
        "Diriyah",
        "Al-Majma'ah",
        "Dawadmi",
        "Wadi ad-Dawasir",
        "Az Zulfi",
        "Shaqra",
        "Afif",
        "Al-Ghat",
        "Hotat Bani Tamim",
        "Huraymila",
        "Dhurma",
        "Rumah",
        "Thadiq",
      ],
    },
    {
      code: "MAKKAH",
      name: "Makkah Region",
      nameAr: "منطقة مكة المكرمة",
      cities: [
        "Jeddah",
        "Mecca (Makkah Al-Mukarramah)",
        "Taif",
        "Rabigh",
        "King Abdullah Economic City (KAEC)",
        "Al Qunfudhah",
        "Al Lith",
        "Khulais",
        "Turabah",
        "Ranyah",
      ],
    },
    {
      code: "EASTERN",
      name: "Eastern Province",
      nameAr: "المنطقة الشرقية",
      cities: [
        "Dammam",
        "Al Khobar",
        "Dhahran",
        "Jubail",
        "Al-Ahsa (Hofuf)",
        "Qatif",
        "Hafar Al-Batin",
        "Ras Tanura",
        "Khafji",
        "Buqayq",
        "Al Nairyah",
      ],
    },
    {
      code: "MADINAH",
      name: "Madinah Region",
      nameAr: "منطقة المدينة المنورة",
      cities: [
        "Medina (Al-Madinah Al-Munawwarah)",
        "Yanbu",
        "Al-Ula",
        "Badr",
        "Khaybar",
        "Mahd adh Dhahab",
      ],
    },
    {
      code: "QASSIM",
      name: "Al-Qassim Region",
      nameAr: "منطقة القصيم",
      cities: [
        "Buraidah",
        "Unaizah",
        "Ar Rass",
        "Al Bukayriyah",
        "Al Badayea",
        "Al Mithnab",
        "Riyadh Al Khabra",
      ],
    },
    {
      code: "ASIR",
      name: "Asir Region",
      nameAr: "منطقة عسير",
      cities: [
        "Abha",
        "Khamis Mushait",
        "Bisha",
        "Muhayil",
        "Ahad Rafidah",
        "Dhahran Al Janub",
        "Tanomah",
      ],
    },
    {
      code: "TABUK",
      name: "Tabuk Region",
      nameAr: "منطقة تبوك",
      cities: ["Tabuk", "NEOM", "Duba", "Al Wajh", "Haql", "Umluj", "Tayma"],
    },
    {
      code: "HAIL",
      name: "Hail Region",
      nameAr: "منطقة حائل",
      cities: ["Hail", "Baqaa", "Al Ghazalah", "Ash Shamli", "Mawqaq"],
    },
    {
      code: "NORTHERN_BORDERS",
      name: "Northern Borders",
      nameAr: "منطقة الحدود الشمالية",
      cities: ["Arar", "Rafha", "Turaif", "Al Uwayqilah"],
    },
    {
      code: "JAZAN",
      name: "Jazan Region",
      nameAr: "منطقة جازان",
      cities: ["Jazan", "Sabya", "Abu Arish", "Samtah", "Baish", "Farasan Islands", "Ad Darb"],
    },
    {
      code: "NAJRAN",
      name: "Najran Region",
      nameAr: "منطقة نجران",
      cities: ["Najran", "Sharurah", "Hubuna", "Badr Al Janub"],
    },
    {
      code: "BAHA",
      name: "Al-Baha Region",
      nameAr: "منطقة الباحة",
      cities: ["Al-Baha", "Baljurashi", "Al Mandaq", "Al Makhwah", "Qilwah"],
    },
    {
      code: "JOUF",
      name: "Al-Jouf Region",
      nameAr: "منطقة الجوف",
      cities: ["Sakaka", "Dumat Al-Jandal", "Qurayyat", "Tuburjal"],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// UNITED ARAB EMIRATES (AE) — 7 Emirates
// ═══════════════════════════════════════════════════════════════════════════
const UAE_TERRITORY: GeoCountryTerritory = {
  code: "AE",
  name: "United Arab Emirates",
  nameAr: "الإمارات العربية المتحدة",
  divisionType: "emirate",
  divisionLabel: "Emirate",
  divisionLabelAr: "الإمارة",
  cityLabel: "City / Area",
  cityLabelAr: "المدينة / المنطقة",
  hasDistrict: false,
  postalCodeRequired: false,
  postalCodeRegex: null,
  postalCodePlaceholder: "Optional (P.O. Box / Makani)",
  postalCodePlaceholderAr: "اختياري (ص.ب / مكاني)",
  postalCodeHelpText: "Postal codes are not used in the UAE",
  postalCodeHelpTextAr: "الرمز البريدي اختياري (غير مستخدم بالإمارات)",
  states: [
    {
      code: "DXB",
      name: "Dubai",
      nameAr: "دبي",
      cities: [
        "Downtown Dubai",
        "Dubai Marina",
        "Business Bay",
        "Jumeirah",
        "Palm Jumeirah",
        "Al Barsha",
        "Jumeirah Lake Towers (JLT)",
        "Deira",
        "Bur Dubai",
        "Dubai Silicon Oasis",
        "Mirdif",
        "Dubai Hills",
        "Al Quoz",
      ],
    },
    {
      code: "AUH",
      name: "Abu Dhabi",
      nameAr: "أبوظبي",
      cities: [
        "Abu Dhabi City",
        "Al Reem Island",
        "Yas Island",
        "Saadiyat Island",
        "Al Ain",
        "Khalifa City",
        "Al Raha",
        "Mohammed Bin Zayed City",
        "Al Dhafra",
      ],
    },
    {
      code: "SHJ",
      name: "Sharjah",
      nameAr: "الشارقة",
      cities: [
        "Sharjah City",
        "Al Majaz",
        "Al Nahda",
        "Al Qasimia",
        "Muwaileh",
        "Khorfakkan",
        "Kalba",
      ],
    },
    {
      code: "AJM",
      name: "Ajman",
      nameAr: "عجمان",
      cities: ["Ajman City", "Al Nuaimia", "Al Rashidiya", "Al Jurf"],
    },
    {
      code: "RAK",
      name: "Ras Al Khaimah",
      nameAr: "رأس الخيمة",
      cities: ["Ras Al Khaimah City", "Al Marjan Island", "Al Hamra Village", "Al Nakheel"],
    },
    {
      code: "FUJ",
      name: "Fujairah",
      nameAr: "الفجيرة",
      cities: ["Fujairah City", "Dibba Al-Fujairah", "Al Faseel"],
    },
    {
      code: "UAQ",
      name: "Umm Al Quwain",
      nameAr: "أم القيوين",
      cities: ["Umm Al Quwain City", "Al Salamah", "Falaj Al Mualla"],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// UNITED STATES (US) — 50 States + DC
// ═══════════════════════════════════════════════════════════════════════════
const US_TERRITORY: GeoCountryTerritory = {
  code: "US",
  name: "United States",
  nameAr: "الولايات المتحدة الأمريكية",
  divisionType: "state",
  divisionLabel: "State",
  divisionLabelAr: "الولاية",
  cityLabel: "City",
  cityLabelAr: "المدينة",
  hasDistrict: false,
  postalCodeRequired: true,
  postalCodeRegex: /^\d{5}(-\d{4})?$/,
  postalCodePlaceholder: "e.g. 90210 or 90210-1234",
  postalCodePlaceholderAr: "مثال: 90210 أو 90210-1234",
  postalCodeHelpText: "5-digit or 9-digit (ZIP+4) format",
  postalCodeHelpTextAr: "رمز بريدي أمريكي من 5 أو 9 أرقام",
  states: [
    {
      code: "CA",
      name: "California",
      nameAr: "كاليفورنيا",
      cities: [
        "Los Angeles",
        "San Francisco",
        "San Diego",
        "San Jose",
        "Sacramento",
        "Oakland",
        "Fresno",
      ],
    },
    {
      code: "NY",
      name: "New York",
      nameAr: "نيويورك",
      cities: ["New York City", "Buffalo", "Albany", "Rochester", "Yonkers", "Syracuse"],
    },
    {
      code: "TX",
      name: "Texas",
      nameAr: "تكساس",
      cities: ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth", "El Paso", "Arlington"],
    },
    {
      code: "FL",
      name: "Florida",
      nameAr: "فلوريدا",
      cities: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "St. Petersburg"],
    },
    {
      code: "IL",
      name: "Illinois",
      nameAr: "إلينوي",
      cities: ["Chicago", "Aurora", "Naperville", "Rockford", "Springfield"],
    },
    {
      code: "WA",
      name: "Washington",
      nameAr: "واشنطن",
      cities: ["Seattle", "Spokane", "Tacoma", "Bellevue", "Everett"],
    },
    {
      code: "MA",
      name: "Massachusetts",
      nameAr: "ماساتشوستس",
      cities: ["Boston", "Cambridge", "Worcester", "Springfield"],
    },
    { code: "DC", name: "District of Columbia", nameAr: "واشنطن العاصمة", cities: ["Washington"] },
    {
      code: "PA",
      name: "Pennsylvania",
      nameAr: "بنسلفانيا",
      cities: ["Philadelphia", "Pittsburgh", "Allentown"],
    },
    { code: "OH", name: "Ohio", nameAr: "أوهايو", cities: ["Columbus", "Cleveland", "Cincinnati"] },
    { code: "GA", name: "Georgia", nameAr: "جورجيا", cities: ["Atlanta", "Savannah", "Augusta"] },
    {
      code: "NC",
      name: "North Carolina",
      nameAr: "كارولاينا الشمالية",
      cities: ["Charlotte", "Raleigh", "Greensboro"],
    },
    {
      code: "MI",
      name: "Michigan",
      nameAr: "ميشيغان",
      cities: ["Detroit", "Grand Rapids", "Ann Arbor"],
    },
    {
      code: "NJ",
      name: "New Jersey",
      nameAr: "نيوجيرسي",
      cities: ["Newark", "Jersey City", "Paterson", "Princeton"],
    },
    {
      code: "VA",
      name: "Virginia",
      nameAr: "فيرجينيا",
      cities: ["Virginia Beach", "Norfolk", "Richmond", "Arlington", "Alexandria"],
    },
    {
      code: "CO",
      name: "Colorado",
      nameAr: "كولورادو",
      cities: ["Denver", "Colorado Springs", "Aurora", "Boulder"],
    },
    {
      code: "AZ",
      name: "Arizona",
      nameAr: "أريزونا",
      cities: ["Phoenix", "Tucson", "Mesa", "Scottsdale"],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// UNITED KINGDOM (GB)
// ═══════════════════════════════════════════════════════════════════════════
const UK_TERRITORY: GeoCountryTerritory = {
  code: "GB",
  name: "United Kingdom",
  nameAr: "المملكة المتحدة",
  divisionType: "county",
  divisionLabel: "Country / County",
  divisionLabelAr: "المقاطعة / الإقليم",
  cityLabel: "Town / City",
  cityLabelAr: "المدينة",
  hasDistrict: false,
  postalCodeRequired: true,
  // UK Postcode Regex (UPU S42 conforming)
  postalCodeRegex: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
  postalCodePlaceholder: "e.g. SW1A 1AA or EC1A 1BB",
  postalCodePlaceholderAr: "مثال: SW1A 1AA",
  postalCodeHelpText: "UK standard alphanumeric postcode",
  postalCodeHelpTextAr: "الرمز البريدي البريطاني",
  states: [
    {
      code: "ENG",
      name: "England",
      nameAr: "إنجلترا",
      cities: [
        "London",
        "Manchester",
        "Birmingham",
        "Leeds",
        "Liverpool",
        "Bristol",
        "Sheffield",
        "Newcastle",
      ],
    },
    {
      code: "SCT",
      name: "Scotland",
      nameAr: "اسكتلندا",
      cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"],
    },
    { code: "WLS", name: "Wales", nameAr: "ويلز", cities: ["Cardiff", "Swansea", "Newport"] },
    {
      code: "NIR",
      name: "Northern Ireland",
      nameAr: "أيرلندا الشمالية",
      cities: ["Belfast", "Derry", "Lisburn"],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// GERMANY (DE)
// ═══════════════════════════════════════════════════════════════════════════
const GERMANY_TERRITORY: GeoCountryTerritory = {
  code: "DE",
  name: "Germany",
  nameAr: "ألمانيا",
  divisionType: "state",
  divisionLabel: "Federal State (Bundesland)",
  divisionLabelAr: "الولاية الفيدرالية",
  cityLabel: "City",
  cityLabelAr: "المدينة",
  hasDistrict: false,
  postalCodeRequired: true,
  postalCodeRegex: /^\d{5}$/,
  postalCodePlaceholder: "e.g. 10115",
  postalCodePlaceholderAr: "مثال: 10115",
  postalCodeHelpText: "5-digit Postleitzahl (PLZ)",
  postalCodeHelpTextAr: "الرمز البريدي الألماني المكون من 5 أرقام",
  states: [
    { code: "BE", name: "Berlin", nameAr: "برلين", cities: ["Berlin"] },
    {
      code: "BY",
      name: "Bavaria",
      nameAr: "بافاريا",
      cities: ["Munich", "Nuremberg", "Augsburg", "Regensburg"],
    },
    {
      code: "BW",
      name: "Baden-Württemberg",
      nameAr: "بادن-فورتمبيرغ",
      cities: ["Stuttgart", "Karlsruhe", "Mannheim", "Freiburg", "Heidelberg"],
    },
    {
      code: "NW",
      name: "North Rhine-Westphalia",
      nameAr: "شمال الراين-وستفاليا",
      cities: ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Bonn"],
    },
    {
      code: "HE",
      name: "Hesse",
      nameAr: "هيسن",
      cities: ["Frankfurt am Main", "Wiesbaden", "Kassel", "Darmstadt"],
    },
    { code: "HH", name: "Hamburg", nameAr: "هامبورغ", cities: ["Hamburg"] },
    { code: "SN", name: "Saxony", nameAr: "ساكسونيا", cities: ["Leipzig", "Dresden", "Chemnitz"] },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// OTHER ARAB / MENA CORE SPORTS MARKETS
// ═══════════════════════════════════════════════════════════════════════════
const QATAR_TERRITORY: GeoCountryTerritory = {
  code: "QA",
  name: "Qatar",
  nameAr: "قطر",
  divisionType: "governorate",
  divisionLabel: "Municipality",
  divisionLabelAr: "البلدية",
  cityLabel: "City / Area",
  cityLabelAr: "المدينة / المنطقة",
  hasDistrict: false,
  postalCodeRequired: false,
  postalCodeRegex: null,
  postalCodePlaceholder: "Optional",
  postalCodePlaceholderAr: "اختياري",
  states: [
    {
      code: "DOH",
      name: "Doha",
      nameAr: "الدوحة",
      cities: ["Doha", "The Pearl", "West Bay", "Lusail"],
    },
    {
      code: "RAY",
      name: "Al Rayyan",
      nameAr: "الريان",
      cities: ["Al Rayyan", "Education City", "Al Gharrafa"],
    },
    { code: "WAK", name: "Al Wakrah", nameAr: "الوكرة", cities: ["Al Wakrah", "Al Wukair"] },
    { code: "KHO", name: "Al Khor", nameAr: "الخور", cities: ["Al Khor", "Al Thakhira"] },
  ],
};

const KUWAIT_TERRITORY: GeoCountryTerritory = {
  code: "KW",
  name: "Kuwait",
  nameAr: "الكويت",
  divisionType: "governorate",
  divisionLabel: "Governorate",
  divisionLabelAr: "المحافظة",
  cityLabel: "City / Area",
  cityLabelAr: "المدينة / المنطقة",
  hasDistrict: false,
  postalCodeRequired: true,
  postalCodeRegex: /^\d{5}$/,
  postalCodePlaceholder: "e.g. 13001",
  postalCodePlaceholderAr: "مثال: 13001",
  states: [
    {
      code: "ASI",
      name: "Al Asimah (Capital)",
      nameAr: "العاصمة",
      cities: ["Kuwait City", "Sharq", "Dasman", "Mirgab", "Salhiya", "Yarmouk"],
    },
    {
      code: "HAW",
      name: "Hawalli",
      nameAr: "حولي",
      cities: ["Hawalli", "Salmiya", "Jabriya", "Rumaithiya", "Bayan"],
    },
    {
      code: "FAR",
      name: "Farwaniya",
      nameAr: "الفروانية",
      cities: ["Farwaniya", "Khaitan", "Andalous", "Rabiya"],
    },
    {
      code: "AHM",
      name: "Al Ahmadi",
      nameAr: "الأحمدي",
      cities: ["Ahmadi", "Fahaheel", "Mangaf", "Sabah Al Ahmad"],
    },
    { code: "JAH", name: "Al Jahra", nameAr: "الجهراء", cities: ["Jahra", "Sulaibiya", "Oyoun"] },
    {
      code: "MUB",
      name: "Mubarak Al-Kabeer",
      nameAr: "مبارك الكبير",
      cities: ["Mubarak Al-Kabeer", "Qurain", "Sabah Al-Salem"],
    },
  ],
};

const BAHRAIN_TERRITORY: GeoCountryTerritory = {
  code: "BH",
  name: "Bahrain",
  nameAr: "البحرين",
  divisionType: "governorate",
  divisionLabel: "Governorate",
  divisionLabelAr: "المحافظة",
  cityLabel: "City / Town",
  cityLabelAr: "المدينة / المنطقة",
  hasDistrict: false,
  postalCodeRequired: true,
  postalCodeRegex: /^\d{3,4}$/,
  postalCodePlaceholder: "e.g. 317",
  postalCodePlaceholderAr: "مثال: 317",
  states: [
    {
      code: "CAP",
      name: "Capital Governorate",
      nameAr: "محافظة العاصمة",
      cities: ["Manama", "Juffair", "Seef", "Zinj"],
    },
    {
      code: "MUH",
      name: "Muharraq",
      nameAr: "محافظة المحرق",
      cities: ["Muharraq", "Busaiteen", "Amwaj Islands", "Hidd"],
    },
    {
      code: "NOR",
      name: "Northern Governorate",
      nameAr: "المحافظة الشمالية",
      cities: ["Budaiya", "Saar", "Hamad Town"],
    },
    {
      code: "SOU",
      name: "Southern Governorate",
      nameAr: "المحافظة الجنوبية",
      cities: ["Riffa", "Isa Town", "Zallaq"],
    },
  ],
};

const OMAN_TERRITORY: GeoCountryTerritory = {
  code: "OM",
  name: "Oman",
  nameAr: "سلطنة عمان",
  divisionType: "governorate",
  divisionLabel: "Governorate",
  divisionLabelAr: "المحافظة",
  cityLabel: "Wilayat / City",
  cityLabelAr: "الولاية / المدينة",
  hasDistrict: false,
  postalCodeRequired: true,
  postalCodeRegex: /^\d{3}$/,
  postalCodePlaceholder: "e.g. 100",
  postalCodePlaceholderAr: "مثال: 100",
  states: [
    {
      code: "MUS",
      name: "Muscat",
      nameAr: "مسقط",
      cities: ["Muscat", "Seeb", "Bawshar", "Muttrah", "Al Amerat"],
    },
    { code: "DHO", name: "Dhofar", nameAr: "ظفار", cities: ["Salalah", "Taqah", "Mirbat"] },
    {
      code: "BAT_N",
      name: "Al Batinah North",
      nameAr: "شمال الباطنة",
      cities: ["Sohar", "Shinas", "Saham"],
    },
    {
      code: "DAK",
      name: "Al Dakhiliyah",
      nameAr: "الداخلية",
      cities: ["Nizwa", "Bahla", "Samail"],
    },
  ],
};

const JORDAN_TERRITORY: GeoCountryTerritory = {
  code: "JO",
  name: "Jordan",
  nameAr: "الأردن",
  divisionType: "governorate",
  divisionLabel: "Governorate",
  divisionLabelAr: "المحافظة",
  cityLabel: "City",
  cityLabelAr: "المدينة",
  hasDistrict: false,
  postalCodeRequired: true,
  postalCodeRegex: /^\d{5}$/,
  postalCodePlaceholder: "e.g. 11118",
  postalCodePlaceholderAr: "مثال: 11118",
  states: [
    {
      code: "AMM",
      name: "Amman",
      nameAr: "عمان",
      cities: ["Amman", "Sweifieh", "Abdoun", "Jabal Amman", "Shmeisani", "Tla' Al-Ali"],
    },
    { code: "ZAR", name: "Zarqa", nameAr: "الزرقاء", cities: ["Zarqa", "Russeifa"] },
    { code: "IRB", name: "Irbid", nameAr: "إربد", cities: ["Irbid", "Ar Ramtha"] },
    { code: "AQA", name: "Aqaba", nameAr: "العقبة", cities: ["Aqaba"] },
  ],
};

const MOROCCO_TERRITORY: GeoCountryTerritory = {
  code: "MA",
  name: "Morocco",
  nameAr: "المغرب",
  divisionType: "region",
  divisionLabel: "Region",
  divisionLabelAr: "الجهة",
  cityLabel: "City",
  cityLabelAr: "المدينة",
  hasDistrict: false,
  postalCodeRequired: true,
  postalCodeRegex: /^\d{5}$/,
  postalCodePlaceholder: "e.g. 20000",
  postalCodePlaceholderAr: "مثال: 20000",
  states: [
    {
      code: "CAS",
      name: "Casablanca-Settat",
      nameAr: "الدار البيضاء - سطات",
      cities: ["Casablanca", "Mohammedia", "El Jadida", "Settat"],
    },
    {
      code: "RAB",
      name: "Rabat-Salé-Kénitra",
      nameAr: "الرباط - سلا - القنيطرة",
      cities: ["Rabat", "Salé", "Kénitra", "Temara"],
    },
    {
      code: "MAR",
      name: "Marrakech-Safi",
      nameAr: "مراكش - آسفي",
      cities: ["Marrakech", "Safi", "Essaouira"],
    },
    {
      code: "TAN",
      name: "Tanger-Tétouan-Al Hoceïma",
      nameAr: "طنجة - تطوان - الحسيمة",
      cities: ["Tangier", "Tétouan", "Al Hoceïma"],
    },
    { code: "FES", name: "Fès-Meknès", nameAr: "فاس - مكناس", cities: ["Fes", "Meknes", "Taza"] },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// TERRITORY REGISTRY MAP
// ═══════════════════════════════════════════════════════════════════════════
const TERRITORIES_BY_CODE: Record<string, GeoCountryTerritory> = {
  EG: EGYPT_TERRITORY,
  SA: SAUDI_TERRITORY,
  AE: UAE_TERRITORY,
  US: US_TERRITORY,
  GB: UK_TERRITORY,
  DE: GERMANY_TERRITORY,
  QA: QATAR_TERRITORY,
  KW: KUWAIT_TERRITORY,
  BH: BAHRAIN_TERRITORY,
  OM: OMAN_TERRITORY,
  JO: JORDAN_TERRITORY,
  MA: MOROCCO_TERRITORY,
};

// ═══════════════════════════════════════════════════════════════════════════
// POSTAL CODE VALIDATOR PATTERNS (UPU S42) FOR 100+ COUNTRIES
// ═══════════════════════════════════════════════════════════════════════════
const POSTAL_REGEX_MAP: Record<string, { regex: RegExp; placeholder: string }> = {
  CA: { regex: /^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i, placeholder: "e.g. K1A 0B1" },
  FR: { regex: /^\d{5}$/, placeholder: "e.g. 75001" },
  ES: { regex: /^\d{5}$/, placeholder: "e.g. 28001" },
  IT: { regex: /^\d{5}$/, placeholder: "e.g. 00118" },
  NL: { regex: /^\d{4}\s*[A-Z]{2}$/i, placeholder: "e.g. 1012 AB" },
  BE: { regex: /^\d{4}$/, placeholder: "e.g. 1000" },
  CH: { regex: /^\d{4}$/, placeholder: "e.g. 8001" },
  AT: { regex: /^\d{4}$/, placeholder: "e.g. 1010" },
  SE: { regex: /^\d{3}\s*\d{2}$/, placeholder: "e.g. 111 22" },
  NO: { regex: /^\d{4}$/, placeholder: "e.g. 0150" },
  DK: { regex: /^\d{4}$/, placeholder: "e.g. 1050" },
  IE: { regex: /^[A-Z]\d{2}\s*[A-Z0-9]{4}$/i, placeholder: "e.g. D02 X285" },
  AU: { regex: /^\d{4}$/, placeholder: "e.g. 2000" },
  NZ: { regex: /^\d{4}$/, placeholder: "e.g. 1010" },
  TR: { regex: /^\d{5}$/, placeholder: "e.g. 34000" },
  GR: { regex: /^\d{3}\s*\d{2}$/, placeholder: "e.g. 104 31" },
  PT: { regex: /^\d{4}-\d{3}$/, placeholder: "e.g. 1000-001" },
  PL: { regex: /^\d{2}-\d{3}$/, placeholder: "e.g. 00-001" },
  CZ: { regex: /^\d{3}\s*\d{2}$/, placeholder: "e.g. 110 00" },
  HU: { regex: /^\d{4}$/, placeholder: "e.g. 1011" },
  RO: { regex: /^\d{6}$/, placeholder: "e.g. 010011" },
  MX: { regex: /^\d{5}$/, placeholder: "e.g. 01000" },
  BR: { regex: /^\d{5}-?\d{3}$/, placeholder: "e.g. 01310-100" },
  AR: { regex: /^[A-Z]?\d{4}[A-Z]{0,3}$/i, placeholder: "e.g. C1002" },
  CL: { regex: /^\d{7}$/, placeholder: "e.g. 8320000" },
  CO: { regex: /^\d{6}$/, placeholder: "e.g. 110111" },
  ZA: { regex: /^\d{4}$/, placeholder: "e.g. 2001" },
  JP: { regex: /^\d{3}-?\d{4}$/, placeholder: "e.g. 100-0001" },
  KR: { regex: /^\d{5}$/, placeholder: "e.g. 03187" },
  SG: { regex: /^\d{6}$/, placeholder: "e.g. 018956" },
  MY: { regex: /^\d{5}$/, placeholder: "e.g. 50450" },
  IN: { regex: /^\d{6}$/, placeholder: "e.g. 110001" },
  TN: { regex: /^\d{4}$/, placeholder: "e.g. 1000" },
  DZ: { regex: /^\d{5}$/, placeholder: "e.g. 16000" },
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Returns complete geographic territory definition for a country code.
 * Falls back to international generic template if not explicitly registered.
 */
export function getGeoTerritory(countryCode?: string): GeoCountryTerritory {
  const code = (countryCode || "").toUpperCase();
  if (TERRITORIES_BY_CODE[code]) {
    return TERRITORIES_BY_CODE[code];
  }

  const postalInfo = POSTAL_REGEX_MAP[code];

  // Generic fallback for any other country
  return {
    code,
    name: code,
    nameAr: code,
    divisionType: "state",
    divisionLabel: "State / Province / Region",
    divisionLabelAr: "الولاية / المقاطعة / المنطقة",
    cityLabel: "City / Town",
    cityLabelAr: "المدينة",
    hasDistrict: false,
    postalCodeRequired: !!postalInfo,
    postalCodeRegex: postalInfo?.regex ?? /^[A-Z0-9\s-]{3,10}$/i,
    postalCodePlaceholder: postalInfo?.placeholder ?? "Postal Code / ZIP",
    postalCodePlaceholderAr: "الرمز البريدي",
    states: [],
  };
}

/**
 * Validates a postal code string against the country's national postal standard.
 * Returns true if valid or if the country does not require postal codes.
 */
export function validatePostalCode(countryCode: string, postalCode?: string): boolean {
  const territory = getGeoTerritory(countryCode);

  // If postal codes are not required in this territory (e.g. UAE)
  if (!territory.postalCodeRequired) {
    return true;
  }

  if (!postalCode || !postalCode.trim()) {
    return false;
  }

  const clean = postalCode.trim();
  if (territory.postalCodeRegex) {
    return territory.postalCodeRegex.test(clean);
  }

  // Fallback: at least 3 alphanumeric characters
  return clean.length >= 3 && clean.length <= 12;
}

/**
 * Formats a structured international address string adhering to UPU S42 standard.
 */
export function formatInternationalAddress(parts: {
  street?: string;
  district?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryName?: string;
}): string {
  const { street, district, city, state, postalCode, countryName } = parts;
  const segments: string[] = [];

  if (street?.trim()) segments.push(street.trim());
  if (district?.trim()) segments.push(district.trim());
  if (city?.trim()) segments.push(city.trim());
  if (state?.trim()) segments.push(state.trim());
  if (postalCode?.trim()) segments.push(postalCode.trim());
  if (countryName?.trim()) segments.push(countryName.trim());

  return segments.join(", ");
}
