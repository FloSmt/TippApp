// libs/frontend/frontend/ui/shared-components/playwright.config.ts
import {defineConfig, devices} from '@playwright/test';
import {nxE2EPreset} from '@nx/playwright/preset';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

// Calculate the relative path to the workspace root from this config file's location.
// This config file is at: libs/frontend/frontend/ui/shared-components/playwright.config.ts
// The workspace root is at: <repo_root>/
// So, we need to go up 5 directories to reach the workspace root:
// 1. shared-components -> ui (../)
// 2. ui -> frontend (inner) (../)
// 3. frontend (inner) -> frontend (outer) (../)
// 4. frontend (outer) -> libs (../)
// 5. libs -> workspace root (../)
const relativeWorkspaceRoot = '../../../../../';


/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx nx run mobile-app:serve',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    // Using a relative path for cwd, as `workspaceRoot` might sometimes lead to issues
    // with how SWC or Playwright resolves paths in certain environments (e.g., CI).
    // This makes the path explicit relative to the playwright.config.ts file.
    cwd: relativeWorkspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Uncomment for mobile browsers support
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    /*{
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
