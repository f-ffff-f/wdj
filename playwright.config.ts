import dotenv from 'dotenv'
import { defineConfig } from '@playwright/test'

dotenv.config()

export default defineConfig({
    testDir: './src/__tests__/e2e',
    webServer: {
        command: 'npm run build && npm run start',
        port: 3000,
        reuseExistingServer: true,
    },
    use: {
        headless: true,
        baseURL: process.env.VERCEL_URL || 'http://localhost:3000',
    },
})
