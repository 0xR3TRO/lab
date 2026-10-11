/**
 * editor.js
 * Editor orchestration: UI event binding, state management, template lifecycle, and live preview updates.
 */

import {
  createId,
  debounce,
  deepClone,
  downloadText,
  readFileAsDataUrl,
  showToast
} from './utils.js';
import {
  DEFAULT_TEMPLATES,
  buildTemplateExportPayload,
  deleteSavedTemplate,
  getSavedTemplates,
  parseTemplateImportPayload,
  saveTemplateSnapshot,
  setSavedTemplates
} from './templates.js';
import { SOCIAL_NETWORKS, createPreviewController } from './preview.js';
import { initExportSystem } from './export.js';

/**
 * UI theme preference storage key.
 * @type {string}
 */
const THEME_STORAGE_KEY = 'cardify.creator.ui-theme';

/**
 * Supported layout tokens.
 * @type {Array<'vertical'|'horizontal'|'compact'>}
 */
const SUPPORTED_LAYOUTS = ['vertical', 'horizontal', 'compact'];

/**
 * Supported icon style tokens.
 * @type {Array<'filled'|'outline'|'minimal'>}
 */
const SUPPORTED_ICON_STYLES = ['filled', 'outline', 'minimal'];

/**
 * UI labels for shadow slider values.
 * @type {Array<string>}
 */
const SHADOW_LABELS = ['None', 'Soft', 'Medium', 'Strong'];

/**
 * Base state used for first load and state normalization.
 * @type {object}
 */
const BASE_STATE = {
  firstName: 'Avery',
  lastName: 'Stone',
  profession: 'Product Engineer',
  bio: 'Building crisp interfaces and useful tooling for modern teams.',
  photoDataUrl: '',
  socialLinks: [
    { id: 'default_linkedin', platform: 'linkedin', url: 'https://linkedin.com' },
    { id: 'default_github', platform: 'github', url: 'https://github.com' }
  ],
  layout: 'vertical',
  iconStyle: 'filled',
  fontFamily: 'Space Grotesk',
  backgroundColor: '#ffffff',
  textColor: '#14213d',
  accentColor: '#0d9488',
  borderRadius: 24,
  shadowLevel: 2,
  spacing: 24
};

/**
 * Mutable application state.
 * @type {any}
 */
let state = deepClone(BASE_STATE);

/**
 * Preview controller instance.
 * @type {{render: () => void, updateScale: () => void, getCardElement: () => HTMLElement} | null}
 */
let previewController = null;

/**
 * Cached DOM references.
 * @type {Record<string, any>}
 */
const dom = {};

/**
 * Initializes the full Cardify Creator app.
 */
export function initCardifyCreator() {
  cacheDom();
  bindThemeToggle();
  bindMobilePanelToggle();
  bindIdentityControls();
  bindSocialControls();
  bindAppearanceControls();
  bindTemplateControls();

  previewController = createPreviewController({
    cardElement: dom.cardPreview,
    stageElement: dom.previewStage,
    frameElement: dom.previewFrame,
    scaleLayerElement: dom.previewScaleLayer,
    getState: () => state
  });

  initExportSystem({
    getState: () => state,
    getCardElement: () => previewController ? previewController.getCardElement() : dom.cardPreview
  });

  syncUiFromState();
  renderStarterTemplates();
  renderSavedTemplates();
  renderPreview();
}

/**
 * Caches frequently used DOM nodes.
 */
function cacheDom() {
  dom.editorPanel = document.getElementById('editor-panel');
  dom.mobilePanelToggle = document.getElementById('mobile-panel-toggle');
  dom.themeToggle = document.getElementById('theme-toggle');

  dom.firstName = document.getElementById('first-name');
  dom.lastName = document.getElementById('last-name');
  dom.profession = document.getElementById('profession');
  dom.bio = document.getElementById('bio');

  dom.profilePhotoInput = document.getElementById('profile-photo');
  dom.uploadPhotoButton = document.getElementById('upload-photo');
  dom.removePhotoButton = document.getElementById('remove-photo');

  dom.socialRows = document.getElementById('social-rows');
  dom.addSocial = document.getElementById('add-social');

  dom.layoutControl = document.getElementById('layout-control');
  dom.iconStyleControl = document.getElementById('icon-style-control');
  dom.fontFamily = document.getElementById('font-family');
  dom.backgroundColor = document.getElementById('background-color');
  dom.textColor = document.getElementById('text-color');
  dom.accentColor = document.getElementById('accent-color');

  dom.borderRadius = document.getElementById('border-radius');
  dom.shadowLevel = document.getElementById('shadow-level');
  dom.spacingLevel = document.getElementById('spacing-level');

  dom.borderRadiusValue = document.getElementById('border-radius-value');
  dom.shadowLevelValue = document.getElementById('shadow-level-value');
  dom.spacingLevelValue = document.getElementById('spacing-level-value');

  dom.starterTemplates = document.getElementById('starter-templates');
  dom.savedTemplates = document.getElementById('saved-templates');
  dom.saveTemplate = document.getElementById('save-template');
  dom.exportTemplates = document.getElementById('export-templates');
  dom.importTemplates = document.getElementById('import-templates');
  dom.importTemplatesInput = document.getElementById('import-templates-input');

  dom.previewStage = document.getElementById('preview-stage');
  dom.previewFrame = document.getElementById('preview-frame');
  dom.previewScaleLayer = document.getElementById('preview-scale-layer');
  dom.cardPreview = document.getElementById('card-preview');
}

/**
 * Triggers preview redraw if preview controller is active.
 */
function renderPreview() {
  if (previewController) {
    previewController.render();
  }
}

/**
 * Applies current state values to the editor controls.
 */
function syncUiFromState() {
  dom.firstName.value = state.firstName;
  dom.lastName.value = state.lastName;
  dom.profession.value = state.profession;
  dom.bio.value = state.bio;
  dom.fontFamily.value = state.fontFamily;

  dom.backgroundColor.value = state.backgroundColor;
  dom.textColor.value = state.textColor;
  dom.accentColor.value = state.accentColor;

  dom.borderRadius.value = String(state.borderRadius);
  dom.shadowLevel.value = String(state.shadowLevel);
  dom.spacingLevel.value = String(state.spacing);

  dom.borderRadiusValue.textContent = `${state.borderRadius}px`;
  dom.shadowLevelValue.textContent = SHADOW_LABELS[state.shadowLevel] || SHADOW_LABELS[2];
  dom.spacingLevelValue.textContent = `${state.spacing}px`;

  setActiveSegment(dom.layoutControl, 'data-layout', state.layout);
  setActiveSegment(dom.iconStyleControl, 'data-icon-style', state.iconStyle);

  renderSocialRows();
}

/**
 * Sets active styling in segmented controls.
 * @param {HTMLElement} container - Segmented control container.
 * @param {'data-layout'|'data-icon-style'} attributeName - Segment attribute key.
 * @param {string} value - Selected value.
 */
function setActiveSegment(container, attributeName, value) {
  container.querySelectorAll('.segment').forEach((segmentButton) => {
    const isActive = segmentButton.getAttribute(attributeName) === value;
    segmentButton.classList.toggle('is-active', isActive);
  });
}

/**
 * Normalizes incoming state and applies it to editor + preview.
 * @param {any} incomingState - Raw template or import state.
 */
function applyIncomingState(incomingState) {
  const normalized = normalizeState(incomingState);
  state = normalized;
  syncUiFromState();
  renderPreview();
}

/**
 * Ensures an incoming state object fits the expected schema.
 * @param {any} incomingState - Raw state candidate.
 * @returns {any}
 */
function normalizeState(incomingState) {
  const merged = {
    ...deepClone(BASE_STATE),
    ...(incomingState || {})
  };

  merged.firstName = String(merged.firstName || '').slice(0, 80);
  merged.lastName = String(merged.lastName || '').slice(0, 80);
  merged.profession = String(merged.profession || '').slice(0, 120);
  merged.bio = String(merged.bio || '').slice(0, 400);

  merged.backgroundColor = normalizeColor(merged.backgroundColor, BASE_STATE.backgroundColor);
  merged.textColor = normalizeColor(merged.textColor, BASE_STATE.textColor);
  merged.accentColor = normalizeColor(merged.accentColor, BASE_STATE.accentColor);

  merged.borderRadius = clampNumber(merged.borderRadius, 0, 48, BASE_STATE.borderRadius);
  merged.shadowLevel = clampNumber(merged.shadowLevel, 0, 3, BASE_STATE.shadowLevel);
  merged.spacing = clampNumber(merged.spacing, 12, 42, BASE_STATE.spacing);

  merged.layout = SUPPORTED_LAYOUTS.includes(merged.layout) ? merged.layout : BASE_STATE.layout;
  merged.iconStyle = SUPPORTED_ICON_STYLES.includes(merged.iconStyle) ? merged.iconStyle : BASE_STATE.iconStyle;

  const validFonts = Array.from(dom.fontFamily.options).map((option) => option.value);
  merged.fontFamily = validFonts.includes(merged.fontFamily) ? merged.fontFamily : BASE_STATE.fontFamily;

  merged.photoDataUrl = typeof merged.photoDataUrl === 'string' ? merged.photoDataUrl : '';

  merged.socialLinks = normalizeSocialLinks(merged.socialLinks);
  if (merged.socialLinks.length === 0) {
    merged.socialLinks = [createEmptySocialLink()];
  }

  return merged;
}

/**
 * Validates and normalizes social link rows.
 * @param {any} socialLinks - Raw social link list.
 * @returns {Array<{id: string, platform: string, url: string}>}
 */
function normalizeSocialLinks(socialLinks) {
  if (!Array.isArray(socialLinks)) {
    return [];
  }

  return socialLinks
    .map((link) => {
      const platform = SOCIAL_NETWORKS.some((network) => network.id === link?.platform)
        ? link.platform
        : SOCIAL_NETWORKS[0].id;

      return {
        id: typeof link?.id === 'string' ? link.id : createId('social'),
        platform,
        url: typeof link?.url === 'string' ? link.url : ''
      };
    })
    .slice(0, 12);
}

/**
 * Creates a new blank social link model.
 * @returns {{id: string, platform: string, url: string}}
 */
function createEmptySocialLink() {
  return {
    id: createId('social'),
    platform: SOCIAL_NETWORKS[0].id,
    url: ''
  };
}

/**
 * Normalizes arbitrary color values to #RRGGBB fallback-safe values.
 * @param {any} value - Untrusted color candidate.
 * @param {string} fallback - Color fallback.
 * @returns {string}
 */
function normalizeColor(value, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback;
}

/**
 * Clamps a numeric value into an inclusive range.
 * @param {any} value - Raw number candidate.
 * @param {number} min - Minimum allowed value.
 * @param {number} max - Maximum allowed value.
 * @param {number} fallback - Fallback if value is invalid.
 * @returns {number}
 */
function clampNumber(value, min, max, fallback) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(numericValue)));
}

/**
 * Binds theme toggle behavior and persisted preference.
 */
function bindThemeToggle() {
  const documentElement = document.documentElement;
  const persistedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const initialTheme = persistedTheme === 'dark' ? 'dark' : 'light';

  documentElement.setAttribute('data-ui-theme', initialTheme);
  dom.themeToggle.textContent = initialTheme === 'dark' ? 'Light' : 'Dark';

  dom.themeToggle.addEventListener('click', () => {
    const currentTheme = documentElement.getAttribute('data-ui-theme') === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    documentElement.setAttribute('data-ui-theme', nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    dom.themeToggle.textContent = nextTheme === 'dark' ? 'Light' : 'Dark';
  });
}

/**
 * Binds mobile editor panel open/close logic.
 */
function bindMobilePanelToggle() {
  dom.mobilePanelToggle.addEventListener('click', () => {
    dom.editorPanel.classList.toggle('mobile-open');
  });

  dom.previewStage.addEventListener('click', () => {
    if (window.innerWidth <= 980) {
      dom.editorPanel.classList.remove('mobile-open');
    }
  });
}

/**
 * Binds profile text and photo controls.
 */
function bindIdentityControls() {
  const syncIdentity = debounce(() => {
    state.firstName = dom.firstName.value;
    state.lastName = dom.lastName.value;
    state.profession = dom.profession.value;
    state.bio = dom.bio.value;
    renderPreview();
  }, 45);

  dom.firstName.addEventListener('input', syncIdentity);
  dom.lastName.addEventListener('input', syncIdentity);
  dom.profession.addEventListener('input', syncIdentity);
  dom.bio.addEventListener('input', syncIdentity);

  dom.uploadPhotoButton.addEventListener('click', () => {
    dom.profilePhotoInput.click();
  });

  dom.profilePhotoInput.addEventListener('change', async () => {
    const file = dom.profilePhotoInput.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file.', 'error');
      return;
    }

    try {
      state.photoDataUrl = await readFileAsDataUrl(file);
      renderPreview();
      showToast('Profile photo updated.');
    } catch (error) {
      console.error(error);
      showToast('Photo upload failed.', 'error');
    }
  });

  dom.removePhotoButton.addEventListener('click', () => {
    state.photoDataUrl = '';
    dom.profilePhotoInput.value = '';
    renderPreview();
    showToast('Profile photo removed.');
  });
}

/**
 * Binds social link editor behavior.
 */
function bindSocialControls() {
  dom.addSocial.addEventListener('click', () => {
    state.socialLinks.push(createEmptySocialLink());
    renderSocialRows();
    renderPreview();
  });

  dom.socialRows.addEventListener('change', (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const row = target.closest('.social-row');
    if (!row) {
      return;
    }

    const linkId = row.getAttribute('data-link-id');
    const link = state.socialLinks.find((entry) => entry.id === linkId);
    if (!link) {
      return;
    }

    if (target instanceof HTMLSelectElement) {
      link.platform = target.value;
      const urlInput = /** @type {HTMLInputElement | null} */ (row.querySelector('input[type="url"]'));
      const network = SOCIAL_NETWORKS.find((entry) => entry.id === link.platform) || SOCIAL_NETWORKS[0];
      if (urlInput) {
        urlInput.placeholder = network.placeholder;
      }
    }

    if (target instanceof HTMLInputElement) {
      link.url = target.value;
    }

    renderPreview();
  });

  dom.socialRows.addEventListener('input', (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if (!(target instanceof HTMLInputElement) || target.type !== 'url') {
      return;
    }

    const row = target.closest('.social-row');
    if (!row) {
      return;
    }

    const linkId = row.getAttribute('data-link-id');
    const link = state.socialLinks.find((entry) => entry.id === linkId);
    if (!link) {
      return;
    }

    link.url = target.value;
    renderPreview();
  });

  dom.socialRows.addEventListener('click', (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const removeButton = target.closest('.social-remove');
    if (!removeButton) {
      return;
    }

    const row = removeButton.closest('.social-row');
    const linkId = row?.getAttribute('data-link-id');
    if (!linkId) {
      return;
    }

    state.socialLinks = state.socialLinks.filter((link) => link.id !== linkId);
    if (state.socialLinks.length === 0) {
      state.socialLinks.push(createEmptySocialLink());
    }

    renderSocialRows();
    renderPreview();
  });
}

/**
 * Renders social link rows into the editor panel.
 */
function renderSocialRows() {
  dom.socialRows.innerHTML = '';

  state.socialLinks.forEach((link) => {
    const row = document.createElement('div');
    const platformSelect = document.createElement('select');
    const urlInput = document.createElement('input');
    const removeButton = document.createElement('button');

    row.className = 'social-row';
    row.setAttribute('data-link-id', link.id);

    SOCIAL_NETWORKS.forEach((network) => {
      const option = document.createElement('option');
      option.value = network.id;
      option.textContent = network.label;
      option.selected = network.id === link.platform;
      platformSelect.append(option);
    });
    platformSelect.className = 'field-input';

    const selectedNetwork = SOCIAL_NETWORKS.find((network) => network.id === link.platform) || SOCIAL_NETWORKS[0];

    urlInput.type = 'url';
    urlInput.className = 'field-input';
    urlInput.placeholder = selectedNetwork.placeholder;
    urlInput.value = link.url;

    removeButton.type = 'button';
    removeButton.className = 'social-remove';
    removeButton.textContent = '×';
    removeButton.title = 'Remove social link';

    row.append(platformSelect, urlInput, removeButton);
    dom.socialRows.append(row);
  });
}

/**
 * Binds appearance controls for layout, colors, font, spacing, and depth.
 */
function bindAppearanceControls() {
  dom.layoutControl.addEventListener('click', (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const segment = target.closest('[data-layout]');
    if (!segment) {
      return;
    }

    const layout = segment.getAttribute('data-layout');
    if (!layout || !SUPPORTED_LAYOUTS.includes(layout)) {
      return;
    }

    state.layout = layout;
    setActiveSegment(dom.layoutControl, 'data-layout', layout);
    renderPreview();
  });

  dom.iconStyleControl.addEventListener('click', (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const segment = target.closest('[data-icon-style]');
    if (!segment) {
      return;
    }

    const iconStyle = segment.getAttribute('data-icon-style');
    if (!iconStyle || !SUPPORTED_ICON_STYLES.includes(iconStyle)) {
      return;
    }

    state.iconStyle = iconStyle;
    setActiveSegment(dom.iconStyleControl, 'data-icon-style', iconStyle);
    renderPreview();
  });

  dom.fontFamily.addEventListener('change', () => {
    state.fontFamily = dom.fontFamily.value;
    renderPreview();
  });

  dom.backgroundColor.addEventListener('input', () => {
    state.backgroundColor = dom.backgroundColor.value;
    renderPreview();
  });

  dom.textColor.addEventListener('input', () => {
    state.textColor = dom.textColor.value;
    renderPreview();
  });

  dom.accentColor.addEventListener('input', () => {
    state.accentColor = dom.accentColor.value;
    renderPreview();
  });

  dom.borderRadius.addEventListener('input', () => {
    state.borderRadius = clampNumber(dom.borderRadius.value, 0, 48, BASE_STATE.borderRadius);
    dom.borderRadiusValue.textContent = `${state.borderRadius}px`;
    renderPreview();
  });

  dom.shadowLevel.addEventListener('input', () => {
    state.shadowLevel = clampNumber(dom.shadowLevel.value, 0, 3, BASE_STATE.shadowLevel);
    dom.shadowLevelValue.textContent = SHADOW_LABELS[state.shadowLevel] || SHADOW_LABELS[2];
    renderPreview();
  });

  dom.spacingLevel.addEventListener('input', () => {
    state.spacing = clampNumber(dom.spacingLevel.value, 12, 42, BASE_STATE.spacing);
    dom.spacingLevelValue.textContent = `${state.spacing}px`;
    renderPreview();
  });
}

/**
 * Binds template save/load/import/export controls.
 */
function bindTemplateControls() {
  dom.saveTemplate.addEventListener('click', () => {
    const nameInput = window.prompt('Template name', `${state.firstName} ${state.lastName}`.trim() || 'My Template');
    if (nameInput === null) {
      return;
    }

    const name = (nameInput.trim() || 'My Template').slice(0, 60);
    saveTemplateSnapshot(name, state);
    renderSavedTemplates();
    showToast('Template saved.');
  });

  dom.exportTemplates.addEventListener('click', () => {
    const payload = buildTemplateExportPayload(getSavedTemplates());
    downloadText(
      JSON.stringify(payload, null, 2),
      'cardify-templates.json',
      'application/json;charset=utf-8'
    );
    showToast('Template pack exported.');
  });

  dom.importTemplates.addEventListener('click', () => {
    dom.importTemplatesInput.click();
  });

  dom.importTemplatesInput.addEventListener('change', async () => {
    const file = dom.importTemplatesInput.files?.[0];
    if (!file) {
      return;
    }

    try {
      const rawText = await file.text();
      const importedPayload = parseTemplateImportPayload(rawText);
      const normalizedImports = importedPayload
        .map((entry, index) => normalizeImportedTemplate(entry, index))
        .filter(Boolean);

      const mergedTemplates = [...normalizedImports, ...getSavedTemplates()];
      setSavedTemplates(mergedTemplates);
      renderSavedTemplates();
      showToast(`Imported ${normalizedImports.length} template(s).`);
    } catch (error) {
      console.error(error);
      showToast('Template import failed.', 'error');
    } finally {
      dom.importTemplatesInput.value = '';
    }
  });
}

/**
 * Normalizes imported template entry shape.
 * @param {any} entry - Imported template candidate.
 * @param {number} index - Entry index for fallback naming.
 * @returns {{id: string, name: string, badge: string, state: object} | null}
 */
function normalizeImportedTemplate(entry, index) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const stateCandidate = entry.state || entry;
  const normalizedState = normalizeState(stateCandidate);

  return {
    id: typeof entry.id === 'string' ? entry.id : createId('imported'),
    name: String(entry.name || `Imported Template ${index + 1}`).slice(0, 60),
    badge: typeof entry.badge === 'string' ? entry.badge : '📥',
    state: normalizedState
  };
}

/**
 * Renders built-in starter template cards.
 */
function renderStarterTemplates() {
  dom.starterTemplates.innerHTML = '';

  DEFAULT_TEMPLATES.forEach((template) => {
    const card = createTemplateCard(template, false);
    dom.starterTemplates.append(card);
  });
}

/**
 * Renders user-saved template cards.
 */
function renderSavedTemplates() {
  const savedTemplates = getSavedTemplates();
  dom.savedTemplates.innerHTML = '';

  if (savedTemplates.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'template-empty';
    emptyMessage.textContent = 'No saved templates yet.';
    dom.savedTemplates.append(emptyMessage);
    return;
  }

  savedTemplates.forEach((template) => {
    const card = createTemplateCard(template, true);
    dom.savedTemplates.append(card);
  });
}

/**
 * Creates a clickable template card element.
 * @param {{id: string, name: string, badge: string, state: object}} template - Template data.
 * @param {boolean} isDeletable - Whether delete action should be available.
 * @returns {HTMLElement}
 */
function createTemplateCard(template, isDeletable) {
  const card = document.createElement('button');
  const badge = document.createElement('div');
  const name = document.createElement('div');

  card.type = 'button';
  card.className = 'template-card';
  card.title = template.name;

  badge.className = 'template-thumb';
  badge.textContent = template.badge;

  name.className = 'template-name';
  name.textContent = template.name;

  card.append(badge, name);

  card.addEventListener('click', () => {
    applyIncomingState(template.state);
    showToast(`Loaded template: ${template.name}`);
  });

  if (isDeletable) {
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'template-delete';
    deleteButton.textContent = '×';
    deleteButton.title = 'Delete template';

    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteSavedTemplate(template.id);
      renderSavedTemplates();
      showToast('Template deleted.');
    });

    card.append(deleteButton);
  }

  return card;
}
