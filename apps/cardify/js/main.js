/**
 * main.js
 * Application bootstrap entry point.
 */

import { initCardifyCreator } from './editor.js';

/**
 * Starts the app after the initial document parse.
 */
function bootstrap() {
  initCardifyCreator();
}

document.addEventListener('DOMContentLoaded', bootstrap);
