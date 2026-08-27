# AI_ENGINEERING_RULES.md

## General Principles

1. **AI may implement verified domain knowledge, but AI may not create domain knowledge.**
2. **NEVER guess.** Accuracy is more important than coverage. A correct "Unable to confidently decode" is preferable to a wrong manufacture date.

## Domain & Research Constraints

3. **Never invent manufacturer decoding rules.**
4. **Never invent sources.** Use only verified, real-world documentation.
5. **Never invent real-world examples.** Synthetic test cases must be explicitly labeled as such.
6. **Never broaden a format without evidence.** Stick precisely to the documented rules, character lengths, and year boundaries.
7. **Never silently resolve ambiguity.** If a serial number could validly map to multiple dates, it must return `AMBIGUOUS`.
8. **Never replace a verified rule with a guessed "simpler" one.** Do not take shortcuts in validation.
9. **Never change format-era boundaries without documented evidence.**
10. **Read the relevant manufacturer specification** before changing any manufacturer logic.

## Architecture & Code Quality

11. **Keep domain knowledge separate from UI code.** Do not hardcode decoding rules or citations inside React components.
12. **Always preserve source metadata.** Every format rule must retain its authoritative citations.
13. **Never remove warnings solely for cleaner UX.** If the specification dictates a caveat (e.g., transitional era uncertainty), it must be surfaced to the user.
14. **Prefer returning uncertainty over incorrect certainty.** If a format is not strictly matched, return `UNSUPPORTED`.

## Testing

15. **Always add tests when changing decoding logic.**
16. **Never weaken validation to make a test pass.** If a test fails, fix the logic or verify if the test is correct, do not broaden the regex.
17. **Never treat a synthetic test fixture as real evidence.** Synthetic fixtures are for structural/edge-case testing only.
