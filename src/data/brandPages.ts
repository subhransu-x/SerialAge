export interface FaqItem {
  question: string;
  answer: string;
}

export interface SupportedFormat {
  label: string;
  example: string;
  exampleType: 'Documented' | 'Verified' | 'Synthetic';
  description: string;
}

export interface SourceConfig {
  type: 'external' | 'internal';
  title: string;
  publisher?: string;
  description?: string;
  url?: string;
}

export interface BrandPageConfig {
  manufacturerId: string;
  slug: string;
  displayName: string;
  relatedBrands: { name: string; slug: string }[];
  category: string;
  pageTitle: string;
  metaDescription: string;
  headline: string;
  shortDescription: string;
  ratingPlateLocation: string;
  limitations: string[];
  faqs: FaqItem[];
  supportedFormats: SupportedFormat[];
  ambiguity?: string;
  sources: SourceConfig[];
}

const carrier: BrandPageConfig = {
  manufacturerId: 'carrier',
  slug: 'carrier-serial-number-decoder',
  displayName: 'Carrier',
  relatedBrands: [{"name": "Bryant", "slug": "bryant-serial-number-decoder"}, {"name": "Payne", "slug": "payne-serial-number-decoder"}],
  category: 'HVAC',
  pageTitle: 'Carrier Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Carrier HVAC serial numbers. Find out the age and manufacture date of your Carrier air conditioner, furnace, or heat pump.',
  headline: 'Carrier Serial Number Decoder',
  shortDescription: 'Determine the age and manufacture date of your Carrier HVAC equipment. This decoder supports standard 10-character formats used from approximately 1985 to the present, as well as the older 9-digit formats from the 1980s. Results are derived from verified manufacturer documentation — we never guess.',
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.",
  limitations: ["Serial numbers manufactured before approximately 1985 (pre-Style 1) cannot be reliably decoded due to inconsistent historical formatting.", "Week-based dates (WWYY format) are precise to within 7 days, not a specific calendar date.", "Does not support Carrier water heaters.", "If a printed \"MFR DATE\" appears on the data plate, always trust it over the decoded result."],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Carrier', description: 'Internal research record.' },
    { type: 'external', title: 'Building Intelligence Center - Carrier', publisher: 'Building Intelligence Center', description: 'Reference for historical formatting trends.' }
  ],
  supportedFormats: [
  {
    "label": "Modern Standard (10-Character)",
    "example": "4206A12345",
    "exampleType": "Synthetic",
    "description": "Used from ~1985 to present. The first two digits encode the week (01\u201352), and the next two digits encode the year."
  },
  {
    "label": "Legacy (9-Digit)",
    "example": "851212345",
    "exampleType": "Synthetic",
    "description": "Used during the 1980s. The first two digits encode the year (80-89), and the next two digits encode the month."
  }
],
  faqs: [
  {
    "question": "Where can I find the Carrier serial number?",
    "answer": "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel."
  },
  {
    "question": "How do I read a modern Carrier serial number?",
    "answer": "Since roughly 1985, Carrier uses a 10-character format where the first four characters are numbers indicating the week and year of manufacture (WWYY). For example, a serial number starting with \"4206\" was manufactured in the 42nd week of 2006."
  },
  {
    "question": "What if my Carrier serial number is 9 digits and starts with a letter?",
    "answer": "If your serial number is 9 characters and consists entirely of digits (e.g., \"790512345\"), it likely uses the older YYMM format used between 1980 and 1989. In this format, the first two digits are the year and the next two are the month."
  },
  {
    "question": "Does this decoder work for Bryant and Payne?",
    "answer": "Yes. Bryant, Payne, and Day & Night are manufactured by Carrier (United Technologies / Carrier Global). Since the late 1980s, they share the exact same serial number formats and logic as Carrier equipment."
  },
  {
    "question": "Why does the decoder say my pre-1985 Carrier serial number is unsupported?",
    "answer": "Before 1985, Carrier's formatting was highly inconsistent. Serial numbers often require deep historical catalog cross-referencing to decode accurately. To guarantee we never provide you with a false date (\"no guessing\"), we explicitly mark these legacy formats (Styles 3, 4, 5, 6) as unsupported."
  },
  {
    "question": "If there is a date printed directly on the data plate, should I trust it?",
    "answer": "Yes. If your Carrier data plate has a printed \"MFR DATE\" (e.g., MFR DATE: 10/2018), always trust the printed date over the serial number if there is a discrepancy."
  },
  {
    "question": "Does this decoder support Carrier water heaters?",
    "answer": "No. This tool is strictly designed for residential HVAC equipment (air conditioners, furnaces, heat pumps). Water heaters are out of scope."
  }
],
};

const bryant: BrandPageConfig = {
  manufacturerId: 'bryant',
  slug: 'bryant-serial-number-decoder',
  displayName: 'Bryant',
  relatedBrands: [{"name": "Carrier", "slug": "carrier-serial-number-decoder"}, {"name": "Payne", "slug": "payne-serial-number-decoder"}],
  category: 'HVAC',
  pageTitle: 'Bryant Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Bryant HVAC serial numbers. Find out the age and manufacture date of your Bryant air conditioner, furnace, or heat pump.',
  headline: 'Bryant Serial Number Decoder',
  shortDescription: 'Determine the age and manufacture date of your Bryant HVAC equipment. Bryant operates under Carrier and uses the exact same serial number formats, supporting the 10-character WWYY format (~1985-present) and legacy YYMM formats.',
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.",
  limitations: ["Serial numbers manufactured before approximately 1985 (pre-Style 1) cannot be reliably decoded due to inconsistent historical formatting.", "Week-based dates (WWYY format) are precise to within 7 days, not a specific calendar date.", "Does not support Bryant water heaters.", "If a printed \"MFR DATE\" appears on the data plate, always trust it over the decoded result."],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Carrier/Bryant', description: 'Internal research record.' }
  ],
  supportedFormats: [
  {
    "label": "Modern Standard (10-Character)",
    "example": "4206A12345",
    "exampleType": "Synthetic",
    "description": "Used from ~1985 to present. The first two digits encode the week (01\u201352), and the next two digits encode the year."
  },
  {
    "label": "Legacy (9-Digit)",
    "example": "851212345",
    "exampleType": "Synthetic",
    "description": "Used during the 1980s. The first two digits encode the year (80-89), and the next two digits encode the month."
  }
],
  faqs: [
  {
    "question": "Where can I find the Bryant serial number?",
    "answer": "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel."
  },
  {
    "question": "How do I read a modern Bryant serial number?",
    "answer": "Since roughly 1985, Bryant uses a 10-character format where the first four characters are numbers indicating the week and year of manufacture (WWYY). For example, a serial number starting with \"4206\" was manufactured in the 42nd week of 2006."
  },
  {
    "question": "Does this decoder work for Carrier?",
    "answer": "Yes. Bryant is manufactured by Carrier Global. They share the exact same serial number formats and decoding logic."
  },
  {
    "question": "Why does the decoder say my older Bryant serial number is unsupported?",
    "answer": "Before 1985, formatting was highly inconsistent. To guarantee we never provide you with a false date (\"no guessing\"), we explicitly mark these legacy formats as unsupported."
  },
  {
    "question": "If there is a date printed directly on the data plate, should I trust it?",
    "answer": "Yes. If your Bryant data plate has a printed \"MFR DATE\" (e.g., MFR DATE: 10/2018), always trust the printed date over the serial number if there is a discrepancy."
  },
  {
    "question": "Does this decoder support Bryant water heaters?",
    "answer": "No. This tool is strictly designed for residential HVAC equipment (air conditioners, furnaces, heat pumps). Water heaters are out of scope."
  }
],
};

const payne: BrandPageConfig = {
  manufacturerId: 'payne',
  slug: 'payne-serial-number-decoder',
  displayName: 'Payne',
  relatedBrands: [{"name": "Carrier", "slug": "carrier-serial-number-decoder"}, {"name": "Bryant", "slug": "bryant-serial-number-decoder"}],
  category: 'HVAC',
  pageTitle: 'Payne Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Payne HVAC serial numbers. Find out the age and manufacture date of your Payne air conditioner, furnace, or heat pump.',
  headline: 'Payne Serial Number Decoder',
  shortDescription: 'Determine the age and manufacture date of your Payne HVAC equipment. Payne operates under Carrier and uses the exact same serial number formats, primarily the 10-character WWYY format used since the late 1980s.',
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.",
  limitations: ["Serial numbers manufactured before approximately 1985 (pre-Style 1) cannot be reliably decoded due to inconsistent historical formatting.", "Week-based dates (WWYY format) are precise to within 7 days, not a specific calendar date.", "Does not support Payne water heaters.", "If a printed \"MFR DATE\" appears on the data plate, always trust it over the decoded result."],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Carrier/Payne', description: 'Internal research record.' }
  ],
  supportedFormats: [
  {
    "label": "Modern Standard (10-Character)",
    "example": "4206A12345",
    "exampleType": "Synthetic",
    "description": "Used from ~1985 to present. The first two digits encode the week (01\u201352), and the next two digits encode the year."
  },
  {
    "label": "Legacy (9-Digit)",
    "example": "851212345",
    "exampleType": "Synthetic",
    "description": "Used during the 1980s. The first two digits encode the year (80-89), and the next two digits encode the month."
  }
],
  faqs: [
  {
    "question": "Where can I find the Payne serial number?",
    "answer": "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel."
  },
  {
    "question": "How do I read a modern Payne serial number?",
    "answer": "Payne uses a 10-character format where the first four characters are numbers indicating the week and year of manufacture (WWYY). For example, a serial number starting with \"4206\" was manufactured in the 42nd week of 2006."
  },
  {
    "question": "Does this decoder work for Carrier and Bryant?",
    "answer": "Yes. Payne is manufactured by Carrier Global. They share the exact same serial number formats and decoding logic."
  },
  {
    "question": "If there is a date printed directly on the data plate, should I trust it?",
    "answer": "Yes. If your Payne data plate has a printed \"MFR DATE\" (e.g., MFR DATE: 10/2018), always trust the printed date over the serial number if there is a discrepancy."
  },
  {
    "question": "Why does the decoder say my older Payne serial number is unsupported?",
    "answer": "Before 1985, formatting was highly inconsistent. To guarantee we never provide you with a false date (\"no guessing\"), we explicitly mark these legacy formats as unsupported."
  },
  {
    "question": "Does this decoder support Payne water heaters?",
    "answer": "No. This tool is strictly designed for residential HVAC equipment (air conditioners, furnaces, heat pumps). Water heaters are out of scope."
  }
],
};

const goodman: BrandPageConfig = {
  manufacturerId: 'goodman',
  slug: 'goodman-serial-number-decoder',
  displayName: 'Goodman',
  relatedBrands: [{"name": "Amana", "slug": "amana-serial-number-decoder"}],
  category: 'HVAC',
  pageTitle: 'Goodman Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Goodman HVAC serial numbers. Find out the age and manufacture date of your Goodman air conditioner, furnace, or heat pump.',
  headline: 'Goodman Serial Number Decoder',
  shortDescription: 'Determine the age and manufacture date of your Goodman HVAC equipment. Goodman has used a highly consistent 10-digit serial format since 1982, making it one of the most reliable manufacturers to decode.',
  ratingPlateLocation: 'On Goodman outdoor units (air conditioners and heat pumps), the data plate is typically located on the side of the unit, near where the refrigerant lines connect. On indoor furnaces, it is usually pasted on the inside wall of the blower compartment.',
  limitations: ["Goodman serial numbers must be exactly 10 digits. 9-digit entries will not decode.", "Legacy Amana PTAC (Packaged Terminal Air Conditioner) units with letter prefixes or suffixes are not supported by this decoder.", "Serial numbers indicating manufacture before 1982 are outside the documented Goodman format era and will not decode.", "Does not support Goodman water heaters."],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Goodman', description: 'Internal research record.' },
    { type: 'external', title: 'Building Intelligence Center - Goodman', publisher: 'Building Intelligence Center', description: 'Reference for historical formatting trends.' }
  ],
  supportedFormats: [
  {
    "label": "Standard (10-Digit)",
    "example": "2104123456",
    "exampleType": "Synthetic",
    "description": "Used from 1982 to present. The first two digits are the year of manufacture, and the next two digits are the month."
  }
],
  faqs: [
  {
    "question": "Where is the serial number on a Goodman unit?",
    "answer": "On Goodman outdoor units (air conditioners and heat pumps), the data plate is typically on the side of the unit, near where the refrigerant lines connect. On indoor furnaces, it is usually pasted on the inside wall of the blower compartment."
  },
  {
    "question": "How do I read a Goodman serial number?",
    "answer": "Goodman has used a highly consistent 10-digit serial number format (YYMMXXXXXX) since 1982. The first two digits are the year of manufacture, and the next two digits are the month. For example, a serial starting with \"2104\" was built in April 2021."
  },
  {
    "question": "Are Amana and Daikin serial numbers the same as Goodman?",
    "answer": "For most standard residential equipment \u2014 especially after Daikin acquired Goodman, and Goodman acquired the Amana HVAC brand \u2014 the serial number formats are identical: 10 digits starting with YYMM."
  },
  {
    "question": "Why isn't my older Amana PTAC serial number working?",
    "answer": "Older Amana and legacy PTAC (Packaged Terminal Air Conditioner) units often used a 10-character format that included letters at the beginning or end (e.g., starting with \"B\" or ending with \"P\"). SerialAge does not currently support decoding these legacy PTAC formats to avoid providing inaccurate dates."
  },
  {
    "question": "My Goodman serial number has only 9 digits. Can it be decoded?",
    "answer": "Genuine Goodman HVAC serial numbers from 1982 onwards are exactly 10 digits long. If your serial number is 9 digits, double-check the data plate for fading or misreading. Our decoder requires the full 10 digits to guarantee accuracy."
  },
  {
    "question": "Does the Goodman serial number indicate the size or capacity?",
    "answer": "No. The serial number only encodes the manufacture date and production sequence. To find the size, tonnage, or efficiency (SEER rating) of your unit, you must look at the model number, not the serial number."
  }
],
};

const amana: BrandPageConfig = {
  manufacturerId: 'amana',
  slug: 'amana-serial-number-decoder',
  displayName: 'Amana',
  relatedBrands: [{"name": "Goodman", "slug": "goodman-serial-number-decoder"}],
  category: 'HVAC',
  pageTitle: 'Amana Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Amana HVAC serial numbers. Find out the age and manufacture date of your Amana air conditioner, furnace, or heat pump.',
  headline: 'Amana Serial Number Decoder',
  shortDescription: 'Determine the age and manufacture date of your Amana HVAC equipment. Modern Amana equipment uses the same highly consistent 10-digit format as its parent company, Goodman.',
  ratingPlateLocation: 'On Amana outdoor units (air conditioners and heat pumps), the data plate is typically located on the side of the unit, near where the refrigerant lines connect. On indoor furnaces, it is usually pasted on the inside wall of the blower compartment.',
  limitations: ["Requires exactly 10 digits.", "Legacy Amana PTAC (Packaged Terminal Air Conditioner) units with letter prefixes or suffixes are not supported by this decoder.", "Does not support older Amana formats with dashes or spaces.", "Does not support Amana water heaters."],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Goodman/Amana', description: 'Internal research record.' }
  ],
  supportedFormats: [
  {
    "label": "Standard (10-Digit)",
    "example": "2104123456",
    "exampleType": "Synthetic",
    "description": "Used widely on modern equipment. The first two digits are the year, and the next two digits are the month."
  }
],
  faqs: [
  {
    "question": "Where is the serial number on an Amana unit?",
    "answer": "On Amana outdoor units, the data plate is typically located on the side of the unit, near where the refrigerant lines connect. On indoor furnaces, it is usually pasted on the inside wall of the blower compartment."
  },
  {
    "question": "How do I read a modern Amana serial number?",
    "answer": "Modern Amana units use a highly consistent 10-digit serial number format (YYMMXXXXXX). The first two digits are the year of manufacture, and the next two digits are the month. For example, a serial starting with \"2104\" was built in April 2021."
  },
  {
    "question": "Why isn't my older Amana PTAC serial number working?",
    "answer": "Older Amana and legacy PTAC (Packaged Terminal Air Conditioner) units often used a 10-character format that included letters at the beginning or end (e.g., starting with \"B\" or ending with \"P\"). We currently do not support decoding these legacy PTAC formats to avoid providing inaccurate dates."
  },
  {
    "question": "Why won't my old Amana serial number with dashes decode?",
    "answer": "Pre-1997 historical Amana serial numbers (which often contain dashes or spaces, e.g. 96-90391) are poorly documented and not supported. Only modern 10-digit numeric serials are supported."
  },
  {
    "question": "My Amana serial number has only 9 digits. Can it be decoded?",
    "answer": "If it follows the modern Goodman format, it must be exactly 10 digits long. If your serial number is 9 digits, double-check the data plate for fading or misreading."
  },
  {
    "question": "Does this decoder support Amana water heaters?",
    "answer": "No. This tool is explicitly scoped to residential HVAC equipment and does not cover water heaters."
  }
],
};

const lennox: BrandPageConfig = {
  manufacturerId: 'lennox',
  slug: 'lennox-serial-number-decoder',
  displayName: 'Lennox',
  relatedBrands: [],
  category: 'HVAC',
  pageTitle: 'Lennox Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Lennox HVAC serial numbers. Find out the age and manufacture date of your Lennox air conditioner, furnace, or heat pump.',
  headline: 'Lennox Serial Number Decoder',
  shortDescription: 'Determine the age and manufacture date of your Lennox HVAC equipment. Lennox has maintained a continuous, unbroken 10-character serial format since 1974, utilizing specific month-letter codes.',
  ratingPlateLocation: 'On Lennox outdoor units, the data plate is usually on the right side of the unit near the refrigerant line connections. For indoor furnaces, it is typically on the interior cabinet wall, accessible by removing the top front panel.',
  limitations: ["The Lennox modern format began in 1974. Pre-1974 serial numbers are not supported.", "The first two characters of a Lennox serial (the plant/factory code) are not decoded \u2014 they do not affect the manufacture date.", "Month codes skip the letter \"I\" to avoid confusion with the number 1. Serials with \"I\" in the month position will not decode.", "Does not support Lennox water heaters."],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Lennox', description: 'Internal research record.' },
    { type: 'external', title: 'Building Intelligence Center - Lennox', publisher: 'Building Intelligence Center', description: 'Reference for historical formatting trends.' }
  ],
  supportedFormats: [
  {
    "label": "Standard (10-Character)",
    "example": "5806K12345",
    "exampleType": "Synthetic",
    "description": "Used from 1974 to present. Positions 3 and 4 encode the year, and position 5 encodes the month (A-M, skipping I)."
  }
],
  faqs: [
  {
    "question": "Where do I find the Lennox serial number?",
    "answer": "On Lennox outdoor units, the data plate is usually on the right side of the unit near the refrigerant line connections. For indoor furnaces, it is typically located on the interior cabinet wall, accessible by removing the top front panel."
  },
  {
    "question": "How do I decode a Lennox serial number?",
    "answer": "Modern Lennox serial numbers (1974\u2013present) are 10 characters long. The year is encoded at positions 3 and 4, and position 5 is a single letter indicating the month. For example, in \"5806K12345\", \"06\" means 2006, and \"K\" represents October."
  },
  {
    "question": "What do the first two characters of a Lennox serial number mean?",
    "answer": "The first two characters (usually numbers, sometimes letters) represent the factory or plant code where the equipment was manufactured. They do not affect the manufacture date and are not decoded."
  },
  {
    "question": "Which month does the letter in my Lennox serial represent?",
    "answer": "Lennox uses letters A through M for months: A=January, B=February, C=March, D=April, E=May, F=June, G=July, H=August, J=September, K=October, L=November, M=December. The letter \"I\" is intentionally skipped to prevent confusion with the number 1. Letters N through Z are not used as month codes."
  },
  {
    "question": "Does this work for Ducane and Aire-Flo?",
    "answer": "Yes. Ducane, Aire-Flo, Armstrong Air, and Concord are allied brands under Lennox International. Most of their equipment manufactured in the last few decades follows the same 10-character serial format as Lennox equipment."
  },
  {
    "question": "Can a Lennox unit manufactured in the 1970s have a serial that looks like a 2000s unit?",
    "answer": "No. The Lennox format began in 1974. A serial number with \"99\" at positions 3\u20134 means 1999, while \"05\" means 2005. Because the format is continuous and the year is stored as a 2-digit value with a documented century threshold, there is no overlap or ambiguity between decades."
  },
  {
    "question": "Does this decoder support Lennox water heaters?",
    "answer": "No. This tool is explicitly scoped to residential HVAC equipment and does not cover water heaters."
  }
],
};

const trane: BrandPageConfig = {
  manufacturerId: 'trane',
  slug: 'trane-serial-number-decoder',
  displayName: 'Trane',
  relatedBrands: [],
  category: 'HVAC',
  pageTitle: 'Trane Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Trane HVAC serial numbers. Find out the age and manufacture date of your Trane air conditioner, furnace, or heat pump.',
  headline: 'Trane Serial Number Decoder',
  shortDescription: "Determine the age and manufacture date of your Trane HVAC equipment. Trane's serial number formats have evolved significantly over time, transitioning from a 9-character letter-prefix format (1983-2001) to a 10-character numeric format (2010-present).",
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.",
  limitations: ["Pre-1983 Trane serial numbers are highly inconsistent and are intentionally not supported by this decoder.", "Trane serial numbers from 1983 to 2001 use a letter-prefix format. Letters \"I\", \"O\", \"Q\", \"T\", \"U\", \"V\" are skipped.", "Dates are precise to the fiscal week of manufacture, not a specific calendar day.", "Does not support Trane water heaters."],
  sources: [
    { type: 'internal', title: 'Trane Implementation Contract', description: 'Implementation audit.' },
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Trane', description: 'Internal research record.' }
  ],
  supportedFormats: [
  {
    "label": "Modern (10-Character)",
    "example": "11241KADBB",
    "exampleType": "Synthetic",
    "description": "Used from 2010 to present. Characters 1-2 encode the year, and characters 3-4 encode the fiscal week."
  },
  {
    "label": "Standard (9-Character)",
    "example": "814123456",
    "exampleType": "Synthetic",
    "description": "Used from 2002 to 2009. Character 1 encodes the last digit of the year, characters 2-3 encode the week."
  },
  {
    "label": "Letter-Prefix (9-Character)",
    "example": "W04123456",
    "exampleType": "Synthetic",
    "description": "Used from 1983 to 2001. Character 1 is a fixed letter corresponding to a specific year. Characters 2-3 encode the week."
  }
],
  faqs: [
  {
    "question": "Where can I find the Trane serial number?",
    "answer": "The serial number is printed on the data plate. On outdoor units (AC or heat pump), look on the exterior cabinet near the refrigerant valves. For indoor furnaces, the data plate is typically located inside the front access panel."
  },
  {
    "question": "How do I read a modern Trane serial number (2010 to Present)?",
    "answer": "Since 2010, Trane has used a 10-character format where the first two digits indicate the year of manufacture, and the next two digits indicate the fiscal week. For example, a serial starting with \"1124\" was built in the 24th week of 2011."
  },
  {
    "question": "What is the Trane format from 2002 to 2009?",
    "answer": "From 2002 to 2009, Trane used a 9-character format where the very first digit indicates the year. For instance, a serial starting with \"814\" was manufactured in 2008 during the 14th week."
  },
  {
    "question": "How do older Trane serial numbers work (1983 to 2001)?",
    "answer": "Between 1983 and 2001, Trane used a 9-character format starting with a specific letter that mapped to a year. For example, \"W\" is 1983, \"X\" is 1984, and \"R\" is 2000. The two digits following the letter indicate the week."
  },
  {
    "question": "Does this decoder work for American Standard?",
    "answer": "Yes. American Standard and Trane are owned by the same parent company and manufacture identical equipment on the same assembly lines. American Standard serial numbers follow the exact same decoding logic as Trane."
  },
  {
    "question": "Why does the decoder say my pre-1983 serial number is unsupported?",
    "answer": "Prior to 1983, Trane used a highly variable system where year indicators were inconsistently placed (e.g., as the 7th character). Rather than guessing and risking an incorrect date, we intentionally trap these legacy formats and advise checking the data plate instead."
  },
  {
    "question": "Does this decoder support Trane water heaters?",
    "answer": "No. This tool is explicitly scoped to residential HVAC equipment and does not cover water heaters."
  }
],
};

const rheem: BrandPageConfig = {
  manufacturerId: 'rheem',
  slug: 'rheem-serial-number-decoder',
  displayName: 'Rheem',
  relatedBrands: [{"name": "Ruud", "slug": "ruud-serial-number-decoder"}],
  category: 'HVAC',
  pageTitle: 'Rheem Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Rheem HVAC serial numbers. Find out the age and manufacture date of your Rheem air conditioner, furnace, or heat pump.',
  headline: 'Rheem Serial Number Decoder',
  shortDescription: "Determine the age and manufacture date of your Rheem HVAC equipment. Rheem's primary formats include a standard 10-character layout and older formats with an embedded plant code letter.",
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet. For indoor furnaces, look inside the front access panel.",
  limitations: ["Rheem water heater serial numbers (typically 10 all-numeric digits) are not supported by this HVAC decoder.", "Serial numbers less than 10 characters long are not supported.", "The older embedded plant-code format date extraction is based on plant letter position. Always verify against the unit data plate if unsure."],
  sources: [
    { type: 'internal', title: 'Rheem/Ruud Implementation Contract', description: 'Implementation audit.' },
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Rheem/Ruud', description: 'Internal research record.' }
  ],
  supportedFormats: [
  {
    "label": "Modern Standard (10-Character)",
    "example": "W421724596",
    "exampleType": "Synthetic",
    "description": "The first character is the plant code, followed by a 2-digit week, and a 2-digit year (e.g. 42nd week of 2017)."
  },
  {
    "label": "Embedded Plant Code",
    "example": "7351 M2806 16735",
    "exampleType": "Documented",
    "description": "Older format where the plant letter (F, M, G, N, or W) appears in the middle of the string, followed by a 2-digit week and 2-digit year."
  }
],
  faqs: [
  {
    "question": "Where can I find the Rheem serial number?",
    "answer": "The serial number is printed on the data plate. On outdoor units (AC or heat pump), look on the exterior cabinet. For indoor furnaces, the data plate is typically located inside the front access panel."
  },
  {
    "question": "How do I read a modern Rheem serial number?",
    "answer": "Modern Rheem serial numbers use a 10-character format starting with a letter. The letter is the plant code. The next two digits are the week of manufacture, and the two digits after that are the year. For example, \"W421724596\" means the 42nd week of 2017."
  },
  {
    "question": "What is the older Rheem embedded plant code format?",
    "answer": "Older Rheem serial numbers (often 10\u201317 characters long) embed the plant code letter (F, M, G, N, or W) in the middle of the string. The two digits immediately following the plant letter are the week, and the next two are the year."
  },
  {
    "question": "Why did my Rheem serial number fail to decode despite looking valid?",
    "answer": "For safety, the decoder requires the embedded plant format to have a mixed alphanumeric prefix before the plant code. Pure-alpha or pure-digit prefixes are rejected to prevent accidental decoding of model numbers or garbage data."
  },
  {
    "question": "Are Ruud and Rheem serial formats identical?",
    "answer": "Yes. Ruud and Rheem are manufactured by the same company and use identical serial number formats and logic."
  },
  {
    "question": "Does this tool decode Rheem water heater serial numbers?",
    "answer": "No. This tool is strictly designed for residential HVAC equipment (air conditioners, furnaces, heat pumps). Rheem water heaters, which often use all-numeric 10-digit serials, are out of scope."
  }
],
};

const ruud: BrandPageConfig = {
  manufacturerId: 'ruud',
  slug: 'ruud-serial-number-decoder',
  displayName: 'Ruud',
  relatedBrands: [{"name": "Rheem", "slug": "rheem-serial-number-decoder"}],
  category: 'HVAC',
  pageTitle: 'Ruud Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Ruud HVAC serial numbers. Find out the age and manufacture date of your Ruud air conditioner, furnace, or heat pump.',
  headline: 'Ruud Serial Number Decoder',
  shortDescription: 'Determine the age and manufacture date of your Ruud HVAC equipment. Ruud operates under Rheem and uses the exact same serial number formats, including the standard 10-character layout and embedded plant code formats.',
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet. For indoor furnaces, look inside the front access panel.",
  limitations: ["Ruud water heater serial numbers (typically 10 all-numeric digits) are not supported by this HVAC decoder.", "Serial numbers less than 10 characters long are not supported.", "The older embedded plant-code format date extraction is based on plant letter position. Always verify against the unit data plate if unsure."],
  sources: [
    { type: 'internal', title: 'Rheem/Ruud Implementation Contract', description: 'Implementation audit.' },
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Rheem/Ruud', description: 'Internal research record.' }
  ],
  supportedFormats: [
  {
    "label": "Modern Standard (10-Character)",
    "example": "W421724596",
    "exampleType": "Synthetic",
    "description": "The first character is the plant code, followed by a 2-digit week, and a 2-digit year (e.g. 42nd week of 2017)."
  },
  {
    "label": "Embedded Plant Code",
    "example": "7351 M2806 16735",
    "exampleType": "Documented",
    "description": "Older format where the plant letter (F, M, G, N, or W) appears in the middle of the string, followed by a 2-digit week and 2-digit year."
  }
],
  faqs: [
  {
    "question": "Where can I find the Ruud serial number?",
    "answer": "The serial number is printed on the data plate. On outdoor units (AC or heat pump), look on the exterior cabinet. For indoor furnaces, the data plate is typically located inside the front access panel."
  },
  {
    "question": "How do I read a modern Ruud serial number?",
    "answer": "Modern Ruud serial numbers use a 10-character format starting with a letter. The letter is the plant code. The next two digits are the week of manufacture, and the two digits after that are the year. For example, \"W421724596\" means the 42nd week of 2017."
  },
  {
    "question": "What is the older Ruud embedded plant code format?",
    "answer": "Older Ruud serial numbers (often 10\u201317 characters long) embed the plant code letter (F, M, G, N, or W) in the middle of the string. The two digits immediately following the plant letter are the week, and the next two are the year."
  },
  {
    "question": "Why did my Ruud serial number fail to decode despite looking valid?",
    "answer": "For safety, the decoder requires the embedded plant format to have a mixed alphanumeric prefix before the plant code. Pure-alpha or pure-digit prefixes are rejected to prevent accidental decoding of model numbers or garbage data."
  },
  {
    "question": "Are Ruud and Rheem serial formats identical?",
    "answer": "Yes. Ruud and Rheem are manufactured by the same company and use identical serial number formats and logic."
  },
  {
    "question": "Does this tool decode Ruud water heater serial numbers?",
    "answer": "No. This tool is strictly designed for residential HVAC equipment (air conditioners, furnaces, heat pumps). Ruud water heaters, which often use all-numeric 10-digit serials, are out of scope."
  }
],
};

const york: BrandPageConfig = {
  manufacturerId: 'york',
  slug: 'york-serial-number-decoder',
  displayName: 'York',
  relatedBrands: [],
  category: 'HVAC',
  pageTitle: 'York Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for York HVAC serial numbers. Find out the age and manufacture date of your York air conditioner, furnace, or heat pump.',
  headline: 'York Serial Number Decoder',
  shortDescription: "Determine the age and manufacture date of your York HVAC equipment. York's historical serial numbering incorporates a notoriously complex 21-year repeating letter cycle which can result in intentional ambiguity.",
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, check inside the front access panel.",
  limitations: ["The 1971-2004 format repeats the year letter every 21 years (e.g., A = 1971 OR 1992). The decoder will correctly identify this as ambiguous and provide both years for letters A through N.", "Serial numbers indicating manufacture before 1971 are highly inconsistent and not supported.", "9-character legacy variations (missing the leading plant code) are intentionally rejected to prevent false positives.", "Water heater serial numbers are out of scope."],
  ambiguity: "York used a repeating 21-year letter cycle from 1971 to 2004. Serial numbers with year letters A through N could belong to either the 1971-1983 cycle or the 1992-2004 cycle. Our decoder intentionally returns both possible years when it detects this ambiguity. You must visually inspect the unit's condition and refrigerant type to determine the correct era.",
  sources: [
    { type: 'internal', title: 'York Implementation Contract', description: 'Implementation audit.' },
    { type: 'external', title: 'Building Intelligence Center - York', publisher: 'Building Intelligence Center', description: 'Reference for historical formatting trends.' }
  ],
  supportedFormats: [
  {
    "label": "Post-2004 (10-Character)",
    "example": "W0K5896070",
    "exampleType": "Verified",
    "description": "Used from October 2004 to present. Positions 2 and 4 form a 2-digit year code (e.g. 0 and 5 = 2005). Position 3 is a letter representing the month."
  },
  {
    "label": "1971-2004 (10-Character)",
    "example": "WAKM011379",
    "exampleType": "Verified",
    "description": "Position 2 is the month letter, Position 3 is the year letter. Letters A-N map to two possible years."
  }
],
  faqs: [
  {
    "question": "Where is the serial number on a York unit?",
    "answer": "The serial number is located on the rating data plate (sticker) found on the interior or exterior of the unit."
  },
  {
    "question": "How do I read a post-2004 York serial number?",
    "answer": "In the modern 10-character format, position 2 and position 4 combine to form a 2-digit year (e.g., '0' and '5' = 2005). Position 3 is a letter representing the month."
  },
  {
    "question": "Why does my York serial number return two possible years?",
    "answer": "Between 1971 and 2004, York used a 21-year letter cycle for the year of manufacture. The letters A through N were used twice. For example, 'A' can mean 1971 or 1992. Our decoder intentionally returns both years to ensure accuracy rather than guessing."
  },
  {
    "question": "How do I tell which year is correct for my ambiguous York unit?",
    "answer": "You can distinguish a 1970s unit from a 1990s unit by looking at the general condition, efficiency ratings, or the type of refrigerant listed on the data plate. Also, checking the ANSI standard date on the plate can often help pinpoint the decade."
  },
  {
    "question": "Does this decoder support older 9-character York formats?",
    "answer": "No. Older 9-character variations (often missing the leading plant code) are not supported due to high variability and risk of false positives."
  },
  {
    "question": "Does this decoder work for Coleman and Luxaire?",
    "answer": "Yes. York (acquired by Johnson Controls) shares the modern post-2004 10-character format across its alias brands, including Coleman, Luxaire, Champion, and Evcon."
  },
  {
    "question": "Does this tool decode York water heater serial numbers?",
    "answer": "No. This tool is strictly designed for residential HVAC equipment (air conditioners, furnaces, heat pumps). Water heaters are out of scope."
  }
],
};

export const ALL_BRAND_PAGES: BrandPageConfig[] = [
  carrier, bryant, payne, goodman, amana, lennox, trane, rheem, ruud, york
];

export function getBrandPageBySlug(slug: string): BrandPageConfig | undefined {
  return ALL_BRAND_PAGES.find((b) => b.slug === slug);
}

export function getAllBrandPages(): BrandPageConfig[] {
  return ALL_BRAND_PAGES;
}
