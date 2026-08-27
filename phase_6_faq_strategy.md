# PHASE 6 — BRAND PAGE FAQ STRATEGY

This document defines the FAQ strategy for Carrier, Goodman, and Lennox brand pages. The goal is to answer genuine user questions regarding finding the serial number, understanding formats, dealing with ambiguity, and knowing the tool's limitations. 

These FAQs should be rendered clearly on their respective brand pages. While `FAQPage` structured data (JSON-LD) is recommended to help search engines understand the content, it should be implemented strictly for semantic accuracy, not with the assumption that it will guarantee rich results.

---

## 1. CARRIER (Including Bryant, Payne, Day & Night)

**Q: Where can I find the Carrier serial number?**
A: The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.

**Q: How do I read a modern Carrier serial number?**
A: Since roughly 1985, Carrier uses a 10-character format where the first four characters are numbers indicating the week and year of manufacture (WWYY). For example, a serial number starting with "4206" was manufactured in the 42nd week of 2006.

**Q: What if my Carrier serial number is 9 digits and starts with a letter?**
A: If your serial number is 9 characters and consists entirely of digits (e.g., "790512345"), it likely uses the older YYMM format used between 1969 and 1990. In this format, the first two digits are the year and the next two are the month.

**Q: Does this decoder work for Bryant and Payne?**
A: Yes. Bryant, Payne, and Day & Night are manufactured by Carrier (United Technologies / Carrier Global). Since the late 1980s, they share the exact same serial number formats and logic as Carrier equipment.

**Q: Why does the decoder say my pre-1985 Carrier serial number is unsupported?**
A: Before 1985, Carrier's formatting was highly inconsistent. Serial numbers often require deep historical catalog cross-referencing to decode accurately. To guarantee we never provide you with a false date ("no guessing"), we explicitly mark these legacy formats as unsupported.

**Q: If there is a date printed directly on the data plate, should I trust it?**
A: Yes. If your Carrier data plate has a printed "MFR DATE" (e.g., MFR DATE: 10/2018), always trust the printed date over the serial number if there is a discrepancy.

---

## 2. GOODMAN (Including Amana, Daikin)

**Q: Where is the serial number on a Goodman unit?**
A: On Goodman outdoor units (air conditioners and heat pumps), the data plate is typically located on the side of the unit, near where the refrigerant lines connect. On indoor furnaces, it is usually pasted on the inside wall of the blower compartment.

**Q: How do I read a Goodman serial number?**
A: Goodman has used a highly consistent 10-digit serial number format (YYMMXXXXXX) since 1982. The first two digits are the year of manufacture, and the next two digits are the month. For example, a serial starting with "2104" was built in April 2021.

**Q: Are Amana and Daikin serial numbers the same as Goodman?**
A: For most standard residential equipment built after Daikin acquired Goodman (and Goodman acquired Amana), the serial number formats are identical (10 digits starting with YYMM).

**Q: Why isn't my older Amana PTAC serial number working?**
A: Older Amana and legacy PTAC (Packaged Terminal Air Conditioner) units often used a 10-character format that included letters at the beginning or end (e.g., starting with "B" or ending with "P"). SerialSense currently does not support decoding these legacy PTAC formats to avoid providing inaccurate dates.

**Q: My Goodman serial number has only 9 digits. Can it be decoded?**
A: Genuine Goodman HVAC serial numbers from 1982 onwards are exactly 10 digits long. If your serial number is 9 digits, double-check the data plate for fading or misreading. Our decoder requires the full 10 digits to guarantee accuracy.

---

## 3. LENNOX (Including Ducane, Aire-Flo)

**Q: Where do I find the Lennox serial number?**
A: On Lennox outdoor units, the data plate is usually on the right side of the unit near the refrigerant line connections. For indoor furnaces, it is typically located on the interior cabinet wall, accessible by removing the top front panel.

**Q: How do I decode a Lennox serial number?**
A: Modern Lennox serial numbers (1974–present) are 10 characters long. The year is located at positions 3 and 4, followed by a single letter at position 5 indicating the month. For example, in "5806K12345", "06" means 2006, and "K" represents October.

**Q: What do the first two characters of a Lennox serial number mean?**
A: The first two characters (usually numbers, sometimes letters) represent the factory or plant code where the equipment was manufactured. They do not affect the age or manufacture date of the unit.

**Q: Which month does my Lennox serial number letter represent?**
A: Lennox uses letters A through M for months (A=Jan, B=Feb, C=Mar, D=Apr, E=May, F=Jun, G=Jul, H=Aug, J=Sep, K=Oct, L=Nov, M=Dec). Note that the letter "I" is skipped to prevent confusion with the number 1. Letters N through Z are not used for the month code.

**Q: Does this work for Ducane and Aire-Flo?**
A: Yes. Ducane, Aire-Flo, Armstrong Air, and Concord are allied brands under Lennox International. Most of their equipment manufactured in the last few decades follows the exact same 10-character serial format as Lennox.

**Q: Can a Lennox unit have a 1970s and 2000s serial number that looks the same?**
A: The Lennox format began in 1974. A serial number with "99" at positions 3-4 means 1999, while "05" means 2005. Because the format is continuous, there is no overlap or ambiguity between centuries.
