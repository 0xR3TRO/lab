/**
 * utils.js
 * Shared utility helpers used by editor, preview, export, and template modules.
 */

/**
 * Creates a short unique identifier string.
 * @param {string} prefix - Optional prefix to make IDs easier to inspect.
 * @returns {string}
 */
export function createId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

/**
 * Produces a deep clone for JSON-serializable data.
 * @template T
 * @param {T} value - Source value.
 * @returns {T}
 */
export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Returns a debounced wrapper function.
 * @template {(...args: any[]) => void} T
 * @param {T} callback - Function to debounce.
 * @param {number} waitMs - Debounce delay in milliseconds.
 * @returns {(...args: Parameters<T>) => void}
 */
export function debounce(callback, waitMs) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), waitMs);
  };
}

/**
 * Reads an uploaded file as a base64 data URL.
 * @param {File} file - File selected in the browser.
 * @returns {Promise<string>}
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Downloads a Blob as a local file.
 * @param {Blob} blob - File data.
 * @param {string} filename - Download filename.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Downloads plain text as a local file.
 * @param {string} content - Text content.
 * @param {string} filename - Download filename.
 * @param {string} mimeType - Text mime type.
 */
export function downloadText(content, filename, mimeType = 'text/plain;charset=utf-8') {
  downloadBlob(new Blob([content], { type: mimeType }), filename);
}

/**
 * Sanitizes text for usage in filenames.
 * @param {string} input - Untrusted filename fragment.
 * @returns {string}
 */
export function toSafeFilename(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'cardify-card';
}

/**
 * Escapes HTML entities for safe text interpolation.
 * @param {string} value - Raw text value.
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes XML entities for SVG text nodes.
 * @param {string} value - Raw text value.
 * @returns {string}
 */
export function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Displays a transient toast notification.
 * @param {string} message - Message text.
 * @param {'info'|'error'} level - Toast style level.
 */
export function showToast(message, level = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('is-error');
  if (level === 'error') {
    toast.classList.add('is-error');
  }

  toast.classList.add('is-visible');
  window.clearTimeout(showToast._timeoutId);
  showToast._timeoutId = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2800);
}

/**
 * Copies computed CSS declarations from source node to target node recursively.
 * @param {HTMLElement} sourceNode - Source element currently rendered in DOM.
 * @param {HTMLElement} targetNode - Detached clone that receives inline styles.
 */
export function copyComputedStylesRecursively(sourceNode, targetNode) {
  const computedStyle = window.getComputedStyle(sourceNode);
  const inlineDeclarations = [];

  for (const propertyName of computedStyle) {
    inlineDeclarations.push(`${propertyName}:${computedStyle.getPropertyValue(propertyName)};`);
  }

  targetNode.setAttribute('style', inlineDeclarations.join(''));

  const sourceChildren = Array.from(sourceNode.children);
  const targetChildren = Array.from(targetNode.children);

  sourceChildren.forEach((sourceChild, index) => {
    const targetChild = targetChildren[index];
    if (!(sourceChild instanceof HTMLElement) || !(targetChild instanceof HTMLElement)) {
      return;
    }

    copyComputedStylesRecursively(sourceChild, targetChild);
  });
}

/**
 * Creates a detached clone with fully inlined computed styles.
 * @param {HTMLElement} node - Source element from the live preview.
 * @returns {HTMLElement}
 */
export function createInlineStyledClone(node) {
  const clone = /** @type {HTMLElement} */ (node.cloneNode(true));
  copyComputedStylesRecursively(node, clone);
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
  return clone;
}
