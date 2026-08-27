# YORK IMPLEMENTATION CONTRACT

## 1. SCOPE
This contract defines the exact decoding rules for York HVAC serial numbers. It strictly prohibits guessing and mandates returning ambiguous results for known overlapping year cycles.

## 2. SUPPORTED EQUIPMENT TYPES
- Air Conditioners
- Heat Pumps
- Furnaces
- Air Handlers
- Packaged Units
*(Note: Water heaters are strictly OUT OF SCOPE).*

## 3. SUPPORTED FORMATS
1. `york-post-2004` (October 2004 – Present)
2. `york-1971-2004` (1971 – October 2004)

## 4. UNSUPPORTED FORMATS
- Any 9-character variations of the `york-1971-2004` format (e.g., missing the leading plant code).
- Any pre-1971 formats.
- Any serial numbers containing the letters `I`, `O`, `Q`, `U`, or `Z` in the date-encoding positions.

## 5. EXACT SERIAL STRUCTURES

### `york-post-2004`
- **Regex:** `^[A-Z][0-9][A-HK-N][0-9]\d{6}$`
- **Length:** 10 characters
- **Structure:** Letter, Digit, Letter (excluding I,J,O,Q,U,Z), Digit, 6 Digits.

### `york-1971-2004`
- **Regex:** `^[A-Z][A-HK-N][A-HJ-NPR-Y][A-Z]\d{6}$`
- **Length:** 10 characters
- **Structure:** Letter, Letter (Month, excluding I,J,O,Q,U,Z), Letter (Year, excluding I,O,Q,U,Z), Letter, 6 Digits.

## 6. EXACT DATE-DECODING RULES

### `york-post-2004`
- **Year:** Position 2 and 4. `Year = 2000 + (Position[1] * 10) + Position[3]`.
- **Month:** Position 3. 
  - `A`=1, `B`=2, `C`=3, `D`=4, `E`=5, `F`=6, `G`=7, `H`=8, `K`=9, `L`=10, `M`=11, `N`=12.

### `york-1971-2004`
- **Month:** Position 2. Same mapping as above.
- **Year:** Position 3.
  - `A` = 1971 or 1992 (Ambiguous)
  - `B` = 1972 or 1993 (Ambiguous)
  - `C` = 1973 or 1994 (Ambiguous)
  - `D` = 1974 or 1995 (Ambiguous)
  - `E` = 1975 or 1996 (Ambiguous)
  - `F` = 1976 or 1997 (Ambiguous)
  - `G` = 1977 or 1998 (Ambiguous)
  - `H` = 1978 or 1999 (Ambiguous)
  - `J` = 1979 or 2000 (Ambiguous)
  - `K` = 1980 or 2001 (Ambiguous)
  - `L` = 1981 or 2002 (Ambiguous)
  - `M` = 1982 or 2003 (Ambiguous)
  - `N` = 1983 or 2004 (Ambiguous)
  - `P` = 1984
  - `R` = 1985
  - `S` = 1986
  - `T` = 1987
  - `V` = 1988
  - `W` = 1989
  - `X` = 1990
  - `Y` = 1991

## 7. SOURCE METADATA
- **Building Intelligence Center:** Primary authoritative source for the dual-format structure and the 21-year cycle logic.
- **HowToLookAtAHouse / HVAC Forums:** Secondary validation for real-world examples and October 2004 transition confirmation.

## 8. CONFIDENCE
- `york-post-2004`: **HIGH**
- `york-1971-2004` (Years P-Y): **HIGH**
- `york-1971-2004` (Years A-N): **HIGH** (in its classification as AMBIGUOUS).

## 9. AMBIGUITY BEHAVIOR
- If a `york-1971-2004` serial evaluates to a year letter between `A` and `N`, the decoder MUST return an `AMBIGUOUS` status.
- The payload must contain both potential years (e.g., `[1971, 1992]`) rather than a single determined year.

## 10. GOLDEN DATASET

| Serial | Format | Expected Status | Expected Date/Years | Verified |
| :--- | :--- | :--- | :--- | :--- |
| `W0K5896070` | `york-post-2004` | SUCCESS | Sep 2005 | True |
| `W1A5123456` | `york-post-2004` | SUCCESS | Jan 2015 | True |
| `W1C2987654` | `york-post-2004` | SUCCESS | Mar 2012 | True |
| `W1M5555555` | `york-post-2004` | SUCCESS | Nov 2015 | True |
| `WAKM011379` | `york-1971-2004` | AMBIGUOUS | [1980, 2001] | True |
| `XBFM220710` | `york-1971-2004` | AMBIGUOUS | [1976, 1997] | True |
| `WAPM123456` | `york-1971-2004` | SUCCESS | Jan 1984 | False (Synthetic) |
| `WAXM123456` | `york-1971-2004` | SUCCESS | Jan 1990 | False (Synthetic) |
| `EBHM062202` | None | UNSUPPORTED | N/A | True |

## 11. ADVERSARIAL THREATS
- **Model Numbers:** Highly unlikely to match `[A-Z][0-9][A-M][0-9]\d{6}`.
- **Cross-Manufacturer:** Carrier, Trane, Lennox, Rheem, and Goodman do not use an `LDLDDDDDDD` or `LLLLDDDDDD` string structure.
- **Invalid Letters:** Submitting a serial with the letter `I` in position 3 (e.g., `W0I5896070`) must fail validation and return unsupported or invalid format.

## 12. ACCEPTANCE CRITERIA
- 100% pass rate against the Golden Dataset.
- Zero cross-contamination with Carrier, Goodman, Lennox, Trane, Rheem, or Ruud fixtures.
- The decoder must successfully return an `AMBIGUOUS` error/payload for `york-1971-2004` letters `A` through `N`.
- The decoder must successfully return a `SUCCESS` payload for `york-1971-2004` letters `P` through `Y`.

## 13. KNOWN LIMITATIONS
- We are actively ignoring the 9-character variations (e.g., missing plant code) of the older format to maintain high strictness and avoid false positives.
- We cannot differentiate between 1970s and 1990s units mathematically for letters `A-N` without human visual inspection or context, hence the ambiguity classification.
