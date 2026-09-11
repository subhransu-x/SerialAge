import React from 'react';
import { Link } from 'react-router-dom';

export interface FaqItem {
  question: string;
  answer: string | React.ReactNode;
  answerSchema?: string;
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
  shortDescription: string | React.ReactNode;
  shortDescriptionSchema?: string;
  ratingPlateLocation: string | React.ReactNode;
  limitations: string[];
  faqs: FaqItem[];
  supportedFormats: SupportedFormat[];
  ambiguity?: string | React.ReactNode;
  sources: SourceConfig[];
  headings?: {
    whereToFind?: string;
    supportedFormats?: string;
    faqs?: string;
  };
  customContent?: React.ReactNode;
}

const carrier: BrandPageConfig = {
  manufacturerId: 'carrier',
  slug: 'carrier-serial-number-decoder',
  displayName: 'Carrier',
  relatedBrands: [{"name": "Bryant", "slug": "bryant-serial-number-decoder"}, {"name": "Payne", "slug": "payne-serial-number-decoder"}],
  category: 'HVAC',
  pageTitle: 'Carrier Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Carrier HVAC serial numbers. Find out the exact age and manufacture date of your Carrier air conditioner, furnace, or heat pump.',
  headline: 'Carrier Serial Number Decoder',
  shortDescription: (
    <>
      Determine the manufacture date and age of your Carrier HVAC equipment. This decoder supports modern 10-character formats (commonly used from approximately 1980 to the present) as well as documented historical formats from the 1970s and 1980s. The decoded manufacture date estimates when the equipment was built at the factory, which may differ from its installation or purchase date.
    </>
  ),
  shortDescriptionSchema: "Determine the manufacture date and age of your Carrier HVAC equipment. This decoder supports modern 10-character formats (commonly used from approximately 1980 to the present) as well as documented historical formats from the 1970s and 1980s. The decoded manufacture date estimates when the equipment was built at the factory, which may differ from its installation or purchase date.",
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.",
  limitations: [
    "Week-based dates (WWYY format) are precise to within 7 days, not a specific calendar date.",
    "Serial numbers ending in a letter (e.g., 1234567ABC) are an older format that cannot be safely decoded because the pattern is too broad and risks false positives.",
    "The decoded manufacture date is not the installation date.",
    "Does not support Carrier water heaters.",
    "If a printed \"MFR DATE\" appears on the data plate, always trust it over the decoded result."
  ],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Carrier', description: 'Internal research record.' },
    { type: 'external', title: 'Building Intelligence Center - Carrier', publisher: 'Building Intelligence Center', description: 'Reference for historical formatting trends.' }
  ],
  headings: {
    whereToFind: "Where to Find Your Carrier Serial Number",
    supportedFormats: "Carrier Serial Number Formats",
    faqs: "Carrier Serial Number FAQs"
  },
  customContent: (
    <>
      <div className="s-eye">Serial Formats</div>
      <h2 className="s-head" id="how-it-works">How Carrier Serial Numbers Work</h2>
      
      <p className="re-body-list" style={{ marginTop: '16px', marginBottom: '32px' }}>
        Carrier and its allied brands (like Bryant and Payne in the BDP Company) have used several different serial number formats over the decades. Our decoder supports the documented Carrier-family formats below. Read our <Link to="/methodology" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Methodology page</Link> for our full sourcing and decoding approach.
      </p>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>Supported Carrier Formats</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px', marginBottom: '32px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--hairline)', color: 'var(--ink)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Format</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Example</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Era / Usage</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>How to Read It</th>
            </tr>
          </thead>
          <tbody style={{ color: 'var(--mute)' }}>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Modern (WWYY)</td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>4006A17330</td>
              <td style={{ padding: '12px 16px' }}>~1980 to present</td>
              <td style={{ padding: '12px 16px' }}>Digits 1-2 = Week, Digits 3-4 = Year</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Numeric (YYMM)</td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>850304091</td>
              <td style={{ padding: '12px 16px' }}>1980s</td>
              <td style={{ padding: '12px 16px' }}>Digits 1-2 = Year, Digits 3-4 = Month</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Month Letter</td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>W4D14008</td>
              <td style={{ padding: '12px 16px' }}>1980–1984</td>
              <td style={{ padding: '12px 16px' }}>Letter = Month (M-Z, skipping O, U), Digit = Year</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Decade Ambiguous</td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>A167890</td>
              <td style={{ padding: '12px 16px' }}>1970–1979 (or 1960s)</td>
              <td style={{ padding: '12px 16px' }}>Letter 1 = Month (A-L), Digit 2 = Year (0-9)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>Historical Format Details</h3>
      <p className="re-body-list" style={{ marginBottom: '16px' }}>
        <strong>Modern WWYY Format:</strong> Commonly used from approximately 1980 onward. In this documented format, the first two digits equal the production week, the next two digits equal the year, followed by a plant letter and sequence. For example, <strong>4006A17330</strong> was manufactured in Week 40 of 2006. <strong>0180A12345</strong> was manufactured in Week 1 of 1980.
      </p>
      <p className="re-body-list" style={{ marginBottom: '16px' }}>
        <strong>1980–1984 Month Letter Format:</strong> This documented Carrier-family format uses a letter to indicate the month and a single digit for the year. The month letter could be the first or second character due to US/Canada positional differences. For example, both <strong>W4D14008</strong> and <strong>4WD14008</strong> translate to September 1984. The complete month mapping is as follows (O and U are skipped):
      </p>
      <ul className="re-body-list" style={{ margin: '0 0 16px 20px', color: 'var(--ink)' }}>
        <li>M = January</li>
        <li>N = February</li>
        <li>P = March</li>
        <li>Q = April</li>
        <li>R = May</li>
        <li>S = June</li>
        <li>T = July</li>
        <li>V = August</li>
        <li>W = September</li>
        <li>X = October</li>
        <li>Y = November</li>
        <li>Z = December</li>
      </ul>
      <p className="re-body-list" style={{ marginBottom: '32px' }}>
        <strong>1970s Ambiguous Format:</strong> Before 1980, this historical Carrier-family format used a single letter (A through L for January through December) for the month and a single digit (0-9) for the year. For example, <strong>A167890</strong> translates to January 1971. A serial starting with <strong>A912345</strong> translates to January of a year ending in 9. The serial number alone cannot definitively confirm whether it was built in 1969 or 1979, so we provide both possibilities.
      </p>
    </>
  ),
  supportedFormats: [
    {
      label: "Modern Standard (10-Character)",
      example: "4006A17330",
      exampleType: "Verified",
      description: "Commonly used from ~1980 to present. The first two digits encode the week (01–52), and the next two digits encode the year."
    },
    {
      label: "Legacy Numeric (YYMM)",
      example: "850304091",
      exampleType: "Verified",
      description: "Used during the 1980s. The first two digits encode the year, and the next two digits encode the month."
    },
    {
      label: "Historical (1980-1984)",
      example: "W4D14008",
      exampleType: "Verified",
      description: "Used from 1980 to 1984. The month is a letter (M-Z, skipping O & U), followed by the year."
    },
    {
      label: "Historical (Ambiguous Decade)",
      example: "A912345",
      exampleType: "Verified",
      description: "Month letter (A-L) and single year digit. Cannot determine exact decade (e.g., 1969 or 1979)."
    }
  ],
  faqs: [
    {
      question: "How do I read a Carrier serial number?",
      answer: "Since approximately 1980, the most common Carrier serial number format is 10 characters long, where the first two digits represent the week of manufacture and the next two digits represent the year (WWYY). For example, a serial starting with '4006' was manufactured in the 40th week of 2006. Older units may use different formats like YYMM or letters for months."
    },
    {
      question: "How old is my Carrier HVAC?",
      answer: "Enter your serial number into the decoder above. It will extract the manufacture date from the serial number and calculate its age. Keep in mind that the manufacture date is when the unit was built at the factory, which may be months before the actual installation date."
    },
    {
      question: "Where is the Carrier serial number?",
      answer: "The serial number is printed on the manufacturer's data plate (rating plate). On outdoor AC or heat pump units, look on the side or back of the cabinet above the refrigerant valves. On indoor furnaces or air handlers, look inside the front access panel."
    },
    {
      question: "What do the first four digits mean?",
      answer: "In the modern Carrier format, the first four digits are the date code. The first two digits represent the week of the year (01 to 52), and the third and fourth digits represent the year. For instance, '0180' means the 1st week of 1980."
    },
    {
      question: "Can older Carrier units be decoded?",
      answer: "Yes, many older formats can be decoded. For example, documented Carrier-family formats used a letter to represent the month between 1980 and 1984 (M through Z, skipping O and U) and 1970–1979 (A through L). However, some older formats cannot be safely decoded because the pattern is too broad and risks false positives."
    },
    {
      question: "Why does my Carrier serial number show two possible years?",
      answer: "Before 1980, certain Carrier-family formats used a single digit to represent the year (0 through 9). For example, a serial number starting with 'A9' indicates January of a year ending in 9. Without additional context, the serial number alone cannot definitively confirm whether it was built in 1969 or 1979, so we provide both possibilities."
    },
    {
      question: "Why does my Carrier serial number not work?",
      answer: "Your serial number might not work if it uses an unsupported historical format, if it's missing characters, or if it is for a product we don't cover (like Carrier water heaters). Double-check the data plate to ensure you aren't accidentally entering the model number."
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
  limitations: [
    "Serial numbers manufactured before approximately 1985 (pre-Style 1) cannot be reliably decoded due to inconsistent historical formatting.",
    "Week-based dates (WWYY format) are precise to within 7 days, not a specific calendar date.",
    "Does not support Bryant water heaters.",
    "If a printed \"MFR DATE\" appears on the data plate, always trust it over the decoded result."
  ],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Carrier/Bryant', description: 'Internal research record.' }
  ],
  supportedFormats: [
    {
      label: "Modern Standard (10-Character)",
      example: "4206A12345",
      exampleType: "Synthetic",
      description: "Used from ~1985 to present. The first two digits encode the week (01\u201352), and the next two digits encode the year."
    },
    {
      label: "Legacy (9-Digit)",
      example: "851212345",
      exampleType: "Synthetic",
      description: "Used during the 1980s. The first two digits encode the year (80-89), and the next two digits encode the month."
    }
  ],
  faqs: [
    {
      question: "Where can I find the Bryant serial number?",
      answer: "The serial number is on the manufacturer's data plate. On outdoor AC or heat pump units, look on the side or back of the cabinet above the refrigerant valves. On indoor furnaces or air handlers, look inside the front access panel."
    },
    {
      question: "How do I check the age of my Bryant air conditioner or furnace?",
      answer: "Enter the serial number from your unit's data plate into the decoder above with 'Bryant' selected. Since roughly 1985, Bryant has used a 10-character format where the first two digits are the week of manufacture and the next two are the year (WWYY). For example, a serial starting with '4206' was manufactured in the 42nd week of 2006."
    },
    {
      question: "Does this decoder work for Carrier?",
      answer: "Yes. Bryant is manufactured by Carrier Global and uses the exact same serial number formats and decoding logic as Carrier equipment."
    },
    {
      question: "Why does the decoder say my older Bryant serial number is unsupported?",
      answer: "Before 1985, formatting was highly inconsistent. To ensure we never provide a false date, we explicitly mark these legacy formats as unsupported."
    },
    {
      question: "If there is a date printed directly on the data plate, should I trust it?",
      answer: "Yes. If your Bryant data plate shows a printed 'MFR DATE' (for example, MFR DATE: 10/2018), always use the printed date over the decoded result if they differ."
    },
    {
      question: "Does this decoder support Bryant water heaters?",
      answer: "No. This tool is designed for residential HVAC equipment — air conditioners, furnaces, and heat pumps. Water heaters are out of scope."
    }
  ],
};

const payne: BrandPageConfig = {
  manufacturerId: 'payne',
  slug: 'payne-serial-number-decoder',
  displayName: 'Payne',
  relatedBrands: [{"name": "Carrier", "slug": "carrier-serial-number-decoder"}, {"name": "Bryant", "slug": "bryant-serial-number-decoder"}],
  category: 'HVAC',
  pageTitle: 'Payne Serial Number Decoder — Find HVAC Age | SerialAge',
  metaDescription: 'Free decoder for Payne HVAC serial numbers. Find the exact age and manufacture date of your equipment. Payne operates under Carrier and uses the same formats.',
  headline: 'Payne Serial Number Decoder: Find Your HVAC Age',
  shortDescription: (
    <>
      Payne is a long-standing HVAC brand that became part of the BDP Company formed by <Link to="/carrier-serial-number-decoder" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Carrier</Link> in 1974. Today, Payne remains a Carrier brand, meaning Payne serial numbers use Carrier/BDP-family conventions. Use this decoder to determine the manufacture date and age of your Payne equipment.
    </>
  ),
  shortDescriptionSchema: "Payne is a long-standing HVAC brand that became part of the BDP Company formed by Carrier in 1974. Today, Payne remains a Carrier brand, meaning Payne serial numbers use Carrier/BDP-family conventions. Use this decoder to determine the manufacture date and age of your Payne equipment.",
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.",
  limitations: [
    "Serial numbers manufactured before approximately 1985 (pre-Style 1) cannot be reliably decoded due to inconsistent historical formatting.",
    "Week-based dates (WWYY format) are precise to within 7 days, not a specific calendar date.",
    "Does not support Payne water heaters.",
    "If a printed \"MFR DATE\" appears on the data plate, always trust it over the decoded result."
  ],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Carrier/Payne', description: 'Internal research record.' }
  ],
  headings: {
    whereToFind: "Where to Find Your Payne Serial Number",
    supportedFormats: "Payne Serial Number Formats",
    faqs: "Payne Serial Number FAQs"
  },
  customContent: (
    <>
      <div className="s-eye">Serial Formats</div>
      <h2 className="s-head" id="how-it-works">How Payne Serial Numbers Work</h2>
      
      <p className="re-body-list" style={{ marginTop: '16px' }}>
        Older Payne equipment may use different historical formats, so you should not assume the modern rule applies to every unit. Read our <Link to="/methodology" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Methodology page</Link> for our full sourcing and decoding approach.
      </p>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginTop: '32px', marginBottom: '16px' }}>Worked Example: 4006A17330</h3>
      <p className="re-body-list" style={{ marginBottom: '16px' }}>
        For a unit with the modern serial number <strong>4006A17330</strong>, here is how the age is determined:
      </p>
      <ul className="re-body-list" style={{ margin: '0 0 32px 20px', color: 'var(--ink)' }}>
        <li style={{ marginBottom: '8px' }}><strong>40</strong> = Manufactured in the 40th week</li>
        <li style={{ marginBottom: '8px' }}><strong>06</strong> = Manufactured in the year 2006</li>
        <li style={{ marginBottom: '8px' }}><strong>A</strong> = Plant / production letter</li>
        <li style={{ marginBottom: '8px' }}><strong>17330</strong> = Production / sequence information</li>
      </ul>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>5 Verified Payne Styles</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--hairline)', color: 'var(--ink)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Style</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Example</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Era / Usage</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date Code Format</th>
            </tr>
          </thead>
          <tbody style={{ color: 'var(--mute)' }}>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Modern Style</td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>4006A17330</td>
              <td style={{ padding: '12px 16px' }}>~1985 to present</td>
              <td style={{ padding: '12px 16px' }}>Positions 1-2 = Week, Positions 3-4 = Year</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Style 2</td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>850304091</td>
              <td style={{ padding: '12px 16px' }}>1980s</td>
              <td style={{ padding: '12px 16px' }}>Positions 1-2 = Year, Positions 3-4 = Month</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Style 3</td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>W4D14008</td>
              <td style={{ padding: '12px 16px' }}>1980–1984</td>
              <td style={{ padding: '12px 16px' }}>Position 1 = Month code, Position 2 = Year code</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Style 4</td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>A167890</td>
              <td style={{ padding: '12px 16px' }}>1970–1979</td>
              <td style={{ padding: '12px 16px' }}>Position 1 = Month code, Position 2 = Year code</td>
            </tr>
            <tr>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Style 5</td>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>6######</td>
              <td style={{ padding: '12px 16px' }}>Prior to 1970</td>
              <td style={{ padding: '12px 16px' }}>First digit represents the year</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  ),
  supportedFormats: [
    {
      label: "Modern Standard (10-Character)",
      example: "4206A12345",
      exampleType: "Synthetic",
      description: "Used from ~1985 to present. The first two digits encode the week (01\u201352), and the next two digits encode the year."
    },
    {
      label: "Legacy (9-Digit)",
      example: "851212345",
      exampleType: "Synthetic",
      description: "Used during the 1980s. The first two digits encode the year (80-89), and the next two digits encode the month."
    }
  ],
  faqs: [
    {
      question: "Is a Payne serial number the same as a Carrier or Bryant serial number?",
      answer: (
        <>
          Yes. Payne is a brand under Carrier Global, and its equipment uses the exact same serial number formats and date codes as <Link to="/carrier-serial-number-decoder" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Carrier</Link> and <Link to="/bryant-serial-number-decoder" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Bryant</Link>. The logic to determine the manufacture date is identical across all three brands.
        </>
      ),
      answerSchema: "Yes. Payne is a brand under Carrier Global, and its equipment uses the exact same serial number formats and date codes as Carrier and Bryant. The logic to determine the manufacture date is identical across all three brands."
    },
    {
      question: "What is the difference between a Payne model number and serial number?",
      answer: "The model number identifies the specific design, efficiency, and capacity of your Payne equipment. The serial number is a unique identifier for your exact unit and contains the date it was built. You need the serial number—not the model number—to determine the age of the equipment."
    },
    {
      question: "What does the manufacture date in a Payne serial number mean?",
      answer: "The manufacture date encoded in your Payne serial number tells you exactly when the unit left the factory. It is not the same as the installation date. While most warranties begin on the installation date, the manufacture date is the baseline used to determine the age of the equipment."
    },
    {
      question: "What if my Payne serial number uses an older format?",
      answer: (
        <>
          Prior to 1985, Payne used several different legacy formats that were not perfectly standardized. Our decoder specifically supports the reliable 9 and 10-character formats. For vintage units manufactured before 1980, consult our <Link to="/methodology" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Methodology page</Link> to manually compare historical date codes.
        </>
      ),
      answerSchema: "Prior to 1985, Payne used several different legacy formats that were not perfectly standardized. Our decoder specifically supports the reliable 9 and 10-character formats. For vintage units manufactured before 1980, consult our Methodology page to manually compare historical date codes."
    },
    {
      question: "What if my Payne serial number is hard to read?",
      answer: "If the data plate on your Payne outdoor unit has faded due to sun or weather exposure, you can often find a secondary barcode sticker inside the electrical panel. Alternatively, you can check your original installation invoice or warranty registration paperwork for the recorded serial number."
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
  limitations: [
    "Goodman serial numbers must be exactly 10 digits. 9-digit entries will not decode.",
    "Legacy Amana PTAC (Packaged Terminal Air Conditioner) units with letter prefixes or suffixes are not supported by this decoder.",
    "Serial numbers indicating manufacture before 1982 are outside the documented Goodman format era and will not decode.",
    "Does not support Goodman water heaters."
  ],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Goodman', description: 'Internal research record.' },
    { type: 'external', title: 'Building Intelligence Center - Goodman', publisher: 'Building Intelligence Center', description: 'Reference for historical formatting trends.' }
  ],
  supportedFormats: [
    {
      label: "Standard (10-Digit)",
      example: "2104123456",
      exampleType: "Synthetic",
      description: "Used from 1982 to present. The first two digits are the year of manufacture, and the next two digits are the month."
    }
  ],
  faqs: [
    {
      question: "Where is the serial number on a Goodman unit?",
      answer: "On Goodman outdoor units (air conditioners and heat pumps), the data plate is typically on the side of the unit, near where the refrigerant lines connect. On indoor furnaces, it is usually pasted on the inside wall of the blower compartment."
    },
    {
      question: "How do I check the age of my Goodman air conditioner or furnace?",
      answer: "Enter the serial number from your unit's data plate into the decoder above with 'Goodman' selected. Goodman has used a consistent 10-digit format since 1982 where the first two digits are the year and the next two are the month (YYMMXXXXXX). For example, a serial starting with '2104' was manufactured in April 2021."
    },
    {
      question: "Are Amana and Daikin serial numbers the same as Goodman?",
      answer: "For most standard residential equipment — especially after Daikin acquired Goodman, and Goodman acquired the Amana HVAC brand — the serial number formats are identical: 10 digits starting with YYMM."
    },
    {
      question: "Why isn't my older Amana PTAC serial number working?",
      answer: "Older Amana and legacy PTAC (Packaged Terminal Air Conditioner) units used a 10-character format with letters at the beginning or end (for example, starting with 'B' or ending with 'P'). SerialAge does not currently support these legacy PTAC formats to avoid providing inaccurate dates."
    },
    {
      question: "My Goodman serial number has only 9 digits. Can it be decoded?",
      answer: "Goodman HVAC serial numbers from 1982 onwards are exactly 10 digits long. If your serial number is 9 digits, check the data plate for fading or a misread character. The decoder requires the full 10 digits."
    },
    {
      question: "Does the Goodman serial number indicate the size or capacity?",
      answer: "No. The serial number only encodes the manufacture date and production sequence. To find the tonnage, SEER rating, or product capacity, look at the model number on the same data plate."
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
  limitations: [
    "Requires exactly 10 digits.",
    "Legacy Amana PTAC (Packaged Terminal Air Conditioner) units with letter prefixes or suffixes are not supported by this decoder.",
    "Does not support older Amana formats with dashes or spaces.",
    "Does not support Amana water heaters."
  ],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Goodman/Amana', description: 'Internal research record.' }
  ],
  supportedFormats: [
    {
      label: "Standard (10-Digit)",
      example: "2104123456",
      exampleType: "Synthetic",
      description: "Used widely on modern equipment. The first two digits are the year, and the next two digits are the month."
    }
  ],
  faqs: [
    {
      question: "Where is the serial number on an Amana unit?",
      answer: "On Amana outdoor units, the data plate is typically on the side of the unit, near where the refrigerant lines connect. On indoor furnaces, it is usually pasted on the inside wall of the blower compartment."
    },
    {
      question: "How do I check the age of my Amana air conditioner or furnace?",
      answer: "Enter the serial number from your unit's data plate into the decoder above with 'Amana' selected. Modern Amana equipment uses the same 10-digit format as its parent company, Goodman, where the first two digits are the year and the next two are the month (YYMMXXXXXX). For example, a serial starting with '2104' was manufactured in April 2021."
    },
    {
      question: "Why isn't my older Amana PTAC serial number working?",
      answer: "Older Amana and legacy PTAC (Packaged Terminal Air Conditioner) units used a 10-character format with letters at the beginning or end. SerialAge does not currently support these legacy PTAC formats to avoid providing inaccurate dates."
    },
    {
      question: "Why won't my old Amana serial number with dashes decode?",
      answer: "Pre-1997 Amana serial numbers — which often contain dashes or spaces — are poorly documented and are not supported. Only the modern 10-digit numeric format is supported."
    },
    {
      question: "My Amana serial number has only 9 digits. Can it be decoded?",
      answer: "Modern Amana equipment uses the same format as Goodman, which requires exactly 10 digits. If your serial number is 9 digits, check the data plate carefully for a faded or misread character."
    },
    {
      question: "Does this decoder support Amana water heaters?",
      answer: "No. This tool is designed for residential HVAC equipment — air conditioners, furnaces, and heat pumps. Water heaters are out of scope."
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
  limitations: [
    "The Lennox modern format began in 1974. Pre-1974 serial numbers are not supported.",
    "The first two characters of a Lennox serial (the plant/factory code) are not decoded \u2014 they do not affect the manufacture date.",
    "Month codes skip the letter \"I\" to avoid confusion with the number 1. Serials with \"I\" in the month position will not decode.",
    "Does not support Lennox water heaters."
  ],
  sources: [
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Lennox', description: 'Internal research record.' },
    { type: 'external', title: 'Building Intelligence Center - Lennox', publisher: 'Building Intelligence Center', description: 'Reference for historical formatting trends.' }
  ],
  supportedFormats: [
    {
      label: "Standard (10-Character)",
      example: "5806K12345",
      exampleType: "Synthetic",
      description: "Used from 1974 to present. Positions 3 and 4 encode the year, and position 5 encodes the month (A-M, skipping I)."
    }
  ],
  faqs: [
    {
      question: "Where do I find the Lennox serial number?",
      answer: "On Lennox outdoor units, the data plate is usually on the right side of the unit near the refrigerant line connections. For indoor furnaces, it is typically located on the interior cabinet wall, accessible by removing the top front panel."
    },
    {
      question: "How do I check the age of my Lennox air conditioner or furnace?",
      answer: "Enter the serial number from your unit's data plate into the decoder above with 'Lennox' selected. Lennox has used a consistent 10-character format since 1974. Positions 3 and 4 encode the two-digit year, and position 5 is a letter representing the month. For example, in '5806K12345', '06' means 2006 and 'K' represents October."
    },
    {
      question: "What do the first two characters of a Lennox serial number mean?",
      answer: "The first two characters represent the factory or plant code where the equipment was manufactured. They do not affect the manufacture date and are not decoded."
    },
    {
      question: "Which month does the letter in my Lennox serial represent?",
      answer: "Lennox uses letters A through M for months: A=January, B=February, C=March, D=April, E=May, F=June, G=July, H=August, J=September, K=October, L=November, M=December. The letter 'I' is intentionally skipped to prevent confusion with the number 1. Letters N through Z are not used as month codes."
    },
    {
      question: "Does this work for Ducane and Aire-Flo?",
      answer: "Yes. Ducane, Aire-Flo, Armstrong Air, and Concord are allied brands under Lennox International. Most of their equipment manufactured in the last few decades follows the same 10-character serial format as Lennox."
    },
    {
      question: "Can a Lennox unit manufactured in the 1970s have a serial that looks like a 2000s unit?",
      answer: "No. The Lennox format began in 1974 and uses a continuous two-digit year. A serial with '99' at positions 3\u20134 means 1999, while '05' means 2005. There is no repeating cycle or ambiguity between decades."
    },
    {
      question: "Does this decoder support Lennox water heaters?",
      answer: "No. This tool is designed for residential HVAC equipment — air conditioners, furnaces, and heat pumps. Water heaters are out of scope."
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
  limitations: [
    "Pre-1983 Trane serial numbers are highly inconsistent and are intentionally not supported by this decoder.",
    "Trane serial numbers from 1983 to 2001 use a letter-prefix format. Letters \"I\", \"O\", \"Q\", \"T\", \"U\", \"V\" are skipped.",
    "Dates are precise to the fiscal week of manufacture, not a specific calendar day.",
    "Does not support Trane water heaters."
  ],
  sources: [
    { type: 'internal', title: 'Trane Implementation Contract', description: 'Implementation audit.' },
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Trane', description: 'Internal research record.' }
  ],
  supportedFormats: [
    {
      label: "Modern (10-Character)",
      example: "11241KADBB",
      exampleType: "Synthetic",
      description: "Used from 2010 to present. Characters 1-2 encode the year, and characters 3-4 encode the fiscal week."
    },
    {
      label: "Standard (9-Character)",
      example: "814123456",
      exampleType: "Synthetic",
      description: "Used from 2002 to 2009. Character 1 encodes the last digit of the year, characters 2-3 encode the week."
    },
    {
      label: "Letter-Prefix (9-Character)",
      example: "W04123456",
      exampleType: "Synthetic",
      description: "Used from 1983 to 2001. Character 1 is a fixed letter corresponding to a specific year. Characters 2-3 encode the week."
    }
  ],
  faqs: [
    {
      question: "Where can I find the Trane serial number?",
      answer: "The serial number is on the data plate. On outdoor units (AC or heat pump), look on the exterior cabinet near the refrigerant valves. For indoor furnaces, the data plate is typically inside the front access panel."
    },
    {
      question: "How do I check the age of my Trane air conditioner or furnace?",
      answer: "Enter the serial number from your unit's data plate into the decoder above with 'Trane' selected. Trane has used three formats: since 2010, a 10-character format where the first two digits are the year and the next two are the fiscal week; from 2002 to 2009, a 9-character format where the first digit indicates the year; and from 1983 to 2001, a 9-character format starting with a letter that maps to a specific year. The decoder identifies the format automatically."
    },
    {
      question: "How do I read a modern Trane serial number (2010 to present)?",
      answer: "Since 2010, Trane has used a 10-character format where the first two digits indicate the year and the next two indicate the fiscal week. For example, a serial starting with '1124' was built in the 24th week of 2011."
    },
    {
      question: "What is the Trane format from 2002 to 2009?",
      answer: "From 2002 to 2009, Trane used a 9-character format where the first digit indicates the last digit of the year. For instance, '814' at the start means week 14 of 2008."
    },
    {
      question: "How do older Trane serial numbers work (1983 to 2001)?",
      answer: "Between 1983 and 2001, Trane used a 9-character format starting with a letter that mapped to a specific year. For example, 'W' is 1983, 'X' is 1984, and 'R' is 2000. The two digits following the letter indicate the fiscal week. Several letters are skipped in this sequence."
    },
    {
      question: "Does this decoder work for American Standard?",
      answer: "Yes. American Standard and Trane are owned by the same parent company and manufacture identical equipment on the same assembly lines. American Standard serial numbers follow the exact same decoding logic."
    },
    {
      question: "Does this decoder support Trane water heaters?",
      answer: "No. This tool is designed for residential HVAC equipment — air conditioners, furnaces, and heat pumps. Water heaters are out of scope."
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
  shortDescription: "Determine the age and manufacture date of your Rheem HVAC equipment. Rheem uses a structural format where an alphabetic plant code is immediately followed by the production week and year.",
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet. For indoor furnaces, look inside the front access panel.",
  limitations: [
    "Rheem water heater serial numbers (typically 10 characters: one letter and nine numeric digits) share the same structure as HVAC units. The decoded date is valid for both, but the tool is specialized for HVAC.",
    "Serial numbers lacking an alphabetic plant code followed by numeric week and year digits are not supported.",
    "All-numeric serial numbers (older water heater formats) are not supported."
  ],
  sources: [
    { type: 'internal', title: 'Rheem/Ruud Implementation Contract', description: 'Implementation audit.' },
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Rheem/Ruud', description: 'Internal research record.' }
  ],
  supportedFormats: [
    {
      label: "Modern Structural",
      example: "W421724596",
      exampleType: "Verified",
      description: "The plant code letter is followed by a 2-digit week and a 2-digit year (e.g., W = plant, 42 = week, 17 = 2017)."
    },
    {
      label: "Embedded Plant Code",
      example: "CB5D302F099903346",
      exampleType: "Verified",
      description: "Older or commercial units embed the plant letter (e.g., F) in the middle of the string, immediately followed by the 2-digit week (09) and 2-digit year (99)."
    }
  ],
  faqs: [
    {
      question: "Where can I find the Rheem serial number?",
      answer: "The serial number is on the data plate. On outdoor units (AC or heat pump), look on the exterior cabinet. For indoor furnaces, the data plate is typically inside the front access panel."
    },
    {
      question: "How do I check the age of my Rheem air conditioner or furnace?",
      answer: "Enter the serial number from your unit's data plate into the decoder above with 'Rheem' selected. The decoder structurally identifies the plant code letter, followed by the 2-digit week and 2-digit year of manufacture. For example, 'W421724596' means the 42nd week of 2017."
    },
    {
      question: "What is the older Rheem embedded plant code format?",
      answer: "Older Rheem serial numbers may have an engineering prefix before the plant code letter. Our decoder automatically finds the plant letter in the middle of the string by looking for the correct week and year numeric sequence that follows it."
    },
    {
      question: "Why did my Rheem serial number fail to decode?",
      answer: "Your serial number might fail if it doesn't contain an alphabetic plant code followed by valid week and year digits, or if it's an unsupported older all-numeric format. Double-check that you are entering the serial number, not the model number."
    },
    {
      question: "Are Ruud and Rheem serial formats identical?",
      answer: "Yes. Ruud and Rheem are manufactured by the same company and use identical serial number formats and decoding logic."
    },
    {
      question: "Does this tool decode Rheem water heater serial numbers?",
      answer: "Rheem water heaters often use a 10-character format (one letter followed by nine digits) that is structurally identical to Rheem HVAC units. While the decoded date applies to both, this tool is designed primarily for residential HVAC equipment."
    }
  ],
};

const ruud: BrandPageConfig = {
  manufacturerId: 'ruud',
  slug: 'ruud-serial-number-decoder',
  displayName: 'Ruud',
  relatedBrands: [{"name": "Rheem", "slug": "rheem-serial-number-decoder"}],
  category: 'HVAC',
  pageTitle: 'Ruud Serial Number Decoder — Find HVAC Age | SerialAge',
  metaDescription: 'Free decoder for Ruud HVAC serial numbers. Find out the exact age and manufacture date of your Ruud air conditioner, furnace, or heat pump.',
  headline: 'Ruud Serial Number Decoder: Find Your HVAC Age',
  shortDescription: (
    <>
      SerialAge helps you decode Ruud HVAC serial numbers to determine the precise manufacture date and age of your equipment. Ruud is part of the Rheem family, and the two brands share substantial serial-number conventions. However, while the decoding rules overlap, this Ruud-specific page ensures you receive accurate context for your Ruud-branded equipment.
    </>
  ),
  shortDescriptionSchema: "SerialAge helps you decode Ruud HVAC serial numbers to determine the precise manufacture date and age of your equipment. Ruud is part of the Rheem family, and the two brands share substantial serial-number conventions. However, while the decoding rules overlap, this Ruud-specific page ensures you receive accurate context for your Ruud-branded equipment.",
  ratingPlateLocation: "For Ruud outdoor units (AC or heat pump), the serial number is usually on the rating plate located on the side or back of the exterior cabinet. For Ruud indoor furnaces or air handlers, check inside the front access panel.",
  limitations: [
    "Ruud water heater serial numbers (typically 10 characters: one letter and nine numeric digits) share the same structure as HVAC units. The decoded date is valid for both, but the tool is specialized for HVAC.",
    "Serial numbers lacking an alphabetic plant code followed by numeric week and year digits are not supported.",
    "All-numeric serial numbers (older water heater formats) are not supported."
  ],
  sources: [
    { type: 'internal', title: 'Rheem/Ruud Implementation Contract', description: 'Implementation audit.' },
    { type: 'internal', title: 'SerialAge Manufacturer Decoding Audit - Rheem/Ruud', description: 'Internal research record.' }
  ],
  headings: {
    whereToFind: "Where to Find Your Ruud Serial Number",
    faqs: "Ruud Serial Number FAQs"
  },
  customContent: (
    <>
      <h2 className="s-head" id="ruud-and-rheem" style={{ marginTop: '24px' }}>Ruud and Rheem: Why the Serial Formats Overlap</h2>
      <p className="re-body-list" style={{ marginTop: '16px', marginBottom: '32px' }}>
        Ruud was acquired by Rheem in 1959. Because they operate under the same corporate umbrella, they share manufacturing facilities and engineering designs. As a result, modern Ruud and <Link to="/rheem-serial-number-decoder" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Rheem</Link> equipment often share identical serial number structures. While our decoder supports these shared rules, you should always consult the specific data plate on your unit.
      </p>

      <div className="s-eye">Serial Formats</div>
      <h2 className="s-head" id="how-it-works">How Ruud Serial Numbers Work</h2>
      
      <p className="re-body-list" style={{ marginTop: '16px' }}>
        SerialAge currently supports the documented Ruud HVAC serial patterns implemented by the decoder. SerialAge does not claim to support every historical or non-HVAC Ruud serial convention. Older or specialized Ruud equipment may use different numbering conventions. If your serial does not match a supported HVAC format, check the data plate carefully and consult the manufacturer documentation.
      </p>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginTop: '32px', marginBottom: '16px' }}>1. Modern Standard Format (10-Character)</h3>
      <p className="re-body-list" style={{ marginBottom: '16px' }}>
        The most common modern format is exactly 10 characters long, beginning with a single letter followed by nine digits. The first character acts as the plant or factory identifier. The next two digits represent the production week, and the following two digits represent the production year. The remaining characters contain production sequence information.
      </p>
      <p className="re-body-list" style={{ marginBottom: '16px' }}>
        <em>Note: Some post-2012 Ruud units manufactured in Mexico may begin with an "M" (for example, <code style={{fontFamily: 'var(--font-mono)', background: 'var(--surface-card)', padding: '2px 6px', borderRadius: '4px'}}>M141209135</code>). This fits the exact same 10-character standard pattern and decodes identically.</em>
      </p>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginTop: '32px', marginBottom: '16px' }}>2. Embedded-Plant Code Formats</h3>
      <p className="re-body-list" style={{ marginBottom: '16px' }}>
        Older commercial and residential Ruud units often used an embedded plant-code format. These serial numbers are typically longer (10–17 characters) and can be spaced or continuous. The decoder finds the manufacture date by identifying the plant letter (e.g. F, M, G, N, or W) immediately preceding the week and year digits. The surrounding prefix and suffix characters are undocumented product/sequence codes.
      </p>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginTop: '32px', marginBottom: '16px' }}>Example Breakdowns</h3>
      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--hairline)', color: 'var(--ink)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Example Serial</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Relevant Date Portion</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Decoded Manufacture Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Explanation</th>
            </tr>
          </thead>
          <tbody style={{ color: 'var(--mute)' }}>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>W421724596</td>
              <td style={{ padding: '12px 16px' }}>W<strong>4217</strong></td>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Week 42, 2017</td>
              <td style={{ padding: '12px 16px', lineHeight: '1.5' }}><strong>W</strong> is the plant identifier. <strong>42</strong> is the production week. <strong>17</strong> is the production year. <strong>24596</strong> is the remaining production sequence.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>CB5D302F099903346</td>
              <td style={{ padding: '12px 16px' }}>...F<strong>0999</strong>...</td>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Week 9, 1999</td>
              <td style={{ padding: '12px 16px', lineHeight: '1.5' }}><strong>F</strong> is the embedded plant letter. <strong>09</strong> is the production week. <strong>99</strong> is the production year. The exact meaning of the surrounding prefix (<code style={{fontFamily: 'var(--font-mono)'}}>CB5D302</code>) and suffix (<code style={{fontFamily: 'var(--font-mono)'}}>03346</code>) is uncertain.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>7351 M2806 16735</td>
              <td style={{ padding: '12px 16px' }}>...M<strong>2806</strong>...</td>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>Week 28, 2006</td>
              <td style={{ padding: '12px 16px', lineHeight: '1.5' }}><strong>M</strong> is the embedded plant letter. <strong>28</strong> is the production week. <strong>06</strong> is the production year. The surrounding digits are undocumented sequence codes.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="s-head" id="model-vs-serial" style={{ marginTop: '32px' }}>Ruud Model Number vs. Serial Number</h2>
      
      <p className="re-body-list" style={{ marginTop: '16px', marginBottom: '16px' }}>
        When trying to determine the age of your equipment, you must use the <strong>serial number</strong>, which identifies your exact, individual unit and contains the manufacture date. The <strong>model number</strong> identifies the product configuration. The current SerialAge Ruud decoder does NOT decode model numbers, as they do not contain the age of the unit.
      </p>

      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginTop: '24px', marginBottom: '16px' }}>Model Number Example: UA1436AJ1NA</h3>
      <p className="re-body-list" style={{ marginBottom: '16px' }}>
        On documented modern Ruud air-conditioner model families such as <code style={{fontFamily: 'var(--font-mono)', background: 'var(--surface-card)', padding: '2px 6px', borderRadius: '4px'}}>UA14...</code>, the model number includes product type, efficiency, and nominal capacity information. For example, in the model <strong>UA1436AJ1NA</strong>:
      </p>
      <ul className="re-body-list" style={{ margin: '0 0 16px 20px', color: 'var(--ink)' }}>
        <li style={{ marginBottom: '8px' }}><strong>U</strong> = Ruud brand prefix</li>
        <li style={{ marginBottom: '8px' }}><strong>A</strong> = Air-conditioner product type</li>
        <li style={{ marginBottom: '8px' }}><strong>14</strong> = Nominal efficiency indicator for that documented model family</li>
        <li style={{ marginBottom: '8px' }}><strong>36</strong> = Nominal cooling capacity in thousands of BTUH (36,000 BTUH = 3 nominal tons)</li>
      </ul>
      <p className="re-body-list" style={{ marginBottom: '32px' }}>
        <em>Note: Ruud model-number conventions vary across product families and generations. This page does not attempt to decode every model-number character. For exact equipment specifications, use the rating plate and manufacturer documentation.</em>
      </p>
    </>
  ),
  supportedFormats: [],
  faqs: [
    {
      question: "How do I decode a Ruud serial number?",
      answer: "Enter your serial number into the decoder above. Most modern Ruud serial numbers are 10 characters long, starting with a plant letter. The two digits immediately following the letter indicate the week, and the next two indicate the year of manufacture."
    },
    {
      question: "Where can I find my Ruud serial number?",
      answer: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, look on the side or back of the exterior cabinet. For indoor furnaces or air handlers, check inside the front access panel."
    },
    {
      question: "Are Ruud and Rheem serial formats the same?",
      answer: (
        <>
          In most modern cases, yes. Because Ruud is owned by <Link to="/rheem-serial-number-decoder" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Rheem</Link>, their HVAC equipment is often produced in the same factories using identical serial number formats and date codes.
        </>
      ),
      answerSchema: "In most modern cases, yes. Because Ruud is owned by Rheem, their HVAC equipment is often produced in the same factories using identical serial number formats and date codes."
    },
    {
      question: "What does a Ruud serial number tell me?",
      answer: "A Ruud serial number encodes the manufacturing plant, the exact week and year the unit was built, and a unique production sequence identifier."
    },
    {
      question: "Does it show manufacture date or installation date?",
      answer: "The serial number strictly shows the manufacture date—the date the unit left the factory. It does not show the installation date, which is usually when warranty coverage begins."
    },
    {
      question: "What if my Ruud serial uses an older format?",
      answer: (
        <>
          Older commercial or vintage Ruud units may use legacy formats (like numeric-only strings). Our decoder currently focuses on the most reliable modern and embedded-letter formats. For unsupported vintage formats, you may need to consult historical manuals or read our <Link to="/methodology" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Methodology page</Link>.
        </>
      ),
      answerSchema: "Older commercial or vintage Ruud units may use legacy formats (like numeric-only strings). Our decoder currently focuses on the most reliable modern and embedded-letter formats. For unsupported vintage formats, you may need to consult historical manuals or read our Methodology page."
    },
    {
      question: "What if my Ruud serial number is unreadable?",
      answer: "If the outdoor data plate is faded from weather exposure, you can often find a secondary barcode sticker inside the electrical control panel. You can also check your original installation invoice or warranty registration paperwork."
    },
    {
      question: "What is the difference between a Ruud model number and serial number?",
      answer: "The model number identifies the equipment/product configuration. The serial number is used strictly for unit identification and manufacture-date decoding. Our current Ruud decoder does not parse model numbers.",
      answerSchema: "The model number identifies the equipment/product configuration. The serial number is used strictly for unit identification and manufacture-date decoding. Our current Ruud decoder does not parse model numbers."
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
  shortDescription: "Determine the age and manufacture date of your York HVAC equipment. York's historical serial numbering incorporates a complex repeating letter cycle between the 1980s and 2000s which can result in intentional ambiguity.",
  ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, check inside the front access panel.",
  limitations: [
    "The 1980-2004 format repeats the year letters K, L, M, and N in both the 1980s and early 2000s. The decoder will correctly identify this as ambiguous and provide both years for those specific letters.",
    "The 1970s format utilizes specific two-letter prefixes. Prefixes not on the strict manufacturer whitelist are not supported.",
    "9-character legacy variations (missing the leading plant code) are intentionally rejected to prevent false positives.",
    "Water heater serial numbers are out of scope."
  ],
  ambiguity: "York used a repeating letter cycle between the 1980s and 2000s. Serial numbers with year letters K, L, M, or N could belong to either the 1980-1991 cycle or the 1992-2004 cycle. Our decoder intentionally returns both possible years when it detects this ambiguity. You must visually inspect the unit's condition and refrigerant type to determine the correct era.",
  sources: [
    { type: 'internal', title: 'York Implementation Contract', description: 'Implementation audit.' },
    { type: 'external', title: 'Building Intelligence Center - York', publisher: 'Building Intelligence Center', description: 'Reference for historical formatting trends.' }
  ],
  supportedFormats: [
    {
      label: "Post-2004 (10-Character)",
      example: "W0K5896070",
      exampleType: "Verified",
      description: "Used from October 2004 to present. Positions 2 and 4 form a 2-digit year code (e.g. 0 and 5 = 2005). Position 3 is a letter representing the month."
    },
    {
      label: "1980-2004 (10-Character)",
      example: "WAPM123456",
      exampleType: "Verified",
      description: "Position 2 is the month letter, Position 3 is the year letter. Letters K, L, M, and N map to two possible years."
    },
    {
      label: "1960-1979 (Two-Letter Prefix)",
      example: "KO12345",
      exampleType: "Documented",
      description: "Older units used a specific two-letter prefix (like KO, AO, etc.) to indicate the manufacture year."
    }
  ],
  faqs: [
    {
      question: "Where is the serial number on a York unit?",
      answer: "The serial number is on the data plate (a sticker or stamped plate) on the unit. On outdoor AC and heat pump units, look on the side or back of the cabinet near the refrigerant valves. On indoor furnaces and air handlers, check inside the front access panel."
    },
    {
      question: "How do I check the age of my York air conditioner or furnace?",
      answer: "Enter the serial number from your data plate into the decoder above with 'York' selected. York has used several main formats. Since October 2004, the year is encoded using digits at positions 2 and 4, and the month using a letter at position 3. For equipment made between 1980 and 2004, letters at positions 2 and 3 encode the month and year — though the result may show two possible years for some units due to a repeating letter cycle. In the 1960s and 1970s, specific two-letter prefixes were used."
    },
    {
      question: "Why does my York serial number return two possible years?",
      answer: "Between 1980 and 2004, York used a repeating letter cycle for the year of manufacture. The letters K, L, M, and N each map to two possible years — for example, 'K' can mean 1980 or 2001. SerialAge returns both possible years rather than guessing, since the correct decade cannot be determined from the serial number alone."
    },
    {
      question: "How do I tell which year is correct for my ambiguous York unit?",
      answer: "You can often narrow it down by inspecting the unit's physical condition, checking the refrigerant type listed on the data plate (pre-2010 systems often used R-22), or looking for the ANSI standard date on the plate. A 1980s unit and a 2000s unit will have noticeably different refrigerant and efficiency specifications."
    },
    {
      question: "Does this decoder support older 9-character York formats?",
      answer: "We support the 1960s and 1970s formats that use a strict whitelist of two-letter prefixes. However, other older 9-character York serial numbers — which are missing the leading plant code — are not supported. These shorter serials carry a significant risk of false positives, so we exclude them to protect accuracy."
    },
    {
      question: "Does this decoder work for Coleman and Luxaire?",
      answer: "Yes. York (now under Johnson Controls) shares the modern post-2004 10-character format with its related brands, including Coleman, Luxaire, Champion, and Evcon."
    },
    {
      question: "Does this tool decode York water heater serial numbers?",
      answer: "No. This tool is designed for residential HVAC equipment — air conditioners, furnaces, and heat pumps. Water heaters are out of scope."
    }
  ],
};

const heil: BrandPageConfig = {
  manufacturerId: 'heil',
  slug: 'heil-serial-number-decoder',
  displayName: 'Heil',
  relatedBrands: [],
  category: 'HVAC',
  pageTitle: 'Heil Serial Number Decoder — Find Equipment Age | SerialAge',
  metaDescription: 'Free decoder for Heil and ICP HVAC serial numbers. Find out the age and manufacture date of your Heil air conditioner, furnace, or heat pump.',
  headline: 'Heil Serial Number Decoder',
  shortDescription: 'Determine the age and manufacture date of your Heil or ICP (International Comfort Products) HVAC equipment.',
  ratingPlateLocation: 'On Heil outdoor units (air conditioners and heat pumps), the data plate is typically located on the side of the unit. On indoor furnaces, it is usually pasted on the inside wall of the blower compartment.',
  limitations: [
    "Legacy 6-digit numeric serial numbers (pre-1970s) are not supported because they only contain a single digit for the year, making it impossible to determine the exact decade.",
    "The 1980s HFF recall format is explicitly rejected by this decoder.",
    "This tool focuses on the core Heil/ICP structure. It does not invent or assume factory origins based on the starting letter."
  ],
  sources: [
    { type: 'external', title: 'ICP Technical Information Communication TIC2021-0009', description: 'Primary engineering document confirming the modern 10-character format.' },
    { type: 'external', title: 'ICP Ductless Compatibility Guide', description: 'OEM documentation confirming the ductless V-prefix format.' }
  ],
  supportedFormats: [
    {
      label: "Modern ICP Unitary Format (1990–Present)",
      example: "E072514528",
      exampleType: 'Documented',
      description: "A 10-character format starting with a letter. The second and third characters are the year, and the fourth and fifth are the week. Example: E072514528 = 2007, Week 25."
    },
    {
      label: "Heil-Quaker Decade Format (1970s & 1980s)",
      example: "H55116328",
      exampleType: 'Verified',
      description: "A 9-character format starting with G (1970s) or H (1980s). The second character is the exact year digit, and the third and fourth are the week. Example: H55116328 = 1985, Week 51."
    },
    {
      label: "ICP Ductless Formats",
      example: "V2028V10001",
      exampleType: 'Documented',
      description: "Midea-sourced ductless units use a format containing the internal separator 'V'. The year and week are clearly indicated near the beginning. Example: V2028V10001 = 2020, Week 28."
    }
  ],
  faqs: [
    {
      question: "Are the 4th and 5th characters the month or the week?",
      answer: "They indicate the week of the year (01 to 53). According to official ICP Technical Information Communication documents, these positions definitively represent the week, not the month. Many online sources incorrectly claim it is the month."
    },
    {
      question: "What does the first letter mean in a modern Heil serial number?",
      answer: "The first letter (e.g., E, F, L) designates the plant or factory where the unit was manufactured. However, this decoder does not map these letters to specific cities because ICP factory assignments have changed and evolved over time, and relying on static lists leads to inaccuracies."
    },
    {
      question: "Does this decoder work for Tempstar, Comfortmaker, and Arcoaire?",
      answer: "While those brands share the same ICP parent company and use the identical serial number structure, this specific page is optimized for Heil. The decoding rules, however, are the same."
    }
  ]
};

export const ALL_BRAND_PAGES: BrandPageConfig[] = [
  carrier, bryant, payne, goodman, amana, lennox, trane, rheem, ruud, york, heil
];

export function getBrandPageBySlug(slug: string): BrandPageConfig | undefined {
  return ALL_BRAND_PAGES.find((b) => b.slug === slug);
}

export function getAllBrandPages(): BrandPageConfig[] {
  return ALL_BRAND_PAGES;
}
