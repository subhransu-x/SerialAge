Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let react_dom_server = require("react-dom/server");
let react_router = require("react-router");
let react_helmet_async = require("react-helmet-async");
let react_router_dom = require("react-router-dom");
let react = require("react");
react = __toESM(react, 1);
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/decoder/engine/registry.ts
/**
* In-memory registry of all known manufacturers.
*
* Manufacturers register themselves via side-effect imports:
* each manufacturer's index.ts calls registerManufacturer() at module load.
*/
var registry = /* @__PURE__ */ new Map();
/**
* Register a manufacturer's decoding rules.
*
* Called once per manufacturer at module load time.
* Throws if a duplicate ID is registered (catches copy-paste errors).
*
* @param definition - The manufacturer definition to register
* @throws Error if a manufacturer with the same ID is already registered
*/
function registerManufacturer(definition) {
	if (registry.has(definition.id)) throw new Error(`Duplicate manufacturer registration: "${definition.id}" is already registered. Each manufacturer must have a unique ID.`);
	if (definition.formats.length === 0) throw new Error(`Manufacturer "${definition.id}" has no format rules. Each manufacturer must have at least one FormatRule.`);
	const formatIds = /* @__PURE__ */ new Set();
	for (const format of definition.formats) {
		if (formatIds.has(format.id)) throw new Error(`Duplicate format ID "${format.id}" in manufacturer "${definition.id}". Each format rule must have a unique ID within its manufacturer.`);
		formatIds.add(format.id);
	}
	registry.set(definition.id, definition);
}
/**
* Look up a manufacturer by its canonical ID.
*
* @param id - Manufacturer ID (lowercase, kebab-case)
* @returns The manufacturer definition, or undefined if not found
*/
function getManufacturer(id) {
	return registry.get(id);
}
/**
* Get all registered manufacturers.
* Useful for populating brand selection dropdowns in the UI.
*
* @returns Array of all registered manufacturer definitions
*/
function getAllManufacturers() {
	return Array.from(registry.values());
}
//#endregion
//#region src/decoder/manufacturers/goodman/sources.ts
var STANDARD_10_SOURCES = [{
	name: "Building Intelligence Center",
	url: "https://www.building-center.org/goodman-hvac-age/",
	dateReviewed: "2026-08-23",
	notes: "Primary source for standard 10-digit format rules.",
	confidence: "verified"
}, {
	name: "Inspector Handbook",
	url: "https://inspectorhandbook.com/how-to-determine-age-of-goodman-hvac/",
	dateReviewed: "2026-08-23",
	notes: "Secondary verification of 10-digit rules.",
	confidence: "verified"
}];
var LEGACY_PTAC_SOURCES = [{
	name: "Inspector Handbook",
	url: "https://inspectorhandbook.com/how-to-determine-age-of-goodman-hvac/",
	dateReviewed: "2026-08-23",
	notes: "Mentions legacy PTAC rules but indicates ambiguity.",
	confidence: "probable"
}];
//#endregion
//#region src/decoder/manufacturers/goodman/formats.ts
/** Standard 10-digit numeric format: YYMMXXXXXX */
var STANDARD_10_PATTERN$2 = /^\d{10}$/;
/** Legacy PTAC format: Ends in P or D, contains letters in prefix */
var LEGACY_PTAC_PATTERN = /^.?[A-Z].*[PD]$/;
/** The unsupported format explanation */
var LEGACY_PTAC_EXPLANATION = "Pre-2012 Goodman PTAC units used a letter-based serial format that cannot be reliably decoded. Please check the data plate for a printed manufacture date.";
var GOODMAN_MIN_YEAR = 1982;
var CENTURY_THRESHOLD = 82;
var formats$5 = [{
	id: "goodman-standard-10",
	name: "Goodman Standard (10-Digit)",
	description: "Standard Goodman serial number format (~1982–present). 10-character numeric format: YYMMXXXXXX where YY=year, MM=month.",
	yearRange: [1982, null],
	productTypes: [],
	sources: STANDARD_10_SOURCES,
	matches(input) {
		return STANDARD_10_PATTERN$2.test(input.normalized);
	},
	decode(input) {
		const s = input.normalized;
		const yearDigits = s.substring(0, 2);
		const monthDigits = s.substring(2, 4);
		const yearTwoDigit = parseInt(yearDigits, 10);
		const month = parseInt(monthDigits, 10);
		if (month < 1 || month > 12) return null;
		const fullYear = yearTwoDigit >= CENTURY_THRESHOLD ? 1900 + yearTwoDigit : 2e3 + yearTwoDigit;
		if (fullYear < GOODMAN_MIN_YEAR) return null;
		return {
			year: fullYear,
			month,
			week: null,
			day: null,
			productType: "unknown",
			explanation: "Positions 1-2 indicate the year of manufacture. Positions 3-4 indicate the month of manufacture.",
			warnings: [],
			segments: [{
				startIndex: 0,
				endIndex: 2,
				field: "Year",
				value: yearDigits,
				description: `Year ${fullYear} of manufacture`
			}, {
				startIndex: 2,
				endIndex: 4,
				field: "Month",
				value: monthDigits,
				description: `Month ${month} of manufacture`
			}],
			metadata: { sequenceNumber: s.substring(4, 10) }
		};
	}
}, {
	id: "goodman-legacy-ptac",
	name: "Goodman Legacy PTAC",
	description: "Matches legacy pre-2012 Goodman PTAC units with letter codes that cannot be decoded reliably.",
	yearRange: [1980, 2011],
	productTypes: ["package-unit"],
	sources: LEGACY_PTAC_SOURCES,
	matches(input) {
		const s = input.normalized;
		return LEGACY_PTAC_PATTERN.test(s);
	},
	decode(_input) {
		return {
			error: "unsupported",
			explanation: LEGACY_PTAC_EXPLANATION
		};
	}
}];
//#endregion
//#region src/decoder/manufacturers/amana/sources.ts
var AMANA_MODERN_SOURCES = [{
	name: "Building Intelligence Center",
	url: "https://www.building-center.org/amana-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Primary source documenting the modern 10-digit numeric format.",
	confidence: "verified"
}, {
	name: "PickHVAC",
	url: "https://www.pickhvac.com/amana/",
	dateReviewed: "2026-08-27",
	notes: "Secondary verification of the modern Amana format.",
	confidence: "verified"
}];
//#endregion
//#region src/decoder/manufacturers/amana/index.ts
/**
* Amana Manufacturer Definition
*
* Amana was acquired by Goodman in 1997. The supported modern Amana format
* uses the exact same 10-digit YYMM structure as Goodman.
* Older dashed or spaced historical Amana formats are not supported.
*/
var goodmanStandard10 = formats$5.find((f) => f.id === "goodman-standard-10");
if (!goodmanStandard10) throw new Error("Required goodman-standard-10 format rule not found.");
registerManufacturer({
	id: "amana",
	name: "Amana",
	formats: [{
		...goodmanStandard10,
		name: "Amana Modern (10-Digit)",
		description: "Standard Amana HVAC serial number format (post-1997). 10-character numeric format: YYMMXXXXXX where YY=year, MM=month.",
		sources: AMANA_MODERN_SOURCES
	}]
});
//#endregion
//#region src/decoder/manufacturers/carrier/sources.ts
var WWYY_SOURCES = [
	{
		name: "Building Intelligence Center",
		url: "https://building-center.org",
		dateReviewed: "2026-08-22",
		notes: "Industry reference database for HVAC age identification. Lists Carrier \"Style 1\" format with example 4006A17330.",
		confidence: "verified"
	},
	{
		name: "InspectorHandbook.com",
		url: "https://inspectorhandbook.com",
		dateReviewed: "2026-08-22",
		notes: "Professional inspection reference. Confirms week-year format for Carrier/Bryant/Payne.",
		confidence: "verified"
	},
	{
		name: "Clarke-Rush.com (Carrier authorized dealer)",
		url: "https://clarke-rush.com",
		dateReviewed: "2026-08-22",
		notes: "Factory-authorized Carrier dealer. Describes WWYY format with first 2 digits = week, next 2 = year.",
		confidence: "verified"
	},
	{
		name: "ComfortMonster.com",
		url: "https://comfortmonster.com",
		dateReviewed: "2026-08-22",
		notes: "HVAC information resource. Confirms WWYY with 10-character format.",
		confidence: "verified"
	},
	{
		name: "ServMed.net",
		url: "https://servmed.net",
		dateReviewed: "2026-08-22",
		notes: "HVAC industry reference. Confirms 10-character WWYYAXXXXX breakdown.",
		confidence: "verified"
	},
	{
		name: "PickHVAC.com",
		url: "https://pickhvac.com",
		dateReviewed: "2026-08-22",
		notes: "Consumer HVAC guide. Confirms same format.",
		confidence: "verified"
	},
	{
		name: "CarrierColorado.com",
		url: "https://carriercolorado.com",
		dateReviewed: "2026-08-22",
		notes: "Confirms format and provides walk-through example.",
		confidence: "verified"
	}
];
var YYMM_SOURCES = [
	{
		name: "Building Intelligence Center",
		url: "https://building-center.org",
		dateReviewed: "2026-08-22",
		notes: "Lists 850304091 as Style 2 example. Structure verified. Era boundaries uncertain. Only 2 documented examples.",
		confidence: "probable"
	},
	{
		name: "InspectorHandbook.com",
		url: "https://inspectorhandbook.com",
		dateReviewed: "2026-08-22",
		notes: "Describes YYMM format for 1980s. Gives 8308 → August 1983 example.",
		confidence: "verified"
	},
	{
		name: "HowToLookAtAHouse.com",
		url: "https://howtolookatahouse.com",
		dateReviewed: "2026-08-22",
		notes: "Confirms YYMM variant exists for older units. Licensed inspector author.",
		confidence: "probable"
	}
];
var LEGACY_UNSUPPORTED_SOURCES = [{
	name: "Building Intelligence Center",
	url: "https://building-center.org",
	dateReviewed: "2026-08-22",
	notes: "Documents Styles 3–6 for pre-1985 Carrier serials. These formats have decade ambiguity, conflicting documentation, or insufficient verified examples.",
	confidence: "verified"
}, {
	name: "InspectorHandbook.com",
	url: "https://inspectorhandbook.com",
	dateReviewed: "2026-08-22",
	notes: "Confirms existence of 1970s and early 1980s letter-digit formats.",
	confidence: "verified"
}];
//#endregion
//#region src/decoder/manufacturers/carrier/formats.ts
/** Structural regex for WWYY format: 4 digits + 1 letter + 5 digits = 10 chars */
var WWYY_PATTERN = /^\d{4}[A-Z]\d{5}$/;
/** Structural regex for YYMM format: 9 digits = 9 chars */
var YYMM_PATTERN = /^\d{9}$/;
/**
* Structural patterns for known unsupported legacy Carrier formats.
* These match Styles 3, 4, 5, and 6 as documented in the specification.
*
* Style 3 (1980–1984): 8 chars, letter-digit or digit-letter start pattern
*   US format: letter + digit + 6 alphanumeric (e.g., W4D14008)
*   Canadian: digit + letter + 6 alphanumeric (e.g., 4WD14008)
*
* Style 4 (1970s): 7 chars, letter + 6 digits (e.g., A167890)
*
* Style 5 (1960s): 7 chars, digit + 6 digits (e.g., 6123456) — ambiguous
*   with Style 4 length, but all-digit.
*
* Style 6 (1960s–1970s): digit(s) + letter + digits (e.g., 46U152456)
*   Pattern: 1-2 digits + letter + remaining digits, ~9 chars total
*/
/** Style 4: letter (A-M, skipping I, used as month code) + digit + 5 digits = 7 chars */
var STYLE_4_PATTERN = /^[A-M]\d{6}$/;
/** Style 3 US: letter (M-Z, month code) + digit (0-4, year) + 6 alphanumeric = 8 chars */
var STYLE_3_US_PATTERN = /^[M-Z]\d[A-Z0-9]{6}$/;
/** Style 3 Canadian: digit (0-4) + letter (M-Z) + 6 alphanumeric = 8 chars */
var STYLE_3_CA_PATTERN = /^\d[M-Z][A-Z0-9]{6}$/;
/** Style 6: 1-2 digits + letter + remaining digits, total 7-10 chars. */
var STYLE_6_PATTERN = /^\d{1,2}[A-Z]\d{4,7}$/;
/** The unsupported format explanation per the specification. */
var LEGACY_UNSUPPORTED_EXPLANATION$1 = "Pre-1985 serial numbers cannot be reliably decoded. Check the data plate for a printed manufacture date.";
/**
* Century resolution for 2-digit years in WWYY format.
*
* Per carrier_specification.md:
* - YY >= 85 → 1985–1999 (1900 + YY)
* - YY < 85  → 2000–2084 (2000 + YY)
*
* This threshold is based on the documented fact that Carrier did not
* use this format before ~1985. Do NOT change without evidence.
*/
var WWYY_CENTURY_THRESHOLD = 85;
var MIN_WEEK = 1;
var MAX_WEEK = 52;
var YYMM_MIN_YEAR_2DIGIT = 80;
var YYMM_MAX_YEAR_2DIGIT = 89;
var TRANSITIONAL_ERA_START = 1985;
var TRANSITIONAL_ERA_END = 1989;
var TRANSITIONAL_ERA_WARNING = "Transitional era (1980s). Format is highly likely, but verify with the printed data plate if possible.";
var YYMM_WARNING = "Older Carrier units (1980s) — manufacture date may be approximate. Verify with data plate.";
var formats$4 = [
	{
		id: "carrier-wwyy-standard",
		name: "Carrier WWYY Standard",
		description: "Standard Carrier/Bryant/Payne serial number format (~1985–present). 10-character format: WWYYAXXXXX where WW=week, YY=year, A=plant code, XXXXX=sequence.",
		yearRange: [1985, null],
		productTypes: [],
		sources: WWYY_SOURCES,
		matches(input) {
			return WWYY_PATTERN.test(input.normalized);
		},
		decode(input) {
			const s = input.normalized;
			const weekDigits = s.substring(0, 2);
			const yearDigits = s.substring(2, 4);
			const week = parseInt(weekDigits, 10);
			const yearTwoDigit = parseInt(yearDigits, 10);
			if (week < MIN_WEEK || week > MAX_WEEK) return null;
			const fullYear = yearTwoDigit >= WWYY_CENTURY_THRESHOLD ? 1900 + yearTwoDigit : 2e3 + yearTwoDigit;
			const warnings = [];
			if (fullYear >= TRANSITIONAL_ERA_START && fullYear <= TRANSITIONAL_ERA_END) warnings.push(TRANSITIONAL_ERA_WARNING);
			const plantCode = s.charAt(4);
			return {
				year: fullYear,
				month: null,
				week,
				day: null,
				productType: "unknown",
				explanation: "Positions 1-2 indicate the week of manufacture. Positions 3-4 indicate the year of manufacture. Position 5 is a plant code.",
				warnings,
				segments: [
					{
						startIndex: 0,
						endIndex: 2,
						field: "Week",
						value: weekDigits,
						description: `Week ${week} of manufacture`
					},
					{
						startIndex: 2,
						endIndex: 4,
						field: "Year",
						value: yearDigits,
						description: `Year ${fullYear} of manufacture`
					},
					{
						startIndex: 4,
						endIndex: 5,
						field: "Plant Code",
						value: plantCode,
						description: "Manufacturing plant identifier"
					}
				],
				metadata: {
					plantCode,
					sequenceNumber: s.substring(5, 10)
				}
			};
		}
	},
	{
		id: "carrier-yymm-legacy",
		name: "Carrier YYMM Legacy",
		description: "Legacy Carrier serial number format (~1980–1989). 9-character all-digit format: YYMMXXXXX where YY=year (80–89), MM=month (01–12).",
		yearRange: [1980, 1989],
		productTypes: [],
		sources: YYMM_SOURCES,
		matches(input) {
			return YYMM_PATTERN.test(input.normalized);
		},
		decode(input) {
			const s = input.normalized;
			const yearDigits = s.substring(0, 2);
			const monthDigits = s.substring(2, 4);
			const yearTwoDigit = parseInt(yearDigits, 10);
			const month = parseInt(monthDigits, 10);
			if (yearTwoDigit < YYMM_MIN_YEAR_2DIGIT || yearTwoDigit > YYMM_MAX_YEAR_2DIGIT) return null;
			if (month < 1 || month > 12) return null;
			const fullYear = 1900 + yearTwoDigit;
			return {
				year: fullYear,
				month,
				week: null,
				day: null,
				productType: "unknown",
				explanation: "Positions 1-2 indicate the year of manufacture. Positions 3-4 indicate the month of manufacture.",
				warnings: [YYMM_WARNING],
				segments: [{
					startIndex: 0,
					endIndex: 2,
					field: "Year",
					value: yearDigits,
					description: `Year ${fullYear} of manufacture`
				}, {
					startIndex: 2,
					endIndex: 4,
					field: "Month",
					value: monthDigits,
					description: `Month ${month} of manufacture`
				}],
				metadata: { sequenceNumber: s.substring(4, 9) }
			};
		}
	},
	{
		id: "carrier-legacy-unsupported",
		name: "Carrier Pre-1985 Legacy Formats",
		description: "Matches documented pre-1985 Carrier serial formats (Styles 3, 4, 5, 6) that cannot be reliably decoded due to decade ambiguity, conflicting documentation, or insufficient verified examples.",
		yearRange: [1960, 1984],
		productTypes: [],
		sources: LEGACY_UNSUPPORTED_SOURCES,
		matches(input) {
			const s = input.normalized;
			if (STYLE_4_PATTERN.test(s)) return true;
			if (STYLE_3_US_PATTERN.test(s)) return true;
			if (STYLE_3_CA_PATTERN.test(s)) return true;
			if (STYLE_6_PATTERN.test(s) && !WWYY_PATTERN.test(s)) return true;
			return false;
		},
		decode(_input) {
			return {
				error: "unsupported",
				explanation: LEGACY_UNSUPPORTED_EXPLANATION$1
			};
		}
	}
];
//#endregion
//#region src/decoder/manufacturers/bryant/sources.ts
var BRYANT_WWYY_SOURCES = [{
	name: "Building Intelligence Center",
	url: "https://building-center.org/bryant-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Bryant documentation confirming the 10-character WWYY format pattern (Style 1).",
	confidence: "verified"
}];
var BRYANT_YYMM_SOURCES = [{
	name: "Building Intelligence Center",
	url: "https://building-center.org/bryant-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Bryant documentation confirming the 9-digit YYMM format pattern (Style 2).",
	confidence: "verified"
}];
var BRYANT_LEGACY_SOURCES = [{
	name: "Building Intelligence Center",
	url: "https://building-center.org/bryant-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Bryant documentation showing highly varied legacy formats (Styles 3, 4, 5) that are not reliably decodable.",
	confidence: "verified"
}];
registerManufacturer({
	id: "bryant",
	name: "Bryant",
	formats: formats$4.map((f) => {
		let overrideSources = f.sources;
		if (f.id === "carrier-wwyy-standard") overrideSources = BRYANT_WWYY_SOURCES;
		if (f.id === "carrier-yymm-legacy") overrideSources = BRYANT_YYMM_SOURCES;
		if (f.id === "carrier-legacy-unsupported") overrideSources = BRYANT_LEGACY_SOURCES;
		return {
			...f,
			name: f.name.replace("Carrier", "Bryant"),
			description: f.description.replace("Carrier/Bryant/Payne", "Bryant"),
			sources: overrideSources
		};
	})
});
//#endregion
//#region src/decoder/manufacturers/carrier/index.ts
/**
* Carrier manufacturer registration.
*
* Registers the Carrier serial number decoder with the pipeline.
* Covers Carrier, Bryant, and Payne residential HVAC equipment
* (same parent company, same serial format).
*
* Source of truth: carrier_specification.md
*/
registerManufacturer({
	id: "carrier",
	name: "Carrier",
	formats: formats$4
});
//#endregion
//#region src/decoder/manufacturers/goodman/index.ts
/**
* Goodman manufacturer registration.
*
* Registers the Goodman serial number decoder with the pipeline.
* Covers Goodman and Amana residential HVAC equipment.
*
* Source of truth: goodman_implementation_contract.md
*/
registerManufacturer({
	id: "goodman",
	name: "Goodman",
	formats: formats$5
});
//#endregion
//#region src/decoder/manufacturers/lennox/sources.ts
var LENNOX_SOURCES = { modernStandard: [{
	name: "Building Intelligence Center: Lennox HVAC Age",
	url: "https://www.building-center.org/lennox-hvac-age/",
	confidence: "verified"
}, {
	name: "Inspector Handbook: Lennox Serial Numbers",
	confidence: "verified"
}] };
//#endregion
//#region src/decoder/manufacturers/lennox/formats.ts
var monthMap = {
	A: 1,
	B: 2,
	C: 3,
	D: 4,
	E: 5,
	F: 6,
	G: 7,
	H: 8,
	J: 9,
	K: 10,
	L: 11,
	M: 12
};
registerManufacturer({
	id: "lennox",
	name: "Lennox",
	formats: [{
		id: "lennox-standard-10",
		name: "Lennox Standard (10-Character)",
		description: "10 characters: positions 3-4 are year, position 5 is month letter (A-M, skipping I).",
		yearRange: [1974, null],
		productTypes: [],
		sources: LENNOX_SOURCES.modernStandard,
		matches(input) {
			return /^.{2}(\d{2})([A-HJ-M]).{5}$/i.test(input.normalized);
		},
		decode(input) {
			const match = input.normalized.match(/^.{2}(\d{2})([A-HJ-M]).{5}$/i);
			if (!match) return null;
			const yearRaw = parseInt(match[1], 10);
			const monthLetter = match[2].toUpperCase();
			const month = monthMap[monthLetter];
			const year = yearRaw >= 74 ? 1900 + yearRaw : 2e3 + yearRaw;
			return {
				year,
				month,
				week: null,
				day: null,
				productType: "unknown",
				warnings: [],
				segments: [{
					startIndex: 2,
					endIndex: 4,
					field: "Year",
					value: match[1],
					description: `Year ${year} of manufacture`
				}, {
					startIndex: 4,
					endIndex: 5,
					field: "Month",
					value: monthLetter,
					description: `Month ${month} of manufacture (letter code)`
				}],
				metadata: {
					plantCode: input.normalized.substring(0, 2),
					sequence: input.normalized.substring(5, 10)
				},
				explanation: "Positions 3-4 indicate the year of manufacture. Position 5 (letter) indicates the month of manufacture."
			};
		}
	}]
});
//#endregion
//#region src/decoder/manufacturers/payne/sources.ts
var PAYNE_WWYY_SOURCES = [{
	name: "Building Intelligence Center",
	url: "https://building-center.org/payne-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Payne documentation confirming the 10-character WWYY format pattern.",
	confidence: "verified"
}];
var PAYNE_YYMM_SOURCES = [{
	name: "Building Intelligence Center",
	url: "https://building-center.org/payne-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Payne documentation confirming the 9-digit YYMM format pattern.",
	confidence: "verified"
}];
var PAYNE_LEGACY_SOURCES = [{
	name: "Building Intelligence Center",
	url: "https://building-center.org/payne-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Payne documentation showing highly varied legacy formats that are not reliably decodable.",
	confidence: "verified"
}];
registerManufacturer({
	id: "payne",
	name: "Payne",
	formats: formats$4.map((f) => {
		let overrideSources = f.sources;
		if (f.id === "carrier-wwyy-standard") overrideSources = PAYNE_WWYY_SOURCES;
		if (f.id === "carrier-yymm-legacy") overrideSources = PAYNE_YYMM_SOURCES;
		if (f.id === "carrier-legacy-unsupported") overrideSources = PAYNE_LEGACY_SOURCES;
		return {
			...f,
			name: f.name.replace("Carrier", "Payne"),
			description: f.description.replace("Carrier/Bryant/Payne", "Payne"),
			sources: overrideSources
		};
	})
});
//#endregion
//#region src/decoder/manufacturers/rheem/sources.ts
/**
* Building Intelligence Center — primary authority for both formats.
* Documents Style 1 (10-char) and Style 2/3 (embedded plant code).
*/
var BIC_SOURCE$3 = {
	name: "Building Intelligence Center",
	url: "https://www.building-center.org/rheem-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Industry reference database for HVAC age identification. Documents Rheem serial formats including the modern 10-character format (Style 1: plant letter + week + year + sequence) and the older embedded plant-code format (Style 2/3: prefix + plant letter F/M/G/N + week + year).",
	confidence: "verified"
};
/** Sources for rheem-standard-10 (modern 10-character format) */
var RHEEM_STANDARD_10_SOURCES = [BIC_SOURCE$3, {
	name: "PickHVAC.com",
	url: "https://pickhvac.com",
	dateReviewed: "2026-08-27",
	notes: "HVAC technician guide. Corroborates the 10-character modern Rheem format (letter + week + year + 5 sequence digits). Validates the week and year position rules.",
	confidence: "verified"
}];
/** Sources for rheem-embedded-plant (older embedded plant-code formats) */
var RHEEM_EMBEDDED_PLANT_SOURCES = [BIC_SOURCE$3];
//#endregion
//#region src/decoder/manufacturers/rheem/formats.ts
/**
* Format 1: rheem-standard-10
* Structure: 1 Letter + 2-digit week + 2-digit year + 5-digit sequence (total 10 chars).
* Regex from contract: ^[A-Z](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})[0-9]{5}$
*
* Length: exactly 10.
*/
var STANDARD_10_PATTERN$1 = /^[A-Z](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})[0-9]{5}$/;
/**
* Format 2: rheem-embedded-plant
*
* Phase 8F safety fix — the original contract regex had no ^ anchor, allowing ANY
* substring containing a plant letter + valid week+year to match, including garbage.
* Adversarial analysis (Phase 8F) identified 9 real-user false-positive patterns:
*   - All-alpha prefixes (MODEL, SN, AC, ABC, W)
*   - All-digit prefixes (1234567, 9999999)
*   - Long arbitrary strings (RANDOMSTRING...)
*   - Typos adding extra chars to a Format 1 serial (WW421724596)
*   - Multi-segment strings with multiple plant candidates
*
* FIX: Two-pattern approach:
*
* PATTERN A — Anchored mixed-prefix format:
*   ^[A-Z0-9\s]{2,9}[FMGNW](week)(yr)[0-9\s]{0,6}$
*   PLUS a code-level check that the prefix contains BOTH at least one letter
*   AND at least one digit (mixed alphanumeric prefix, as seen in the goldens
*   CB5D302 and AB6D307). This eliminates pure-alpha and pure-digit false positives.
*
* PATTERN B — Spaced 3-part format:
*   ^\d{4}\s[FMGNW](week)(yr)\s\d{5}$
*   Covers the documented '7351 M2806 16735' style exactly.
*   This is more restrictive than Pattern A and avoids ambiguity.
*
* All 5 contract golden examples are preserved:
*   CB5D302F099903346  -> PATTERN A (mixed prefix)
*   7351 M2806 16735   -> PATTERN B (spaced 3-part)
*   AB6D307-M-0999     -> PATTERN A (mixed prefix, hyphens stripped)
*/
/** Format 2A: anchored, mixed-alphanumeric prefix (2–9 chars), optional trailing seq */
var EMBEDDED_PLANT_PATTERN_A$1 = /^[A-Z0-9\s]{2,9}[FMGNW](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})[0-9\s]{0,6}$/;
/** Format 2B: spaced 3-part format exactly — DDDD PLANT_WWYY DDDDD */
var EMBEDDED_PLANT_PATTERN_B$1 = /^\d{4}\s[FMGNW](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})\s\d{5}$/;
/** Return true if str contains at least one [A-Z] AND at least one [0-9]. */
function isMixedAlphanumeric$1(s) {
	return /[A-Z]/.test(s) && /[0-9]/.test(s);
}
/**
* Resolve a 2-digit year to a 4-digit year using a 50-year sliding window.
*
* Contract Section 1 (Format 1, Format 2):
* "Use a 50-year sliding window based on the current year."
*
* Example (current year 2026):
*   2-digit 17 → threshold = 2026 - 50 = 1976 → 2017 (within 50 yrs of current)
*   2-digit 99 → 1999 (not within 50 yrs of 2026 if we used 2099, so → 1999)
*/
function resolveYear$1(twoDigit) {
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	const candidate2000 = 2e3 + twoDigit;
	const candidate1900 = 1900 + twoDigit;
	if (candidate2000 <= currentYear + 2) return candidate2000;
	return candidate1900;
}
//#endregion
//#region src/decoder/manufacturers/rheem/index.ts
/**
* Rheem manufacturer registration.
*
* Registers the Rheem serial number decoder with the pipeline engine.
* Also covers Ruud (same parent company, same serial format — registered separately).
*
* Source of truth: rheem_ruud_implementation_contract.md
* Research audit:  rheem_ruud_research_audit.md
*/
registerManufacturer({
	id: "rheem",
	name: "Rheem",
	formats: [{
		id: "rheem-standard-10",
		name: "Rheem Standard 10-Character Format",
		description: "10-character format used by modern Rheem and Ruud HVAC equipment. Character 1 is the manufacturing plant identification code. Characters 2-3 encode the week of manufacture (01–53). Characters 4-5 encode the 2-digit year. Characters 6-10 are the production sequence number.",
		yearRange: [1980, null],
		productTypes: [],
		sources: RHEEM_STANDARD_10_SOURCES,
		matches(input) {
			return input.normalized.length === 10 && STANDARD_10_PATTERN$1.test(input.normalized);
		},
		decode(input) {
			const match = input.normalized.match(STANDARD_10_PATTERN$1);
			if (!match) return null;
			const plantCode = input.normalized[0];
			const week = parseInt(match[1], 10);
			const fullYear = resolveYear$1(parseInt(match[2], 10));
			return {
				year: fullYear,
				month: null,
				week,
				day: null,
				productType: "unknown",
				explanation: `Character 1 is the plant code ("${plantCode}"). Characters 2-3 indicate the week of manufacture (week ${week}). Characters 4-5 indicate the year of manufacture (${match[2]} = ${fullYear}).`,
				warnings: [],
				segments: [
					{
						startIndex: 0,
						endIndex: 1,
						field: "Plant Code",
						value: plantCode,
						description: "Manufacturing plant identifier"
					},
					{
						startIndex: 1,
						endIndex: 3,
						field: "Week",
						value: match[1],
						description: `Week ${week} of manufacture`
					},
					{
						startIndex: 3,
						endIndex: 5,
						field: "Year",
						value: match[2],
						description: `Year ${fullYear} of manufacture`
					}
				],
				metadata: {
					plantCode,
					sequence: input.normalized.substring(5)
				}
			};
		}
	}, {
		id: "rheem-embedded-plant",
		name: "Rheem Embedded Plant Code Format (Styles 2/3)",
		description: "Older Rheem and Ruud serial number format (typically 10–17 characters) where the manufacture date is encoded following a plant letter (F, M, G, N, or W) embedded within the string. The two digits immediately after the plant letter encode the week of manufacture (01–53), and the next two digits encode the 2-digit year. Used in commercial and older residential equipment.",
		yearRange: [1975, 2010],
		productTypes: [],
		sources: RHEEM_EMBEDDED_PLANT_SOURCES,
		matches(input) {
			if (input.withoutHyphens.length < 10) return false;
			if (STANDARD_10_PATTERN$1.test(input.withoutHyphens)) return false;
			const w = input.withoutHyphens;
			if (EMBEDDED_PLANT_PATTERN_B$1.test(w)) return true;
			if (!w.match(EMBEDDED_PLANT_PATTERN_A$1)) return false;
			const plantPatternPos = w.search(/[FMGNW](0[1-9]|[1-4][0-9]|5[0-3])[0-9]{2}[0-9\s]{0,6}$/);
			if (plantPatternPos < 0) return false;
			return isMixedAlphanumeric$1(w.slice(0, plantPatternPos));
		},
		decode(input) {
			const w = input.withoutHyphens;
			const matchB = w.match(EMBEDDED_PLANT_PATTERN_B$1);
			if (matchB) {
				const week = parseInt(matchB[1], 10);
				const fullYear = resolveYear$1(parseInt(matchB[2], 10));
				const plantLetter = w[5];
				return {
					year: fullYear,
					month: null,
					week,
					day: null,
					productType: "unknown",
					explanation: `Plant code letter "${plantLetter}" is followed by the week (${matchB[1]} = week ${week}) and year (${matchB[2]} = ${fullYear}) of manufacture.`,
					warnings: ["Format 2 date extraction is based on the embedded plant letter position. Verify against the unit data plate if the date appears incorrect."],
					metadata: { plantLetter }
				};
			}
			const matchA = w.match(EMBEDDED_PLANT_PATTERN_A$1);
			if (!matchA) return null;
			const week = parseInt(matchA[1], 10);
			const fullYear = resolveYear$1(parseInt(matchA[2], 10));
			const matchedSubstring = matchA[0];
			const weekStr = matchA[1];
			const weekStartInMatch = matchedSubstring.indexOf(weekStr);
			const plantLetter = weekStartInMatch > 0 ? matchedSubstring[weekStartInMatch - 1] : "?";
			return {
				year: fullYear,
				month: null,
				week,
				day: null,
				productType: "unknown",
				explanation: `Plant code letter "${plantLetter}" is followed by the week (${matchA[1]} = week ${week}) and year (${matchA[2]} = ${fullYear}) of manufacture.`,
				warnings: ["Format 2 date extraction is based on the embedded plant letter position. Verify against the unit data plate if the date appears incorrect."],
				metadata: { plantLetter }
			};
		}
	}]
});
//#endregion
//#region src/decoder/manufacturers/ruud/sources.ts
/**
* Building Intelligence Center — primary authority for both formats.
* Documents Style 1 (10-char) and Style 2/3 (embedded plant code).
*/
var BIC_SOURCE$2 = {
	name: "Building Intelligence Center",
	url: "https://www.building-center.org/rheem-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Industry reference database for HVAC age identification. Documents Ruud (Rheem) serial formats including the modern 10-character format (Style 1: plant letter + week + year + sequence) and the older embedded plant-code format (Style 2/3: prefix + plant letter F/M/G/N + week + year).",
	confidence: "verified"
};
/** Sources for ruud-standard-10 (modern 10-character format) */
var RUUD_STANDARD_10_SOURCES = [BIC_SOURCE$2, {
	name: "PickHVAC.com",
	url: "https://pickhvac.com",
	dateReviewed: "2026-08-27",
	notes: "HVAC technician guide. Corroborates the 10-character modern Ruud format (letter + week + year + 5 sequence digits). Validates the week and year position rules.",
	confidence: "verified"
}];
/** Sources for ruud-embedded-plant (older embedded plant-code formats) */
var RUUD_EMBEDDED_PLANT_SOURCES = [BIC_SOURCE$2];
//#endregion
//#region src/decoder/manufacturers/ruud/formats.ts
/**
* Format 1: ruud-standard-10
* Structure: 1 Letter + 2-digit week + 2-digit year + 5-digit sequence (total 10 chars).
* Regex from contract: ^[A-Z](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})[0-9]{5}$
*
* Length: exactly 10.
*/
var STANDARD_10_PATTERN = /^[A-Z](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})[0-9]{5}$/;
/**
* Format 2: ruud-embedded-plant
*
* Phase 8F safety fix — see rheem/formats.ts for full analysis.
* Two-pattern approach:
*   Pattern A: ^[A-Z0-9\s]{2,9}[FMGNW](week)(yr)[0-9\s]{0,6}$ with code-level mixed-prefix check
*   Pattern B: ^\d{4}\s[FMGNW](week)(yr)\s\d{5}$ (strict spaced format)
*/
/** Format 2A: anchored, mixed-alphanumeric prefix (2–9 chars), optional trailing seq */
var EMBEDDED_PLANT_PATTERN_A = /^[A-Z0-9\s]{2,9}[FMGNW](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})[0-9\s]{0,6}$/;
/** Format 2B: spaced 3-part format exactly — DDDD PLANT_WWYY DDDDD */
var EMBEDDED_PLANT_PATTERN_B = /^\d{4}\s[FMGNW](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})\s\d{5}$/;
/** Return true if str contains at least one [A-Z] AND at least one [0-9]. */
function isMixedAlphanumeric(s) {
	return /[A-Z]/.test(s) && /[0-9]/.test(s);
}
/**
* Resolve a 2-digit year to a 4-digit year using a 50-year sliding window.
*
* Contract Section 1 (Format 1, Format 2):
* "Use a 50-year sliding window based on the current year."
*
* Example (current year 2026):
*   2-digit 17 → threshold = 2026 - 50 = 1976 → 2017 (within 50 yrs of current)
*   2-digit 99 → 1999 (not within 50 yrs of 2026 if we used 2099, so → 1999)
*/
function resolveYear(twoDigit) {
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	const candidate2000 = 2e3 + twoDigit;
	const candidate1900 = 1900 + twoDigit;
	if (candidate2000 <= currentYear + 2) return candidate2000;
	return candidate1900;
}
//#endregion
//#region src/decoder/manufacturers/ruud/index.ts
/**
* Ruud manufacturer registration.
*
* Registers the Ruud serial number decoder with the pipeline engine.
* Ruud shares the same serial formats as Rheem.
*
* Source of truth: rheem_ruud_implementation_contract.md
* Research audit:  rheem_ruud_research_audit.md
*/
registerManufacturer({
	id: "ruud",
	name: "Ruud",
	formats: [{
		id: "ruud-standard-10",
		name: "Ruud Standard 10-Character Format",
		description: "10-character format used by modern Ruud HVAC equipment. Character 1 is the manufacturing plant identification code. Characters 2-3 encode the week of manufacture (01–53). Characters 4-5 encode the 2-digit year. Characters 6-10 are the production sequence number.",
		yearRange: [1980, null],
		productTypes: [],
		sources: RUUD_STANDARD_10_SOURCES,
		matches(input) {
			return input.normalized.length === 10 && STANDARD_10_PATTERN.test(input.normalized);
		},
		decode(input) {
			const match = input.normalized.match(STANDARD_10_PATTERN);
			if (!match) return null;
			const plantCode = input.normalized[0];
			const week = parseInt(match[1], 10);
			const fullYear = resolveYear(parseInt(match[2], 10));
			return {
				year: fullYear,
				month: null,
				week,
				day: null,
				productType: "unknown",
				explanation: `Character 1 is the plant code ("${plantCode}"). Characters 2-3 indicate the week of manufacture (week ${week}). Characters 4-5 indicate the year of manufacture (${match[2]} = ${fullYear}).`,
				warnings: [],
				segments: [
					{
						startIndex: 0,
						endIndex: 1,
						field: "Plant Code",
						value: plantCode,
						description: "Manufacturing plant identifier"
					},
					{
						startIndex: 1,
						endIndex: 3,
						field: "Week",
						value: match[1],
						description: `Week ${week} of manufacture`
					},
					{
						startIndex: 3,
						endIndex: 5,
						field: "Year",
						value: match[2],
						description: `Year ${fullYear} of manufacture`
					}
				],
				metadata: {
					plantCode,
					sequence: input.normalized.substring(5)
				}
			};
		}
	}, {
		id: "ruud-embedded-plant",
		name: "Ruud Embedded Plant Code Format (Styles 2/3)",
		description: "Older Ruud serial number format (typically 10–17 characters) where the manufacture date is encoded following a plant letter (F, M, G, N, or W) embedded within the string. The two digits immediately after the plant letter encode the week of manufacture (01–53), and the next two digits encode the 2-digit year. Used in commercial and older residential equipment.",
		yearRange: [1975, 2010],
		productTypes: [],
		sources: RUUD_EMBEDDED_PLANT_SOURCES,
		matches(input) {
			if (input.withoutHyphens.length < 10) return false;
			if (STANDARD_10_PATTERN.test(input.withoutHyphens)) return false;
			const w = input.withoutHyphens;
			if (EMBEDDED_PLANT_PATTERN_B.test(w)) return true;
			if (!w.match(EMBEDDED_PLANT_PATTERN_A)) return false;
			const plantPatternPos = w.search(/[FMGNW](0[1-9]|[1-4][0-9]|5[0-3])[0-9]{2}[0-9\s]{0,6}$/);
			if (plantPatternPos < 0) return false;
			return isMixedAlphanumeric(w.slice(0, plantPatternPos));
		},
		decode(input) {
			const w = input.withoutHyphens;
			const matchB = w.match(EMBEDDED_PLANT_PATTERN_B);
			if (matchB) {
				const week = parseInt(matchB[1], 10);
				const fullYear = resolveYear(parseInt(matchB[2], 10));
				const plantLetter = w[5];
				return {
					year: fullYear,
					month: null,
					week,
					day: null,
					productType: "unknown",
					explanation: `Plant code letter "${plantLetter}" is followed by the week (${matchB[1]} = week ${week}) and year (${matchB[2]} = ${fullYear}) of manufacture.`,
					warnings: ["Format 2 date extraction is based on the embedded plant letter position. Verify against the unit data plate if the date appears incorrect."],
					metadata: { plantLetter }
				};
			}
			const matchA = w.match(EMBEDDED_PLANT_PATTERN_A);
			if (!matchA) return null;
			const week = parseInt(matchA[1], 10);
			const fullYear = resolveYear(parseInt(matchA[2], 10));
			const matchedSubstring = matchA[0];
			const weekStartInMatch = matchedSubstring.indexOf(matchA[1]);
			const plantLetter = weekStartInMatch > 0 ? matchedSubstring[weekStartInMatch - 1] : "?";
			return {
				year: fullYear,
				month: null,
				week,
				day: null,
				productType: "unknown",
				explanation: `Plant code letter "${plantLetter}" is followed by the week (${matchA[1]} = week ${week}) and year (${matchA[2]} = ${fullYear}) of manufacture.`,
				warnings: ["Format 2 date extraction is based on the embedded plant letter position. Verify against the unit data plate if the date appears incorrect."],
				metadata: { plantLetter }
			};
		}
	}]
});
//#endregion
//#region src/decoder/manufacturers/trane/sources.ts
/**
* Building Intelligence Center — primary authority for all three supported formats.
* Confirms the length-based format delineation: 9-char (1983-2001, 2002-2009)
* vs 10-char (2010-present). Documents the letter-year mapping table.
*/
var BIC_SOURCE$1 = {
	name: "Building Intelligence Center",
	url: "https://www.building-center.org/trane-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Industry reference database for HVAC age identification. Documents Trane serial formats from 1983 to present. Confirms length-based delineation: 9-char for 1983-2009, 10-char for 2010+. Documents the letter-year mapping table for 1983-2001.",
	confidence: "verified"
};
/**
* InspectorHandbook.com — corroborates the letter-prefix table for 1983-2001.
*/
var INSPECTOR_HANDBOOK_SOURCE = {
	name: "InspectorHandbook.com",
	url: "https://inspectorhandbook.com",
	dateReviewed: "2026-08-27",
	notes: "Professional home inspection reference. Corroborates the letter-prefix table for Trane serial numbers manufactured from 1983 to 2001.",
	confidence: "verified"
};
/**
* PickHVAC.com — validates the 10-char vs 9-char rule with real examples.
*/
var PICK_HVAC_SOURCE = {
	name: "PickHVAC.com",
	url: "https://pickhvac.com",
	dateReviewed: "2026-08-27",
	notes: "HVAC technician guide. Provides verified examples of 2010+ (10-char) and 2002-2009 (9-char) formats. Validates the year-week position rules.",
	confidence: "verified"
};
/** Sources for trane-modern-10 (2010–present) */
var TRANE_MODERN_10_SOURCES = [BIC_SOURCE$1, PICK_HVAC_SOURCE];
/** Sources for trane-standard-9 (2002–2009) */
var TRANE_STANDARD_9_SOURCES = [BIC_SOURCE$1, PICK_HVAC_SOURCE];
/** Sources for trane-letter-9 (1983–2001) */
var TRANE_LETTER_9_SOURCES = [BIC_SOURCE$1, INSPECTOR_HANDBOOK_SOURCE];
/** Sources for the legacy-unsupported trap rule */
var TRANE_LEGACY_UNSUPPORTED_SOURCES = [BIC_SOURCE$1];
//#endregion
//#region src/decoder/manufacturers/trane/formats.ts
/**
* Format A: trane-modern-10
* Regex from contract: /^([1-9][0-9])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/i
* Length: exactly 10.
*/
var MODERN_10_PATTERN = /^([1-9][0-9])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/;
/**
* Format B: trane-standard-9
* Regex from contract: /^([2-9])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/i
* Length: exactly 9.
*/
var STANDARD_9_PATTERN = /^([2-9])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/;
/**
* Format C: trane-letter-9
* Regex from contract: /^([WXYSCBDEFGHJKLMNPRZ])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/i
* Length: exactly 9.
* Letters I, O, Q, T, U, V are intentionally excluded (not assigned by Trane).
*/
var LETTER_9_PATTERN = /^([WXYSCBDEFGHJKLMNPRZ])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/;
/**
* Legacy unsupported pattern: any 10-char serial starting with a letter.
* Per contract Section 3: "Any 10-character serial starting with a letter" → Unsupported.
* Per research audit Part 6: "Any 10-char starting with a letter → Conflicts with pre-1983 styles."
*/
var LEGACY_10_LETTER_START_PATTERN = /^[A-Z][A-Z0-9]{9}$/;
var LETTER_YEAR_MAP = {
	W: 1983,
	X: 1984,
	Y: 1985,
	S: 1986,
	B: 1987,
	C: 1988,
	D: 1989,
	E: 1990,
	F: 1991,
	G: 1992,
	H: 1993,
	J: 1994,
	K: 1995,
	L: 1996,
	M: 1997,
	N: 1998,
	P: 1999,
	R: 2e3,
	Z: 2001
};
var LEGACY_UNSUPPORTED_EXPLANATION = "Pre-1983 Trane serial numbers use highly variable encoding that cannot be reliably decoded. Check the data plate for a printed manufacture date, or consult a licensed HVAC technician.";
//#endregion
//#region src/decoder/manufacturers/trane/index.ts
/**
* Trane manufacturer registration.
*
* Registers the Trane serial number decoder with the pipeline engine.
* Also covers American Standard (same parent company, same serial format).
*
* Source of truth: trane_implementation_contract.md
* Research audit:  trane_research_audit.md
*/
registerManufacturer({
	id: "trane",
	name: "Trane",
	formats: [
		{
			id: "trane-modern-10",
			name: "Trane Modern 10-Character (2010–Present)",
			description: "10-character alphanumeric format used by Trane from 2010 to the present. Characters 1-2 encode the year (e.g., \"11\" = 2011). Characters 3-4 encode the fiscal week of manufacture (01–53). The remaining 6 characters are a plant/sequence code.",
			yearRange: [2010, null],
			productTypes: [],
			sources: TRANE_MODERN_10_SOURCES,
			matches(input) {
				return input.normalized.length === 10 && MODERN_10_PATTERN.test(input.normalized);
			},
			decode(input) {
				const match = input.normalized.match(MODERN_10_PATTERN);
				if (!match) return null;
				const yearTwoDigit = parseInt(match[1], 10);
				const week = parseInt(match[2], 10);
				const fullYear = 2e3 + yearTwoDigit;
				return {
					year: fullYear,
					month: null,
					week,
					day: null,
					productType: "unknown",
					explanation: `Characters 1-2 indicate the year of manufacture (${match[1]} = ${fullYear}). Characters 3-4 indicate the fiscal week of manufacture (week ${week}).`,
					warnings: [],
					segments: [{
						startIndex: 0,
						endIndex: 2,
						field: "Year",
						value: match[1],
						description: `Year ${fullYear} of manufacture`
					}, {
						startIndex: 2,
						endIndex: 4,
						field: "Week",
						value: match[2],
						description: `Fiscal week ${week} of manufacture`
					}],
					metadata: { suffix: input.normalized.substring(4) }
				};
			}
		},
		{
			id: "trane-standard-9",
			name: "Trane Standard 9-Character (2002–2009)",
			description: "9-character alphanumeric format used by Trane from 2002 to 2009. Character 1 encodes the last digit of the year (e.g., \"8\" = 2008). Characters 2-3 encode the fiscal week of manufacture (01–53). Valid first characters: 2 through 9 (2002 through 2009). Delineated from the 2010+ format by strict length (9 vs 10 characters).",
			yearRange: [2002, 2009],
			productTypes: [],
			sources: TRANE_STANDARD_9_SOURCES,
			matches(input) {
				return input.normalized.length === 9 && STANDARD_9_PATTERN.test(input.normalized);
			},
			decode(input) {
				const match = input.normalized.match(STANDARD_9_PATTERN);
				if (!match) return null;
				const yearDigit = parseInt(match[1], 10);
				const week = parseInt(match[2], 10);
				const fullYear = 2e3 + yearDigit;
				return {
					year: fullYear,
					month: null,
					week,
					day: null,
					productType: "unknown",
					explanation: `Character 1 indicates the year of manufacture (${match[1]} = ${fullYear}). Characters 2-3 indicate the fiscal week of manufacture (week ${week}).`,
					warnings: [],
					segments: [{
						startIndex: 0,
						endIndex: 1,
						field: "Year",
						value: match[1],
						description: `Year ${fullYear} of manufacture`
					}, {
						startIndex: 1,
						endIndex: 3,
						field: "Week",
						value: match[2],
						description: `Fiscal week ${week} of manufacture`
					}],
					metadata: { suffix: input.normalized.substring(3) }
				};
			}
		},
		{
			id: "trane-letter-9",
			name: "Trane Letter-Prefix 9-Character (1983–2001)",
			description: "9-character format used by Trane from 1983 to 2001. Character 1 is a specific letter that maps to a manufacture year via a fixed dictionary. Characters 2-3 encode the fiscal week of manufacture (01–53). Letters I, O, Q, T, U, V are intentionally excluded from the mapping. Letter-year mapping: W=1983, X=1984, Y=1985, S=1986, B=1987, C=1988, D=1989, E=1990, F=1991, G=1992, H=1993, J=1994, K=1995, L=1996, M=1997, N=1998, P=1999, R=2000, Z=2001.",
			yearRange: [1983, 2001],
			productTypes: [],
			sources: TRANE_LETTER_9_SOURCES,
			matches(input) {
				return input.normalized.length === 9 && LETTER_9_PATTERN.test(input.normalized);
			},
			decode(input) {
				const match = input.normalized.match(LETTER_9_PATTERN);
				if (!match) return null;
				const letter = match[1];
				const week = parseInt(match[2], 10);
				const fullYear = LETTER_YEAR_MAP[letter];
				if (fullYear === void 0) return null;
				return {
					year: fullYear,
					month: null,
					week,
					day: null,
					productType: "unknown",
					explanation: `Character 1 is a year code (letter "${letter}" = ${fullYear}). Characters 2-3 indicate the fiscal week of manufacture (week ${week}).`,
					warnings: [],
					segments: [{
						startIndex: 0,
						endIndex: 1,
						field: "Year Code",
						value: letter,
						description: `Letter "${letter}" maps to year ${fullYear}`
					}, {
						startIndex: 1,
						endIndex: 3,
						field: "Week",
						value: match[2],
						description: `Fiscal week ${week} of manufacture`
					}],
					metadata: {
						yearLetter: letter,
						suffix: input.normalized.substring(3)
					}
				};
			}
		},
		{
			id: "trane-legacy-unsupported",
			name: "Trane Pre-1983 / Unsupported Legacy Formats",
			description: "Matches documented unsupported Trane serial patterns: (1) any 10-character serial starting with a letter (pre-1983 style conflict), (2) any string with 3–8 characters (likely pre-1983 or unknown era). These formats cannot be reliably decoded per trane_research_audit.md Part 6.",
			yearRange: [1970, 1982],
			productTypes: [],
			sources: TRANE_LEGACY_UNSUPPORTED_SOURCES,
			matches(input) {
				const s = input.normalized;
				if (s.length >= 3 && s.length <= 8) return true;
				if (s.length === 10 && LEGACY_10_LETTER_START_PATTERN.test(s)) return true;
				return false;
			},
			decode(_input) {
				return {
					error: "unsupported",
					explanation: LEGACY_UNSUPPORTED_EXPLANATION
				};
			}
		}
	]
});
//#endregion
//#region src/decoder/manufacturers/york/sources.ts
/**
* Building Intelligence Center — primary authority for both formats.
* Documents the 21-year cycle for the legacy format and the post-2004 transition.
*/
var BIC_SOURCE = {
	name: "Building Intelligence Center",
	url: "https://www.building-center.org/york-hvac-age/",
	dateReviewed: "2026-08-27",
	notes: "Industry reference database for HVAC age identification. Documents the 21-year cycle for the 1971-2004 format and the October 2004 transition to the modern format.",
	confidence: "verified"
};
/**
* HowToLookAtAHouse — secondary validation for the 21-year cycle and transition.
*/
var HOW_TO_LOOK_AT_A_HOUSE_SOURCE = {
	name: "HowToLookAtAHouse / HVAC Forums",
	url: "https://www.howtolookatahouse.com/",
	dateReviewed: "2026-08-27",
	notes: "Secondary validation for real-world examples and October 2004 transition confirmation.",
	confidence: "verified"
};
/** Sources for york-post-2004 */
var YORK_POST_2004_SOURCES = [BIC_SOURCE, HOW_TO_LOOK_AT_A_HOUSE_SOURCE];
/** Sources for york-1971-2004 */
var YORK_1971_2004_SOURCES = [BIC_SOURCE, HOW_TO_LOOK_AT_A_HOUSE_SOURCE];
//#endregion
//#region src/decoder/manufacturers/york/formats.ts
/**
* Format 1: york-post-2004
* Regex: ^[A-Z][0-9][A-HK-N][0-9]\d{6}$
* Structure: Letter, Digit, Letter (Month, excluding I,J,O,Q,U,Z), Digit, 6 Digits
*/
var POST_2004_PATTERN = /^[A-Z][0-9][A-HK-N][0-9]\d{6}$/;
/**
* Format 2: york-1971-2004
* Regex: ^[A-Z][A-HK-N][A-HJ-NPR-Y][A-Z]\d{6}$
* Structure: Letter, Letter (Month), Letter (Year, excluding I,O,Q,U,Z), Letter, 6 Digits
*/
var LEGACY_PATTERN = /^[A-Z][A-HK-N][A-HJ-NPR-Y][A-Z]\d{6}$/;
/**
* Month mapping for both formats.
* A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, K=9, L=10, M=11, N=12
* Note: J is omitted in the contract map. If J is encountered, it maps to null.
*/
var MONTH_MAP = {
	A: 1,
	B: 2,
	C: 3,
	D: 4,
	E: 5,
	F: 6,
	G: 7,
	H: 8,
	K: 9,
	L: 10,
	M: 11,
	N: 12
};
/**
* Year mapping for york-1971-2004 (Cycle 1: 1971-1991)
*/
var LEGACY_YEAR_MAP_CYCLE1 = {
	A: 1971,
	B: 1972,
	C: 1973,
	D: 1974,
	E: 1975,
	F: 1976,
	G: 1977,
	H: 1978,
	J: 1979,
	K: 1980,
	L: 1981,
	M: 1982,
	N: 1983,
	P: 1984,
	R: 1985,
	S: 1986,
	T: 1987,
	V: 1988,
	W: 1989,
	X: 1990,
	Y: 1991
};
/**
* Year mapping for york-1971-2004 (Cycle 2: 1992-2004)
* Only goes up to N (2004). P-Y are not included because the format transitioned.
*/
var LEGACY_YEAR_MAP_CYCLE2 = {
	A: 1992,
	B: 1993,
	C: 1994,
	D: 1995,
	E: 1996,
	F: 1997,
	G: 1998,
	H: 1999,
	J: 2e3,
	K: 2001,
	L: 2002,
	M: 2003,
	N: 2004
};
//#endregion
//#region src/decoder/manufacturers/york/index.ts
/**
* York manufacturer registration.
*
* Registers the York serial number decoder with the pipeline engine.
* Covers modern (post-2004) and legacy (1971-2004) formats.
*
* Source of truth: york_implementation_contract.md
* Research audit:  york_research_audit.md
*/
registerManufacturer({
	id: "york",
	name: "York",
	formats: [
		{
			id: "york-post-2004",
			name: "York Post-2004 Format",
			description: "10-character format used by modern York HVAC equipment (Oct 2004 - Present). The 2nd and 4th digits form the manufacture year. The 3rd character forms the month.",
			yearRange: [2004, null],
			productTypes: [],
			sources: YORK_POST_2004_SOURCES,
			matches(input) {
				return input.normalized.length === 10 && POST_2004_PATTERN.test(input.normalized);
			},
			decode(input) {
				const s = input.normalized;
				if (!s.match(POST_2004_PATTERN)) return null;
				const plantCode = s[0];
				const digit1 = parseInt(s[1], 10);
				const monthLetter = s[2];
				const digit2 = parseInt(s[3], 10);
				const sequence = s.substring(4);
				const year = 2e3 + digit1 * 10 + digit2;
				const month = MONTH_MAP[monthLetter] ?? null;
				let explanation = `The 2nd digit ("${digit1}") and 4th digit ("${digit2}") combine to indicate the year ${year}. `;
				if (month !== null) explanation += `The 3rd character ("${monthLetter}") indicates month ${month}.`;
				else explanation += `The 3rd character ("${monthLetter}") is not a standard month code.`;
				return {
					year,
					month,
					week: null,
					day: null,
					productType: "unknown",
					explanation,
					warnings: [],
					segments: [
						{
							startIndex: 1,
							endIndex: 2,
							field: "Year (tens)",
							value: String(digit1),
							description: `First year digit — tens place of year ${year}`
						},
						{
							startIndex: 2,
							endIndex: 3,
							field: "Month",
							value: monthLetter,
							description: month !== null ? `Month ${month} of manufacture (letter code)` : `Month code "${monthLetter}" (not a standard month)`
						},
						{
							startIndex: 3,
							endIndex: 4,
							field: "Year (units)",
							value: String(digit2),
							description: `Second year digit — units place of year ${year}`
						}
					],
					metadata: {
						plantCode,
						sequence
					}
				};
			}
		},
		{
			id: "york-1971-2004-cycle2",
			name: "York 1971-2004 Format (1990s/2000s)",
			description: "10-character legacy York format. The 2nd character encodes the month and the 3rd character encodes the year using a 21-year cycle. This represents the 1992-2004 cycle.",
			yearRange: [1992, 2004],
			productTypes: [],
			sources: YORK_1971_2004_SOURCES,
			matches(input) {
				return input.normalized.length === 10 && LEGACY_PATTERN.test(input.normalized);
			},
			decode(input) {
				const s = input.normalized;
				if (!LEGACY_PATTERN.test(s)) return null;
				const plantCode = s[0];
				const monthLetter = s[1];
				const yearLetter = s[2];
				const typeCode = s[3];
				const sequence = s.substring(4);
				const year = LEGACY_YEAR_MAP_CYCLE2[yearLetter];
				if (year === void 0) return null;
				const month = MONTH_MAP[monthLetter] ?? null;
				let explanation = `The 3rd character ("${yearLetter}") maps to year ${year} in the 1992-2004 cycle. `;
				if (month !== null) explanation += `The 2nd character ("${monthLetter}") indicates month ${month}.`;
				else explanation += `The 2nd character ("${monthLetter}") is not a standard month code.`;
				return {
					year,
					month,
					week: null,
					day: null,
					productType: "unknown",
					explanation,
					warnings: [],
					segments: [{
						startIndex: 1,
						endIndex: 2,
						field: "Month",
						value: monthLetter,
						description: month !== null ? `Month ${month} of manufacture (letter code)` : `Month code "${monthLetter}" (not a standard month)`
					}, {
						startIndex: 2,
						endIndex: 3,
						field: "Year Code",
						value: yearLetter,
						description: `Letter "${yearLetter}" maps to year ${year} (1992–2004 cycle)`
					}],
					metadata: {
						plantCode,
						typeCode,
						sequence
					}
				};
			}
		},
		{
			id: "york-1971-2004-cycle1",
			name: "York 1971-2004 Format (1970s/1980s)",
			description: "10-character legacy York format. The 2nd character encodes the month and the 3rd character encodes the year using a 21-year cycle. This represents the 1971-1991 cycle.",
			yearRange: [1971, 1991],
			productTypes: [],
			sources: YORK_1971_2004_SOURCES,
			matches(input) {
				return input.normalized.length === 10 && LEGACY_PATTERN.test(input.normalized);
			},
			decode(input) {
				const s = input.normalized;
				if (!LEGACY_PATTERN.test(s)) return null;
				const plantCode = s[0];
				const monthLetter = s[1];
				const yearLetter = s[2];
				const typeCode = s[3];
				const sequence = s.substring(4);
				const year = LEGACY_YEAR_MAP_CYCLE1[yearLetter];
				if (year === void 0) return null;
				const month = MONTH_MAP[monthLetter] ?? null;
				let explanation = `The 3rd character ("${yearLetter}") maps to year ${year} in the 1971-1991 cycle. `;
				if (month !== null) explanation += `The 2nd character ("${monthLetter}") indicates month ${month}.`;
				else explanation += `The 2nd character ("${monthLetter}") is not a standard month code.`;
				return {
					year,
					month,
					week: null,
					day: null,
					productType: "unknown",
					explanation,
					warnings: [],
					segments: [{
						startIndex: 1,
						endIndex: 2,
						field: "Month",
						value: monthLetter,
						description: month !== null ? `Month ${month} of manufacture (letter code)` : `Month code "${monthLetter}" (not a standard month)`
					}, {
						startIndex: 2,
						endIndex: 3,
						field: "Year Code",
						value: yearLetter,
						description: `Letter "${yearLetter}" maps to year ${year} (1971–1991 cycle)`
					}],
					metadata: {
						plantCode,
						typeCode,
						sequence
					}
				};
			}
		}
	]
});
//#endregion
//#region src/decoder/types/guards.ts
/**
* Type guard: result is a successful decode.
*
* When this returns true, TypeScript knows:
* - `result.manufactureDate` is non-null
* - `result.approximateAge` is non-null
* - `result.confidence` is non-null
* - `result.formatUsed` is non-null
*/
function isSuccessResult(result) {
	return result.status === "success";
}
/**
* Type guard: checks if a FormatRule.decode() return value is a FormatRuleError.
*
* Distinguishes between:
* - DecodedData (successful decode — has 'year' property)
* - FormatRuleError (intentional rejection — has 'error' property)
* - null (silent skip)
*/
function isFormatRuleError(result) {
	return result !== null && "error" in result;
}
//#endregion
//#region src/decoder/engine/normalize.ts
/**
* Minimum length for a serial number to be considered valid.
* Most HVAC serial numbers are 8+ characters. 3 is a generous minimum
* to catch obvious garbage while not rejecting unusual short formats.
*/
var MIN_SERIAL_LENGTH = 3;
/**
* Maximum length for a serial number.
* Prevents absurdly long input from being processed.
*/
var MAX_SERIAL_LENGTH = 50;
/**
* Validate raw user input before normalization.
*
* Returns an error message string if invalid, or null if valid.
* This is a fast pre-check — it does NOT validate against any format.
*/
function validateInput(raw) {
	if (typeof raw !== "string") return "Serial number must be a string.";
	const trimmed = raw.trim();
	if (trimmed.length === 0) return "Serial number is empty.";
	if (trimmed.length < MIN_SERIAL_LENGTH) return `Serial number is too short (minimum ${MIN_SERIAL_LENGTH} characters).`;
	if (trimmed.length > MAX_SERIAL_LENGTH) return `Serial number is too long (maximum ${MAX_SERIAL_LENGTH} characters).`;
	return null;
}
/**
* Normalize user input into multiple representations for pattern matching.
*
* Design principles:
* - NEVER silently remove characters that could change meaning
* - Provide multiple representations; let each FormatRule choose
* - Preserve the original input untouched for display/debugging
*
* @param raw - Raw user input (should already pass validateInput)
* @returns NormalizedInput with original, normalized, and variant forms
*/
function normalizeInput(raw) {
	const uppercased = raw.trim().toUpperCase();
	return {
		original: raw,
		normalized: uppercased,
		withoutHyphens: uppercased.replace(/-/g, ""),
		withoutSpaces: uppercased.replace(/\s+/g, "")
	};
}
//#endregion
//#region src/decoder/engine/validate-date.ts
/**
* Date validation utilities for decoded manufacture dates.
*
* These validate that decoded date components represent real,
* plausible dates. Used by the pipeline to reject impossible
* or nonsensical decode results before surfacing them.
*/
/** Earliest plausible manufacture year for HVAC/water heater equipment */
var MIN_YEAR = 1950;
/** Latest plausible manufacture year (generous buffer into the future) */
var MAX_YEAR_OFFSET = 2;
/**
* Validate decoded date components.
*
* Returns null if valid, or a human-readable error string if invalid.
* This prevents impossible dates (month 13, day 32, year 1800) from
* reaching the user.
*/
function validateDecodedDate(year, month, week, day, referenceDate = /* @__PURE__ */ new Date()) {
	if (!Number.isInteger(year)) return `Invalid year: "${year}" is not an integer.`;
	if (year < MIN_YEAR) return `Implausible year: ${year} is before ${MIN_YEAR}. HVAC equipment this old is not expected.`;
	if (year > referenceDate.getFullYear() + MAX_YEAR_OFFSET) return `Implausible year: ${year} is more than ${MAX_YEAR_OFFSET} years in the future.`;
	if (month !== null) {
		if (!Number.isInteger(month) || month < 1 || month > 12) return `Invalid month: ${month}. Must be 1–12.`;
	}
	if (week !== null) {
		if (!Number.isInteger(week) || week < 1 || week > 53) return `Invalid week: ${week}. Must be 1–53.`;
	}
	if (day !== null) {
		if (!Number.isInteger(day) || day < 1 || day > 31) return `Invalid day: ${day}. Must be 1–31.`;
		if (month !== null) {
			const testDate = new Date(year, month - 1, day);
			if (testDate.getFullYear() !== year || testDate.getMonth() !== month - 1 || testDate.getDate() !== day) return `Invalid date: ${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} does not exist.`;
		}
	}
	return null;
}
//#endregion
//#region src/utils/date.ts
/**
* Build a ManufactureDate object from decoded date components.
*
* Constructs the `display` string based on available precision:
* - Year + Month + Day → "March 15, 2019"
* - Year + Month       → "March 2019"
* - Year + Week        → "Week 31, 2019"
* - Year only          → "2019"
*/
function buildManufactureDate(year, month, week, day) {
	let display;
	if (month !== null && day !== null) display = new Date(year, month - 1, day).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
	else if (month !== null) display = new Date(year, month - 1, 1).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long"
	});
	else if (week !== null) display = `Week ${week}, ${year}`;
	else display = `${year}`;
	return {
		year,
		month,
		week,
		day,
		display
	};
}
/**
* Calculate the approximate age of equipment given a manufacture date
* and a reference date (typically "now").
*
* @param manufactureDate - The decoded manufacture date
* @param referenceDate   - The date to calculate age relative to (injectable for testing)
* @returns ApproximateAge with years, months, and display string
*/
function calculateAge(manufactureDate, referenceDate = /* @__PURE__ */ new Date()) {
	const mfgMonth = manufactureDate.month ?? 1;
	const mfgDay = manufactureDate.day ?? 1;
	const mfgDate = new Date(manufactureDate.year, mfgMonth - 1, mfgDay);
	let years = referenceDate.getFullYear() - mfgDate.getFullYear();
	let months = referenceDate.getMonth() - mfgDate.getMonth();
	if (referenceDate.getDate() < mfgDate.getDate()) months--;
	if (months < 0) {
		years--;
		months += 12;
	}
	if (years < 0) {
		years = 0;
		months = 0;
	}
	let display;
	if (years === 0 && months === 0) display = "Less than 1 month";
	else if (years === 0) display = months === 1 ? "1 month" : `${months} months`;
	else if (months === 0) display = years === 1 ? "1 year" : `${years} years`;
	else display = `${years === 1 ? "1 year" : `${years} years`}, ${months === 1 ? "1 month" : `${months} months`}`;
	return {
		years,
		months,
		display
	};
}
//#endregion
//#region src/decoder/engine/pipeline.ts
/**
* Decode a serial number for a given manufacturer.
*
* This is the main entry point for the decoder pipeline:
*   Validate → Normalize → Lookup → Match All → Decode → Disambiguate → Age → Result
*
* @param manufacturerId - Canonical manufacturer ID (e.g., "carrier")
* @param serialNumber   - Raw serial number as entered by the user
* @param options        - Optional configuration (reference date for testing)
* @returns A complete DecodeResult ready for UI consumption
*/
function decode(manufacturerId, serialNumber, options = {}) {
	const referenceDate = options.referenceDate ?? /* @__PURE__ */ new Date();
	const validationError = validateInput(serialNumber);
	if (validationError !== null) return buildErrorResult("invalid-input", manufacturerId, serialNumber, validationError);
	const input = normalizeInput(serialNumber);
	const manufacturer = getManufacturer(manufacturerId);
	if (!manufacturer) return buildErrorResult("unsupported", manufacturerId, serialNumber, `Manufacturer "${manufacturerId}" is not registered in the decoder.`);
	const { matches, errors } = collectMatches(manufacturer.formats, input, referenceDate);
	if (matches.length === 1 || matches.length > 1 && allMatchesAgree(matches)) return buildSuccessResult(matches, manufacturer, input, referenceDate);
	if (matches.length > 1) return buildAmbiguousResult(matches, manufacturer, input, referenceDate);
	if (errors.length > 0) {
		const firstError = errors[0];
		return {
			status: firstError.error.error === "insufficient-info" ? "insufficient-info" : "unsupported",
			manufacturer: {
				id: manufacturer.id,
				name: manufacturer.name
			},
			manufactureDate: null,
			approximateAge: null,
			confidence: null,
			formatUsed: null,
			productType: null,
			explanation: firstError.error.explanation,
			sources: [...firstError.format.sources],
			warnings: [],
			input: {
				original: input.original,
				normalized: input.normalized
			},
			candidates: [],
			segments: []
		};
	}
	return {
		status: "unsupported",
		manufacturer: {
			id: manufacturer.id,
			name: manufacturer.name
		},
		manufactureDate: null,
		approximateAge: null,
		confidence: null,
		formatUsed: null,
		productType: null,
		explanation: `No known serial number format for ${manufacturer.name} matched the input "${input.normalized}".`,
		sources: [],
		warnings: [],
		input: {
			original: input.original,
			normalized: input.normalized
		},
		candidates: [],
		segments: []
	};
}
/**
* Run all format rules against the input, collecting successful decodes
* and explicit error signals separately.
*
* Rejects decoded results with impossible dates (month 13, Feb 30, etc.)
*
* Priority semantics:
* - Valid DecodedData results are always collected as matches
* - FormatRuleError results are collected as explicit errors
* - null results are silently skipped
* - The caller decides priority: valid matches always win over explicit errors
*/
function collectMatches(formats, input, referenceDate) {
	const matches = [];
	const errors = [];
	for (const format of formats) {
		if (!format.matches(input)) continue;
		const result = format.decode(input);
		if (result === null) continue;
		if (isFormatRuleError(result)) {
			errors.push({
				format,
				error: result
			});
			continue;
		}
		if (validateDecodedDate(result.year, result.month, result.week, result.day, referenceDate) !== null) continue;
		matches.push({
			format,
			data: result
		});
	}
	return {
		matches,
		errors
	};
}
/**
* Check whether all matches decode to the same year and month.
*/
function allMatchesAgree(matches) {
	if (matches.length <= 1) return true;
	const first = matches[0];
	return matches.every((m) => m.data.year === first.data.year && m.data.month === first.data.month);
}
/**
* Pick the highest-confidence source from a set of matching format rules.
*/
function pickBestMatch(matches) {
	const priority = {
		high: 3,
		medium: 2,
		low: 1
	};
	return matches.reduce((best, current) => {
		const bestScore = bestSourceScore(best.format);
		return bestSourceScore(current.format) > bestScore ? current : best;
	});
	function bestSourceScore(format) {
		if (format.sources.length === 0) return 0;
		return Math.max(...format.sources.map((s) => priority[s.confidence] ?? 0));
	}
}
/**
* Determine confidence level for a successful decode.
*/
function determineConfidence(match, totalMatches) {
	if (totalMatches === 1) {
		const bestSource = match.format.sources[0];
		if (bestSource?.confidence === "verified") return "high";
		if (bestSource?.confidence === "probable") return "medium";
		return "low";
	}
	return "medium";
}
/**
* Build a success DecodeResult from matching format(s).
*/
function buildSuccessResult(matches, manufacturer, input, referenceDate) {
	const best = matches.length === 1 ? matches[0] : pickBestMatch(matches);
	const confidence = determineConfidence(best, matches.length);
	const manufactureDate = buildManufactureDate(best.data.year, best.data.month, best.data.week, best.data.day);
	const approximateAge = calculateAge(manufactureDate, referenceDate);
	const warnings = [...best.data.warnings];
	if (matches.length > 1) warnings.push(`${matches.length} format rules matched but all agreed on the same manufacture date.`);
	return {
		status: "success",
		manufacturer: {
			id: manufacturer.id,
			name: manufacturer.name
		},
		manufactureDate,
		approximateAge,
		confidence,
		formatUsed: {
			id: best.format.id,
			name: best.format.name,
			description: best.format.description,
			yearRange: best.format.yearRange
		},
		productType: best.data.productType,
		explanation: best.data.explanation,
		sources: [...best.format.sources],
		warnings,
		input: {
			original: input.original,
			normalized: input.normalized
		},
		candidates: [],
		segments: [...best.data.segments ?? []]
	};
}
/**
* Build an ambiguous DecodeResult when formats disagree.
*/
function buildAmbiguousResult(matches, manufacturer, input, referenceDate) {
	const candidates = matches.map((match) => {
		const mfgDate = buildManufactureDate(match.data.year, match.data.month, match.data.week, match.data.day);
		const age = calculateAge(mfgDate, referenceDate);
		const bestSource = match.format.sources[0];
		let confidence = "low";
		if (bestSource?.confidence === "verified") confidence = "medium";
		else if (bestSource?.confidence === "probable") confidence = "low";
		return {
			formatUsed: {
				id: match.format.id,
				name: match.format.name
			},
			manufactureDate: mfgDate,
			approximateAge: age,
			confidence,
			explanation: match.data.explanation,
			sources: [...match.format.sources],
			productType: match.data.productType,
			warnings: [...match.data.warnings],
			segments: [...match.data.segments ?? []]
		};
	});
	return {
		status: "ambiguous",
		manufacturer: {
			id: manufacturer.id,
			name: manufacturer.name
		},
		manufactureDate: null,
		approximateAge: null,
		confidence: null,
		formatUsed: null,
		productType: null,
		explanation: `This serial number matches ${matches.length} different format rules for ${manufacturer.name} with different manufacture dates. Additional context may be needed to determine the correct date.`,
		sources: [],
		warnings: ["Multiple decode interpretations exist. The manufacture date could not be determined unambiguously."],
		input: {
			original: input.original,
			normalized: input.normalized
		},
		candidates,
		segments: []
	};
}
/**
* Build an error DecodeResult for validation failures or unknown manufacturers.
*/
function buildErrorResult(status, manufacturerId, serialNumber, explanation) {
	return {
		status,
		manufacturer: {
			id: manufacturerId,
			name: manufacturerId
		},
		manufactureDate: null,
		approximateAge: null,
		confidence: null,
		formatUsed: null,
		productType: null,
		explanation,
		sources: [],
		warnings: [],
		input: {
			original: serialNumber,
			normalized: serialNumber.trim().toUpperCase()
		},
		candidates: [],
		segments: []
	};
}
//#endregion
//#region src/utils/analytics.ts
/**
* Tracks a custom event using Plausible Analytics.
* Silently fails if Plausible is blocked or not loaded.
* 
* IMPORTANT: NEVER send raw serial numbers in the props to avoid PII tracking.
*/
function trackEvent(eventName, props) {
	if (typeof window !== "undefined" && window.plausible) window.plausible(eventName, { props });
}
//#endregion
//#region src/components/ResultView.tsx
var SEGMENT_COLORS = [
	{
		bg: "#dbeafe",
		text: "#1e40af",
		border: "#3b82f6"
	},
	{
		bg: "#dcfce7",
		text: "#166534",
		border: "#22c55e"
	},
	{
		bg: "#fef3c7",
		text: "#92400e",
		border: "#f59e0b"
	},
	{
		bg: "#fce7f3",
		text: "#9d174d",
		border: "#ec4899"
	},
	{
		bg: "#ede9fe",
		text: "#5b21b6",
		border: "#8b5cf6"
	}
];
function SerialBreakdown({ normalized, segments }) {
	const indexMap = new Array(normalized.length).fill(-1);
	segments.forEach((seg, si) => {
		for (let i = seg.startIndex; i < seg.endIndex && i < normalized.length; i++) indexMap[i] = si;
	});
	const spans = [];
	let current = null;
	for (let i = 0; i < normalized.length; i++) {
		const si = indexMap[i];
		if (!current || current.segIndex !== si) {
			if (current) spans.push(current);
			current = {
				segIndex: si,
				chars: normalized[i]
			};
		} else current.chars += normalized[i];
	}
	if (current) spans.push(current);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		style: {
			display: "flex",
			flexWrap: "wrap",
			gap: "2px",
			marginTop: "10px",
			fontFamily: "monospace",
			fontSize: "20px",
			fontWeight: 700,
			letterSpacing: "0.1em",
			lineHeight: "1"
		},
		"aria-label": `Serial number breakdown: ${normalized}`,
		children: spans.map((span, idx) => {
			const color = span.segIndex >= 0 ? SEGMENT_COLORS[span.segIndex % SEGMENT_COLORS.length] : null;
			const segment = span.segIndex >= 0 ? segments[span.segIndex] : null;
			const ariaLabel = segment ? `Characters ${segment.startIndex + 1} to ${segment.endIndex}, ${segment.field} ${segment.value}: ${segment.description}` : `Characters ${span.chars} unassigned`;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				title: segment ? segment.description : void 0,
				role: "text",
				"aria-label": ariaLabel,
				style: {
					display: "inline-block",
					padding: "4px 6px",
					borderRadius: "5px",
					background: color ? color.bg : "transparent",
					color: color ? color.text : "var(--slate)",
					borderBottom: color ? `3px solid ${color.border}` : "3px solid transparent",
					transition: "opacity 0.15s"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: span.chars
				})
			}, idx);
		})
	});
}
function calcAge(year) {
	const diff = (/* @__PURE__ */ new Date()).getFullYear() - year;
	if (diff <= 0) return "manufactured this year";
	return diff === 1 ? "1 year old" : `${diff} years old`;
}
function getAgeCategoryText(years) {
	if (years < 5) return "0-5 years – Excellent condition.";
	if (years < 12) return "5-12 years – Mid-life. Ensure annual maintenance.";
	if (years < 15) return "12-15 years – Aging. Budget for replacement.";
	return "15+ years – Consider replacement.";
}
function buildCopyText(result) {
	const confidenceLabel = result.confidence === "high" ? "Verified Format" : result.confidence === "medium" ? "Estimated Format" : "Uncertain";
	const lines = [
		`${result.manufacturer.name} Equipment`,
		`Manufactured: ${result.manufactureDate.display}`,
		`Approximate age: ${result.approximateAge.display}`,
		`Confidence: ${confidenceLabel}`
	];
	if (result.formatUsed) lines.push(`Matched format: ${result.formatUsed.name}`);
	if (result.warnings.length > 0) lines.push(`Note: ${result.warnings[0]}`);
	lines.push("");
	lines.push("Important: Manufacture date is not the installation date.");
	lines.push("Verified via SerialAge");
	return lines.join("\n");
}
function getManufacturerLinks(brandId) {
	switch (brandId) {
		case "carrier": return [{
			label: "Check Carrier Warranty Status",
			url: "https://www.carrier.com/residential/en/us/homeowner-resources/warranty/"
		}];
		case "lennox": return [{
			label: "Check Lennox Warranty Status",
			url: "https://www.lennox.com/support/warranty"
		}];
		case "goodman": return [{
			label: "Check Goodman Warranty Status",
			url: "https://www.goodmanmfg.com/warranty-lookup"
		}];
		default: return [];
	}
}
function ResultView({ result, onDecodeAnother }) {
	const [copied, setCopied] = (0, react.useState)(false);
	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(buildCopyText(result));
			setCopied(true);
			trackEvent("copy_result");
			setTimeout(() => setCopied(false), 2500);
		} catch {}
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "result-card",
		role: "region",
		"aria-label": "Decode result",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "rh",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "rh-left",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "rh-eyebrow",
							children: "Manufacture Date"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "rh-date",
							children: result.manufactureDate.display
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "rh-age",
							children: ["Approximately ", calcAge(result.manufactureDate.year)]
						}),
						result.approximateAge && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "14px",
								marginTop: "8px",
								fontWeight: 500,
								color: "var(--slate)"
							},
							children: getAgeCategoryText(result.approximateAge.years)
						})
					]
				})
			}),
			(result.segments.length > 0 || result.explanation) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "re",
				style: {
					borderTop: "none",
					background: "var(--surface)"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "re-title",
					children: "How We Decoded This"
				}), result.segments.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SerialBreakdown, {
					normalized: result.input.normalized,
					segments: result.segments
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "6px",
						marginTop: "12px"
					},
					children: result.segments.map((seg, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "flex-start",
							gap: "10px",
							fontSize: "13px"
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								display: "inline-block",
								background: SEGMENT_COLORS[i % SEGMENT_COLORS.length].bg,
								color: SEGMENT_COLORS[i % SEGMENT_COLORS.length].text,
								borderRadius: "4px",
								padding: "1px 6px",
								fontWeight: 700,
								letterSpacing: "0.03em",
								fontFamily: "monospace",
								flexShrink: 0,
								minWidth: "28px",
								textAlign: "center"
							},
							children: seg.value
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							style: {
								color: "var(--slate)",
								lineHeight: "1.4"
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", {
									style: { color: "var(--text-primary)" },
									children: [seg.field, ":"]
								}),
								" ",
								seg.description
							]
						})]
					}, i))
				})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "re-text",
					style: {
						fontSize: "14px",
						marginTop: "4px",
						lineHeight: "1.4"
					},
					children: result.explanation
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "re",
				style: {
					borderTop: "none",
					background: "var(--surface)"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "re-title",
					children: "Keep in mind"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
					className: "re-body-list",
					style: { marginTop: "4px" },
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "The manufacture date is when the unit left the factory — not when it was installed." }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Warranty coverage may depend on installation date, registration, owner status, and manufacturer terms." }),
						result.manufacturer.name && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
							"Always verify against the physical data plate on the ",
							result.manufacturer.name,
							" unit."
						] })
					]
				})]
			}),
			getManufacturerLinks(result.manufacturer.id).length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "re",
				style: {
					borderTop: "none",
					background: "var(--surface)"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "re-title",
					children: "Official Resources"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
					className: "re-body-list",
					style: { marginTop: "4px" },
					children: [getManufacturerLinks(result.manufacturer.id).map((link, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
						style: { marginBottom: "6px" },
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							href: link.url,
							target: "_blank",
							rel: "noopener noreferrer",
							style: {
								color: "var(--brand-green-dark)",
								textDecoration: "underline"
							},
							children: link.label
						})
					}, i)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
						href: "https://www.energystar.gov/campaign/heating_cooling/replace",
						target: "_blank",
						rel: "noopener noreferrer",
						style: {
							color: "var(--brand-green-dark)",
							textDecoration: "underline"
						},
						children: "Repair vs. Replace Guide (Energy Star)"
					}) }, "repair-replace")]
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "result-actions",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: `btn-secondary ${copied ? "copied" : ""}`,
					onClick: handleCopy,
					"aria-live": "polite",
					children: copied ? "✓ Copied" : "Copy Details"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-primary-sm",
					onClick: onDecodeAnother,
					children: "Decode Another"
				})]
			})
		]
	});
}
//#endregion
//#region src/components/ErrorView.tsx
var STATE_CONFIG = {
	"invalid-input": {
		title: "Serial number not recognised",
		body: (_r, _i) => "This serial number is too short or contains invalid characters.",
		tip: "Check that the serial number is copied exactly from the data plate. Serial numbers are usually 8–13 characters long."
	},
	"unsupported": {
		title: "Could not decode this serial number",
		body: (r, _i) => r.explanation,
		tip: "Check that the serial number is copied exactly from the equipment label. You can also look for a printed manufacture date directly on the rating plate."
	},
	"ambiguous": {
		title: "Multiple possible results",
		body: (_r, _i) => "This serial number matches more than one historical format. We cannot determine a single accurate date.",
		tip: "Use the manufacturer/model information, printed manufacture date, rating-plate context, or other documented clues relevant to that format to help narrow down the correct decade."
	},
	"insufficient-info": {
		title: "More information needed",
		body: (r, _i) => r.explanation || "More information is needed to decode this serial number.",
		tip: "Check the model number or equipment type on the data plate, which may help identify the correct format."
	}
};
function ErrorView({ result, rawInput, onDecodeAnother }) {
	const config = STATE_CONFIG[result.status];
	const bodyText = config.body(result, rawInput);
	const matchedMfr = result.manufacturer.name;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "result-card result-error",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "rh rh-error",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "rh-left",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "rh-eyebrow rh-eyebrow-err",
					children: "Cannot Decode"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "rh-date",
					style: { fontSize: "22px" },
					children: "Unknown manufacture date"
				})]
			})
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "re-body",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "re-body-title",
					children: config.title
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: "re-body-text",
					style: { marginBottom: "8px" },
					children: [
						"The serial number ",
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
							style: {
								fontFamily: "var(--font-mono)",
								background: "var(--surface-soft)",
								padding: "2px 6px",
								borderRadius: "4px"
							},
							children: rawInput
						}),
						" ",
						result.status === "invalid-input" ? "is invalid." : `doesn't match the documented format we support for ${matchedMfr}.`
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "re-body-text",
					children: bodyText
				}),
				config.tip && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
					className: "re-body-list",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: config.tip }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "The unit might have been manufactured before the era this format covers." }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Your unit uses an alternate era format not yet included." })
					]
				}),
				result.status === "ambiguous" && result.candidates.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: { marginTop: "16px" },
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "re-title",
						style: { marginBottom: "8px" },
						children: "Possible dates"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: "re-body-list",
						style: { marginTop: 0 },
						children: result.candidates.map((c, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: c.manufactureDate.display }),
							" (",
							c.approximateAge.display,
							" old) via ",
							c.formatUsed.name
						] }, i))
					})]
				}),
				result.sources.length > 0 && result.status === "unsupported" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: { marginTop: "16px" },
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "re-title",
						style: { marginBottom: "8px" },
						children: "References"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: "re-body-list",
						style: { marginTop: 0 },
						children: result.sources.map((src, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: src.url ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							href: src.url,
							target: "_blank",
							rel: "noopener noreferrer",
							style: { color: "var(--brand-green-dark)" },
							children: src.name
						}) : src.name }, i))
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: "re-note",
					style: {
						marginTop: "24px",
						marginBottom: "16px"
					},
					children: [
						"We'd rather tell you we don't know than give you an incorrect date. (Status: ",
						result.status,
						")"
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					style: {
						width: "100%",
						padding: "12px",
						borderRadius: "var(--r-md)",
						border: "none",
						background: "var(--brand-green)",
						color: "var(--on-primary)",
						fontFamily: "var(--font)",
						fontWeight: 600,
						cursor: "pointer",
						fontSize: "14px"
					},
					onClick: onDecodeAnother,
					children: "Try a Different Serial"
				})
			]
		})]
	});
}
//#endregion
//#region src/components/RatingPlateHelp.tsx
function RatingPlateHelp({ manufacturerId, open, onClose }) {
	(0, react.useEffect)(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && open) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);
	if (!open) return null;
	let outdoorLocation = "Side or back of the cabinet, near the refrigerant line connections.";
	let indoorLocation = "Inside the front access panel door, often on the upper portion of the cabinet.";
	let packagedLocation = "Usually on the exterior panel near the compressor compartment or electrical connections.";
	if (manufacturerId) {
		const id = manufacturerId.toLowerCase();
		if ([
			"carrier",
			"bryant",
			"payne",
			"york"
		].includes(id)) {
			outdoorLocation = "Side or back of the cabinet above the refrigerant valves.";
			indoorLocation = "Inside the front access panel.";
		} else if ([
			"goodman",
			"amana",
			"daikin"
		].includes(id)) {
			outdoorLocation = "Side of the unit near where the refrigerant lines connect.";
			indoorLocation = "Inside wall of the blower compartment or front access panel.";
		} else if (id === "lennox") {
			outdoorLocation = "Right side of the unit near the refrigerant line connections.";
			indoorLocation = "Interior cabinet wall, accessible by removing the top front panel.";
		} else if (["trane", "american standard"].includes(id)) {
			outdoorLocation = "Side of the cabinet near the refrigerant connections.";
			indoorLocation = "Inside the front access panel.";
		} else if (["rheem", "ruud"].includes(id)) {
			outdoorLocation = "Side of the outdoor cabinet.";
			indoorLocation = "Inside the front access panel.";
		}
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "modal-overlay",
		onClick: onClose,
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "help-modal-title",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "modal-content",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					className: "modal-close",
					onClick: onClose,
					"aria-label": "Close modal",
					children: "✕"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					id: "help-modal-title",
					style: {
						marginTop: 0,
						marginBottom: "16px",
						fontSize: "18px"
					},
					children: "How to find your serial number"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
					src: "/data-plate-helper.jpg",
					alt: "HVAC Data Plate showing Serial Number",
					style: {
						width: "100%",
						borderRadius: "var(--r-md)",
						border: "1px solid var(--hairline-strong)",
						marginBottom: "16px"
					}
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						fontSize: "14px",
						lineHeight: "1.5",
						color: "var(--charcoal)"
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							style: { margin: "0 0 12px 0" },
							children: [
								"The serial number is printed on the ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "data plate" }),
								" (also called the rating plate) — usually a metal or foil sticker."
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: {
								margin: "0 0 16px 0",
								fontWeight: 600,
								color: "var(--accent-orange)"
							},
							children: "Use the SERIAL NUMBER, not the MODEL NUMBER."
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "12px"
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
									style: {
										display: "block",
										color: "var(--ink)"
									},
									children: "Outdoor AC & Heat Pump"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: outdoorLocation })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
									style: {
										display: "block",
										color: "var(--ink)"
									},
									children: "Indoor Furnace & Air Handler"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: indoorLocation })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
									style: {
										display: "block",
										color: "var(--ink)"
									},
									children: "Packaged Unit"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: packagedLocation })] })
							]
						})
					]
				})
			]
		})
	});
}
//#endregion
//#region src/components/DecoderWidget.tsx
var REGISTERED_MANUFACTURERS = getAllManufacturers();
function DecoderWidget({ defaultManufacturerId } = {}) {
	const [manufacturerId, setManufacturerId] = (0, react.useState)(() => {
		if (defaultManufacturerId && REGISTERED_MANUFACTURERS.some((m) => m.id === defaultManufacturerId)) return defaultManufacturerId;
		return defaultManufacturerId ? REGISTERED_MANUFACTURERS[0]?.id ?? "" : "";
	});
	const [serial, setSerial] = (0, react.useState)("");
	const [validationMsg, setValidationMsg] = (0, react.useState)(null);
	const [view, setView] = (0, react.useState)({ kind: "idle" });
	const [showHelp, setShowHelp] = (0, react.useState)(false);
	const inputRef = (0, react.useRef)(null);
	const selectRef = (0, react.useRef)(null);
	function handleSerialChange(e) {
		setSerial(e.target.value);
		if (validationMsg) setValidationMsg(null);
	}
	function handleSerialPaste(e) {
		e.preventDefault();
		const cleaned = e.clipboardData.getData("text").replace(/[\s\-_]/g, "");
		setSerial(cleaned);
		if (validationMsg) setValidationMsg(null);
	}
	function handleSubmit(e) {
		if (e) e.preventDefault();
		setValidationMsg(null);
		if (!manufacturerId && !serial.trim()) {
			setValidationMsg("Please select a manufacturer and enter a serial number.");
			return;
		}
		if (!manufacturerId) {
			setValidationMsg("Please select a manufacturer first.");
			selectRef.current?.focus();
			return;
		}
		const trimmed = serial.trim();
		if (trimmed.length === 0) {
			setValidationMsg("Please enter a serial number.");
			inputRef.current?.focus();
			return;
		}
		trackEvent("decoder_started", { brand: manufacturerId });
		setView({ kind: "scanning" });
		setTimeout(() => {
			const result = decode(manufacturerId, trimmed);
			if (result.status === "success") trackEvent("decode_success", { brand: manufacturerId });
			else trackEvent("decode_error", {
				brand: manufacturerId,
				error_type: result.status
			});
			setView({
				kind: "result",
				result,
				rawInput: trimmed
			});
			setTimeout(() => {
				const panel = document.getElementById("result-panel");
				if (panel) panel.scrollIntoView({
					behavior: "smooth",
					block: "nearest"
				});
			}, 40);
		}, 600);
	}
	function handleDecodeAnother() {
		setView({ kind: "idle" });
		setSerial("");
		setValidationMsg(null);
		requestAnimationFrame(() => inputRef.current?.focus());
	}
	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
	};
	const isResultView = view.kind === "result";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "decoder-wrap",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "decoder-card",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dc-header",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dc-label",
							children: "Serial Number Decoder"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit,
						className: "form-row",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "form-group",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									className: "form-label",
									htmlFor: "sel-mfr",
									children: "Manufacturer"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "select-wrap",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										ref: selectRef,
										className: "form-select",
										id: "sel-mfr",
										"aria-label": "Select manufacturer",
										value: manufacturerId,
										onChange: (e) => {
											setManufacturerId(e.target.value);
											if (validationMsg) setValidationMsg(null);
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "",
											disabled: true,
											children: "Select brand…"
										}), REGISTERED_MANUFACTURERS.map((m) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: m.id,
											children: m.name
										}, m.id))]
									})
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "form-group",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										className: "form-label",
										htmlFor: "inp-serial",
										children: "Serial Number"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: {
											position: "relative",
											borderRadius: "var(--r-xl)",
											overflow: "hidden"
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											ref: inputRef,
											className: "form-input",
											id: "inp-serial",
											type: "text",
											placeholder: "e.g. 2403T12345",
											autoCapitalize: "characters",
											autoComplete: "off",
											autoCorrect: "off",
											spellCheck: "false",
											"aria-label": "Enter serial number",
											value: serial,
											onChange: handleSerialChange,
											onPaste: handleSerialPaste,
											onKeyDown: handleKeyDown,
											disabled: view.kind === "scanning"
										}), view.kind === "scanning" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "laser-scanner" })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "btn-link",
										onClick: () => setShowHelp(true),
										style: {
											fontSize: "13px",
											marginTop: "8px",
											color: "var(--slate)",
											textDecoration: "underline"
										},
										children: "Where is my serial number?"
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								style: { display: "none" },
								"aria-hidden": "true",
								tabIndex: -1
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: `decode-btn ${view.kind === "scanning" ? "loading" : ""}`,
						onClick: () => handleSubmit(),
						"aria-label": "Decode serial number",
						disabled: view.kind === "scanning",
						children: view.kind === "scanning" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
							className: "spin",
							width: "18",
							height: "18",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2.5",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: "12",
								cy: "12",
								r: "10",
								strokeDasharray: "40",
								strokeDashoffset: "10"
							})
						}), "Decoding..."] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
							width: "18",
							height: "18",
							viewBox: "0 0 18 18",
							fill: "none",
							"aria-hidden": "true",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: "9",
								cy: "9",
								r: "7",
								stroke: "currentColor",
								strokeWidth: "1.8"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								d: "M6.5 9h5M9 6.5l2.5 2.5L9 11.5",
								stroke: "currentColor",
								strokeWidth: "1.8",
								strokeLinecap: "round",
								strokeLinejoin: "round"
							})]
						}), "Decode Serial Number"] })
					}),
					validationMsg && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							marginTop: "16px",
							color: "var(--accent-orange)",
							fontSize: "14px",
							textAlign: "center",
							fontWeight: 500
						},
						children: validationMsg
					})
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `result-panel ${isResultView ? "visible" : ""}`,
				id: "result-panel",
				role: "region",
				"aria-live": "polite",
				"aria-label": "Decode result",
				children: isResultView && (isSuccessResult(view.result) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ResultView, {
					result: view.result,
					onDecodeAnother: handleDecodeAnother
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorView, {
					result: view.result,
					rawInput: view.rawInput,
					onDecodeAnother: handleDecodeAnother
				}))
			}, isResultView ? `result-${view.rawInput}` : "static"),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RatingPlateHelp, {
				manufacturerId,
				open: showHelp,
				onClose: () => setShowHelp(false)
			})
		]
	});
}
//#endregion
//#region src/components/ThemeToggle.tsx
function ThemeToggle() {
	const [isDark, setIsDark] = (0, react.useState)(() => {
		if (typeof document !== "undefined") return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
		return false;
	});
	const toggleTheme = (e) => {
		const nextIsDark = !isDark;
		const x = e.clientX;
		const y = e.clientY;
		const performToggle = () => {
			if (nextIsDark) {
				document.documentElement.classList.add("dark");
				localStorage.setItem("theme", "dark");
			} else {
				document.documentElement.classList.remove("dark");
				localStorage.setItem("theme", "light");
			}
			setIsDark(nextIsDark);
		};
		if (!document.startViewTransition) {
			performToggle();
			return;
		}
		const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
		document.startViewTransition(performToggle).ready.then(() => {
			const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];
			document.documentElement.animate({ clipPath }, {
				duration: 500,
				easing: "ease-in-out",
				pseudoElement: "::view-transition-new(root)"
			});
		});
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
		onClick: toggleTheme,
		className: "theme-toggle-nav",
		"aria-label": "Toggle Dark Mode",
		title: "Toggle Dark Mode",
		style: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			background: "transparent",
			border: "none",
			color: "var(--slate)",
			cursor: "pointer",
			width: "40px",
			height: "40px",
			borderRadius: "50%",
			marginLeft: "8px",
			transition: "color 200ms ease, background-color 200ms ease, transform 300ms ease"
		},
		onMouseEnter: (e) => {
			e.currentTarget.style.color = "var(--ink)";
			e.currentTarget.style.backgroundColor = "var(--surface-soft)";
		},
		onMouseLeave: (e) => {
			e.currentTarget.style.color = "var(--slate)";
			e.currentTarget.style.backgroundColor = "transparent";
		},
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
			width: "20",
			height: "20",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			style: {
				transform: isDark ? "rotate(40deg)" : "rotate(90deg)",
				transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)"
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("mask", {
					id: "moon-mask",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "0",
						y: "0",
						width: "100%",
						height: "100%",
						fill: "white"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: isDark ? "12" : "25",
						cy: isDark ? "4" : "0",
						r: "6",
						fill: "black",
						style: { transition: "cx 500ms cubic-bezier(0.4, 0, 0.2, 1), cy 500ms cubic-bezier(0.4, 0, 0.2, 1)" }
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "12",
					r: isDark ? "9" : "5",
					mask: "url(#moon-mask)",
					fill: isDark ? "currentColor" : "none",
					style: { transition: "r 500ms cubic-bezier(0.4, 0, 0.2, 1), fill 500ms ease" }
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
					style: {
						transform: isDark ? "scale(0)" : "scale(1)",
						transformOrigin: "center",
						opacity: isDark ? 0 : 1,
						transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms ease"
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "12",
							y1: "1",
							x2: "12",
							y2: "3"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "12",
							y1: "21",
							x2: "12",
							y2: "23"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "4.22",
							y1: "4.22",
							x2: "5.64",
							y2: "5.64"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "18.36",
							y1: "18.36",
							x2: "19.78",
							y2: "19.78"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "1",
							y1: "12",
							x2: "3",
							y2: "12"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "21",
							y1: "12",
							x2: "23",
							y2: "12"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "4.22",
							y1: "19.78",
							x2: "5.64",
							y2: "18.36"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "18.36",
							y1: "5.64",
							x2: "19.78",
							y2: "4.22"
						})
					]
				})
			]
		})
	});
}
/**
* Cleaned site origin: lowercase, no trailing slash, always https in production.
* Used as the base for all canonical and OG URL generation.
*/
var SITE_ORIGIN = ({
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "ssr",
	"PROD": true,
	"SSR": true,
	"VITE_SITE_URL": "https://serialage.com"
}["VITE_SITE_URL"] ?? "https://serialage.com").toLowerCase().replace(/\/$/, "");
/**
* Build a canonical URL for the given path.
*
* Rules (per spec Part 7):
* - No trailing slash on paths (except root `/`)
* - Lowercase
* - No query parameters
* - No fragment
*
* @param path - An absolute path starting with `/` (e.g., '/carrier-serial-number-decoder')
*/
function canonicalUrl(path) {
	const cleanPath = path.split("?")[0].split("#")[0];
	return `${SITE_ORIGIN}${cleanPath === "/" ? "/" : cleanPath.replace(/\/$/, "")}`;
}
/** Site name for og:site_name */
var OG_SITE_NAME = "SerialAge";
/**
* Absolute URL to the OG image.
* Referenced from /public/og-image.jpg — must be placed there before launch.
* Listed as a required pre-launch asset in spec Part 22.
*/
var OG_IMAGE_URL = `${SITE_ORIGIN}/og-image.jpg`;
`${OG_SITE_NAME}`;
//#endregion
//#region src/components/BrandIcon.tsx
function BrandIcon({ size = 18, color = "currentColor", className }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		className,
		width: size,
		height: size,
		viewBox: "0 0 18 18",
		fill: "none",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M9 2v14M2 9h14M4.5 4.5l9 9M13.5 4.5l-9 9",
			stroke: color,
			strokeWidth: "1.9",
			strokeLinecap: "round"
		})
	});
}
//#endregion
//#region src/components/Footer.tsx
/**
* Footer component — SerialAge
*/
function Footer() {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("footer", {
		className: "footer",
		"aria-label": "Site footer",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "footer-inner",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "footer-brand-row",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "footer-logo",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "footer-logo-mark",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrandIcon, {})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "footer-logo-text",
							children: OG_SITE_NAME
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "footer-tagline",
						children: "Free HVAC serial number lookup for homeowners, technicians, and inspectors."
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "footer-cols",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
						"aria-label": "Resources navigation",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "footer-col-head",
							children: "Resources"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
							className: "footer-links",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								href: "/methodology",
								children: "Methodology"
							}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								href: "#faq",
								children: "FAQ"
							}) })]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
						"aria-label": "Legal navigation",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "footer-col-head",
							children: "Legal"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: "footer-links",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								href: "/privacy",
								children: "Privacy Policy"
							}) })
						})]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "footer-bottom",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "footer-copy",
						children: [
							"© ",
							(/* @__PURE__ */ new Date()).getFullYear(),
							" ",
							OG_SITE_NAME,
							". All rights reserved."
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "footer-disclaimer",
						children: "Results are based on documented manufacturer formats. Always verify against the equipment rating plate when precision matters."
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/seo/SEO.tsx
/**
* SEO — React Helmet wrapper for page-specific metadata.
*
* Injects into <head>:
*   - <title>
*   - <meta name="description">
*   - <link rel="canonical">
*   - Open Graph: og:title, og:description, og:url, og:type, og:site_name, og:image
*   - Twitter card meta tags
*
* Usage:
*   // Homepage
*   <SEO
*     title="HVAC Serial Number Decoder — Find Equipment Age | SerialAge"
*     description="Free, instant HVAC serial number decoder..."
*     path="/"
*   />
*
*   // Brand page
*   <SEO
*     title={config.pageTitle}
*     description={config.metaDescription}
*     path={`/${config.slug}`}
*   />
*
* Architecture rules:
* - No serial numbers in metadata.
* - No duplicate metadata strings — all values come from the call-site.
* - Canonical URLs are built via canonicalUrl() — never localhost, never trailing slash.
*
* Per phase_6_production_seo_specification.md Parts 7, 8, and 22.
*/
function SEO({ title, description, path, ogType = "website", structuredData }) {
	const canonical = canonicalUrl(path);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_helmet_async.Helmet, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: title }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			name: "description",
			content: description
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("link", {
			rel: "canonical",
			href: canonical
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			property: "og:title",
			content: title
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			property: "og:description",
			content: description
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			property: "og:url",
			content: canonical
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			property: "og:type",
			content: ogType
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			property: "og:site_name",
			content: OG_SITE_NAME
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			property: "og:image",
			content: OG_IMAGE_URL
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			property: "og:image:width",
			content: "1200"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			property: "og:image:height",
			content: "630"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			property: "og:image:alt",
			content: `${OG_SITE_NAME} — Decode HVAC Equipment Serial Numbers`
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			name: "twitter:card",
			content: "summary_large_image"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			name: "twitter:title",
			content: title
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			name: "twitter:description",
			content: description
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			name: "twitter:image",
			content: OG_IMAGE_URL
		}),
		structuredData?.map((schema, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: JSON.stringify(schema) }
		}, i))
	] });
}
//#endregion
//#region src/seo/schemas.ts
/**
* Structured data (JSON-LD) schema builders.
*
* Implements the schemas approved in phase_6_production_seo_specification.md Part 9:
*   1. WebApplication  — homepage + brand pages
*   2. WebSite         — homepage only
*   3. BreadcrumbList  — brand pages only
*   4. FAQPage         — brand pages only
*
* Rules:
* - NO fabricated reviews, ratings, prices, or availability.
* - NO schema types not in the specification.
* - All data sourced from brandPages.ts config or seo/config.ts — never from user input.
*
* Per phase_6_production_seo_specification.md Part 9.
*/
/**
* Establishes brand identity and canonical domain.
* Place on the homepage ONLY.
*/
function buildWebSiteSchema() {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: OG_SITE_NAME,
		url: SITE_ORIGIN,
		description: "Free HVAC serial number decoder. Verify the exact manufacture date and age of Carrier, Goodman, Lennox, and other HVAC equipment. We don't guess."
	};
}
/**
* Describes SerialAge as a utility application.
* Per spec Part 9 — "Use now: Yes."
*
* @param pageUrl - Canonical URL of the specific page
* @param name    - Application name for this page (e.g., "Carrier Serial Number Decoder")
* @param description - Application description for this page
*/
function buildWebApplicationSchema(pageUrl, name, description) {
	return {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name,
		url: pageUrl,
		description,
		applicationCategory: "UtilityApplication",
		operatingSystem: "Web",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD"
		}
	};
}
/**
* Communicates the flat hierarchy: Home > [Brand] Decoder.
* Per spec Part 9 — "Use now: Yes."
*
* @param brandName - Display name of the brand (e.g., "Carrier")
* @param brandSlug - URL path segment (e.g., "carrier-serial-number-decoder")
*/
function buildBreadcrumbSchema(brandName, brandSlug) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [{
			"@type": "ListItem",
			position: 1,
			name: OG_SITE_NAME,
			item: SITE_ORIGIN
		}, {
			"@type": "ListItem",
			position: 2,
			name: `${brandName} Serial Number Decoder`,
			item: canonicalUrl(`/${brandSlug}`)
		}]
	};
}
/**
* FAQ structured data — helps Google capture "How old is my [Brand] AC?" rich snippets.
* Per spec Part 9 — "Use now: Yes."
*
* @param faqs - The FAQ items from BrandPageConfig (sourced from phase_6_faq_strategy.md)
*/
function buildFaqPageSchema(faqs) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((item) => ({
			"@type": "Question",
			name: item.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: item.answer
			}
		}))
	};
}
//#endregion
//#region src/App.tsx
function App() {
	const [openFaq, setOpenFaq] = (0, react.useState)(null);
	const faqs = [
		{
			q: "What is an HVAC serial number?",
			a: "A serial number is a unique string of letters and numbers assigned by the manufacturer at the factory. Unlike a model number, which describes what the unit is, a serial number encodes when and where it was built — making it the key to finding the manufacture date."
		},
		{
			q: "Where can I find the serial number on my equipment?",
			a: "It is printed on the data plate (a metal or foil sticker). On outdoor air conditioners and heat pumps, look on the side or back of the unit near the refrigerant pipes. On indoor furnaces and air handlers, check inside the front panel door. The data plate also shows the model number — make sure you enter the serial number, not the model number."
		},
		{
			q: "Can I use my model number to find the age?",
			a: "No. Model numbers identify the product family, size, and efficiency rating of the unit, but they do not encode a manufacture date. You must use the serial number."
		},
		{
			q: "Is the manufacture date the same as the installation date?",
			a: "No. The manufacture date is when the unit was built at the factory. Equipment may sit in a warehouse or distributor inventory for weeks or months before being installed. Warranty coverage may depend on the installation date, registration, and manufacturer terms — check the manufacturer's documentation for details."
		},
		{
			q: "Does the serial number contain my personal information?",
			a: "No. Serial numbers only contain factory data: manufacture date, plant code, and a production sequence number. They do not contain homeowner names, addresses, or any personal registration data."
		}
	];
	const toggleFaq = (index) => {
		setOpenFaq(openFaq === index ? null : index);
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SEO, {
			title: `HVAC Serial Number Decoder — Find Equipment Age | ${OG_SITE_NAME}`,
			description: "Free, instant HVAC serial number decoder. Find out exactly when your air conditioner or furnace was manufactured. We decode Carrier, Trane, Lennox, Goodman, and more.",
			path: "/",
			structuredData: [
				buildWebSiteSchema(),
				buildWebApplicationSchema(canonicalUrl("/"), `HVAC Serial Number Decoder | ${OG_SITE_NAME}`, "Free, instant HVAC serial number decoder. Find out exactly when your air conditioner or furnace was manufactured."),
				buildFaqPageSchema(faqs.map((f) => ({
					question: f.q,
					answer: f.a
				})))
			]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
			className: "nav",
			"aria-label": "Main navigation",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "nav-inner",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
					className: "nav-logo",
					href: "#",
					"aria-label": "SerialAge home",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "nav-logo-mark",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrandIcon, { color: "#ffffff" })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "nav-logo-text",
						children: ["Serial", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Age" })]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "nav-right",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							className: "nav-link",
							href: "#how-it-works",
							children: "How It Works"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							className: "nav-link",
							href: "#faq",
							children: "FAQ"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							className: "nav-cta",
							href: "#decoder-section",
							children: "Decode Now"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThemeToggle, {})
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
			id: "main-content",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "hero",
					id: "decoder-section",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "hero-content",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h1", {
								className: "hero-h1",
								children: [
									"Decode your",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("br", {}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: "HVAC serial number" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("br", {}),
									"in seconds"
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "hero-sub",
								children: "Find out when your unit was manufactured, how old it is, and exactly how we decoded it — every time."
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DecoderWidget, {})
						]
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "section section-alt section-border-top",
					id: "how-it-works",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "section-inner",
						style: { maxWidth: "1024px" },
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "s-eye",
								children: "How It Works"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "s-head",
								children: "No black boxes, ever."
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "s-sub",
								children: "We show every step of the decoding so you can verify the result — not just trust it."
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "how-grid",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "how-step-num",
											children: "1"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "how-title",
											children: "Select your manufacturer"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: "how-desc",
											children: "Each brand structures its serial numbers differently. Choosing the right manufacturer ensures the correct decoding logic is applied."
										})
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "how-step-num",
											children: "2"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "how-title",
											children: "Enter the serial number"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: "how-desc",
											children: "Find the serial number on your unit's nameplate — typically on the exterior cabinet or inside the service panel door. Type it exactly as printed."
										})
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "how-step-num",
											children: "3"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "how-title",
											children: "Read the full breakdown"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: "how-desc",
											children: "You'll see the manufacture date, unit age, a character-by-character decode, confidence level, and the source documentation behind our logic."
										})
									] })
								]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "section section-border-top",
					id: "faq",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "section-inner",
						style: { maxWidth: "840px" },
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "s-eye",
								children: "FAQ"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "s-head",
								children: "Common questions"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "s-sub",
								children: "Straightforward answers about how the decoder works and what the results mean."
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "faq-list",
								role: "list",
								children: [
									{
										q: "What is an HVAC serial number?",
										a: "A serial number is a unique string of letters and numbers assigned by the manufacturer at the factory. Unlike a model number, which describes what the unit is, a serial number encodes when and where it was built — making it the key to finding the manufacture date."
									},
									{
										q: "Where can I find the serial number on my equipment?",
										a: "It is printed on the data plate (a metal or foil sticker). On outdoor air conditioners and heat pumps, look on the side or back of the unit near the refrigerant pipes. On indoor furnaces and air handlers, check inside the front panel door. The data plate also shows the model number — make sure you enter the serial number, not the model number."
									},
									{
										q: "Can I use my model number to find the age?",
										a: "No. Model numbers identify the product family, size, and efficiency rating of the unit, but they do not encode a manufacture date. You must use the serial number."
									},
									{
										q: "Is the manufacture date the same as the installation date?",
										a: "No. The manufacture date is when the unit was built at the factory. Equipment may sit in a warehouse or distributor inventory for weeks or months before being installed. Warranty coverage may depend on the installation date, registration, and manufacturer terms — check the manufacturer's documentation for details."
									},
									{
										q: "Does the serial number contain my personal information?",
										a: "No. Serial numbers only contain factory data: manufacture date, plant code, and a production sequence number. They do not contain homeowner names, addresses, or any personal registration data."
									}
								].map((faq, idx) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "faq-item",
									role: "listitem",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										className: `faq-q ${openFaq === idx ? "open" : ""}`,
										onClick: () => toggleFaq(idx),
										"aria-expanded": openFaq === idx,
										"aria-controls": `faq-ans-${idx}`,
										children: [faq.q, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
											className: "faq-chevron",
											width: "18",
											height: "18",
											viewBox: "0 0 18 18",
											fill: "none",
											"aria-hidden": "true",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
												d: "M4.5 6.75L9 11.25l4.5-4.5",
												stroke: "currentColor",
												strokeWidth: "1.7",
												strokeLinecap: "round",
												strokeLinejoin: "round"
											})
										})]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										id: `faq-ans-${idx}`,
										className: `faq-a ${openFaq === idx ? "open" : ""}`,
										role: "region",
										children: faq.a
									})]
								}, idx))
							})
						]
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "cta-band",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "cta-inner",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "cta-h2",
								children: "Ready to decode?"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "cta-sub",
								children: "Free, instant, and fully transparent. No account, no signup — just your serial number."
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
								className: "btn-primary",
								href: "#decoder-section",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
									width: "16",
									height: "16",
									viewBox: "0 0 16 16",
									fill: "none",
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
										d: "M5.5 8h5M8 5.5L10.5 8 8 10.5",
										stroke: "currentColor",
										strokeWidth: "1.7",
										strokeLinecap: "round",
										strokeLinejoin: "round"
									})
								}), "Decode a Serial Number"]
							})
						]
					})
				})
			]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Footer, {})
	] });
}
var ALL_BRAND_PAGES = [
	{
		manufacturerId: "carrier",
		slug: "carrier-serial-number-decoder",
		displayName: "Carrier",
		relatedBrands: [{
			"name": "Bryant",
			"slug": "bryant-serial-number-decoder"
		}, {
			"name": "Payne",
			"slug": "payne-serial-number-decoder"
		}],
		category: "HVAC",
		pageTitle: "Carrier Serial Number Decoder — Find Equipment Age | SerialAge",
		metaDescription: "Free decoder for Carrier HVAC serial numbers. Find out the age and manufacture date of your Carrier air conditioner, furnace, or heat pump.",
		headline: "Carrier Serial Number Decoder",
		shortDescription: "Determine the age and manufacture date of your Carrier HVAC equipment. This decoder supports standard 10-character formats used from approximately 1985 to the present, as well as the older 9-digit formats from the 1980s. Results are derived from verified manufacturer documentation — we never guess.",
		ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.",
		limitations: [
			"Serial numbers manufactured before approximately 1985 (pre-Style 1) cannot be reliably decoded due to inconsistent historical formatting.",
			"Week-based dates (WWYY format) are precise to within 7 days, not a specific calendar date.",
			"Does not support Carrier water heaters.",
			"If a printed \"MFR DATE\" appears on the data plate, always trust it over the decoded result."
		],
		sources: [{
			type: "internal",
			title: "SerialAge Manufacturer Decoding Audit - Carrier",
			description: "Internal research record."
		}, {
			type: "external",
			title: "Building Intelligence Center - Carrier",
			publisher: "Building Intelligence Center",
			description: "Reference for historical formatting trends."
		}],
		supportedFormats: [{
			"label": "Modern Standard (10-Character)",
			"example": "4206A12345",
			"exampleType": "Synthetic",
			"description": "Used from ~1985 to present. The first two digits encode the week (01–52), and the next two digits encode the year."
		}, {
			"label": "Legacy (9-Digit)",
			"example": "851212345",
			"exampleType": "Synthetic",
			"description": "Used during the 1980s. The first two digits encode the year (80-89), and the next two digits encode the month."
		}],
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
		]
	},
	{
		manufacturerId: "bryant",
		slug: "bryant-serial-number-decoder",
		displayName: "Bryant",
		relatedBrands: [{
			"name": "Carrier",
			"slug": "carrier-serial-number-decoder"
		}, {
			"name": "Payne",
			"slug": "payne-serial-number-decoder"
		}],
		category: "HVAC",
		pageTitle: "Bryant Serial Number Decoder — Find Equipment Age | SerialAge",
		metaDescription: "Free decoder for Bryant HVAC serial numbers. Find out the age and manufacture date of your Bryant air conditioner, furnace, or heat pump.",
		headline: "Bryant Serial Number Decoder",
		shortDescription: "Determine the age and manufacture date of your Bryant HVAC equipment. Bryant operates under Carrier and uses the exact same serial number formats, supporting the 10-character WWYY format (~1985-present) and legacy YYMM formats.",
		ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.",
		limitations: [
			"Serial numbers manufactured before approximately 1985 (pre-Style 1) cannot be reliably decoded due to inconsistent historical formatting.",
			"Week-based dates (WWYY format) are precise to within 7 days, not a specific calendar date.",
			"Does not support Bryant water heaters.",
			"If a printed \"MFR DATE\" appears on the data plate, always trust it over the decoded result."
		],
		sources: [{
			type: "internal",
			title: "SerialAge Manufacturer Decoding Audit - Carrier/Bryant",
			description: "Internal research record."
		}],
		supportedFormats: [{
			"label": "Modern Standard (10-Character)",
			"example": "4206A12345",
			"exampleType": "Synthetic",
			"description": "Used from ~1985 to present. The first two digits encode the week (01–52), and the next two digits encode the year."
		}, {
			"label": "Legacy (9-Digit)",
			"example": "851212345",
			"exampleType": "Synthetic",
			"description": "Used during the 1980s. The first two digits encode the year (80-89), and the next two digits encode the month."
		}],
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
		]
	},
	{
		manufacturerId: "payne",
		slug: "payne-serial-number-decoder",
		displayName: "Payne",
		relatedBrands: [{
			"name": "Carrier",
			"slug": "carrier-serial-number-decoder"
		}, {
			"name": "Bryant",
			"slug": "bryant-serial-number-decoder"
		}],
		category: "HVAC",
		pageTitle: "Payne Serial Number Decoder — Find Equipment Age | SerialAge",
		metaDescription: "Free decoder for Payne HVAC serial numbers. Find out the age and manufacture date of your Payne air conditioner, furnace, or heat pump.",
		headline: "Payne Serial Number Decoder",
		shortDescription: "Determine the age and manufacture date of your Payne HVAC equipment. Payne operates under Carrier and uses the exact same serial number formats, primarily the 10-character WWYY format used since the late 1980s.",
		ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.",
		limitations: [
			"Serial numbers manufactured before approximately 1985 (pre-Style 1) cannot be reliably decoded due to inconsistent historical formatting.",
			"Week-based dates (WWYY format) are precise to within 7 days, not a specific calendar date.",
			"Does not support Payne water heaters.",
			"If a printed \"MFR DATE\" appears on the data plate, always trust it over the decoded result."
		],
		sources: [{
			type: "internal",
			title: "SerialAge Manufacturer Decoding Audit - Carrier/Payne",
			description: "Internal research record."
		}],
		supportedFormats: [{
			"label": "Modern Standard (10-Character)",
			"example": "4206A12345",
			"exampleType": "Synthetic",
			"description": "Used from ~1985 to present. The first two digits encode the week (01–52), and the next two digits encode the year."
		}, {
			"label": "Legacy (9-Digit)",
			"example": "851212345",
			"exampleType": "Synthetic",
			"description": "Used during the 1980s. The first two digits encode the year (80-89), and the next two digits encode the month."
		}],
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
		]
	},
	{
		manufacturerId: "goodman",
		slug: "goodman-serial-number-decoder",
		displayName: "Goodman",
		relatedBrands: [{
			"name": "Amana",
			"slug": "amana-serial-number-decoder"
		}],
		category: "HVAC",
		pageTitle: "Goodman Serial Number Decoder — Find Equipment Age | SerialAge",
		metaDescription: "Free decoder for Goodman HVAC serial numbers. Find out the age and manufacture date of your Goodman air conditioner, furnace, or heat pump.",
		headline: "Goodman Serial Number Decoder",
		shortDescription: "Determine the age and manufacture date of your Goodman HVAC equipment. Goodman has used a highly consistent 10-digit serial format since 1982, making it one of the most reliable manufacturers to decode.",
		ratingPlateLocation: "On Goodman outdoor units (air conditioners and heat pumps), the data plate is typically located on the side of the unit, near where the refrigerant lines connect. On indoor furnaces, it is usually pasted on the inside wall of the blower compartment.",
		limitations: [
			"Goodman serial numbers must be exactly 10 digits. 9-digit entries will not decode.",
			"Legacy Amana PTAC (Packaged Terminal Air Conditioner) units with letter prefixes or suffixes are not supported by this decoder.",
			"Serial numbers indicating manufacture before 1982 are outside the documented Goodman format era and will not decode.",
			"Does not support Goodman water heaters."
		],
		sources: [{
			type: "internal",
			title: "SerialAge Manufacturer Decoding Audit - Goodman",
			description: "Internal research record."
		}, {
			type: "external",
			title: "Building Intelligence Center - Goodman",
			publisher: "Building Intelligence Center",
			description: "Reference for historical formatting trends."
		}],
		supportedFormats: [{
			"label": "Standard (10-Digit)",
			"example": "2104123456",
			"exampleType": "Synthetic",
			"description": "Used from 1982 to present. The first two digits are the year of manufacture, and the next two digits are the month."
		}],
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
				"answer": "For most standard residential equipment — especially after Daikin acquired Goodman, and Goodman acquired the Amana HVAC brand — the serial number formats are identical: 10 digits starting with YYMM."
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
		]
	},
	{
		manufacturerId: "amana",
		slug: "amana-serial-number-decoder",
		displayName: "Amana",
		relatedBrands: [{
			"name": "Goodman",
			"slug": "goodman-serial-number-decoder"
		}],
		category: "HVAC",
		pageTitle: "Amana Serial Number Decoder — Find Equipment Age | SerialAge",
		metaDescription: "Free decoder for Amana HVAC serial numbers. Find out the age and manufacture date of your Amana air conditioner, furnace, or heat pump.",
		headline: "Amana Serial Number Decoder",
		shortDescription: "Determine the age and manufacture date of your Amana HVAC equipment. Modern Amana equipment uses the same highly consistent 10-digit format as its parent company, Goodman.",
		ratingPlateLocation: "On Amana outdoor units (air conditioners and heat pumps), the data plate is typically located on the side of the unit, near where the refrigerant lines connect. On indoor furnaces, it is usually pasted on the inside wall of the blower compartment.",
		limitations: [
			"Requires exactly 10 digits.",
			"Legacy Amana PTAC (Packaged Terminal Air Conditioner) units with letter prefixes or suffixes are not supported by this decoder.",
			"Does not support older Amana formats with dashes or spaces.",
			"Does not support Amana water heaters."
		],
		sources: [{
			type: "internal",
			title: "SerialAge Manufacturer Decoding Audit - Goodman/Amana",
			description: "Internal research record."
		}],
		supportedFormats: [{
			"label": "Standard (10-Digit)",
			"example": "2104123456",
			"exampleType": "Synthetic",
			"description": "Used widely on modern equipment. The first two digits are the year, and the next two digits are the month."
		}],
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
		]
	},
	{
		manufacturerId: "lennox",
		slug: "lennox-serial-number-decoder",
		displayName: "Lennox",
		relatedBrands: [],
		category: "HVAC",
		pageTitle: "Lennox Serial Number Decoder — Find Equipment Age | SerialAge",
		metaDescription: "Free decoder for Lennox HVAC serial numbers. Find out the age and manufacture date of your Lennox air conditioner, furnace, or heat pump.",
		headline: "Lennox Serial Number Decoder",
		shortDescription: "Determine the age and manufacture date of your Lennox HVAC equipment. Lennox has maintained a continuous, unbroken 10-character serial format since 1974, utilizing specific month-letter codes.",
		ratingPlateLocation: "On Lennox outdoor units, the data plate is usually on the right side of the unit near the refrigerant line connections. For indoor furnaces, it is typically on the interior cabinet wall, accessible by removing the top front panel.",
		limitations: [
			"The Lennox modern format began in 1974. Pre-1974 serial numbers are not supported.",
			"The first two characters of a Lennox serial (the plant/factory code) are not decoded — they do not affect the manufacture date.",
			"Month codes skip the letter \"I\" to avoid confusion with the number 1. Serials with \"I\" in the month position will not decode.",
			"Does not support Lennox water heaters."
		],
		sources: [{
			type: "internal",
			title: "SerialAge Manufacturer Decoding Audit - Lennox",
			description: "Internal research record."
		}, {
			type: "external",
			title: "Building Intelligence Center - Lennox",
			publisher: "Building Intelligence Center",
			description: "Reference for historical formatting trends."
		}],
		supportedFormats: [{
			"label": "Standard (10-Character)",
			"example": "5806K12345",
			"exampleType": "Synthetic",
			"description": "Used from 1974 to present. Positions 3 and 4 encode the year, and position 5 encodes the month (A-M, skipping I)."
		}],
		faqs: [
			{
				"question": "Where do I find the Lennox serial number?",
				"answer": "On Lennox outdoor units, the data plate is usually on the right side of the unit near the refrigerant line connections. For indoor furnaces, it is typically located on the interior cabinet wall, accessible by removing the top front panel."
			},
			{
				"question": "How do I decode a Lennox serial number?",
				"answer": "Modern Lennox serial numbers (1974–present) are 10 characters long. The year is encoded at positions 3 and 4, and position 5 is a single letter indicating the month. For example, in \"5806K12345\", \"06\" means 2006, and \"K\" represents October."
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
				"answer": "No. The Lennox format began in 1974. A serial number with \"99\" at positions 3–4 means 1999, while \"05\" means 2005. Because the format is continuous and the year is stored as a 2-digit value with a documented century threshold, there is no overlap or ambiguity between decades."
			},
			{
				"question": "Does this decoder support Lennox water heaters?",
				"answer": "No. This tool is explicitly scoped to residential HVAC equipment and does not cover water heaters."
			}
		]
	},
	{
		manufacturerId: "trane",
		slug: "trane-serial-number-decoder",
		displayName: "Trane",
		relatedBrands: [],
		category: "HVAC",
		pageTitle: "Trane Serial Number Decoder — Find Equipment Age | SerialAge",
		metaDescription: "Free decoder for Trane HVAC serial numbers. Find out the age and manufacture date of your Trane air conditioner, furnace, or heat pump.",
		headline: "Trane Serial Number Decoder",
		shortDescription: "Determine the age and manufacture date of your Trane HVAC equipment. Trane's serial number formats have evolved significantly over time, transitioning from a 9-character letter-prefix format (1983-2001) to a 10-character numeric format (2010-present).",
		ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, look inside the front access panel.",
		limitations: [
			"Pre-1983 Trane serial numbers are highly inconsistent and are intentionally not supported by this decoder.",
			"Trane serial numbers from 1983 to 2001 use a letter-prefix format. Letters \"I\", \"O\", \"Q\", \"T\", \"U\", \"V\" are skipped.",
			"Dates are precise to the fiscal week of manufacture, not a specific calendar day.",
			"Does not support Trane water heaters."
		],
		sources: [{
			type: "internal",
			title: "Trane Implementation Contract",
			description: "Implementation audit."
		}, {
			type: "internal",
			title: "SerialAge Manufacturer Decoding Audit - Trane",
			description: "Internal research record."
		}],
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
		]
	},
	{
		manufacturerId: "rheem",
		slug: "rheem-serial-number-decoder",
		displayName: "Rheem",
		relatedBrands: [{
			"name": "Ruud",
			"slug": "ruud-serial-number-decoder"
		}],
		category: "HVAC",
		pageTitle: "Rheem Serial Number Decoder — Find Equipment Age | SerialAge",
		metaDescription: "Free decoder for Rheem HVAC serial numbers. Find out the age and manufacture date of your Rheem air conditioner, furnace, or heat pump.",
		headline: "Rheem Serial Number Decoder",
		shortDescription: "Determine the age and manufacture date of your Rheem HVAC equipment. Rheem's primary formats include a standard 10-character layout and older formats with an embedded plant code letter.",
		ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet. For indoor furnaces, look inside the front access panel.",
		limitations: [
			"Rheem water heater serial numbers (typically 10 all-numeric digits) are not supported by this HVAC decoder.",
			"Serial numbers less than 10 characters long are not supported.",
			"The older embedded plant-code format date extraction is based on plant letter position. Always verify against the unit data plate if unsure."
		],
		sources: [{
			type: "internal",
			title: "Rheem/Ruud Implementation Contract",
			description: "Implementation audit."
		}, {
			type: "internal",
			title: "SerialAge Manufacturer Decoding Audit - Rheem/Ruud",
			description: "Internal research record."
		}],
		supportedFormats: [{
			"label": "Modern Standard (10-Character)",
			"example": "W421724596",
			"exampleType": "Synthetic",
			"description": "The first character is the plant code, followed by a 2-digit week, and a 2-digit year (e.g. 42nd week of 2017)."
		}, {
			"label": "Embedded Plant Code",
			"example": "7351 M2806 16735",
			"exampleType": "Documented",
			"description": "Older format where the plant letter (F, M, G, N, or W) appears in the middle of the string, followed by a 2-digit week and 2-digit year."
		}],
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
				"answer": "Older Rheem serial numbers (often 10–17 characters long) embed the plant code letter (F, M, G, N, or W) in the middle of the string. The two digits immediately following the plant letter are the week, and the next two are the year."
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
		]
	},
	{
		manufacturerId: "ruud",
		slug: "ruud-serial-number-decoder",
		displayName: "Ruud",
		relatedBrands: [{
			"name": "Rheem",
			"slug": "rheem-serial-number-decoder"
		}],
		category: "HVAC",
		pageTitle: "Ruud Serial Number Decoder — Find Equipment Age | SerialAge",
		metaDescription: "Free decoder for Ruud HVAC serial numbers. Find out the age and manufacture date of your Ruud air conditioner, furnace, or heat pump.",
		headline: "Ruud Serial Number Decoder",
		shortDescription: "Determine the age and manufacture date of your Ruud HVAC equipment. Ruud operates under Rheem and uses the exact same serial number formats, including the standard 10-character layout and embedded plant code formats.",
		ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet. For indoor furnaces, look inside the front access panel.",
		limitations: [
			"Ruud water heater serial numbers (typically 10 all-numeric digits) are not supported by this HVAC decoder.",
			"Serial numbers less than 10 characters long are not supported.",
			"The older embedded plant-code format date extraction is based on plant letter position. Always verify against the unit data plate if unsure."
		],
		sources: [{
			type: "internal",
			title: "Rheem/Ruud Implementation Contract",
			description: "Implementation audit."
		}, {
			type: "internal",
			title: "SerialAge Manufacturer Decoding Audit - Rheem/Ruud",
			description: "Internal research record."
		}],
		supportedFormats: [{
			"label": "Modern Standard (10-Character)",
			"example": "W421724596",
			"exampleType": "Synthetic",
			"description": "The first character is the plant code, followed by a 2-digit week, and a 2-digit year (e.g. 42nd week of 2017)."
		}, {
			"label": "Embedded Plant Code",
			"example": "7351 M2806 16735",
			"exampleType": "Documented",
			"description": "Older format where the plant letter (F, M, G, N, or W) appears in the middle of the string, followed by a 2-digit week and 2-digit year."
		}],
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
				"answer": "Older Ruud serial numbers (often 10–17 characters long) embed the plant code letter (F, M, G, N, or W) in the middle of the string. The two digits immediately following the plant letter are the week, and the next two are the year."
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
		]
	},
	{
		manufacturerId: "york",
		slug: "york-serial-number-decoder",
		displayName: "York",
		relatedBrands: [],
		category: "HVAC",
		pageTitle: "York Serial Number Decoder — Find Equipment Age | SerialAge",
		metaDescription: "Free decoder for York HVAC serial numbers. Find out the age and manufacture date of your York air conditioner, furnace, or heat pump.",
		headline: "York Serial Number Decoder",
		shortDescription: "Determine the age and manufacture date of your York HVAC equipment. York's historical serial numbering incorporates a notoriously complex 21-year repeating letter cycle which can result in intentional ambiguity.",
		ratingPlateLocation: "The serial number is located on the manufacturer's data plate (rating plate). For outdoor AC or heat pump units, it is usually on the side or back of the cabinet above the refrigerant valves. For indoor furnaces or air handlers, check inside the front access panel.",
		limitations: [
			"The 1971-2004 format repeats the year letter every 21 years (e.g., A = 1971 OR 1992). The decoder will correctly identify this as ambiguous and provide both years for letters A through N.",
			"Serial numbers indicating manufacture before 1971 are highly inconsistent and not supported.",
			"9-character legacy variations (missing the leading plant code) are intentionally rejected to prevent false positives.",
			"Water heater serial numbers are out of scope."
		],
		ambiguity: "York used a repeating 21-year letter cycle from 1971 to 2004. Serial numbers with year letters A through N could belong to either the 1971-1983 cycle or the 1992-2004 cycle. Our decoder intentionally returns both possible years when it detects this ambiguity. You must visually inspect the unit's condition and refrigerant type to determine the correct era.",
		sources: [{
			type: "internal",
			title: "York Implementation Contract",
			description: "Implementation audit."
		}, {
			type: "external",
			title: "Building Intelligence Center - York",
			publisher: "Building Intelligence Center",
			description: "Reference for historical formatting trends."
		}],
		supportedFormats: [{
			"label": "Post-2004 (10-Character)",
			"example": "W0K5896070",
			"exampleType": "Verified",
			"description": "Used from October 2004 to present. Positions 2 and 4 form a 2-digit year code (e.g. 0 and 5 = 2005). Position 3 is a letter representing the month."
		}, {
			"label": "1971-2004 (10-Character)",
			"example": "WAKM011379",
			"exampleType": "Verified",
			"description": "Position 2 is the month letter, Position 3 is the year letter. Letters A-N map to two possible years."
		}],
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
		]
	}
];
function getAllBrandPages() {
	return ALL_BRAND_PAGES;
}
//#endregion
//#region src/pages/BrandPage.tsx
function BrandPageHeader() {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "promo-banner",
		role: "status",
		children: [
			"Free forever — no account, no data stored. ",
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Carrier, Goodman, Lennox & Trane" }),
			" supported now."
		]
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
		className: "nav",
		"aria-label": "Main navigation",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "nav-inner",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_router_dom.Link, {
				className: "nav-logo",
				to: "/",
				"aria-label": "SerialAge home",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "nav-logo-mark",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						width: "18",
						height: "18",
						viewBox: "0 0 18 18",
						fill: "none",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "M9 2v14M2 9h14M4.5 4.5l9 9M13.5 4.5l-9 9",
							stroke: "#ffffff",
							strokeWidth: "1.9",
							strokeLinecap: "round"
						})
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "nav-logo-text",
					children: ["Serial", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Age" })]
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "nav-right",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
						className: "nav-link",
						to: "/#manufacturers",
						children: "Manufacturers"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
						className: "nav-link",
						to: "/#how-it-works",
						children: "How It Works"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
						className: "nav-link",
						to: "/#faq",
						children: "FAQ"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
						className: "nav-cta",
						href: "#decoder-section",
						children: "Decode Now"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThemeToggle, {})
				]
			})]
		})
	})] });
}
function BrandPageFooter() {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("footer", {
		className: "footer",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "footer-inner",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "footer-top",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "footer-brand",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "footer-logo",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "footer-logo-mark",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
								width: "14",
								height: "14",
								viewBox: "0 0 14 14",
								fill: "none",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									d: "M7 1v12M1 7h12M3.5 3.5l7 7M10.5 3.5l-7 7",
									stroke: "#ffffff",
									strokeWidth: "1.6",
									strokeLinecap: "round"
								})
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "footer-logo-text",
							children: "SerialAge"
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "footer-tagline",
						children: "Free serial number lookup for homeowners, technicians, and inspectors."
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
					className: "footer-nav",
					"aria-label": "Footer navigation",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "footer-col-head",
						children: "Manufacturers"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
						className: "footer-links",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
								to: "/carrier-serial-number-decoder",
								children: "Carrier"
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
								to: "/goodman-serial-number-decoder",
								children: "Goodman"
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
								to: "/lennox-serial-number-decoder",
								children: "Lennox"
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
								to: "/trane-serial-number-decoder",
								children: "Trane"
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								href: "#",
								children: "More coming soon"
							}) })
						]
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "footer-col-head",
						children: "Resources"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
						className: "footer-links",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
								to: "/#how-it-works",
								children: "How It Works"
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
								to: "/#faq",
								children: "FAQ"
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								href: "#",
								children: "HVAC Age Guide"
							}) })
						]
					})] })]
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "footer-bottom",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "footer-copy",
					children: "© 2026 SerialAge. All rights reserved."
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "footer-disclaimer",
					children: "Results are based on documented manufacturer formats. Always confirm with a licensed HVAC technician for warranty, insurance, or legal decisions."
				})]
			})]
		})
	});
}
function BrandPage({ config }) {
	const [openFaq, setOpenFaq] = (0, react.useState)(null);
	const structuredData = [
		buildWebApplicationSchema(canonicalUrl(`/${config.slug}`), config.headline, config.shortDescription),
		buildBreadcrumbSchema(config.displayName, config.slug),
		...config.faqs.length > 0 ? [buildFaqPageSchema(config.faqs)] : []
	];
	const toggleFaq = (index) => {
		setOpenFaq(openFaq === index ? null : index);
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SEO, {
			title: config.pageTitle,
			description: config.metaDescription,
			path: `/${config.slug}`,
			structuredData
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrandPageHeader, {}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
			id: "main-content",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "hero",
					id: "decoder-section",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "hero-content",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
								"aria-label": "Breadcrumb",
								style: {
									marginBottom: "16px",
									fontSize: "14px",
									color: "var(--mute)"
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
										to: "/",
										style: {
											color: "var(--mute)",
											textDecoration: "none"
										},
										children: "SerialAge"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: { margin: "0 8px" },
										children: "›"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: { color: "var(--primary)" },
										"aria-current": "page",
										children: config.displayName
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
								className: "hero-h1",
								children: config.headline
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "hero-sub",
								children: config.shortDescription
							}),
							config.relatedBrands && config.relatedBrands.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								style: {
									marginTop: "12px",
									fontSize: "14px",
									color: "var(--mute)"
								},
								children: [
									"Also covers:",
									" ",
									config.relatedBrands.map((b, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [i > 0 && ", ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
										to: `/${b.slug}`,
										style: {
											color: "var(--primary)",
											textDecoration: "none"
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: b.name })
									})] }, b.slug))
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DecoderWidget, { defaultManufacturerId: config.manufacturerId }, config.manufacturerId)
						]
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "section section-alt",
					"aria-labelledby": "where-to-find",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "section-inner",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "s-eye",
								children: "Data Plate"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "s-head",
								id: "where-to-find",
								children: "Where to find the serial number"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "s-sub",
								children: config.ratingPlateLocation
							})
						]
					})
				}),
				config.ambiguity && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "section section-alt",
					"aria-labelledby": "ambiguity",
					style: { paddingTop: 0 },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "section-inner",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "s-eye",
								style: { color: "#7a5c00" },
								children: "Known Ambiguity"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "s-head",
								id: "ambiguity",
								children: "Important Note"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "alert-warning",
								style: {
									maxWidth: "760px",
									margin: "24px auto 0",
									padding: "16px 24px",
									fontSize: "15px",
									lineHeight: "1.6",
									textAlign: "left"
								},
								children: config.ambiguity
							})
						]
					})
				}),
				config.supportedFormats && config.supportedFormats.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "section",
					"aria-labelledby": "format-guide",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "section-inner",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "s-eye",
								children: "Format Guide"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "s-head",
								id: "format-guide",
								children: "Supported Formats"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: {
									display: "grid",
									gap: "24px",
									maxWidth: "840px",
									margin: "32px auto 0",
									gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
								},
								children: config.supportedFormats.map((fmt, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mfr-card",
									style: {
										textAlign: "left",
										padding: "24px",
										background: "var(--surface-card)",
										borderRadius: "var(--r-md)"
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mfr-name",
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												fontWeight: 600,
												color: "var(--ink)"
											},
											children: [fmt.label, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "11px",
													padding: "3px 8px",
													borderRadius: "var(--r-full)",
													background: fmt.exampleType === "Verified" || fmt.exampleType === "Documented" ? "var(--success-pale)" : "var(--hairline-soft)",
													color: fmt.exampleType === "Verified" || fmt.exampleType === "Documented" ? "var(--success-deep)" : "var(--mute)",
													textTransform: "uppercase",
													letterSpacing: "0.5px"
												},
												children: fmt.exampleType
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "mfr-fmt-code",
											style: {
												marginTop: "16px",
												fontSize: "24px",
												fontFamily: "var(--font)",
												fontWeight: 700,
												letterSpacing: "1.5px",
												color: "var(--ink)"
											},
											children: fmt.example
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: "mfr-desc",
											style: {
												marginTop: "12px",
												fontSize: "14px",
												color: "var(--mute)",
												lineHeight: "1.6"
											},
											children: fmt.description
										})
									]
								}, i))
							})
						]
					})
				}),
				config.limitations.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "section section-alt",
					"aria-labelledby": "limitations",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "section-inner",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "s-eye",
								children: "Keep in mind"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "s-head",
								id: "limitations",
								children: "Limitations"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: "re-body-list",
								style: {
									maxWidth: "600px",
									margin: "24px auto 0",
									textAlign: "left"
								},
								children: config.limitations.map((item, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: item }, i))
							})
						]
					})
				}),
				config.faqs && config.faqs.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "section",
					id: "faq",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "section-inner",
						style: { maxWidth: "840px" },
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "s-eye",
								children: "FAQ"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "s-head",
								children: "Frequently Asked Questions"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "faq-list",
								role: "list",
								children: config.faqs.map((faq, idx) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "faq-item",
									role: "listitem",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										className: `faq-q ${openFaq === idx ? "open" : ""}`,
										onClick: () => toggleFaq(idx),
										"aria-expanded": openFaq === idx,
										children: [faq.question, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
											className: "faq-chevron",
											width: "18",
											height: "18",
											viewBox: "0 0 18 18",
											fill: "none",
											"aria-hidden": "true",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
												d: "M4.5 6.75L9 11.25l4.5-4.5",
												stroke: "currentColor",
												strokeWidth: "1.7",
												strokeLinecap: "round",
												strokeLinejoin: "round"
											})
										})]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: `faq-a ${openFaq === idx ? "open" : ""}`,
										role: "region",
										children: faq.answer
									})]
								}, idx))
							})
						]
					})
				}),
				config.sources && config.sources.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "section section-alt",
					"aria-labelledby": "provenance",
					style: {
						paddingTop: "32px",
						paddingBottom: "32px"
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "section-inner",
						style: {
							maxWidth: "840px",
							textAlign: "left"
						},
						children: [config.sources.some((s) => s.type === "external") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: { marginBottom: config.sources.some((s) => s.type === "internal") ? "32px" : "0" },
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "s-eye",
									children: "References"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									id: "external-sources",
									style: { fontSize: "20px" },
									children: "External Sources"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: "re-body-list",
									style: {
										margin: "16px 0 0 20px",
										color: "var(--mute)"
									},
									children: config.sources.filter((s) => s.type === "external").map((src, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
										style: { marginBottom: "12px" },
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: {
												color: "var(--ink)",
												fontWeight: 500
											},
											children: [src.url ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
												href: src.url,
												style: {
													color: "var(--primary)",
													textDecoration: "underline"
												},
												children: src.title
											}) : src.title, src.publisher && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												style: {
													color: "var(--mute)",
													fontWeight: 400
												},
												children: [" — ", src.publisher]
											})]
										}), src.description && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "14px",
												marginTop: "4px"
											},
											children: src.description
										})]
									}, `ext-${i}`))
								})
							]
						}), config.sources.some((s) => s.type === "internal") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "s-eye",
								children: "Provenance"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "s-head",
								id: "methodology",
								style: { fontSize: "20px" },
								children: "Our Methodology"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: "re-body-list",
								style: {
									margin: "16px 0 0 20px",
									color: "var(--mute)"
								},
								children: config.sources.filter((s) => s.type === "internal").map((src, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
									style: { marginBottom: "12px" },
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										style: {
											color: "var(--ink)",
											fontWeight: 500
										},
										children: src.title
									}), src.description && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										style: {
											fontSize: "14px",
											marginTop: "4px"
										},
										children: src.description
									})]
								}, `int-${i}`))
							})
						] })]
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
					className: "section section-alt",
					"aria-labelledby": "other-decoders",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "section-inner",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "s-eye",
								children: "Explore"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "s-head",
								id: "other-decoders",
								children: "Other Decoders"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									gap: "16px",
									justifyContent: "center",
									flexWrap: "wrap",
									marginTop: "32px"
								},
								children: getAllBrandPages().filter((b) => b.slug !== config.slug).map((b) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_router_dom.Link, {
									to: `/${b.slug}`,
									style: {
										padding: "12px 24px",
										background: "var(--surface-card)",
										borderRadius: "var(--r-md)",
										border: "1px solid var(--hairline)",
										color: "var(--ink)",
										textDecoration: "none",
										fontWeight: 600,
										fontFamily: "var(--font)"
									},
									children: [b.displayName, " Decoder"]
								}, b.slug))
							})
						]
					})
				})
			]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrandPageFooter, {})
	] });
}
//#endregion
//#region src/pages/NotFoundPage.tsx
/**
* NotFoundPage — 404 catch-all.
*
* Rendered when no route matches. Does NOT redirect to homepage.
* Provides a clear message and a link back to the decoder.
*/
function NotFoundPage() {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_helmet_async.Helmet, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: "Page Not Found | SerialAge" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
			name: "robots",
			content: "noindex"
		})] }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("header", {
			className: "site-header",
			role: "banner",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "site-header__inner",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					className: "site-header__icon",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.75",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					"aria-hidden": "true",
					focusable: "false",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 7V5a2 2 0 0 1 2-2h2" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M17 3h2a2 2 0 0 1 2 2v2" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M21 17v2a2 2 0 0 1-2 2h-2" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M7 21H5a2 2 0 0 1-2-2v-2" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "7",
							y1: "12",
							x2: "17",
							y2: "12"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_router_dom.Link, {
					to: "/",
					className: "site-header__wordmark",
					"aria-label": "SerialAge — Home",
					children: ["Serial", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "site-header__wordmark-accent",
						children: "Sense"
					})]
				})]
			})
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("main", {
			className: "site-main not-found-main",
			id: "main-content",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "not-found-content",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "not-found-code",
						"aria-hidden": "true",
						children: "404"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						className: "not-found-heading",
						children: "Page not found"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "not-found-body",
						children: "We couldn’t find the page you were looking for. It may have moved or the URL may be incorrect."
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
						to: "/",
						className: "btn-decode not-found-cta",
						children: "Go to the decoder"
					})
				]
			})
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
			className: "site-footer",
			role: "contentinfo",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Results are derived from public manufacturer documentation. Always verify against the physical rating plate before replacing equipment." }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
				to: "/privacy",
				className: "footer-privacy-link",
				children: "Privacy Policy"
			}) })]
		})
	] });
}
//#endregion
//#region src/pages/PrivacyPage.tsx
function PrivacyPage() {
	const brandPages = getAllBrandPages();
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_helmet_async.Helmet, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: "Privacy Policy | SerialAge" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
				name: "description",
				content: "Privacy Policy for SerialAge. We do not store, track, or transmit your serial numbers."
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("link", {
				rel: "canonical",
				href: "https://serialage.com/privacy"
			})
		] }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("header", {
			className: "site-header",
			role: "banner",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "site-header__inner",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					className: "site-header__icon",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.75",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					"aria-hidden": "true",
					focusable: "false",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 7V5a2 2 0 0 1 2-2h2" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M17 3h2a2 2 0 0 1 2 2v2" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M21 17v2a2 2 0 0 1-2 2h-2" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M7 21H5a2 2 0 0 1-2-2v-2" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "7",
							y1: "12",
							x2: "17",
							y2: "12"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_router_dom.Link, {
					to: "/",
					className: "site-header__wordmark",
					"aria-label": "SerialAge — Home",
					children: ["Serial", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "site-header__wordmark-accent",
						children: "Sense"
					})]
				})]
			})
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("main", {
			className: "site-main not-found-main",
			id: "main-content",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "not-found-content",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						className: "not-found-heading",
						style: { fontSize: "2rem" },
						children: "Privacy Policy"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "not-found-body",
						children: "All decoding happens on your device. We do not store, track, or transmit your serial numbers."
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
						to: "/",
						className: "btn-decode not-found-cta",
						children: "Go to the decoder"
					})
				]
			})
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
			className: "site-footer",
			role: "contentinfo",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
					className: "footer-brand-nav",
					"aria-label": "Brand decoders",
					children: brandPages.map((b) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_router_dom.Link, {
						to: `/${b.slug}`,
						children: [b.displayName, " Serial Decoder"]
					}, b.slug))
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Results are derived from public manufacturer documentation. Always verify against the physical rating plate before replacing equipment." }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Link, {
					to: "/privacy",
					className: "footer-privacy-link",
					children: "Privacy Policy"
				}) })
			]
		})
	] });
}
//#endregion
//#region src/pages/MethodologyPage.tsx
function MethodologyPage() {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_helmet_async.Helmet, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: `Methodology — How We Decode HVAC Serial Numbers | ${OG_SITE_NAME}` }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("meta", {
				name: "description",
				content: `Learn how ${OG_SITE_NAME} researches, verifies, and tests HVAC serial number decoding rules. We explain our confidence system, why we reject unsupported formats, and our strict 'no guessing' philosophy.`
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("link", {
				rel: "canonical",
				href: canonicalUrl("/methodology")
			})
		] }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
			className: "nav",
			"aria-label": "Main navigation",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "nav-inner",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
					className: "nav-logo",
					href: "/",
					"aria-label": `${OG_SITE_NAME} home`,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "nav-logo-mark",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
							width: "18",
							height: "18",
							viewBox: "0 0 18 18",
							fill: "none",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								d: "M9 2v14M2 9h14M4.5 4.5l9 9M13.5 4.5l-9 9",
								stroke: "#ffffff",
								strokeWidth: "1.9",
								strokeLinecap: "round"
							})
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "nav-logo-text",
						children: OG_SITE_NAME
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "nav-right",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
						className: "nav-link",
						href: "/",
						children: "Decoder"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ThemeToggle, {})]
				})]
			})
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("main", {
			id: "main-content",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
				className: "section",
				style: {
					paddingTop: "80px",
					paddingBottom: "80px"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "section-inner",
					style: { maxWidth: "800px" },
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
							className: "hero-h1",
							style: {
								fontSize: "48px",
								marginBottom: "24px"
							},
							children: "Methodology"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							className: "hero-sub",
							style: {
								textAlign: "left",
								margin: "0 0 64px 0",
								maxWidth: "100%"
							},
							children: [
								"Transparency is the foundation of ",
								OG_SITE_NAME,
								". This page details exactly how we research, build, and verify our decoding logic. Our core philosophy is simple: ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "We do not guess." })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "article-content",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: [
										"1. What ",
										OG_SITE_NAME,
										" Does"
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: [OG_SITE_NAME, " decodes HVAC serial numbers to extract the factory manufacture date. It applies manufacturer-specific algorithms to user input and visually breaks down exactly which characters represent the year, month, week, and plant code."]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "2. Where Our Decoding Rules Come From"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: "Our decoding logic is not based on AI hallucinations or crowd-sourced guesses. Published manufacturer documentation and reputable technical references are used where available. We map out the exact mathematical patterns established by the manufacturers over the decades."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "3. The Research Process"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "Every supported format goes through a strict multi-stage engineering pipeline:"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "pipeline",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "pipeline-step",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "pipeline-step-num",
												children: "1"
											}), " Research"]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "pipeline-arrow",
											children: "→"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "pipeline-step",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "pipeline-step-num",
												children: "2"
											}), " Source Audit"]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "pipeline-arrow",
											children: "→"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "pipeline-step",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "pipeline-step-num",
												children: "3"
											}), " Format Verification"]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "pipeline-arrow",
											children: "→"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "pipeline-step",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "pipeline-step-num",
												children: "4"
											}), " Golden Dataset"]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "pipeline-arrow",
											children: "→"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "pipeline-step",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "pipeline-step-num",
												children: "5"
											}), " Implementation"]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "pipeline-arrow",
											children: "→"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "pipeline-step",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "pipeline-step-num",
												children: "6"
											}), " Automated Tests"]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "pipeline-arrow",
											children: "→"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "pipeline-step",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "pipeline-step-num",
												children: "7"
											}), " Adversarial Review"]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "pipeline-arrow",
											children: "→"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "pipeline-step",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "pipeline-step-num",
												children: "8"
											}), " QA"]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
									style: {
										marginBottom: "40px",
										color: "var(--body-color)",
										lineHeight: "1.6",
										fontSize: "15px"
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Research:" }), " Locating documentation and historical data."] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Source Audit:" }), " Verifying the authenticity and accuracy of the source."] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Format Verification:" }), " Cross-referencing formats against known real-world examples."] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Golden Dataset:" }), " Building a strict dataset of known good and bad inputs."] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Implementation:" }), " Writing mathematical parsing logic that strictly adheres to the format."] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Automated Tests:" }), " Running the logic against the golden dataset to prevent regressions."] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Adversarial Review:" }), " Testing the logic with malformed, misleading, or edge-case inputs."] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "QA:" }), " Final manual quality assurance before deployment."] })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "4. Source Verification"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: "A source can support a format without providing a real-world serial example. We use primary manufacturer documentation where available, supplemented by verified secondary technical resources. We prioritize manufacturer documentation and reputable technical references, and we do not treat unverified claims as sufficient evidence for a decoding rule."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "5. Format Testing"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: "Our testing architecture ensures that every format rule is individually isolated and proven against a suite of synthetic and real-world inputs. If an input belongs to an unsupported format or era, the tests enforce that the decoder safely rejects it rather than generating a false positive."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "6. Confidence and Uncertainty"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "Not all serial numbers are created equal. We grade our results using a clear confidence system:"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
									style: {
										marginBottom: "40px",
										color: "var(--body-color)",
										lineHeight: "1.6",
										fontSize: "15px"
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Verified Format:" }), " The serial number perfectly matches a thoroughly documented and tested manufacturer format. The date is mathematically certain based on that specification."] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Estimated Format:" }), " The serial number matches a known legacy format, but the era may have poor documentation or overlapping historical cycles."] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Uncertain:" }), " The input has severe anomalies or matches multiple conflicting formats, making a definitive date impossible without visual inspection of the equipment."] })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "7. Ambiguous Serial Numbers"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: [
										"Some historical serial formats (like pre-2004 York formats) reuse the exact same letter codes every 20-30 years. When this happens, a single serial number could correctly represent two entirely different years. ",
										OG_SITE_NAME,
										" does not silently choose one; it shows you all mathematically valid alternatives and instructs you to verify against the physical equipment label."
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "8. Unsupported Formats"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: "If you receive an \"Unsupported\" result, this is an intentional safety feature. Before 1985, many manufacturers used highly inconsistent or undocumented formats. If we cannot establish a reliable, documented interpretation of a format, we refuse to guess. We would rather provide no date than a false date."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "9. Manufacture Date vs Installation Date"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: [
										OG_SITE_NAME,
										" extracts the ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "manufacture date" }),
										"—the exact day, week, or month the unit left the factory line. This is NOT the installation date. Equipment often sits in distributor warehouses for months before being installed in a home. Warranty coverage usually depends on the installation date."
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "10. Why Model Numbers are Different"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: [
										"Model numbers describe what the equipment is (tonnage, efficiency, product family). Serial numbers describe ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: "when" }),
										" and ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: "where" }),
										" it was made. You cannot extract the manufacture date from an HVAC model number."
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "11. What Users Should Verify"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: "Our tool is an informational starting point. Always verify our results against the physical data plate (rating plate) attached to the unit. If the data plate contains a printed \"MFR DATE\", that printed date supersedes any decoded result."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "12. Current Coverage"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: [OG_SITE_NAME, " currently supports standard residential HVAC formats for the following manufacturers:"]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
									style: {
										marginBottom: "40px",
										color: "var(--body-color)",
										lineHeight: "1.6",
										fontSize: "15px"
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Carrier" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Goodman" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Lennox" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Trane" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Rheem" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Ruud" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "York" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Bryant" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Payne" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "Amana" })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: "We do not support every manufacturer, and we do not support water heaters or commercial appliances. Unsupported brands or formats will only be added after strict source verification."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "13. Corrections and Feedback"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: "We are constantly auditing our formats. At this time, we do not have an automated public reporting mechanism or contact form. If a result seems mathematically impossible, we recommend consulting a licensed HVAC professional or the manufacturer directly."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									className: "s-head",
									style: {
										textAlign: "left",
										marginBottom: "16px"
									},
									children: "14. Disclaimer"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "s-sub",
									style: {
										textAlign: "left",
										marginBottom: "40px"
									},
									children: "Results are based on documented manufacturer formats. We make no universal claims regarding warranty eligibility, safety, or equipment condition. Equipment age does not determine equipment condition, and serial decoding cannot replace a professional diagnosis. Always confirm with a licensed HVAC technician for warranty, insurance, or legal decisions."
								})
							]
						})
					]
				})
			})
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Footer, {})
	] });
}
//#endregion
//#region src/Router.tsx
/**
* Router — all application route definitions.
*
* Routes:
*   /                                → App (homepage shell — unchanged)
*   /carrier-serial-number-decoder   → BrandPage (Carrier config)
*   /goodman-serial-number-decoder   → BrandPage (Goodman config)
*   /lennox-serial-number-decoder    → BrandPage (Lennox config)
*   *                                → NotFoundPage (404, no redirect)
*
* Adding a new manufacturer:
*   1. Add a BrandPageConfig entry in src/data/brandPages.ts.
*   2. Add a Route entry below following the same pattern.
*   3. No other files need changing.
*/
function AppRouter() {
	const brandPages = getAllBrandPages();
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_router_dom.Routes, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Route, {
			path: "/",
			element: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(App, {})
		}),
		brandPages.map((config) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Route, {
			path: `/${config.slug}`,
			element: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrandPage, { config })
		}, config.slug)),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Route, {
			path: "/privacy",
			element: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PrivacyPage, {})
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Route, {
			path: "/methodology",
			element: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MethodologyPage, {})
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router_dom.Route, {
			path: "*",
			element: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NotFoundPage, {})
		})
	] });
}
//#endregion
//#region src/entry-server.tsx
/**
* entry-server.tsx — server-side rendering entry point.
*
* Used exclusively during the SSG/prerender build step.
* NOT loaded in the browser — the browser uses main.tsx.
*
* Exports a single `render` function that:
*   1. Renders the route tree at the given URL using StaticRouter.
*   2. Collects Helmet (react-helmet-async) tags.
*   3. Returns { appHtml, helmetContext } for injection into index.html.
*
* Architecture constraints:
* - Uses StaticRouter (react-router-dom/server) for SSR — not BrowserRouter.
* - HelmetProvider accepts a `context` object for server-side extraction.
* - No browser APIs (window, document, localStorage) are called here.
* - DecoderWidget interactive state is left for client hydration.
*/
/**
* Render a route to HTML.
*
* @param url - The path to render (e.g., '/', '/carrier-serial-number-decoder')
* @returns appHtml and helmetContext for head injection
*/
function render(url) {
	const helmetContext = {};
	return {
		appHtml: (0, react_dom_server.renderToString)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_helmet_async.HelmetProvider, {
			context: helmetContext,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_router.StaticRouter, {
				location: url,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AppRouter, {})
			})
		})),
		helmetContext
	};
}
//#endregion
exports.getAllBrandPages = getAllBrandPages;
exports.render = render;
