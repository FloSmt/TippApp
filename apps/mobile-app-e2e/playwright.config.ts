// libs/frontend/frontend/ui/shared-components/playwright.config.ts
import {defineConfig} from '@playwright/test';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();


/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({});
