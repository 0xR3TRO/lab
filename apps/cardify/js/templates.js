/**
 * templates.js
 * Default templates and localStorage persistence for user-created card templates.
 */

import { createId, deepClone } from './utils.js';

/**
 * localStorage key used for persisted custom templates.
 * @type {string}
 */
const STORAGE_KEY = 'cardify.creator.templates.v1';

/**
 * Built-in starter templates available in every session.
 * @type {Array<{id: string, name: string, badge: string, state: object}>}
 */
export const DEFAULT_TEMPLATES = [
  {
    id: 'starter_minimal',
    name: 'Minimal',
    badge: '⬜',
    state: {
      firstName: 'Nina',
      lastName: 'Park',
      profession: 'UI Designer',
      bio: 'Designing clear, practical interfaces for complex products.',
      photoDataUrl: '',
      socialLinks: [
        { id: 'minimal_linkedin', platform: 'linkedin', url: 'https://linkedin.com' }
      ],
      layout: 'vertical',
      iconStyle: 'minimal',
      fontFamily: 'Manrope',
      backgroundColor: '#f7fbff',
      textColor: '#182334',
      accentColor: '#1d4ed8',
      borderRadius: 12,
      shadowLevel: 1,
      spacing: 20
    }
  },
  {
    id: 'starter_modern',
    name: 'Modern',
    badge: '🟦',
    state: {
      firstName: 'Leo',
      lastName: 'Gomez',
      profession: 'Full-Stack Developer',
      bio: 'Shipping maintainable products from API layer to polished UI.',
      photoDataUrl: '',
      socialLinks: [
        { id: 'modern_github', platform: 'github', url: 'https://github.com' },
        { id: 'modern_linkedin', platform: 'linkedin', url: 'https://linkedin.com' }
      ],
      layout: 'horizontal',
      iconStyle: 'filled',
      fontFamily: 'Space Grotesk',
      backgroundColor: '#f3f9ff',
      textColor: '#12263a',
      accentColor: '#0ea5e9',
      borderRadius: 20,
      shadowLevel: 2,
      spacing: 24
    }
  },
  {
    id: 'starter_bold',
    name: 'Bold',
    badge: '🟠',
    state: {
      firstName: 'Ari',
      lastName: 'Hunter',
      profession: 'Creative Director',
      bio: 'Building memorable campaigns and product stories with visual edge.',
      photoDataUrl: '',
      socialLinks: [
        { id: 'bold_instagram', platform: 'instagram', url: 'https://instagram.com' },
        { id: 'bold_tiktok', platform: 'tiktok', url: 'https://tiktok.com' }
      ],
      layout: 'horizontal',
      iconStyle: 'outline',
      fontFamily: 'Sora',
      backgroundColor: '#fff8f1',
      textColor: '#2e2013',
      accentColor: '#f97316',
      borderRadius: 28,
      shadowLevel: 3,
      spacing: 26
    }
  },
  {
    id: 'starter_elegant',
    name: 'Elegant',
    badge: '✨',
    state: {
      firstName: 'Clara',
      lastName: 'Voss',
      profession: 'Brand Strategist',
      bio: 'Crafting premium narratives and identity systems for ambitious teams.',
      photoDataUrl: '',
      socialLinks: [
        { id: 'elegant_linkedin', platform: 'linkedin', url: 'https://linkedin.com' },
        { id: 'elegant_youtube', platform: 'youtube', url: 'https://youtube.com' }
      ],
      layout: 'compact',
      iconStyle: 'minimal',
      fontFamily: 'Playfair Display',
      backgroundColor: '#fffdf8',
      textColor: '#2f2a25',
      accentColor: '#b7791f',
      borderRadius: 18,
      shadowLevel: 2,
      spacing: 22
    }
  }
];

/**
 * Loads persisted templates from localStorage.
 * @returns {Array<{id: string, name: string, badge: string, state: object}>}
 */
export function getSavedTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Writes persisted templates to localStorage.
 * @param {Array<{id: string, name: string, badge: string, state: object}>} templates - Templates to persist.
 */
export function setSavedTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

/**
 * Creates and persists a new user template snapshot.
 * @param {string} name - User label for the template.
 * @param {object} state - Current editor state snapshot.
 * @returns {{id: string, name: string, badge: string, state: object}}
 */
export function saveTemplateSnapshot(name, state) {
  const savedTemplates = getSavedTemplates();
  const template = {
    id: createId('template'),
    name,
    badge: '💾',
    state: deepClone(state)
  };

  savedTemplates.unshift(template);
  setSavedTemplates(savedTemplates);
  return template;
}

/**
 * Removes a persisted template by identifier.
 * @param {string} templateId - Template identifier.
 */
export function deleteSavedTemplate(templateId) {
  const filtered = getSavedTemplates().filter((template) => template.id !== templateId);
  setSavedTemplates(filtered);
}

/**
 * Builds a serializable payload for template export.
 * @param {Array<{id: string, name: string, badge: string, state: object}>} templates - Templates to export.
 * @returns {{version: number, exportedAt: string, templates: Array<{id: string, name: string, badge: string, state: object}>}}
 */
export function buildTemplateExportPayload(templates) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    templates: deepClone(templates)
  };
}

/**
 * Parses and validates imported templates payload.
 * @param {string} fileText - Raw JSON text from upload.
 * @returns {Array<{id: string, name: string, badge: string, state: object}>}
 */
export function parseTemplateImportPayload(fileText) {
  const parsed = JSON.parse(fileText);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && Array.isArray(parsed.templates)) {
    return parsed.templates;
  }

  throw new Error('Invalid template payload.');
}
