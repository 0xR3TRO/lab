/**
 * ButtonCraft UI Library — Main Entry Point
 *
 * Import this file when using ButtonCraft with a bundler (Vite, Webpack, etc.)
 * For standalone usage, include individual CSS/JS files directly.
 *
 * @author 0xR3TRO
 * @license MIT
 */

/* ── Theme & Utilities ──────────────────────────────────── */
import "./utils/variables.css";
import "./utils/mixins.css";
import "./utils/utilities.css";

/* ── Buttons ────────────────────────────────────────────── */
import "./components/buttons/btn-3d/btn-3d.css";
import "./components/buttons/btn-3d/btn-3d.js";

import "./components/buttons/btn-neon/btn-neon.css";
import "./components/buttons/btn-neon/btn-neon.js";

import "./components/buttons/btn-glass/btn-glass.css";
import "./components/buttons/btn-glass/btn-glass.js";

import "./components/buttons/btn-ripple/btn-ripple.css";
import "./components/buttons/btn-ripple/btn-ripple.js";

import "./components/buttons/btn-gradient/btn-gradient.css";
import "./components/buttons/btn-gradient/btn-gradient.js";

import "./components/buttons/btn-magnetic/btn-magnetic.css";
import "./components/buttons/btn-magnetic/btn-magnetic.js";

import "./components/buttons/btn-animated-border/btn-animated-border.css";
import "./components/buttons/btn-animated-border/btn-animated-border.js";

import "./components/buttons/btn-text-anim/btn-text-anim.css";
import "./components/buttons/btn-text-anim/btn-text-anim.js";

import "./components/buttons/btn-micro/btn-micro.css";
import "./components/buttons/btn-micro/btn-micro.js";

import "./components/buttons/btn-parallax/btn-parallax.css";
import "./components/buttons/btn-parallax/btn-parallax.js";

/* ── UI Components ──────────────────────────────────────── */
import "./components/cards/cards.css";

import "./components/forms/forms.css";
import "./components/forms/forms.js";

import "./components/toggles/toggles.css";

import "./components/tooltips/tooltips.css";

import "./components/modals/modals.css";
import "./components/modals/modals.js";

import "./components/loaders/loaders.css";

import "./components/navigation/navigation.css";
import "./components/navigation/navigation.js";

/* ── Animations ─────────────────────────────────────────── */
import "./modules/animations/entrance-animations.css";
import "./modules/animations/background-animations.css";
import "./modules/animations/svg-animations.css";
import "./modules/scroll-reveal/scroll-reveal.css";
import "./modules/scroll-reveal/scroll-reveal.js";

/* ── JS Helpers (named exports) ─────────────────────────── */
export {
    animateCSS,
    tweenProperty,
    chainAnimations,
    parallelAnimations,
    springY,
    typewriter,
    stagger,
} from "./utils/animation-helpers.js";

export {
    magneticEffect,
    rippleEffect,
    parallaxTilt,
    toggleTheme,
    applyStoredTheme,
    debounce,
    throttle,
} from "./utils/interaction-helpers.js";
