import { expect, Page } from '@playwright/test'

export async function hydrateTurnstile(page: Page) {
    await page.waitForLoadState('networkidle')
    await page.reload()
}

export async function guestLogin(page: Page) {
    await page.goto('/')

    await hydrateTurnstile(page)

    await page.getByRole('button', { name: 'Continue as Guest' }).click()
    await page.waitForURL((url) => url.pathname.includes('/main'))
    await expect(page.getByText('Guest')).toBeVisible()
}

export async function memberLogin(page: Page) {
    const testEmail = process.env.PLAYWRIGHT_TEST_USER_EMAIL
    const testPassword = process.env.PLAYWRIGHT_TEST_USER_PASSWORD

    if (!testEmail || !testPassword) {
        console.error('Test credentials not provided')
        throw new Error('Test credentials not provided')
    }

    await page.goto('/')

    await hydrateTurnstile(page)

    await page.locator('input[name="email"]').fill(testEmail)

    await page.locator('input[name="email"]').fill(testEmail)
    await page.locator('input[name="password"]').fill(testPassword)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL((url) => url.pathname.includes('/main'))
    await expect(page.getByText(testEmail)).toBeVisible()
}
