# Phase 7 — SerialSense Complete Design System Specification

**Status**: FINAL SPECIFICATION
**Version**: 1.1 (Phase 7A Revision)

This document defines the complete visual and interactive design system for SerialSense. It is an implementation-ready technical design manual meant to guide coding agents and developers.

**[FACT]** No code is written in this document. This is a visual and product specification only.

---

## PART 1 — PRODUCT / BRAND FOUNDATION

**[FACT]** "SerialSense" is a working name. The brand identity must remain resilient to future naming or domain changes.

* **Wordmark Direction**: Typeset in `Inter SemiBold`, tracking `-0.02em`. No external SVG logo is required. The wordmark itself acts as the logo to ensure perfect crispness across resolutions.
* **Logo Concept**: Pure typographic wordmark.
* **Favicon Concept**: A crisp, monospace `S` centered inside a solid square with a 1px border. Designed for high visibility at 16x16 and 32x32.
* **Icon Language**: Utilitarian, 2px stroke, no fill (except for semantic status icons which may be solid for visibility). SVG format. Avoid playful or highly stylized icon sets; stick to technical interfaces (e.g., Lucide or Phosphor).
* **Brand Personality**: Authoritative, precise, unyielding, factual, industrial.
* **Visual Personality**: High contrast, stark, functional. Like a digital caliper or a well-calibrated instrument.
* **Voice**: Direct and factual. Active verbs. Zero fluff. Example: "Decode serial" not "Let's find out your serial number's age!"
* **Product Descriptor**: HVAC & Equipment Serial Decoder. (Scalable to appliances later).
* **Headline Direction**: "Decode Your Equipment Serial Number."
* **Supporting Copy Direction**: "Instantly determine manufacture date, approximate age, and origin from public manufacturer data."

---

## PART 2 — VISUAL DIRECTION

**[DESIGN OPINION]** The visual direction is **PRECISION UTILITY**.

* **Overall Feeling**: Trustworthy, exact, and mechanical. It should feel like a piece of high-quality diagnostic software used by engineers, not a consumer web app.
* **Density**: High information density where it matters (result readouts, parsed formats) and high whitespace where it doesn't (landing view).
* **Contrast**: Extremely high. Relies on `#0F172A` (Slate 900) on `#FFFFFF` (White).
* **Geometry**: Sharp and rectilinear. Radii are kept small (`4px` and `8px`).
* **Whitespace**: Purposeful. Used to group technical data without relying on excessive borders.
* **Technical Character**: Emphasized through the aggressive use of monospace typography (`Roboto Mono`) for all data inputs and outputs.
* **Warmth/Coolness**: Cool and sterile. Driven by Slate (cool grays).
* **Visual Hierarchy**: The decoded date is the loudest element on the page.
* **Perceived Trust**: Achieved through visual restraint, speed, and citation of sources.

**Explicitly Rejected Styles:**
* **Generic SaaS**: No soft blue glowing drop shadows, no bubbly rounded buttons.
* **Generic AI Startup**: No purple/pink gradients, no sparkles, no "magic" terminology.
* **Crypto/Dashboard**: No dark-mode-only neon aesthetics.
* **Cyberpunk**: No glitch effects or monospace overload for non-data text.
* **Excessive Glassmorphism**: No blurred translucent backgrounds.
* **Excessive Gradients**: Flat colors only.
* **Oversized Rounded Cards**: No `24px` radii on cards.
* **Ad-Farm Aesthetics**: No cluttered sidebars, sticky footer ads, or popup modals.
* **Contractor-Company Aesthetics**: No stock photos of smiling technicians or AC units.
* **Fake Enterprise UI**: No overly complex mega-menus or dense dashboards for a simple single-input tool.

---

## PART 3 — ORIGINAL COLOR SYSTEM

**[RECOMMENDATION]** A stark, industrial palette heavily reliant on Slate (cool grays) with high-saturation semantic colors for statuses.

### Base
* **Page Background**: `#F8FAFC` (Slate 50) — Used outside the main decoder container.
* **Primary Surface**: `#FFFFFF` (White) — Used for the main decoder widget and cards.
* **Secondary Surface**: `#F1F5F9` (Slate 100) — Used for inline wells, code blocks, or expanded accordion bodies.
* **Elevated Surface**: `#FFFFFF` (White) with 1px border and medium shadow — Modals/Dropdowns.
* **Primary Text**: `#0F172A` (Slate 900) — All primary typography and data.
* **Secondary Text**: `#475569` (Slate 600) — Explanations, metadata, labels, table headers.
* **Muted Text**: `#94A3B8` (Slate 400) — Disabled states, input placeholders.
* **Border**: `#CBD5E1` (Slate 300) — Input borders, card outlines.
* **Subtle Border**: `#E2E8F0` (Slate 200) — Dividers, internal table rows.

### Brand
* **Primary Accent**: `#0F172A` (Slate 900) — Primary buttons (stark contrast). Avoid using a bright color for the primary action; the result should be the colorful part.
* **Hover**: `#334155` (Slate 700) — Primary button hover.
* **Active**: `#000000` (Black) — Primary button active/pressed.
* **Subtle Accent Background**: `#F1F5F9` (Slate 100) — Selected states on secondary toggles.
* **Link Color**: `#0284C7` (Sky 600) — Inline text links and outline button borders.

### Semantic
* **Verified**: `#15803D` (Green 700) — Confirmed formats.
* **Verified Background**: `#F0FDF4` (Green 50)
* **Estimated**: `#B45309` (Amber 700) — Probable formats lacking absolute verification.
* **Estimated Background**: `#FFFBEB` (Amber 50)
* **Uncertain**: `#C2410C` (Orange 700) — Ambiguous inputs (e.g. could be 1994 or 2014).
* **Uncertain Background**: `#FFF7ED` (Orange 50)
* **Warning**: `#C2410C` (Orange 700) — Disclaimers and usage limits.
* **Warning Background**: `#FFF7ED` (Orange 50)
* **Error**: `#B91C1C` (Red 700) — Invalid inputs, missing data, unsupported brands.
* **Error Background**: `#FEF2F2` (Red 50)
* **Informational**: `#0369A1` (Light Blue 700) — Educational tips, "how to find" guides.
* **Informational Background**: `#F0F9FF` (Light Blue 50)

**[FACT]** Do not create unnecessary shades. Only the exact HEX values above are permitted in the application.

---

## PART 4 — ACCESSIBILITY COLOR SYSTEM

**[FACT]** Web Content Accessibility Guidelines (WCAG) 2.1 AA compliance is mandatory.

* **Minimum Contrast Target**: `4.5:1` for normal text against its background. `3:1` for large text (≥18pt) and UI components (borders, icons).
* **Focus Ring Color**: `#0284C7` (Sky 600). Must be a `2px` solid outline with a `2px` offset.
* **Disabled State**: Text `#94A3B8` (Slate 400), Background `#F1F5F9` (Slate 100), Border `#E2E8F0` (Slate 200). Must not rely on opacity fading.
* **Error State**: Input border turns `#B91C1C` (Red 700). Must include an error icon and descriptive text below the input.
* **Success State**: Iconography (Check Circle) combined with Green 700.

**[DESIGN OPINION]** Never rely on color alone. Every semantic state must be: `COLOR + TEXT + ICON/SHAPE`.

---

## PART 5 — TYPOGRAPHY SYSTEM

**[RECOMMENDATION]** Retain the current fonts: `Inter` and `Roboto Mono`. 
* **Inter**: Used for all UI, instructions, and marketing copy due to its high legibility and neutral character.
* **Roboto Mono**: Used exclusively for technical data (serial numbers, parsed segments, exact dates) to reinforce the "precision utility" aesthetic.

### Typography Tokens

* **Hero (Landing H1)**: Inter | Desk: 48px, Mob: 36px | W: 800 | LH: 1.1 | LS: -0.04em
* **H1 (Page Title)**: Inter | Desk: 32px, Mob: 28px | W: 700 | LH: 1.2 | LS: -0.02em
* **H2 (Section Header)**: Inter | Desk: 24px, Mob: 20px | W: 600 | LH: 1.3 | LS: -0.01em
* **H3 (Subsection)**: Inter | Desk: 18px, Mob: 18px | W: 600 | LH: 1.4 | LS: 0
* **Body Large**: Inter | Desk: 18px, Mob: 16px | W: 400 | LH: 1.6 | LS: 0
* **Body**: Inter | Desk: 16px, Mob: 16px | W: 400 | LH: 1.5 | LS: 0
* **Body Medium**: Inter | Desk: 16px, Mob: 16px | W: 500 | LH: 1.5 | LS: 0
* **Label**: Inter | Desk: 14px, Mob: 14px | W: 600 | LH: 1.4 | LS: 0.02em
* **Caption**: Inter | Desk: 12px, Mob: 12px | W: 400 | LH: 1.4 | LS: 0
* **Micro**: Inter | Desk: 11px, Mob: 11px | W: 500 | LH: 1.4 | LS: 0.04em (Uppercase)
* **Button**: Inter | Desk: 16px, Mob: 16px | W: 600 | LH: 1.0 | LS: 0
* **Serial Number (Input)**: Roboto Mono | Desk: 32px, Mob: 24px | W: 500 | LH: 1.2 | LS: 0.05em
* **Manufacture Date**: Roboto Mono | Desk: 48px, Mob: 32px | W: 700 | LH: 1.1 | LS: -0.02em
* **Equipment Age**: Inter | Desk: 20px, Mob: 18px | W: 500 | LH: 1.4 | LS: 0
* **Metadata / Source Text**: Inter | Desk: 14px, Mob: 14px | W: 400 | LH: 1.5 | LS: 0
* **FAQ Text**: Inter | Desk: 16px, Mob: 16px | W: 400 | LH: 1.6 | LS: 0

---

## PART 6 — TYPE SCALE

**[DESIGN OPINION]** Fluid `clamp()` sizing should ONLY be used for the Manufacture Date result. All other typography uses discrete CSS media queries for exact pixel control.

* **Fluid Usage**: Manufacture Date uses `clamp(2rem, 5vw, 3rem)` to ensure it never overflows the card on narrow devices, but remains dominant.
* **Scale**: Base is `16px` (1rem). Header scale: `18px`, `24px`, `32px`, `48px`.

---

## PART 7 — SPACING SYSTEM

**[FACT]** Built on a strict `4px`/`8px` linear scale.

* **Base Unit**: `8px` (`0.5rem`)
* **Page Gutter**: Mobile: `16px` | Desktop: `32px`
* **Container Padding**: Mobile: `24px` | Desktop: `48px`
* **Section Spacing**: Mobile: `48px` | Desktop: `64px`
* **Hero Spacing**: Mobile: `32px` (bottom margin) | Desktop: `48px`
* **Card Padding**: Mobile: `24px` | Desktop: `32px`
* **Form Spacing**: `16px` (vertical gap between input elements)
* **Label Spacing**: `8px` (gap between label and input field)
* **Result Spacing**: `24px` (gap between primary readout and secondary metadata)
* **FAQ Spacing**: `16px` (gap between accordion items)
* **Footer Spacing**: `64px` (top margin before footer)

**Philosophy**: High proximity for related data (8px). Strict separation for distinct components (24px+).

---

## PART 8 — LAYOUT SYSTEM

* **Maximum Page Width**: `1024px` (Centers content on large monitors, avoids endless line lengths).
* **Text Max Width**: `65ch` (Optimal reading line length for methodology and FAQs).
* **Decoder Max Width**: `640px` (Maintains input control density. Do not stretch to 1024px).
* **Result Max Width**: `640px` (Matches decoder width).
* **Header Max Width**: `1024px`.
* **Section Width**: `100%` up to `1024px`.
* **Desktop Gutters**: `32px`.
* **Mobile Gutters**: `16px`.
* **Vertical Rhythm**: Managed entirely via margin-bottom on components, tied to the 8px scale.

---

## PART 9 — BORDER / RADIUS SYSTEM

**[DESIGN OPINION]** Sharp, machined aesthetics. Pills are reserved strictly for semantic tags.

* **Border Widths**: `1px` everywhere, EXCEPT the Result Card which gets `2px` to elevate its importance.
* **Radius Values**:
  * `0px` (Sharp): Image placeholders, dividers.
  * `4px` (Small): Inputs, buttons, segmented controls.
  * `8px` (Medium): Cards, dropdown menus, modals.
  * `9999px` (Pill): Status badges, confidence indicators.

Do not use `12px`, `16px`, or `24px` radii. Everything must feel precise and slightly rigid.

---

## PART 10 — ELEVATION / SHADOW SYSTEM

**[RECOMMENDATION]** Elevation is achieved primarily through 1px borders. Shadows are used incredibly sparingly to indicate Z-axis overlap.

* **None**: Standard cards, inputs, buttons. (Use `border: 1px solid var(--border-default)`).
* **Subtle**: `0 1px 2px rgba(15,23,42,0.05)` — Hover states on secondary buttons.
* **Medium**: `0 4px 6px -1px rgba(15,23,42,0.1)` — Sticky header (when scrolled).
* **Modal/Overlay**: `0 20px 25px -5px rgba(15,23,42,0.1), 0 0 0 1px rgba(15,23,42,0.05)` — Manufacturer picker dropdown, tooltip overlays.

---

## PART 11 — MOTION SYSTEM

**[DESIGN OPINION]** Motion must be utilitarian. No bounce, no spring physics.

* **Hover Duration**: `150ms`.
* **Focus Duration**: `100ms` (Near instant).
* **Result Appearance**: Fade in `opacity 0 -> 1` over `200ms`. No Y-axis slide.
* **Accordion Animation**: `height` transition over `200ms`.
* **Copy Confirmation**: Hard snap to Success state (`0ms`), hold `2500ms`, fade back over `300ms`.
* **Dropdown Behavior**: `opacity` and `transform: translateY(4px)` over `150ms`.
* **Easing**: `ease-out` for all entries. `ease-in` for exits.
* **Reduced Motion**: Fallback to `0ms` for all durations if OS preference is set.

---

## PART 12 — RESPONSIVE BREAKPOINT SYSTEM

* **375px / 390px / 430px (Mobile)**:
  * Container: 100% width, 16px gutters.
  * Typography: Mobile scale.
  * Form Layout: Stacked 100% width buttons.
  * Result Layout: Confidence pill moves above the date.
  * Navigation: Hidden in hamburger menu.
* **640px (Tablet Portrait)**:
  * Container: 640px max width for decoder achieved.
  * Form Layout: Submit button can sit inline with input if space permits.
* **768px (Tablet Landscape)**:
  * Typography: Shifts to Desktop scale.
  * Navigation: Links appear inline in header.
* **1024px (Desktop Base)**:
  * Container: 1024px achieved and centers on screen. 32px gutters.
  * Spacing: Expands to desktop values (64px section spacing).
* **1280px / 1440px / 1536px (Large Desktop)**:
  * Behavior: Container remains 1024px. The background (`Slate 50`) fills the void. The tool remains centrally focused.

---

## PART 13 — HEADER

* **Header Height**: `64px`.
* **Logo Size**: Handled via typography (`20px` Inter SemiBold).
* **Icon Size**: `24px` for hamburger menu.
* **Max-Width**: `1024px` centered.
* **Padding**: `0 16px` (Mob), `0 32px` (Desk).
* **Background**: `#FFFFFF`.
* **Border**: `1px solid var(--border-subtle)` on bottom.
* **Nav Behavior**: Links (`Slate 600`) hover to `Slate 900`. 
* **Focus**: Standard Sky 600 focus ring on links.

---

## PART 14 — HERO

* **Eyebrow**: None.
* **H1 Direction**: Center aligned, Slate 900, `48px` (Desk). "Decode Your HVAC Serial Number".
* **Subheading Direction**: Center aligned, Slate 600, `18px` (Desk). "Instantly determine manufacture date and approximate equipment age."
* **Width**: `640px` max-width.
* **Spacing**: `48px` bottom margin before the decoder widget.
* **Mobile Adaptation**: H1 scales to `36px`, Subheading to `16px`. Left-align on mobile if preferred for legibility, but center is acceptable.

---

## PART 15 — DECODER WIDGET

### Equipment Type
* Segmented control toggle.

### Manufacturer
* `<select>` element. `48px` height. `1px` border.

### Serial Number
* `64px` height. `32px` Roboto Mono text. Padding `0 16px`.
* Border `Slate 300`.
* Focus: `2px solid Sky 600`.

### Decode Button
* `64px` height. Background `Slate 900`. Text `White`.
* Font: `16px` Inter SemiBold.
* Hover: Background `Slate 700`.

### Helper Text
* Placed below input. `12px` Slate 400. "e.g. 4006A17330"

### Validation / Error / Disabled
* **Validation**: None inline until submitted.
* **Disabled**: Opacity `0.6`, `pointer-events: none`. Background `Slate 50`.
* **Error**: Border `Red 700`. Background `Red 50`.

---

## PART 16 — EQUIPMENT TYPE

* **Supported**: HVAC (Active), Water Heater (Future).
* **Layout**: Segmented pill at the top of the decoder widget.
* **Icons**: Small `16px` SVG icons next to labels (Snowflake/Flame for HVAC, Droplet for Water Heater).
* **Selected**: Background `Slate 900`, Text `White`.
* **Unselected**: Background `Slate 100`, Text `Slate 600`.
* **Future Scaling**: If > 4 categories, convert to a row of scrollable cards or a searchable `<select>`. For now, keep as a 2-option segmented toggle.

---

## PART 17 — MANUFACTURER PICKER

* **Current Presentation**: Standard `<select>` with custom SVG chevron. `48px` height.
* **Scaling Threshold**: Switch to a Searchable Picker (Combobox) when supported manufacturers **>= 15**.
* **Reasoning**: A native select is easily navigable via keyboard (typing the first letter) up to about 15 items. Beyond that, a search input is required to handle long lists of obscure brands.

---

## PART 18 — SERIAL INPUT

* **Font**: `Roboto Mono`, `32px` (Desk).
* **Letter Spacing**: `0.05em` (Slightly spaced for scanning).
* **Placeholder**: `Slate 400`. Must show a valid example (e.g., "4006A17330").
* **Height**: `64px`.
* **Border**: `1px solid Slate 300`.
* **Focus**: `2px solid Sky 600`, offset `-1px` to prevent layout shift.
* **Paste**: JS intercepts paste, strips spaces, hyphens, and underscores.
* **Mobile Behavior**: `inputmode="text"`, `autocapitalize="characters"`, `spellcheck="false"`. (Forces uppercase keyboard, prevents autocorrect).

---

## PART 19 — SERIAL VS MODEL

* **Compact Education Component**.
* **Placement**: Below the Decode button.
* **Collapsed**: Text link, Sky 600, `14px`: "Where is my serial number?"
* **Expanded**: 
  * Background: Slate 50. Border: 1px Slate 200. Padding: 16px.
  * Typography: 14px Slate 900.
  * Content: "The serial number determines age. The model number determines size/tonnage. Look for 'S/N' on the rating plate."
  * Icon: Info circle (Light Blue 700).

---

## PART 20 — WHERE TO FIND SERIAL

* **Placement**: Global FAQ section at the bottom of the page.
* **Content Density**: Low. Scannable lists.
* **Accordion Behavior**: Expandable.
* **Guidance**:
  * Outdoor Unit: Back panel near refrigerant lines.
  * Furnace: Inside the front cabinet panel.
  * Air Handler: Front exterior panel.
* **Future Image Support**: Maintain a `16:9` aspect ratio container area above the text list for future SVG wireframes.

---

## PART 21 — COMMON MISTAKES

* **Component**: Contextual warning block.
* **Trigger**: Appears below the input only when an `invalid` result occurs.
* **UI**: Light Blue 50 background, 1px Light Blue 200 border, 14px Light Blue 900 text.
* **Content**: 
  * "Did you enter the model number?"
  * "Ensure 'O' is not a '0'."

---

## PART 22 — RESULT CARD

**[DESIGN OPINION]** The undisputed focal point of the application.

* **Dimensions**: 100% width of parent (max 640px).
* **Padding**: `32px`.
* **Borders**: `2px solid Slate 900` (Visually elevates it above the 1px inputs).
* **Background**: `White`.
* **Hierarchy**:
  1. **MANUFACTURE DATE**: `48px` Roboto Mono, Slate 900.
  2. **APPROXIMATE AGE**: `20px` Inter, Slate 600.
  3. **CONFIDENCE**: Top right absolute placement (Pill badge).
  4. **HOW / WHY**: `16px` Inter, Slate 900. (The parsed string breakdown).
  5. **SOURCES**: `14px` Inter, Slate 600. (List).
  6. **WARNINGS**: Amber block at the bottom inside the card padding.
  7. **ACTIONS**: Secondary button row (Copy, Decode Another).
* **Mobile Behavior**: Confidence pill moves to the top-left, above the Date, to prevent horizontal crowding.

---

## PART 23 — MANUFACTURE DATE

* **Formatting**: `August 2012`. If exact week is known: `August 2012 (Week 40)`.
* **Font**: `Roboto Mono`.
* **Size**: `48px` (Desk) / `32px` (Mob).
* **Weight**: `700` (Bold).
* **Case**: Title Case (Months).
* **Responsive Scaling**: Uses `clamp()` or media queries to ensure it never breaks to two lines unless absolutely necessary.

---

## PART 24 — AGE

* **Wording**: `Age: ~12 years, 4 months`.
* **Hierarchy**: Sits directly below Manufacture Date. Font: Inter `20px` Medium.
* **Precision**: Never display days. Never omit the `~` or "Approx." modifier.
* **Mobile Behavior**: Scales to `18px`.

---

## PART 25 — CONFIDENCE / RESULT STATES

**[FACT]** Never rely on color alone.

* **VERIFIED FORMAT**: Green 700 text, Green 50 bg. Check Icon. "Verified".
* **ESTIMATED FORMAT**: Amber 700 text, Amber 50 bg. Alert Icon. "Estimated".
* **UNCERTAIN**: Orange 700 text, Orange 50 bg. Help Icon. "Uncertain".
* **AMBIGUOUS**: Orange 700 text, Orange 50 bg. Alert Icon. "Ambiguous Result". Explanation must list both possibilities.
* **UNSUPPORTED**: Red 700 text, Red 50 bg. X Icon. "Unsupported Brand".
* **INVALID**: Red 700 text, Red 50 bg. X Icon. "Invalid Format".
* **INSUFFICIENT INFORMATION**: Orange 700 text, Orange 50 bg. Alert Icon. "Insufficient Data".

---

## PART 26 — HOW DID YOU DECODE THIS?

* **Signature Component**: An auditable, visual breakdown of the serial string.
* **Visual Treatment**: 
  * Container: Slate 50 background, 1px Slate 200 border, 16px padding.
  * Breakdown: Use `Roboto Mono`.
  * Highlight the parsed characters by wrapping them in spans with a white background and 1px border. 
  * Below the string, print the extracted logic (e.g., `40 -> Week`, `06 -> Year`).
* **Originality**: Do not use complicated canvas drawing or SVG bezier curves. Use standard HTML/CSS Flexbox alignments to link the text conceptually.

---

## PART 27 — SOURCES

* **Collapsed Summary**: "Based on 3 manufacturer documents." (Click to expand).
* **Expanded Source List**: Unordered list.
* **Source Card**: 14px Inter text.
* **Link**: Sky 600, target="_blank".
* **Count**: Shown in the summary toggle.

---

## PART 28 — WARNINGS / LIMITATIONS

* **Visual Treatment**: Amber 50 background, 1px Amber 300 border. Amber 900 text.
* **Content**: 
  * "Manufacture date is not installation date."
  * "Printed rating-plate dates take precedence over serial decoding."
* **Compactness**: Max 2 lines of text. No giant warning icons, just a subtle 16px alert icon inline.

---

## PART 29 — COPY RESULT

* **Component Behavior**: Copies a plain-text payload to the clipboard.
* **Copied Text Structure**:
  ```text
  Carrier Equipment
  Serial: 4006A17330
  Manufactured: October 2006
  Approximate Age: ~17 years
  Format: Carrier Standard WWYY
  Confidence: Verified
  --
  Decoded via SerialSense
  ```
* **Analytics**: **[FACT]** The serial number is copied locally. It is NEVER sent to Google Analytics or Plausible.

---

## PART 30 — DECODE ANOTHER

* **Button**: Slate 900 background, White text.
* **Placement**: Bottom right of the Result Card (or full width on mobile).
* **Behavior**: Resets state to Idle.
* **Focus Reset**: Crucial accessibility step — must call `focus()` on the serial input field immediately after reset.

---

## PART 31 — ERROR UI

* **System**: Replaces the Result Card with an Error Card.
* **Border**: `1px solid Red 300` (or Orange 300).
* **Background**: White.
* **Icon**: `48px` Red X Circle.
* **Headline**: `24px` Inter Bold, Slate 900. ("Invalid Serial Number").
* **Explanation**: `16px` Inter, Slate 600.
* **Next Action**: "Please verify the number on your rating plate."
* **Button**: "Try Again" (Resets state, focuses input).

---

## PART 32 — FAQ

* **Heading**: `24px` Inter Bold.
* **Accordion**: Native `<details>` and `<summary>` elements styled with CSS.
* **Spacing**: `16px` between accordions. `16px` padding inside.
* **Icon**: `+` (closed), `-` (open). Float right.
* **Focus**: Standard Sky 600 ring on the `<summary>`.
* **Keyboard**: Native HTML details element handles Space/Enter automatically.

---

## PART 33 — METHODOLOGY

* **Section**: Present on the homepage and expanded on a dedicated `/methodology` page.
* **Layout**: 3-column grid (Desktop), 1-column stack (Mobile).
* **Icons**: 24px stroke icons (Search, Shield, Code).
* **Copy**: Focused on the engineering rigor behind the tool (Research -> Cross-check -> Test -> Deploy).
* **Links**: Internal links to sources or Github if open-sourced.

---

## PART 34 — CORRECTIONS / FEEDBACK

* **Recommendation**: **V2** (Post-launch). Build audience first, then solicit corrections.
* **Future UI**: A text link in the footer of the Result Card: "Result look wrong? Let us know."
* **Fields**: Expected Date, Actual Rating Plate Photo (optional), Comments.
* **Privacy**: Explicitly state that submitted data is used solely to improve the decoding engine.

---

## PART 35 — BRAND PAGE

* **Shared Layout**:
  * H1 Header (e.g., "Carrier Serial Number Decoder").
  * 1-paragraph SEO/Intro text.
  * Decoder Widget (Pre-selected to Carrier).
  * [Result Card overrides Decoder on submit].
  * H2: Where to find Carrier serial numbers.
  * H2: Carrier Serial Number Formats (How it works).
  * H2: Common Mistakes.
  * H2: Frequently Asked Questions (Carrier specific).
  * H2: Sources.
* **Configurable Elements**: The page layout is a unified React component (`BrandPage.tsx`). Content is injected via a config object (`brandPages.ts`).

---

## PART 36 — HOMEPAGE

* **Dominance**: The Decoder Widget is the hero. It sits immediately below the H1.
* **Sections**:
  1. Hero + Decoder Widget.
  2. Supported Brands (Grid of text links: Carrier, Goodman, Lennox).
  3. "How it Works" (Methodology summary).
  4. Global FAQ.
* **Forbidden Elements**: No fake stats ("Trusted by 10,000+ pros"), no testimonials, no newsletter popups, no pricing.

---

## PART 37 — INFORMATION DENSITY

* **PRIMARY (Above the fold)**: Ultra-low density. 
  * Content: H1, Decoder Widget.
* **SECONDARY (Result state)**: High density.
  * Content: Dates, parsed arrays, warnings.
* **TERTIARY (Below the fold)**: Medium density text.
  * Content: FAQs, methodology.

---

## PART 38 — FOOTER

* **Layout**: 
  * Desktop: Flex row, space-between. Left: Brand notice. Right: Links.
  * Mobile: Flex column, gap 16px.
* **Links**: Privacy Policy, Home, Brands (Carrier, Goodman, Lennox).
* **Privacy**: Must contain a link to `/privacy`.
* **Brand Notice**: "SerialSense is an independent tool. Not affiliated with Carrier, Goodman, Lennox, or any manufacturer." (Muted Text, 12px).

---

## PART 39 — COMPLETE DESIGN TOKENS

**Copyable CSS Variables:**

```css
:root {
  /* COLORS: Base */
  --bg-page: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-surface-secondary: #F1F5F9;
  
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  
  --border-default: #CBD5E1;
  --border-subtle: #E2E8F0;
  
  /* COLORS: Brand */
  --accent-primary: #0F172A;
  --accent-hover: #334155;
  --accent-active: #000000;
  --link-color: #0284C7;
  
  /* COLORS: Semantic (Status) */
  --status-verified-bg: #F0FDF4;
  --status-verified-text: #15803D;
  
  --status-estimated-bg: #FFFBEB;
  --status-estimated-text: #B45309;
  
  --status-uncertain-bg: #FFF7ED;
  --status-uncertain-text: #C2410C;
  
  --status-error-bg: #FEF2F2;
  --status-error-text: #B91C1C;
  
  --status-info-bg: #F0F9FF;
  --status-info-text: #0369A1;

  /* TYPOGRAPHY */
  --font-ui: 'Inter', system-ui, sans-serif;
  --font-mono: 'Roboto Mono', monospace;

  /* SPACING */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* RADII */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-pill: 9999px;

  /* BORDERS */
  --border-width-default: 1px;
  --border-width-thick: 2px;

  /* SHADOWS */
  --shadow-subtle: 0 1px 2px rgba(15,23,42,0.05);
  --shadow-modal: 0 20px 25px -5px rgba(15,23,42,0.1), 0 0 0 1px rgba(15,23,42,0.05);

  /* TRANSITIONS */
  --transition-fast: 150ms ease-out;
  --transition-med: 200ms ease-out;

  /* SIZES */
  --input-height: 64px;
  --select-height: 48px;
  --icon-sm: 16px;
  --icon-md: 24px;

  /* LAYOUT */
  --max-width-app: 1024px;
  --max-width-decoder: 640px;
}
```

---

## PART 40 — DESIGN GUARDRAILS

### DO
* **DO** use exact pixel units for borders and spacing.
* **DO** use `Roboto Mono` for every serial number, input or output.
* **DO** rely on the 8px grid.
* **DO** prioritize text contrast over brand colors.

### DON'T
* **DON'T** use generic SaaS aesthetics. No soft drop shadows on cards.
* **DON'T** use rounded radii larger than `8px` (unless a pill badge).
* **DON'T** add gradients, textures, or background images.
* **DON'T** rely on color alone for semantic states.
* **DON'T** use floating labels inside inputs; use standard top labels for clarity.

---

## PART 41 — PERFORMANCE

* **Fonts**: Self-hosted `woff2` only. Do not add external Google Font requests.
* **Images**: SVGs only. No heavy PNGs/JPEGs needed for this UI.
* **Animations**: CSS transitions only. No JavaScript animation libraries (e.g., Framer Motion).
* **CSS**: Vanilla CSS variables. Keep the bundle microscopic.

---

## PART 42 — ACCESSIBILITY

* **WCAG Target**: WCAG 2.1 AA.
* **Contrast**: Strictly enforced via the Color System (Part 3).
* **Focus**: Global `*:focus-visible` ring (`2px solid var(--link-color)`).
* **Keyboard**: Full Tab index support. Form submission via `Enter`.
* **Live Regions**: The Result Card must utilize `aria-live="polite"` to announce the date immediately to screen readers.
* **Touch Targets**: Min `48px` height for all mobile buttons/selects.

---

## PART 43 — IMPLEMENTATION ARCHITECTURE

* **Reusable Components**: `DecoderWidget`, `ResultView`, `ErrorView`, `ConfidenceBadge`, `FAQAccordion`.
* **Design Token Location**: All tokens reside in `src/index.css` at the `:root`.
* **Manufacturer Data**: Stays strictly inside `src/decoder/manufacturers/`. The UI components must NOT import manufacturer specific logic.
* **Decoder/UI Boundary**: The UI only consumes the `DecodeResult` interface returned by `decode()`. Visual states (colors/icons) are mapped purely to `DecodeResult.status`.

---

## PART 44 — PRIORITY

* **MUST BUILD NOW**: Complete token integration in CSS, `DecoderWidget` redesign (inputs, sizes, typography), `ResultView` redesign (hierarchy, date size, confidence badge).
* **SHOULD BUILD NEXT**: Expandable parsed format breakdown component ("How did you decode this?"). FAQ accordion styling.
* **V2**: Searchable manufacturer picker, "Report Error" feedback form.

---

## PART 45 — FINAL PAGE WIREFRAME

```text
=============================================================
[ HEADER ]
  SerialSense                                [ Home ] [ Privacy ]
-------------------------------------------------------------

[ HERO ]
          Decode Your Equipment Serial Number
       Instantly determine manufacture date and age.

[ DECODER WIDGET - 640px wide ]
┌───────────────────────────────────────────────────────────┐
│  [ HVAC ] [ Water Heater ]                                │
│                                                           │
│  Manufacturer                                             │
│  [ Carrier                                              ▼]│
│                                                           │
│  Serial Number                                            │
│  [ 4006A17330                                            ]│
│                                                           │
│  [ DECODE BUTTON ]                                        │
│                                                           │
│  > Where is my serial number?                             │
└───────────────────────────────────────────────────────────┘

[ RESULT CARD - Overrides Decoder on Success ]
┌───────────────────────────────────────────────────────────┐
│                                       ( Verified Format ) │
│  Manufactured:                                            │
│  OCTOBER 2006                                             │
│                                                           │
│  Age: ~17 years                                           │
│                                                           │
│  Format: Carrier Standard WWYY                            │
│                                                           │
│  [ Copy ]  [ Decode Another ]                             │
└───────────────────────────────────────────────────────────┘

[ CONTENT ]
  Where to find it
  Common Mistakes
  FAQs
-------------------------------------------------------------
[ FOOTER ]
  Not affiliated with manufacturers.     [ Privacy ] [ Terms ]
=============================================================
```

---

## PART 46 — CODING AGENT HANDOFF

**Target Files to Modify:**
* `src/index.css` (Inject tokens).
* `src/components/DecoderWidget.tsx` (Update input/button styling classes).
* `src/components/ResultView.tsx` (Major visual overhaul of hierarchy and typography).
* `src/components/ConfidenceBadge.tsx` (Create/Update to use semantic color tokens).
* `src/pages/BrandPage.tsx` (Update layout spacing).

**Instructions for implementation agent:**
1. Do not alter the core decoding logic in `src/decoder`.
2. Do not add arbitrary styling libraries (e.g., Tailwind, Emotion). Stick to standard CSS + CSS modules/classes based on the provided tokens.
3. Validate typography hierarchy visually at 375px and 1024px.
4. Ensure 0 linting warnings and 100% test passing after styling refactors.
