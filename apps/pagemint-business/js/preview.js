/**
 * Preview and page-generation module.
 * Produces the final business profile markup and CSS used by both preview and exports.
 */

import { escapeHtml, getSocialIconSvg, sanitizeUrl } from "./utils.js";

function getShadowCss(shadowLevel) {
	const blur = 12 + Math.round((shadowLevel / 100) * 46);
	const spread = Math.round((shadowLevel / 100) * 8);
	const alpha = 0.08 + (shadowLevel / 100) * 0.2;
	return `0 12px ${blur}px ${spread}px rgba(15, 23, 42, ${alpha.toFixed(3)})`;
}

function renderAboutSection(state) {
	if (!state.appearance.toggles.about) {
		return "";
	}

	return `
		<section class="pm-section pm-about" id="about">
			<h2>About</h2>
			<p>${escapeHtml(state.company.description)}</p>
		</section>
	`;
}

function renderServicesSection(state) {
	if (!state.appearance.toggles.services) {
		return "";
	}

	const services = state.company.services
		.filter((service) => String(service).trim())
		.map((service) => `<li>${escapeHtml(service)}</li>`)
		.join("");

	if (!services) {
		return "";
	}

	return `
		<section class="pm-section pm-services" id="services">
			<h2>Services</h2>
			<ul>${services}</ul>
		</section>
	`;
}

function renderContactSection(state) {
	if (!state.appearance.toggles.contact) {
		return "";
	}

	const email = String(state.company.contact.email || "").trim();
	const phone = String(state.company.contact.phone || "").trim();
	const address = String(state.company.contact.address || "").trim();

	const contactItems = [
		email
			? `<li><strong>Email</strong><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></li>`
			: "",
		phone
			? `<li><strong>Phone</strong><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></li>`
			: "",
		address ? `<li><strong>Address</strong><span>${escapeHtml(address)}</span></li>` : "",
	]
		.filter(Boolean)
		.join("");

	const socialLinks = state.company.socials
		.filter((item) => String(item.url || "").trim())
		.map((item) => {
			const iconMarkup = getSocialIconSvg(item.icon);
			const href = sanitizeUrl(item.url);
			const iconLabel =
				item.icon === "x" ? "X / Twitter" : `${item.icon.charAt(0).toUpperCase()}${item.icon.slice(1)}`;
			return `
				<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(iconLabel)}">
					<span class="pm-social-icon">${iconMarkup}</span>
				</a>
			`;
		})
		.join("");

	if (!contactItems && !socialLinks) {
		return "";
	}

	return `
		<section class="pm-section pm-contact" id="contact">
			<h2>Contact</h2>
			${contactItems ? `<ul class="pm-contact-list">${contactItems}</ul>` : ""}
			${socialLinks ? `<div class="pm-social-links">${socialLinks}</div>` : ""}
		</section>
	`;
}

function renderLogo(state, logoSource) {
	const logo = logoSource || state.company.logoDataUrl;
	if (!logo) {
		return "";
	}
	return `<img class="pm-logo" src="${escapeHtml(logo)}" alt="${escapeHtml(state.company.name)} logo" />`;
}

/**
 * Returns the core website markup that appears inside preview and exported files.
 */
export function buildProfileMarkup(state, options = {}) {
	const layoutClass = `pm-layout-${state.appearance.layout}`;
	const logoMarkup = renderLogo(state, options.logoSource);
	const aboutSection = renderAboutSection(state);
	const servicesSection = renderServicesSection(state);
	const contactSection = renderContactSection(state);

	return `
		<div class="pm-page ${layoutClass}">
			<div class="pm-shell">
				<div class="pm-body-grid">
					<header class="pm-hero">
						${logoMarkup}
						<p class="pm-eyebrow">Business Profile</p>
						<h1>${escapeHtml(state.company.name)}</h1>
						<p class="pm-tagline">${escapeHtml(state.company.tagline)}</p>
					</header>
					<main class="pm-main-content">
						${aboutSection}
						${servicesSection}
						${contactSection}
					</main>
				</div>
				<footer class="pm-footer">
					<span>${escapeHtml(state.company.name)}</span>
					<span>Generated with PageMint Business</span>
				</footer>
			</div>
		</div>
	`;
}

/**
 * Generates website-specific CSS from current customization settings.
 */
export function buildProfileCss(state) {
	const shadowCss = getShadowCss(state.appearance.shadow);
	return `
		:root {
			--pm-bg: ${state.appearance.colors.background};
			--pm-text: ${state.appearance.colors.text};
			--pm-accent: ${state.appearance.colors.accent};
			--pm-font: ${state.appearance.fontFamily};
			--pm-radius: ${state.appearance.radius}px;
			--pm-space: ${state.appearance.spacing}px;
			--pm-shadow: ${shadowCss};
		}

		* { box-sizing: border-box; }

		html, body {
			margin: 0;
			padding: 0;
			min-height: 100%;
			background:
				radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--pm-accent), transparent 78%), transparent 35%),
				radial-gradient(circle at 100% 20%, color-mix(in srgb, var(--pm-accent), transparent 84%), transparent 38%),
				var(--pm-bg);
			color: var(--pm-text);
			font-family: var(--pm-font);
		}

		a {
			color: inherit;
			text-decoration: none;
		}

		.pm-page {
			min-height: 100vh;
			display: grid;
			place-items: center;
			padding: clamp(18px, 3vw, 40px);
			transition: all 260ms ease;
		}

		.pm-shell {
			width: min(1100px, 100%);
			background: color-mix(in srgb, var(--pm-bg), #ffffff 9%);
			border: 1px solid color-mix(in srgb, var(--pm-accent), transparent 70%);
			border-radius: calc(var(--pm-radius) + 6px);
			box-shadow: var(--pm-shadow);
			overflow: hidden;
			backdrop-filter: blur(4px);
			transition: all 260ms ease;
		}

		.pm-body-grid {
			display: grid;
			grid-template-columns: 1fr;
			gap: calc(var(--pm-space) * 0.85);
			padding: var(--pm-space);
		}

		.pm-hero {
			padding: calc(var(--pm-space) * 0.9);
			border-radius: var(--pm-radius);
			background:
				linear-gradient(
					140deg,
					color-mix(in srgb, var(--pm-accent), transparent 70%),
					color-mix(in srgb, var(--pm-accent), transparent 88%)
				),
				transparent;
			border: 1px solid color-mix(in srgb, var(--pm-accent), transparent 66%);
			transition: all 260ms ease;
		}

		.pm-logo {
			max-width: 180px;
			max-height: 84px;
			object-fit: contain;
			display: block;
			margin-bottom: 1rem;
		}

		.pm-eyebrow {
			margin: 0;
			font-size: 0.78rem;
			font-weight: 700;
			letter-spacing: 0.1em;
			text-transform: uppercase;
			opacity: 0.86;
		}

		.pm-hero h1 {
			margin: 0.4rem 0 0;
			font-size: clamp(1.7rem, 3.2vw, 2.7rem);
			line-height: 1.1;
		}

		.pm-tagline {
			margin: 0.7rem 0 0;
			font-size: clamp(1rem, 1.6vw, 1.22rem);
			opacity: 0.9;
			max-width: 62ch;
		}

		.pm-main-content {
			display: grid;
			gap: calc(var(--pm-space) * 0.65);
		}

		.pm-section {
			padding: calc(var(--pm-space) * 0.7);
			background: color-mix(in srgb, var(--pm-bg), #ffffff 7%);
			border: 1px solid color-mix(in srgb, var(--pm-accent), transparent 75%);
			border-radius: var(--pm-radius);
			transition: all 260ms ease;
		}

		.pm-section h2 {
			margin: 0 0 0.8rem;
			font-size: clamp(1.05rem, 1.4vw, 1.32rem);
			line-height: 1.2;
		}

		.pm-section p {
			margin: 0;
			line-height: 1.6;
			opacity: 0.95;
		}

		.pm-services ul {
			list-style: none;
			margin: 0;
			padding: 0;
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
			gap: 0.62rem;
		}

		.pm-services li {
			padding: 0.56rem 0.7rem;
			border-radius: calc(var(--pm-radius) * 0.66);
			background: color-mix(in srgb, var(--pm-accent), transparent 86%);
			border: 1px solid color-mix(in srgb, var(--pm-accent), transparent 72%);
			font-weight: 600;
		}

		.pm-contact-list {
			list-style: none;
			margin: 0;
			padding: 0;
			display: grid;
			gap: 0.52rem;
		}

		.pm-contact-list li {
			display: grid;
			grid-template-columns: 82px 1fr;
			gap: 0.75rem;
			align-items: baseline;
		}

		.pm-contact-list strong {
			opacity: 0.8;
		}

		.pm-contact-list a:hover {
			text-decoration: underline;
		}

		.pm-social-links {
			display: flex;
			gap: 0.52rem;
			margin-top: 0.92rem;
			flex-wrap: wrap;
		}

		.pm-social-links a {
			width: 38px;
			height: 38px;
			display: grid;
			place-items: center;
			border-radius: 999px;
			background: color-mix(in srgb, var(--pm-accent), transparent 82%);
			border: 1px solid color-mix(in srgb, var(--pm-accent), transparent 70%);
			transition: transform 180ms ease, background 180ms ease;
		}

		.pm-social-links a:hover {
			transform: translateY(-1px);
			background: color-mix(in srgb, var(--pm-accent), transparent 72%);
		}

		.pm-social-icon svg {
			width: 20px;
			height: 20px;
			display: block;
		}

		.pm-footer {
			display: flex;
			justify-content: space-between;
			gap: 1rem;
			font-size: 0.86rem;
			padding: 0 var(--pm-space) var(--pm-space);
			opacity: 0.8;
			flex-wrap: wrap;
		}

		.pm-layout-hero-side .pm-body-grid {
			grid-template-columns: minmax(290px, 0.95fr) minmax(0, 1.25fr);
			align-items: start;
		}

		.pm-layout-hero-side .pm-hero {
			position: sticky;
			top: 20px;
		}

		.pm-layout-minimal .pm-shell {
			border-radius: var(--pm-radius);
			background: color-mix(in srgb, var(--pm-bg), #ffffff 4%);
		}

		.pm-layout-minimal .pm-hero,
		.pm-layout-minimal .pm-section {
			background: transparent;
			border-color: color-mix(in srgb, var(--pm-text), transparent 84%);
		}

		.pm-layout-card-style .pm-shell {
			max-width: 980px;
			border-radius: calc(var(--pm-radius) + 10px);
		}

		.pm-layout-card-style .pm-body-grid {
			padding: calc(var(--pm-space) * 1.1);
			gap: calc(var(--pm-space) * 0.78);
		}

		.pm-layout-card-style .pm-section {
			background: color-mix(in srgb, #ffffff, var(--pm-bg) 10%);
		}

		@media (max-width: 900px) {
			.pm-layout-hero-side .pm-body-grid {
				grid-template-columns: 1fr;
			}

			.pm-layout-hero-side .pm-hero {
				position: static;
			}

			.pm-contact-list li {
				grid-template-columns: 1fr;
				gap: 0.2rem;
			}
		}
	`;
}

export function buildStandaloneHtml(state, options = {}) {
	const css = buildProfileCss(state);
	const markup = buildProfileMarkup(state, options);
	const title = escapeHtml(state.company.name || "Business Profile");
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${title}</title>
	<style>${css}</style>
</head>
<body>
${markup}
</body>
</html>`;
}

export function buildExternalCssHtml(state, cssHref = "styles.css", options = {}) {
	const title = escapeHtml(state.company.name || "Business Profile");
	const markup = buildProfileMarkup(state, options);
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${title}</title>
	<link rel="stylesheet" href="${escapeHtml(cssHref)}" />
</head>
<body>
${markup}
</body>
</html>`;
}

export function renderPreview(iframe, state) {
	iframe.srcdoc = buildStandaloneHtml(state);
}
