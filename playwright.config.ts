import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/e2e',
	webServer: {
		command: 'pnpm build && pnpm preview',
		port: 4173,
		reuseExistingServer: true
	},
	use: {
		baseURL: 'http://localhost:4173'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
