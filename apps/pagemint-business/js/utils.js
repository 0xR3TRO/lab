/**
 * Shared helper utilities and static configuration for PageMint Business.
 */

export const FONT_OPTIONS = [
	{
		value: '"Avenir Next", "Segoe UI", sans-serif',
		label: 'Avenir Next',
	},
	{
		value: '"IBM Plex Sans", "Segoe UI", sans-serif',
		label: 'IBM Plex Sans',
	},
	{
		value: '"Space Grotesk", "Trebuchet MS", sans-serif',
		label: 'Space Grotesk',
	},
	{
		value: '"Work Sans", "Helvetica Neue", sans-serif',
		label: 'Work Sans',
	},
	{
		value: '"Merriweather", Georgia, serif',
		label: 'Merriweather',
	},
];

export const LAYOUT_OPTIONS = [
	{ value: "hero-top", label: "Hero Top" },
	{ value: "hero-side", label: "Hero Side" },
	{ value: "minimal", label: "Minimal" },
	{ value: "card-style", label: "Card Style" },
];

export const SOCIAL_ICON_OPTIONS = [
	{ value: "website", label: "Website" },
	{ value: "linkedin", label: "LinkedIn" },
	{ value: "facebook", label: "Facebook" },
	{ value: "instagram", label: "Instagram" },
	{ value: "x", label: "X / Twitter" },
	{ value: "youtube", label: "YouTube" },
];

const ICON_SVG_MAP = {
	website:
		'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm7.93 9h-3.05a16.34 16.34 0 0 0-1.18-4.46A8.03 8.03 0 0 1 19.93 11ZM12 4.05c.85 1.1 1.89 3.4 2.32 6.95H9.68C10.11 7.45 11.15 5.15 12 4.05ZM4.07 13h3.05a16.35 16.35 0 0 0 1.18 4.46A8.03 8.03 0 0 1 4.07 13Zm3.05-2H4.07a8.03 8.03 0 0 1 4.23-4.46A16.34 16.34 0 0 0 7.12 11Zm1.99 0A14.88 14.88 0 0 1 12 4.8 14.88 14.88 0 0 1 14.89 11Zm5.78 2A14.88 14.88 0 0 1 12 19.2 14.88 14.88 0 0 1 9.11 13Zm.81 4.46A16.35 16.35 0 0 0 16.88 13h3.05a8.03 8.03 0 0 1-4.23 4.46Z"/></svg>',
	linkedin:
		'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.94 8.5A1.56 1.56 0 1 1 6.94 5.4a1.56 1.56 0 0 1 0 3.1ZM5.5 9.75h2.87V18H5.5Zm4.67 0h2.75v1.13h.04a3.02 3.02 0 0 1 2.72-1.5c2.9 0 3.43 1.9 3.43 4.37V18h-2.87v-3.78c0-.9-.02-2.07-1.26-2.07-1.27 0-1.46.98-1.46 2v3.85h-2.87Z"/></svg>',
	facebook:
		'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.8 8.5V6.9c0-.56.37-.7.63-.7h1.57V3.5h-2.16c-2.4 0-2.95 1.8-2.95 2.95V8.5H9v2.76h1.89V20h2.91v-8.74h1.96L16 8.5Z"/></svg>',
	instagram:
		'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7.25 3h9.5A4.25 4.25 0 0 1 21 7.25v9.5A4.25 4.25 0 0 1 16.75 21h-9.5A4.25 4.25 0 0 1 3 16.75v-9.5A4.25 4.25 0 0 1 7.25 3Zm0 1.8A2.45 2.45 0 0 0 4.8 7.25v9.5a2.45 2.45 0 0 0 2.45 2.45h9.5a2.45 2.45 0 0 0 2.45-2.45v-9.5a2.45 2.45 0 0 0-2.45-2.45Zm9.9 1.35a.95.95 0 1 1 0 1.9.95.95 0 0 1 0-1.9ZM12 7.6A4.4 4.4 0 1 1 7.6 12 4.4 4.4 0 0 1 12 7.6Zm0 1.8A2.6 2.6 0 1 0 14.6 12 2.6 2.6 0 0 0 12 9.4Z"/></svg>',
	x: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M15.5 3h3l-6.56 7.5L19.7 21h-6.09l-4.77-6.24L3.4 21H.4l7.03-8.03L.2 3h6.22l4.3 5.72Zm-1.05 16.2h1.66L5.52 4.7H3.74Z"/></svg>',
	youtube:
		'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.3 7.32a2.52 2.52 0 0 0-1.77-1.78C16.96 5.1 12 5.1 12 5.1s-4.96 0-6.53.44A2.52 2.52 0 0 0 3.7 7.32 26.06 26.06 0 0 0 3.26 12a26.06 26.06 0 0 0 .44 4.68 2.52 2.52 0 0 0 1.77 1.78c1.57.44 6.53.44 6.53.44s4.96 0 6.53-.44a2.52 2.52 0 0 0 1.77-1.78A26.06 26.06 0 0 0 20.74 12a26.06 26.06 0 0 0-.44-4.68ZM10.4 15.1V8.9L15.76 12Z"/></svg>',
};

const BUILTIN_TEMPLATES = [
	{
		id: "builtin-modern-corporate",
		name: "Modern Corporate",
		kind: "builtin",
		state: {
			company: {
				name: "Northbridge Partners",
				tagline: "Clarity-driven advisory for ambitious companies.",
				description:
					"Northbridge Partners helps growth-stage and enterprise teams shape strategy, launch digital initiatives, and scale operations with measurable outcomes.",
				services: [
					"Business Strategy Workshops",
					"Digital Transformation Roadmaps",
					"Operational Performance Audits",
				],
				contact: {
					email: "hello@northbridge.example.com",
					phone: "+1 (415) 555-0132",
					address: "1550 Mission Street, Suite 500, San Francisco, CA",
				},
				socials: [
					{ id: uid(), icon: "linkedin", url: "https://www.linkedin.com" },
					{ id: uid(), icon: "website", url: "https://www.northbridge.example.com" },
				],
			},
			appearance: {
				layout: "hero-side",
				fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
				colors: {
					background: "#0f172a",
					text: "#e2e8f0",
					accent: "#38bdf8",
				},
				toggles: { about: true, services: true, contact: true },
				radius: 18,
				spacing: 34,
				shadow: 56,
			},
		},
	},
	{
		id: "builtin-minimal-clean",
		name: "Minimal Clean",
		kind: "builtin",
		state: {
			company: {
				name: "Whitefield Studio",
				tagline: "Quiet design that lets your brand speak.",
				description:
					"Whitefield Studio creates understated brand systems and websites focused on typography, usability, and long-term consistency.",
				services: ["Brand Identity", "Website Design", "Design QA"],
				contact: {
					email: "contact@whitefield.example.com",
					phone: "+1 (212) 555-0140",
					address: "24 Bond Street, New York, NY",
				},
				socials: [{ id: uid(), icon: "website", url: "https://www.whitefield.example.com" }],
			},
			appearance: {
				layout: "minimal",
				fontFamily: '"Work Sans", "Helvetica Neue", sans-serif',
				colors: {
					background: "#f8fafc",
					text: "#0f172a",
					accent: "#0f766e",
				},
				toggles: { about: true, services: true, contact: true },
				radius: 10,
				spacing: 30,
				shadow: 18,
			},
		},
	},
	{
		id: "builtin-bold-accent",
		name: "Bold Accent",
		kind: "builtin",
		state: {
			company: {
				name: "PulseForge Media",
				tagline: "Campaigns that move fast and convert.",
				description:
					"PulseForge Media plans and executes direct-response campaigns that combine performance creative, funnel optimization, and analytics.",
				services: ["Paid Social Campaigns", "Funnel Strategy", "Conversion CRO"],
				contact: {
					email: "team@pulseforge.media",
					phone: "+1 (310) 555-0198",
					address: "7600 Sunset Blvd, Los Angeles, CA",
				},
				socials: [
					{ id: uid(), icon: "instagram", url: "https://www.instagram.com" },
					{ id: uid(), icon: "x", url: "https://x.com" },
				],
			},
			appearance: {
				layout: "card-style",
				fontFamily: '"Space Grotesk", "Trebuchet MS", sans-serif',
				colors: {
					background: "#111827",
					text: "#f9fafb",
					accent: "#f43f5e",
				},
				toggles: { about: true, services: true, contact: true },
				radius: 24,
				spacing: 38,
				shadow: 70,
			},
		},
	},
	{
		id: "builtin-soft-pastel",
		name: "Soft Pastel",
		kind: "builtin",
		state: {
			company: {
				name: "Bloom & Co. Wellness",
				tagline: "Calm, personalized support for healthier routines.",
				description:
					"Bloom & Co. Wellness provides tailored coaching plans and workplace wellness programming designed to improve focus, energy, and resilience.",
				services: ["1:1 Coaching", "Corporate Wellness Programs", "Nutrition Planning"],
				contact: {
					email: "hello@bloomco.example.com",
					phone: "+1 (646) 555-0124",
					address: "219 Spring Street, Boston, MA",
				},
				socials: [
					{ id: uid(), icon: "facebook", url: "https://www.facebook.com" },
					{ id: uid(), icon: "website", url: "https://www.bloomco.example.com" },
				],
			},
			appearance: {
				layout: "hero-top",
				fontFamily: '"Merriweather", Georgia, serif',
				colors: {
					background: "#fdf2f8",
					text: "#3f3f46",
					accent: "#ec4899",
				},
				toggles: { about: true, services: true, contact: true },
				radius: 20,
				spacing: 36,
				shadow: 40,
			},
		},
	},
];

/**
 * Generates a stable default state for new sessions and imports.
 */
export function createDefaultState() {
	return {
		meta: {
			activeTemplateName: "Modern Corporate",
		},
		company: {
			name: "PageMint Studio",
			tagline: "Crafting clear digital profiles for modern businesses.",
			description:
				"PageMint Studio helps businesses communicate what they do with elegant one-page profiles. Build trust quickly with a clean story, focused service offering, and clear contact points.",
			services: ["Brand Positioning", "Web Presence Design", "Launch Support"],
			contact: {
				email: "hello@pagemint.example.com",
				phone: "+1 (555) 101-2020",
				address: "450 Market Street, Seattle, WA",
			},
			socials: [
				{ id: uid(), icon: "linkedin", url: "https://www.linkedin.com" },
				{ id: uid(), icon: "website", url: "https://www.pagemint.example.com" },
			],
			logoDataUrl: "",
			logoName: "",
		},
		appearance: {
			fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
			layout: "hero-top",
			colors: {
				background: "#0b1220",
				text: "#e5e7eb",
				accent: "#22d3ee",
			},
			toggles: {
				about: true,
				services: true,
				contact: true,
			},
			radius: 18,
			spacing: 32,
			shadow: 46,
		},
	};
}

export function getBuiltInTemplates() {
	return deepClone(BUILTIN_TEMPLATES);
}

export function getSocialIconSvg(iconName) {
	return ICON_SVG_MAP[iconName] || ICON_SVG_MAP.website;
}

export function getSocialIconAssets() {
	return deepClone(ICON_SVG_MAP);
}

export function uid() {
	return `id_${Math.random().toString(36).slice(2, 10)}`;
}

export function deepClone(value) {
	if (typeof structuredClone === "function") {
		return structuredClone(value);
	}
	return JSON.parse(JSON.stringify(value));
}

/**
 * Deep merges plain objects while replacing arrays wholesale.
 */
export function mergeDeep(base, patch) {
	if (!patch || typeof patch !== "object") {
		return deepClone(base);
	}

	const output = deepClone(base);
	for (const [key, value] of Object.entries(patch)) {
		if (Array.isArray(value)) {
			output[key] = deepClone(value);
			continue;
		}

		if (value && typeof value === "object") {
			output[key] = mergeDeep(output[key] ?? {}, value);
			continue;
		}

		output[key] = value;
	}
	return output;
}

/**
 * Ensures external template payloads always include required fields.
 */
export function normalizeState(candidate) {
	const merged = mergeDeep(createDefaultState(), candidate || {});

	if (!Array.isArray(merged.company.services) || merged.company.services.length === 0) {
		merged.company.services = [""];
	}

	if (!Array.isArray(merged.company.socials)) {
		merged.company.socials = [];
	}

	merged.company.socials = merged.company.socials
		.map((item) => ({
			id: item.id || uid(),
			icon: item.icon || "website",
			url: item.url || "",
		}))
		.slice(0, 12);

	merged.appearance.radius = clamp(Number(merged.appearance.radius) || 0, 0, 36);
	merged.appearance.spacing = clamp(Number(merged.appearance.spacing) || 32, 16, 56);
	merged.appearance.shadow = clamp(Number(merged.appearance.shadow) || 0, 0, 100);
	return merged;
}

export function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

export function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

export function sanitizeUrl(url) {
	const value = String(url ?? "").trim();
	if (!value) {
		return "";
	}

	if (/^(https?:|mailto:|tel:)/i.test(value)) {
		return value;
	}

	if (/^[a-z]+:/i.test(value)) {
		return value;
	}

	if (value.startsWith("//")) {
		return `https:${value}`;
	}

	return `https://${value}`;
}

export function slugify(value) {
	const clean = String(value || "profile")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "");
	return clean || "profile";
}

export function debounce(fn, wait = 120) {
	let timeoutId;
	return (...args) => {
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => fn(...args), wait);
	};
}

export function downloadBlob(blob, fileName) {
	const objectUrl = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = objectUrl;
	anchor.download = fileName;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	window.setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
}

export function downloadText(text, fileName, mimeType = "text/plain;charset=utf-8") {
	downloadBlob(new Blob([text], { type: mimeType }), fileName);
}

export function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(new Error("Unable to read file."));
		reader.readAsDataURL(file);
	});
}

export function readJsonFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				resolve(JSON.parse(String(reader.result)));
			} catch {
				reject(new Error("Invalid JSON file."));
			}
		};
		reader.onerror = () => reject(new Error("Unable to read JSON file."));
		reader.readAsText(file);
	});
}

/**
 * Converts data URLs to a Blob and extension for downloadable binary assets.
 */
export function dataUrlToFileParts(dataUrl) {
	const match = String(dataUrl || "").match(/^data:(.*?);base64,(.*)$/);
	if (!match) {
		throw new Error("Invalid image data format.");
	}

	const mimeType = match[1];
	const bytes = atob(match[2]);
	const buffer = new Uint8Array(bytes.length);
	for (let index = 0; index < bytes.length; index += 1) {
		buffer[index] = bytes.charCodeAt(index);
	}

	const extension = mimeType.split("/")[1] || "png";
	return {
		mimeType,
		extension: extension.replace("jpeg", "jpg"),
		blob: new Blob([buffer], { type: mimeType }),
	};
}

const loadedScripts = new Map();

export function loadExternalScript(src, testGlobal) {
	if (testGlobal && window[testGlobal]) {
		return Promise.resolve();
	}

	if (loadedScripts.has(src)) {
		return loadedScripts.get(src);
	}

	const promise = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
		document.head.append(script);
	});

	loadedScripts.set(src, promise);
	return promise;
}

export async function runWithBusyButton(button, busyText, action) {
	const originalText = button.textContent;
	button.disabled = true;
	button.textContent = busyText;
	try {
		await action();
	} finally {
		button.disabled = false;
		button.textContent = originalText;
	}
}
