import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: './src/__tests__',
    webServer: {
        command: 'npm run build && npm run start',
        port: 3000,
        reuseExistingServer: !process.env.CI,
    },
    use: {
        headless: true,
        baseURL: process.env.VERCEL_URL || 'http://localhost:3000',
    },
})
