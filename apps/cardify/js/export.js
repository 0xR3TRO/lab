/**
 * export.js
 * Multi-format export pipeline for PNG, SVG, PDF, JSON, and standalone HTML output.
 */

import {
  createInlineStyledClone,
  downloadBlob,
  downloadText,
  showToast,
  toSafeFilename
} from './utils.js';

/**
 * Shared font import used by SVG and HTML exports.
 * @type {string}
 */
const FONT_IMPORT_CSS = "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap');";

/**
 * Creates an off-screen mount with an inline-styled clone for accurate exports.
 * @param {HTMLElement} cardElement - Source preview card.
 * @returns {{mount: HTMLDivElement, clone: HTMLElement}}
 */
function createExportMount(cardElement) {
  const mount = document.createElement('div');
  const clone = createInlineStyledClone(cardElement);

  mount.style.position = 'fixed';
  mount.style.left = '-20000px';
  mount.style.top = '0';
  mount.style.pointerEvents = 'none';
  mount.style.opacity = '0';
  mount.style.zIndex = '-1';

  mount.append(clone);
  document.body.append(mount);

  return { mount, clone };
}

/**
 * Renders the card clone to canvas through html2canvas.
 * @param {HTMLElement} cardElement - Source card element.
 * @param {number} scale - Rendering scale multiplier.
 * @returns {Promise<HTMLCanvasElement>}
 */
async function renderCardToCanvas(cardElement, scale) {
  const { mount, clone } = createExportMount(cardElement);

  try {
    const canvas = await window.html2canvas(clone, {
      scale,
      useCORS: true,
      backgroundColor: null,
      logging: false
    });

    return canvas;
  } finally {
    mount.remove();
  }
}

/**
 * Builds a foreignObject SVG string from the preview card.
 * @param {HTMLElement} cardElement - Source card element.
 * @returns {string}
 */
function buildSvgDocument(cardElement) {
  const clone = createInlineStyledClone(cardElement);
  const width = cardElement.offsetWidth;
  const height = cardElement.offsetHeight;

  const xhtml = `<div xmlns="http://www.w3.org/1999/xhtml">${clone.outerHTML}</div>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style type="text/css"><![CDATA[${FONT_IMPORT_CSS}]]></style>
  </defs>
  <foreignObject width="100%" height="100%">${xhtml}</foreignObject>
</svg>`;
}

/**
 * Builds a standalone HTML document string with inline card styles.
 * @param {HTMLElement} cardElement - Source card element.
 * @returns {string}
 */
function buildStandaloneHtmlDocument(cardElement) {
  const clone = createInlineStyledClone(cardElement);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cardify Creator Export</title>
  <style>${FONT_IMPORT_CSS}</style>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #edf3f8;
      font-family: Manrope, sans-serif;
      padding: 24px;
    }
  </style>
</head>
<body>
${clone.outerHTML}
</body>
</html>`;
}

/**
 * Initializes all export button handlers.
 * @param {object} config - Export system configuration.
 * @param {() => any} config.getState - Getter for current editor state.
 * @param {() => HTMLElement} config.getCardElement - Getter for current preview card element.
 */
export function initExportSystem(config) {
  const { getState, getCardElement } = config;

  /**
   * Exports high-resolution PNG using html2canvas.
   */
  async function exportPng() {
    try {
      showToast('Rendering PNG...');
      const canvas = await renderCardToCanvas(getCardElement(), 3);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        throw new Error('PNG generation failed.');
      }

      const state = getState();
      const filename = `${toSafeFilename(`${state.firstName}-${state.lastName}`)}.png`;
      downloadBlob(blob, filename);
      showToast('PNG exported.');
    } catch (error) {
      console.error(error);
      showToast('PNG export failed.', 'error');
    }
  }

  /**
   * Exports vector SVG from the inline-styled card markup.
   */
  function exportSvg() {
    try {
      const svgDocument = buildSvgDocument(getCardElement());
      const state = getState();
      const filename = `${toSafeFilename(`${state.firstName}-${state.lastName}`)}.svg`;

      downloadText(svgDocument, filename, 'image/svg+xml;charset=utf-8');
      showToast('SVG exported.');
    } catch (error) {
      console.error(error);
      showToast('SVG export failed.', 'error');
    }
  }

  /**
   * Exports a PDF document with proportional card scaling.
   */
  async function exportPdf() {
    try {
      showToast('Rendering PDF...');

      const cardElement = getCardElement();
      const canvas = await renderCardToCanvas(cardElement, 3);
      const imageData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;

      const cardWidthPx = cardElement.offsetWidth;
      const cardHeightPx = cardElement.offsetHeight;
      const pxToMm = 25.4 / 96;
      const pdfWidth = Math.round(cardWidthPx * pxToMm + 16);
      const pdfHeight = Math.round(cardHeightPx * pxToMm + 16);

      const pdf = new jsPDF({
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait'
      });

      pdf.addImage(
        imageData,
        'PNG',
        8,
        8,
        pdfWidth - 16,
        pdfHeight - 16,
        undefined,
        'FAST'
      );

      const state = getState();
      const filename = `${toSafeFilename(`${state.firstName}-${state.lastName}`)}.pdf`;
      pdf.save(filename);
      showToast('PDF exported.');
    } catch (error) {
      console.error(error);
      showToast('PDF export failed.', 'error');
    }
  }

  /**
   * Exports full card state as JSON template data.
   */
  function exportJson() {
    try {
      const state = getState();
      const payload = JSON.stringify(state, null, 2);
      const filename = `${toSafeFilename(`${state.firstName}-${state.lastName}`)}.json`;
      downloadText(payload, filename, 'application/json;charset=utf-8');
      showToast('JSON exported.');
    } catch (error) {
      console.error(error);
      showToast('JSON export failed.', 'error');
    }
  }

  /**
   * Exports a standalone HTML file with inline card styling.
   */
  function exportHtml() {
    try {
      const htmlDocument = buildStandaloneHtmlDocument(getCardElement());
      const state = getState();
      const filename = `${toSafeFilename(`${state.firstName}-${state.lastName}`)}.html`;
      downloadText(htmlDocument, filename, 'text/html;charset=utf-8');
      showToast('HTML exported.');
    } catch (error) {
      console.error(error);
      showToast('HTML export failed.', 'error');
    }
  }

  document.getElementById('export-png')?.addEventListener('click', exportPng);
  document.getElementById('export-svg')?.addEventListener('click', exportSvg);
  document.getElementById('export-pdf')?.addEventListener('click', exportPdf);
  document.getElementById('export-json')?.addEventListener('click', exportJson);
  document.getElementById('export-html')?.addEventListener('click', exportHtml);
}
