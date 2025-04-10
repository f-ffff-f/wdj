import { guestLogin, memberLogin } from '@/__tests__/e2e/util'
import { expect, test } from '@playwright/test'

test.describe('NextAuth Authentication Tests', () => {
    test('1. Guest user flow', async ({ page }) => {
        await guestLogin(page)
    })

    test('2. Member login flow', async ({ page }) => {
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
        await page.getByTestId('signout-button').click()

        // Wait for the session to be cleared
        await page.waitForURL('/signin')

        // Verify we're logged out (login form should be visible)
        await expect(page.getByTestId('email-input')).toBeVisible()
        await expect(page.getByTestId('password-input')).toBeVisible()
    })

    test('4. Protected routes', async ({ page }) => {
        // Scenario 1: 인증되지 않은 유저가 '/main'에 접근 시 '/'로 리다이렉트되어야 함
        await page.goto('/main')
        await page.waitForURL('/signin')
        // 로그인 폼이 보이는지 확인
        await expect(page.getByTestId('email-input')).toBeVisible()
        await expect(page.getByTestId('password-input')).toBeVisible()

        // Scenario 2: 인증된 유저가 '/'에 접근 시 '/main'으로 리다이렉트되어야 함
        await memberLogin(page)
        await page.goto('/')
        await page.waitForURL((url) => url.pathname.includes('/main'))
    })
})
