/**
 * preview.js
 * Card preview renderer, layout styling, social icon rendering, and responsive preview scaling.
 */

/**
 * Available social networks used in editor controls and preview output.
 * @type {Array<{id: string, label: string, iconPath: string, color: string, placeholder: string}>}
 */
export const SOCIAL_NETWORKS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    iconPath: 'assets/icons/linkedin.svg',
    color: '#0A66C2',
    placeholder: 'https://linkedin.com/in/username'
  },
  {
    id: 'github',
    label: 'GitHub',
    iconPath: 'assets/icons/github.svg',
    color: '#181717',
    placeholder: 'https://github.com/username'
  },
  {
    id: 'instagram',
    label: 'Instagram',
    iconPath: 'assets/icons/instagram.svg',
    color: '#E1306C',
    placeholder: 'https://instagram.com/username'
  },
  {
    id: 'facebook',
    label: 'Facebook',
    iconPath: 'assets/icons/facebook.svg',
    color: '#1877F2',
    placeholder: 'https://facebook.com/username'
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    iconPath: 'assets/icons/twitter.svg',
    color: '#111111',
    placeholder: 'https://x.com/username'
  },
  {
    id: 'youtube',
    label: 'YouTube',
    iconPath: 'assets/icons/youtube.svg',
    color: '#FF0000',
    placeholder: 'https://youtube.com/@username'
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    iconPath: 'assets/icons/tiktok.svg',
    color: '#111111',
    placeholder: 'https://tiktok.com/@username'
  }
];

/**
 * Lookup table for social metadata by identifier.
 * @type {Map<string, {id: string, label: string, iconPath: string, color: string, placeholder: string}>}
 */
const SOCIAL_BY_ID = new Map(SOCIAL_NETWORKS.map((network) => [network.id, network]));

/**
 * Human labels for shadow range values.
 * @type {Array<string>}
 */
const SHADOW_TOKENS = [
  'none',
  '0 8px 20px rgba(15, 23, 42, 0.12)',
  '0 14px 36px rgba(15, 23, 42, 0.2)',
  '0 22px 56px rgba(15, 23, 42, 0.28)'
];

/**
 * Creates the preview controller used by the editor module.
 * @param {object} config - Controller configuration.
 * @param {HTMLElement} config.cardElement - Main card node in the preview.
 * @param {HTMLElement} config.stageElement - Preview viewport container.
 * @param {HTMLElement} config.frameElement - Scaled frame wrapper.
 * @param {HTMLElement} config.scaleLayerElement - Layer receiving transform scaling.
 * @param {() => any} config.getState - Accessor that returns current editor state.
 * @returns {{render: () => void, updateScale: () => void, getCardElement: () => HTMLElement}}
 */
export function createPreviewController(config) {
  const {
    cardElement,
    stageElement,
    frameElement,
    scaleLayerElement,
    getState
  } = config;

  const previewName = /** @type {HTMLElement} */ (cardElement.querySelector('#preview-name'));
  const previewProfession = /** @type {HTMLElement} */ (cardElement.querySelector('#preview-profession'));
  const previewBio = /** @type {HTMLElement} */ (cardElement.querySelector('#preview-bio'));
  const previewPhoto = /** @type {HTMLImageElement} */ (cardElement.querySelector('#preview-photo'));
  const previewAvatarFallback = /** @type {HTMLElement} */ (cardElement.querySelector('#preview-avatar-fallback'));
  const previewSocialLinks = /** @type {HTMLElement} */ (cardElement.querySelector('#preview-social-links'));

  const resizeObserver = new ResizeObserver(() => {
    updateScale();
  });

  resizeObserver.observe(stageElement);

  /**
   * Performs a full preview render from current state.
   */
  function render() {
    const state = getState();

    applyCardVariables(state);
    applyLayout(state.layout);
    renderText(state);
    renderPhoto(state);
    renderSocialLinks(state);
    updateScale();
  }

  /**
   * Applies CSS variables for colors, typography, spacing, and depth.
   * @param {any} state - Current editor state.
   */
  function applyCardVariables(state) {
    cardElement.style.setProperty('--card-bg', state.backgroundColor);
    cardElement.style.setProperty('--card-text', state.textColor);
    cardElement.style.setProperty('--card-accent', state.accentColor);
    cardElement.style.setProperty('--card-radius', `${state.borderRadius}px`);
    cardElement.style.setProperty('--card-gap', `${state.spacing}px`);
    cardElement.style.setProperty('--card-font', `'${state.fontFamily}', sans-serif`);
    cardElement.style.setProperty('--card-shadow', SHADOW_TOKENS[state.shadowLevel] || SHADOW_TOKENS[2]);
  }

  /**
   * Applies layout class to the card root.
   * @param {'vertical'|'horizontal'|'compact'} layout - Selected layout mode.
   */
  function applyLayout(layout) {
    cardElement.classList.remove('layout-vertical', 'layout-horizontal', 'layout-compact');
    cardElement.classList.add(`layout-${layout}`);
  }

  /**
   * Renders all card text fields.
   * @param {any} state - Current editor state.
   */
  function renderText(state) {
    const firstName = (state.firstName || '').trim();
    const lastName = (state.lastName || '').trim();
    const fullName = `${firstName} ${lastName}`.trim() || 'Your Name';

    previewName.textContent = fullName;
    previewProfession.textContent = (state.profession || '').trim() || 'Your Profession';
    previewBio.textContent = (state.bio || '').trim() || 'Add a short bio to introduce yourself.';

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim() || 'C';
    previewAvatarFallback.textContent = initials.toUpperCase();
  }

  /**
   * Renders profile image or fallback initials avatar.
   * @param {any} state - Current editor state.
   */
  function renderPhoto(state) {
    if (state.photoDataUrl) {
      previewPhoto.src = state.photoDataUrl;
      previewPhoto.style.display = 'block';
      previewAvatarFallback.style.display = 'none';
      return;
    }

    previewPhoto.removeAttribute('src');
    previewPhoto.style.display = 'none';
    previewAvatarFallback.style.display = 'grid';
  }

  /**
   * Renders social icon links according to platform and icon style.
   * @param {any} state - Current editor state.
   */
  function renderSocialLinks(state) {
    previewSocialLinks.innerHTML = '';

    const links = Array.isArray(state.socialLinks) ? state.socialLinks : [];
    links.forEach((link) => {
      const network = SOCIAL_BY_ID.get(link.platform) || SOCIAL_NETWORKS[0];
      const anchor = document.createElement('a');
      const icon = document.createElement('span');
      const sanitizedUrl = String(link.url || '').trim();

      anchor.className = `social-link icon-${state.iconStyle}`;
      anchor.style.setProperty('--social-color', network.color);
      anchor.style.setProperty('--icon-mask', `url("${network.iconPath}")`);
      anchor.title = network.label;
      anchor.setAttribute('aria-label', network.label);

      if (sanitizedUrl) {
        anchor.href = sanitizedUrl;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      } else {
        anchor.href = '#';
        anchor.classList.add('is-disabled');
      }

      icon.className = 'social-glyph';
      anchor.append(icon);
      previewSocialLinks.append(anchor);
    });
  }

  /**
   * Rescales the preview so the card fits its viewport without distortion.
   */
  function updateScale() {
    const stageWidth = stageElement.clientWidth - 8;
    const stageHeight = stageElement.clientHeight - 8;
    const cardWidth = cardElement.offsetWidth;
    const cardHeight = cardElement.offsetHeight;

    if (!stageWidth || !stageHeight || !cardWidth || !cardHeight) {
      return;
    }

    const scale = Math.min(stageWidth / cardWidth, stageHeight / cardHeight, 1);

    frameElement.style.width = `${Math.round(cardWidth * scale)}px`;
    frameElement.style.height = `${Math.round(cardHeight * scale)}px`;
    scaleLayerElement.style.width = `${cardWidth}px`;
    scaleLayerElement.style.height = `${cardHeight}px`;
    scaleLayerElement.style.transform = `scale(${scale})`;
  }

  return {
    render,
    updateScale,
    getCardElement: () => cardElement
  };
}
