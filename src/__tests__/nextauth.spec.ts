import { test, expect, Page } from '@playwright/test'

test.describe('NextAuth Authentication Tests', () => {
    test('1. Guest user flow', async ({ page }) => {
        await page.goto('/')

        // Click the "Continue as Guest" button
        await page.getByRole('button', { name: 'Continue as Guest' }).click()

        // Wait for the session to be established
        await page.waitForTimeout(1000)

        // Verify that we're logged in as a guest (UI check)
        await expect(page.getByText('Member', { exact: false })).not.toBeVisible()
    })

    test('2. Member login flow', async ({ page }) => {
        // Note: This test assumes you have set environment variables for test credentials
        const testEmail = process.env.PLAYWRIGHT_TEST_USER_EMAIL
        const testPassword = process.env.PLAYWRIGHT_TEST_USER_PASSWORD

        if (!testEmail || !testPassword) {
            test.skip()
            return
        }

        await page.goto('/')

        // Fill in login form
        await page.getByLabel('email').fill(testEmail)
        await page.getByLabel('password').fill(testPassword)

        // Click login button
        await page.getByRole('button', { name: 'Login' }).click()

        // Wait for the session to be established
        await page.waitForTimeout(1000)

        // Verify we're logged in (should see email)
        await expect(page.getByText(testEmail)).toBeVisible()
    })

    test('3. Logout flow', async ({ page }) => {
        const testEmail = process.env.PLAYWRIGHT_TEST_USER_EMAIL
        const testPassword = process.env.PLAYWRIGHT_TEST_USER_PASSWORD

        if (!testEmail || !testPassword) {
            test.skip()
            return
        }

        await page.goto('/')

        // Login first
        await page.getByLabel('email').fill(testEmail)
        await page.getByLabel('password').fill(testPassword)
        await page.getByRole('button', { name: 'Login' }).click()

        // Wait for the session to be established
        await page.waitForTimeout(1000)

        // Click logout
        await page.getByRole('button', { name: 'Logout' }).click()

        // Wait for the session to be cleared
        await page.waitForTimeout(1000)

        // Verify we're logged out (login form should be visible)
        await expect(page.getByLabel('email')).toBeVisible()
        await expect(page.getByLabel('password')).toBeVisible()
    })

    test('4. Protected routes', async ({ page }) => {
        // Try to access a protected route without authentication
        await page.goto('/api/tracks')

        // Expect unauthorized response
        const responseText = await page.textContent('body')
        const response = JSON.parse(responseText || '{}')

        expect(response.success).toBe(false)
    })
})
