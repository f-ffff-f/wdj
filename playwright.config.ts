import dotenv from 'dotenv'
import { defineConfig } from '@playwright/test'

dotenv.config()

export default defineConfig({
    reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
    testDir: './src/__tests__/e2e',
    webServer: {
        command: 'npm run build && npm run start',
        port: 3000,

        // 20250410 reuseExistingServer가 true로 돼있던것이 CI 환경 런타임에서 버그가 계속 발생했던 원인인것 같다
        reuseExistingServer: !process.env.CI,
        //
    },
    use: {
        headless: true,
        baseURL: 'http://localhost:3000',
        screenshot: 'only-on-failure',
        video: 'on',
        trace: 'on-first-retry',
    },
})
