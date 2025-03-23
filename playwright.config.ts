import dotenv from 'dotenv'
import { defineConfig } from '@playwright/test'

dotenv.config()

export default defineConfig({
    testDir: './src/__tests__/e2e',
    webServer: {
        command: 'bun run build && bun run start',
        port: 3000,
        reuseExistingServer: true,
    },
    use: {
        headless: true,
        baseURL: 'http://localhost:3000',
    },
})
