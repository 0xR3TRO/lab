/**
 * Editor module.
 * Coordinates UI bindings, state updates, live preview, template actions, and exports.
 */

import {
	createDefaultState,
	debounce,
	FONT_OPTIONS,
	LAYOUT_OPTIONS,
	normalizeState,
	fileToDataUrl,
	runWithBusyButton,
	SOCIAL_ICON_OPTIONS,
	uid,
} from "./utils.js";
import { renderPreview } from "./preview.js";
import {
	deleteCustomTemplate,
	findTemplateById,
	getAllTemplates,
	importTemplateFromFile,
	saveCustomTemplate,
} from "./templates.js";
import { exportHtmlFile, exportJsonTemplateFile, exportPngFile, exportZipFile } from "./export.js";

const DEVICE_PRESETS = {
	desktop: { width: 1200, height: 860 },
	tablet: { width: 820, height: 1120 },
	mobile: { width: 390, height: 844 },
};

let appState = normalizeState(createDefaultState());
let activeDevice = "desktop";

const dom = {
	appShell: document.getElementById("appShell"),
	mobileEditorToggle: document.getElementById("mobileEditorToggle"),
	editorBackdrop: document.getElementById("editorBackdrop"),
	companyName: document.getElementById("companyName"),
	companyTagline: document.getElementById("companyTagline"),
	companyDescription: document.getElementById("companyDescription"),
	servicesList: document.getElementById("servicesList"),
	addServiceBtn: document.getElementById("addServiceBtn"),
	contactEmail: document.getElementById("contactEmail"),
	contactPhone: document.getElementById("contactPhone"),
	contactAddress: document.getElementById("contactAddress"),
	socialList: document.getElementById("socialList"),
	addSocialBtn: document.getElementById("addSocialBtn"),
	logoUpload: document.getElementById("logoUpload"),
	removeLogoBtn: document.getElementById("removeLogoBtn"),
	logoPreview: document.getElementById("logoPreview"),
	colorBackground: document.getElementById("colorBackground"),
	colorText: document.getElementById("colorText"),
	colorAccent: document.getElementById("colorAccent"),
	fontFamily: document.getElementById("fontFamily"),
	layoutVariant: document.getElementById("layoutVariant"),
	toggleAbout: document.getElementById("toggleAbout"),
	toggleServices: document.getElementById("toggleServices"),
	toggleContact: document.getElementById("toggleContact"),
	radiusRange: document.getElementById("radiusRange"),
	spacingRange: document.getElementById("spacingRange"),
	shadowRange: document.getElementById("shadowRange"),
	radiusValue: document.getElementById("radiusValue"),
	spacingValue: document.getElementById("spacingValue"),
	shadowValue: document.getElementById("shadowValue"),
	templateSelect: document.getElementById("templateSelect"),
	templateNameInput: document.getElementById("templateNameInput"),
	applyTemplateBtn: document.getElementById("applyTemplateBtn"),
	saveTemplateBtn: document.getElementById("saveTemplateBtn"),
	deleteTemplateBtn: document.getElementById("deleteTemplateBtn"),
	exportTemplateBtn: document.getElementById("exportTemplateBtn"),
	importTemplateBtn: document.getElementById("importTemplateBtn"),
	templateImportInput: document.getElementById("templateImportInput"),
	exportHtmlBtn: document.getElementById("exportHtmlBtn"),
	exportZipBtn: document.getElementById("exportZipBtn"),
	exportPngBtn: document.getElementById("exportPngBtn"),
	exportJsonBtn: document.getElementById("exportJsonBtn"),
	previewFrame: document.getElementById("previewFrame"),
	previewFrameWrap: document.getElementById("previewFrameWrap"),
	previewViewport: document.getElementById("previewViewport"),
	deviceButtons: Array.from(document.querySelectorAll(".device-toggle button[data-device]")),
};

const previewUpdate = debounce(() => {
	renderPreview(dom.previewFrame, appState);
}, 70);

const scalePreviewDebounced = debounce(() => {
	updatePreviewScale();
}, 60);

const toastRoot = document.createElement("div");
toastRoot.className = "toast-stack";
document.body.append(toastRoot);

function notify(message, type = "info") {
	const toast = document.createElement("div");
	toast.className = `toast toast-${type}`;
	toast.textContent = message;
	toastRoot.append(toast);

	window.setTimeout(() => {
		toast.classList.add("toast-hide");
		window.setTimeout(() => toast.remove(), 260);
	}, 2200);
}

function openEditorPanel() {
	dom.appShell.classList.add("editor-open");
	dom.mobileEditorToggle.setAttribute("aria-expanded", "true");
}

function closeEditorPanel() {
	dom.appShell.classList.remove("editor-open");
	dom.mobileEditorToggle.setAttribute("aria-expanded", "false");
}

function updateSliderOutputs() {
	dom.radiusValue.textContent = `${appState.appearance.radius}px`;
	dom.spacingValue.textContent = `${appState.appearance.spacing}px`;
	dom.shadowValue.textContent = `${appState.appearance.shadow}%`;
}

function renderLogoPreview() {
	if (!appState.company.logoDataUrl) {
		dom.logoPreview.innerHTML = '<div class="logo-preview-placeholder">No logo selected</div>';
		return;
	}

	dom.logoPreview.innerHTML = `<img src="${appState.company.logoDataUrl}" alt="Logo preview" />`;
}

/**
 * Rebuilds service list controls so add/remove operations remain in sync with state.
 */
function renderServicesInputs() {
	dom.servicesList.innerHTML = "";

	if (!appState.company.services.length) {
		appState.company.services = [""];
	}

	appState.company.services.forEach((serviceValue, index) => {
		const wrapper = document.createElement("div");
		wrapper.className = "repeat-item";

		const input = document.createElement("input");
		input.type = "text";
		input.maxLength = 120;
		input.placeholder = `Service ${index + 1}`;
		input.value = serviceValue;
		input.addEventListener("input", (event) => {
			appState.company.services[index] = event.target.value;
			previewUpdate();
		});

		const removeButton = document.createElement("button");
		removeButton.type = "button";
		removeButton.className = "remove-btn";
		removeButton.textContent = "Remove";
		removeButton.addEventListener("click", () => {
			appState.company.services.splice(index, 1);
			if (!appState.company.services.length) {
				appState.company.services.push("");
			}
			renderServicesInputs();
			previewUpdate();
		});

		wrapper.append(input, removeButton);
		dom.servicesList.append(wrapper);
	});
}

/**
 * Rebuilds social controls because each row carries multiple editable fields.
 */
function renderSocialInputs() {
	dom.socialList.innerHTML = "";

	appState.company.socials.forEach((socialItem, index) => {
		const row = document.createElement("div");
		row.className = "social-row";

		const iconSelect = document.createElement("select");
		SOCIAL_ICON_OPTIONS.forEach((option) => {
			const element = document.createElement("option");
			element.value = option.value;
			element.textContent = option.label;
			element.selected = option.value === socialItem.icon;
			iconSelect.append(element);
		});
		iconSelect.addEventListener("change", (event) => {
			appState.company.socials[index].icon = event.target.value;
			previewUpdate();
		});

		const urlInput = document.createElement("input");
		urlInput.type = "url";
		urlInput.placeholder = "https://example.com/profile";
		urlInput.value = socialItem.url;
		urlInput.maxLength = 240;
		urlInput.addEventListener("input", (event) => {
			appState.company.socials[index].url = event.target.value;
			previewUpdate();
		});

		const removeButton = document.createElement("button");
		removeButton.type = "button";
		removeButton.className = "remove-btn";
		removeButton.textContent = "Remove";
		removeButton.addEventListener("click", () => {
			appState.company.socials.splice(index, 1);
			renderSocialInputs();
			previewUpdate();
		});

		row.append(iconSelect, urlInput, removeButton);
		dom.socialList.append(row);
	});
}

function populateStaticSelectOptions() {
	dom.fontFamily.innerHTML = "";
	FONT_OPTIONS.forEach((option) => {
		const element = document.createElement("option");
		element.value = option.value;
		element.textContent = option.label;
		dom.fontFamily.append(element);
	});

	dom.layoutVariant.innerHTML = "";
	LAYOUT_OPTIONS.forEach((option) => {
		const element = document.createElement("option");
		element.value = option.value;
		element.textContent = option.label;
		dom.layoutVariant.append(element);
	});
}

/**
 * Rehydrates every editor input from state after template loads/imports.
 */
function syncFormFromState() {
	dom.companyName.value = appState.company.name;
	dom.companyTagline.value = appState.company.tagline;
	dom.companyDescription.value = appState.company.description;
	dom.contactEmail.value = appState.company.contact.email;
	dom.contactPhone.value = appState.company.contact.phone;
	dom.contactAddress.value = appState.company.contact.address;
	dom.colorBackground.value = appState.appearance.colors.background;
	dom.colorText.value = appState.appearance.colors.text;
	dom.colorAccent.value = appState.appearance.colors.accent;
	dom.fontFamily.value = appState.appearance.fontFamily;
	dom.layoutVariant.value = appState.appearance.layout;
	dom.toggleAbout.checked = appState.appearance.toggles.about;
	dom.toggleServices.checked = appState.appearance.toggles.services;
	dom.toggleContact.checked = appState.appearance.toggles.contact;
	dom.radiusRange.value = String(appState.appearance.radius);
	dom.spacingRange.value = String(appState.appearance.spacing);
	dom.shadowRange.value = String(appState.appearance.shadow);

	updateSliderOutputs();
	renderLogoPreview();
	renderServicesInputs();
	renderSocialInputs();
}

/**
 * Refreshes template dropdown with built-in and locally stored custom templates.
 */
function refreshTemplateSelect(selectedId = null) {
	const allTemplates = getAllTemplates();
	const builtinTemplates = allTemplates.filter((item) => item.kind === "builtin");
	const customTemplates = allTemplates.filter((item) => item.kind === "custom");

	const fallbackSelection = selectedId || dom.templateSelect.value || builtinTemplates[0]?.id;
	dom.templateSelect.innerHTML = "";

	const builtinGroup = document.createElement("optgroup");
	builtinGroup.label = "Built-in";
	builtinTemplates.forEach((item) => {
		const option = document.createElement("option");
		option.value = item.id;
		option.textContent = item.name;
		builtinGroup.append(option);
	});
	dom.templateSelect.append(builtinGroup);

	const customGroup = document.createElement("optgroup");
	customGroup.label = "Saved";
	if (!customTemplates.length) {
		const empty = document.createElement("option");
		empty.value = "";
		empty.disabled = true;
		empty.textContent = "No saved templates";
		customGroup.append(empty);
	} else {
		customTemplates.forEach((item) => {
			const option = document.createElement("option");
			option.value = item.id;
			option.textContent = item.name;
			customGroup.append(option);
		});
	}
	dom.templateSelect.append(customGroup);

	if (fallbackSelection && Array.from(dom.templateSelect.options).some((option) => option.value === fallbackSelection)) {
		dom.templateSelect.value = fallbackSelection;
	} else if (builtinTemplates[0]) {
		dom.templateSelect.value = builtinTemplates[0].id;
	}
}

function applyTemplate(templateId) {
	const template = findTemplateById(templateId);
	if (!template) {
		notify("Template not found.", "error");
		return;
	}

	appState = normalizeState(template.state);
	appState.meta.activeTemplateName = template.name;
	dom.templateNameInput.value = template.name;
	syncFormFromState();
	renderPreview(dom.previewFrame, appState);
	notify(`Template loaded: ${template.name}`);
}

function updatePreviewScale() {
	const preset = DEVICE_PRESETS[activeDevice];
	const viewportWidth = Math.max(dom.previewViewport.clientWidth - 6, 300);
	const viewportHeight = Math.max(dom.previewViewport.clientHeight - 6, 240);
	const scale = Math.min(1, viewportWidth / preset.width, viewportHeight / preset.height);

	dom.previewFrameWrap.style.width = `${Math.round(preset.width * scale)}px`;
	dom.previewFrameWrap.style.height = `${Math.round(preset.height * scale)}px`;
	dom.previewFrame.style.width = `${preset.width}px`;
	dom.previewFrame.style.height = `${preset.height}px`;
	dom.previewFrame.style.transform = `scale(${scale})`;
	dom.previewFrame.style.transformOrigin = "top left";
}

function setDevice(deviceName) {
	if (!DEVICE_PRESETS[deviceName]) {
		return;
	}
	activeDevice = deviceName;
	dom.deviceButtons.forEach((button) => {
		button.classList.toggle("active", button.dataset.device === deviceName);
	});
	updatePreviewScale();
}

function bindEditorEvents() {
	dom.mobileEditorToggle.addEventListener("click", () => {
		if (dom.appShell.classList.contains("editor-open")) {
			closeEditorPanel();
			return;
		}
		openEditorPanel();
	});

	dom.editorBackdrop.addEventListener("click", closeEditorPanel);

	dom.companyName.addEventListener("input", (event) => {
		appState.company.name = event.target.value;
		previewUpdate();
	});

	dom.companyTagline.addEventListener("input", (event) => {
		appState.company.tagline = event.target.value;
		previewUpdate();
	});

	dom.companyDescription.addEventListener("input", (event) => {
		appState.company.description = event.target.value;
		previewUpdate();
	});

	dom.contactEmail.addEventListener("input", (event) => {
		appState.company.contact.email = event.target.value;
		previewUpdate();
	});

	dom.contactPhone.addEventListener("input", (event) => {
		appState.company.contact.phone = event.target.value;
		previewUpdate();
	});

	dom.contactAddress.addEventListener("input", (event) => {
		appState.company.contact.address = event.target.value;
		previewUpdate();
	});

	dom.addServiceBtn.addEventListener("click", () => {
		appState.company.services.push("");
		renderServicesInputs();
		previewUpdate();
	});

	dom.addSocialBtn.addEventListener("click", () => {
		appState.company.socials.push({ id: uid(), icon: "website", url: "" });
		renderSocialInputs();
		previewUpdate();
	});

	dom.logoUpload.addEventListener("change", async (event) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		try {
			appState.company.logoDataUrl = await fileToDataUrl(file);
			appState.company.logoName = file.name;
			renderLogoPreview();
			previewUpdate();
			notify("Logo loaded.");
		} catch (error) {
			notify(error.message || "Unable to load logo.", "error");
		}
	});

	dom.removeLogoBtn.addEventListener("click", () => {
		appState.company.logoDataUrl = "";
		appState.company.logoName = "";
		dom.logoUpload.value = "";
		renderLogoPreview();
		previewUpdate();
	});

	dom.colorBackground.addEventListener("input", (event) => {
		appState.appearance.colors.background = event.target.value;
		previewUpdate();
	});

	dom.colorText.addEventListener("input", (event) => {
		appState.appearance.colors.text = event.target.value;
		previewUpdate();
	});

	dom.colorAccent.addEventListener("input", (event) => {
		appState.appearance.colors.accent = event.target.value;
		previewUpdate();
	});

	dom.fontFamily.addEventListener("change", (event) => {
		appState.appearance.fontFamily = event.target.value;
		previewUpdate();
	});

	dom.layoutVariant.addEventListener("change", (event) => {
		appState.appearance.layout = event.target.value;
		previewUpdate();
	});

	dom.toggleAbout.addEventListener("change", (event) => {
		appState.appearance.toggles.about = event.target.checked;
		previewUpdate();
	});

	dom.toggleServices.addEventListener("change", (event) => {
		appState.appearance.toggles.services = event.target.checked;
		previewUpdate();
	});

	dom.toggleContact.addEventListener("change", (event) => {
		appState.appearance.toggles.contact = event.target.checked;
		previewUpdate();
	});

	dom.radiusRange.addEventListener("input", (event) => {
		appState.appearance.radius = Number(event.target.value);
		updateSliderOutputs();
		previewUpdate();
	});

	dom.spacingRange.addEventListener("input", (event) => {
		appState.appearance.spacing = Number(event.target.value);
		updateSliderOutputs();
		previewUpdate();
	});

	dom.shadowRange.addEventListener("input", (event) => {
		appState.appearance.shadow = Number(event.target.value);
		updateSliderOutputs();
		previewUpdate();
	});

	dom.applyTemplateBtn.addEventListener("click", () => {
		if (!dom.templateSelect.value) {
			return;
		}
		applyTemplate(dom.templateSelect.value);
	});

	dom.saveTemplateBtn.addEventListener("click", () => {
		const selectedId = dom.templateSelect.value;
		const templateName =
			dom.templateNameInput.value.trim() ||
			appState.meta.activeTemplateName ||
			appState.company.name ||
			"Custom Template";
		const existingCustomId = selectedId.startsWith("custom-") ? selectedId : null;
		const saved = saveCustomTemplate(templateName, appState, existingCustomId);
		dom.templateNameInput.value = saved.name;
		refreshTemplateSelect(saved.id);
		notify(`Template saved: ${saved.name}`);
	});

	dom.deleteTemplateBtn.addEventListener("click", () => {
		const selectedId = dom.templateSelect.value;
		if (!selectedId || !selectedId.startsWith("custom-")) {
			notify("Select a saved custom template to delete.", "error");
			return;
		}

		if (!window.confirm("Delete selected custom template?")) {
			return;
		}

		const deleted = deleteCustomTemplate(selectedId);
		if (deleted) {
			refreshTemplateSelect("builtin-modern-corporate");
			notify("Template deleted.");
		}
	});

	dom.exportTemplateBtn.addEventListener("click", () => {
		exportJsonTemplateFile(appState, dom.templateNameInput.value || appState.company.name);
		notify("Template JSON exported.");
	});

	dom.importTemplateBtn.addEventListener("click", () => {
		dom.templateImportInput.click();
	});

	dom.templateImportInput.addEventListener("change", async (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) {
			return;
		}

		try {
			const imported = await importTemplateFromFile(file);
			const saved = saveCustomTemplate(imported.name, imported.state);
			refreshTemplateSelect(saved.id);
			applyTemplate(saved.id);
			notify(`Template imported: ${saved.name}`);
		} catch (error) {
			notify(error.message || "Unable to import template.", "error");
		}
	});

	dom.exportHtmlBtn.addEventListener("click", () => {
		runWithBusyButton(dom.exportHtmlBtn, "Exporting...", async () => {
			exportHtmlFile(appState);
			notify("HTML export complete.");
		}).catch((error) => {
			notify(error.message || "HTML export failed.", "error");
		});
	});

	dom.exportZipBtn.addEventListener("click", () => {
		runWithBusyButton(dom.exportZipBtn, "Packaging...", async () => {
			await exportZipFile(appState);
			notify("ZIP export complete.");
		}).catch((error) => {
			notify(error.message || "ZIP export failed.", "error");
		});
	});

	dom.exportPngBtn.addEventListener("click", () => {
		runWithBusyButton(dom.exportPngBtn, "Rendering...", async () => {
			await exportPngFile(appState);
			notify("PNG export complete.");
		}).catch((error) => {
			notify(error.message || "PNG export failed.", "error");
		});
	});

	dom.exportJsonBtn.addEventListener("click", () => {
		exportJsonTemplateFile(appState, dom.templateNameInput.value || appState.company.name);
		notify("JSON template exported.");
	});

	dom.deviceButtons.forEach((button) => {
		button.addEventListener("click", () => {
			setDevice(button.dataset.device);
		});
	});

	window.addEventListener("resize", scalePreviewDebounced);
}

function initialize() {
	populateStaticSelectOptions();
	refreshTemplateSelect("builtin-modern-corporate");
	syncFormFromState();
	bindEditorEvents();
	renderPreview(dom.previewFrame, appState);
	setDevice("desktop");

	if (window.ResizeObserver) {
		const observer = new ResizeObserver(() => {
			updatePreviewScale();
		});
		observer.observe(dom.previewViewport);
	}
}

initialize();
