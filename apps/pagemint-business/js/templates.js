/**
 * Template persistence module.
 * Handles built-in templates and custom template storage in localStorage.
 */

import {
	deepClone,
	downloadText,
	getBuiltInTemplates,
	normalizeState,
	readJsonFile,
	slugify,
	uid,
} from "./utils.js";

const STORAGE_KEY = "pagemint-business.custom-templates.v1";

function readStoredTemplates() {
	try {
		const rawValue = localStorage.getItem(STORAGE_KEY);
		if (!rawValue) {
			return [];
		}
		const parsed = JSON.parse(rawValue);
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed
			.map((item) => ({
				id: item.id || `custom-${uid()}`,
				name: String(item.name || "Custom Template").slice(0, 80),
				kind: "custom",
				state: normalizeState(item.state),
				updatedAt: item.updatedAt || new Date().toISOString(),
			}))
			.slice(0, 100);
	} catch {
		return [];
	}
}

function writeStoredTemplates(templates) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getCustomTemplates() {
	return readStoredTemplates();
}

export function getAllTemplates() {
	return [...getBuiltInTemplates(), ...readStoredTemplates()];
}

export function findTemplateById(templateId) {
	return getAllTemplates().find((item) => item.id === templateId) || null;
}

/**
 * Creates or updates a custom template from the current editor state.
 */
export function saveCustomTemplate(name, state, existingTemplateId = null) {
	const templates = readStoredTemplates();
	const cleanName = String(name || "My Template").trim().slice(0, 80) || "My Template";
	const now = new Date().toISOString();

	if (existingTemplateId) {
		const index = templates.findIndex((template) => template.id === existingTemplateId);
		if (index >= 0) {
			templates[index] = {
				...templates[index],
				name: cleanName,
				state: normalizeState(state),
				updatedAt: now,
			};
			writeStoredTemplates(templates);
			return templates[index];
		}
	}

	const newTemplate = {
		id: `custom-${uid()}`,
		name: cleanName,
		kind: "custom",
		state: normalizeState(state),
		updatedAt: now,
	};

	templates.unshift(newTemplate);
	writeStoredTemplates(templates);
	return newTemplate;
}

export function deleteCustomTemplate(templateId) {
	const templates = readStoredTemplates();
	const remaining = templates.filter((template) => template.id !== templateId);
	if (remaining.length === templates.length) {
		return false;
	}
	writeStoredTemplates(remaining);
	return true;
}

export function createTemplateExportPayload(state, templateName = "PageMint Template") {
	const cleanName = String(templateName || "PageMint Template").trim() || "PageMint Template";
	return {
		app: "PageMint Business",
		version: 1,
		template: {
			name: cleanName,
			kind: "custom",
			state: normalizeState(state),
		},
		exportedAt: new Date().toISOString(),
	};
}

export function exportTemplateJsonFile(state, templateName) {
	const payload = createTemplateExportPayload(state, templateName);
	const fileName = `${slugify(payload.template.name)}.template.json`;
	downloadText(JSON.stringify(payload, null, 2), fileName, "application/json;charset=utf-8");
}

/**
 * Imports a template payload from a JSON file and normalizes it for the editor.
 */
export async function importTemplateFromFile(file) {
	const payload = await readJsonFile(file);

	let templateNode = payload;
	if (payload && typeof payload === "object" && payload.template && payload.template.state) {
		templateNode = payload.template;
	}

	if (!templateNode || typeof templateNode !== "object" || !templateNode.state) {
		throw new Error("Template JSON is missing the required state field.");
	}

	const imported = {
		id: `custom-${uid()}`,
		name: String(templateNode.name || file.name.replace(/\.json$/i, "")).slice(0, 80),
		kind: "custom",
		state: normalizeState(deepClone(templateNode.state)),
		updatedAt: new Date().toISOString(),
	};

	if (!imported.name.trim()) {
		imported.name = "Imported Template";
	}

	return imported;
}
