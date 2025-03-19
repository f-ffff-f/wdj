import { test, expect, Page } from '@playwright/test'

async function memberLogin(page: Page) {
    const testEmail = process.env.PLAYWRIGHT_TEST_USER_EMAIL
    const testPassword = process.env.PLAYWRIGHT_TEST_USER_PASSWORD

    if (!testEmail || !testPassword) {
        throw new Error('Test credentials not provided')
    }

    await page.goto('/')
    await page.getByLabel('email').fill(testEmail)
    await page.getByLabel('password').fill(testPassword)
    await page.getByRole('button', { name: 'Login' }).click()
    await page.waitForURL('/main')
    await expect(page.getByText(testEmail)).toBeVisible()
}

test.describe('NextAuth Authentication Tests', () => {
    test('1. Guest user flow', async ({ page }) => {
        await page.goto('/')

        // Click the "Continue as Guest" button
        await page.getByRole('button', { name: 'Continue as Guest' }).click()

        // Wait for navigation to '/main'
        await page.waitForURL('/main')

        // Verify that 'Guest' is visible
        await expect(page.getByText('Guest')).toBeVisible()
    })

    test('2. Member login flow', async ({ page }) => {
        // Note: This test assumes you have set environment variables for test credentials
        await memberLogin(page)
    })

    test('3. Logout flow', async ({ page }) => {
        const testEmail = process.env.PLAYWRIGHT_TEST_USER_EMAIL
        const testPassword = process.env.PLAYWRIGHT_TEST_USER_PASSWORD

        if (!testEmail || !testPassword) {
            throw new Error('Test credentials not provided')
        }

        await memberLogin(page)

        // Click logout
        await page.getByRole('button', { name: 'Logout' }).click()

        // Wait for the session to be cleared
        await page.waitForURL('/')

        // Verify we're logged out (login form should be visible)
        await expect(page.getByLabel('email')).toBeVisible()
        await expect(page.getByLabel('password')).toBeVisible()
    })

    test('4. Protected routes', async ({ page }) => {
        // Scenario 1: 인증되지 않은 유저가 '/main'에 접근 시 '/'로 리다이렉트되어야 함
        await page.goto('/main')
        await page.waitForURL('/')
        // 로그인 폼이 보이는지 확인
        await expect(page.getByLabel('email')).toBeVisible()
        await expect(page.getByLabel('password')).toBeVisible()

        // Scenario 2: 인증된 유저가 '/'에 접근 시 '/main'으로 리다이렉트되어야 함
        await memberLogin(page)
        await page.goto('/')
        await page.waitForURL('/main')
        const testEmail = process.env.PLAYWRIGHT_TEST_USER_EMAIL
        if (!testEmail) {
            throw new Error('Test credentials not provided')
        }
        await expect(page.getByText(testEmail)).toBeVisible()
    })
})
