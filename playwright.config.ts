import dotenv from 'dotenv'
import { defineConfig } from '@playwright/test'

dotenv.config()

export default defineConfig({
    reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
    testDir: './src/__tests__/e2e',
    webServer: {
        command: 'npm run build && npm run start',
        port: 3000,
        reuseExistingServer: true,
    },
    use: {
        headless: true,
        baseURL: 'http://localhost:3000',
        screenshot: 'only-on-failure',
        video: 'on',
        trace: 'on-first-retry',
    },
})
