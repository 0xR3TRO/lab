/**
 * Export module.
 * Handles HTML, ZIP, PNG, and JSON template file generation entirely in the browser.
 */

import { createTemplateExportPayload } from "./templates.js";
import { buildExternalCssHtml, buildProfileCss, buildProfileMarkup, buildStandaloneHtml } from "./preview.js";
import {
	dataUrlToFileParts,
	downloadBlob,
	downloadText,
	getSocialIconAssets,
	loadExternalScript,
	slugify,
} from "./utils.js";

// Self-hosted copies (MIT) — see THIRD_PARTY_NOTICES.md
const HTML2CANVAS_URL = "../../shared/vendor/html2canvas/html2canvas.min.js";
const JSZIP_URL = "../../shared/vendor/jszip/jszip.min.js";

function getBaseFileName(state) {
	const name = state.company.name || "business-profile";
	return slugify(name);
}

export function exportHtmlFile(state) {
	const html = buildStandaloneHtml(state);
	const fileName = `${getBaseFileName(state)}.html`;
	downloadText(html, fileName, "text/html;charset=utf-8");
}

/**
 * Creates a zip package with split HTML/CSS files and image/icon assets.
 */
export async function exportZipFile(state) {
	await loadExternalScript(JSZIP_URL, "JSZip");
	const zip = new window.JSZip();
	const rootFolder = zip.folder("pagemint-business");

	let logoPath = "";
	if (state.company.logoDataUrl) {
		const logoFile = dataUrlToFileParts(state.company.logoDataUrl);
		logoPath = `assets/logo.${logoFile.extension}`;
		rootFolder.file(logoPath, logoFile.blob);
	}

	const html = buildExternalCssHtml(state, "styles.css", {
		logoSource: logoPath || undefined,
	});
	const css = buildProfileCss(state);

	rootFolder.file("index.html", html);
	rootFolder.file("styles.css", css);

	const iconFolder = rootFolder.folder("assets/icons");
	const iconMap = getSocialIconAssets();
	for (const [iconName, svgMarkup] of Object.entries(iconMap)) {
		iconFolder.file(`${iconName}.svg`, svgMarkup);
	}

	const zipBlob = await zip.generateAsync({ type: "blob" });
	downloadBlob(zipBlob, `${getBaseFileName(state)}.zip`);
}

/**
 * Captures the generated page as a high-resolution PNG via html2canvas.
 */
export async function exportPngFile(state) {
	await loadExternalScript(HTML2CANVAS_URL, "html2canvas");

	const mount = document.createElement("div");
	mount.style.position = "fixed";
	mount.style.left = "-100000px";
	mount.style.top = "0";
	mount.style.width = "1360px";
	mount.style.height = "960px";
	mount.style.overflow = "hidden";
	mount.style.background = "transparent";

	mount.innerHTML = `<style>${buildProfileCss(state)}</style>${buildProfileMarkup(state)}`;
	document.body.append(mount);

	try {
		const targetNode = mount.querySelector(".pm-page");
		const canvas = await window.html2canvas(targetNode, {
			scale: 2,
			backgroundColor: null,
			logging: false,
			useCORS: true,
		});

		const pngBlob = await new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
					return;
				}
				reject(new Error("Unable to create PNG image."));
			}, "image/png");
		});

		downloadBlob(pngBlob, `${getBaseFileName(state)}.png`);
	} finally {
		mount.remove();
	}
}

export function exportJsonTemplateFile(state, templateName) {
	const payload = createTemplateExportPayload(state, templateName || state.company.name);
	downloadText(
		JSON.stringify(payload, null, 2),
		`${slugify(payload.template.name)}.template.json`,
		"application/json;charset=utf-8",
	);
}
